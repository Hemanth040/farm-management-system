const mongoose = require('mongoose');

// Weed Categories
const WEED_CATEGORIES = ['broadleaf', 'grassy', 'sedge'];

// Growth Stages
const GROWTH_STAGES = ['seedling', 'vegetative', 'flowering', 'seeding', 'dormant'];

// Control Method Types
const CONTROL_METHOD_TYPES = ['mechanical', 'chemical', 'cultural', 'organic', 'biological'];

// Severity Levels
const SEVERITY_LEVELS = ['low', 'moderate', 'high', 'severe'];

const weedSchema = new mongoose.Schema({
    // Basic Identification
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    scientificName: {
        type: String,
        trim: true
    },
    localNames: [{
        name: String,
        language: String,
        region: String
    }],
    
    // Classification
    category: {
        type: String,
        enum: WEED_CATEGORIES,
        required: true
    },
    family: String,
    genus: String,
    species: String,
    
    // Affected Crops
    affectedCrops: [{
        crop: {
            type: String,
            required: true
        },
        varieties: [String],
        susceptibleStages: [{
            type: String,
            enum: ['sowing', 'germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 'ripening', 'harvesting', 'dormant']
        }],
        impactLevel: {
            type: String,
            enum: ['minor', 'moderate', 'major', 'severe']
        },
        yieldLossPercentage: {
            min: Number,
            max: Number
        },
        prevalence: {
            type: String,
            enum: ['rare', 'occasional', 'common', 'widespread']
        },
        regions: [String]
    }],
    
    // Identification Features
    description: {
        general: String,
        habitat: String,
        lifeCycle: {
            type: String,
            enum: ['annual', 'biennial', 'perennial']
        },
        seasonality: [String]
    },
    
    // Growth Characteristics
    growthCharacteristics: {
        height: {
            min: Number,
            max: Number,
            unit: { type: String, default: 'cm' }
        },
        spread: {
            min: Number,
            max: Number,
            unit: { type: String, default: 'cm' }
        },
        growthRate: {
            type: String,
            enum: ['slow', 'moderate', 'fast', 'aggressive']
        },
        rootSystem: {
            type: String,
            enum: ['taproot', 'fibrous', 'rhizomatous', 'stoloniferous', 'bulbous']
        },
        rootDepth: {
            value: Number,
            unit: { type: String, default: 'cm' }
        }
    },
    
    // Identification Keys
    identification: {
        leaves: {
            shape: [String],
            color: [String],
            texture: [String],
            arrangement: {
                type: String,
                enum: ['alternate', 'opposite', 'whorled', 'basal', 'spiral']
            },
            margin: [String],
            venation: [String],
            size: String,
            specialFeatures: [String]
        },
        stems: {
            shape: [String],
            color: [String],
            texture: [String],
            branching: String,
            specialFeatures: [String]
        },
        flowers: {
            color: [String],
            shape: [String],
            size: String,
            bloomingPeriod: [String],
            specialFeatures: [String]
        },
        fruits: {
            type: [String],
            color: [String],
            size: String,
            seedCount: String,
            dispersalMethod: [String]
        },
        seeds: {
            shape: String,
            color: String,
            size: String,
            viability: String,
            dormancy: String
        },
        roots: {
            color: String,
            texture: String,
            specialFeatures: [String]
        }
    },
    
    // Visual Documentation
    photos: [{
        url: {
            type: String,
            required: true
        },
        thumbnailUrl: String,
        caption: String,
        description: String,
        stage: {
            type: String,
            enum: GROWTH_STAGES
        },
        part: {
            type: String,
            enum: ['whole_plant', 'leaf', 'stem', 'flower', 'fruit', 'seed', 'root']
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        verified: {
            type: Boolean,
            default: false
        }
    }],
    
    // Control Methods
    controlMethods: {
        // Mechanical Control
        mechanical: [{
            method: {
                type: String,
                enum: ['hand_weeding', 'hoeing', 'tillage', 'mowing', 'mulching', 'flooding', 'burning']
            },
            description: String,
            effectiveness: {
                type: String,
                enum: ['excellent', 'good', 'moderate', 'poor']
            },
            timing: String,
            frequency: String,
            laborIntensity: {
                type: String,
                enum: ['low', 'medium', 'high']
            },
            costEstimate: {
                min: Number,
                max: Number,
                currency: { type: String, default: 'INR' },
                perUnit: { type: String, default: 'acre' }
            },
            bestFor: [String],
            limitations: [String],
            equipmentNeeded: [String]
        }],
        
        // Chemical Control
        chemical: [{
            herbicideName: String,
            activeIngredient: String,
            brand: String,
            formulation: String,
            modeOfAction: String,
            selectivity: {
                type: String,
                enum: ['selective', 'non_selective', 'broad_spectrum']
            },
            targetWeeds: [String],
            dosage: {
                perAcre: String,
                perLiter: String,
                concentration: String
            },
            applicationMethod: {
                type: String,
                enum: ['foliar_spray', 'soil_application', 'pre_emergence', 'post_emergence', 'spot_treatment']
            },
            timing: {
                cropStage: [String],
                weedStage: [String],
                timeOfDay: String,
                weatherConditions: [String]
            },
            frequency: String,
            rainfastness: String,
            safetyPeriod: Number,
            residualActivity: String,
            effectiveness: {
                type: String,
                enum: ['excellent', 'good', 'moderate', 'poor']
            },
            costPerAcre: {
                min: Number,
                max: Number
            },
            precautions: [String],
            compatibleHerbicides: [String],
            incompatibleHerbicides: [String],
            resistanceRisk: {
                type: String,
                enum: ['low', 'moderate', 'high']
            },
            restrictedCrops: [String]
        }],
        
        // Cultural Control
        cultural: [{
            method: {
                type: String,
                enum: ['crop_rotation', 'intercropping', 'mulching', 'solarization', 'flooding', 'competitive_crops', 'sowing_date_adjustment', 'plant_spacing', 'tillage_practices']
            },
            description: String,
            implementation: String,
            effectiveness: {
                type: String,
                enum: ['excellent', 'good', 'moderate', 'poor']
            },
            bestCrops: [String],
            timing: String,
            costEstimate: {
                min: Number,
                max: Number
            },
            advantages: [String],
            limitations: [String]
        }],
        
        // Organic/Biological Control
        organic: [{
            method: {
                type: String,
                enum: ['bioherbicide', 'botanical', 'microbial', 'allelopathy', 'competitive_planting', 'grazing', 'insects']
            },
            name: String,
            description: String,
            composition: String,
            preparation: String,
            dosage: String,
            applicationMethod: String,
            timing: String,
            frequency: String,
            effectiveness: {
                type: String,
                enum: ['excellent', 'good', 'moderate', 'poor']
            },
            costEstimate: String,
            organicCertified: Boolean,
            limitations: [String]
        }]
    },
    
    // Preventive Measures
    preventiveMeasures: [{
        measure: String,
        description: String,
        timing: String,
        priority: {
            type: String,
            enum: ['high', 'medium', 'low']
        }
    }],
    
    // Integrated Weed Management (IWM) Recommendations
    iwmStrategy: {
        description: String,
        stages: [{
            growthStage: String,
            primaryMethod: String,
            secondaryMethods: [String],
            timing: String,
            rationale: String
        }]
    },
    
    // Severity Thresholds
    severityThresholds: {
        low: {
            weedDensity: String,
            action: String,
            urgency: String
        },
        moderate: {
            weedDensity: String,
            action: String,
            urgency: String
        },
        high: {
            weedDensity: String,
            action: String,
            urgency: String
        },
        severe: {
            weedDensity: String,
            action: String,
            urgency: String
        }
    },
    
    // Economic Impact
    economicImpact: {
        yieldLoss: {
            min: Number,
            max: Number,
            unit: { type: String, default: 'percentage' }
        },
        qualityImpact: String,
        harvestDifficulty: {
            type: String,
            enum: ['none', 'minor', 'moderate', 'severe']
        },
        controlCostPerAcre: {
            min: Number,
            max: Number
        }
    },
    
    // Safety & Compliance
    safety: {
        toxicityLevel: {
            type: String,
            enum: ['non_toxic', 'low', 'moderate', 'high']
        },
        ppeRequired: [String],
        reentryInterval: Number,
        bufferZones: {
            waterBodies: Number,
            residential: Number,
            sensitiveCrops: Number
        },
        environmentalHazards: [String],
        storageRequirements: [String],
        disposalGuidelines: String,
        firstAid: String
    },
    
    // Regulatory Information
    regulatory: {
        bannedInRegions: [String],
        restrictedUse: Boolean,
        registrationNumber: String,
        approvedForCrops: [String],
        mrlLimits: [{
            crop: String,
            limit: String,
            unit: String
        }]
    },
    
    // Similar Weeds (for differentiation)
    similarWeeds: [{
        name: String,
        differentiatingFeatures: [String],
        differentiationPhotos: [String]
    }],
    
    // Regional Information
    regionInfo: [{
        region: String,
        localName: String,
        prevalence: String,
        peakSeason: [String],
        controlStatus: String,
        specialNotes: String
    }],
    
    // Scientific References
    references: [{
        title: String,
        authors: [String],
        year: Number,
        journal: String,
        url: String,
        type: {
            type: String,
            enum: ['research', 'extension', 'government', 'industry']
        }
    }],
    
    // Metadata
    verifiedByExperts: {
        type: Boolean,
        default: false
    },
    verifiedBy: [{
        expert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date,
        notes: String
    }],
    
    createdBy: {
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
    },
    
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    
    source: String,
    
    // Search/AI Fields
    keywords: [String],
    aiModel: {
        modelId: String,
        confidenceThreshold: Number,
        lastUpdated: Date,
        accuracy: Number
    }
});

// Indexes for fast search
weedSchema.index({ name: 'text', scientificName: 'text', 'localNames.name': 'text', keywords: 'text' });
weedSchema.index({ category: 1 });
weedSchema.index({ 'affectedCrops.crop': 1 });
weedSchema.index({ 'affectedCrops.susceptibleStages': 1 });
weedSchema.index({ 'controlMethods.chemical.activeIngredient': 1 });
weedSchema.index({ verifiedByExperts: 1 });

// Pre-save middleware
weedSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    this.lastUpdated = new Date();
    next();
});

