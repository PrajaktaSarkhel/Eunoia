const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Get all activities
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, completed } = req.query;
    
    const query = { userId: req.user.id };
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    const activities = await Activity.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Activity.countDocuments(query);

    res.json({
      success: true,
      activities,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Error fetching activities' });
  }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalActivities = await Activity.countDocuments({ userId });
    const completedActivities = await Activity.countDocuments({ 
      userId, 
      completed: true 
    });
    
    const activityTypeStats = await Activity.aggregate([
      { $match: { userId: req.user._id, completed: true } },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalDuration = await Activity.aggregate([
      { $match: { userId: req.user._id, completed: true } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalActivities,
        completedActivities,
        completionRate: totalActivities > 0 
          ? Math.round((completedActivities / totalActivities) * 100) 
          : 0,
        totalMinutes: totalDuration[0]?.total || 0,
        byType: activityTypeStats
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Error fetching activity statistics' });
  }
});

// Create activity
router.post('/', async (req, res) => {
  try {
    const activity = await Activity.create({
      userId: req.user.id,
      ...req.body
    });
    
    if (activity.completed) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 
          'stats.totalActivitiesCompleted': 1,
          'stats.totalDetoxMinutes': activity.duration || 0
        }
      });
    }
    
    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating activity' 
    });
  }
});

// Update activity
router.put('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (!activity.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(activity, req.body);
    await activity.save();
    
    res.json({ success: true, activity });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Error updating activity' });
  }
});

// Mark activity as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (!activity.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    activity.completed = true;
    activity.completedAt = new Date();
    await activity.save();
    
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 
        'stats.totalActivitiesCompleted': 1,
        'stats.totalDetoxMinutes': activity.duration || 0
      }
    });
    
    res.json({ success: true, activity });
  } catch (error) {
    console.error('Complete activity error:', error);
    res.status(500).json({ error: 'Error completing activity' });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (!activity.belongsToUser(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await activity.deleteOne();
    
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});

module.exports = router;