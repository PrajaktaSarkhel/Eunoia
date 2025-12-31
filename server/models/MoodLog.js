const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'anxious', 'tired', 'grateful', 'peaceful', 'stressed', 'neutral']
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  notes: String,
  triggers: [String],
  activities: [String]
}, {
  timestamps: true
});

// Index for faster queries
moodLogSchema.index({ userId: 1, createdAt: -1 });
moodLogSchema.index({ userId: 1, mood: 1 });

// Method to check if mood log belongs to user
moodLogSchema.methods.belongsToUser = function(userId) {
  return this.userId.toString() === userId.toString();
};

moodLogSchema.set('toJSON', { virtuals: true });
moodLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MoodLog', moodLogSchema);