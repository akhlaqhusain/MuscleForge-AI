# 🔥 MuscleForge AI Trainer — Project Documentation

  An AI-powered fitness trainer web app that generates personalised workout plans and answers exercise and nutrition questions, using Google Gemini as the AI engine.

---

## What It Does

- **Muscle group selection** — Users pick a body region (Upper Body, Lower Body, Full Body, Core) or a specific muscle (Chest, Back, Biceps, etc.)
- **AI workout generation** — Clicking "Generate" sends the selection to the backend, which calls Gemini AI with a carefully crafted server-side prompt and returns a structured workout plan with warm-up, main exercises (sets/reps/rest), cool-down, and a pro tip
- **AI chat trainer** — A follow-up chat box lets users ask anything about exercise, form, nutrition or recovery; the backend filters every message through a topic guard and blocks off-topic questions automatically
- **History** — Every generated workout is saved to MongoDB and displayed on the History page


---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Vite | Build tool and dev server |
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| React Hot Toast | Notifications |
| CSS-in-JS (inline styles) | Scoped, token-driven styling |

### Backend
| Technology | Purpose |
|-----------|---------|
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM / schema modelling |
| Google Gemini 2.5 Flash | AI workout generation and chat |
| dotenv | Environment config |

---

## Project Structure

### Frontend (`fitness-frontend/`)

```
src/
├── api/
│   ├── client.js          # Axios instance with JWT interceptor
│   └── index.js           # All API service functions
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   └── ProtectedRoute.jsx # Auth gate for protected pages
│   ├── ui/
│   │   ├── Button.jsx         # Reusable button (variants: primary/secondary/danger/ghost)
│   │   ├── Card.jsx           # Reusable card container
│   │   └── Input.jsx          # Reusable input with label, error, icon
│   ├── MuscleSelector.jsx # Grid of muscle group buttons
│   ├── WorkoutDisplay.jsx # Renders the AI workout plan
│   └── ChatBox.jsx        # Chat UI with message bubbles
├── context/
│   └── AuthContext.jsx    # Auth state + stub methods for login/signup/logout
├── pages/
│   ├── Home.jsx           # Main workout generator page
│   ├── History.jsx        # Saved workouts list
│   ├── Login.jsx          # Login form (ready, not yet routed)
│   └── Signup.jsx         # Signup form (ready, not yet routed)
├── App.jsx                # Router + AuthProvider wrapper
├── main.jsx               # React DOM entry
└── index.css              # Global CSS design tokens + animations
```

### Backend (`fitness-backend/`)

```
├── config/
│   ├── db.js              # MongoDB connection
│   └── gemini.js          # Gemini client + all AI prompts
├── controllers/
│   ├── authController.js  # signup, login, getMe
│   ├── workoutController.js # generateWorkout, getHistory, delete
│   └── chatController.js  # sendMessage with topic guard
├── middleware/
│   ├── auth.js            # protect + adminOnly middleware
│   ├── errorHandler.js    # Global error handler
│   └── rateLimiter.js     # API, AI, and auth rate limiters
├── models/
│   ├── User.js            # User schema (name, email, hashed password, role)
│   ├── Workout.js         # Workout schema (muscleGroup, plan, userId)
│   └── ChatLog.js         # Chat history schema
├── routes/
│   ├── auth.js            # /api/auth/*
│   ├── workout.js         # /api/workout/*
│   └── chat.js            # /api/chat/*
├── utils/
│   └── jwt.js             # signToken + sendTokenResponse helpers
├── server.js              # Express app entry point
├── .env.example           # Environment variable template
├── SETUP.md               # Setup instructions
└── PROJECT.md             # This file
```

---

## Architecture & Data Flow

### Workout Generation
```
User clicks "Generate"
  → Frontend: POST /api/workout/generate { muscleGroup }
    → Backend validates muscleGroup against whitelist
    → Builds prompt: WORKOUT_PROMPT + muscleGroup
    → Calls Gemini 1.5 Flash API
    → Saves result to MongoDB (Workout collection)
    → Returns { workout: "...", workoutId }
  → Frontend renders WorkoutDisplay + shows ChatBox
```

### Chat Message Flow
```
User types a question
  → Frontend: POST /api/chat/message { message, muscleGroup, conversationHistory }
    → Backend combines CHAT_GUARD_PROMPT + recent history + user message
    → Calls Gemini — model returns JSON: { off_topic, reply }
    → If off_topic: returns blocked message
    → If on_topic: returns the AI reply
    → Saves both turns to ChatLog in MongoDB
  → Frontend renders the message bubble (green = off-topic, gray = reply)
```

---

## AI Prompt Design

Both prompts live exclusively in `config/gemini.js` on the server. Users never see them.

**WORKOUT_PROMPT** — Instructs Gemini to act as a certified personal trainer and produce a structured plan with warm-up, main workout, cool-down, and a pro tip in a specific markdown format that the frontend parses into coloured cards.

**CHAT_GUARD_PROMPT** — Dual-purpose: (1) classifies whether the user message is fitness-related, (2) if yes, answers it fully. Forces the model to respond in JSON `{ off_topic, reply }` so the backend can route the response reliably. Off-topic questions return a friendly redirect message without hitting any secondary AI call.

To change what topics are allowed or blocked, edit the ALLOWED / BLOCKED lists in `CHAT_GUARD_PROMPT`. To change the workout format, edit `WORKOUT_PROMPT`.

---

## Security

- **Helmet** sets secure HTTP headers on every response
- **CORS** is locked to `FRONTEND_URL` — no other origins accepted
- **Rate limiting**: 100 req/15 min globally, 10 AI calls/min per IP, 10 auth attempts/15 min per IP
- **Input validation** — muscle group is checked against a whitelist before any AI call
- **JSON body limit** is capped at 10kb to prevent payload attacks
- **AI prompts** are server-side only — never in the frontend bundle

---

## Database Collections

### `workouts`
```js
{
  _id:         ObjectId,
  muscleGroup: String,    // "Chest", "Upper Body", etc.
  workoutPlan: String,    // Full AI-generated plan text
  userId:      ObjectId,  // null (anonymous) or User ref
  createdAt:   Date,
  updatedAt:   Date
}
```

### `chatlogs`
```js
{
  _id:         ObjectId,
  muscleGroup: String,
  messages:    [{ role, content, offTopic }],
  workoutId:   ObjectId,
  userId:      ObjectId,
  createdAt:   Date,
  updatedAt:   Date
}

```