const mongoose = require('mongoose');

// Growth Stages
const GROWTH_STAGES = [
    'sowing', 'germination', 'seedling', 'vegetative', 
    'flowering', 'fruiting', 'ripening', 'harvesting', 'dormant'
];

// Health Status
const HEALTH_STATUS = ['healthy', 'warning', 'critical', 'recovering'];

// Issue Types
const ISSUE_TYPES = ['disease', 'pest', 'nutrient_deficiency', 'weed', 'weather_damage', 'other'];

// Severity Levels
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

// Detection Methods
const DETECTION_METHODS = ['manual', 'ai_image', 'sensor', 'weather_alert', 'supervisor', 'worker'];

const cropHealthSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
    },
    fieldName: String,
    area: Number, // in acres
    
    // Current Health Status
    growthStage: {
        type: String,
        enum: GROWTH_STAGES,
        required: true
    },
    healthStatus: {
        type: String,
        enum: HEALTH_STATUS,
        default: 'healthy'
    },
    healthScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    lastChecked: {
        type: Date,
        default: Date.now
    },
    
    // Issues & Problems
    issues: [{
        type: {
            type: String,
            enum: ISSUE_TYPES,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        scientificName: String,
        
        // Symptoms
        symptoms: [String],
        affectedArea: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }, // percentage
        severity: {
            type: String,
            enum: SEVERITY_LEVELS,
            required: true
        },
        
        // Detection
        detectedDate: {
            type: Date,
            default: Date.now
        },
        detectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        detectionMethod: {
            type: String,
            enum: DETECTION_METHODS
        },
        
        // Images for diagnosis
        images: [{
            url: String,
            filename: String,
            description: String,
            uploadedAt: Date,
            aiConfidence: Number // for AI detection
        }],
        
        // AI Analysis (if applicable)
        aiAnalysis: {
            diseaseName: String,
            confidence: Number,
            recommendations: [String],
            modelVersion: String
        },
        
        // Treatment Information
        treatment: {
            recommended: {
                pesticides: [{
                    name: String,
                    activeIngredient: String,
                    dosage: String, // per acre/liter
                    applicationMethod: String,
                    frequency: String,
                    safetyPeriod: Number, // days
                    costPerAcre: Number
                }],
                organicAlternatives: [{
                    name: String,
                    composition: String,
                    dosage: String,
                    applicationMethod: String
                }],
                culturalPractices: [String],
                preventionTips: [String]
            },
            
            applied: [{
                productName: String,
                productType: String, // chemical/organic
                dosage: String,
                applicationDate: Date,
                appliedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                cost: Number,
                effectiveness: {
                    type: String,
                    enum: ['excellent', 'good', 'average', 'poor', 'not_effective']
                },
                notes: String
            }],
            
            nextTreatmentDate: Date,
            estimatedRecoveryDays: Number
        },
        
        // Supervisor Input
        supervisorNotes: [{
            supervisor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            supervisorName: String,
            note: String,
            date: Date,
            validated: Boolean
        }],
        
        // Status Tracking
        status: {
            type: String,
            enum: ['detected', 'diagnosed', 'treatment_planned', 'treatment_applied', 'monitoring', 'resolved', 'recurred'],
            default: 'detected'
        },
        
        resolvedDate: Date,
        recurrenceCount: {
            type: Number,
            default: 0
        },
        
        // Impact Assessment
        yieldImpact: {
            estimated: Number, // percentage
            actual: Number
        },
        costImpact: Number,
        
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: Date
    }],
    
    // Nutrient Status
    nutrientStatus: {
        nitrogen: {
            level: {
                type: String,
                enum: ['deficient', 'low', 'adequate', 'high', 'excess'],
                default: 'adequate'
            },
            lastTested: Date,
            recommendedFertilizer: String,
            dosage: String
        },
        phosphorus: {
            level: {
                type: String,
                enum: ['deficient', 'low', 'adequate', 'high', 'excess'],
                default: 'adequate'
            },
            lastTested: Date,
            recommendedFertilizer: String,
            dosage: String
        },
        potassium: {
            level: {
                type: String,
                enum: ['deficient', 'low', 'adequate', 'high', 'excess'],
                default: 'adequate'
            },
            lastTested: Date,
            recommendedFertilizer: String,
            dosage: String
        },
        micronutrients: {
            iron: String,
            zinc: String,
            manganese: String,
            copper: String,
            boron: String
        }
    },
    
    // Environmental Factors
    environmentalFactors: {
        soilPh: Number,
        soilMoisture: Number, // percentage
        temperature: Number,
        humidity: Number,
        rainfall: Number, // last 7 days
        windSpeed: Number,
        recordedAt: Date
    },
    
    // Preventive Alerts
    alerts: [{
        type: {
            type: String,
            enum: ['weather', 'pest_outbreak', 'disease_risk', 'nutrient_deficiency', 'irrigation', 'other']
        },
        message: String,
        severity: {
            type: String,
            enum: ['info', 'warning', 'alert', 'critical'],
            default: 'warning'
        },
        source: String, // weather_api, manual, sensor, community
        validFrom: Date,
        validTo: Date,
        affectedStage: [String],
        preventiveMeasures: [String],
        triggeredAt: Date,
        acknowledged: {
            type: Boolean,
            default: false
        },
        acknowledgedAt: Date
    }],
    
    // Growth Monitoring
    growthMetrics: [{
        date: Date,
        height: Number, // cm
        canopyCover: Number, // percentage
        leafCount: Number,
        floweringPercentage: Number,
        fruitCount: Number,
        notes: String,
        images: [String]
    }],
    
    // Health History
    healthHistory: [{
        date: Date,
        healthScore: Number,
        issuesCount: Number,
        treatmentCount: Number,
        notes: String
    }],
    
    // Community Insights (anonymized)
    communityInsights: {
        commonIssues: [String],
        effectiveTreatments: [{
            issue: String,
            treatment: String,
            effectiveness: String,
            usageCount: Number
        }],
        updatedAt: Date
    },
    
    // Predictive Analytics
    predictions: {
        diseaseRisk: {
            next7Days: Number, // percentage
            riskFactors: [String],
            recommendedPrevention: [String]
        },
        pestRisk: {
            next7Days: Number,
            riskFactors: [String],
            recommendedPrevention: [String]
        },
        yieldPrediction: {
            estimated: Number, // kg per acre
            confidence: Number,
            factors: [String]
        },
        generatedAt: Date
    },
    
    // Audit Trail
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

