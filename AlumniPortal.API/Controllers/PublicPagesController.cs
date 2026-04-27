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
[Route("api/public-pages")]
public class PublicPagesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public PublicPagesController(ApplicationDbContext db) => _db = db;

    // GET /api/public-pages — list all pages (slug + title only)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var pages = await _db.PublicPages
            .OrderBy(p => p.Slug)
            .Select(p => new { p.Id, p.Slug, p.Title, p.UpdatedAt })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(pages));
    }

    // GET /api/public-pages/{slug} — get full page content by slug
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var page = await _db.PublicPages.FirstOrDefaultAsync(p => p.Slug == slug);
        if (page == null) return NotFound(ApiResponse.Fail("Page not found."));
        return Ok(ApiResponse<PublicPageDto>.Ok(new PublicPageDto
        {
            Id = page.Id, Slug = page.Slug, Title = page.Title,
            Content = page.Content, MetaDescription = page.MetaDescription,
            UpdatedAt = page.UpdatedAt
        }));
    }

    // Admin: POST /api/public-pages
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePublicPageRequest req)
    {
        if (await _db.PublicPages.AnyAsync(p => p.Slug == req.Slug))
            return BadRequest(ApiResponse.Fail("A page with this slug already exists."));

        var page = new PublicPage
        {
            Slug = req.Slug.Trim().ToLower(),
            Title = req.Title,
            Content = req.Content,
            MetaDescription = req.MetaDescription,
            UpdatedAt = DateTime.UtcNow
        };
        _db.PublicPages.Add(page);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(page.Id, "Page created."));
    }

    // Admin: PUT /api/public-pages/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePublicPageRequest req)
    {
        var page = await _db.PublicPages.FindAsync(id);
        if (page == null) return NotFound(ApiResponse.Fail("Page not found."));
        page.Title = req.Title;
        page.Content = req.Content;
        page.MetaDescription = req.MetaDescription;
        page.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Page updated."));
    }

    // Admin: DELETE /api/public-pages/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var page = await _db.PublicPages.FindAsync(id);
        if (page == null) return NotFound(ApiResponse.Fail("Page not found."));
        _db.PublicPages.Remove(page);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Page deleted."));
    }
}
