# Truck ERP

A modern, full-stack Fleet Management and Logistics Operations ERP built with **React 19**, **Vite 8**, **Tailwind CSS**, and **MongoDB**. Truck ERP provides end-to-end management for transport logistics: dispatching daily deliveries, tracking round-trip freight, monitoring fleet vehicles, managing drivers, logging fuel consumption, handling staff payroll/advances, and generating comprehensive financial profit-and-loss reports.

---

## Key Features

### 1. Authentication & Route Protection
- **Session-Based Guarding**: Route guard (`ProtectedLayout`) checks `sessionStorage.truckErpSession` before granting access to dashboard views.
- **Dynamic Security CAPTCHA**: Visual math/alphanumeric challenge to deter automated logins.
- **Lockout Prevention**: Tracks consecutive failed login attempts with progressive cool-down logic.
- **Logout Confirmation**: Safe modal dialogue preventing accidental session termination.

### 2. Operations Overview Dashboard
- **Live Fleet Telemetry**: Real-time KPI summary cards displaying Total Trucks, Active Drivers, Fuel Logs, and Completed Deliveries.
- **Financial Analytics Visualizer**: Interactive Recharts-powered 6-month historical trend charts displaying Freight Revenue, Operational Expenses, and Net Profit.

### 3. Daily Deliveries & Round-Trip Dispatch
- **Two-Way Route Tracking**: Capture both outbound (**Going**) and return (**Coming**) journeys with distinct dates, source, destination, cargo material, and weight tonnage.
- **Detailed Financial Accounting**:
  - **Delivery Cost (Gross Income)**
  - **Advance Paid / Received Amount**
  - **Due / Outstanding Amount** with inline editing (`PATCH`) and instant recalculation.
  - **Itemized Expenses**: Fuel, Toll, Maintenance, Urea (DEF), and Extra Costs with descriptive notes.
- **Automated Profit Formula**:
  $$\text{Total Expense} = \text{Fuel} + \text{Toll} + \text{Maintenance} + \text{Urea} + \text{Extra}$$
  $$\text{Received Amount} = \text{Delivery Cost} - \text{Due Amount}$$
  $$\text{Net Profit} = \text{Received Amount} - \text{Total Expense}$$
- **Data Export**: Export delivery log tables directly into `.csv`.

### 4. Fleet Management
- **Full CRUD Capabilities**: Add, edit (`PUT`), search, filter, and delete (`DELETE`) trucks.
- **Vehicle Profiles**: Tracks Registration Number, Model, Vehicle Type (Trailer, Container, Flatbed, Tanker, etc.), Assigned Driver, Odometer Mileage, Registration Date, and Operational Status.
- **Live Driver Association**: Dynamic dropdown selecting from registered, active drivers.
- **Data Export**: Single-click CSV export of fleet inventories.

### 5. Driver Management
- **Full CRUD Capabilities**: Add, edit (`PUT`), filter by status (Active, Inactive, On Duty), search, and delete (`DELETE`) drivers.
- **Driver Records**: Name, Phone Number, License Number (with duplicate conflict checks), Driving Experience, Assigned Truck, and Availability Status.
- **Data Export**: CSV export of driver rosters.

### 6. Fuel Logs & Consumption Monitoring
- **Full CRUD Capabilities**: Add, edit (`PUT`), search, and delete (`DELETE`) fueling entries.
- **Log Metrics**: Truck Registration, Driver Name, Liters Filled, Total Cost, Fuel Station, Transaction Date, and Odometer Mileage readings.
- **Data Export**: CSV export of historical fuel purchases.

### 7. Staff Payments & Payroll
- **Disbursement Records**: Track salary disbursements, advance cash, trip allowances, and bonuses for drivers and helpers.
- **Payment Details**: Truck registration association, staff classification, payment method (Cash, Bank Transfer, UPI, Cheque), month/year tags, and transaction notes.
- **Financial Breakdown**: Real-time total payouts and CSV reporting.

### 8. Income & Profitability Reporting
- **Multi-Factor Filtering**: Filter delivery revenues and operating expenses by Custom Date Range (`startDate` to `endDate`) and specific Truck Registration Number.
- **Consolidated Financials**: Real-time aggregation of Gross Delivery Income, Realized Cash Received, Pending Receivables (Dues), Total Trip Expenses, and Net Operating Profit.
- **Detailed Inspection Modal**: View complete trip manifests, cargo details, and expense breakdowns for any individual delivery.
- **Connected Architecture**: Backed directly by `/api/income` and `/api/staff-payments`.

### 9. Maintenance & Work Orders
- **Work Order Management**: Create, search, and track repairs by Truck Number, Service Type (Engine Overhaul, Brake Replacement, Oil Change, etc.), Assigned Mechanic, Priority (High, Medium, Low), Estimated Cost, and Status (Queued, In Progress, Completed, Pending Parts).

