using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Extended;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/career-applications")]
public class CareerApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;

    public CareerApplicationsController(ApplicationDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromBody] CreateCareerApplicationRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);

        var career = await _db.Careers.FindAsync(req.CareerId);
        if (career == null || !career.IsActive || career.Deadline < DateTime.UtcNow)
            return BadRequest(ApiResponse.Fail("Job posting is not active or deadline has passed."));

        // Check if already applied
        if (await _db.CareerApplications.AnyAsync(c => c.CareerId == req.CareerId && c.UserId == userId))
            return BadRequest(ApiResponse.Fail("You have already applied for this position."));

        var application = new CareerApplication
        {
            CareerId = req.CareerId,
            UserId = userId,
            CoverLetter = req.CoverLetter,
            ResumeUrl = req.ResumeUrl,
            Status = "Pending"
        };

        _db.CareerApplications.Add(application);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<int>.Ok(application.Id, "Application submitted successfully."));
    }

    [Authorize]
    [HttpGet("my-applications")]
    public async Task<IActionResult> MyApplications([FromQuery] int page = 1, [FromQuery] int per_page = 20)
    {
        var userId = _jwt.GetRequiredUserId(User);

        var query = _db.CareerApplications
            .Include(c => c.Career)
            .Include(c => c.User)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.AppliedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(c => new CareerApplicationDto
            {
                Id = c.Id,
                CareerId = c.CareerId,
                CareerTitle = c.Career.Title,
                UserId = c.UserId,
                ApplicantName = c.User.FullName,
                CoverLetter = c.CoverLetter,
                ResumeUrl = c.ResumeUrl,
                Status = c.Status,
                AppliedAt = c.AppliedAt
            }), page, per_page);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("career/{careerId:int}")]
    public async Task<IActionResult> GetByCareer(int careerId, [FromQuery] int page = 1, [FromQuery] string? status = null, [FromQuery] int per_page = 20)
    {
        var query = _db.CareerApplications
            .Include(c => c.User)
            .Include(c => c.Career)
            .Where(c => c.CareerId == careerId);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status == status);

        query = query.OrderByDescending(c => c.AppliedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(c => new CareerApplicationDto
            {
                Id = c.Id,
                CareerId = c.CareerId,
                CareerTitle = c.Career.Title,
                UserId = c.UserId,
                ApplicantName = c.User.FullName,
                CoverLetter = c.CoverLetter,
                ResumeUrl = c.ResumeUrl,
                Status = c.Status,
                AppliedAt = c.AppliedAt
            }), page, per_page);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var allowed = new[] { "Pending", "Reviewed", "Accepted", "Rejected" };
        if (!allowed.Contains(status))
            return BadRequest(ApiResponse.Fail("Invalid status. Allowed: Pending, Reviewed, Accepted, Rejected."));

        var app = await _db.CareerApplications.FindAsync(id);
        if (app == null) return NotFound(ApiResponse.Fail("Application not found."));

        app.Status = status;
        app.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Application status updated to {status}."));
    }
}
