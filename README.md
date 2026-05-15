# Car Dealership Platform

Full-stack dealership management system.

| Layer | Stack |
|---|---|
| Backend | ASP.NET Core · FastEndpoints · Dapper · SQLite |
| Frontend | React · Vite |

## Getting started

```bash
git clone https://github.com/sontrinh2003/CarDealershipPlatform.git
cd CarDealershipPlatform
```

**Backend** (terminal 1)
```bash
cd carstockapi-backend
dotnet restore
dotnet run
# → http://localhost:8080
```

**Frontend** (terminal 2)
```bash
cd react-frontend
npm install
npm run dev
# → http://localhost:5173
```

## Structure
```
carstockapi-backend/    ASP.NET Core API (FastEndpoints · Dapper · SQLite)
react-frontend/   React SPA (Vite)
```