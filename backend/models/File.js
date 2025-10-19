const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // AI Analysis fields
  aiTags: {
    type: [String],
    default: []
  },
  summary: {
    type: String,
    default: ''
  },
  analyzed: {
    type: Boolean,
    default: false
  },
  analysisDate: {
    type: Date,
    default: null
  },
  analysisError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
fileSchema.index({ userId: 1, uploadDate: -1 });
fileSchema.index({ userId: 1, aiTags: 1 });
fileSchema.index({ userId: 1, mimetype: 1 });

// Virtual for file URL
fileSchema.virtual('url').get(function() {
  return `/uploads/${this.filename}`;
});

// Ensure virtuals are included in JSON
fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

// Helper method to check if file is an image
fileSchema.methods.isImage = function() {
  return this.mimetype.startsWith('image/');
};

// Helper method to check if file is a document
fileSchema.methods.isDocument = function() {
  const docTypes = ['application/pdf', 'text/plain', 'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return docTypes.includes(this.mimetype);
};

const File = mongoose.model('File', fileSchema);

module.exports = File;