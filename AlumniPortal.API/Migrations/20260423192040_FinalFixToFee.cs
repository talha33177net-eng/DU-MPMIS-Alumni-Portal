using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlumniPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class FinalFixToFee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "RegistrationFee",
                table: "Events",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RegistrationFee",
                table: "Events");
        }
    }
}
