# 🧠 Brainly - Your Second Brain

A powerful web application that helps you save, organize, and interact with content from across the web using AI. Built with React, TypeScript, and powered by Groq AI.

[Live Demo]:(https://brainly-delta.vercel.app/)

## ✨ Features

- 📝 **Smart Content Management**: Save and organize Twitter posts, YouTube videos, and custom notes
- 🤖 **AI-Powered Chat**: Ask questions about your saved content using Groq's LLaMA 3.3 70B model
- 🔍 **Intelligent Search**: Filter and search through your saved content instantly
- 🔗 **Share Your Brain**: Generate shareable links to your content collections
- 📱 **Fully Responsive**: Beautiful mobile and desktop experience
- 🎨 **Modern UI**: Built with Tailwind CSS and custom components
- 🔐 **Secure Authentication**: JWT-based auth system

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Toast Notifications**: React Hot Toast
- **Hosting**: Vercel

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **AI**: Groq SDK (LLaMA 3.3 70B)
- **APIs**: YouTube API, News API
- **Hosting**: Render

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- API Keys: Groq, YouTube API, News API (optional)

### Clone the Repository

git clone (https://github.com/saad-78/Brainly.git)
cd brainly



### Backend Setup

cd backend

Install dependencies
npm install

Create .env file
cp .env.example .env



### Frontend Setup

cd frontend

Install dependencies
npm install

Create .env file
cp .env.example .env

text

**Frontend `.env` Configuration:**

VITE_BACKEND_URL=http://localhost:3000

text
undefined
Run frontend
npm run dev

text

The app will be available at `http://localhost:5173`


## 🔌 API Endpoints

### Authentication
- `POST /api/v1/signup` - Register new user
- `POST /api/v1/signin` - User login
- `GET /api/v1/user` - Get current user (protected)

### Content Management
- `POST /api/v1/content` - Add new content (protected)
- `GET /api/v1/content` - Get user's content (protected)
- `DELETE /api/v1/content` - Delete content (protected)

### Brain Sharing
- `POST /api/v1/brain/share` - Generate shareable link (protected)
- `GET /api/v1/brain/:shareLink` - View shared brain (public)

### Notes
- `POST /api/v1/note` - Create note (protected)
- `GET /api/v1/notes` - Get all notes (protected)
- `PUT /api/v1/note/:noteId` - Update note (protected)
- `DELETE /api/v1/note/:noteId` - Delete note (protected)
- `POST /api/v1/note/:noteId/pin` - Pin/unpin note (protected)

### AI Chat
- `POST /api/v1/ai/ask` - Ask AI about your content (protected)
- `GET /api/v1/ai/health` - Check AI service status

### Health Check
- `GET /api/v1/health` - Server health check (for cron jobs)

## 🌐 Deployment

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Configure environment variables
5. Deploy automatically

**Render Environment Variables:**
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-jwt-secret
GROQ_API_KEY=your-groq-key
YOUTUBE_API_KEY=your-youtube-key
NEWS_API_KEY=your-news-key
PORT=10000
NODE_ENV=production



### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set framework preset to "Vite"
4. Add environment variable: `VITE_BACKEND_URL=https://your-backend.onrender.com`
5. Deploy


## 🔑 Getting API Keys

1. **Groq API**: Sign up at [console.groq.com](https://console.groq.com)
2. **YouTube API**: Get from [Google Cloud Console](https://console.cloud.google.com)
3. **News API**: Register at [newsapi.org](https://newsapi.org)

## 📱 Mobile Support

The app is fully responsive with:
- Dynamic viewport units for mobile browsers
- Safe area inset padding for notched devices
- Touch-optimized interactions
- Bottom-positioned toasts on mobile
- Collapsible mobile navigation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Common Issues

**TypeScript Build Errors:**
Remove type checking from build
In package.json, change "build": "tsc -b && vite build"
To: "build": "vite build"


## 📝 License

MIT License - feel free to use this project for learning or production.

## 👨‍💻 Author

Built with by Saad

---

**⭐ Star this repo if you found it helpful!**
