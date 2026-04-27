using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "Member"; // Admin | Member

    public string? ProfilePhoto { get; set; }

    [MaxLength(50)]
    public string? StudentId { get; set; }

    public string? Batch { get; set; }
    public string? Department { get; set; }
    public string? PassingYear { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? Bio { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<EventRegistration> EventRegistrations { get; set; } = new List<EventRegistration>();
    public ICollection<AlumniNeed> AlumniNeeds { get; set; } = new List<AlumniNeed>();
    public ICollection<Donation> Donations { get; set; } = new List<Donation>();
}
