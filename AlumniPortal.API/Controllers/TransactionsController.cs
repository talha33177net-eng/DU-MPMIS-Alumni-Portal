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
[Route("api/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtHelper _jwt;

    public TransactionsController(ApplicationDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [Authorize]
    [HttpGet("my-transactions")]
    public async Task<IActionResult> MyTransactions([FromQuery] int page = 1, [FromQuery] int per_page = 20)
    {
        var userId = _jwt.GetRequiredUserId(User);
        
        var query = _db.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(t => new TransactionDto
            {
                Id = t.Id,
                UserId = t.UserId,
                TransactionType = t.TransactionType,
                ReferenceId = t.ReferenceId,
                Amount = t.Amount,
                Currency = t.Currency,
                PaymentMethod = t.PaymentMethod,
                TransactionId = t.TransactionId,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            }), page, per_page);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllTransactions(
        [FromQuery] int page = 1, 
        [FromQuery] string? type = null, 
        [FromQuery] string? status = null, 
        [FromQuery] int per_page = 20)
    {
        var query = _db.Transactions.AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(t => t.TransactionType == type);
            
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(t => t.Status == status);
            
        query = query.OrderByDescending(t => t.CreatedAt);

        var result = await PaginationHelper.PaginateAsync(
            query.Select(t => new TransactionDto
            {
                Id = t.Id,
                UserId = t.UserId,
                TransactionType = t.TransactionType,
                ReferenceId = t.ReferenceId,
                Amount = t.Amount,
                Currency = t.Currency,
                PaymentMethod = t.PaymentMethod,
                TransactionId = t.TransactionId,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            }), page, per_page);

        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePayment([FromBody] CreateTransactionRequest req)
    {
        var userId = _jwt.GetRequiredUserId(User);

        var validTypes = new[] { "Membership", "EventTicket", "CommitteeApplication", "Donation" };
        if (!validTypes.Contains(req.TransactionType))
            return BadRequest(ApiResponse.Fail("Invalid transaction type."));
        
        var transaction = new Transaction
        {
            UserId = userId,
            TransactionType = req.TransactionType,
            ReferenceId = req.ReferenceId,
            Amount = req.Amount,
            Currency = req.Currency,
            PaymentMethod = req.PaymentMethod,
            Status = "Pending",
            TransactionId = null  // set by payment gateway callback, not here
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        // Update corresponding entity if reference provided
        if (req.ReferenceId.HasValue)
        {
            var linked = false;
            switch (req.TransactionType)
            {
                case "Membership":
                    var memApp = await _db.MembershipApplications.FindAsync(req.ReferenceId.Value);
                    if (memApp != null)
                    {
                        memApp.TransactionId = transaction.Id;
                        linked = true;
                    }
                    break;
                case "EventTicket":
                    var ticket = await _db.EventTickets.FindAsync(req.ReferenceId.Value);
                    if (ticket != null)
                    {
                        ticket.TransactionId = transaction.Id;
                        linked = true;
                    }
                    break;
                case "CommitteeApplication":
                    var comApp = await _db.CommitteeApplications.FindAsync(req.ReferenceId.Value);
                    if (comApp != null)
                    {
                        comApp.TransactionId = transaction.Id;
                        linked = true;
                    }
                    break;
                case "Donation":
                    var donation = await _db.Donations.FindAsync(req.ReferenceId.Value);
                    linked = donation != null;
                    break;
            }

            if (!linked)
            {
                _db.Transactions.Remove(transaction);
                await _db.SaveChangesAsync();
                return BadRequest(ApiResponse.Fail("Reference item not found for the given transaction type."));
            }

            await _db.SaveChangesAsync();
        }

        return Ok(ApiResponse<TransactionDto>.Ok(new TransactionDto
        {
            Id = transaction.Id,
            UserId = transaction.UserId,
            TransactionType = transaction.TransactionType,
            Amount = transaction.Amount,
            Status = transaction.Status,
            TransactionId = transaction.TransactionId
        }, "Payment initiated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var transaction = await _db.Transactions.FindAsync(id);
        if (transaction == null) return NotFound(ApiResponse.Fail("Transaction not found."));

        var allowedStatuses = new[] { "Pending", "Success", "Failed", "Cancelled" };
        if (!allowedStatuses.Contains(status))
            return BadRequest(ApiResponse.Fail("Invalid status. Allowed: Pending, Success, Failed, Cancelled."));

        transaction.Status = status;
        if (status == "Success")
            transaction.CompletedAt = DateTime.UtcNow;
        else
            transaction.CompletedAt = null;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Transaction marked as {status}."));
    }
}
