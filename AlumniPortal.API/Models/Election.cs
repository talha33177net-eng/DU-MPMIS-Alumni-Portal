using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Election
{
    public int Id { get; set; }

    [Required, MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime? NominationStart { get; set; }
    public DateTime? NominationEnd { get; set; }
    public DateTime? VotingStart { get; set; }
    public DateTime? VotingEnd { get; set; }
    public DateTime? ResultDate { get; set; }

    public string Status { get; set; } = "Upcoming"; // Upcoming | NominationOpen | VotingOpen | Completed

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Candidate> Candidates { get; set; } = new List<Candidate>();
}
