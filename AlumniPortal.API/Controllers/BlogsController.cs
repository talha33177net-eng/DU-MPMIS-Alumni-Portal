using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Blogs;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;
using System.Security.Claims;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/blogs")]
public class BlogsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly AlumniPortal.API.Services.IEmailService _emailService;

    public BlogsController(ApplicationDbContext db, AlumniPortal.API.Services.IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    // GET /api/blogs?page=1&search=&category=
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] int per_page = 10)
    {
        var query = _db.Blogs
            .Where(b => b.IsPublished)
            .OrderByDescending(b => b.PublishedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Title.Contains(search) || b.Excerpt!.Contains(search));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(b => b.Category == category);

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int? currentUserId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(b => new BlogDto
            {
                Id = b.Id, Title = b.Title, Slug = b.Slug,
                Excerpt = b.Excerpt, CoverImage = b.CoverImage,
                AuthorName = b.AuthorName, AuthorPhoto = b.Author != null ? b.Author.ProfilePhoto : b.AuthorPhoto,
                Category = b.Category, Tags = b.Tags,
                ViewCount = b.ViewCount, IsPublished = b.IsPublished,
                PublishedAt = b.PublishedAt, CreatedAt = b.CreatedAt,
                Likes = b.Likes, AuthorId = b.AuthorId,
                Comments = _db.BlogComments.Count(c => c.BlogId == b.Id),
                IsLiked = currentUserId != null && _db.BlogLikes.Any(l => l.BlogId == b.Id && l.UserId == currentUserId)
            }), page, per_page);

        return Ok(result);
    }

    // GET /api/blogs/{slug}
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var blog = await _db.Blogs.Include(b => b.Author).FirstOrDefaultAsync(b => b.Slug == slug && b.IsPublished);
        if (blog == null) return NotFound(ApiResponse.Fail("Blog post not found."));

        blog.ViewCount++;
        await _db.SaveChangesAsync();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int? currentUserId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);

        return Ok(ApiResponse<BlogDetailDto>.Ok(new BlogDetailDto
        {
            Id = blog.Id, Title = blog.Title, Slug = blog.Slug,
            Excerpt = blog.Excerpt, Content = blog.Content, CoverImage = blog.CoverImage,
            AuthorName = blog.AuthorName, AuthorPhoto = blog.Author != null ? blog.Author.ProfilePhoto : blog.AuthorPhoto,
            Tags = blog.Tags, ViewCount = blog.ViewCount, 
            IsPublished = blog.IsPublished, PublishedAt = blog.PublishedAt, 
            CreatedAt = blog.CreatedAt, Likes = blog.Likes, AuthorId = blog.AuthorId,
            Comments = await _db.BlogComments.CountAsync(c => c.BlogId == blog.Id),
            IsLiked = currentUserId != null && await _db.BlogLikes.AnyAsync(l => l.BlogId == blog.Id && l.UserId == currentUserId)
        }));
    }

    // User/Admin: POST /api/blogs
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogRequest req)
    {
        var slug = SlugHelper.GenerateUniqueSlug(req.Title, s => _db.Blogs.Any(b => b.Slug == s));
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int? authorId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);

        var blog = new Blog
        {
            Title = req.Title, Slug = slug, Excerpt = req.Excerpt,
            Content = req.Content, CoverImage = req.CoverImage,
            AuthorName = req.AuthorName, AuthorPhoto = req.AuthorPhoto, AuthorId = authorId,
            Category = req.Category, Tags = req.Tags,
            IsPublished = req.IsPublished,
            PublishedAt = req.IsPublished ? DateTime.UtcNow : null
        };
        _db.Blogs.Add(blog);
        await _db.SaveChangesAsync();

        if (blog.IsPublished)
        {
            var adminEmails = await _db.Users
                .Where(u => u.Role == "Admin")
                .Select(u => u.Email)
                .ToListAsync();

            string subject = $"New Blog Published: {blog.Title}";
            
            string templateBody = $@"
<div style='font-family: ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>
        <div style='background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 35px; text-align: center;'>
            <h1 style='color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;'>Alumni Portal</h1>
        </div>
        <div style='padding: 40px 30px;'>
            <h2 style='color: #1a1a1a; font-size: 22px; margin-top: 0; margin-bottom: 20px;'>New Blog Publication Notification</h2>
            <p style='font-size: 16px; line-height: 1.6; color: #555;'>Hello Admin,</p>
            <p style='font-size: 16px; line-height: 1.6; color: #555;'>A new blog post has just been published on the platform and you are receiving this automated alert.</p>
            
            <div style='background-color: #f8f9fa; border-left: 4px solid #eab308; padding: 20px; margin: 30px 0; border-radius: 6px;'>
                <h3 style='margin: 0 0 10px 0; color: #333; font-size: 18px;'>{blog.Title}</h3>
                <p style='margin: 0 0 5px 0; color: #666; font-size: 15px;'><strong>Author:</strong> {(string.IsNullOrEmpty(blog.AuthorName) ? "Anonymous" : blog.AuthorName)}</p>
                <p style='margin: 0; color: #666; font-size: 15px;'><strong>Timing:</strong> {DateTime.UtcNow.ToString("f")}</p>
            </div>
            
            <p style='font-size: 16px; line-height: 1.6; color: #555; text-align: center; margin-top: 40px; margin-bottom: 20px;'>
                <a href='http://localhost:5173/admin/blogs' style='background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.3s;'>Review in Dashboard</a>
            </p>
        </div>
        <div style='background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;'>
            <p style='margin: 0; color: #9ca3af; font-size: 13px;'>This is a system-generated notification from your web portal.</p>
            <p style='margin: 8px 0 0 0; color: #9ca3af; font-size: 13px;'>Please do not reply to this email directly.</p>
        </div>
    </div>
</div>";

            foreach (var email in adminEmails)
            {
                await _emailService.SendEmailAsync(email, subject, templateBody);
            }
        }

        return Ok(ApiResponse<int>.Ok(blog.Id, "Blog created."));
    }

    // Admin: PUT /api/blogs/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBlogRequest req)
    {
        var blog = await _db.Blogs.FindAsync(id);
        if (blog == null) return NotFound(ApiResponse.Fail("Blog not found."));

        blog.Title = req.Title; blog.Excerpt = req.Excerpt;
        blog.Content = req.Content; blog.CoverImage = req.CoverImage;   // was missing
        blog.AuthorName = req.AuthorName; blog.AuthorPhoto = req.AuthorPhoto; // was missing
        blog.Category = req.Category; blog.Tags = req.Tags;
        if (req.IsPublished && !blog.IsPublished) blog.PublishedAt = DateTime.UtcNow;
        blog.IsPublished = req.IsPublished;
        blog.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Blog updated."));
    }

    // User/Admin: DELETE /api/blogs/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var blog = await _db.Blogs.FindAsync(id);
        if (blog == null) return NotFound(ApiResponse.Fail("Blog not found."));

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);
        
        if (role != "Admin" && (string.IsNullOrEmpty(userIdStr) || int.Parse(userIdStr) != blog.AuthorId))
        {
            return Forbid();
        }

        _db.Blogs.Remove(blog);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Blog deleted."));
    }

    [Authorize]
    [HttpPost("{id:int}/like")]
    public async Task<IActionResult> ToggleLike(int id)
    {
        var blog = await _db.Blogs.FindAsync(id);
        if (blog == null) return NotFound(ApiResponse.Fail("Blog not found."));

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = int.Parse(userIdStr);

        var existingLike = await _db.BlogLikes.FirstOrDefaultAsync(l => l.BlogId == id && l.UserId == userId);
        if (existingLike != null)
        {
            _db.BlogLikes.Remove(existingLike);
            blog.Likes = Math.Max(0, blog.Likes - 1);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse.Ok("Blog unliked."));
        }
        else
        {
            _db.BlogLikes.Add(new BlogLike { BlogId = id, UserId = userId });
            blog.Likes++;
            await _db.SaveChangesAsync();
            return Ok(ApiResponse.Ok("Blog liked."));
        }
    }

    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(ApiResponse.Fail("No file provided."));
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "blogs");
        var resultUrl = await AlumniPortal.API.Helpers.ImageOptimizationHelper.ProcessAndSaveFileAsync(file, uploadPath, "/uploads/blogs");
        return Ok(ApiResponse<string>.Ok(resultUrl, "Image uploaded."));
    }
}
