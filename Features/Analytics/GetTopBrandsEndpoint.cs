using Dapper;
using FastEndpoints;
using Microsoft.Data.Sqlite;

namespace CarStockAPI.Features.Analytics
{
    public class GetTopBrandsEndpoint : EndpointWithoutRequest
    {
        private readonly IConfiguration _config;
        public GetTopBrandsEndpoint(IConfiguration config) { _config = config; }

        public override void Configure() { Get("/api/analytics/topBrands"); }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            using var conn = new SqliteConnection(_config.GetConnectionString("DefaultConnection"));

            var brands = await conn.QueryAsync(@"
                SELECT ca.Make AS Brand, COUNT(*) AS Count,
                       COALESCE(SUM(s.SaleAmount), 0) AS Revenue
                FROM Cars ca
                LEFT JOIN Sales s ON s.CarId = ca.Id AND s.Status != 'Cancelled'
                WHERE ca.DealerId = @DealerId
                GROUP BY ca.Make ORDER BY Revenue DESC LIMIT 10",
                new { DealerId = dealerId });

            await Send.OkAsync(brands);
        }
    }
}