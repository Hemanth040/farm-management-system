const mongoose = require('mongoose');

// Issue Status
const ISSUE_STATUS = ['reported', 'diagnosed', 'control_planned', 'control_applied', 'monitoring', 'controlled', 'cleared', 'recurred'];

// Severity Levels
const SEVERITY_LEVELS = ['mild', 'moderate', 'severe'];

// Detection Methods
const DETECTION_METHODS = ['manual', 'ai_image', 'sensor', 'drone', 'satellite', 'worker_report', 'supervisor_report', 'weather_alert'];

// Control Status
const CONTROL_STATUS = ['pending', 'in_progress', 'completed', 'cancelled'];

const weedIssueSchema = new mongoose.Schema({
    // Reporter Information
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    reporterRole: {
        type: String,
        enum: ['farmer', 'worker', 'supervisor', 'ai_system']
    },
    
    // Location Information
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    
    fieldName: String,
    
    location: {
        coordinates: {
            lat: Number,
            lng: Number
        },
        address: String,
        landmark: String,
        zone: String,
        plotNumber: String
    },
    
    // Crop Information
    crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    
    cropName: {
        type: String,
        required: true
    },
    
    cropVariety: String,
    
    cropStage: {
        type: String,
        enum: ['sowing', 'germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 'ripening', 'harvesting', 'dormant'],
        required: true
    },
    
    // Weed Information
    weedType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weed'
    },
    
    weedName: String,
    
    weedCategory: {
        type: String,
        enum: ['broadleaf', 'grassy', 'sedge']
    },
    
    weedScientificName: String,
    
    weedGrowthStage: {
        type: String,
        enum: ['seedling', 'vegetative', 'flowering', 'seeding', 'dormant']
    },
    
    // Detection Information
    detectionMethod: {
        type: String,
        enum: DETECTION_METHODS,
        default: 'manual'
    },
    
    detectionDate: {
        type: Date,
        default: Date.now
    },
    
    // Severity Assessment
    severity: {
        type: String,
        enum: SEVERITY_LEVELS,
        required: true
    },
    
    severityScore: {
        type: Number,
        min: 0,
        max: 100
    },
    
    severityFactors: [{
        factor: String,
        impact: String,
        score: Number
    }],
    
    // Infestation Details
    infestation: {
        area: Number,
        unit: { type: String, default: 'acre' },
        affectedPercentage: {
            type: Number,
            min: 0,
            max: 100
        },
        weedDensity: String,
        distribution: {
            type: String,
            enum: ['uniform', 'patchy', 'scattered', 'concentrated']
        },
        estimatedWeedCount: Number,
        dominantWeeds: [String],
        secondaryWeeds: [String],
        affectedCropRows: [Number],
        depthOfInfestation: String
    },
    
    // Symptoms & Observations
    observations: [{
        category: String,
        description: String,
        severity: String
    }],
    
    symptoms: [{
        type: String,
        description: String,
        location: String
    }],
    
    cropImpact: {
        stuntedGrowth: Boolean,
        nutrientDeficiency: Boolean,
        yieldReduction: Number,
        qualityImpact: String,
        harvestDifficulty: Boolean
    },
    
    // Media Evidence
    photos: [{
        url: {
            type: String,
            required: true
        },
        filename: String,
        description: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        aiAnalysis: {
            weedDetected: Boolean,
            confidence: Number,
            suggestedWeedName: String,
            severity: String,
            coverage: Number
        }
    }],
    
    videos: [{
        url: String,
        thumbnail: String,
        description: String,
        duration: Number,
        uploadedAt: Date,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Status Tracking
    status: {
        type: String,
        enum: ISSUE_STATUS,
        default: 'reported',
        index: true
    },
    
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedByName: String,
        changedAt: {
            type: Date,
            default: Date.now
        },
        notes: String,
        reason: String
    }],
    
    // Timeline Integration
    timelineEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimelineEvent'
    },
    
    expectedResolutionDate: Date,
    
    // Control Method Assignment
    assignedControlMethod: {
        methodType: {
            type: String,
            enum: ['mechanical', 'chemical', 'cultural', 'organic', 'integrated']
        },
        methodName: String,
        description: String,
        selectedOptions: [String],
        recommendedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        recommendedAt: Date,
        rationale: String,
        expectedEffectiveness: {
            type: String,
            enum: ['excellent', 'good', 'moderate', 'poor']
        }
    },
    
    // Chemical Control Details
    chemicalControl: {
        herbicideName: String,
        activeIngredient: String,
        brand: String,
        formulation: String,
        dosage: String,
        quantityRequired: {
            value: Number,
            unit: String
        },
        dilutionRatio: String,
        waterRequired: {
            value: Number,
            unit: String
        },
        applicationMethod: String,
        applicationTiming: String,
        safetyPeriod: Number,
        applicationArea: Number,
        weatherConditions: {
            temperature: String,
            windSpeed: String,
            humidity: String,
            rainForecast: String
        },
        compatibilityChecked: Boolean,
        compatibleWithCrop: Boolean,
        restrictions: [String]
    },
    
    // Mechanical Control Details
    mechanicalControl: {
        method: String,
        equipmentRequired: [String],
        laborRequired: Number,
        estimatedDuration: Number,
        depth: String,
        frequency: String
    },
    
    // Cultural Control Details
    culturalControl: {
        method: String,
        implementation: String,
        timing: String,
        additionalResources: [String]
    },
    
    // Organic Control Details
    organicControl: {
        method: String,
        productName: String,
        composition: String,
        dosage: String,
        preparationMethod: String,
        applicationDetails: String,
        frequency: String
    },
    
    // Cost Estimation
    costEstimate: {
        materialCost: Number,
        laborCost: Number,
        equipmentCost: Number,
        otherCosts: Number,
        totalCost: Number,
        perAcreCost: Number,
        currency: { type: String, default: 'INR' }
    },
    
    actualCost: {
        materialCost: Number,
        laborCost: Number,
        equipmentCost: Number,
        otherCosts: Number,
        totalCost: Number,
        currency: { type: String, default: 'INR' }
    },
    
    // Control Application Records
    controlApplications: [{
        applicationNumber: {
            type: Number,
            default: 1
        },
        methodType: String,
        methodName: String,
        productsUsed: [{
            name: String,
            quantity: Number,
            unit: String,
            batchNumber: String,
            expiryDate: Date
        }],
        equipmentUsed: [String],
        laborUsed: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            workerName: String,
            hours: Number,
            wage: Number
        }],
        applicationDate: {
            type: Date,
            default: Date.now
        },
        startTime: String,
        endTime: String,
        duration: Number,
        weatherConditions: {
            temperature: Number,
            humidity: Number,
            windSpeed: Number,
            conditions: String
        },
        areaCovered: Number,
        coveragePercentage: Number,
        applicationQuality: {
            type: String,
            enum: ['excellent', 'good', 'average', 'poor']
        },
        appliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        appliedByName: String,
        supervisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        supervisedByName: String,
        cost: Number,
        notes: String,
        effectiveness: {
            type: String,
            enum: ['excellent', 'good', 'average', 'poor', 'not_effective']
        },
        effectivenessNotes: String,
        photos: [String],
        followUpRequired: Boolean,
        followUpDate: Date,
        status: {
            type: String,
            enum: CONTROL_STATUS,
            default: 'pending'
        }
    }],
    
    // Monitoring & Assessment
    monitoringRecords: [{
        date: {
            type: Date,
            default: Date.now
        },
        monitoredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        monitoredByName: String,
        currentSeverity: {
            type: String,
            enum: SEVERITY_LEVELS
        },
        weedDensity: String,
        regrowth: Boolean,
        regrowthPercentage: Number,
        cropRecovery: {
            type: String,
            enum: ['excellent', 'good', 'moderate', 'poor', 'none']
        },
        effectiveness: {
            type: String,
            enum: ['excellent', 'good', 'moderate', 'poor', 'not_effective']
        },
        weedKillPercentage: Number,
        newWeedsDetected: Boolean,
        newWeeds: [String],
        photos: [String],
        notes: String,
        nextMonitoringDate: Date,
        recommendation: String
    }],
    
    // Results & Outcome
    outcome: {
        controlSuccess: {
            type: String,
            enum: ['complete', 'partial', 'failed']
        },
        finalSeverity: String,
        weedReduction: Number,
        timeToControl: Number,
        applicationsRequired: Number,
        totalCost: Number,
        cropRecovery: String,
        yieldImpact: Number,
        lessonsLearned: String,
        recommendations: [String]
    },
    
    // Resolution
    controlledDate: Date,
    clearedDate: Date,
    resolvedDate: Date,
    
    resolutionDetails: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolutionMethod: String,
        effectiveness: String,
        notes: String,
        followUpActions: [String]
    },
    
    // History Tracking
    history: [{
        date: {
            type: Date,
            default: Date.now
        },
        event: String,
        description: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: String,
        changes: mongoose.Schema.Types.Mixed
    }],
    
    // Recurrence Tracking
    recurrence: {
        isRecurrence: {
            type: Boolean,
            default: false
        },
        parentIssue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WeedIssue'
        },
        recurrenceCount: {
            type: Number,
            default: 0
        },
        previousIssues: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WeedIssue'
        }],
        recurrencePattern: String,
        preventionMeasures: [String]
    },
    
    // Safety & Compliance
    safetyCompliance: {
        ppeUsed: [String],
        safetyChecks: [{
            check: String,
            completed: Boolean,
            date: Date
        }],
        environmentalProtection: [String],
        bufferMaintained: Boolean,
        regulationsFollowed: Boolean
    },
    
    // AI/ML Data
    aiAnalysis: {
        weedDetected: Boolean,
        confidence: Number,
        suggestedWeedTypes: [{
            name: String,
            confidence: Number
        }],
        severityEstimate: String,
        coverageEstimate: Number,
        recommendedActions: [String],
        modelVersion: String,
        analyzedAt: Date
    },
    
    // Related Issues
    relatedIssues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WeedIssue'
    }],
    
    relatedDiseaseIssues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropHealth'
    }],
    
    // Notifications
    notifications: [{
        type: {
            type: String,
            enum: ['email', 'sms', 'push', 'in_app']
        },
        sentAt: Date,
        status: {
            type: String,
            enum: ['sent', 'delivered', 'failed', 'read']
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String
    }],
    
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    tags: [String],
    
    notes: String,
    
    internalNotes: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
weedIssueSchema.index({ farmer: 1, status: 1 });
weedIssueSchema.index({ farmer: 1, crop: 1 });
weedIssueSchema.index({ farmer: 1, field: 1 });
weedIssueSchema.index({ farmer: 1, detectionDate: -1 });
weedIssueSchema.index({ status: 1, expectedResolutionDate: 1 });
weedIssueSchema.index({ severity: 1 });
weedIssueSchema.index({ weedType: 1 });
weedIssueSchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware
weedIssueSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Add to history if it's a significant change
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            notes: 'Status updated'
        });
    }
    
    // Calculate cost estimate if not set
    if (!this.costEstimate.totalCost) {
        this.calculateCostEstimate();
    }
    
    next();
});

