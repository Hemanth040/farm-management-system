const mongoose = require('mongoose');

// Worker Schema - Comprehensive Worker Management
const workerSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Basic Information
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: String,
    photo: String, // URL to photo
    address: String,
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    
    // Employment Details
    workerType: { 
        type: String, 
        enum: ['permanent', 'temporary', 'seasonal', 'contract'],
        default: 'temporary'
    },
    role: { 
        type: String, 
        enum: ['worker', 'supervisor', 'machine_operator', 'specialist', 'helper'],
        default: 'worker'
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'on_leave', 'terminated'],
        default: 'active'
    },
    
    // Skills & Experience
    skills: [{
        type: String,
        enum: ['harvesting', 'planting', 'spraying', 'irrigation', 'machinery', 'pruning', 'packing', 'maintenance', 'supervision']
    }],
    experience: {
        years: { type: Number, default: 0 },
        description: String
    },
    certifications: [{
        name: String,
        issuedBy: String,
        issueDate: Date,
        expiryDate: Date,
        document: String
    }],
    
    // Wage Information
    wageType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'task_based', 'hourly'],
        default: 'daily'
    },
    wageAmount: { type: Number, default: 0 }, // in rupees
    currency: { type: String, default: 'INR' },
    
    // Payment Details
    bankDetails: {
        accountHolder: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    },
    upiId: String,
    preferredPaymentMode: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi'],
        default: 'cash'
    },
    
    // Joining & Contract
    joiningDate: { type: Date, default: Date.now },
    contractEndDate: Date,
    
    // Work Assignments
    currentAssignments: [{
        activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
        field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
        crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
        startDate: Date,
        endDate: Date,
        status: { type: String, enum: ['assigned', 'in_progress', 'completed'], default: 'assigned' }
    }],
    
    // Attendance Summary (cached for quick access)
    attendanceSummary: {
        totalDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        absentDays: { type: Number, default: 0 },
        halfDays: { type: Number, default: 0 },
        lastUpdated: Date
    },
    
    // Wage Summary (cached)
    wageSummary: {
        totalEarned: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        pendingAmount: { type: Number, default: 0 },
        lastPaymentDate: Date,
        lastUpdated: Date
    },
    
    // Performance Metrics
    performance: {
        tasksCompleted: { type: Number, default: 0 },
        tasksAssigned: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        issuesReported: { type: Number, default: 0 },
        lastUpdated: Date
    },
    
    // Device/Access Info (for self-service)
    deviceInfo: {
        deviceId: String,
        lastLogin: Date,
        fcmToken: String // For push notifications
    },
    
    // Notes
    notes: String,
    
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Pre-save middleware to update timestamps
workerSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for fast queries
workerSchema.index({ farmer: 1, status: 1 });
workerSchema.index({ farmer: 1, workerType: 1 });
workerSchema.index({ farmer: 1, skills: 1 });
workerSchema.index({ phone: 1 });

module.exports = mongoose.model('Worker', workerSchema);
