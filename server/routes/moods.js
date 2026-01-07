const express = require('express');
const MoodLog = require('../models/MoodLog');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Get mood logs
router.get('/', async (req, res) => {
  try {
    const { days = 30, page = 1, limit = 50 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const query = {
      userId: req.user.id,
      createdAt: { $gte: startDate }
    };

    const moods = await MoodLog.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await MoodLog.countDocuments(query);
    
    res.json({ 
      success: true, 
      moods,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get mood logs error:', error);
    res.status(500).json({ error: 'Error fetching mood logs' });
  }
});

// Get mood analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moodDistribution = await MoodLog.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          createdAt: { $gte: startDate }
        } 
      },
      { 
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const intensityTrend = await MoodLog.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          avgIntensity: { $avg: '$intensity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalLogs = await MoodLog.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: startDate }
    });

    res.json({ 
      success: true, 
      analytics: {
        totalLogs,
        moodDistribution,
        intensityTrend,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// Create mood log
router.post('/', async (req, res) => {
  try {
    const mood = await MoodLog.create({
      userId: req.user.id,
      ...req.body
    });
    
    res.status(201).json({ success: true, mood });
  } catch (error) {
    console.error('Create mood log error:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating mood log' 
    });
  }
});

// Get single mood log
router.get('/:id', async (req, res) => {
  try {
    const mood = await MoodLog.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    if (!mood.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ success: true, mood });
  } catch (error) {
    console.error('Get mood log error:', error);
    res.status(500).json({ error: 'Error fetching mood log' });
  }
});

// Update mood log
router.put('/:id', async (req, res) => {
  try {
    const mood = await MoodLog.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    if (!mood.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(mood, req.body);
    await mood.save();

    res.json({ success: true, mood });
  } catch (error) {
    console.error('Update mood log error:', error);
    res.status(500).json({ error: 'Error updating mood log' });
  }
});

// Delete mood log
router.delete('/:id', async (req, res) => {
  try {
    const mood = await MoodLog.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    if (!mood.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await mood.deleteOne();

    res.json({
      success: true,
      message: 'Mood log deleted successfully'
    });
  } catch (error) {
    console.error('Delete mood log error:', error);
    res.status(500).json({ error: 'Error deleting mood log' });
  }
});

module.exports = router;