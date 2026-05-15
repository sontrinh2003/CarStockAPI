using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

namespace CarStockAPI.Repositories
{
    public class LowStockAlert
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class TopBrand
    {
        public string Brand { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class RecentSale
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public decimal SaleAmount { get; set; }
        public string SaleDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class DashboardSummary
    {
        public int TotalVehicles { get; set; }
        public int TotalStock { get; set; }
        public int LowStockCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public IEnumerable<LowStockAlert> LowStockAlerts { get; set; } = [];
        public IEnumerable<TopBrand> TopBrands { get; set; } = [];
        public IEnumerable<RecentSale> RecentSales { get; set; } = [];
    }

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
                "SELECT COALESCE(SUM(SaleAmount), 0.0) FROM Sales WHERE DealerId = @DealerId AND Status != 'Cancelled'",
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

            return new DashboardSummary
            {
                TotalVehicles = totalVehicles,
                TotalStock = totalStock,
                LowStockCount = lowStockAlerts.Count(),
                TotalRevenue = totalRevenue,
                LowStockAlerts = lowStockAlerts,
                TopBrands = topBrands,
                RecentSales = recentSales,
            };
        }
    }
}