// Static Methods
weedSchema.statics.findByCrop = function(cropName, options = {}) {
    const query = { 'affectedCrops.crop': cropName };
    
    if (options.category) query.category = options.category;
    if (options.severity) query['affectedCrops.impactLevel'] = options.severity;
    
    return this.find(query)
        .select('name scientificName category affectedCrops photos description controlMethods')
        .lean();
};

weedSchema.statics.findBySymptoms = function(symptoms, cropName) {
    const symptomRegex = symptoms.map(s => new RegExp(s, 'i'));
    
    const query = {
        'affectedCrops.crop': cropName,
        $or: [
            { 'identification.leaves.shape': { $in: symptomRegex } },
            { 'identification.leaves.color': { $in: symptomRegex } },
            { 'identification.flowers.color': { $in: symptomRegex } },
            { 'identification.stems.shape': { $in: symptomRegex } },
            { 'keywords': { $in: symptomRegex } }
        ]
    };
    
    return this.find(query)
        .sort({ 'affectedCrops.impactLevel': -1 })
        .limit(10)
        .lean();
};

weedSchema.statics.getControlMethods = function(weedId, cropName, methodType) {
    const selectFields = {
        name: 1,
        'controlMethods': 1,
        'affectedCrops.$': 1
    };
    
    let query = { _id: weedId };
    if (cropName) {
        query['affectedCrops.crop'] = cropName;
    }
    
    return this.findOne(query)
        .select(selectFields)
        .lean();
};

