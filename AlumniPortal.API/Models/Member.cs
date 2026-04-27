using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Member
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }

    public string? ProfilePhoto { get; set; }

    [Required]
    public string MemberType { get; set; } = "General"; // LifeTime | General

    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }

    [MaxLength(50)]
    public string? StudentId { get; set; }

    [MaxLength(100)]
    public string? HomeDistrictOrCity { get; set; }

    [MaxLength(50)]
    public string? Nationality { get; set; }

    [MaxLength(10)]
    public string? BloodGroup { get; set; }

    [MaxLength(50)]
    public string? MaritalStatus { get; set; }

    [MaxLength(150)]
    public string? SpouseName { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    [MaxLength(100)]
    public string? WorkCity { get; set; }

    public DateTime? DateOfDeath { get; set; }

    public bool IsActive { get; set; } = true;
    public string Status { get; set; } = "Approved"; // Pending | Approved | Rejected
    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
