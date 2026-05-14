using Dapper;
using FastEndpoints;
using Microsoft.Data.Sqlite;

namespace CarStockAPI.Features.Analytics
{
    public class GetRevenueRequest
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
    }

    public class GetRevenueEndpoint : Endpoint<GetRevenueRequest>
    {
        private readonly IConfiguration _config;
        public GetRevenueEndpoint(IConfiguration config) { _config = config; }

        public override void Configure() { Get("/api/analytics/revenue"); }

        public override async Task HandleAsync(GetRevenueRequest req, CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            using var conn = new SqliteConnection(_config.GetConnectionString("DefaultConnection"));

            var now = DateTime.UtcNow;
            var start = new DateTime(now.Year, now.Month, 1);

            var total = await conn.QuerySingleAsync<decimal>(
                "SELECT COALESCE(SUM(SaleAmount),0) FROM Sales WHERE DealerId=@DealerId AND Status!='Cancelled'",
                new { DealerId = dealerId });

            var thisMonth = await conn.QuerySingleAsync<decimal>(
                "SELECT COALESCE(SUM(SaleAmount),0) FROM Sales WHERE DealerId=@DealerId AND Status!='Cancelled' AND SaleDate >= @Start",
                new { DealerId = dealerId, Start = start.ToString("yyyy-MM-dd") });

            var totalSales = await conn.QuerySingleAsync<int>(
                "SELECT COUNT(*) FROM Sales WHERE DealerId=@DealerId AND Status!='Cancelled'",
                new { DealerId = dealerId });

            var avgSale = totalSales > 0 ? total / totalSales : 0;

            await Send.OkAsync(new
            {
                Total = total,
                ThisMonth = thisMonth,
                TotalSales = totalSales,
                AverageSale = Math.Round(avgSale, 2),
            });
        }
    }
}