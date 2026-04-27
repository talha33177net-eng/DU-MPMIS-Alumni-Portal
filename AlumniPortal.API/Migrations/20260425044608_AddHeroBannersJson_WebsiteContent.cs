using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlumniPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroBannersJson_WebsiteContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HeroBannersJson",
                table: "WebsiteContents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "WebsiteContents",
                keyColumn: "Id",
                keyValue: 1,
                column: "HeroBannersJson",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeroBannersJson",
                table: "WebsiteContents");
        }
    }
}
