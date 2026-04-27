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
[Route("api/blog-categories")]
public class BlogCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BlogCategoriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _db.BlogCategories
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new BlogCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                SortOrder = c.SortOrder
            })
            .ToListAsync();
            
        return Ok(ApiResponse<List<BlogCategoryDto>>.Ok(categories));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogCategoryRequest req)
    {
        var slug = SlugHelper.GenerateSlug(req.Name);
        
        if (await _db.BlogCategories.AnyAsync(c => c.Slug == slug))
            return BadRequest(ApiResponse.Fail("Category with similar name already exists."));

        var category = new BlogCategory
        {
            Name = req.Name,
            Slug = slug,
            SortOrder = req.SortOrder
        };

        _db.BlogCategories.Add(category);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<int>.Ok(category.Id, "Category created."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.BlogCategories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse.Fail("Category not found."));

        _db.BlogCategories.Remove(category);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Category deleted."));
    }
}
