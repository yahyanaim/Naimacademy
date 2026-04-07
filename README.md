# Naim Academy - Online Learning Platform

A comprehensive online learning platform for mastering n8n automation, built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **Course Management** - Structured lessons with video content, explanations, resources, and links
- **Progress Tracking** - Track student progress through the course
- **AI Chat Assistant** - NVIDIA-powered AI helper for answering questions
- **Certificate System** - Earn certificates upon course completion
- **Admin Dashboard** - Manage users, content, and view analytics
- **Scheduling System** - Students can plan their learning schedule
- **Notifications** - Admin can send notifications to all students
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based auth
- **AI**: NVIDIA AI API (Llama model)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yahyanaim/Naimacademy.git
cd Naimacademy
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/naimacademy
JWT_SECRET=your-secret-key
NVIDIA_API_KEY=your-nvidia-api-key
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000

### Admin Access

Default admin credentials (change in production):
- Email: admin@n8n-course.com
- Password: admin123

## Project Structure

```
├── app/                    # Next.js app router
│   ├── (admin)/           # Admin routes
│   ├── (main)/           # Main user routes
│   ├── api/              # API routes
│   └── donate/           # Donation page
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── course/           # Course components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Libraries and utilities
│   ├── auth/             # Authentication
│   ├── db/               # Database connection
│   ├── models/           # Mongoose models
│   ├── seed/             # Seed data
│   └── constants.ts      # Constants
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Course
- `GET /api/course` - Get course data
- `GET /api/progress` - Get user progress

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/seed` - Seed database
- `POST /api/admin/notifications` - Send notifications
- `PATCH /api/admin/sections` - Lock/unlock sections
- `PUT /api/admin/lessons` - Update lessons

## License

MIT License

## Support

For questions or issues, please contact through the platform.