const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  prompt: {
    type: String,
    required: [true, 'Journal prompt is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
    trim: true,
    minlength: [1, 'Content cannot be empty'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'tired', 'grateful', 'peaceful', 'stressed', 'neutral'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate word count
journalEntrySchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).length;
  }
  next();
});

// Indexes for faster queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, mood: 1 });

// Method to check if entry belongs to user
journalEntrySchema.methods.belongsToUser = function(userId) {
  return this.userId.toString() === userId.toString();
};

journalEntrySchema.set('toJSON', { virtuals: true });
journalEntrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);