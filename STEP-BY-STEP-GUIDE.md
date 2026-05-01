# Step-by-Step Setup Guide

## 1. Prerequisites

Before you begin, make sure you have the following installed:

- Node.js version 18 or newer
- npm (installed with Node.js)
- Git
- A MongoDB Atlas account
- A code editor such as Visual Studio Code (optional but recommended)
- Thunder Client or Postman for API route testing

## 2. Clone the repository and install dependencies

1. Open a terminal.
2. Clone the repository:

```bash
git clone https://github.com/ovenstore/chess-success-backend.git
```

3. Change into the project folder:

```bash
cd chess-success-backend
```

4. Install dependencies:

```bash
npm install
```

## 3. Configure the `.env` file

Create a file named `.env` in the root of the project.

Add these environment variables:

```env
MONGODB_URI=
JWT_SECRET=
PORT=
```

### What each variable means

- `MONGODB_URI`
  - The connection string used by the app to connect to MongoDB Atlas.
  - Example format: `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/myDatabase?retryWrites=true&w=majority`
  - Do not paste actual credentials here; keep the string private.

- `JWT_SECRET`
  - The secret key used to sign and verify JSON Web Tokens (JWTs).
  - This should be a strong, random string.
  - It is used for login/authentication security.

- `PORT`
  - Optional.
  - The port number the server will listen on.
  - If not set, the app defaults to `4000`.

## 4. Connect to MongoDB Atlas

1. Sign in to MongoDB Atlas.
2. Create a new cluster or use an existing cluster.
3. Create a database user with a username and password.
4. Add your development machine IP address to the cluster’s network access list.
5. Get the connection string from Atlas.
6. Paste the connection string into `MONGODB_URI` in your `.env` file.

Example `MONGODB_URI` placeholder:

```env
MONGODB_URI=mongodb+srv://<dbUser>:<dbPassword>@cluster0.example.mongodb.net/chess-success?retryWrites=true&w=majority
```

## 5. Start the server and verify it is running

In the project folder, run one of these commands:

- For production-style start:

```bash
npm start
```

- For local development with auto-reload:

```bash
npm run dev
```

You should see a console message similar to:

```text
Connected to MongoDB Atlas
Chess Success backend listening on port 4000
```

If you set a custom `PORT`, the port message will show that value instead.

## 6. Test routes in Thunder Client

Use `http://localhost:4000/api` as the base URL.

### 6.1 Register a new user

- Method: `POST`
- URL: `http://localhost:4000/api/auth/register`
- Body type: `JSON`
- Body example:

```json
{
  "username": "testuser",
  "password": "StrongPassword123"
}
```

### 6.2 Login

- Method: `POST`
- URL: `http://localhost:4000/api/auth/login`
- Body type: `JSON`
- Body example:

```json
{
  "username": "testuser",
  "password": "StrongPassword123"
}
```

The response should include a JWT token. Copy that token for authenticated requests.

### 6.3 Logout

- Method: `POST`
- URL: `http://localhost:4000/api/auth/logout`
- Headers: none required
- Body: none required

### 6.4 Get current user profile

- Method: `GET`
- URL: `http://localhost:4000/api/users/me`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`

### 6.5 Get leaderboard

- Method: `GET`
- URL: `http://localhost:4000/api/users/leaderboard`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`

### 6.6 Create a game

- Method: `POST`
- URL: `http://localhost:4000/api/games`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
- Body type: `JSON`
- Body example:

```json
{
  "pgn": "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6",
  "result": "win",
  "difficulty": "medium"
}
```

### 6.7 List all games

- Method: `GET`
- URL: `http://localhost:4000/api/games`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`

### 6.8 Get a single game by ID

- Method: `GET`
- URL: `http://localhost:4000/api/games/<gameId>`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`

Replace `<gameId>` with a real game ID returned from the games list.

## 7. Notes

- Keep `.env` out of version control.
- Do not share `JWT_SECRET` or `MONGODB_URI` with credentials in public repositories.
- If the server fails to start, check that `MONGODB_URI` and `JWT_SECRET` are correctly set.

