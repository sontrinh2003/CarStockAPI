using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Dashboard
{
    public class GetDashboardSummaryEndpoint : EndpointWithoutRequest
    {
        private readonly DashboardRepository _repo;

        public GetDashboardSummaryEndpoint(DashboardRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Get("/api/dashboard/summary");
        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);

            // Read threshold from query string manually, default to 3
            var thresholdStr = HttpContext.Request.Query["lowStockThreshold"].FirstOrDefault();
            var threshold = int.TryParse(thresholdStr, out var t) ? t : 3;

            var summary = await _repo.GetSummary(dealerId, threshold);
            await Send.OkAsync(summary);
        }
    }
}