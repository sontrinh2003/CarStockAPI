using CarStockAPI.Repositories;
using FastEndpoints;

namespace CarStockAPI.Features.Customers
{
    public class DeleteCustomerEndpoint : EndpointWithoutRequest
    {
        private readonly CustomerRepository _repo;
        public DeleteCustomerEndpoint(CustomerRepository repo) { _repo = repo; }

        public override void Configure()
        {
            Delete("/api/customers/{id}");
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