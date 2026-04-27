using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Career
{
    public int Id { get; set; }

    [Required, MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Organization { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Location { get; set; }

    [MaxLength(100)]
    public string? JobType { get; set; } // Full-time | Part-time | Internship | Remote

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? Requirements { get; set; }

    [MaxLength(100)]
    public string? Salary { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? ApplyEmail { get; set; }

    public string? ApplyUrl { get; set; }

    public DateTime? Deadline { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
