using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Analytics
{
    public class GetStockSummaryEndpoint : EndpointWithoutRequest
    {
        private readonly AnalyticsRepository _repo;

        public GetStockSummaryEndpoint(AnalyticsRepository repo) { _repo = repo; }

        public override void Configure() { Get("/api/analytics/stockSummary"); }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var result = await _repo.GetStockSummary(dealerId);
            await Send.OkAsync(result);
        }
    }
}