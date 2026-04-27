using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.Helpers;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/directory")]
public class DirectoryController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public DirectoryController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] string? search = null,
        [FromQuery] int per_page = 50)
    {
        // For the public E-Directory, we pull from registered Users 
        // to show everyone who actually has logged to this website.
        var query = _db.Users
            .Where(u => u.IsActive) 
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => 
                u.FullName.Contains(search) || 
                (u.Batch != null && u.Batch.Contains(search))
            );
        }

        query = query.OrderBy(u => u.FullName);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(u => new
            {
                u.Id,
                MemberId = _db.Members.Where(m => m.Email == u.Email).Select(m => m.Id).FirstOrDefault(),
                u.FullName,
                u.Email,
                u.Phone,
                u.ProfilePhoto,
                u.Batch,
                u.CurrentDesignation,
                u.CurrentOrganization,
                MemberType = u.Role // Optional mapping context 
            }), page, per_page);

        return Ok(result);
    }
}
