namespace AlumniPortal.API.DTOs.Events;

public class EventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string? Venue { get; set; }
    public decimal RegistrationFee { get; set; }
    public DateTime EventDate { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public bool IsRegistrationOpen { get; set; }
    public int? MaxAttendees { get; set; }
    public int RegistrationCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string? Venue { get; set; }
    public decimal RegistrationFee { get; set; }
    public DateTime EventDate { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public bool IsRegistrationOpen { get; set; } = false;
    public int? MaxAttendees { get; set; }
    public string Status { get; set; } = "Upcoming";
    public bool IsPublished { get; set; } = true;
}

public class EventRegistrationRequest
{
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }
}

public class EventRegistrationDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
}

public class SendOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public class VerifyRegistrationRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
}