// Instance Methods
weedIssueSchema.methods.calculateCostEstimate = function() {
    let materialCost = 0;
    let laborCost = 0;
    let equipmentCost = 0;
    let otherCosts = 0;
    
    const area = this.infestation?.area || 1;
    
    if (this.chemicalControl) {
        materialCost += (this.chemicalControl.quantityRequired?.value || 0) * 500; // Average price
    }
    
    if (this.mechanicalControl) {
        laborCost += (this.mechanicalControl.laborRequired || 0) * 300; // Daily wage
        equipmentCost += (this.mechanicalControl.equipmentRequired?.length || 0) * 200;
    }
    
    if (this.organicControl) {
        materialCost += 400; // Average organic control cost
    }
    
    const totalCost = materialCost + laborCost + equipmentCost + otherCosts;
    
    this.costEstimate = {
        materialCost,
        laborCost,
        equipmentCost,
        otherCosts,
        totalCost,
        perAcreCost: area > 0 ? totalCost / area : totalCost,
        currency: 'INR'
    };
    
    return this.costEstimate;
};

weedIssueSchema.methods.addControlApplication = function(applicationData) {
    const applicationNumber = this.controlApplications.length + 1;
    
    this.controlApplications.push({
        ...applicationData,
        applicationNumber,
        applicationDate: new Date()
    });
    
    this.status = 'control_applied';
    
    return this.save();
};

