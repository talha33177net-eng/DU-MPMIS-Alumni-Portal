namespace AlumniPortal.API.DTOs.Members;

public class MemberDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? ProfilePhoto { get; set; }
    public string MemberType { get; set; } = string.Empty;
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? Bio { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }

    public string? StudentId { get; set; }
    public string? HomeDistrictOrCity { get; set; }
    public string? Nationality { get; set; }
    public string? BloodGroup { get; set; }
    public string? MaritalStatus { get; set; }
    public string? SpouseName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? WorkCity { get; set; }
    public DateTime? DateOfDeath { get; set; }
    public string Status { get; set; } = "Approved";

    public DateTime CreatedAt { get; set; }
}

public class CreateMemberRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string MemberType { get; set; } = "General";
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? Bio { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? ProfilePhoto { get; set; }

    public string? StudentId { get; set; }
    public string? HomeDistrictOrCity { get; set; }
    public string? Nationality { get; set; }
    public string? BloodGroup { get; set; }
    public string? MaritalStatus { get; set; }
    public string? SpouseName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? WorkCity { get; set; }
    public DateTime? DateOfDeath { get; set; }

    public int SortOrder { get; set; } = 0;
}

public class UpdateMemberRequest : CreateMemberRequest
{
    public bool IsActive { get; set; } = true;
    public string? Status { get; set; }
}
