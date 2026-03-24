using FastEndpoints;
using CarStockAPI.Repositories;

namespace CarStockAPI.Features.Cars
{
    public class DeleteCarEndpoint : EndpointWithoutRequest
    {
        private readonly CarRepository _repo;

        public DeleteCarEndpoint(CarRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Delete("/api/cars/{id}");
        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var id = Route<int>("id");
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);

            await _repo.Delete(id, dealerId);
            await Send.OkAsync();
        }
    }
}