weedIssueSchema.methods.addMonitoringRecord = function(monitoringData) {
    this.monitoringRecords.push({
        ...monitoringData,
        date: new Date()
    });
    
    // Update status based on monitoring
    if (monitoringData.currentSeverity === 'mild' && this.status !== 'cleared') {
        this.status = 'controlled';
    } else if (monitoringData.regrowth && this.status === 'controlled') {
        this.status = 'recurred';
        this.recurrence.isRecurrence = true;
        this.recurrence.recurrenceCount += 1;
    }
    
    return this.save();
};

weedIssueSchema.methods.resolve = function(resolutionData) {
    this.status = 'cleared';
    this.resolvedDate = new Date();
    this.clearedDate = new Date();
    
    this.resolutionDetails = {
        ...resolutionData,
        resolvedBy: resolutionData.resolvedBy,
        resolutionMethod: this.assignedControlMethod?.methodType || 'unknown'
    };
    
    // Calculate outcome
    const applications = this.controlApplications.length;
    const totalCost = this.controlApplications.reduce((sum, app) => sum + (app.cost || 0), 0);
    const duration = Math.ceil((this.resolvedDate - this.detectionDate) / (1000 * 60 * 60 * 24));
    
    this.outcome = {
        controlSuccess: resolutionData.success || 'complete',
        applicationsRequired: applications,
        totalCost: totalCost,
        timeToControl: duration,
        lessonsLearned: resolutionData.lessonsLearned,
        recommendations: resolutionData.recommendations
    };
    
    return this.save();
};