---

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend UI** | [React 19](https://react.dev/), [Vite 8](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Visualization & Icons** | [Recharts 3](https://recharts.org/), [Lucide React](https://lucide.dev/) |
| **Data Tables** | [TanStack React Table](https://tanstack.com/table) |
| **Backend Options** | • **Vite Local API Middleware** (Integrated dev proxy)<br>• **Vercel Serverless Functions** (`/api` directory)<br>• **Standalone Express 4 Backend** (`backend/server.js`) |
| **Database** | [MongoDB](https://www.mongodb.com/) (Node.js Driver `^7.6.0`, connection pooling) |
| **Utilities** | Axios, Dotenv, CORS |

---

## Project Structure

```text
truck-erp/
├── api/                    # Serverless & Vite API route handlers (MongoDB-backed)
│   ├── deliveries.js       # GET, POST, PATCH (due update), DELETE
│   ├── drivers.js          # GET, POST, PUT, DELETE
│   ├── fuel.js             # GET, POST, PUT, DELETE
│   ├── income.js           # GET (filtered income & expense aggregation)
│   ├── maintenance.js      # GET, POST, DELETE
│   ├── staff-payments.js   # GET, POST, DELETE
│   └── trucks.js           # GET, POST, PUT, DELETE
├── backend/                # Standalone Express 4 application
│   ├── .env                # Backend environment configuration (git-ignored)
│   ├── package.json        # Express dependencies (express, cors, dotenv, mongodb)
│   └── server.js           # Standalone HTTP REST server on port 5000
├── lib/
│   └── mongodb.js          # Shared MongoDB client with global promise caching
├── public/                 # Static public assets
├── src/
│   ├── components/         # Reusable UI modals, navigation, and layout
│   │   ├── AddDriverModal.jsx
│   │   ├── AddFuelModal.jsx
│   │   ├── AddTruckModal.jsx
│   │   ├── AddWorkOrderModal.jsx
│   │   ├── FormGroup.jsx
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   ├── LogoutModal.jsx
│   │   └── Sidebar.jsx
│   ├── pages/              # Primary dashboard page views
│   │   ├── DailyDelivery.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Drivers.jsx
│   │   ├── Fleet.jsx
│   │   ├── Fuel.jsx
│   │   ├── IncomeReport.jsx
│   │   ├── Login.jsx
│   │   ├── Maintenance.jsx
│   │   └── Stuff_payment.jsx
│   ├── utils/              # Client-side helper utilities
│   │   ├── apiResponse.js  # Safe JSON parsing & API fetch helpers
│   │   └── exportCsv.js    # Browser-side CSV generation & download
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── routes.jsx          # Route declarations and session auth protection
├── index.html
├── package.json            # Root frontend dependencies & build scripts
├── vercel.json             # Vercel deployment rewrite rules
└── vite.config.js          # Vite configuration with built-in /api middleware
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: A running MongoDB instance (local or MongoDB Atlas connection string)

---

### Configuration (.env)

#### 1. Root Environment (for Vite Development Server & Local API)
Create a `.env` file in the project root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/truck_erp?retryWrites=true&w=majority
```

#### 2. Standalone Backend Environment (Optional)
If running the standalone Express server (`backend/server.js`), create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/truck_erp?retryWrites=true&w=majority
```

> **Security Reminder**: Never commit `.env` files to version control. Both `.env` and `backend/.env` are ignored by `.gitignore`.

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manikarnab2002/truck-erp.git
   cd truck-erp
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Install standalone backend dependencies** *(optional, only if using standalone Express)*:
   ```bash
   npm --prefix backend install
   ```

---

### Running the Application

You can run the application in two different modes:

#### Option A: Vite Development Server with Integrated API (Recommended)
Vite's built-in development middleware automatically binds the route handlers in `api/` to `/api/*`:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`. Requests to `/api/trucks`, `/api/drivers`, etc., are processed directly against MongoDB via `api/*.js`.

#### Option B: Standalone Express API + Vite Frontend
1. **Start the Express API server**:
   ```bash
   npm --prefix backend run dev
   ```
   *(Server starts on `http://localhost:5000`)*

2. **In a separate terminal, start the frontend**:
   ```bash
   npm run dev
   ```

---

## Frontend Routes

All dashboard routes are guarded by `sessionStorage.truckErpSession`:

| Path | View Component | Description |
| --- | --- | --- |
| `/login` | `Login.jsx` | Login form with CAPTCHA and attempt locking |
| `/` or `/dashboard` | `Dashboard.jsx` | Fleet metrics, statistics, and monthly revenue chart |
| `/daily-delivery` | `DailyDelivery.jsx` | Dispatch manifests, round trips, expenses, and dues |
| `/fleet` | `Fleet.jsx` | Truck registration, driver assignments, and vehicle list |
| `/drivers` | `Drivers.jsx` | Driver roster, contact info, license validation, and status |
| `/fuel` | `Fuel.jsx` | Fuel intake logs, mileage tracking, and station records |
| `/stuff-payment` | `Stuff_payment.jsx` | Staff payroll, helper wages, allowances, and advances |
| `/income-report` | `IncomeReport.jsx` | Financial income/expense reports with date & truck filters |
| `/maintenance` | `Maintenance.jsx` | Vehicle repair logs, work orders, and service statuses |
| `/logout` | `LogoutModal.jsx` | Session termination dialogue |

---

## REST API Reference

The application supports both query parameter identifier formatting (`?id=<id>`) and path parameter formatting (`/:id`).

### Trucks (`/api/trucks`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/trucks` | Retrieve all registered trucks (sorted by creation date) |
| `POST` | `/api/trucks` | Register a new truck (requires unique registration number) |
| `PUT` | `/api/trucks?id=<id>` or `/:id` | Update truck details (model, type, driver, status) |
| `DELETE` | `/api/trucks?id=<id>` or `/:id` | Remove a truck record |

### Drivers (`/api/drivers`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/drivers` | Retrieve all drivers |
| `POST` | `/api/drivers` | Register a new driver (requires unique license number) |
| `PUT` | `/api/drivers?id=<id>` or `/:id` | Update driver details (phone, status, assigned truck) |
| `DELETE` | `/api/drivers?id=<id>` or `/:id` | Remove a driver record |

### Fuel Logs (`/api/fuel`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/fuel` | Retrieve all fuel purchase logs |
| `POST` | `/api/fuel` | Record a new fuel purchase |
| `PUT` | `/api/fuel?id=<id>` or `/:id` | Update an existing fuel log |
| `DELETE` | `/api/fuel?id=<id>` or `/:id` | Delete a fuel log entry |

### Deliveries (`/api/deliveries`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/deliveries` | Retrieve all delivery manifests |
| `POST` | `/api/deliveries` | Create a delivery entry with round-trip routes & costs |
| `PATCH` | `/api/deliveries?id=<id>` or `/:id` | Update due amount and automatically recalculate `net_profit` |
| `DELETE` | `/api/deliveries?id=<id>` or `/:id` | Remove a delivery record |

### Staff Payments (`/api/staff-payments`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/staff-payments` | List all staff wage and advance payments |
| `POST` | `/api/staff-payments` | Record a salary, advance, or bonus disbursement |
| `DELETE` | `/api/staff-payments?id=<id>` or `/:id` | Remove a staff payment record |

### Income & Reports (`/api/income`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/income?startDate=&endDate=&truckNumber=` | Filter delivery revenues, calculate totals, and return aggregate analytics |

### Maintenance (`/api/maintenance`)
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/maintenance` | Retrieve all maintenance work orders |
| `POST` | `/api/maintenance` | Create a new maintenance work order |
| `DELETE` | `/api/maintenance?id=<id>` or `/:id` | Remove a work order |

---

## MongoDB Database Schema

The database (`truck_erp`) organizes data into the following collections:

- **`trucks`**: Registration number (`regNo`), model, vehicle type, assigned driver, odometer, service date, status, and timestamps.
- **`drivers`**: Full name, contact phone, license number (`licenseNo`), experience, assigned vehicle, status, and timestamps.
- **`deliveries`**: Outbound (going) and return (coming) trip dates, routes, material, cargo tonnage, gross delivery cost, advance received, due amount, itemized expenses (fuel, toll, maintenance, urea, extra costs with notes), total expense, and calculated `net_profit`.
- **`fuelLogs`**: Truck number, driver name, fuel quantity in liters, total cost, odometer reading, fueling station, purchase date, and timestamps.
- **`staff_payments`**: Truck registration, staff type (Driver/Helper), payment classification (Salary, Advance, Allowance, Bonus), amount, payment method, date, month, year, and notes.
- **`workOrders`**: Truck registration, service type, technician/mechanic, priority level, estimated cost, start date, status, and timestamps.

---

## Available NPM Scripts

### Root Directory
| Command | Description |
| --- | --- |
| `npm run dev` | Launch the Vite development server with local `/api` middleware |
| `npm run build` | Compile and bundle production assets into `dist/` |
| `npm run preview` | Locally preview the compiled production build |
| `npm run lint` | Execute ESLint across all source files |

### Backend Directory (`backend/`)
| Command | Description |
| --- | --- |
| `npm --prefix backend start` | Start the Express API server with `node server.js` |
| `npm --prefix backend run dev` | Start the Express API server with live reloading via `nodemon` |

---

## Deployment

### Deploying to Vercel
1. Push your code to your GitHub repository.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Under **Project Settings > Environment Variables**, configure:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
4. Deploy. Vercel automatically detects Vite, sets output to `dist/`, routes `/api/*` to serverless function handlers in `api/`, and applies client-side routing rewrites from `vercel.json`.

---

## License

This project is licensed under the [ISC License](LICENSE) (or see repository settings).
