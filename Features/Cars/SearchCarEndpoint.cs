using FastEndpoints;
using CarStockAPI.Repositories;

namespace CarStockAPI.Features.Cars
{
    public class SearchCarsRequest
    {
        public string? Make { get; set; }
        public string? Model { get; set; }
    }

    public class SearchCarsEndpoint : Endpoint<SearchCarsRequest>
    {
        private readonly CarRepository _repo;

        public SearchCarsEndpoint(CarRepository repo)
        {
            _repo = repo;
        }

        public override void Configure()
        {
            Get("/api/cars/search");
        }

        public override async Task HandleAsync(SearchCarsRequest req, CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);

            var make = req.Make ?? string.Empty;
            var model = req.Model ?? string.Empty;

            var results = await _repo.Search(dealerId, make, model);

            if (results is null)
                await Send.NotFoundAsync();
            else
                await Send.OkAsync(results);
        }
    }
}
