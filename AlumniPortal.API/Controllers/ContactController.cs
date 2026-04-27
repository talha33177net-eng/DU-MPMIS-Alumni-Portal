using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlumniPortal.API.Data;
using AlumniPortal.API.DTOs.Common;
using AlumniPortal.API.DTOs.Misc;
using AlumniPortal.API.Helpers;
using AlumniPortal.API.Models;

namespace AlumniPortal.API.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ContactController(ApplicationDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] ContactRequest req)
    {
        var msg = new ContactMessage
        {
            Name = req.Name, Email = req.Email, Phone = req.Phone,
            Subject = req.Subject, Message = req.Message
        };
        _db.ContactMessages.Add(msg); await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Message sent. We will get back to you shortly."));
    }

    [Authorize(Roles = "Admin")] [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] bool? unread = null, [FromQuery] int per_page = 20)
    {
        var query = _db.ContactMessages.OrderByDescending(m => m.SubmittedAt).AsQueryable();
        if (unread == true) query = query.Where(m => !m.IsRead);
        
        var result = await PaginationHelper.PaginateAsync(query.Select(m => new ContactMessageDto
        {
            Id = m.Id,
            Name = m.Name,
            Email = m.Email,
            Phone = m.Phone,
            Subject = m.Subject,
            Message = m.Message,
            IsRead = m.IsRead,
            SubmittedAt = m.SubmittedAt,
            ReadAt = m.ReadAt
        }), page, per_page);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")] [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var msg = await _db.ContactMessages.FindAsync(id);
        if (msg == null) return NotFound(ApiResponse.Fail("Message not found."));
        msg.IsRead = true; msg.ReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(); return Ok(ApiResponse.Ok("Marked as read."));
    }

    [Authorize(Roles = "Admin")] [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var msg = await _db.ContactMessages.FindAsync(id);
        if (msg == null) return NotFound(ApiResponse.Fail("Not found."));
        _db.ContactMessages.Remove(msg); await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Deleted."));
    }
}
