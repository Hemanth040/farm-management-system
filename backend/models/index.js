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
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'CropPlan' },
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

// Farmer Profile Schema (extends User)
const farmerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmName: String,
    totalArea: Number,
    location: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
    createdAt: { type: Date, default: Date.now }
});

// Reminder Schema
const reminderSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    type: { type: String, enum: ['activity', 'payment', 'harvest', 'other'], default: 'activity' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Warning/Alert Schema
const warningSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['weather', 'pest', 'disease', 'market', 'other'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    message: { type: String, required: true },
    details: String,
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Sale Schema
const saleSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    cropName: String,
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    pricePerUnit: { type: Number, required: true },
    totalAmount: Number,
    buyer: {
        name: String,
        contact: String,
        type: { type: String, enum: ['individual', 'market', 'contractor', 'government'] }
    },
    saleDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { 
        type: String, 
        enum: ['seeds', 'fertilizers', 'pesticides', 'labor', 'equipment', 'fuel', 'transport', 'storage', 'rent', 'other'],
        required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    vendor: String,
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    receipt: String,
    createdAt: { type: Date, default: Date.now }
});

// Income Schema
const incomeSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: { 
        type: String, 
        enum: ['crop_sale', 'livestock', 'dairy', 'poultry', 'subsidy', 'rent', 'other'],
        required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    buyer: String,
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    receipt: String,
    createdAt: { type: Date, default: Date.now }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    type: { 
        type: String, 
        enum: ['sowing', 'irrigation', 'fertilizer', 'pest-control', 'weeding', 'harvesting', 'other'],
        required: true 
    },
    description: String,
    date: { type: Date, required: true },
    duration: Number, // in hours
    workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    cost: Number,
    status: { type: String, enum: ['planned', 'in-progress', 'completed'], default: 'planned' },
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    date: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['present', 'absent', 'half_day', 'leave'],
        required: true 
    },
    checkIn: String,
    checkOut: String,
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    wageAmount: { type: Number, default: 0 },
    notes: String,
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// Wage Record Schema
const wageRecordSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMode: { 
        type: String, 
        enum: ['cash', 'bank_transfer', 'upi', 'check'],
        default: 'cash'
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'partial', 'cancelled'],
        default: 'pending'
    },
    period: {
        start: Date,
        end: Date
    },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    attendanceDays: { type: Number, default: 0 },
    notes: String,
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionId: String,
    createdAt: { type: Date, default: Date.now }
});

// Worker Issue Schema
const workerIssueSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['equipment_damage', 'crop_problem', 'safety', 'resource_shortage', 'other'],
        required: true 
    },
    title: { type: String, required: true },
    description: String,
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    photos: [String],
    status: { 
        type: String, 
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    resolution: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

// Leave Request Schema
const leaveRequestSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { 
        type: String, 
        enum: ['sick', 'casual', 'emergency', 'festival', 'other'],
        required: true 
    },
    reason: String,
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// Create models (checking if they exist first to prevent overwrite errors in some environments)
const Crop = mongoose.models.Crop || mongoose.model('Crop', cropSchema);
const CropPlan = mongoose.models.CropPlan || mongoose.model('CropPlan', cropPlanSchema);
const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', timelineEventSchema);
const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);
const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
const Warning = mongoose.models.Warning || mongoose.model('Warning', warningSchema);
const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
const Income = mongoose.models.Income || mongoose.model('Income', incomeSchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const WageRecord = mongoose.models.WageRecord || mongoose.model('WageRecord', wageRecordSchema);
const WorkerIssue = mongoose.models.WorkerIssue || mongoose.model('WorkerIssue', workerIssueSchema);
const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);

// Import existing models
const User = require('./User');
const Worker = require('./Worker');
const Field = require('./Field');
const TimelineActivity = require('./Timeline');
const Resource = require('./Resource');
const { FinancialTransaction, Budget } = require('./Financial');
const CropHealth = require('./CropHealth');
const Disease = require('./DiseaseDatabase');

module.exports = {
    User,
    Crop,
    CropPlan,
    TimelineEvent,
    Activity,
    Worker,
    Field,
    TimelineActivity,
    Resource,
    FinancialTransaction,
    Budget,
    CropHealth,
    Disease,
    Farmer,
    Reminder,
    Warning,
    Sale,
    Expense,
    Income,
    Attendance,
    WageRecord,
    WorkerIssue,
    LeaveRequest
};