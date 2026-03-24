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

```
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
```


---

## Database

- Uses SQLite database stored at `Database/cars.db`
- Database schema and seed data are in `init.sql`

---

## Testing the API

1. Running the API

Ensure .NET 9 SDK is installed.

Restore packages:

```
dotnet restore
```

Build the project:

```
dotnet build
```

Run the project:

```
dotnet run
```


The API will be available at:

http://localhost:8080/swagger


2. Login to get Token

POST `/api/login`

This sample credentials can be used:

```
{
  "username": "citymotors",
  "password": "password1"
}
```

Response:

```
{
  "token": "<JWT_TOKEN>"
}
```

Save this token for API interactions.

3. Use the token for all protected endpoints in the Authorization header:

Authorization: Bearer <JWT_TOKEN>

| Method | Endpoint                      | Description                                 |
| ------ | ----------------------------- | ------------------------------------------- |
| GET    | /api/cars                     | List all cars for the logged-in dealer      |
| POST   | /api/cars                     | Add a new car for the logged-in dealer      |
| PUT    | /api/cars/{id}/stock          | Update stock for a car (owned by dealer)    |
| DELETE | /api/cars/{id}                | Delete a car (owned by dealer)              |
| GET    | /api/cars/search?make=&model= | Search cars by make and model (dealer only) |


**Notes**

All endpoints require JWT authentication except /api/login

Database file must exist before running the API