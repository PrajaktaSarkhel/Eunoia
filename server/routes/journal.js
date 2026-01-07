const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Get all entries
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, mood, sortBy = '-createdAt' } = req.query;
    
    const query = { userId: req.user.id };
    if (mood) query.mood = mood;

    const entries = await JournalEntry.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await JournalEntry.countDocuments(query);

    res.json({
      success: true,
      entries,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Error fetching journal entries' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const totalEntries = await JournalEntry.countDocuments({ userId });
    
    const moodStats = await JournalEntry.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalWords = await JournalEntry.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$wordCount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalEntries,
        totalWords: totalWords[0]?.total || 0,
        moodDistribution: moodStats,
        averageWordsPerEntry: totalEntries > 0 
          ? Math.round((totalWords[0]?.total || 0) / totalEntries) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (!entry.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Error fetching journal entry' });
  }
});

// Create entry
router.post('/', async (req, res) => {
  try {
    const { prompt, content, mood, tags } = req.body;

    const entry = await JournalEntry.create({
      userId: req.user.id,
      prompt,
      content,
      mood,
      tags
    });

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalJournalEntries': 1 }
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating journal entry' 
    });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  try {
    const { content, mood, tags } = req.body;

    let entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (!entry.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (content !== undefined) entry.content = content;
    if (mood !== undefined) entry.mood = mood;
    if (tags !== undefined) entry.tags = tags;
    entry.editedAt = Date.now();

    await entry.save();

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Error updating journal entry' });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (!entry.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await entry.deleteOne();

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalJournalEntries': -1 }
    });

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Error deleting journal entry' });
  }
});

module.exports = router;