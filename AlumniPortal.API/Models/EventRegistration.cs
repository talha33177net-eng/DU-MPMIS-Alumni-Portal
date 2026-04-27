using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class EventRegistration
{
    public int Id { get; set; }

    public int EventId { get; set; }
    public Event Event { get; set; } = null!;

    public int? UserId { get; set; }
    public User? User { get; set; }

    // For guest registrations (no account)
    [MaxLength(150)]
    public string? GuestName { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? GuestEmail { get; set; }

    [MaxLength(20)]
    public string? GuestPhone { get; set; }

    public string Status { get; set; } = "Pending"; // Pending | Confirmed | Cancelled

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}