// Indexes
cropHealthSchema.index({ farmer: 1, crop: 1 });
cropHealthSchema.index({ farmer: 1, healthStatus: 1 });
cropHealthSchema.index({ farmer: 1, 'issues.status': 1 });
cropHealthSchema.index({ farmer: 1, 'alerts.acknowledged': 1 });
cropHealthSchema.index({ 'issues.detectedDate': -1 });

// Pre-save middleware
cropHealthSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Auto-calculate health score based on issues
    if (this.issues && this.issues.length > 0) {
        let score = 100;
        
        this.issues.forEach(issue => {
            if (issue.status !== 'resolved') {
                const severityScores = {
                    low: 10,
                    medium: 25,
                    high: 50,
                    critical: 75
                };
                
                score -= (severityScores[issue.severity] || 0) * (issue.affectedArea / 100);
            }
        });
        
        this.healthScore = Math.max(0, Math.round(score));
        
        // Update health status based on score
        if (this.healthScore >= 80) {
            this.healthStatus = 'healthy';
        } else if (this.healthScore >= 50) {
            this.healthStatus = 'warning';
        } else {
            this.healthStatus = 'critical';
        }
    }
    
    next();
});

// Methods
cropHealthSchema.methods.addIssue = function(issueData) {
    this.issues.push({
        ...issueData,
        detectedDate: new Date(),
        status: 'detected'
    });
    
    this.lastChecked = new Date();
    return this.save();
};

cropHealthSchema.methods.updateTreatment = function(issueId, treatmentData) {
    const issue = this.issues.id(issueId);
    if (issue) {
        issue.treatment.applied.push(treatmentData);
        issue.status = 'treatment_applied';
        issue.updatedAt = new Date();
        
        // Schedule next treatment if needed
        if (treatmentData.nextTreatmentDate) {
            issue.treatment.nextTreatmentDate = treatmentData.nextTreatmentDate;
        }
    }
    return this.save();
};

cropHealthSchema.methods.resolveIssue = function(issueId, notes) {
    const issue = this.issues.id(issueId);
    if (issue) {
        issue.status = 'resolved';
        issue.resolvedDate = new Date();
        issue.updatedAt = new Date();
        
        if (notes) {
            issue.supervisorNotes.push({
                note: notes,
                date: new Date()
            });
        }
    }
    return this.save();
};

cropHealthSchema.methods.addGrowthMetric = function(metricData) {
    this.growthMetrics.push({
        ...metricData,
        date: new Date()
    });
    return this.save();
};

// Static methods
cropHealthSchema.statics.getCropsNeedingAttention = function(farmerId) {
    return this.find({
        farmer: farmerId,
        $or: [
            { healthStatus: { $in: ['warning', 'critical'] } },
            { 'issues.status': { $in: ['detected', 'diagnosed'] } },
            { 'alerts.acknowledged': false }
        ]
    })
    .populate('crop', 'name variety area sowingDate')
    .sort({ healthScore: 1 });
};

cropHealthSchema.statics.getPreventiveAlerts = function(farmerId) {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.find({
        farmer: farmerId,
        'alerts.validFrom': { $lte: sevenDaysLater },
        'alerts.validTo': { $gte: now },
        'alerts.acknowledged': false
    })
    .select('cropName fieldName alerts')
    .lean();
};

module.exports = mongoose.model('CropHealth', cropHealthSchema);
