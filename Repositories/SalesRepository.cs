using CarStockAPI.Models;
using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

namespace CarStockAPI.Repositories
{
    public class SalesRepository
    {
        private readonly string _connectionString;

        public SalesRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection GetConnection() => new SqliteConnection(_connectionString);

        public async Task<IEnumerable<Sale>> GetAll(int dealerId)
        {
            using var conn = GetConnection();
            return await conn.QueryAsync<Sale>(@"
                SELECT s.*, c.Name AS CustomerName, ca.Make, ca.Model
                FROM Sales s
                JOIN Customers c  ON c.Id  = s.CustomerId  AND c.DealerId  = s.DealerId
                JOIN Cars     ca  ON ca.Id = s.CarId        AND ca.DealerId = s.DealerId
                WHERE s.DealerId = @DealerId
                ORDER BY s.SaleDate DESC",
                new { DealerId = dealerId });
        }

        // Atomic: insert sale + decrement stock in one SQLite transaction
        public async Task<int> CreateSale(Sale sale)
        {
            using var conn = new SqliteConnection(_connectionString);
            await conn.OpenAsync();
            using var tx = conn.BeginTransaction();

            try
            {
                // 1. Verify stock
                var stock = await conn.QuerySingleOrDefaultAsync<int?>(
                    "SELECT Stock FROM Cars WHERE Id = @CarId AND DealerId = @DealerId",
                    new { sale.CarId, sale.DealerId }, tx);

                if (stock is null)
                    throw new KeyNotFoundException("Vehicle not found.");

                if (stock < 1)
                    throw new InvalidOperationException("Vehicle is out of stock.");

                // 2. Insert sale
                var id = await conn.QuerySingleAsync<int>(@"
                    INSERT INTO Sales (DealerId, CarId, CustomerId, SaleAmount, SaleDate, Status)
                    VALUES (@DealerId, @CarId, @CustomerId, @SaleAmount, @SaleDate, @Status);
                    SELECT last_insert_rowid();",
                    new
                    {
                        sale.DealerId,
                        sale.CarId,
                        sale.CustomerId,
                        sale.SaleAmount,
                        SaleDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                        Status = "Pending"
                    }, tx);

                // 3. Decrement stock atomically
                await conn.ExecuteAsync(
                    "UPDATE Cars SET Stock = Stock - 1 WHERE Id = @CarId AND DealerId = @DealerId",
                    new { sale.CarId, sale.DealerId }, tx);

                tx.Commit();
                return id;
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
    }
}