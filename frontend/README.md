# Personal Cloud Storage - Frontend

React-based frontend for AI-powered personal cloud storage.

## 🚀 Features

- Drag-and-drop file upload
- Real-time upload progress
- Beautiful file grid with thumbnails
- AI-generated tags display
- Search and filter by tags
- File download and deletion
- Responsive design (mobile-friendly)
- Storage statistics dashboard

## 📋 Prerequisites

- Node.js (v18 or higher)
- Backend server running on `http://localhost:5000`

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` if needed (default works with backend on port 5000):

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Running the App

```bash
npm run dev
```
App will open at `http://localhost:3000`


##  Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Tag.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── upload/
│   │   │   ├── UploadZone.jsx
│   │   │   └── UploadProgress.jsx
│   │   ├── files/
│   │   │   ├── FileGrid.jsx
│   │   │   ├── FileCard.jsx
│   │   │   └── EmptyState.jsx
│   │   └── search/
│   │       └── SearchBar.jsx
│   ├── hooks/
│   │   ├── useFiles.js
│   │   └── useUpload.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   ├── main.jsx
│   └── config.js
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```


