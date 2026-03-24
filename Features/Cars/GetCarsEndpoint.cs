using CarStockAPI.Models;
using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Cars
{
    public class ListCarsEndpoint : EndpointWithoutRequest<IEnumerable<Car>>
    {
        private readonly CarRepository _repo;

        public ListCarsEndpoint(CarRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Get("/api/cars");
        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            // Enhancement: Authenticate dealer using JWT Token (contains DealerID)
            int dealerId = int.Parse(User.FindFirst("dealerId")!.Value); ;
            var cars = await _repo.GetAll(dealerId);
            if (!cars.Any())
            {
                await Send.NotFoundAsync();
                return;
            }

            await Send.OkAsync(cars);
        }
    }
}
