const mongoose = require('mongoose');

// Crop Schema
const cropSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    variety: String,
    season: { type: String, enum: ['rabi', 'kharif', 'zaid'] },
    landType: { type: String, enum: ['sandy', 'loam', 'clay'] },
    area: { type: Number, required: true },
    sowingDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date, required: true },
    soilType: String,
    waterSource: String,
    status: { 
        type: String, 
        enum: ['planned', 'sowed', 'growing', 'harvested', 'failed'],
        default: 'planned'
    },
    actualHarvestDate: Date,
    actualYield: Number,
    createdAt: { type: Date, default: Date.now }
});

// Crop Plan Schema
const cropPlanSchema = new mongoose.Schema({
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
    seedRequired: String,
    fertilizerRequired: String,
    waterRequirement: String,
    expectedYield: String,
    duration: String,
    totalCost: Number,
    operations: [{
        name: String,
        description: String,
        daysAfterSowing: Number,
        type: String,
        resources: [{
            name: String,
            quantity: Number,
            unit: String
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

// Timeline Event Schema
const timelineEventSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    title: { type: String, required: true },
    description: String,
    type: { 
        type: String, 
        enum: ['sowing', 'irrigation', 'fertilizer', 'pest-control', 'weeding', 'harvesting', 'other'],
        required: true 
    },
    date: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    completedDate: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// Create models (checking if they exist first to prevent overwrite errors in some environments)
const Crop = mongoose.models.Crop || mongoose.model('Crop', cropSchema);
const CropPlan = mongoose.models.CropPlan || mongoose.model('CropPlan', cropPlanSchema);
const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', timelineEventSchema);

// Helper for other models if needed, or simply export these
// Since the prompt provided specific models, we focus on them.
// We also need to ensure other models referenced in the app (like Activity) are available if used.
// The provided code block only showed these 3 models export. 
// However, the routes use 'Activity'. Let's include a generic definition for Activity if not defined.

const activitySchema = new mongoose.Schema({}, { strict: false });
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

module.exports = {
    Crop,
    CropPlan,
    TimelineEvent,
    Activity
};