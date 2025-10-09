#  Personal Cloud Storage
AI-powered personal cloud storage with intelligent file analysis, tagging, and search capabilities.

##  Features

- **Drag-and-drop file upload** with real-time progress tracking
- **AI-powered analysis** using Google Gemini for automatic tagging and summarization
- **Smart tagging** - Automatically generated tags for easy organization
- **Advanced search** - Filter files by AI-generated tags
- **Storage dashboard** - Track usage statistics
- **Beautiful UI** - Modern, responsive design for desktop and mobile
- **Multiple file types** - Support for images, PDFs, documents, and more

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd personal-cloud-storage
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/personal-cloud
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
MAX_FILE_SIZE=10485760
```

3. **Set up Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start MongoDB**
   - **Local**: Ensure MongoDB service is running
   - **Atlas**: Use your MongoDB Atlas connection string in `.env`

5. **Run the application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Access the app**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Project Structure

```
personal-cloud-storage/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── upload.js            # Multer file upload
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   └── File.js              # File schema
│   ├── routes/
│   │   └── files.js             # API routes
│   ├── services/
│   │   ├── aiAnalysis.js        # AI router
│   │   ├── imageAnalysis.js     # Image AI analysis
│   │   ├── textAnalysis.js      # Text/PDF AI analysis
│   │   └── fileHandler.js       # File operations
│   ├── utils/
│   │   └── constants.js         # Configuration constants
│   ├── uploads/                 # Uploaded files directory
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/          # Reusable components
    │   │   ├── layout/          # Layout components
    │   │   ├── upload/          # Upload components
    │   │   ├── files/           # File display components
    │   │   └── search/          # Search components
    │   ├── hooks/               # Custom React hooks
    │   ├── services/
    │   │   └── api.js           # API client
    │   ├── utils/               # Utility functions
    │   ├── styles/
    │   │   └── index.css        # Global styles
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── config.js
    ├── .env
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```


## Supported File Types

### Images
- JPEG/JPG, PNG, GIF, WebP, SVG

### Documents
- PDF
- Plain Text (.txt)
- Markdown (.md)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)

## Database Schema

```javascript
{
  filename: String,          // Unique filename on server
  originalName: String,      // Original uploaded filename
  path: String,             // File path on server
  mimetype: String,         // MIME type
  size: Number,             // File size in bytes
  uploadDate: Date,         // Upload timestamp
  aiTags: [String],         // AI-generated tags
  summary: String,          // AI-generated summary
  analyzed: Boolean,        // Analysis status
  analysisDate: Date,       // Analysis timestamp
  analysisError: String     // Error message if analysis failed
}
```

## Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Multer (file uploads)
- Google Gemini AI

### Frontend
- React 18
- Vite
- Tailwind CSS



