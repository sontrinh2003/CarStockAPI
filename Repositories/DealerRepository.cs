using CarStockAPI.Models;
using Dapper;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;

namespace CarStockAPI.Repositories
{
    public class DealerRepository
    {
        private readonly IConfiguration _configuration;

        public DealerRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<Dealer?> GetByUsername(string username)
        {
            using var conn = GetConnection();

            return await conn.QueryFirstOrDefaultAsync<Dealer>(
                "SELECT * FROM Dealers WHERE Username = @Username",
                new { Username = username });
        }

        private SqliteConnection GetConnection()
        {
            return new SqliteConnection(_configuration.GetConnectionString("DefaultConnection"));
        }
    }
}
