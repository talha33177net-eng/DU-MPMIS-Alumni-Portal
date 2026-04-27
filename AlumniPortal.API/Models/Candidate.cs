using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Candidate
{
    public int Id { get; set; }

    public int ElectionId { get; set; }
    public Election Election { get; set; } = null!;

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public string? Photo { get; set; }

    [MaxLength(200)]
    public string? Position { get; set; } // e.g. "President", "Secretary"

    [MaxLength(150)]
    public string? Batch { get; set; }

    [MaxLength(500)]
    public string? Statement { get; set; }

    public string Status { get; set; } = "Pending"; // Pending | Approved | Rejected

    public int VoteCount { get; set; } = 0;

    public decimal? NominationFee { get; set; }
    public bool FeePaid { get; set; } = false;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
