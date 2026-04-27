using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Notices;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/notices")]
public class NoticesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public NoticesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] string? category = null,
        [FromQuery] int per_page = 10)
    {
        var now = DateTime.UtcNow;
        var query = _db.Notices
            .Where(n => n.IsPublished && (n.ExpiresAt == null || n.ExpiresAt > now))
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.PublishedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(n => n.Category == category);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(n => new NoticeDto
            {
                Id = n.Id, Title = n.Title, Content = n.Content,
                AttachmentUrl = n.AttachmentUrl, Category = n.Category,
                IsPinned = n.IsPinned, PublishedAt = n.PublishedAt, ExpiresAt = n.ExpiresAt
            }), page, per_page);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var n = await _db.Notices.FindAsync(id);
        if (n == null || !n.IsPublished) return NotFound(ApiResponse.Fail("Notice not found."));
        return Ok(ApiResponse<NoticeDto>.Ok(new NoticeDto
        {
            Id = n.Id, Title = n.Title, Content = n.Content,
            AttachmentUrl = n.AttachmentUrl, Category = n.Category,
            IsPinned = n.IsPinned, PublishedAt = n.PublishedAt, ExpiresAt = n.ExpiresAt
        }));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNoticeRequest req)
    {
        var notice = new Notice
        {
            Title = req.Title, Content = req.Content,
            AttachmentUrl = req.AttachmentUrl,      // was missing
            Category = req.Category, IsPinned = req.IsPinned,
            IsPublished = req.IsPublished, ExpiresAt = req.ExpiresAt,
            PublishedAt = req.IsPublished ? DateTime.UtcNow : default
        };
        _db.Notices.Add(notice);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(notice.Id, "Notice created."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateNoticeRequest req)
    {
        var notice = await _db.Notices.FindAsync(id);
        if (notice == null) return NotFound(ApiResponse.Fail("Notice not found."));
        notice.Title = req.Title; notice.Content = req.Content;
        notice.AttachmentUrl = req.AttachmentUrl;   // was missing
        notice.Category = req.Category; notice.IsPinned = req.IsPinned;
        notice.IsPublished = req.IsPublished; notice.ExpiresAt = req.ExpiresAt;
        notice.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Notice updated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var notice = await _db.Notices.FindAsync(id);
        if (notice == null) return NotFound(ApiResponse.Fail("Notice not found."));
        _db.Notices.Remove(notice);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Notice deleted."));
    }
}
