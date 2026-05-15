using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

namespace CarStockAPI.Repositories
{
    public class RevenueResult
    {
        public decimal Total { get; set; }
        public decimal ThisMonth { get; set; }
        public int TotalSales { get; set; }
        public decimal AverageSale { get; set; }
    }

    public class TopBrandResult
    {
        public string Brand { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    public class StockSummaryResult
    {
        public int TotalModels { get; set; }
        public int TotalUnits { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal InventoryValue { get; set; }
    }

    public class AnalyticsRepository
    {
        private readonly string _connectionString;

        public AnalyticsRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection GetConnection() => new SqliteConnection(_connectionString);

        public async Task<RevenueResult> GetRevenue(int dealerId, string from, string to)
        {
            using var conn = GetConnection();

            var total = await conn.QuerySingleAsync<decimal>(@"
                SELECT COALESCE(SUM(SaleAmount), 0) FROM Sales
                WHERE DealerId = @DealerId AND Status != 'Cancelled'
                  AND SaleDate >= @From AND SaleDate <= @To",
                new { DealerId = dealerId, From = from, To = to });

            var thisMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)
                                     .ToString("yyyy-MM-dd");

            var thisMonth = await conn.QuerySingleAsync<decimal>(@"
                SELECT COALESCE(SUM(SaleAmount), 0) FROM Sales
                WHERE DealerId = @DealerId AND Status != 'Cancelled'
                  AND SaleDate >= @Start",
                new { DealerId = dealerId, Start = thisMonthStart });

            var totalSales = await conn.QuerySingleAsync<int>(@"
                SELECT COUNT(*) FROM Sales
                WHERE DealerId = @DealerId AND Status != 'Cancelled'
                  AND SaleDate >= @From AND SaleDate <= @To",
                new { DealerId = dealerId, From = from, To = to });

            var averageSale = totalSales > 0 ? Math.Round(total / totalSales, 2) : 0;

            return new RevenueResult
            {
                Total = total,
                ThisMonth = thisMonth,
                TotalSales = totalSales,
                AverageSale = averageSale,
            };
        }

        public async Task<IEnumerable<TopBrandResult>> GetTopBrands(int dealerId)
        {
            using var conn = GetConnection();
            return await conn.QueryAsync<TopBrandResult>(@"
                SELECT ca.Make AS Brand, COUNT(*) AS Count,
                       COALESCE(SUM(s.SaleAmount), 0.0) AS Revenue
                FROM Cars ca
                LEFT JOIN Sales s ON s.CarId = ca.Id AND s.Status != 'Cancelled'
                WHERE ca.DealerId = @DealerId
                GROUP BY ca.Make
                ORDER BY Revenue DESC
                LIMIT 10",
                new { DealerId = dealerId });
        }

        public async Task<StockSummaryResult> GetStockSummary(int dealerId)
        {
            using var conn = GetConnection();

            var totalModels = await conn.QuerySingleAsync<int>(
                "SELECT COUNT(*) FROM Cars WHERE DealerId = @DealerId",
                new { DealerId = dealerId });

            var totalUnits = await conn.QuerySingleAsync<int>(
                "SELECT COALESCE(SUM(Stock), 0) FROM Cars WHERE DealerId = @DealerId",
                new { DealerId = dealerId });

            var outOfStock = await conn.QuerySingleAsync<int>(
                "SELECT COUNT(*) FROM Cars WHERE DealerId = @DealerId AND Stock = 0",
                new { DealerId = dealerId });

            decimal inventoryValue = 0;
            try
            {
                inventoryValue = await conn.QuerySingleAsync<decimal>(
                    "SELECT COALESCE(SUM(Stock * Price), 0) FROM Cars WHERE DealerId = @DealerId",
                    new { DealerId = dealerId });
            }
            catch { /* Price column may not exist yet */ }

            return new StockSummaryResult
            {
                TotalModels = totalModels,
                TotalUnits = totalUnits,
                OutOfStockCount = outOfStock,
                InventoryValue = inventoryValue,
            };
        }
    }
}