
## Objective

Build a single-course online learning platform ("Mastering n8n Automation") as a fullstack Next.js application with MongoDB, featuring video lessons (URL-based), an exam system, certification, user dashboard, and role-based admin panel.

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Next.js App (App Router)"
        subgraph "Public Pages"
            HP[Home Page]
            LP[Login/Signup]
        end
        subgraph "Student Pages"
            DASH[Dashboard]
            COURSE[Course Page]
            LESSON[Lesson Player]
            EXAM[Exam Page]
            CERT[Certificate Page]
        end
        subgraph "Admin Pages /admin"
            ADM_DASH[Admin Dashboard]
            ADM_COURSE[Manage Sections/Lessons]
            ADM_EXAM[Manage Questions]
            ADM_USERS[View Users]
        end
        subgraph "API Routes /api"
            AUTH_API[/api/auth/*]
            COURSE_API[/api/course/*]
            PROGRESS_API[/api/progress/*]
            EXAM_API[/api/exam/*]
            CERT_API[/api/certificate/*]
            ADMIN_API[/api/admin/*]
        end
    end
    subgraph "External"
        MONGO[(MongoDB)]
        VIDEO[YouTube/Vimeo URLs]
    end
    AUTH_API & COURSE_API & PROGRESS_API & EXAM_API & ADMIN_API --> MONGO
    LESSON --> VIDEO
```

---

## Step 1: Project Scaffolding & Configuration

**Targets:**
- `/package.json` (root)
- `/next.config.js`
- `/tailwind.config.ts`
- `/.env.local`
- `/tsconfig.json`

**Actions:**
- Initialize Next.js 14+ (App Router, TypeScript)
- Install dependencies:
  - `tailwindcss`, `@shadcn/ui`, `class-variance-authority`, `clsx`, `tailwind-merge`
  - `mongoose` (MongoDB ODM)
  - `bcryptjs` (password hashing)
  - `jsonwebtoken`, `jose` (JWT auth)
  - `react-player` (video embedding)
  - `zod` (validation)
  - `lucide-react` (icons)
- Configure Tailwind + shadcn/ui (init with default theme)
- Set up `.env.local` with `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`

---

## Step 2: Database Layer (MongoDB + Mongoose)

**Targets:** `/lib/db/` and `/lib/models/`

### 2a. Database Connection
- **`/lib/db/mongoose.ts`** - Singleton connection with caching for serverless

### 2b. Mongoose Models

**`/lib/models/user.model.ts`** - User
```
{
  name: String (required)
  email: String (unique, required)
  password: String (hashed, required)
  role: "student" | "admin" (default: "student")
  progress: {
    completedLessons: [ObjectId -> Lesson]
    completionPercentage: Number
    lastLessonId: ObjectId (resume point)
    lastVideoTimestamp: Number
  }
  examAttempts: [{
    score: Number
    passed: Boolean
    submittedAt: Date
  }]
  certificateIssued: Boolean (default: false)
  createdAt, updatedAt (timestamps)
}
```

**`/lib/models/course.model.ts`** - Course
```
{
  title: String
  description: String
  thumbnail: String (URL)
  sections: [ObjectId -> Section]
  totalLessons: Number (computed)
  createdAt, updatedAt
}
```

**`/lib/models/section.model.ts`** - Section
```
{
  title: String
  order: Number
  courseId: ObjectId -> Course
  lessons: [ObjectId -> Lesson]
}
```

**`/lib/models/lesson.model.ts`** - Lesson
```
{
  title: String
  videoUrl: String (YouTube/Vimeo URL)
  description: String (rich text / markdown)
  resources: [{ name: String, url: String }]
  sectionId: ObjectId -> Section
  order: Number
  duration: String (e.g. "12:30")
}
```

**`/lib/models/exam.model.ts`** - Exam
```
{
  courseId: ObjectId -> Course
  title: String
  passingScore: Number (default: 70)
  timeLimitMinutes: Number (default: 30)
  questions: [ObjectId -> Question]
}
```

**`/lib/models/question.model.ts`** - Question
```
{
  examId: ObjectId -> Exam
  type: "multiple-choice" | "true-false"
  question: String
  options: [String]
  correctAnswer: Number (index of correct option)
  order: Number
}
```

---

## Step 3: Authentication System

**Targets:** `/lib/auth/`, `/app/api/auth/`, `/app/(auth)/`

### 3a. Auth Utilities
- **`/lib/auth/jwt.ts`** - `signToken(payload)`, `verifyToken(token)` using `jose`
- **`/lib/auth/middleware.ts`** - `withAuth(handler)` HOF for protected API routes, `withAdmin(handler)` for admin-only
- **`/lib/auth/session.ts`** - Cookie-based JWT: set/get/clear token from `httpOnly` cookies

### 3b. API Routes
- **`/app/api/auth/signup/route.ts`** - POST: validate with Zod, hash password, create user, return JWT cookie
- **`/app/api/auth/login/route.ts`** - POST: verify credentials, return JWT cookie
- **`/app/api/auth/logout/route.ts`** - POST: clear JWT cookie
- **`/app/api/auth/me/route.ts`** - GET: return current user (protected)

### 3c. Auth Pages
- **`/app/(auth)/login/page.tsx`** - Login form (email + password)
- **`/app/(auth)/signup/page.tsx`** - Signup form (name + email + password)
- Shared layout with centered card design

---

## Step 4: Course & Lesson System

**Targets:** `/app/api/course/`, `/app/(main)/course/`, `/components/course/`

### 4a. API Routes
- **`/app/api/course/route.ts`** - GET: return course with populated sections + lessons
- **`/app/api/course/lessons/[lessonId]/route.ts`** - GET: return single lesson details
- **`/app/api/progress/route.ts`** - GET: return user progress; POST: mark lesson complete
- **`/app/api/progress/resume/route.ts`** - POST: save video timestamp for resume

### 4b. Components
- **`/components/course/course-sidebar.tsx`** - Collapsible sections with lesson list, completion checkmarks, active highlight
- **`/components/course/video-player.tsx`** - Wrapper around `react-player`:
  - YouTube/Vimeo URL support
  - Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
  - Resume from saved timestamp
  - Fullscreen toggle
  - Progress save on pause/close
- **`/components/course/lesson-content.tsx`** - Description + downloadable resources list
- **`/components/course/progress-bar.tsx`** - Overall completion percentage bar

### 4c. Pages
- **`/app/(main)/course/page.tsx`** - Course overview: hero, description, section list, "Start Learning" CTA
- **`/app/(main)/course/lesson/[lessonId]/page.tsx`** - Lesson view: video player (top) + sidebar (right on desktop, drawer on mobile), description below, "Mark as Complete" + "Next Lesson" buttons

---

## Step 5: Exam / Evaluation System

**Targets:** `/app/api/exam/`, `/app/(main)/exam/`, `/components/exam/`

### 5a. API Routes
- **`/app/api/exam/route.ts`** - GET: return exam metadata (question count, time limit) - no answers
- **`/app/api/exam/start/route.ts`** - POST: return shuffled questions (without `correctAnswer`), record start time
- **`/app/api/exam/submit/route.ts`** - POST: receive answers array, auto-grade server-side, return score + pass/fail, save to user's `examAttempts`

### 5b. Exam Logic (Server-side)
- **`/lib/exam/grading.ts`** - Compare submitted answers with correct answers, calculate percentage, determine pass/fail based on `passingScore`

### 5c. Components
- **`/components/exam/exam-timer.tsx`** - Countdown timer, auto-submit on expiry
- **`/components/exam/question-card.tsx`** - Renders MCQ or True/False with radio selection
- **`/components/exam/exam-navigation.tsx`** - Question navigator (numbered dots showing answered/unanswered)
- **`/components/exam/exam-result.tsx`** - Score display, pass/fail badge, retry or view certificate CTA

### 5d. Pages
- **`/app/(main)/exam/page.tsx`** - Pre-exam screen: instructions, time limit, question count, "Start Exam" button (only enabled if course 100% complete)
- **`/app/(main)/exam/take/page.tsx`** - Active exam: timer + question card + navigation
- **`/app/(main)/exam/result/page.tsx`** - Results screen after submission

---

## Step 6: Certification System

**Targets:** `/app/api/certificate/`, `/app/(main)/certificate/`, `/lib/certificate/`

### 6a. Certificate Generation
- **`/lib/certificate/generate.ts`** - Generate certificate as a styled HTML-to-canvas/PDF approach:
  - User name, course name ("Mastering n8n Automation"), completion date
  - Clean branded design
  - Use `html2canvas` + `jspdf` on client-side for PDF download

### 6b. API Routes
- **`/app/api/certificate/route.ts`** - GET: verify user passed exam, return certificate data (name, date, course); POST: mark `certificateIssued = true`

### 6c. Pages
- **`/app/(main)/certificate/page.tsx`** - Certificate preview + "Download PDF" button (only accessible if exam passed)

---

## Step 7: User Dashboard

**Targets:** `/app/(main)/dashboard/`

### 7a. Page
- **`/app/(main)/dashboard/page.tsx`** - Dashboard with cards:
  - **Course Progress**: completion %, last lesson, "Continue Learning" button
  - **Exam Results**: score, pass/fail status, "Take Exam" / "Retake" button
  - **Certificate**: download link (if passed), locked state (if not)

---

## Step 8: Admin Panel

**Targets:** `/app/(admin)/`, `/app/api/admin/`

### 8a. Middleware
- **`/middleware.ts`** (Next.js root) - Protect `/admin/*` routes: verify JWT + `role === "admin"`, redirect to login if unauthorized

### 8b. API Routes
- **`/app/api/admin/sections/route.ts`** - CRUD for sections (GET all, POST create)
- **`/app/api/admin/sections/[id]/route.ts`** - PUT update, DELETE
- **`/app/api/admin/lessons/route.ts`** - CRUD for lessons
- **`/app/api/admin/lessons/[id]/route.ts`** - PUT update, DELETE
- **`/app/api/admin/questions/route.ts`** - CRUD for exam questions
- **`/app/api/admin/questions/[id]/route.ts`** - PUT update, DELETE
- **`/app/api/admin/users/route.ts`** - GET all users with progress/scores
- **`/app/api/admin/seed/route.ts`** - POST: seed initial course data (sections, lessons, exam questions) for development

### 8c. Admin Pages
- **`/app/(admin)/admin/page.tsx`** - Admin dashboard: stats (total users, avg score, completion rates)
- **`/app/(admin)/admin/content/page.tsx`** - Manage sections & lessons: sortable list, add/edit/delete modals
- **`/app/(admin)/admin/exam/page.tsx`** - Manage questions: add/edit/delete, preview
- **`/app/(admin)/admin/users/page.tsx`** - User table: name, email, progress %, exam score, certificate status

### 8d. Admin Components
- **`/components/admin/section-form.tsx`** - Add/edit section modal
- **`/components/admin/lesson-form.tsx`** - Add/edit lesson modal (title, video URL, description, resources)
- **`/components/admin/question-form.tsx`** - Add/edit question modal (type selector, options builder)
- **`/components/admin/data-table.tsx`** - Reusable table component using shadcn Table

---

## Step 9: Shared Layout & UI Components

**Targets:** `/app/layout.tsx`, `/components/ui/`, `/components/layout/`

### 9a. Layouts
- **`/app/layout.tsx`** - Root layout: font, metadata, Toaster provider
- **`/app/(main)/layout.tsx`** - Main layout: navbar (logo, Dashboard, Course, user menu), footer
- **`/app/(admin)/layout.tsx`** - Admin layout: admin sidebar nav, top bar
- **`/app/(auth)/layout.tsx`** - Centered card layout

### 9b. Shared Components
- **`/components/layout/navbar.tsx`** - Top nav: logo, links, user avatar dropdown (Dashboard, Logout)
- **`/components/layout/footer.tsx`** - Simple footer
- **`/components/layout/admin-sidebar.tsx`** - Admin navigation sidebar
- shadcn/ui components: Button, Card, Input, Label, Dialog, Table, Badge, Progress, Tabs, DropdownMenu, Toast, Skeleton

---

## Step 10: Seed Data & Development Setup

**Targets:** `/lib/seed/`, `/scripts/`

- **`/lib/seed/data.ts`** - Seed data for:
  - 1 Course: "Mastering n8n Automation"
  - 5-6 Sections (e.g., "Getting Started", "Core Nodes", "Workflows", "Integrations", "Advanced", "Real Projects")
  - 3-4 lessons per section with real YouTube URLs (n8n tutorials)
  - 15-20 exam questions (MCQ + True/False)
  - 1 admin user (admin@n8n-course.com)
- **`/lib/seed/index.ts`** - Seed script that clears and repopulates DB
- Callable via admin API route or npm script

---

## Folder Structure Summary

```
/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home/landing page
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── course/
│   │   │   ├── page.tsx              # Course overview
│   │   │   └── lesson/[lessonId]/page.tsx
│   │   ├── exam/
│   │   │   ├── page.tsx              # Pre-exam
│   │   │   ├── take/page.tsx         # Active exam
│   │   │   └── result/page.tsx
│   │   └── certificate/page.tsx
│   ├── (admin)/admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Admin dashboard
│   │   ├── content/page.tsx
│   │   ├── exam/page.tsx
│   │   └── users/page.tsx
│   └── api/
│       ├── auth/{signup,login,logout,me}/route.ts
│       ├── course/route.ts
│       ├── course/lessons/[lessonId]/route.ts
│       ├── progress/route.ts
│       ├── progress/resume/route.ts
│       ├── exam/{route,start,submit}/route.ts
│       ├── certificate/route.ts
│       └── admin/{sections,lessons,questions,users,seed}/...
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── layout/{navbar,footer,admin-sidebar}.tsx
│   ├── course/{course-sidebar,video-player,lesson-content,progress-bar}.tsx
│   ├── exam/{exam-timer,question-card,exam-navigation,exam-result}.tsx
│   └── admin/{section-form,lesson-form,question-form,data-table}.tsx
├── lib/
│   ├── db/mongoose.ts
│   ├── models/{user,course,section,lesson,exam,question}.model.ts
│   ├── auth/{jwt,middleware,session}.ts
│   ├── exam/grading.ts
│   ├── certificate/generate.ts
│   ├── seed/{data,index}.ts
│   └── utils.ts                      # cn() helper, formatters
├── middleware.ts                      # Route protection
├── .env.local
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Implementation Sequence

The steps should be executed in order (1 through 10), as each step builds on the previous:

1. **Scaffolding** -> 2. **DB Models** -> 3. **Auth** -> 4. **Course/Lessons** -> 5. **Exam** -> 6. **Certificate** -> 7. **Dashboard** -> 8. **Admin** -> 9. **Layout/UI polish** -> 10. **Seed data**

---

## Verification / Definition of Done

| Step | Targets | Verification |
|------|---------|-------------|
| 1. Scaffolding | `package.json`, config files | `npm run dev` starts without errors |
| 2. DB Models | `/lib/models/*`, `/lib/db/*` | Models compile, DB connects |
| 3. Auth | `/api/auth/*`, auth pages | Signup, login, logout flow works; JWT cookie set correctly |
| 4. Course | `/api/course/*`, course pages | Course loads with sections/lessons; video plays; progress saves |
| 5. Exam | `/api/exam/*`, exam pages | Exam starts, timer works, auto-grades correctly, results persist |
| 6. Certificate | `/api/certificate/*`, cert page | Certificate renders with correct data; PDF downloads |
| 7. Dashboard | Dashboard page | Shows progress, exam results, certificate access correctly |
| 8. Admin | `/api/admin/*`, admin pages | CRUD operations work for all entities; user list loads |
| 9. Layout/UI | Layouts, shared components | Responsive on mobile/desktop; consistent styling |
| 10. Seed | Seed script | DB populated with realistic course content; admin user created |

**End-to-end smoke test:** Sign up -> browse course -> watch lesson -> mark complete -> complete all lessons -> take exam -> pass -> download certificate. Admin: login as admin -> add section -> add lesson -> add question -> view users.
