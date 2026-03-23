using FastEndpoints;
using CarStockAPI.Repositories;

namespace CarStockAPI.Features.Cars
{
    public class ListCarsEndpoint : EndpointWithoutRequest
    {
        private readonly CarRepository _repo;

        public ListCarsEndpoint(CarRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Get("/api/cars");
            // Enhancement: Authenticate dealer using JWT Token (contains DealerID)
        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            int dealerId = 1; // replace with JWT claim
            var cars = await _repo.GetAll(dealerId);
            await SendAsync(cars);
        }
    }
}
