# BlogSpace — MERN Blog Platform

A full-stack blog platform with user authentication, post management, and a comment system, built with **MongoDB**, **Express.js**, **React**, and **Node.js**.

---

## Features

- **Authentication** — Register, log in, log out with JWT (stored in localStorage)
- **Blog Posts** — Create, read, update, delete with category, pagination, and search
- **Comments** — Add, edit, delete comments; post authors can moderate comments on their posts
- **Authorization** — All write operations are owner-verified on the backend
- **Responsive UI** — Works on mobile, tablet, and desktop

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, React Router v6, Axios |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB Atlas + Mongoose                |
| Auth      | JWT + bcryptjs                          |
| Security  | Helmet, CORS, express-rate-limit        |
| Validation| express-validator (backend), inline (frontend) |

---

## Project Structure

```
blog-platform/
├── client/          # React + Vite frontend
├── server/          # Express.js backend
└── package.json     # Root scripts (concurrently)
```

### Backend (`server/`)
```
server/
├── config/db.js             # MongoDB connection
├── controllers/
│   ├── authController.js    # Register, login, profile
│   ├── postController.js    # Post CRUD + my posts
│   └── commentController.js # Comment CRUD
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── validate.js          # express-validator error handler
│   ├── notFound.js          # 404 handler
│   └── errorHandler.js      # Centralized error handler
├── models/
│   ├── User.js              # User schema (password hashed)
│   ├── Post.js              # Post schema with text index
│   └── Comment.js           # Comment schema
├── routes/
│   ├── auth.js              # /api/auth/* with rate limiting
│   ├── posts.js             # /api/posts/*
│   └── comments.js          # /api/posts/:postId/comments + /api/comments/:id
├── utils/generateToken.js   # JWT generator
├── app.js                   # Express app setup
└── server.js                # Entry point
```

### Frontend (`client/src/`)
```
src/
├── components/
│   ├── Navbar.jsx           # Responsive nav with auth state
│   ├── PostCard.jsx         # Post preview card
│   ├── CommentList.jsx      # Comment list with edit/delete
│   ├── CommentForm.jsx      # Add/edit comment form
│   ├── ProtectedRoute.jsx   # Auth guard for routes
│   ├── Loader.jsx           # Spinner component
│   └── ErrorMessage.jsx     # Error display
├── context/AuthContext.jsx  # Global auth state
├── pages/
│   ├── HomePage.jsx         # Hero + latest posts + search
│   ├── PostsPage.jsx        # Paginated post listing
│   ├── PostDetailPage.jsx   # Full post + comments
│   ├── LoginPage.jsx        # Login form
│   ├── RegisterPage.jsx     # Registration form
│   ├── CreatePostPage.jsx   # Create post form
│   ├── EditPostPage.jsx     # Edit post form
│   ├── MyPostsPage.jsx      # Author's own posts
│   └── NotFoundPage.jsx     # 404 page
├── services/
│   ├── api.js               # Axios instance + interceptors
│   ├── authService.js       # Auth API calls
│   ├── postService.js       # Post API calls
│   └── commentService.js    # Comment API calls
├── App.jsx                  # Router + layout
├── main.jsx                 # React entry point
└── index.css                # All styles
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- A MongoDB Atlas account (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd blog-platform
npm install           # installs concurrently at root
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**Backend** — copy `server/.env.example` to `server/.env` and fill in:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/blogdb?retryWrites=true&w=majority
JWT_SECRET=your_super_long_random_secret_here
CLIENT_URL=http://localhost:5173
```

**Frontend** — copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Seed sample blog posts (Optional)

```bash
npm run seed
```

This populates your MongoDB database with 6 sample blog posts, categories, demo users, and comments.

### 4. Run both servers

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000

### Individual servers

```bash
npm run dev:client    # Vite frontend only
npm run dev:server    # Express backend only
```

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint         | Auth | Description            |
|--------|-----------------|------|------------------------|
| POST   | `/register`     | ❌   | Create account         |
| POST   | `/login`        | ❌   | Login, returns JWT     |
| GET    | `/me`           | ✅   | Get own profile        |

### Posts — `/api/posts`

| Method | Endpoint       | Auth | Description                         |
|--------|---------------|------|-------------------------------------|
| GET    | `/`           | ❌   | List posts (pagination + search)    |
| GET    | `/my`         | ✅   | List own posts                      |
| GET    | `/:id`        | ❌   | Get single post                     |
| POST   | `/`           | ✅   | Create post                         |
| PATCH  | `/:id`        | ✅   | Update own post                     |
| DELETE | `/:id`        | ✅   | Delete own post + its comments      |

**Query params for listing:** `?page=1&limit=6&search=react`

### Comments — `/api/posts/:postId/comments` and `/api/comments`

| Method | Endpoint                       | Auth | Description                                  |
|--------|-------------------------------|------|----------------------------------------------|
| GET    | `/api/posts/:postId/comments` | ❌   | List comments (latest first)                 |
| POST   | `/api/posts/:postId/comments` | ✅   | Add comment                                  |
| PATCH  | `/api/comments/:id`           | ✅   | Edit own comment                             |
| DELETE | `/api/comments/:id`           | ✅   | Delete (comment author or post author)       |

### Response Format

**Success:**
```json
{ "token": "...", "user": { "_id": "...", "name": "...", "email": "..." } }
```

**Error:**
```json
{ "message": "Descriptive error message", "errors": [...] }
```

**Paginated list:**
```json
{
  "posts": [...],
  "pagination": { "total": 42, "page": 1, "pages": 7, "limit": 6 }
}
```

---

## Security

- Passwords hashed with **bcryptjs** (10 salt rounds); never returned in responses
- JWTs signed with `JWT_SECRET`; expire after 7 days
- Auth endpoints rate-limited: **10 requests / 15 minutes** per IP
- **Helmet** sets security headers; **CORS** restricts to `CLIENT_URL` only
- All update/delete operations verify ownership server-side
- ObjectId validity checked before DB queries
- Stack traces hidden in production

---

## Deployment on Render

### Backend (Web Service)

1. Create a new **Web Service** in Render.
2. Connect your GitHub repo.
3. Set **Root Directory** to `server`.
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your Atlas URI>
   JWT_SECRET=<long random secret>
   CLIENT_URL=https://your-frontend.onrender.com
   ```

### Frontend (Static Site)

1. Create a new **Static Site** in Render.
2. Connect your GitHub repo.
3. Set **Root Directory** to `client`.
4. **Build Command:** `npm install && npm run build`
5. **Publish Directory:** `dist`
6. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   ```
7. Add a **Rewrite Rule:** `/*` → `/index.html` (Status: 200) for React Router.

### MongoDB Atlas

- Go to **Network Access** → add `0.0.0.0/0` (allow all IPs) or Render's outbound IPs.
- Make sure your Atlas user has **Read and Write** access to the database.

---

## Architecture Decisions

| Decision | Reason |
|----------|--------|
| ES Modules | Modern JavaScript standard; consistent with frontend |
| JWT in localStorage | Simple for internship demo; use HttpOnly cookies in production |
| Cascade delete comments | When a post is deleted, all its comments are also deleted (via `Comment.deleteMany`) |
| Text search on title | Simple regex search on title field — no Atlas Search plan needed |
| Rate limiting on auth only | Auth endpoints are the most abused; excessive limits would hurt UX elsewhere |
| `select: false` on password | Prevents accidental password exposure in API responses |

---

## License

MIT — built as an internship assignment.
