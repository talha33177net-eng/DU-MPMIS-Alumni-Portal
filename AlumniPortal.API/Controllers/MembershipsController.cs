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
[Route("api/memberships")]
public class MembershipsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;

    public MembershipsController(ApplicationDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    // GET /api/memberships — public list of active plans
    [HttpGet]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _db.MembershipPlans
            .Where(p => p.IsActive)
            .OrderBy(p => p.FeeAmount)
            .Select(p => new MembershipPlanDto
            {
                Id = p.Id,
                Title = p.Title,
                FeeAmount = p.FeeAmount,
                Description = p.Description,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return Ok(ApiResponse<List<MembershipPlanDto>>.Ok(plans));
    }

    // POST /api/memberships/apply — authenticated user applies for a membership plan
    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromBody] ApplyMembershipRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);

        var plan = await _db.MembershipPlans.FindAsync(req.MembershipPlanId);
        if (plan == null || !plan.IsActive)
            return BadRequest(ApiResponse.Fail("Invalid or inactive membership plan."));

        // Block if already has an active (Pending or Approved) application for this plan
        var existing = await _db.MembershipApplications
            .FirstOrDefaultAsync(m => m.UserId == userId
                && m.MembershipPlanId == req.MembershipPlanId
                && (m.Status == "Pending" || m.Status == "Approved"));

        if (existing != null)
            return BadRequest(ApiResponse.Fail(
                existing.Status == "Approved"
                    ? "You are already an active member under this plan."
                    : "You already have a pending application for this plan."));

        var application = new MembershipApplication
        {
            UserId = userId,
            MembershipPlanId = req.MembershipPlanId,
            Status = "Pending"
        };

        _db.MembershipApplications.Add(application);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<int>.Ok(application.Id, "Application submitted successfully."));
    }

    // GET /api/memberships/my-applications — logged-in user's own applications
    [Authorize]
    [HttpGet("my-applications")]
    public async Task<IActionResult> MyApplications()
    {
        var userId = _jwt.GetRequiredUserId(User);

        var apps = await _db.MembershipApplications
            .Where(m => m.UserId == userId)
            .Include(m => m.MembershipPlan)
            .OrderByDescending(m => m.AppliedAt)
            .Select(m => new MembershipApplicationDto
            {
                Id = m.Id,
                UserId = m.UserId,
                MembershipPlanId = m.MembershipPlanId,
                PlanTitle = m.MembershipPlan.Title,
                FeeAmount = m.MembershipPlan.FeeAmount,
                Status = m.Status,
                TransactionId = m.TransactionId,
                AppliedAt = m.AppliedAt,
                ReviewedAt = m.ReviewedAt,
                AdminNote = m.AdminNote
            })
            .ToListAsync();

        return Ok(ApiResponse<List<MembershipApplicationDto>>.Ok(apps));
    }

    // GET /api/memberships/applications — admin: all applications with user & plan info
    [Authorize(Roles = "Admin")]
    [HttpGet("applications")]
    public async Task<IActionResult> GetAllApplications(
        [FromQuery] int page = 1,
        [FromQuery] string? status = null,
        [FromQuery] int per_page = 20)
    {
        var query = _db.MembershipApplications
            .Include(m => m.User)
            .Include(m => m.MembershipPlan)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(m => m.Status == status);

        query = query.OrderByDescending(m => m.AppliedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(m => new MembershipApplicationDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserName = m.User.FullName,
                UserEmail = m.User.Email,
                MembershipPlanId = m.MembershipPlanId,
                PlanTitle = m.MembershipPlan.Title,
                FeeAmount = m.MembershipPlan.FeeAmount,
                Status = m.Status,
                TransactionId = m.TransactionId,
                AppliedAt = m.AppliedAt,
                ReviewedAt = m.ReviewedAt,
                AdminNote = m.AdminNote
            }), page, per_page);

        return Ok(result);
    }

    // PUT /api/memberships/applications/{id}/status — admin: approve or reject
    [Authorize(Roles = "Admin")]
    [HttpPut("applications/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateMembershipStatusRequest req)
    {
        var allowed = new[] { "Pending", "Approved", "Rejected" };
        if (!allowed.Contains(req.Status))
            return BadRequest(ApiResponse.Fail("Invalid status. Allowed: Pending, Approved, Rejected."));

        var app = await _db.MembershipApplications
            .Include(m => m.User)
            .Include(m => m.MembershipPlan)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (app == null) return NotFound(ApiResponse.Fail("Application not found."));

        app.Status = req.Status;
        app.AdminNote = req.Note;
        app.ReviewedAt = DateTime.UtcNow;

        // If approved → create or upgrade the Member record
        if (req.Status == "Approved" && app.User != null && app.MembershipPlan != null)
        {
            var existingMember = await _db.Members
                .FirstOrDefaultAsync(m => m.Email == app.User.Email);

            if (existingMember == null)
            {
                _db.Members.Add(new Member
                {
                    FullName = app.User.FullName,
                    Email = app.User.Email,
                    Phone = app.User.Phone,
                    Batch = app.User.Batch,
                    PassingYear = app.User.PassingYear,
                    CurrentDesignation = app.User.CurrentDesignation,
                    CurrentOrganization = app.User.CurrentOrganization,
                    MemberType = app.MembershipPlan.Title // "LifeTime" or "General"
                });
            }
            else
            {
                existingMember.MemberType = app.MembershipPlan.Title; // Upgrade
                existingMember.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Application {req.Status.ToLower()} successfully."));
    }
}
