using CarStockAPI.Models;
using CarStockAPI.Repositories;
using FastEndpoints;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CarStockAPI.Auth
{
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginEndpoint : Endpoint<LoginRequest>
    {
        private readonly DealerRepository _repo;
        private readonly IConfiguration _config;

        public LoginEndpoint(DealerRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        public override void Configure()
        {
            Post("/api/login");
            AllowAnonymous();
        }

        public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
        {
            // Get dealer from DB by username
            var dealer = await _repo.GetByUsername(req.Username);

            if (dealer == null || dealer.PasswordHash != req.Password)
            {
                // invalid login
                await Send.UnauthorizedAsync();
                return;
            }

            // Get JWT secret from appsettings
            var key = Encoding.ASCII.GetBytes(_config["JwtSettings:SecretKey"]!);
            var expiryHours = int.Parse(_config["JwtSettings:ExpiryHours"]);

            // create token
            var token = new JwtSecurityToken(
                claims: new[]
                {
                new Claim("dealerId", dealer.Id.ToString())
                },
                expires: DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256)
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            // send token back to client
            await Send.OkAsync(new { token = jwt });
        }
    }
}
