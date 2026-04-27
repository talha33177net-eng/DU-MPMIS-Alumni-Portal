using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Misc;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/alumni-needs")]
public class AlumniNeedsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;
    public AlumniNeedsController(ApplicationDbContext db, JwtHelper jwt) { _db = db; _jwt = jwt; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] string? category = null, [FromQuery] int per_page = 10)
    {
        var now = DateTime.UtcNow;
        var query = _db.AlumniNeeds
            .Where(a => a.IsActive && a.IsApproved && (a.ExpiresAt == null || a.ExpiresAt > now))
            .OrderByDescending(a => a.CreatedAt).AsQueryable();
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);
        var result = await PaginationHelper.PaginateAsync(
            query.Select(a => new AlumniNeedDto
            {
                Id = a.Id, Title = a.Title, Description = a.Description,
                Category = a.Category, ContactInfo = a.ContactInfo, IsAnonymous = a.IsAnonymous,
                PostedBy = a.IsAnonymous ? null : (a.User != null ? a.User.FullName : null),
                CreatedAt = a.CreatedAt, ExpiresAt = a.ExpiresAt
            }), page, per_page);
        return Ok(result);
    }

    [Authorize] [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAlumniNeedRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);
        var need = new AlumniNeed
        {
            UserId = userId, Title = req.Title, Description = req.Description,
            Category = req.Category, ContactInfo = req.ContactInfo,
            IsAnonymous = req.IsAnonymous, ExpiresAt = req.ExpiresAt,
            IsApproved = false
        };
        _db.AlumniNeeds.Add(need); await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(need.Id, "Post submitted. Awaiting approval."));
    }

    [Authorize(Roles = "Admin")] [HttpPut("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var need = await _db.AlumniNeeds.FindAsync(id);
        if (need == null) return NotFound(ApiResponse.Fail("Not found."));
        need.IsApproved = true; need.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(); return Ok(ApiResponse.Ok("Approved."));
    }

    [Authorize(Roles = "Admin")] [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var need = await _db.AlumniNeeds.FindAsync(id);
        if (need == null) return NotFound(ApiResponse.Fail("Not found."));
        _db.AlumniNeeds.Remove(need); await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Deleted."));
    }
}
