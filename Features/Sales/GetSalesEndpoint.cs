using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Sales
{
    public class GetSalesEndpoint : EndpointWithoutRequest
    {
        private readonly SalesRepository _repo;
        public GetSalesEndpoint(SalesRepository repo) { _repo = repo; }

        public override void Configure() { Get("/api/sales"); }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var sales = await _repo.GetAll(dealerId);
            await Send.OkAsync(sales);
        }
    }
}