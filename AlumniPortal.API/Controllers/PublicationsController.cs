using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.Models;
using AlumniPortal.API.DTOs.Common;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/publications")]
public class PublicationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PublicationsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int per_page = 10)
    {
        var query = _db.Publications.AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p => p.Category == category);
        }

        var total = await query.CountAsync();
        var data = await query.OrderByDescending(p => p.PublishedAt)
                              .Skip((page - 1) * per_page)
                              .Take(per_page)
                              .ToListAsync();

        return Ok(ApiResponse<IEnumerable<Publication>>.Ok(data, "Publications retrieved."));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pub = await _db.Publications.FindAsync(id);
        if (pub == null) return NotFound(ApiResponse.Fail("Publication not found."));

        return Ok(ApiResponse<Publication>.Ok(pub));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Publication req)
    {
        req.CreatedAt = DateTime.UtcNow;
        if (!req.PublishedAt.Equals(default))
        {
            req.PublishedAt = DateTime.UtcNow;
        }

        _db.Publications.Add(req);
        await _db.SaveChangesAsync();

        return Created($"/api/publications/{req.Id}", ApiResponse<Publication>.Ok(req, "Publication created."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Publication req)
    {
        var pub = await _db.Publications.FindAsync(id);
        if (pub == null) return NotFound(ApiResponse.Fail("Publication not found."));

        pub.Title = req.Title;
        pub.Content = req.Content;
        pub.AttachmentUrl = req.AttachmentUrl;
        pub.Category = req.Category;
        pub.IsPublished = req.IsPublished;
        pub.PublishedAt = req.PublishedAt;
        pub.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<Publication>.Ok(pub, "Publication updated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var pub = await _db.Publications.FindAsync(id);
        if (pub == null) return NotFound(ApiResponse.Fail("Publication not found."));

        _db.Publications.Remove(pub);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse.Ok("Publication deleted."));
    }
}
