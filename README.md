# Judiciary Information System

A MERN stack web application that digitizes the day-to-day operations of a judicial
registry. The system manages **cases**, **hearings**, **judgments**, and **users**
across four role types (admin, judge, lawyer, registrar). It provides a secure
JWT-based authentication flow, role-aware navigation, a statistics dashboard, and
searchable archives — all wrapped in a clean, minimal black/white/gray interface.

Built as a college project submission demonstrating a full-stack CRUD application
with proper auth, RBAC, relational data, and a polished UI.

---

## Tech Stack

| Layer        | Technology                                             |
|--------------|--------------------------------------------------------|
| Frontend     | React 18, Vite, React Router v6, Tailwind CSS         |
| HTTP         | axios (with JWT interceptor)                          |
| Icons        | lucide-react                                           |
| Dates        | date-fns                                               |
| Backend      | Express.js (Node.js 18+)                              |
| Database     | MongoDB via Mongoose                                   |
| Sandbox DB   | mongodb-memory-server (zero-install fallback)         |
| Auth         | JWT + bcryptjs password hashing                        |
| Dev runner   | concurrently (boots server + client together)         |

---

## Features

### Authentication
- Register / Login with JWT
- First registered user auto-promoted to **admin**
- Password hashing (bcryptjs), token persisted in localStorage

### Cases Module
- Create / list / search / filter by type & status / edit / delete
- Assign judge, lawyer, registrar, priority, court room
- Detail page links related hearings and judgment

### Hearings Module
- Schedule hearings, mark as completed/adjourned/cancelled
- Upcoming vs Past sections
- Auto-updates parent case's `nextHearingDate`

### Judgments Module
- One judgment per case (enforced unique)
- Searchable archive by verdict / summary text
- Auto-marks the parent case as "Disposed" when a judgment is recorded

### Users Module (admin only)
- List, edit role/active status, delete
- Protects the last admin account from being removed

### Dashboard
- Stat cards: total cases, open cases, hearings this week, judgments this month
- Next 5 scheduled hearings
- Last 5 filed cases
- Role-aware quick links

---

## Project Structure

```
judiciary-information-system/
├── package.json                  # root scripts (concurrently runs both)
├── README.md
├── .gitignore
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── seed.js                   # npm run seed entry
│   └── src/
│       ├── server.js             # Express app
│       ├── config/db.js          # Mongoose connect (in-memory fallback)
│       ├── models/               # User, Case, Hearing, Judgment
│       ├── controllers/          # auth, case, hearing, judgment, user, dashboard
│       ├── routes/               # 6 route files
│       ├── middleware/           # auth (protect + requireRole), errorHandler
│       └── utils/seed.js         # rich seed data
└── client/
    ├── package.json
    ├── vite.config.js            # proxy /api -> :5000
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx               # routes
        ├── index.css             # Tailwind + theme
        ├── context/AuthContext.jsx
        ├── services/api.js       # axios + interceptors
        ├── utils/constants.js
        ├── components/           # Layout, Sidebar, Topbar, ProtectedRoute,
        │                         # StatusBadge, DataTable, Modal, Card,
        │                         # Button, Input, EmptyState
        └── pages/
            ├── Login, Register, Dashboard, Profile, NotFound
            ├── cases/            # List, Detail, Form
            ├── hearings/         # List, Detail, Form
            ├── judgments/        # Archive, Detail, Form
            └── users/            # UsersList (admin only)
```

---

## Prerequisites

- **Node.js 18+** (uses built-in `node --watch`)
- **npm 9+**
- No external MongoDB install required — the server falls back to
  `mongodb-memory-server` when `MONGODB_URI` is not set.

---

## Setup

```bash
# 1. Clone / unzip the project
cd judiciary-information-system

# 2. Install all dependencies (server + client)
npm run install:all

# 3. Configure the backend
cp server/.env.example server/.env
#    -> edit server/.env and set a real JWT_SECRET

# 4. (Optional) Seed sample data
npm run seed

# 5. Run the full stack
npm run dev
#    -> backend:  http://localhost:5000
#    -> frontend: http://localhost:5173
```

> Tip: to use a real MongoDB instance instead of the in-memory server,
> set `MONGODB_URI=mongodb://localhost:27017/judiciary` in `server/.env`.

---

## Default Credentials

All seeded accounts use the password: **`password123`**

