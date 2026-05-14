using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

namespace CarStockAPI.Repositories
{
    public record LowStockAlert(int Id, string Make, string Model, int Stock, string Message);
    public record TopBrand(string Brand, int Count);
    public record RecentSale(int Id, string CustomerName, string Make, string Model, decimal SaleAmount, string SaleDate, string Status);

    public record DashboardSummary(
        int TotalVehicles,
        int TotalStock,
        int LowStockCount,
        decimal TotalRevenue,
        IEnumerable<LowStockAlert> LowStockAlerts,
        IEnumerable<TopBrand> TopBrands,
        IEnumerable<RecentSale> RecentSales
    );

    public class DashboardRepository
    {
        private readonly string _connectionString;

        public DashboardRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection GetConnection() => new SqliteConnection(_connectionString);

        public async Task<DashboardSummary> GetSummary(int dealerId, int lowStockThreshold = 3)
        {
            using var conn = GetConnection();

            var totalVehicles = await conn.QuerySingleAsync<int>(
                "SELECT COUNT(*) FROM Cars WHERE DealerId = @DealerId", new { DealerId = dealerId });

            var totalStock = await conn.QuerySingleAsync<int>(
                "SELECT COALESCE(SUM(Stock), 0) FROM Cars WHERE DealerId = @DealerId", new { DealerId = dealerId });

            var totalRevenue = await conn.QuerySingleAsync<decimal>(
                "SELECT COALESCE(SUM(SaleAmount), 0) FROM Sales WHERE DealerId = @DealerId AND Status != 'Cancelled'",
                new { DealerId = dealerId });

            var lowStockAlerts = await conn.QueryAsync<LowStockAlert>(@"
                SELECT Id, Make, Model, Stock, 'Vehicle requires restocking' AS Message
                FROM Cars WHERE DealerId = @DealerId AND Stock < @Threshold ORDER BY Stock ASC",
                new { DealerId = dealerId, Threshold = lowStockThreshold });

            var topBrands = await conn.QueryAsync<TopBrand>(@"
                SELECT Make AS Brand, COUNT(*) AS Count
                FROM Cars WHERE DealerId = @DealerId
                GROUP BY Make ORDER BY Count DESC LIMIT 5",
                new { DealerId = dealerId });

            var recentSales = await conn.QueryAsync<RecentSale>(@"
                SELECT s.Id, c.Name AS CustomerName, ca.Make, ca.Model,
                       s.SaleAmount, s.SaleDate, s.Status
                FROM Sales s
                JOIN Customers c  ON c.Id  = s.CustomerId
                JOIN Cars     ca  ON ca.Id = s.CarId
                WHERE s.DealerId = @DealerId
                ORDER BY s.SaleDate DESC LIMIT 5",
                new { DealerId = dealerId });

            return new DashboardSummary(
                totalVehicles, totalStock, lowStockAlerts.Count(),
                totalRevenue, lowStockAlerts, topBrands, recentSales);
        }
    }
}