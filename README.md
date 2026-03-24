# CarStockAPI

A simple C# Web API for dealers to manage their car stock, built with **FastEndpoints**, **Dapper**, and **SQLite**.  
Supports JWT authentication to ensure each dealer only accesses their own data.

---

## Features

- Add / Remove cars
- List cars and stock levels
- Update car stock level
- Search cars by make and model
- JWT authentication per dealer

---

## Project Structure


CarStockAPI/
│
├─ Features/
│ ├─ Cars/AddCarEndpoint.cs
│ ├─ Cars/GetCarsEndpoint.cs
│ ├─ Cars/RemoveCarEndpoint.cs
│ └─ Cars/UpdateCarEndpoint.cs
│ └─ Cars/UpdateStockEndpoint.cs
│
├─ Auth/LoginEndpint.cs
│
├─ Models/
│ ├─ Car.cs
│ └─ Dealer.cs
│
├─ Repositories/
│ ├─ CarRepository.cs
│ └─ DealerRepository.cs
│
├─ Database/
│ └─ cars.db
│ └─ init.sql
|
├─ Program.cs
├─ appsettings.json


---

## Database

- Uses SQLite database stored at `Database/cars.db`
- Database schema and seed data are in `init.sql`

---

## Testing the API

The API will be available at:

http://localhost:8080/swagger

1. Login to get Token

POST ```/api/login```

This sample credentials can be used:

```
{
  "username": "dealer1",
  "password": "password1"
}
```

Response:

```
{
  "token": "<JWT_TOKEN>"
}
```

Use the token for all protected endpoints in the Authorization header:

Authorization: Bearer <JWT_TOKEN>

# Notes
All endpoints require JWT authentication except /api/login
dealerId is automatically extracted from JWT for all operations
Database folder must exist before running the API