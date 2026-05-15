using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Analytics
{
    public class GetTopBrandsEndpoint : EndpointWithoutRequest
    {
        private readonly AnalyticsRepository _repo;

        public GetTopBrandsEndpoint(AnalyticsRepository repo) { _repo = repo; }

        public override void Configure() { Get("/api/analytics/topBrands"); }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var result = await _repo.GetTopBrands(dealerId);
            await Send.OkAsync(result);
        }
    }
}