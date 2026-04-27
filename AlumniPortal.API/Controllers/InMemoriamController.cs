using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Extended;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/in-memoriam")]
public class InMemoriamController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public InMemoriamController(ApplicationDbContext db) => _db = db;

    // GET /api/in-memoriam?page=1&per_page=20
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int per_page = 20)
    {
        var result = await PaginationHelper.PaginateAsync(
            _db.InMemoriams
                .Where(i => i.IsPublished)
                .OrderByDescending(i => i.DateOfDeath)
                .Select(i => new InMemoriamDto
                {
                    Id = i.Id, FullName = i.FullName, PhotoUrl = i.PhotoUrl,
                    Batch = i.Batch, PassingYear = i.PassingYear,
                    Description = i.Description, DateOfDeath = i.DateOfDeath
                }), page, per_page);
        return Ok(result);
    }

    // Admin: POST /api/in-memoriam
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInMemoriamRequest req)
    {
        var item = new InMemoriam
        {
            FullName = req.FullName, PhotoUrl = req.PhotoUrl,
            Batch = req.Batch, PassingYear = req.PassingYear,
            Description = req.Description, DateOfDeath = req.DateOfDeath,
            IsPublished = req.IsPublished
        };
        _db.InMemoriams.Add(item);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(item.Id, "In Memoriam entry created."));
    }

    // Admin: PUT /api/in-memoriam/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateInMemoriamRequest req)
    {
        var item = await _db.InMemoriams.FindAsync(id);
        if (item == null) return NotFound(ApiResponse.Fail("Entry not found."));
        item.FullName = req.FullName; item.PhotoUrl = req.PhotoUrl;
        item.Batch = req.Batch; item.PassingYear = req.PassingYear;
        item.Description = req.Description; item.DateOfDeath = req.DateOfDeath;
        item.IsPublished = req.IsPublished;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Entry updated."));
    }

    // Admin: DELETE /api/in-memoriam/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.InMemoriams.FindAsync(id);
        if (item == null) return NotFound(ApiResponse.Fail("Entry not found."));
        _db.InMemoriams.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Entry deleted."));
    }
}