weedIssueSchema.methods.updateStatus = function(newStatus, changedBy, notes) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    this.statusHistory.push({
        status: newStatus,
        changedBy: changedBy?._id || changedBy,
        changedByName: changedBy?.name || 'System',
        changedAt: new Date(),
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
        reason: notes
    });
    
    // Update specific date fields based on status
    if (newStatus === 'controlled') {
        this.controlledDate = new Date();
    } else if (newStatus === 'cleared') {
        this.clearedDate = new Date();
        this.resolvedDate = new Date();
    }
    
    return this.save();
};

weedIssueSchema.methods.assignControlMethod = function(methodData, assignedBy) {
    this.assignedControlMethod = {
        ...methodData,
        recommendedBy: assignedBy?._id || assignedBy,
        recommendedAt: new Date()
    };
    
    this.status = 'control_planned';
    
    // Update specific control details based on method type
    if (methodData.methodType === 'chemical' && methodData.chemicalDetails) {
        this.chemicalControl = methodData.chemicalDetails;
    } else if (methodData.methodType === 'mechanical' && methodData.mechanicalDetails) {
        this.mechanicalControl = methodData.mechanicalDetails;
    } else if (methodData.methodType === 'cultural' && methodData.culturalDetails) {
        this.culturalControl = methodData.culturalDetails;
    } else if (methodData.methodType === 'organic' && methodData.organicDetails) {
        this.organicControl = methodData.organicDetails;
    }
    
    return this.save();
};

