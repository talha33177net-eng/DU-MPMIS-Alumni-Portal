using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Auth;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;
    private static readonly Dictionary<string, string> _registrationOtpStorage = new();

    public AuthController(ApplicationDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendRegistrationOtp([FromBody] SendRegistrationOtpRequest req)
    {
        var normalizedEmail = req.Email.ToLower().Trim();
        if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail))
            return BadRequest(ApiResponse.Fail("Email is already registered."));

        var otp = new Random().Next(100000, 999999).ToString();
        _registrationOtpStorage[normalizedEmail] = otp;

        var webContent = await _db.WebsiteContents.FirstOrDefaultAsync();
        if (webContent != null && !string.IsNullOrWhiteSpace(webContent.SmtpSenderEmail) && !string.IsNullOrWhiteSpace(webContent.SmtpSenderAppPassword))
        {
            try
            {
                using var smtpClient = new System.Net.Mail.SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new System.Net.NetworkCredential(webContent.SmtpSenderEmail, webContent.SmtpSenderAppPassword),
                    EnableSsl = true,
                };
                var htmlBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;'>
                        <div style='background-color: #3b82f6; color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>Verify Your Email ✉️</h2>
                        </div>
                        <div style='padding: 20px; color: #333; text-align: center;'>
                            <p style='font-size: 16px;'>You are creating an account on the Alumni Portal.</p>
                            <p style='margin-top: 20px;'>Your 6-digit confirmation code is:</p>
                            <div style='background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111; margin: 20px 0;'>
                                {otp}
                            </div>
                            <p style='font-size: 14px; color: #555;'>Please enter this code on the registration page to finalize your account creation.</p>
                            <hr style='border: none; border-top: 1px solid #eaeaea; margin: 20px 0;' />
                            <p style='font-size: 12px; color: #777;'>MIST Alumni Association &bull; Secured System Message</p>
                        </div>
                    </div>";

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(webContent.SmtpSenderEmail, "Alumni Portal"),
                    Subject = $"Your Verification Code: {otp}",
                    Body = htmlBody,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(req.Email);
                await smtpClient.SendMailAsync(mailMessage);
                return Ok(ApiResponse.Ok("Security code sent successfully."));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMTP Error: {ex.Message}");
                return Ok(ApiResponse.Ok($"SMTP Delivery Failed. Demo Mode Active: Your OTP is {otp}"));
            }
        }
        return Ok(ApiResponse.Ok($"SMTP Not Configured. Demo Mode: Your OTP is {otp}"));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var normalizedEmail = req.Email.ToLower().Trim();

        if (!_registrationOtpStorage.TryGetValue(normalizedEmail, out var storedOtp) || storedOtp != req.Otp)
            return BadRequest(ApiResponse.Fail("Invalid or expired Security Code. Please try again."));

        _registrationOtpStorage.Remove(normalizedEmail);

        if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail))
            return BadRequest(ApiResponse.Fail("Email already registered."));

        var user = new User
        {
            FullName = req.FullName,
            Email = normalizedEmail,
            Phone = req.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            StudentId = req.StudentId,
            Batch = req.Batch,
            PassingYear = req.PassingYear,
            Role = "Member"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var member = await _db.Members.FirstOrDefaultAsync(m => m.Email == normalizedEmail);
        
        if (member == null)
        {
            member = new Member
            {
                FullName = req.FullName,
                Email = normalizedEmail,
                Phone = req.Phone,
                StudentId = req.StudentId,
                Batch = req.Batch,
                PassingYear = req.PassingYear,
                MemberType = "General",
                Status = "Pending",
                IsActive = true
            };
            _db.Members.Add(member);
            await _db.SaveChangesAsync();
        }
        else if (string.IsNullOrEmpty(member.StudentId) && !string.IsNullOrEmpty(req.StudentId))
        {
            member.StudentId = req.StudentId;
            await _db.SaveChangesAsync();
        }

        var token = _jwt.GenerateToken(user);
        return Ok(ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            Token = token,
            User = MapToDto(user, member)
        }, "Registration successful."));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower().Trim());
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(ApiResponse.Fail("Invalid email or password."));

        if (!user.IsActive)
            return Unauthorized(ApiResponse.Fail("Account is deactivated. Contact admin."));

        var member = await _db.Members.FirstOrDefaultAsync(m => m.Email == user.Email);

        var token = _jwt.GenerateToken(user);
        return Ok(ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            Token = token,
            User = MapToDto(user, member)
        }, "Login successful."));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = _jwt.GetRequiredUserId(User);

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var member = await _db.Members.FirstOrDefaultAsync(m => m.Email == user.Email);

        return Ok(ApiResponse<UserProfileDto>.Ok(MapToDto(user, member)));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.FullName = req.FullName ?? user.FullName;
        user.Phone = req.Phone ?? user.Phone;
        user.StudentId = req.StudentId ?? user.StudentId;
        user.Batch = req.Batch ?? user.Batch;
        user.PassingYear = req.PassingYear ?? user.PassingYear;
        user.CurrentDesignation = req.CurrentDesignation ?? user.CurrentDesignation;
        user.CurrentOrganization = req.CurrentOrganization ?? user.CurrentOrganization;
        user.Bio = req.Bio ?? user.Bio;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        
        var member = await _db.Members.FirstOrDefaultAsync(m => m.Email == user.Email);
        return Ok(ApiResponse<UserProfileDto>.Ok(MapToDto(user, member), "Profile updated."));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(ApiResponse.Fail("Current password is incorrect."));

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse.Ok("Password changed successfully."));
    }

    [Authorize]
    [HttpPost("me/photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.Fail("No file provided."));

        var userId = _jwt.GetRequiredUserId(User);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
        var resultUrl = await AlumniPortal.API.Helpers.ImageOptimizationHelper.ProcessAndSaveFileAsync(file, uploadPath, "/uploads/profiles");

        user.ProfilePhoto = resultUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok(user.ProfilePhoto, "Photo uploaded."));
    }

    private static UserProfileDto MapToDto(User u, Member? m = null) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Phone = u.Phone,
        Role = u.Role,
        ProfilePhoto = u.ProfilePhoto,
        StudentId = u.StudentId,
        Batch = u.Batch,
        PassingYear = u.PassingYear,
        CurrentDesignation = u.CurrentDesignation,
        CurrentOrganization = u.CurrentOrganization,
        Bio = u.Bio,
        IsVerified = u.IsVerified,
        IsActive = u.IsActive,
        CreatedAt = u.CreatedAt,
        MemberType = m?.MemberType,
        MemberStatus = m?.Status
    };
}
