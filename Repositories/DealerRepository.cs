using CarStockAPI.Models;
using Dapper;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace CarStockAPI.Repositories
{
    public class DealerRepository
    {
        private readonly string _connectionString;

        public DealerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }
        private IDbConnection GetConnection()
        {
            return new SqliteConnection(_connectionString);
        }

        public async Task<Dealer?> GetByUsername(string username)
        {
            using var conn = GetConnection();

            return await conn.QueryFirstOrDefaultAsync<Dealer>(
                "SELECT * FROM Dealers WHERE Username = @Username",
                new { Username = username });
        }
    }
}
