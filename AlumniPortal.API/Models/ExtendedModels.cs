using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlumniPortal.API.Models;

public class Transaction
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required, MaxLength(50)]
    public string TransactionType { get; set; } = string.Empty; // Membership, EventTicket, CommitteeApplication, Donation

    public int? ReferenceId { get; set; } // ID of the specific item being paid for

    [Required, Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BDT";

    [Required, MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty; // SSLCommerz, bKash, Manual, etc.

    [MaxLength(100)]
    public string? TransactionId { get; set; } // External Gateway ID

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Success, Failed, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

public class MembershipPlan
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Title { get; set; } = string.Empty; // LifeTime, General
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal FeeAmount { get; set; }
    
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MembershipApplication
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int MembershipPlanId { get; set; }
    public MembershipPlan MembershipPlan { get; set; } = null!;

    [Required, MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public int? TransactionId { get; set; }
    public Transaction? Transaction { get; set; }

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public string? AdminNote { get; set; }
}

public class EventComponent
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    public int SortOrder { get; set; } = 0;
}

public class EventTicket
{
    public int Id { get; set; }
    
    public int EventRegistrationId { get; set; }
    public EventRegistration EventRegistration { get; set; } = null!;

    [Required, MaxLength(50)]
    public string TicketNumber { get; set; } = string.Empty;
    
    public int? TransactionId { get; set; }
    public Transaction? Transaction { get; set; }

    public bool IsVerified { get; set; } = false;
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CareerApplication
{
    public int Id { get; set; }

    public int CareerId { get; set; }
    public Career Career { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    public string CoverLetter { get; set; } = string.Empty;

    public string? ResumeUrl { get; set; }

    [Required, MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Reviewed, Accepted, Rejected

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class BlogCategory
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string Slug { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    
    public ICollection<Blog> Blogs { get; set; } = new List<Blog>();
}

public class BlogLike
{
    public int Id { get; set; }
    public int BlogId { get; set; }
    public Blog Blog { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class BlogComment
{
    public int Id { get; set; }

    public int BlogId { get; set; }
    public Blog Blog { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Position
{
    public int Id { get; set; }
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty; // e.g., President, Vice President
    public int Rank { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class CommitteeApplication
{
    public int Id { get; set; }
    
    public int ElectionId { get; set; }
    public Election Election { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int PositionId { get; set; }
    public Position Position { get; set; } = null!;

    [Required, MaxLength(500)]
    public string Statement { get; set; } = string.Empty;

    public int? TransactionId { get; set; }
    public Transaction? Transaction { get; set; }

    [Required, MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
}

public class PublicPage
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Slug { get; set; } = string.Empty; // About_Us, Mission_Vision, Constitution, etc.
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? MetaDescription { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class InMemoriam
{
    public int Id { get; set; }
    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? Description { get; set; }
    public DateTime? DateOfDeath { get; set; }
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Role
{
    public int Id { get; set; }
    [Required, MaxLength(50)]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}

public class Permission
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty; // e.g., "manage_users", "manage_blogs"
    
    public ICollection<Role> Roles { get; set; } = new List<Role>();
}

public class Message
{
    public int Id { get; set; }
    
    public int? SenderId { get; set; } // null means system/admin
    public User? Sender { get; set; }

    public int? ReceiverId { get; set; } // null means broadcast
    public User? Receiver { get; set; }

    [Required, MaxLength(200)]
    public string Subject { get; set; } = string.Empty;
    [Required]
    public string Content { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
