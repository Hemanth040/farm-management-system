const mongoose = require('mongoose');

// Resource Categories
const RESOURCE_CATEGORIES = [
    'seeds', 'fertilizers', 'pesticides', 'herbicides', 'equipment', 
    'machinery', 'water', 'fuel', 'electricity', 'storage', 
    'tools', 'feed', 'medicines', 'packaging', 'other'
];

// Unit Types
const UNIT_TYPES = [
    'kg', 'g', 'liters', 'ml', 'bags', 'packets', 'units', 
    'pieces', 'boxes', 'cartons', 'hours', 'days', 'acres'
];

// Equipment Status
const EQUIPMENT_STATUS = ['active', 'maintenance', 'damaged', 'retired', 'rented'];

const resourceSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    category: {
        type: String,
        enum: RESOURCE_CATEGORIES,
        required: true
    },
    brand: String,
    model: String,
    specification: String,
    
    // Inventory Management
    unit: {
        type: String,
        enum: UNIT_TYPES,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    availableQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    usedQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    minimumThreshold: {
        type: Number,
        default: 0,
        min: 0
    },
    reorderPoint: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Location & Storage
    location: {
        type: String,
        enum: ['store_room', 'field', 'godown', 'cold_storage', 'pump_house', 'shed', 'other'],
        default: 'store_room'
    },
    storageUnit: String,
    shelfNumber: String,
    binNumber: String,
    
    // Cost & Purchase
    purchaseDate: Date,
    vendor: {
        name: String,
        contact: String,
        address: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    costPerUnit: Number,
    totalCost: Number,
    invoiceNumber: String,
    invoiceImage: String,
    warrantyPeriod: Number, // in months
    warrantyExpiry: Date,
    
    // Expiry & Safety
    manufacturingDate: Date,
    expiryDate: Date,
    shelfLife: Number, // in days
    safetyInstructions: [String],
    isHazardous: Boolean,
    handlingPrecautions: [String],
    
    // Equipment Specific
    isEquipment: {
        type: Boolean,
        default: false
    },
    equipmentType: String,
    equipmentStatus: {
        type: String,
        enum: EQUIPMENT_STATUS,
        default: 'active'
    },
    equipmentHours: Number,
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    maintenanceInterval: Number, // in hours/days
    fuelConsumption: Number, // liters per hour
    operatorRequired: Boolean,
    serviceHistory: [{
        date: Date,
        type: String,
        cost: Number,
        description: String,
        serviceBy: String,
        nextDue: Date
    }],
    
    // Crop Association
    crops: [{
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop'
        },
        cropName: String,
        usageRate: Number, // kg per acre
        applicationMethod: String,
        recommendedSeason: [String]
    }],
    
    // Usage Tracking
    usageHistory: [{
        date: Date,
        activity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TimelineActivity'
        },
        activityTitle: String,
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop'
        },
        cropName: String,
        quantity: Number,
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Worker'
        },
        workerName: String,
        notes: String,
        approved: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Worker Access & Permissions
    allowedWorkers: [{
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Worker'
        },
        permission: {
            type: String,
            enum: ['view', 'use', 'manage'],
            default: 'use'
        }
    }],
    
    // Supervisor Recommendations
    supervisorNotes: [{
        supervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        supervisorName: String,
        note: String,
        date: Date,
        approved: Boolean
    }],
    
    // Reports & Analytics
    monthlyUsage: [{
        month: String, // YYYY-MM
        quantity: Number,
        cost: Number
    }],
    
    // Alerts & Warnings
    alerts: [{
        type: String,
        message: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        date: Date,
        resolved: {
            type: Boolean,
            default: false
        }
    }],
    
    // Tags & Metadata
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
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
    lastUpdated: Date,
    
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

// Indexes for performance
resourceSchema.index({ farmer: 1, category: 1 });
resourceSchema.index({ farmer: 1, isEquipment: 1 });
resourceSchema.index({ farmer: 1, availableQuantity: 1 });
resourceSchema.index({ farmer: 1, expiryDate: 1 });
resourceSchema.index({ farmer: 1, 'alerts.resolved': 1 });
resourceSchema.index({ expiryDate: 1, availableQuantity: { $gt: 0 } });

