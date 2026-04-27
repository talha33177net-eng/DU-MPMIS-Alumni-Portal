using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlumniPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSmtpConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SmtpSenderAppPassword",
                table: "WebsiteContents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SmtpSenderEmail",
                table: "WebsiteContents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "WebsiteContents",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "SmtpSenderAppPassword", "SmtpSenderEmail" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SmtpSenderAppPassword",
                table: "WebsiteContents");

            migrationBuilder.DropColumn(
                name: "SmtpSenderEmail",
                table: "WebsiteContents");
        }
    }
}
