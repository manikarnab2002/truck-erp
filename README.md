# Truck ERP

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

## React Compiler

Truck ERP is a React and Vite operations dashboard for managing a transport fleet. It provides screens for fleet records, drivers, fuel usage, deliveries, maintenance work orders, and income reporting, with MongoDB-backed API handlers for the operational records.

## Features

- Login screen with CAPTCHA, failed-attempt tracking, and session-based route protection.
- Dashboard overview with fleet, driver, fuel, delivery-readiness, and service-workload indicators.
- Fleet management: list, search, add, and delete trucks.
- Driver management: list, search/filter, add, and delete drivers.
- Fuel logs: record fuel purchases, search logs, and delete entries.
- Daily deliveries: record routes, cargo, payments, expenses, and calculated net income.
- Maintenance: create and filter work orders using the current in-memory sample data.
- Income report: filter sample delivery income by date and truck, view totals/charts, and export CSV data.
- Responsive dashboard layout with sidebar navigation, modals, tables, icons, and Recharts visualizations.

## Technology Stack

### Frontend

- React 19
- Vite 8
- React Router 7
- Recharts 3
- Lucide React icons
- TanStack React Table
- Axios (available for shared API use)

### Backend and data

- Node.js
- Express 4
- MongoDB Node.js driver
- MongoDB database named `truck_erp`
- CORS and dotenv

## Project Structure

```text
truck-erp/
├── api/                    # MongoDB-backed handler modules used by Vite and deployments
│   ├── deliveries.js
│   ├── drivers.js
│   ├── fuel.js
│   ├── income.js
│   ├── maintenance.js
│   └── trucks.js
├── backend/
│   ├── .env                # Local backend secrets; ignored by Git
│   ├── package.json
│   └── server.js           # Standalone Express server
├── lib/mongodb.js          # Shared MongoDB client for API handlers
├── public/                 # Static assets
├── src/
│   ├── components/         # Layout, navigation, forms, and modal components
│   ├── pages/              # Dashboard pages
│   ├── App.jsx
│   ├── routes.jsx
│   ├── App.css
│   └── index.css
├── index.html
├── vite.config.js          # React/Vite config and local API middleware
└── package.json
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB deployment or local MongoDB instance

## Configuration

The MongoDB connection string is read from `MONGODB_URI`. The standalone Express server also reads `PORT`, defaulting to `5000`.

Create or update `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
PORT=5000
```

The Vite development server loads environment variables from the project root, while the standalone backend loads them from `backend/.env`. If using the Vite local API middleware, make the same `MONGODB_URI` available in a root `.env` file as well:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

Never commit either `.env` file or real credentials. The repository ignores environment files by default.

## Installation

Install frontend dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

## Running Locally

### Frontend with Vite local API handlers

From the repository root, after configuring the root `.env`:

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

The Vite configuration mounts the handlers in `api/` under `/api`, so requests such as `/api/drivers` and `/api/deliveries` are handled by the local development server.

### Standalone Express backend

From the repository root:

```bash
npm --prefix backend run dev
```

Or start it without nodemon:

```bash
npm --prefix backend start
```

The standalone API starts on `http://localhost:5000` by default. Its health endpoint is:

```text
GET http://localhost:5000/
```

It returns `{ "success": true, "message": "Truck ERP API is running" }` when MongoDB is connected and the server is running.

## Frontend Routes

All routes except `/login` require the `truckErpSession` value in `sessionStorage`.

| Route             | Screen                           |
| ----------------- | -------------------------------- |
| `/login`          | Login and CAPTCHA                |
| `/`               | Dashboard                        |
| `/dashboard`      | Dashboard                        |
| `/daily-delivery` | Daily delivery entry and records |
| `/fleet`          | Fleet management                 |
| `/maintenance`    | Maintenance and repairs          |
| `/drivers`        | Driver management                |
| `/fuel`           | Fuel logs and consumption        |
| `/income-report`  | Income report                    |
| `/logout`         | Logout confirmation modal        |

## API Endpoints

The frontend calls these endpoints with relative `/api` URLs. The Vite handlers support the methods below.

| Endpoint                                       | Methods       | Purpose                                        |
| ---------------------------------------------- | ------------- | ---------------------------------------------- |
| `/api/drivers`                                 | `GET`, `POST` | List and create drivers                        |
| `/api/drivers?id=<id>`                         | `DELETE`      | Delete a driver by generated driver ID         |
| `/api/trucks`                                  | `GET`, `POST` | List and create trucks                         |
| `/api/trucks?id=<id>`                          | `DELETE`      | Delete a truck by MongoDB ObjectId             |
| `/api/fuel`                                    | `GET`, `POST` | List and create fuel logs                      |
| `/api/fuel?id=<id>`                            | `DELETE`      | Delete a fuel log by generated log ID          |
| `/api/deliveries`                              | `GET`, `POST` | List and create delivery records               |
| `/api/deliveries?id=<id>`                      | `DELETE`      | Delete a delivery by MongoDB ObjectId          |
| `/api/maintenance`                             | `GET`, `POST` | List and create maintenance work orders        |
| `/api/maintenance?id=<id>`                     | `DELETE`      | Delete a work order by generated work-order ID |
| `/api/income?startDate=&endDate=&truckNumber=` | `GET`         | Filter and aggregate delivery income           |

Successful create operations return a JSON object containing `success`, `message`, and usually `data`. Validation failures generally return HTTP `400`; duplicate driver licenses or truck registration numbers return HTTP `409`; missing records return HTTP `404`.

## MongoDB Collections

The application uses the `truck_erp` database and these collections:

- `drivers`: driver identity, license, assignment, status, and timestamps.
- `trucks`: registration, model/type, assigned driver, mileage, service date, status, and timestamps.
- `fuelLogs`: truck, driver, liters, cost, odometer, mileage, station, date, and timestamps.
- `deliveries`: route, vehicle/driver, cargo, payment, expenses, calculated due amount, total expense, and net income.
- `workOrders`: truck, service type, mechanic, priority, cost, start date, status, and timestamps.

## Available Scripts

### Root scripts

| Command                        | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `npm run dev`                  | Start Vite development server with local API middleware |
| `npm run build`                | Create a production frontend build in `dist/`           |
| `npm run preview`              | Preview the production frontend build                   |
| `npm run lint`                 | Run ESLint across the project                           |
| `npm --prefix backend start`   | Start the Express backend                               |
| `npm --prefix backend run dev` | Start the Express backend with nodemon                  |

### Backend directory scripts

From `backend/`, `npm start` starts Express and `npm run dev` starts it with nodemon.

## Verification

Run the project checks from the repository root:

```bash
npm run lint
npm run build
```

## Current Limitations and Production Notes

- Authentication is client-side only. The valid login values are currently hardcoded in `src/pages/Login.jsx`; replace this with server-side authentication before production use.
- The CAPTCHA and login-attempt limit are browser-side controls and are not a security boundary.
- Maintenance and income-report screens currently initialize from sample data in the React components. The corresponding API handlers exist, but these screens are not yet connected to them.
- The repository contains both Vite API handlers and a standalone Express implementation. Keep their request and identifier behavior aligned when changing the API.
- The standalone Express server currently implements health, driver, truck, fuel, and delivery routes. The Vite handler path also exposes maintenance and income handlers.
- No automated test suite is currently defined in `package.json`.
- Add authentication/authorization, request validation, rate limiting, structured logging, database indexes, and deployment-specific environment configuration before exposing the application publicly.

## License

No license file is currently included in this repository.