weedIssueSchema.methods.addToHistory = function(event, description, user, changes) {
    this.history.push({
        date: new Date(),
        event,
        description,
        user: user?._id || user,
        userName: user?.name || 'System',
        changes
    });
    
    return this.save();
};

// Static Methods
weedIssueSchema.statics.getIssuesByFarmer = function(farmerId, options = {}) {
    let query = { farmer: farmerId, isActive: true };
    
    if (options.status) query.status = options.status;
    if (options.severity) query.severity = options.severity;
    if (options.crop) query.crop = options.crop;
    if (options.field) query.field = options.field;
    
    return this.find(query)
        .populate('weedType', 'name category photos')
        .populate('crop', 'name variety')
        .populate('field', 'name location')
        .sort({ detectionDate: -1 });
};

weedIssueSchema.statics.getActiveIssues = function(farmerId) {
    return this.find({
        farmer: farmerId,
        status: { $nin: ['cleared', 'controlled'] },
        isActive: true
    })
    .populate('weedType', 'name category')
    .populate('crop', 'name')
    .populate('field', 'name')
    .sort({ severity: -1, detectionDate: -1 });
};

weedIssueSchema.statics.getIssuesBySeverity = function(farmerId, severity) {
    return this.find({
        farmer: farmerId,
        severity,
        status: { $nin: ['cleared', 'controlled'] },
        isActive: true
    })
    .populate('weedType', 'name category photos')
    .populate('crop', 'name')
    .sort({ detectionDate: -1 });
};

weedIssueSchema.statics.getFieldHistory = function(fieldId) {
    return this.find({
        field: fieldId,
        isActive: true
    })
    .populate('weedType', 'name category')
    .populate('crop', 'name')
    .sort({ detectionDate: -1 })
    .lean();
};

weedIssueSchema.statics.getAnalytics = function(farmerId, options = {}) {
    const matchStage = { farmer: farmerId, isActive: true };
    
    if (options.startDate && options.endDate) {
        matchStage.detectionDate = {
            $gte: new Date(options.startDate),
            $lte: new Date(options.endDate)
        };
    }
    
    if (options.crop) matchStage.crop = options.crop;
    if (options.field) matchStage.field = options.field;
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalIssues: { $sum: 1 },
                bySeverity: {
                    $push: {
                        $cond: {
                            if: { $eq: ['$severity', 'mild'] },
                            then: 'mild',
                            else: {
                                $cond: {
                                    if: { $eq: ['$severity', 'moderate'] },
                                    then: 'moderate',
                                    else: 'severe'
                                }
                            }
                        }
                    }
                },
                byStatus: { $push: '$status' },
                byWeedType: { $push: '$weedName' },
                avgResolutionTime: {
                    $avg: {
                        $cond: {
                            if: { $ne: ['$resolvedDate', null] },
                            then: { $subtract: ['$resolvedDate', '$detectionDate'] },
                            else: null
                        }
                    }
                },
                totalCost: { $sum: '$actualCost.totalCost' },
                totalArea: { $sum: '$infestation.area' }
            }
        }
    ]);
};

weedIssueSchema.statics.getWeedHistoryForField = function(fieldId, options = {}) {
    let query = { field: fieldId, isActive: true };
    
    if (options.startDate) {
        query.detectionDate = { $gte: new Date(options.startDate) };
    }
    
    if (options.endDate) {
        query.detectionDate = {
            ...query.detectionDate,
            $lte: new Date(options.endDate)
        };
    }
    
    return this.find(query)
        .select('weedName weedCategory severity status detectionDate controlledDate clearedDate infestation controlApplications costEstimate outcome')
        .sort({ detectionDate: -1 })
        .lean();
};

module.exports = mongoose.model('WeedIssue', weedIssueSchema);
