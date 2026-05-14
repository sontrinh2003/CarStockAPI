using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Dashboard
{
    public class GetDashboardSummaryRequest
    {
        public int LowStockThreshold { get; set; } = 3;
    }

    public class GetDashboardSummaryEndpoint : Endpoint<GetDashboardSummaryRequest>
    {
        private readonly DashboardRepository _repo;
        public GetDashboardSummaryEndpoint(DashboardRepository repo) { _repo = repo; }

        public override void Configure() { Get("/api/dashboard/summary"); }

        public override async Task HandleAsync(GetDashboardSummaryRequest req, CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var summary = await _repo.GetSummary(dealerId, req.LowStockThreshold);
            await Send.OkAsync(summary);
        }
    }
}