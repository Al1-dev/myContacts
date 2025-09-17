## myContacts

Full‑stack contacts manager (Node/Express + MongoDB + JWT backend, React + Vite frontend). Deployable on Render for the API and as a static site for the frontend.

### Stack
- Backend: Node.js, Express, Mongoose, JWT, Swagger
- Frontend: React, Vite, React Router
- Tests: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

### Project structure
```
.
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routers/
│   ├── __tests__/            # Jest + Supertest tests
│   ├── server.js             # API entrypoint
│   └── swagger.js            # Swagger docs (route /api-docs)
└── frontend/
    ├── src/
    ├── public/
    └── vite.config.js
```

---

## Environment variables

### Backend (`backend/.env` for local)
```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/db
# or MONGO_DB_URI (both are supported)
SECRET=change_me # required to sign and verify JWTs
# Optional for Swagger; used in prod on Render
PUBLIC_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local` for local)
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## Run locally
1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

2) Start backend
```bash
cd backend
npm start
# API on http://localhost:3000 (or PORT if set)
```

3) Start frontend
```bash
cd frontend
npm run dev
# Frontend app: http://localhost:5173
```

> CORS is enabled on the backend. The frontend calls the API via `VITE_API_BASE_URL`.

---

## API documentation (Swagger)
- Local: `http://localhost:3000/api-docs`
- Production: `https://mycontacts-diog.onrender.com/api-docs`

Swagger server uses `PUBLIC_URL` when set, otherwise `http://localhost:<PORT>`.

---

## Main endpoints

### Auth
- POST `/auth/register` → 201 { id }
  - 400: missing fields, 409: email already in use, 422: invalid email/password
- POST `/auth/login` → 200 { token }
  - 400: missing fields, 401: invalid credentials

Validation rules:
- Email: standard format with basic checks (TLD, consecutive dots, etc.)
- Password: length 10–128 characters (spaces allowed)

### Contacts (JWT required via `Authorization: Bearer <token>`)
- POST `/contacts` → 201 { id } (firstName, lastName, phone required)
- GET `/contacts` → 200 { contacts: Array<{ _id, firstName, lastName, phone }> }
- PATCH `/contacts/:id` → 200 { contact }
  - updates only provided non-empty fields
  - 400: invalid id/payload, 403: not owner, 404: not found
- DELETE `/contacts/:id` → 204 (no content)

Status codes used: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.

Quick examples
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@test.com","password":"abcdefghij"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@test.com","password":"abcdefghij"}'

# List contacts
curl -H 'Authorization: Bearer <TOKEN>' http://localhost:3000/contacts
```

---

## Tests

### Backend
- Tools: Jest, Supertest, `mongodb-memory-server`
- Command: from `backend/`
```bash
npm test
```
Tests start the app without opening a port (`NODE_ENV=test`) and use an in‑memory Mongo.

### Frontend
- Tools: Vitest, React Testing Library, jsdom
- Command: from `frontend/`
```bash
npm test
```

---

## Deployment on Render

### Backend (Web Service)
- Root Directory: `backend`
- Build Command: `npm ci` (or `npm install`)
- Start Command: `npm start`
- Environment vars:
  - `SECRET` (required)
  - `MONGODB_URI` (or `MONGO_DB_URI`)
  - `PUBLIC_URL=https://mycontacts-diog.onrender.com`
  - `PORT` is provided by Render automatically (do not set `EXPRESS_PORT`)

### Frontend (Static Site)
- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Env var: `VITE_API_BASE_URL=https://mycontacts-diog.onrender.com`
- Rewrite rule (SPA): Source `/*` → Destination `/index.html`

---

## UX notes
- Contact edit: cancelling any prompt cancels the whole edit; empty fields are left unchanged.
- A dedicated modal could replace prompts for better UX.

---

## License
Not specified. Add your license if needed (MIT, Apache‑2.0, …).


