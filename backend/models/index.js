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

// Enhanced Reminder Schema
const reminderSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Basic Info
    title: { type: String, required: true },
    description: String,
    
    // Scheduling
    date: { type: Date, required: true },
    time: String, // Optional time (HH:MM format)
    timezone: { type: String, default: 'Asia/Kolkata' },
    
    // Type & Category
    type: { 
        type: String, 
        enum: ['activity', 'payment', 'resource', 'harvest', 'custom', 'financial'],
        required: true 
    },
    category: {
        type: String,
        enum: ['sowing', 'irrigation', 'fertilizer', 'pesticide', 'herbicide', 'weeding', 'harvesting', 
               'worker_payment', 'buyer_payment', 'loan_emi', 'input_purchase',
               'stock_refill', 'equipment_service', 'fuel_refill', 'other'],
        default: 'other'
    },
    
    // Priority & Status
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'], 
        default: 'medium' 
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'skipped', 'snoozed', 'cancelled'], 
        default: 'pending' 
    },
    
    // Linked Entities
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialTransaction' },
    
    // Recurrence
    recurrence: {
        isRecurring: { type: Boolean, default: false },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
        interval: { type: Number, default: 1 }, // Every X days/weeks/months
        endDate: Date,
        occurrences: { type: Number, default: 0 } // 0 = infinite
    },
    parentReminder: { type: mongoose.Schema.Types.ObjectId, ref: 'Reminder' }, // For recurring instances
    
    // Actions & Notifications
    actions: {
        primary: {
            label: String,
            action: String,
            link: String
        },
        secondary: [{
            label: String,
            action: String,
            link: String
        }]
    },
    
    // Snooze
    snooze: {
        snoozedUntil: Date,
        snoozeCount: { type: Number, default: 0 }
    },
    
    // Completion Info
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completionNotes: String,
    
    // Auto-generation
    isAutoGenerated: { type: Boolean, default: false },
    source: { type: String, enum: ['manual', 'crop_planner', 'activity_timeline', 'resource_threshold', 'financial_due', 'system'] },
    
    // Notifications
    notifications: {
        inApp: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        email: { type: Boolean, default: false }
    },
    notificationSent: { type: Boolean, default: false },
    
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Enhanced Warning/Alert Schema
const warningSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Warning Type
    type: { 
        type: String, 
        enum: ['weather', 'pest', 'disease', 'market', 'activity_delay', 'resource', 'weed', 'health', 'worker', 'equipment', 'supervisor'],
        required: true 
    },
    category: {
        type: String,
        enum: ['heavy_rain', 'heatwave', 'frost', 'wind', 'drought', 'flood',
               'pest_outbreak', 'disease_spread', 'nutrient_deficiency',
               'weed_infestation', 'activity_overdue', 'worker_absent',
               'resource_low', 'resource_expiry', 'equipment_breakdown',
               'payment_overdue', 'price_drop', 'supervisory_advisory'],
        required: true
    },
    
    // Severity & Priority
    severity: { 
        type: String, 
        enum: ['informational', 'low', 'medium', 'high', 'critical'], 
        required: true 
    },
    priority: { type: Number, default: 0 }, // For sorting (higher = more important)
    
    // Content
    title: { type: String, required: true },
    message: { type: String, required: true },
    details: String,
    impact: String, // What will happen if ignored
    
    // Affected Entities
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    weedIssue: { type: mongoose.Schema.Types.ObjectId, ref: 'WeedIssue' },
    healthRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'CropHealth' },
    
    // Actionable Items
    actionRequired: { type: String, required: true },
    suggestedActions: [{
        action: String,
        priority: { type: String, enum: ['immediate', 'soon', 'when_convenient'] },
        estimatedTime: String,
        link: String
    }],
    
    // Weather Data (if weather warning)
    weatherData: {
        condition: String,
        startTime: Date,
        endTime: Date,
        intensity: String,
        probability: Number
    },
    
    // Predictive Info
    isPredictive: { type: Boolean, default: false },
    confidence: { type: Number, min: 0, max: 100 },
    predictionBasis: String,
    
    // Status & Tracking
    status: { 
        type: String, 
        enum: ['active', 'acknowledged', 'action_taken', 'resolved', 'expired', 'dismissed'], 
        default: 'active' 
    },
    isRead: { type: Boolean, default: false },
    acknowledgedAt: Date,
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actionTaken: String,
    
    // Expiry
    expiresAt: Date,
    validUntil: Date,
    
    // Auto-generation
    isAutoGenerated: { type: Boolean, default: true },
    source: { type: String, enum: ['system', 'supervisor', 'worker', 'weather_api', 'crop_planner', 'ai_prediction'] },
    sourceId: String, // ID of triggering entity
    
    // Notifications
    notifications: {
        inApp: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        email: { type: Boolean, default: false }
    },
    notificationSent: { type: Boolean, default: false },
    notificationSentAt: Date,
    
    // Dismissal
    dismissedAt: Date,
    dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dismissReason: String,
    
    // Language
    language: { type: String, default: 'en' },
    localMessage: String, // Local language message
    
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Notification Log Schema
const notificationLogSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['reminder', 'warning'], required: true },
    entity: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityModel' },
    entityModel: { type: String, enum: ['Reminder', 'Warning'] },
    channel: { type: String, enum: ['in_app', 'push', 'sms', 'email'], required: true },
    status: { type: String, enum: ['sent', 'delivered', 'failed', 'read'], default: 'sent' },
    content: String,
    sentAt: { type: Date, default: Date.now },
    deliveredAt: Date,
    readAt: Date,
    error: String
});

