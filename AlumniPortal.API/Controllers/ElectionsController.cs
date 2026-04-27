using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Elections;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/elections")]
public class ElectionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ElectionsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int per_page = 10)
    {
        var result = await PaginationHelper.PaginateAsync(
            _db.Elections
                .Where(e => e.IsPublished)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new ElectionDto
                {
                    Id = e.Id, Title = e.Title, Description = e.Description,
                    NominationStart = e.NominationStart, NominationEnd = e.NominationEnd,
                    VotingStart = e.VotingStart, VotingEnd = e.VotingEnd,
                    ResultDate = e.ResultDate, Status = e.Status,
                    IsPublished = e.IsPublished, CreatedAt = e.CreatedAt
                }), page, per_page);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllAdmin([FromQuery] int page = 1, [FromQuery] int per_page = 100)
    {
        var result = await PaginationHelper.PaginateAsync(
            _db.Elections
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new ElectionDto
                {
                    Id = e.Id, Title = e.Title, Description = e.Description,
                    NominationStart = e.NominationStart, NominationEnd = e.NominationEnd,
                    VotingStart = e.VotingStart, VotingEnd = e.VotingEnd,
                    ResultDate = e.ResultDate, Status = e.Status,
                    IsPublished = e.IsPublished, CreatedAt = e.CreatedAt
                }), page, per_page);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await _db.Elections.FindAsync(id);
        if (e == null || !e.IsPublished) return NotFound(ApiResponse.Fail("Election not found."));
        return Ok(ApiResponse<ElectionDto>.Ok(new ElectionDto
        {
            Id = e.Id, Title = e.Title, Description = e.Description,
            NominationStart = e.NominationStart, NominationEnd = e.NominationEnd,
            VotingStart = e.VotingStart, VotingEnd = e.VotingEnd,
            ResultDate = e.ResultDate, Status = e.Status,
            IsPublished = e.IsPublished, CreatedAt = e.CreatedAt
        }));
    }

    [HttpGet("{id:int}/candidates")]
    public async Task<IActionResult> GetCandidates(int id, [FromQuery] string? position = null)
    {
        var query = _db.Candidates
            .Where(c => c.ElectionId == id && c.Status == "Approved")
            .OrderBy(c => c.Position).ThenBy(c => c.FullName)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(position))
            query = query.Where(c => c.Position == position);

        var candidates = await query.Select(c => new CandidateDto
        {
            Id = c.Id, ElectionId = c.ElectionId, FullName = c.FullName,
            Photo = c.Photo, Position = c.Position, Batch = c.Batch,
            Statement = c.Statement, Status = c.Status,
            FeePaid = c.FeePaid, SubmittedAt = c.SubmittedAt
        }).ToListAsync();

        return Ok(ApiResponse<List<CandidateDto>>.Ok(candidates));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}/admin/candidates")]
    public async Task<IActionResult> GetAdminCandidates(int id)
    {
        var candidates = await _db.Candidates
            .Where(c => c.ElectionId == id)
            .OrderByDescending(c => c.SubmittedAt)
            .Select(c => new CandidateDto
            {
                Id = c.Id, ElectionId = c.ElectionId, FullName = c.FullName,
                Photo = c.Photo, Position = c.Position, Batch = c.Batch,
                Statement = c.Statement, Status = c.Status,
                FeePaid = c.FeePaid, SubmittedAt = c.SubmittedAt
            }).ToListAsync();

        return Ok(ApiResponse<List<CandidateDto>>.Ok(candidates));
    }

    [Authorize]   // only authenticated members can nominate
    [HttpPost("{id:int}/nominate")]
    public async Task<IActionResult> Nominate(int id, [FromBody] NominationRequest req)
    {
        var election = await _db.Elections.FindAsync(id);
        if (election == null) return NotFound(ApiResponse.Fail("Election not found."));
        if (election.Status != "NominationOpen")
            return BadRequest(ApiResponse.Fail("Nominations are not open for this election."));

        var candidate = new Candidate
        {
            ElectionId = id,
            FullName = req.FullName, Email = req.Email, Phone = req.Phone,
            Position = req.Position, Batch = req.Batch, Statement = req.Statement,
            Status = "Pending"
        };
        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(candidate.Id, "Nomination submitted. Awaiting approval."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateElectionRequest req)
    {
        var election = new Election
        {
            Title = req.Title, Description = req.Description,
            NominationStart = req.NominationStart, NominationEnd = req.NominationEnd,
            VotingStart = req.VotingStart, VotingEnd = req.VotingEnd,
            ResultDate = req.ResultDate, Status = req.Status, IsPublished = req.IsPublished
        };
        _db.Elections.Add(election);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(election.Id, "Election created."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateElectionRequest req)
    {
        var e = await _db.Elections.FindAsync(id);
        if (e == null) return NotFound(ApiResponse.Fail("Election not found."));
        e.Title = req.Title; e.Description = req.Description;
        e.NominationStart = req.NominationStart; e.NominationEnd = req.NominationEnd;
        e.VotingStart = req.VotingStart; e.VotingEnd = req.VotingEnd;
        e.ResultDate = req.ResultDate; e.Status = req.Status;
        e.IsPublished = req.IsPublished; e.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Election updated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("candidates/{candidateId:int}/status")]
    public async Task<IActionResult> UpdateCandidateStatus(int candidateId, [FromBody] string status)
    {
        var candidate = await _db.Candidates.FindAsync(candidateId);
        if (candidate == null) return NotFound(ApiResponse.Fail("Candidate not found."));
        candidate.Status = status;
        candidate.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Candidate status updated to {status}."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _db.Elections.FindAsync(id);
        if (e == null) return NotFound(ApiResponse.Fail("Election not found."));
        _db.Elections.Remove(e);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Election deleted."));
    }
}
