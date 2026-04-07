# Naim Academy

A modern online learning platform for n8n automation courses, built with Next.js, MongoDB, and Tailwind CSS.

## Features

- 📚 **Course Management** - Structured lessons with videos, explanations, resources, and links
- 🤖 **AI Assistant** - NVIDIA-powered chatbot to help students with course questions
- 📊 **Admin Dashboard** - Manage users, content, notifications, and view analytics
- 📅 **Learning Schedule** - Calendar planning for students to organize their learning
- 🎓 **Certificates** - Auto-generated certificates upon course completion
- 🔔 **Notifications** - Push notifications for students and admins
- 🔒 **Lock/Unlock Content** - Admins can lock sections or individual lessons
- 📱 **Mobile Responsive** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based with bcrypt
- **AI**: NVIDIA NIM API (Llama 3.1)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- NVIDIA API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yahyanaim/Naimacademy.git
cd Naimacademy

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Add your environment variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# NVIDIA_API_KEY=your_nvidia_api_key

# Run development server
npm run dev
```

### Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/naimacademy
JWT_SECRET=your-super-secret-key
NVIDIA_API_KEY=nvapi-xxx
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
```

## Admin Credentials

Default admin (after seeding):
- Email: admin@n8n-course.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Course
- `GET /api/course` - Get course data
- `GET /api/course/lessons/:id` - Get lesson details

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress

### Schedule
- `GET /api/schedule` - Get learning schedule
- `POST /api/schedule` - Create/update schedule

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/seed?mode=update` - Update course content
- `POST /api/admin/notifications` - Send notifications

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── (admin)/           # Admin panel pages
│   ├── (main)/            # Main user pages
│   ├── api/               # API routes
│   └── donate/            # Donation page
├── components/             # React components
│   ├── admin/             # Admin components
│   ├── course/           # Course components
│   └── layout/           # Layout components
├── lib/                   # Utilities and models
│   ├── models/           # Mongoose models
│   ├── seed/             # Database seeding
│   └── auth/             # Authentication
└── public/               # Static assets
```

## License

MIT License - Feel free to use this project for learning purposes.

## Contact

For questions or support, use the platform's support feature.