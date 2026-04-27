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
[Route("api/blog-comments")]
public class BlogCommentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;

    public BlogCommentsController(ApplicationDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpGet("blog/{blogId:int}")]
    public async Task<IActionResult> GetByBlog(int blogId, [FromQuery] int page = 1, [FromQuery] int per_page = 20)
    {
        var query = _db.BlogComments
            .Include(c => c.User)
            .Where(c => c.BlogId == blogId && c.IsApproved)
            .OrderByDescending(c => c.CreatedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(c => new BlogCommentDto
            {
                Id = c.Id,
                BlogId = c.BlogId,
                UserId = c.UserId,
                UserName = c.User.FullName,
                UserPhoto = c.User.ProfilePhoto,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            }), page, per_page);

        return Ok(result);
    }

    [Authorize]
    [HttpPost("blog/{blogId:int}")]
    public async Task<IActionResult> Create(int blogId, [FromBody] CreateBlogCommentRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);
        
        if (!await _db.Blogs.AnyAsync(b => b.Id == blogId))
            return NotFound(ApiResponse.Fail("Blog post not found."));

        var comment = new BlogComment
        {
            BlogId = blogId,
            UserId = userId,
            Content = req.Content,
            IsApproved = true // Auto-approve by default, could be config driven
        };

        _db.BlogComments.Add(comment);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<int>.Ok(comment.Id, "Comment posted successfully."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var comment = await _db.BlogComments.FindAsync(id);
        if (comment == null) return NotFound(ApiResponse.Fail("Comment not found."));

        _db.BlogComments.Remove(comment);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Comment deleted."));
    }
}
