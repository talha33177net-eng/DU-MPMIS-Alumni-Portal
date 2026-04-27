using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Notices;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/committee")]
public class CommitteeController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CommitteeController(ApplicationDbContext db) => _db = db;

    // GET /api/committee?year=2024-25
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? year = null)
    {
        var query = _db.CommitteeMembers
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.FullName)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(year))
            query = query.Where(c => c.CommitteeYear == year);

        var members = await query.Select(c => new CommitteeMemberDto
        {
            Id = c.Id, FullName = c.FullName, Position = c.Position,
            Photo = c.Photo, Phone = c.Phone, Email = c.Email,
            Batch = c.Batch, CurrentDesignation = c.CurrentDesignation,
            CurrentOrganization = c.CurrentOrganization,
            FacebookUrl = c.FacebookUrl, LinkedInUrl = c.LinkedInUrl,
            CommitteeYear = c.CommitteeYear, SortOrder = c.SortOrder
        }).ToListAsync();   // was .ToList() — sync DB call, now fixed

        return Ok(ApiResponse<List<CommitteeMemberDto>>.Ok(members));
    }

    // GET /api/committee/years — distinct available committee years
    [HttpGet("years")]
    public async Task<IActionResult> GetYears()
    {
        var years = await _db.CommitteeMembers
            .Where(c => c.CommitteeYear != null)
            .Select(c => c.CommitteeYear!)
            .Distinct()
            .OrderByDescending(y => y)
            .ToListAsync();

        return Ok(ApiResponse<List<string>>.Ok(years));
    }

    // Admin: POST /api/committee
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCommitteeMemberRequest req)
    {
        var member = new CommitteeMember
        {
            FullName = req.FullName, Position = req.Position,
            Phone = req.Phone, Email = req.Email, Batch = req.Batch,
            CurrentDesignation = req.CurrentDesignation,
            CurrentOrganization = req.CurrentOrganization,
            FacebookUrl = req.FacebookUrl, LinkedInUrl = req.LinkedInUrl,
            CommitteeYear = req.CommitteeYear, SortOrder = req.SortOrder
        };
        _db.CommitteeMembers.Add(member);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(member.Id, "Committee member created."));
    }

    // Admin: PUT /api/committee/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCommitteeMemberRequest req)
    {
        var m = await _db.CommitteeMembers.FindAsync(id);
        if (m == null) return NotFound(ApiResponse.Fail("Member not found."));
        m.FullName = req.FullName; m.Position = req.Position;
        m.Phone = req.Phone; m.Email = req.Email; m.Batch = req.Batch;
        m.CurrentDesignation = req.CurrentDesignation;
        m.CurrentOrganization = req.CurrentOrganization;
        m.FacebookUrl = req.FacebookUrl; m.LinkedInUrl = req.LinkedInUrl;
        m.CommitteeYear = req.CommitteeYear; m.SortOrder = req.SortOrder;
        m.IsActive = req.IsActive;
        m.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Member updated."));
    }

    // Admin: DELETE /api/committee/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var m = await _db.CommitteeMembers.FindAsync(id);
        if (m == null) return NotFound(ApiResponse.Fail("Member not found."));
        _db.CommitteeMembers.Remove(m);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Member deleted."));
    }

    // Admin: POST /api/committee/{id}/photo
    [Authorize(Roles = "Admin")]
    [HttpPost("{id:int}/photo")]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.Fail("No file provided."));

        var member = await _db.CommitteeMembers.FindAsync(id);
        if (member == null) return NotFound(ApiResponse.Fail("Member not found."));

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "committee");
        var resultUrl = await AlumniPortal.API.Helpers.ImageOptimizationHelper.ProcessAndSaveFileAsync(file, uploadPath, "/uploads/committee");

        member.Photo = resultUrl;
        member.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok(member.Photo, "Photo uploaded."));
    }
}
