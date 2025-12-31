const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['walk', 'call', 'letter', 'yoga', 'breathing', 'organize', 'read', 'tea', 'draw', 'music', 'garden', 'meditation', 'detox']
  },
  activityName: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, completed: 1 });

// Method to check if activity belongs to user
activitySchema.methods.belongsToUser = function(userId) {
  return this.userId.toString() === userId.toString();
};

activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Activity', activitySchema);