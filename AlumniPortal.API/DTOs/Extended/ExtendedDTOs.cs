using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.DTOs.Extended;

// Transactions
public class TransactionDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public int? ReferenceId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateTransactionRequest
{
    [Required] public string TransactionType { get; set; } = string.Empty;
    public int? ReferenceId { get; set; }
    [Required] public decimal Amount { get; set; }
    public string Currency { get; set; } = "BDT";
    [Required] public string PaymentMethod { get; set; } = string.Empty;
}

// Memberships
public class MembershipPlanDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal FeeAmount { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class MembershipApplicationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }    // populated for admin views
    public string? UserEmail { get; set; }   // populated for admin views
    public int MembershipPlanId { get; set; }
    public string? PlanTitle { get; set; }   // human-readable plan name
    public decimal FeeAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? TransactionId { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? AdminNote { get; set; }
}

public class ApplyMembershipRequest
{
    [Required] public int MembershipPlanId { get; set; }
}

public class UpdateMembershipStatusRequest
{
    [Required] public string Status { get; set; } = string.Empty; // Pending | Approved | Rejected
    public string? Note { get; set; }
}

// Blogs (Categories & Comments)
public class BlogCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class CreateBlogCategoryRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
}

public class BlogCommentDto
{
    public int Id { get; set; }
    public int BlogId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserPhoto { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateBlogCommentRequest
{
    [Required] public string Content { get; set; } = string.Empty;
}

// Careers
public class CareerApplicationDto
{
    public int Id { get; set; }
    public int CareerId { get; set; }
    public string CareerTitle { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public string CoverLetter { get; set; } = string.Empty;
    public string? ResumeUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}

public class CreateCareerApplicationRequest
{
    [Required] public int CareerId { get; set; }
    [Required] public string CoverLetter { get; set; } = string.Empty;
    public string? ResumeUrl { get; set; }
}

// Events (Tickets & Components)
public class EventComponentDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int SortOrder { get; set; }
}

public class EventTicketDto
{
    public int Id { get; set; }
    public int EventRegistrationId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Committee Applications
public class PositionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Rank { get; set; }
    public bool IsActive { get; set; }
}

public class CommitteeApplicationDto
{
    public int Id { get; set; }
    public int ElectionId { get; set; }
    public int UserId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public int PositionId { get; set; }
    public string PositionTitle { get; set; } = string.Empty;
    public string Statement { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}

// Public Pages & In Memoriam
public class PublicPageDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? MetaDescription { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePublicPageRequest
{
    [Required] public string Slug { get; set; } = string.Empty;
    [Required] public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? MetaDescription { get; set; }
}

public class InMemoriamDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? Description { get; set; }
    public DateTime? DateOfDeath { get; set; }
}

public class CreateInMemoriamRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? Description { get; set; }
    public DateTime? DateOfDeath { get; set; }
    public bool IsPublished { get; set; } = true;
}

// Admin / Roles / Messaging
public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public class MessageDto
{
    public int Id { get; set; }
    public int? SenderId { get; set; }
    public string? SenderName { get; set; }
    public int? ReceiverId { get; set; }
    public string? ReceiverName { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
}
