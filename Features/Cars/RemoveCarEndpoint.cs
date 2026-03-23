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
            AllowAnonymous();
            // Enhancement: Authenticate dealer using JWT Token (contains DealerID)
        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var id = Route<int>("id");
            int dealerId = 1; // replace with JWT claim

            await _repo.Delete(id, dealerId);
            await Send.OkAsync();
        }
    }
}