## 8. Front-end setup (Week 14)

This project uses a Vite-based front-end in the `chess-success` folder.

### 8.1 Scaffold or clone the Vite project

If you already have the repository cloned, switch into the front-end folder:

```bash
cd ../chess-success
```

If starting from scratch, clone the front-end repository or the full workspace:

```bash
git clone https://github.com/ovenstore/chess-success.git
cd chess-success
```

Install dependencies:

```bash
npm install
```

### 8.2 Configure `VITE_API_URL`

Create a `.env` file in the front-end root if it does not exist.

Add the variable:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

This tells the Vite app where the back-end API is running locally. If your back-end uses a different host or port, update the value accordingly.

### 8.3 Run the dev server

Start the front-end development server:

```bash
npm run dev
```

### 8.4 Verify local connection to the back-end

1. Open the browser URL shown by Vite (usually `http://localhost:5173`).
2. Confirm the app loads without API errors.
3. Register or log in using the front-end UI.
4. Confirm authenticated requests succeed by checking that profile data loads and game actions work.

If the front-end cannot connect, verify the back-end is running and `VITE_API_BASE_URL` matches the API address.

## 9. Deployment (Week 15)

### 9.1 Deploy the back-end to Railway

1. Sign in to Railway and create a new project.
2. Connect your GitHub repository or deploy from a GitHub repo.
3. Set the deployment root to the backend folder (`chess-success-backend`).
4. Add Railway environment variables for the backend:

- `MONGODB_URI` – your MongoDB Atlas connection string.
- `JWT_SECRET` – a strong random secret for signing JWTs.
- `PORT` – typically Railway assigns a port automatically, but the app can use `process.env.PORT`.

5. Deploy the project.
6. Confirm the Railway deployment succeeds and note the generated backend URL.

### 9.2 Deploy the front-end to GitHub Pages

1. In the `chess-success` front-end repo, verify `package.json` has a `homepage` or build path if required.
2. Build the production site:

```bash
npm run build
```

3. Deploy the generated `dist` folder to GitHub Pages according to your repository settings, or use a deployment action.
4. Confirm the GitHub Pages site is published and reachable.

### 9.3 Link deployed front-end to deployed back-end

1. Update the front-end deployment configuration or environment file to use the deployed backend URL.
2. If the front-end deployment uses environment variables, set:

```env
VITE_API_BASE_URL=https://<your-railway-backend>/api
```

3. Rebuild and redeploy the front-end so it points at the production API.

### 9.4 CORS configuration

If the back-end is hosted on Railway and the front-end is on GitHub Pages, enable CORS in the back-end.

In the backend app, allow requests from the front-end origin and enable JSON headers. A typical example in Express is:

```js
const cors = require('cors');
app.use(cors({ origin: 'https://<your-github-pages-site>' }));
```

If you use a wildcard origin during early development, do so only temporarily.

### 9.5 Verify deployed connection

1. Open the deployed front-end URL in a browser.
2. Use the app to log in and verify requests go to the deployed backend.
3. Confirm API responses succeed and no CORS errors appear in the browser console.

## 10. Claude Code / AI tooling setup

If you use Claude Code or an equivalent AI workflow for this project, document your configuration in a `CLAUDE.md` file or similar.

### Example configuration entries

- `project_root`: the root folder for the app (for example `chess-success` and/or `chess-success-backend`).
- `backend_start`: command to start the backend locally, such as `npm run dev` in `chess-success-backend`.
- `frontend_start`: command to start the front-end locally, such as `npm run dev` in `chess-success`.
- `env_files`: list of environment files and expected variables.
- `routes_to_test`: key API routes like `/api/auth/login`, `/api/users/me`, and `/api/games`.

### Why this matters

- It ensures AI tooling knows which repository folders to work with.
- It documents the local start commands and required environment variables.
- It helps keep the project reproducible for Week 13 through Week 15 work.
