const mongoose = require('mongoose');

// Activity Types Enum
const ACTIVITY_TYPES = [
    'sowing', 'transplanting', 'irrigation', 'fertilizer', 
    'pesticide', 'herbicide', 'field_preparation', 'harvesting',
    'weeding', 'maintenance', 'labor', 'payment', 'issue',
    'inspection', 'soil_testing', 'pruning', 'thinning'
];

// Status Enum
const STATUS_TYPES = ['upcoming', 'in_progress', 'completed', 'missed', 'delayed', 'cancelled'];

const timelineActivitySchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Basic Information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    
    // Activity Type & Category
    type: {
        type: String,
        enum: ACTIVITY_TYPES,
        required: true
    },
    category: {
        type: String,
        enum: ['crop', 'resource', 'financial', 'labor', 'maintenance', 'other'],
        default: 'crop'
    },
    
    // Status Tracking
    status: {
        type: String,
        enum: STATUS_TYPES,
        default: 'upcoming'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    
    // Date & Time Management
    plannedDate: {
        type: Date,
        required: true
    },
    plannedStartTime: String,
    plannedEndTime: String,
    
    actualDate: Date,
    actualStartTime: String,
    actualEndTime: String,
    
    duration: {  // in hours
        type: Number,
        default: 1
    },
    
    // Associations
    crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    },
    cropName: String, // Denormalized for quick access
    cropVariety: String,
    
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
    },
    fieldName: String,
    area: Number, // in acres
    
    // Worker Management
    assignedTo: [{
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Worker'
        },
        workerName: String,
        role: String,
        hoursWorked: Number,
        wage: Number
    }],
    
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Resource Usage
    resources: [{
        name: String,
        quantity: Number,
        unit: String,
        cost: Number,
        supplier: String
    }],
    
    // Financial Tracking
    costEstimate: Number,
    actualCost: Number,
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    },
    
    // Attachments & Evidence
    attachments: [{
        filename: String,
        url: String,
        type: String, // photo, invoice, report, other
        uploadedAt: Date
    }],
    
    // Issues & Alerts
    issues: [{
        type: String,
        description: String,
        reportedAt: Date,
        resolved: Boolean
    }],
    
    weatherImpact: {
        alertType: String,
        impact: String,
        notes: String
    },
    
    // Communication
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: String,
        userRole: String,
        text: String,
        createdAt: Date,
        attachments: [String]
    }],
    
    // Analytics & Performance
    efficiencyScore: Number, // 1-10
    delayReason: String,
    qualityCheck: {
        passed: Boolean,
        notes: String,
        checkedBy: String,
        checkedAt: Date
    },
    
    // Audit Trail
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    source: {
        type: String,
        enum: ['manual', 'crop_plan', 'reminder', 'weather', 'ai_generated'],
        default: 'manual'
    },
    
    // Metadata
    tags: [String],
    isRecurring: Boolean,
    recurrencePattern: String, // daily, weekly, monthly
    
    // Offline Support
    offlineId: String,
    syncStatus: {
        type: String,
        enum: ['synced', 'pending', 'conflict'],
        default: 'synced'
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for fast queries
timelineActivitySchema.index({ farmer: 1, plannedDate: 1 });
timelineActivitySchema.index({ farmer: 1, status: 1 });
timelineActivitySchema.index({ farmer: 1, crop: 1 });
timelineActivitySchema.index({ farmer: 1, type: 1 });
timelineActivitySchema.index({ farmer: 1, 'assignedTo.worker': 1 });
timelineActivitySchema.index({ plannedDate: 1, status: 'upcoming' });

// Pre-save middleware
timelineActivitySchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Auto-calculate delay if completed after planned date
    if (this.status === 'completed' && this.actualDate && this.plannedDate) {
        const delayDays = Math.floor((this.actualDate - this.plannedDate) / (1000 * 60 * 60 * 24));
        if (delayDays > 0) {
            this.status = 'delayed';
            this.delayReason = this.delayReason || 'Completed late';
        }
    }
    
    next();
});

// Static method to get overdue activities
timelineActivitySchema.statics.getOverdueActivities = function(farmerId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.find({
        farmer: farmerId,
        status: 'upcoming',
        plannedDate: { $lt: today }
    });
};

// Method to mark activity as in progress
timelineActivitySchema.methods.startActivity = function() {
    this.status = 'in_progress';
    this.actualStartTime = new Date().toLocaleTimeString();
    return this.save();
};

// Method to complete activity
timelineActivitySchema.methods.completeActivity = function(notes, attachments) {
    this.status = 'completed';
    this.actualDate = new Date();
    this.actualEndTime = new Date().toLocaleTimeString();
    
    if (notes) this.comments.push({
        user: this.updatedBy,
        text: notes,
        createdAt: new Date()
    });
    
    if (attachments) this.attachments.push(...attachments);
    
    return this.save();
};

module.exports = mongoose.model('TimelineActivity', timelineActivitySchema);
