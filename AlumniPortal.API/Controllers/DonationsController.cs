using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Misc;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;
    public DonationsController(ApplicationDbContext db, JwtHelper jwt) { _db = db; _jwt = jwt; }

    [HttpPost]
    public async Task<IActionResult> Donate([FromBody] DonationRequest req)
    {
        var userId = _jwt.GetUserId(User);
        var donation = new Donation
        {
            UserId = userId, DonorName = req.DonorName, DonorEmail = req.DonorEmail,
            DonorPhone = req.DonorPhone, Amount = req.Amount, Message = req.Message,
            PaymentMethod = req.PaymentMethod, TransactionId = req.TransactionId,
            Status = "Pending"
        };
        _db.Donations.Add(donation); await _db.SaveChangesAsync();
        return Ok(ApiResponse<int>.Ok(donation.Id, "Donation recorded. Thank you!"));
    }

    [Authorize(Roles = "Admin")] [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] string? status = null, [FromQuery] int per_page = 20)
    {
        var query = _db.Donations.OrderByDescending(d => d.DonatedAt).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(d => d.Status == status);
        var result = await PaginationHelper.PaginateAsync(query.Select(d => new DonationDto
        {
            Id = d.Id, DonorName = d.DonorName, Amount = d.Amount, Currency = d.Currency,
            Message = d.Message, PaymentMethod = d.PaymentMethod, Status = d.Status, DonatedAt = d.DonatedAt
        }), page, per_page);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")] [HttpPut("{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id)
    {
        var d = await _db.Donations.FindAsync(id);
        if (d == null) return NotFound(ApiResponse.Fail("Donation not found."));
        d.Status = "Confirmed"; d.ConfirmedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(); return Ok(ApiResponse.Ok("Donation confirmed."));
    }
}
