using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class CommitteeMember
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Position { get; set; } = string.Empty; // President, Secretary, etc.

    public string? Photo { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(150)]
    public string? Batch { get; set; }

    [MaxLength(200)]
    public string? CurrentDesignation { get; set; }

    [MaxLength(200)]
    public string? CurrentOrganization { get; set; }

    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }

    [MaxLength(100)]
    public string? CommitteeYear { get; set; } // e.g. "2024-2026"

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
