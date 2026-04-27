using System.ComponentModel.DataAnnotations;

namespace AlumniPortal.API.Models;

public class Donation
{
    public int Id { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    [Required, MaxLength(150)]
    public string DonorName { get; set; } = string.Empty;

    [EmailAddress, MaxLength(200)]
    public string? DonorEmail { get; set; }

    [MaxLength(20)]
    public string? DonorPhone { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BDT";

    [MaxLength(500)]
    public string? Message { get; set; }

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    public string PaymentMethod { get; set; } = "Manual"; // Manual | bKash | Nagad | Card

    public string Status { get; set; } = "Pending"; // Pending | Confirmed | Failed

    public DateTime DonatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }
}