| Name                  | Email                          | Role       | Notes                          |
|-----------------------|--------------------------------|------------|--------------------------------|
| System Administrator  | admin@judiciary.gov            | admin      | employeeId: ADM001             |
| Justice Anil Sharma   | anil.sharma@judiciary.gov      | judge      | Criminal Law, High Court Mumbai|
| Justice Priya Mehta   | priya.mehta@judiciary.gov      | judge      | Family Law, High Court Mumbai  |
| Adv. Rajesh Kumar     | rajesh.kumar@lawyer.com        | lawyer     | Bar: MAH/2015/0456             |
| Adv. Sneha Reddy      | sneha.reddy@lawyer.com         | lawyer     | Bar: MAH/2017/0892             |
| Registrar Suresh Iyer | suresh.iyer@judiciary.gov      | registrar  | employeeId: REG001             |

---

## API Endpoints

| Method | Endpoint                       | Access                          | Description                    |
|--------|--------------------------------|---------------------------------|--------------------------------|
| POST   | `/api/auth/register`           | Public                          | Register (first user = admin)  |
| POST   | `/api/auth/login`              | Public                          | Login, returns JWT             |
| GET    | `/api/auth/me`                 | Authenticated                   | Current user                   |
| GET    | `/api/cases`                   | Authenticated                   | List (?status, ?type, ?search) |
| GET    | `/api/cases/:id`               | Authenticated                   | Case detail                    |
| POST   | `/api/cases`                   | judge, registrar, admin         | Create case                    |
| PUT    | `/api/cases/:id`               | judge, registrar, admin         | Update case                    |
| DELETE | `/api/cases/:id`               | admin                           | Delete case                    |
| GET    | `/api/hearings`                | Authenticated                   | List (?caseId, ?date, ?status) |
| GET    | `/api/hearings/:id`            | Authenticated                   | Hearing detail                 |
| POST   | `/api/hearings`                | judge, registrar, admin         | Create hearing                 |
| PUT    | `/api/hearings/:id`            | judge, registrar, admin         | Update hearing                 |
| DELETE | `/api/hearings/:id`            | admin                           | Delete hearing                 |
| GET    | `/api/judgments`               | Authenticated                   | List (?search, ?verdict)       |
| GET    | `/api/judgments/:id`           | Authenticated                   | Judgment detail                |
| POST   | `/api/judgments`               | judge, admin                    | Create judgment (one per case) |
| PUT    | `/api/judgments/:id`           | judge, admin                    | Update judgment                |
| DELETE | `/api/judgments/:id`           | admin                           | Delete judgment                |
| GET    | `/api/users`                   | admin                           | List users                     |
| GET    | `/api/users/:id`               | admin                           | User detail                    |
| PUT    | `/api/users/:id`               | admin                           | Update user                    |
| DELETE | `/api/users/:id`               | admin                           | Delete user                    |
| GET    | `/api/dashboard/stats`         | Authenticated                   | Aggregated stats               |
| GET    | `/api/dashboard/upcoming-hearings` | Authenticated               | Next 5 hearings                |
| GET    | `/api/dashboard/recent-cases`  | Authenticated                   | Last 5 cases                   |

---

## Screenshots

Key pages worth capturing for the report:

- `Login` — clean centered auth card
- `Dashboard` — stat cards + upcoming hearings + recent cases
- `Cases List` — searchable/filterable table
- `Case Detail` — case info + hearings + judgment sections
- `Hearings List` — Upcoming / Past split
- `Judgments Archive` — searchable verdict archive
- `Users List` — admin-only user management

(Add your own screenshot images to a `/docs/screenshots/` folder if desired.)

---

## Role-Based Access Summary

| Capability                        | admin | judge | lawyer | registrar |
|-----------------------------------|:-----:|:-----:|:------:|:--------:|
| View dashboard / cases / hearings |  ✅   |  ✅   |   ✅   |    ✅    |
| Create / edit cases               |  ✅   |  ✅   |   —    |    ✅    |
| Create / edit hearings            |  ✅   |  ✅   |   —    |    ✅    |
| Record / edit judgments           |  ✅   |  ✅   |   —    |    —     |
| Delete any record                 |  ✅   |  —   |   —    |    —     |
| Manage users                      |  ✅   |  —   |   —    |    —     |

---

## Future Scope

- **e-Filing portal** for advocates to file new cases online
- **Email / SMS notifications** for upcoming hearings
- **Court fee payments** integration
- **Mobile app** (React Native) for advocates and judges on the move
- **Document management** with e-signatures and verified PDFs
- **AI-assisted legal research** for past judgments
- **Live transcription** of court proceedings
- **Multi-tenant** support for multiple courts / districts

---

## License

MIT — free to use for educational purposes.
