using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Gallery;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/gallery")]
public class GalleryController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public GalleryController(ApplicationDbContext db) => _db = db;

    // GET /api/gallery/photos?page=1&album=&per_page=20
    [HttpGet("photos")]
    public async Task<IActionResult> GetPhotos(
        [FromQuery] int page = 1,
        [FromQuery] string? album = null,
        [FromQuery] int per_page = 20)
    {
        var query = _db.Galleries
            .Where(g => g.MediaType == "Photo" && g.IsPublished)
            .OrderBy(g => g.SortOrder).ThenByDescending(g => g.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(album))
            query = query.Where(g => g.Album == album);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(g => new GalleryDto
            {
                Id = g.Id, Title = g.Title, Description = g.Description,
                MediaUrl = g.MediaUrl, ThumbnailUrl = g.ThumbnailUrl,
                MediaType = g.MediaType, Album = g.Album,
                IsPublished = g.IsPublished, SortOrder = g.SortOrder, CreatedAt = g.CreatedAt
            }), page, per_page);

        return Ok(result);
    }

    // GET /api/gallery/videos?page=1&per_page=12
    [HttpGet("videos")]
    public async Task<IActionResult> GetVideos(
        [FromQuery] int page = 1,
        [FromQuery] int per_page = 12)
    {
        var result = await PaginationHelper.PaginateAsync(
            _db.Galleries
                .Where(g => g.MediaType == "Video" && g.IsPublished)
                .OrderBy(g => g.SortOrder).ThenByDescending(g => g.CreatedAt)
                .Select(g => new GalleryDto
                {
                    Id = g.Id, Title = g.Title, Description = g.Description,
                    MediaUrl = g.MediaUrl, ThumbnailUrl = g.ThumbnailUrl,
                    MediaType = g.MediaType, Album = g.Album,
                    IsPublished = g.IsPublished, SortOrder = g.SortOrder, CreatedAt = g.CreatedAt
                }), page, per_page);

        return Ok(result);
    }

    // GET /api/gallery/albums — distinct album names (async fixed)
    [HttpGet("albums")]
    public async Task<IActionResult> GetAlbums()
    {
        var albums = await _db.Galleries
            .Where(g => g.IsPublished && g.Album != null)
            .Select(g => g.Album!)
            .Distinct()
            .OrderBy(a => a)
            .ToListAsync();

        return Ok(ApiResponse<List<string>>.Ok(albums));
    }

    // Admin: POST /api/gallery
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGalleryRequest req)
    {
        var item = new Gallery
        {
            Title = req.Title, Description = req.Description,
            MediaUrl = req.MediaUrl, ThumbnailUrl = req.ThumbnailUrl,
            MediaType = req.MediaType, Album = req.Album,
            IsPublished = req.IsPublished, SortOrder = req.SortOrder
        };
        _db.Galleries.Add(item);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(item.Id, "Gallery item created."));
    }

    // Admin: PUT /api/gallery/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateGalleryRequest req)
    {
        var item = await _db.Galleries.FindAsync(id);
        if (item == null) return NotFound(ApiResponse.Fail("Item not found."));
        item.Title = req.Title; item.Description = req.Description;
        item.MediaUrl = req.MediaUrl; item.ThumbnailUrl = req.ThumbnailUrl;
        item.MediaType = req.MediaType; item.Album = req.Album;
        item.IsPublished = req.IsPublished; item.SortOrder = req.SortOrder;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Gallery item updated."));
    }

    // Admin: DELETE /api/gallery/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Galleries.FindAsync(id);
        if (item == null) return NotFound(ApiResponse.Fail("Item not found."));
        _db.Galleries.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Gallery item deleted."));
    }

    // Admin: POST /api/gallery/upload
    [Authorize(Roles = "Admin")]
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.Fail("No file provided."));

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest(ApiResponse.Fail("Invalid file type. Allowed: jpg, jpeg, png, gif, webp, mp4, mov."));

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "gallery");
        var resultUrl = await AlumniPortal.API.Helpers.ImageOptimizationHelper.ProcessAndSaveFileAsync(file, uploadPath, "/uploads/gallery");

        return Ok(ApiResponse<string>.Ok(resultUrl, "File uploaded."));
    }
}
