using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Auth;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;
    public AdminUsersController(ApplicationDbContext db, JwtHelper jwt) { _db = db; _jwt = jwt; }

    // GET /api/admin/users?page=1&search=&role=&per_page=20
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] int per_page = 20)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role);

        query = query.OrderByDescending(u => u.CreatedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(u => new UserProfileDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                ProfilePhoto = u.ProfilePhoto,
                Batch = u.Batch,
                PassingYear = u.PassingYear,
                CurrentDesignation = u.CurrentDesignation,
                CurrentOrganization = u.CurrentOrganization,
                Bio = u.Bio,
                IsVerified = u.IsVerified,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }), page, per_page);

        return Ok(result);
    }

    // GET /api/admin/users/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found."));
        return Ok(ApiResponse<UserProfileDto>.Ok(new UserProfileDto
        {
            Id = user.Id, FullName = user.FullName, Email = user.Email, Phone = user.Phone,
            Role = user.Role, ProfilePhoto = user.ProfilePhoto, Batch = user.Batch,
            PassingYear = user.PassingYear, CurrentDesignation = user.CurrentDesignation,
            CurrentOrganization = user.CurrentOrganization, Bio = user.Bio,
            IsVerified = user.IsVerified, IsActive = user.IsActive, CreatedAt = user.CreatedAt
        }));
    }

    // PUT /api/admin/users/{id}/role — change user role
    [HttpPut("{id:int}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] string role)
    {
        var allowed = new[] { "Admin", "Member" };
        if (!allowed.Contains(role))
            return BadRequest(ApiResponse.Fail("Invalid role. Allowed: Admin, Member."));

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found."));
        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"User role updated to {role}."));
    }

    // PUT /api/admin/users/{id}/toggle-active — activate or deactivate
    [HttpPut("{id:int}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found."));
        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok(user.IsActive ? "User activated." : "User deactivated."));
    }

    // PUT /api/admin/users/{id}/verify — mark user as verified
    [HttpPut("{id:int}/verify")]
    public async Task<IActionResult> Verify(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found."));
        user.IsVerified = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("User verified."));
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found."));
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("User deleted."));
    }
}
