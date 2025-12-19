# Algo Arena — Frontend

Frontend application for **Algo Arena**, built with **React**, **Vite**, and **TypeScript**.

**Live application:** https://alg0-ar3na.web.app/

---

## Tech Stack

- React
- Vite
- TypeScript

---

## Environment Variables

Create a `.env.local` file in the root of the frontend project.

```env
VITE_API_URL=http://localhost:3001
```

> This should point to the locally running backend server.

---

## Quick Start (Run Locally)

1. Clone the repository:
   ```bash
   git clone <frontend-repo-url>
   ```

2. Navigate into the project directory:
   ```bash
   cd repo-name
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available locally (typically at `http://localhost:5173`).

---

## Notes

- Environment variables must be prefixed with `VITE_` to be accessible in the client
- Restart the dev server after changing `.env` files
- Ensure the backend is running locally before starting the frontend
