using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Event
{
    public int Id { get; set; }

    [Required, MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? CoverImage { get; set; }
    public string? Venue { get; set; }
    public decimal RegistrationFee { get; set; } = 0;

    public DateTime EventDate { get; set; }
    public DateTime? RegistrationDeadline { get; set; }

    public bool IsRegistrationOpen { get; set; } = false;
    public int? MaxAttendees { get; set; }

    public string Status { get; set; } = "Upcoming"; // Upcoming | Ongoing | Past

    public bool IsPublished { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
}
