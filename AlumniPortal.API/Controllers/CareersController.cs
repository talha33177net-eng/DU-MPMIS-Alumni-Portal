using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Misc;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/careers")]
public class CareersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CareersController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] string? jobType = null, [FromQuery] int per_page = 10)
    {
        var now = DateTime.UtcNow;
        var query = _db.Careers
            .Where(c => c.IsPublished && (c.Deadline == null || c.Deadline.Value.Date >= now.Date))
            .OrderByDescending(c => c.CreatedAt).AsQueryable();
        if (!string.IsNullOrWhiteSpace(jobType))
            query = query.Where(c => c.JobType == jobType);
        var result = await PaginationHelper.PaginateAsync(query.Select(c => new CareerDto
        {
            Id = c.Id, Title = c.Title, Organization = c.Organization, Location = c.Location,
            JobType = c.JobType, Description = c.Description, Requirements = c.Requirements,
            Salary = c.Salary, ApplyEmail = c.ApplyEmail, ApplyUrl = c.ApplyUrl,
            Deadline = c.Deadline, CreatedAt = c.CreatedAt
        }), page, per_page);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await _db.Careers.FindAsync(id);
        if (c == null || !c.IsPublished) return NotFound(ApiResponse.Fail("Not found."));
        return Ok(ApiResponse<CareerDto>.Ok(new CareerDto
        {
            Id = c.Id, Title = c.Title, Organization = c.Organization, Location = c.Location,
            JobType = c.JobType, Description = c.Description, Requirements = c.Requirements,
            Salary = c.Salary, ApplyEmail = c.ApplyEmail, ApplyUrl = c.ApplyUrl,
            Deadline = c.Deadline, CreatedAt = c.CreatedAt
        }));
    }

    [Authorize(Roles = "Admin")] [HttpGet("admin-all")]
    public async Task<IActionResult> GetAdminAll([FromQuery] int page = 1, [FromQuery] int per_page = 100)
    {
        var result = await PaginationHelper.PaginateAsync(_db.Careers.OrderByDescending(c => c.CreatedAt).Select(c => new 
        {
            c.Id, c.Title, c.Organization, c.Location,
            c.JobType, c.Description, c.Requirements,
            c.Salary, c.ApplyEmail, c.ApplyUrl,
            c.Deadline, c.CreatedAt, c.IsPublished, c.IsActive
        }), page, per_page);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")] [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCareerRequest req)
    {
        var career = new Career { Title = req.Title, Organization = req.Organization, Location = req.Location,
            JobType = req.JobType, Description = req.Description, Requirements = req.Requirements,
            Salary = req.Salary, ApplyEmail = req.ApplyEmail, ApplyUrl = req.ApplyUrl,
            Deadline = req.Deadline, IsPublished = req.IsPublished };
        _db.Careers.Add(career); await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(career.Id, "Career post created."));
    }

    [Authorize(Roles = "Admin")] [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCareerRequest req)
    {
        var c = await _db.Careers.FindAsync(id);
        if (c == null) return NotFound(ApiResponse.Fail("Not found."));
        c.Title = req.Title; c.Organization = req.Organization; c.Location = req.Location;
        c.JobType = req.JobType; c.Description = req.Description; c.Requirements = req.Requirements;
        c.Salary = req.Salary; c.ApplyEmail = req.ApplyEmail; c.ApplyUrl = req.ApplyUrl;
        c.Deadline = req.Deadline; c.IsPublished = req.IsPublished; c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(); return Ok(ApiResponse.Ok("Career post updated."));
    }

    [Authorize(Roles = "Admin")] [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Careers.FindAsync(id);
        if (c == null) return NotFound(ApiResponse.Fail("Not found."));
        _db.Careers.Remove(c); await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Career post deleted."));
    }
}
