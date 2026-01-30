const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TimelineActivity = require('../models/Timeline');
const { Crop, Worker } = require('../models');

// Get all timeline activities with filters
router.get('/', auth, async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            status,
            type,
            crop,
            field,
            worker,
            category,
            priority,
            search
        } = req.query;
        
        let query = { farmer: req.user.id };
        
        // Date filter
        if (startDate || endDate) {
            query.plannedDate = {};
            if (startDate) query.plannedDate.$gte = new Date(startDate);
            if (endDate) query.plannedDate.$lte = new Date(endDate);
        }
        
        // Status filter
        if (status) query.status = status;
        if (type) query.type = type;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (crop) query.crop = crop;
        if (field) query.field = field;
        
        // Worker filter
        if (worker) {
            query['assignedTo.worker'] = worker;
        }
        
        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { cropName: { $regex: search, $options: 'i' } }
            ];
        }
        
        const activities = await TimelineActivity.find(query)
            .populate('crop', 'name variety area')
            // .populate('field', 'name size location') // Field model might not exist
            .populate('assignedTo.worker', 'name phone')
            .sort({ plannedDate: 1, priority: -1 })
            .lean();
        
        // Get today's activities
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayActivities = activities.filter(activity => {
            const activityDate = new Date(activity.plannedDate);
            return activityDate >= today && activityDate < tomorrow;
        });
        
        // Get overdue activities
        const overdueActivities = activities.filter(activity => 
            activity.status === 'upcoming' && 
            new Date(activity.plannedDate) < today
        );
        
        res.json({
            activities,
            stats: {
                total: activities.length,
                upcoming: activities.filter(a => a.status === 'upcoming').length,
                inProgress: activities.filter(a => a.status === 'in_progress').length,
                completed: activities.filter(a => a.status === 'completed').length,
                overdue: overdueActivities.length,
                today: todayActivities.length
            },
            todayActivities,
            overdueActivities,
            filters: req.query
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get activity by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const activity = await TimelineActivity.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('crop', 'name variety area status')
        // .populate('field', 'name size location')
        .populate('assignedTo.worker', 'name phone role')
        .populate('comments.user', 'name role');
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new activity
router.post('/', auth, async (req, res) => {
    try {
        const activityData = {
            ...req.body,
            farmer: req.user.id,
            createdBy: req.user.id,
            updatedBy: req.user.id
        };
        
        // Auto-populate crop name if crop ID is provided
        if (activityData.crop) {
            const crop = await Crop.findById(activityData.crop);
            if (crop) {
                activityData.cropName = crop.name;
                activityData.cropVariety = crop.variety;
            }
        }
        
        const activity = new TimelineActivity(activityData);
        await activity.save();
        
        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update activity
router.put('/:id', auth, async (req, res) => {
    try {
        const activity = await TimelineActivity.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            { 
                ...req.body,
                updatedBy: req.user.id,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete activity
router.delete('/:id', auth, async (req, res) => {
    try {
        const activity = await TimelineActivity.findOneAndDelete({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start activity (mark as in progress)
router.post('/:id/start', auth, async (req, res) => {
    try {
        const activity = await TimelineActivity.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        await activity.startActivity();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Complete activity
router.post('/:id/complete', auth, async (req, res) => {
    try {
        const { notes, attachments, actualCost, efficiencyScore } = req.body;
        
        const activity = await TimelineActivity.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        if (actualCost) activity.actualCost = actualCost;
        if (efficiencyScore) activity.efficiencyScore = efficiencyScore;
        
        await activity.completeActivity(notes, attachments);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment to activity
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { text, attachments } = req.body;
        
        const activity = await TimelineActivity.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        activity.comments.push({
            user: req.user.id,
            userName: req.user.name,
            userRole: req.user.role,
            text,
            attachments: attachments || [],
            createdAt: new Date()
        });
        
        await activity.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload attachment
router.post('/:id/attachments', auth, async (req, res) => {
    try {
        const { filename, url, type } = req.body;
        
        const activity = await TimelineActivity.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        activity.attachments.push({
            filename,
            url,
            type: type || 'photo',
            uploadedAt: new Date()
        });
        
        await activity.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get analytics
router.get('/analytics/overview', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.plannedDate = {};
            if (startDate) dateFilter.plannedDate.$gte = new Date(startDate);
            if (endDate) dateFilter.plannedDate.$lte = new Date(endDate);
        }
        
        const activities = await TimelineActivity.find({
            farmer: req.user.id,
            ...dateFilter
        });
        
        // Calculate analytics
        const totalActivities = activities.length;
        const completedActivities = activities.filter(a => a.status === 'completed');
        const totalCost = completedActivities.reduce((sum, a) => sum + (a.actualCost || 0), 0);
        const totalLaborHours = completedActivities.reduce((sum, a) => {
            return sum + (a.assignedTo?.reduce((h, w) => h + (w.hoursWorked || 0), 0) || 0);
        }, 0);
        
        // Activity type distribution
        const typeDistribution = activities.reduce((acc, activity) => {
            acc[activity.type] = (acc[activity.type] || 0) + 1;
            return acc;
        }, {});
        
        // Completion rate by type
        const completionRate = Object.keys(typeDistribution).reduce((acc, type) => {
            const typeActivities = activities.filter(a => a.type === type);
            const completed = typeActivities.filter(a => a.status === 'completed').length;
            acc[type] = {
                total: typeActivities.length,
                completed,
                rate: typeActivities.length > 0 ? (completed / typeActivities.length * 100).toFixed(1) : 0
            };
            return acc;
        }, {});
        
        // Average delay
        const delayedActivities = completedActivities.filter(a => 
            a.actualDate && a.plannedDate && a.actualDate > a.plannedDate
        );
        const avgDelay = delayedActivities.length > 0 
            ? delayedActivities.reduce((sum, a) => {
                const delay = Math.floor((a.actualDate - a.plannedDate) / (1000 * 60 * 60 * 24));
                return sum + delay;
            }, 0) / delayedActivities.length
            : 0;
        
        res.json({
            overview: {
                totalActivities,
                completedActivities: completedActivities.length,
                completionRate: totalActivities > 0 ? (completedActivities.length / totalActivities * 100).toFixed(1) : 0,
                totalCost,
                totalLaborHours,
                avgDelay: avgDelay.toFixed(1)
            },
            typeDistribution,
            completionRate,
            topCrops: getTopCrops(activities),
            efficiencyTrends: getEfficiencyTrends(activities),
            upcomingSchedule: await getUpcomingSchedule(req.user.id)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
function getTopCrops(activities) {
    const cropCount = activities.reduce((acc, activity) => {
        if (activity.cropName) {
            acc[activity.cropName] = (acc[activity.cropName] || 0) + 1;
        }
        return acc;
    }, {});
    
    return Object.entries(cropCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([crop, count]) => ({ crop, count }));
}

function getEfficiencyTrends(activities) {
    const monthlyData = activities.reduce((acc, activity) => {
        if (activity.actualDate && activity.efficiencyScore) {
            const month = activity.actualDate.toISOString().slice(0, 7); // YYYY-MM
            if (!acc[month]) acc[month] = { total: 0, sum: 0 };
            acc[month].total++;
            acc[month].sum += activity.efficiencyScore;
        }
        return acc;
    }, {});
    
    return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        avgEfficiency: (data.sum / data.total).toFixed(1)
    }));
}

async function getUpcomingSchedule(farmerId) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return TimelineActivity.find({
        farmer: farmerId,
        status: 'upcoming',
        plannedDate: { $lte: nextWeek }
    })
    .sort({ plannedDate: 1 })
    .limit(10)
    .select('title type plannedDate cropName priority')
    .lean();
}

// Generate activities from crop plan
router.post('/generate-from-plan', auth, async (req, res) => {
    try {
        const { cropId, startDate } = req.body;
        
        const crop = await Crop.findOne({
            _id: cropId,
            farmer: req.user.id
        });
        
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        const sowingDate = new Date(startDate || crop.sowingDate);
        const activities = [];
        
        // Generate standard activities based on crop type
        const cropActivities = getCropActivities(crop.name, sowingDate, crop.area);
        
        for (const activityData of cropActivities) {
            const activity = new TimelineActivity({
                farmer: req.user.id,
                crop: crop._id,
                cropName: crop.name,
                cropVariety: crop.variety,
                area: crop.area,
                createdBy: req.user.id,
                updatedBy: req.user.id,
                source: 'crop_plan',
                ...activityData
            });
            
            await activity.save();
            activities.push(activity);
        }
        
        res.json({
            message: `Generated ${activities.length} activities from crop plan`,
            activities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function getCropActivities(cropName, sowingDate, area) {
    const activities = [];
    const baseDate = new Date(sowingDate);
    
    // Common activities for most crops
    activities.push({
        title: `Field Preparation - ${cropName}`,
        type: 'field_preparation',
        plannedDate: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
        duration: 8,
        priority: 'high',
        description: 'Prepare land for sowing',
        resources: [
            { name: 'Labor', quantity: 2, unit: 'persons', cost: 800 },
            { name: 'Tractor', quantity: 4, unit: 'hours', cost: 2000 }
        ]
    });
    
    activities.push({
        title: `Sowing - ${cropName}`,
        type: 'sowing',
        plannedDate: baseDate,
        duration: 6,
        priority: 'critical',
        description: 'Sow seeds in prepared field'
    });
    
    // Add more crop-specific activities
    if (cropName.toLowerCase() === 'rice') {
        activities.push(
            {
                title: 'Transplanting',
                type: 'transplanting',
                plannedDate: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
                duration: 8,
                priority: 'high'
            },
            {
                title: 'First Irrigation',
                type: 'irrigation',
                plannedDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
                duration: 4,
                priority: 'medium'
            }
        );
    }
    
    return activities;
}

module.exports = router;
