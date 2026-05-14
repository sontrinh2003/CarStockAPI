using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Customers
{
    public class GetCustomersEndpoint : EndpointWithoutRequest
    {
        private readonly CustomerRepository _repo;
        public GetCustomersEndpoint(CustomerRepository repo) { _repo = repo; }

        public override void Configure()
        {
            Get("/api/customers");
            // Add Roles("dealer") or Policies as needed — matches your existing auth pattern
        }

        public override async Task HandleAsync(CancellationToken ct)
        {
            var dealerId = int.Parse(User.FindFirst("dealerId")!.Value);
            var customers = await _repo.GetAll(dealerId);

            if (!customers.Any()) { await Send.NotFoundAsync(); return; }
            await Send.OkAsync(customers);
        }
    }
}