// Sale Schema - Comprehensive selling management
const saleSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Produce Details
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
    cropName: { type: String, required: true },
    variety: String,
    
    // Quality & Quantity
    quality: {
        grade: { type: String, enum: ['A', 'B', 'C', 'Premium', 'Standard'], default: 'Standard' },
        moistureContent: Number,
        notes: String
    },
    quantity: {
        value: { type: Number, required: true },
        unit: { type: String, enum: ['kg', 'quintal', 'ton', 'bag'], default: 'kg' }
    },
    
    // Sale Details
    saleDate: { type: Date, default: Date.now },
    pricePerUnit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    
    // Buyer Details
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
    buyerName: String,
    buyerType: { type: String, enum: ['trader', 'mill', 'market', 'direct_consumer', 'contractor', 'government'] },
    
    // Sale Channel
    saleChannel: { 
        type: String, 
        enum: ['mandi', 'trader', 'direct', 'contract', 'online'],
        required: true 
    },
    
    // Payment Details
    payment: {
        status: { 
            type: String, 
            enum: ['pending', 'partial', 'paid', 'overdue'],
            default: 'pending'
        },
        mode: { 
            type: String, 
            enum: ['cash', 'upi', 'bank_transfer', 'check'],
            default: 'cash'
        },
        amountPaid: { type: Number, default: 0 },
        amountPending: { type: Number, default: 0 },
        dueDate: Date,
        installments: [{
            date: Date,
            amount: Number,
            mode: String,
            reference: String
        }]
    },
    
    // Financial Linking
    linkedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialTransaction' },
    
    // Quality Documentation
    documents: {
        weightSlip: String,
        qualityCertificate: String,
        invoice: String,
        receipt: String
    },
    
    // Cost Analysis
    costAnalysis: {
        productionCost: Number,
        transportCost: Number,
        packagingCost: Number,
        otherCosts: Number,
        totalCost: Number
    },
    profit: Number,
    profitMargin: Number,
    
    // Contract Details
    contract: {
        isContractSale: { type: Boolean, default: false },
        contractId: String,
        agreedPrice: Number,
        deliveryDate: Date,
        terms: String
    },
    
    // Transport Details
    transport: {
        vehicleNumber: String,
        driverName: String,
        driverPhone: String,
        distance: Number,
        cost: Number
    },
    
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Buyer Schema
const buyerSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: String,
    email: String,
    type: { 
        type: String, 
        enum: ['trader', 'mill', 'market', 'direct_consumer', 'contractor', 'exporter', 'government'],
        required: true 
    },
    location: {
        address: String,
        city: String,
        state: String,
        mandiName: String
    },
    businessName: String,
    gstNumber: String,
    licenseNumber: String,
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    },
    upiId: String,
    preferredCrops: [String],
    preferredPaymentMode: String,
    performance: {
        totalTransactions: { type: Number, default: 0 },
        totalVolume: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        averagePrice: { type: Number, default: 0 },
        averagePaymentDelay: { type: Number, default: 0 },
        reliability: { type: Number, default: 5, min: 1, max: 5 },
        lastTransaction: Date
    },
    status: { type: String, enum: ['active', 'inactive', 'blacklisted'], default: 'active' },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Market Price Schema
const marketPriceSchema = new mongoose.Schema({
    crop: { type: String, required: true },
    variety: String,
    market: {
        name: String,
        location: String,
        state: String,
        type: { type: String, enum: ['mandi', 'apmc', 'private', 'online'] }
    },
    price: {
        min: Number,
        max: Number,
        avg: Number,
        unit: { type: String, default: 'quintal' }
    },
    quality: {
        grade: String,
        description: String
    },
    date: { type: Date, default: Date.now },
    trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    source: String,
    confidence: { type: Number, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now }
});

// Selling Alert Schema
const sellingAlertSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['payment_overdue', 'price_drop', 'best_selling_window', 'contract_reminder'],
        required: true 
    },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
    title: String,
    message: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
    actionRequired: String,
    actionTaken: String,
    createdAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    resolvedAt: Date
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
const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', notificationLogSchema);

// Import existing models
const User = require('./User');
const Worker = require('./Worker');
const Field = require('./Field');
const TimelineActivity = require('./Timeline');
const Resource = require('./Resource');
const { FinancialTransaction, Budget } = require('./Financial');
const CropHealth = require('./CropHealth');
const Disease = require('./DiseaseDatabase');
const Weed = require('./Weed');
const WeedIssue = require('./WeedIssue');

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
    Weed,
    WeedIssue,
    Farmer,
    Reminder,
    Warning,
    Sale,
    Expense,
    Income,
    Attendance,
    WageRecord,
    WorkerIssue,
    LeaveRequest,
    NotificationLog
};