using Dapper;
using FastEndpoints;
using Microsoft.Data.Sqlite;

namespace CarStockAPI.Features.Analytics
{
    public class GetStockSummaryEndpoint : EndpointWithoutRequest
    {
        private readonly IConfiguration _config;
        public GetStockSummaryEndpoint(IConfiguration config) { _config = config; }

        public override void Configure() { Get("/api/analytics/stockSummary"); }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            using var conn = new SqliteConnection(_config.GetConnectionString("DefaultConnection"));

            var totalModels = await conn.QuerySingleAsync<int>("SELECT COUNT(*) FROM Cars WHERE DealerId=@DealerId", new { DealerId = dealerId });
            var totalUnits = await conn.QuerySingleAsync<int>("SELECT COALESCE(SUM(Stock),0) FROM Cars WHERE DealerId=@DealerId", new { DealerId = dealerId });
            var outOfStock = await conn.QuerySingleAsync<int>("SELECT COUNT(*) FROM Cars WHERE DealerId=@DealerId AND Stock=0", new { DealerId = dealerId });

            // Only available if Cars has a Price column — returns 0 if no Price col
            decimal invValue = 0;
            try
            {
                invValue = await conn.QuerySingleAsync<decimal>(
                    "SELECT COALESCE(SUM(Stock * Price), 0) FROM Cars WHERE DealerId=@DealerId",
                    new { DealerId = dealerId });
            }
            catch { }

            await Send.OkAsync(new
            {
                TotalModels = totalModels,
                TotalUnits = totalUnits,
                OutOfStockCount = outOfStock,
                InventoryValue = invValue,
            });
        }
    }
}