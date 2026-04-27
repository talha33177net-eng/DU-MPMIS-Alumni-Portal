namespace AlumniPortal.API.DTOs.Elections;

public class ElectionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? NominationStart { get; set; }
    public DateTime? NominationEnd { get; set; }
    public DateTime? VotingStart { get; set; }
    public DateTime? VotingEnd { get; set; }
    public DateTime? ResultDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CandidateDto
{
    public int Id { get; set; }
    public int ElectionId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Photo { get; set; }
    public string? Position { get; set; }
    public string? Batch { get; set; }
    public string? Statement { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool FeePaid { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class NominationRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Position { get; set; } = string.Empty;
    public string? Batch { get; set; }
    public string? Statement { get; set; }
}

public class CreateElectionRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? NominationStart { get; set; }
    public DateTime? NominationEnd { get; set; }
    public DateTime? VotingStart { get; set; }
    public DateTime? VotingEnd { get; set; }
    public DateTime? ResultDate { get; set; }
    public string Status { get; set; } = "Upcoming";
    public bool IsPublished { get; set; } = true;
}
