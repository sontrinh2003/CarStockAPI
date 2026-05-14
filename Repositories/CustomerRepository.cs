using CarStockAPI.Models;
using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

namespace CarStockAPI.Repositories
{
    public class CustomerRepository
    {
        private readonly string _connectionString;

        public CustomerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection GetConnection() => new SqliteConnection(_connectionString);

        public async Task<IEnumerable<Customer>> GetAll(int dealerId)
        {
            using var conn = GetConnection();
            return await conn.QueryAsync<Customer>(
                "SELECT * FROM Customers WHERE DealerId = @DealerId ORDER BY CreatedAt DESC",
                new { DealerId = dealerId });
        }

        public async Task<Customer?> GetById(int id, int dealerId)
        {
            using var conn = GetConnection();
            return await conn.QueryFirstOrDefaultAsync<Customer>(
                "SELECT * FROM Customers WHERE Id = @Id AND DealerId = @DealerId",
                new { Id = id, DealerId = dealerId });
        }

        public async Task<int> Add(Customer customer)
        {
            using var conn = GetConnection();
            return await conn.QuerySingleAsync<int>(@"
                INSERT INTO Customers (DealerId, Name, Email, Phone, CreatedAt)
                VALUES (@DealerId, @Name, @Email, @Phone, @CreatedAt);
                SELECT last_insert_rowid();",
                customer);
        }

        public async Task Delete(int id, int dealerId)
        {
            using var conn = GetConnection();
            await conn.ExecuteAsync(
                "DELETE FROM Customers WHERE Id = @Id AND DealerId = @DealerId",
                new { Id = id, DealerId = dealerId });
        }
    }
}