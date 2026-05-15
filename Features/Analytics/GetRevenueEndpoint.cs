using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Analytics
{
    public class GetRevenueEndpoint : EndpointWithoutRequest
    {
        private readonly AnalyticsRepository _repo;

        public GetRevenueEndpoint(AnalyticsRepository repo) { _repo = repo; }

        public override void Configure() { Get("/api/analytics/revenue"); }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var from = HttpContext.Request.Query["from"].FirstOrDefault()
                           ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM-dd");
            var to = HttpContext.Request.Query["to"].FirstOrDefault()
                           ?? DateTime.UtcNow.ToString("yyyy-MM-dd");

            var result = await _repo.GetRevenue(dealerId, from, to);
            await Send.OkAsync(result);
        }
    }
}