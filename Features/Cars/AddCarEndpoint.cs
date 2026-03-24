using FastEndpoints;
using CarStockAPI.Models;
using CarStockAPI.Repositories;

namespace CarStockAPI.Features.Cars
{
    public class AddCarRequest
    {
        public string Make { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public int Stock { get; set; }
    }

    public class AddCarEndpoint : Endpoint<AddCarRequest>
    {
        private readonly CarRepository _repo;

        public AddCarEndpoint(CarRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Post("/api/cars");
            AllowAnonymous();
            // Enhancement: Authenticate dealer using JWT Token (contains DealerID)
        }

        public override async Task HandleAsync(AddCarRequest req, CancellationToken ct)
        {
            if (req.Make is null)
            {
                AddError(r => r.Make, "Make cannot be empty");
                await Send.ErrorsAsync();
                return;
            }
            if (req.Model is null)
            {
                AddError(r => r.Make, "Model cannot be empty");
                await Send.ErrorsAsync();
                return;
            }

            var car = new Car
            {
                DealerId = 1,
                Make = req.Make,
                Model = req.Model,
                Year = req.Year,
                Stock = req.Stock
            };

            await _repo.Add(car);
            await Send.OkAsync();
        }
    }
}