weedSchema.statics.getHerbicideRecommendations = function(weedName, cropName, applicationType) {
    return this.findOne({
        name: { $regex: new RegExp(weedName, 'i') },
        'affectedCrops.crop': cropName
    })
    .select('name controlMethods.chemical affectedCrops.$')
    .lean()
    .then(weed => {
        if (!weed || !weed.controlMethods || !weed.controlMethods.chemical) {
            return [];
        }
        
        let herbicides = weed.controlMethods.chemical;
        
        if (applicationType) {
            herbicides = herbicides.filter(h => 
                h.applicationMethod === applicationType
            );
        }
        
        return herbicides;
    });
};

weedSchema.statics.searchByIdentification = function(identificationData) {
    const query = {};
    
    if (identificationData.leafShape) {
        query['identification.leaves.shape'] = { $in: identificationData.leafShape };
    }
    if (identificationData.leafColor) {
        query['identification.leaves.color'] = { $in: identificationData.leafColor };
    }
    if (identificationData.flowerColor) {
        query['identification.flowers.color'] = { $in: identificationData.flowerColor };
    }
    if (identificationData.category) {
        query.category = identificationData.category;
    }
    if (identificationData.growthHabit) {
        query['growthCharacteristics.growthRate'] = identificationData.growthHabit;
    }
    
    return this.find(query)
        .select('name scientificName category identification photos affectedCrops')
        .limit(20)
        .lean();
};

// Instance Methods
weedSchema.methods.getControlMethodsForCrop = function(cropName) {
    const cropInfo = this.affectedCrops.find(c => c.crop === cropName);
    if (!cropInfo) return null;
    
    return {
        weedName: this.name,
        cropName: cropName,
        impactLevel: cropInfo.impactLevel,
        mechanical: this.controlMethods.mechanical,
        chemical: this.controlMethods.chemical,
        cultural: this.controlMethods.cultural,
        organic: this.controlMethods.organic
    };
};

weedSchema.methods.isCompatibleWithCrop = function(cropName) {
    return this.affectedCrops.some(c => c.crop === cropName);
};

weedSchema.methods.getSeverityGuidance = function(density) {
    if (!this.severityThresholds) return null;
    
    const thresholds = Object.entries(this.severityThresholds);
    for (const [level, data] of thresholds) {
        if (density >= parseInt(data.weedDensity)) {
            return {
                level,
                ...data
            };
        }
    }
    
    return {
        level: 'low',
        ...this.severityThresholds.low
    };
};

module.exports = mongoose.model('Weed', weedSchema);
