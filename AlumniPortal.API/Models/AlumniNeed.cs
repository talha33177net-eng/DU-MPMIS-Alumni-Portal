using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class AlumniNeed
{
    public int Id { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = "General"; // Job | Academic | Mentorship | Project | General

    [MaxLength(150)]
    public string? ContactInfo { get; set; }

    public bool IsAnonymous { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
