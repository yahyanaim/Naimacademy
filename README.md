# Naim Academy

An online learning platform for Arabic language education featuring AI-powered chatbot assistance, course management, progress tracking, and certificate generation.

## Features

- **Course Management**: Structured lessons with videos, explanations, and resources
- **AI Chatbot**: NVIDIA-powered AI assistant for student support
- **Progress Tracking**: Calendar-based scheduling and progress visualization
- **Exams & Certificates**: Quiz system with certificate generation upon completion
- **Admin Dashboard**: User management, content management, notifications, and analytics
- **Push Notifications**: Real-time notification system
- **Lock/Unlock System**: Control access to sections and individual lessons

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with jose library
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Video Player**: React Player
- **PDF Generation**: html2pdf.js
- **AI Integration**: NVIDIA API

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database (local or Atlas)
- NVIDIA API key (for AI chatbot)
- Cloudinary account (for avatar uploads)
- SMTP service (Mailjet, SendGrid, etc.) for emails

### Environment Variables

Create a `.env.local` file with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/naimbdacademy
JWT_SECRET=your-secret-key

# AI Chatbot
NVIDIA_API_KEY=your-nvidia-api-key
NVIDIA_MODEL=meta/llama-3.1-8b-instruct

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (avatar uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP (email sending)
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name

# Admin IP restriction (optional, comma-separated)
ALLOWED_ADMIN_IPS=
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
├── (admin)/              # Admin panel routes
│   └── admin/
│       ├── page.tsx      # Dashboard with stats
│       ├── users/        # User management
│       ├── content/      # Course content management
│       ├── notifications/# Notification management
│       ├── support/      # Support messages
│       ├── seed/         # Database seeding
│       └── exam/         # Exam management
├── (auth)/               # Authentication routes
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (main)/               # Main user routes
│   ├── course/          # Course page with lessons
│   ├── dashboard/       # User dashboard
│   ├── exam/           # Exam taking & results
│   ├── certificates/   # Certificate viewing
│   └── profile/        # User profile
├── api/                 # API routes
│   ├── auth/           # Authentication endpoints
│   ├── course/         # Course & lesson endpoints
│   ├── progress/      # Progress tracking
│   ├── exam/           # Exam endpoints
│   ├── certificate/    # Certificate endpoints
│   ├── chat/           # AI chatbot
│   └── admin/          # Admin-only endpoints
├── donate/             # Support/donate page
└── privacy/           # Privacy policy

lib/
├── models/             # Mongoose models
├── seed/              # Database seeding logic
└── db.ts              # Database connection

components/
├── course/            # Course-related components
├── dashboard/         # Dashboard components
├── exam/              # Exam components
└── layout/            # Layout components (navbar, etc.)
```

## Admin Features

Access admin panel at `/admin` (requires admin account):

- **Dashboard**: View statistics (users, progress, notifications)
- **User Management**: View, ban/unban users
- **Content Management**: Manage sections and lessons, lock/unlock content
- **Notifications**: Send notifications to users
- **Support Messages**: View and manage support requests
- **Seed Database**: Populate/update course content
- **Exam Management**: Configure exam questions

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Course
- `GET /api/course` - Get course structure
- `GET /api/course/lessons/[id]` - Get lesson details

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress
- `GET /api/schedule` - Get schedule

### Exams
- `POST /api/exam/start` - Start exam
- `POST /api/exam/submit` - Submit exam answers

### Certificates
- `GET /api/certificate` - Get user certificates
- `GET /api/certificate/download/[id]` - Download certificate PDF

### Admin (requires admin auth)
- `GET/POST/DELETE /api/admin/notifications` - Manage notifications
- `GET /api/admin/users` - List users
- `POST /api/admin/seed` - Seed database

## Deployment

Optimized for Vercel deployment. Configure environment variables in Vercel dashboard.
