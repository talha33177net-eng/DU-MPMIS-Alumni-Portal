using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Members;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/members")]
public class MembersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public MembersController(ApplicationDbContext db) => _db = db;

    // GET /api/members?page=1&search=&per_page=32
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] string? search = null,
        [FromQuery] int per_page = 32)
    {
        var query = _db.Members
            .Where(m => m.IsActive && m.Status != "Pending")
            .OrderBy(m => m.SortOrder).ThenBy(m => m.FullName)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m =>
                m.FullName.Contains(search) ||
                (m.Batch != null && m.Batch.Contains(search)) ||
                (m.CurrentOrganization != null && m.CurrentOrganization.Contains(search)));

        var result = await PaginationHelper.PaginateAsync(
            query.Select(m => new MemberDto
            {
                Id = m.Id,
                FullName = m.FullName,
                Phone = m.Phone,
                Email = m.Email,
                ProfilePhoto = m.ProfilePhoto,
                MemberType = m.MemberType,
                Batch = m.Batch,
                PassingYear = m.PassingYear,
                CurrentDesignation = m.CurrentDesignation,
                CurrentOrganization = m.CurrentOrganization,
                Bio = m.Bio,
                FacebookUrl = m.FacebookUrl,
                LinkedInUrl = m.LinkedInUrl,
                StudentId = m.StudentId,
                HomeDistrictOrCity = m.HomeDistrictOrCity,
                Nationality = m.Nationality,
                BloodGroup = m.BloodGroup,
                MaritalStatus = m.MaritalStatus,
                SpouseName = m.SpouseName,
                DateOfBirth = m.DateOfBirth,
                Gender = m.Gender,
                WorkCity = m.WorkCity,
                DateOfDeath = m.DateOfDeath,
                CreatedAt = m.CreatedAt
            }), page, per_page);

        return Ok(result);
    }

    // GET /api/members/{type}?page=1&search=&per_page=32
    [HttpGet("{type}")]
    public async Task<IActionResult> GetByType(
        string type,
        [FromQuery] int page = 1,
        [FromQuery] string? search = null,
        [FromQuery] int per_page = 32)
    {
        var validTypes = new[] { "LifeTime", "General", "InMemoriam" };
        if (!validTypes.Contains(type))
            return BadRequest(ApiResponse.Fail("Invalid member type. Use 'LifeTime', 'General', or 'InMemoriam'."));

        var query = _db.Members
            .Where(m => m.MemberType == type && m.IsActive && m.Status != "Pending")
            .OrderBy(m => m.SortOrder).ThenBy(m => m.FullName)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m =>
                m.FullName.Contains(search) ||
                (m.Batch != null && m.Batch.Contains(search)) ||
                (m.CurrentOrganization != null && m.CurrentOrganization.Contains(search)));

        var result = await PaginationHelper.PaginateAsync(
            query.Select(m => new MemberDto
            {
                Id = m.Id,
                FullName = m.FullName,
                Phone = m.Phone,
                Email = m.Email,
                ProfilePhoto = m.ProfilePhoto,
                MemberType = m.MemberType,
                Batch = m.Batch,
                PassingYear = m.PassingYear,
                CurrentDesignation = m.CurrentDesignation,
                CurrentOrganization = m.CurrentOrganization,
                Bio = m.Bio,
                FacebookUrl = m.FacebookUrl,
                LinkedInUrl = m.LinkedInUrl,
                StudentId = m.StudentId,
                HomeDistrictOrCity = m.HomeDistrictOrCity,
                Nationality = m.Nationality,
                BloodGroup = m.BloodGroup,
                MaritalStatus = m.MaritalStatus,
                SpouseName = m.SpouseName,
                DateOfBirth = m.DateOfBirth,
                Gender = m.Gender,
                WorkCity = m.WorkCity,
                DateOfDeath = m.DateOfDeath,
                CreatedAt = m.CreatedAt
            }), page, per_page);

        return Ok(result);
    }

    // GET /api/members/detail/{id}
    [HttpGet("detail/{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var member = await _db.Members.FindAsync(id);
        if (member == null || !member.IsActive)
            return NotFound(ApiResponse.Fail("Member not found."));

        return Ok(ApiResponse<MemberDto>.Ok(new MemberDto
        {
            Id = member.Id,
            FullName = member.FullName,
            Phone = member.Phone,
            Email = member.Email,
            ProfilePhoto = member.ProfilePhoto,
            MemberType = member.MemberType,
            Batch = member.Batch,
            PassingYear = member.PassingYear,
            CurrentDesignation = member.CurrentDesignation,
            CurrentOrganization = member.CurrentOrganization,
            Bio = member.Bio,
            FacebookUrl = member.FacebookUrl,
            LinkedInUrl = member.LinkedInUrl,
            StudentId = member.StudentId,
            HomeDistrictOrCity = member.HomeDistrictOrCity,
            Nationality = member.Nationality,
            BloodGroup = member.BloodGroup,
            MaritalStatus = member.MaritalStatus,
            SpouseName = member.SpouseName,
            DateOfBirth = member.DateOfBirth,
            Gender = member.Gender,
            WorkCity = member.WorkCity,
            DateOfDeath = member.DateOfDeath,
            Status = member.Status,
            CreatedAt = member.CreatedAt
        }));
    }

    // Admin: POST /api/members
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMemberRequest req)
    {
        var member = new Member
        {
            FullName = req.FullName,
            Phone = req.Phone,
            Email = req.Email,
            MemberType = req.MemberType,
            Batch = req.Batch,
            PassingYear = req.PassingYear,
            CurrentDesignation = req.CurrentDesignation,
            CurrentOrganization = req.CurrentOrganization,
            Bio = req.Bio,
            FacebookUrl = req.FacebookUrl,
            LinkedInUrl = req.LinkedInUrl,
            ProfilePhoto = req.ProfilePhoto,
            StudentId = req.StudentId,
            HomeDistrictOrCity = req.HomeDistrictOrCity,
            Nationality = req.Nationality,
            BloodGroup = req.BloodGroup,
            MaritalStatus = req.MaritalStatus,
            SpouseName = req.SpouseName,
            DateOfBirth = req.DateOfBirth,
            Gender = req.Gender,
            WorkCity = req.WorkCity,
            DateOfDeath = req.DateOfDeath,
            SortOrder = req.SortOrder
        };
        _db.Members.Add(member);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(member.Id, "Member created."));
    }

    // Admin: PUT /api/members/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMemberRequest req)
    {
        var member = await _db.Members.FindAsync(id);
        if (member == null) return NotFound(ApiResponse.Fail("Member not found."));

        member.FullName = req.FullName;
        member.Phone = req.Phone;
        member.Email = req.Email;
        member.MemberType = req.MemberType;
        member.Batch = req.Batch;
        member.PassingYear = req.PassingYear;
        member.CurrentDesignation = req.CurrentDesignation;
        member.CurrentOrganization = req.CurrentOrganization;
        member.Bio = req.Bio;
        member.FacebookUrl = req.FacebookUrl;
        member.LinkedInUrl = req.LinkedInUrl;
        member.ProfilePhoto = req.ProfilePhoto;
        member.StudentId = req.StudentId;
        member.HomeDistrictOrCity = req.HomeDistrictOrCity;
        member.Nationality = req.Nationality;
        member.BloodGroup = req.BloodGroup;
        member.MaritalStatus = req.MaritalStatus;
        member.SpouseName = req.SpouseName;
        member.DateOfBirth = req.DateOfBirth;
        member.Gender = req.Gender;
        member.WorkCity = req.WorkCity;
        member.DateOfDeath = req.DateOfDeath;
        member.IsActive = req.IsActive;
        if (!string.IsNullOrWhiteSpace(req.Status)) member.Status = req.Status;
        member.SortOrder = req.SortOrder;
        member.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Member updated."));
    }

    // Admin: DELETE /api/members/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var member = await _db.Members.FindAsync(id);
        if (member == null) return NotFound(ApiResponse.Fail("Member not found."));
        _db.Members.Remove(member);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Member deleted."));
    }

    // Admin: GET /api/members/pending
    [Authorize(Roles = "Admin")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending([FromQuery] int page = 1, [FromQuery] int per_page = 32)
    {
        var query = _db.Members.Where(m => m.Status == "Pending").OrderByDescending(m => m.CreatedAt);
        var result = await PaginationHelper.PaginateAsync(query.Select(m => new MemberDto {
            Id = m.Id, FullName = m.FullName, Email = m.Email, Phone = m.Phone, MemberType = m.MemberType,
            Batch = m.Batch, PassingYear = m.PassingYear, CurrentDesignation = m.CurrentDesignation,
            CurrentOrganization = m.CurrentOrganization, ProfilePhoto = m.ProfilePhoto, Status = m.Status, CreatedAt = m.CreatedAt
        }), page, per_page);
        return Ok(result);
    }

    // Admin: PUT /api/members/{id}/approve
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/approve")]
    public async Task<IActionResult> ApproveMember(int id)
    {
        var member = await _db.Members.FindAsync(id);
        if (member == null) return NotFound(ApiResponse.Fail("Member not found."));
        member.Status = "Approved";
        member.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Member approved successfully."));
    }

    // User: POST /api/members/apply
    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromBody] CreateMemberRequest req)
    {
        if (req.MemberType != "LifeTime" && req.MemberType != "General")
            return BadRequest(ApiResponse.Fail("You can only apply for LifeTime or General membership."));
            
        var member = new Member
        {
            FullName = req.FullName, Phone = req.Phone, Email = req.Email, MemberType = req.MemberType,
            Batch = req.Batch, PassingYear = req.PassingYear, CurrentDesignation = req.CurrentDesignation,
            CurrentOrganization = req.CurrentOrganization, Bio = req.Bio, FacebookUrl = req.FacebookUrl,
            LinkedInUrl = req.LinkedInUrl, ProfilePhoto = req.ProfilePhoto, StudentId = req.StudentId,
            HomeDistrictOrCity = req.HomeDistrictOrCity, Nationality = req.Nationality, BloodGroup = req.BloodGroup,
            MaritalStatus = req.MaritalStatus, SpouseName = req.SpouseName, DateOfBirth = req.DateOfBirth,
            Gender = req.Gender, WorkCity = req.WorkCity, DateOfDeath = req.DateOfDeath,
            Status = "Pending", IsActive = true
        };
        _db.Members.Add(member);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(member.Id, "Application submitted successfully. Pending Admin approval."));
    }
}
