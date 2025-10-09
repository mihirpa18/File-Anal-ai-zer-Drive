# Personal Cloud Storage Backend

Backend API for Personal Cloud Storage with AI-powered file analysis.

## Features

- File upload (images, PDFs, text documents)
- AI-powered file analysis using Hugging Face
- Automatic tagging and summarization
- File search by AI-generated tags
- File download and deletion
- Storage statistics

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- google gemini API key (from https://aistudio.google.com/app/api-keys)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/personal-cloud
GOOOGLE_GEMINI_API_KEY=your_actual_api_key_here
MAX_FILE_SIZE=10485760
```

### 3. Start MongoDB

**Option A: Local MongoDB**
**Option B: MongoDB Atlas (Cloud)**


### 4. Get GOOGLE API Key

1. Go to https://aistudio.google.com/app/api-keys
2. Create new api-key 
3. Copy token to `.env` file

## Running the Server

```bash
npm run dev
```


Server will start on `http://localhost:5000`

## API Endpoints

### Upload File
```http
POST /api/files/upload
Content-Type: multipart/form-data

Form field: file
```

### Get All Files
```http
GET /api/files
Query params: ?tag=nature&sort=-uploadDate&limit=50
```

### Get Single File
```http
GET /api/files/:id
```

### Download File
```http
GET /api/files/download/:id
```

### Delete File
```http
DELETE /api/files/:id
```

### Get All Tags
```http
GET /api/files/search/tags
```

### Get Statistics
```http
GET /api/files/stats/summary
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── upload.js            # Multer file upload
│   └── errorHandler.js      # Error handling
├── models/
│   └── File.js              # File schema
├── routes/
│   └── files.js             # API routes
├── services/
│   ├── aiAnalysis.js        # AI router
│   ├── imageAnalysis.js     # Image AI
│   ├── textAnalysis.js      # Text/PDF AI
│   └── fileHandler.js       # File operations
├── utils/
│   └── constants.js         # Configuration
├── uploads/                 # Uploaded files
├── .env                     # Environment config
├── .gitignore              # Git ignore
├── package.json            # Dependencies
└── server.js               # Entry point
```

## Supported File Types

### Images
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG

### Documents
- PDF
- Plain Text (.txt)
- Markdown (.md)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)


## Database Schema

```javascript
{
  filename: String,
  originalName: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadDate: Date,
  aiTags: [String],
  summary: String,
  analyzed: Boolean,
  analysisDate: Date,
  analysisError: String
}
```





