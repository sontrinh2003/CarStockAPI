using FastEndpoints;
using CarStockAPI.Repositories;

namespace CarStockAPI.Features.Cars
{
    public class UpdateStockRequest
    {
        public int Stock { get; set; }
    }

    public class UpdateStockEndpoint : Endpoint<UpdateStockRequest>
    {
        private readonly CarRepository _repo;

        public UpdateStockEndpoint(CarRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Put("/api/cars/{id}/stock");
        }

        public override async Task HandleAsync(UpdateStockRequest req, CancellationToken ct)
        {
            var id = Route<int>("id");
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);

            if (req.Stock < 0)
            {
                AddError(r => r.Stock, "Stock cannot be negative");
                await Send.ErrorsAsync();
                return;
            }

            await _repo.UpdateStock(id, dealerId, req.Stock);
            await Send.OkAsync();
        }
    }
}
