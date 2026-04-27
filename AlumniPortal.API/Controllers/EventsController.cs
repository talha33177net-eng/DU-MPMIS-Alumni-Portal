using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Events;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;
    private static readonly Dictionary<string, string> _otpStorage = new();

    public EventsController(ApplicationDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    // GET /api/events?page=1&type=upcoming&per_page=10
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] string? type = null,
        [FromQuery] int per_page = 10)
    {
        var query = _db.Events
            .Where(e => e.IsPublished)
            .OrderByDescending(e => e.EventDate)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (type.ToLower() == "upcoming")
                query = query.Where(e => e.EventDate >= DateTime.UtcNow);
            else if (type.ToLower() == "past")
                query = query.Where(e => e.EventDate < DateTime.UtcNow);
            else
                query = query.Where(e => e.Status.ToLower() == type.ToLower());
        }

        var result = await PaginationHelper.PaginateAsync(
            query.Select(e => new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                CoverImage = e.CoverImage,
                Venue = e.Venue,
                RegistrationFee = e.RegistrationFee,
                EventDate = e.EventDate,
                RegistrationDeadline = e.RegistrationDeadline,
                IsRegistrationOpen = e.IsRegistrationOpen,
                MaxAttendees = e.MaxAttendees,
                RegistrationCount = e.Registrations.Count,
                Status = e.Status,
                IsPublished = e.IsPublished,
                CreatedAt = e.CreatedAt
            }), page, per_page);

        return Ok(result);
    }

    // GET /api/events/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await _db.Events
            .Include(ev => ev.Registrations)
            .FirstOrDefaultAsync(ev => ev.Id == id && ev.IsPublished);

        if (e == null) return NotFound(ApiResponse.Fail("Event not found."));

        return Ok(ApiResponse<EventDto>.Ok(new EventDto
        {
            Id = e.Id, Title = e.Title, Description = e.Description,
            CoverImage = e.CoverImage, Venue = e.Venue, RegistrationFee = e.RegistrationFee, EventDate = e.EventDate,
            RegistrationDeadline = e.RegistrationDeadline, IsRegistrationOpen = e.IsRegistrationOpen,
            MaxAttendees = e.MaxAttendees, RegistrationCount = e.Registrations.Count,
            Status = e.Status, IsPublished = e.IsPublished, CreatedAt = e.CreatedAt
        }));
    }

    [HttpPost("{id:int}/send-otp")]
    public async Task<IActionResult> SendOtp(int id, [FromBody] SendOtpRequest req)
    {
        var ev = await _db.Events.FindAsync(id);
        if (ev == null) return NotFound(ApiResponse.Fail("Event not found."));
        if (!ev.IsRegistrationOpen) return BadRequest(ApiResponse.Fail("Registration is closed."));

        var otp = new Random().Next(100000, 999999).ToString();
        _otpStorage[req.Email] = otp;

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
                        <div style='background-color: #f59e0b; color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>Your Security Code 🔒</h2>
                        </div>
                        <div style='padding: 20px; color: #333; text-align: center;'>
                            <p style='font-size: 16px;'>You requested an RSVP ticket for <strong>{ev.Title}</strong>.</p>
                            <p style='margin-top: 20px;'>Your 6-digit confirmation code is:</p>
                            <div style='background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111; margin: 20px 0;'>
                                {otp}
                            </div>
                            <p style='font-size: 14px; color: #555;'>Please enter this code back in the Alumni portal to finalize your ticket.</p>
                            <hr style='border: none; border-top: 1px solid #eaeaea; margin: 20px 0;' />
                            <p style='font-size: 12px; color: #777;'>MIST Alumni Association &bull; Secured System Message</p>
                        </div>
                    </div>";

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(webContent.SmtpSenderEmail, "Alumni Events"),
                    Subject = $"Your RSVP Access Code: {otp}",
                    Body = htmlBody,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(req.Email);
                await smtpClient.SendMailAsync(mailMessage);
                return Ok(ApiResponse.Ok("OTP sent to your email successfully."));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMTP Error: {ex.Message}");
                return Ok(ApiResponse.Ok($"SMTP Delivery Failed (Check App Password). Demo Mode Active: Your OTP is {otp}"));
            }
        }

        return Ok(ApiResponse.Ok($"SMTP Not Configured. Demo Mode: Your OTP is {otp}"));
    }

    [HttpPost("{id:int}/verify-otp")]
    public IActionResult VerifyOtp(int id, [FromBody] VerifyRegistrationRequest req)
    {
        if (!_otpStorage.TryGetValue(req.Email, out var storedOtp) || storedOtp != req.Otp)
            return BadRequest(ApiResponse.Fail("Invalid or expired OTP. Please try again."));

        return Ok(ApiResponse.Ok("OTP verified successfully."));
    }

    [HttpPost("{id:int}/register")]
    public async Task<IActionResult> Register(int id, [FromBody] VerifyRegistrationRequest req)
    {
        if (!_otpStorage.TryGetValue(req.Email, out var storedOtp) || storedOtp != req.Otp)
            return BadRequest(ApiResponse.Fail("Invalid or expired OTP. Please request a new one."));

        _otpStorage.Remove(req.Email);

        var ev = await _db.Events.Include(e => e.Registrations).FirstOrDefaultAsync(e => e.Id == id);
        if (ev == null) return NotFound(ApiResponse.Fail("Event not found."));
        if (!ev.IsRegistrationOpen) return BadRequest(ApiResponse.Fail("Registration is closed."));
        if (ev.MaxAttendees.HasValue && ev.Registrations.Count >= ev.MaxAttendees)
            return BadRequest(ApiResponse.Fail("Event is fully booked."));

        var userId = _jwt.GetUserId(User);

        // Prevent duplicate registration for logged-in users
        if (userId.HasValue)
        {
            var alreadyRegistered = await _db.EventRegistrations
                .AnyAsync(r => r.EventId == id && r.UserId == userId.Value);
            if (alreadyRegistered)
                return BadRequest(ApiResponse.Fail("You are already registered for this event."));
        }
        else
        {
            var alreadyRegisteredEmail = await _db.EventRegistrations
                .AnyAsync(r => r.EventId == id && r.GuestEmail == req.Email);
            if (alreadyRegisteredEmail)
                return BadRequest(ApiResponse.Fail("You are already registered for this event with this email."));
        }

        var registration = new EventRegistration
        {
            EventId = id,
            UserId = userId,
            GuestName = req.GuestName,
            GuestEmail = req.Email,
            GuestPhone = req.GuestPhone,
            Status = "Confirmed"
        };
        _db.EventRegistrations.Add(registration);
        await _db.SaveChangesAsync();

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
                        <div style='background-color: #10b981; color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>RSVP Confirmed! 🎉</h2>
                        </div>
                        <div style='padding: 20px; color: #333;'>
                            <p>Hi <strong>{(string.IsNullOrWhiteSpace(req.GuestName) ? "Alumni" : req.GuestName)}</strong>,</p>
                            <p>Your registration for the event <strong>{ev.Title}</strong> has been successfully confirmed in our system.</p>
                            <p><strong>📍 Venue:</strong> {ev.Venue}</p>
                            <p><strong>🕒 Date & Time:</strong> {ev.EventDate.ToString("f")}</p>
                            <p style='margin-top: 20px;'>We look forward to seeing you! Keep this email as your digital pass.</p>
                            <hr style='border: none; border-top: 1px solid #eaeaea; margin: 20px 0;' />
                            <p style='font-size: 12px; color: #777; text-align: center;'>MIST Alumni Association &bull; Secured System Message</p>
                        </div>
                    </div>";

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(webContent.SmtpSenderEmail, "Alumni Events"),
                    Subject = $"Confirmation: {ev.Title}",
                    Body = htmlBody,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(req.Email);
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMTP Success Email Error: {ex.Message}");
            }
        }

        return Ok(ApiResponse<int>.Ok(registration.Id, "Registration successful. You are marked as Joined."));
    }

    // Admin CRUD
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventRequest req)
    {
        var ev = new Event
        {
            Title = req.Title, Description = req.Description, CoverImage = req.CoverImage, Venue = req.Venue, RegistrationFee = req.RegistrationFee,
            EventDate = req.EventDate, RegistrationDeadline = req.RegistrationDeadline,
            IsRegistrationOpen = req.IsRegistrationOpen, MaxAttendees = req.MaxAttendees,
            Status = req.Status, IsPublished = req.IsPublished
        };
        _db.Events.Add(ev);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(ev.Id, "Event created."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateEventRequest req)
    {
        var ev = await _db.Events.FindAsync(id);
        if (ev == null) return NotFound(ApiResponse.Fail("Event not found."));
        ev.Title = req.Title; ev.Description = req.Description; ev.CoverImage = req.CoverImage; ev.Venue = req.Venue; ev.RegistrationFee = req.RegistrationFee;
        ev.EventDate = req.EventDate; ev.RegistrationDeadline = req.RegistrationDeadline;
        ev.IsRegistrationOpen = req.IsRegistrationOpen; ev.MaxAttendees = req.MaxAttendees;
        ev.Status = req.Status; ev.IsPublished = req.IsPublished; ev.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Event updated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ev = await _db.Events.FindAsync(id);
        if (ev == null) return NotFound(ApiResponse.Fail("Event not found."));
        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Event deleted."));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}/registrations")]
    public async Task<IActionResult> GetRegistrations(int id, [FromQuery] int page = 1, [FromQuery] int per_page = 20)
    {
        // Verify event exists
        if (!await _db.Events.AnyAsync(e => e.Id == id))
            return NotFound(ApiResponse.Fail("Event not found."));

        var result = await PaginationHelper.PaginateAsync(
            _db.EventRegistrations
                .Where(r => r.EventId == id)
                .Include(r => r.User)
                .Include(r => r.Event)  // Required: fixes r.Event.Title null crash
                .OrderByDescending(r => r.RegisteredAt)
                .Select(r => new EventRegistrationDto
                {
                    Id = r.Id, EventId = r.EventId,
                    EventTitle = r.Event.Title,
                    UserId = r.UserId,
                    UserName = r.User != null ? r.User.FullName : null,
                    GuestName = r.GuestName, GuestEmail = r.GuestEmail,
                    Status = r.Status, RegisteredAt = r.RegisteredAt
                }), page, per_page);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(ApiResponse.Fail("No file provided."));
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "events");
        var resultUrl = await AlumniPortal.API.Helpers.ImageOptimizationHelper.ProcessAndSaveFileAsync(file, uploadPath, "/uploads/events");
        return Ok(ApiResponse<string>.Ok(resultUrl, "Image uploaded."));
    }
}
