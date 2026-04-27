namespace AlumniPortal.API.DTOs.Auth;

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string? StudentId { get; set; }
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
}

public class SendRegistrationOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserProfileDto User { get; set; } = null!;
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? ProfilePhoto { get; set; }
    public string? StudentId { get; set; }
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? Bio { get; set; }
    public bool IsVerified { get; set; }
    public bool IsActive { get; set; }  // needed for admin user management
    public DateTime CreatedAt { get; set; }
    public string? MemberType { get; set; }
    public string? MemberStatus { get; set; }
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? StudentId { get; set; }
    public string? Batch { get; set; }
    public string? PassingYear { get; set; }
    public string? CurrentDesignation { get; set; }
    public string? CurrentOrganization { get; set; }
    public string? Bio { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