// Pre-save middleware for calculations
resourceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Auto-calculate total cost
    if (this.costPerUnit && this.totalQuantity) {
        this.totalCost = this.costPerUnit * this.totalQuantity;
    }
    
    // Auto-calculate available quantity
    if (this.totalQuantity !== undefined && this.usedQuantity !== undefined) {
        this.availableQuantity = this.totalQuantity - this.usedQuantity;
    }
    
    // Auto-generate alerts
    this.generateAlerts();
    
    next();
});

// Generate alerts based on conditions
resourceSchema.methods.generateAlerts = function() {
    const alerts = [];
    const now = new Date();
    
    // Low stock alert
    if (this.availableQuantity <= this.minimumThreshold && this.availableQuantity > 0) {
        alerts.push({
            type: 'low_stock',
            message: `Low stock: ${this.name} is running low (${this.availableQuantity} ${this.unit} left)`,
            severity: 'medium',
            date: now
        });
    }
    
    // Out of stock alert
    if (this.availableQuantity <= 0) {
        alerts.push({
            type: 'out_of_stock',
            message: `Out of stock: ${this.name} is out of stock`,
            severity: 'high',
            date: now
        });
    }
    
    // Expiry alert (30 days before expiry)
    if (this.expiryDate) {
        const daysToExpiry = Math.floor((this.expiryDate - now) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 30 && daysToExpiry > 0) {
            alerts.push({
                type: 'expiry',
                message: `${this.name} expires in ${daysToExpiry} days`,
                severity: daysToExpiry <= 7 ? 'high' : 'medium',
                date: now
            });
        }
    }
    
    // Equipment maintenance alert
    if (this.isEquipment && this.nextMaintenanceDate) {
        const daysToMaintenance = Math.floor((this.nextMaintenanceDate - now) / (1000 * 60 * 60 * 24));
        if (daysToMaintenance <= 14 && daysToMaintenance > 0) {
            alerts.push({
                type: 'maintenance',
                message: `${this.name} maintenance due in ${daysToMaintenance} days`,
                severity: daysToMaintenance <= 3 ? 'high' : 'medium',
                date: now
            });
        }
    }
    
    this.alerts = alerts;
};

// Method to use resource
resourceSchema.methods.useResource = async function(usageData) {
    if (usageData.quantity > this.availableQuantity) {
        throw new Error(`Insufficient quantity. Available: ${this.availableQuantity} ${this.unit}`);
    }
    
    this.usedQuantity += usageData.quantity;
    this.availableQuantity -= usageData.quantity;
    
    // Add to usage history
    this.usageHistory.push({
        date: new Date(),
        ...usageData
    });
    
    // Update monthly usage
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyUsage = this.monthlyUsage.find(m => m.month === month);
    if (monthlyUsage) {
        monthlyUsage.quantity += usageData.quantity;
        monthlyUsage.cost += (usageData.quantity * this.costPerUnit) || 0;
    } else {
        this.monthlyUsage.push({
            month,
            quantity: usageData.quantity,
            cost: (usageData.quantity * this.costPerUnit) || 0
        });
    }
    
    await this.save();
    return this;
};

// Method to add stock
resourceSchema.methods.addStock = async function(quantity, costPerUnit, vendor) {
    this.totalQuantity += quantity;
    this.availableQuantity += quantity;
    
    if (costPerUnit) {
        this.costPerUnit = costPerUnit;
        this.totalCost = this.totalQuantity * costPerUnit;
    }
    
    if (vendor) {
        this.vendor = vendor;
    }
    
    await this.save();
    return this;
};

// Static method to get low stock items
resourceSchema.statics.getLowStockItems = function(farmerId) {
    return this.find({
        farmer: farmerId,
        availableQuantity: { $lte: { $ifNull: ['$minimumThreshold', 0] } },
        availableQuantity: { $gt: 0 },
        isArchived: false
    });
};

// Static method to get expired items
resourceSchema.statics.getExpiredItems = function(farmerId) {
    const now = new Date();
    return this.find({
        farmer: farmerId,
        expiryDate: { $lt: now },
        availableQuantity: { $gt: 0 },
        isArchived: false
    });
};

// Static method to get maintenance due items
resourceSchema.statics.getMaintenanceDueItems = function(farmerId) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.find({
        farmer: farmerId,
        isEquipment: true,
        nextMaintenanceDate: { $lte: nextWeek },
        equipmentStatus: 'active',
        isArchived: false
    });
};

module.exports = mongoose.model('Resource', resourceSchema);
