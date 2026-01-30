const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    scientificName: String,
    localNames: [String],
    
    // Categorization
    type: {
        type: String,
        enum: ['fungal', 'bacterial', 'viral', 'pest', 'nematode', 'physiological'],
        required: true
    },
    category: {
        type: String,
        enum: ['disease', 'pest', 'weed', 'deficiency', 'disorder'],
        required: true
    },
    
    // Affected Crops
    crops: [{
        crop: {
            type: String,
            required: true
        },
        varieties: [String],
        susceptibleStages: [String],
        prevalence: {
            type: String,
            enum: ['rare', 'occasional', 'common', 'widespread']
        }
    }],
    
    // Symptoms
    symptoms: {
        leaves: [String],
        stems: [String],
        roots: [String],
        fruits: [String],
        general: [String],
        progression: String,
        images: [{
            url: String,
            description: String,
            stage: String
        }]
    },
    
    // Causes & Conditions
    causes: [String],
    favorableConditions: {
        temperature: {
            min: Number,
            max: Number,
            optimal: Number
        },
        humidity: {
            min: Number,
            max: Number
        },
        rainfall: String,
        soilConditions: [String],
        season: [String]
    },
    
    // Spread & Transmission
    transmission: {
        method: [String], // wind, water, soil, seed, insect
        vector: [String], // insect names if applicable
        spreadRate: {
            type: String,
            enum: ['slow', 'moderate', 'rapid', 'explosive']
        }
    },
    
    // Diagnosis
    diagnosisTips: [String],
    similarIssues: [{
        name: String,
        differentiatingFactors: String
    }],
    labTests: [String],
    
    // Treatment - Chemical
    chemicalTreatments: [{
        productName: String,
        activeIngredient: String,
        brand: String,
        formulation: String, // WP, SC, EC, etc.
        dosage: {
            perAcre: String,
            perLiter: String
        },
        applicationMethod: {
            type: String,
            enum: ['spray', 'drench', 'soil_application', 'seed_treatment']
        },
        frequency: String,
        safetyPeriod: Number, // days
        precautions: [String],
        effectiveness: {
            type: String,
            enum: ['excellent', 'good', 'average', 'poor']
        },
        costRange: {
            low: Number,
            high: Number
        }
    }],
    
    // Treatment - Organic/Biological
    organicTreatments: [{
        name: String,
        type: {
            type: String,
            enum: ['bio_pesticide', 'botanical', 'microbial', 'cultural', 'physical']
        },
        composition: String,
        dosage: String,
        applicationMethod: String,
        frequency: String,
        preparationMethod: String,
        effectiveness: String,
        cost: String
    }],
    
    // Cultural Control Methods
    culturalControls: [String],
    
    // Prevention
    preventiveMeasures: [String],
    resistantVarieties: [String],
    
    // Impact
    impact: {
        yieldLoss: {
            min: Number, // percentage
            max: Number
        },
        qualityImpact: String,
        economicImpact: String
    },
    
    // Regulatory Information
    bannedInCountries: [String],
    restrictedUse: Boolean,
    mrlLimits: [{
        country: String,
        crop: String,
        limit: String // Maximum Residue Limit
    }],
    
    // Scientific References
    references: [{
        title: String,
        author: String,
        year: Number,
        url: String
    }],
    
    // Metadata
    region: [String], // Where this disease is prevalent
    seasonality: [String],
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'severe']
    },
    
    // AI/ML Data
    aiModel: {
        modelId: String,
        confidenceThreshold: Number,
        lastUpdated: Date,
        accuracy: Number
    },
    
    // Audit
    verifiedByExperts: Boolean,
    lastUpdated: Date,
    source: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for fast search
diseaseSchema.index({ name: 'text', scientificName: 'text', localNames: 'text' });
diseaseSchema.index({ 'crops.crop': 1 });
diseaseSchema.index({ type: 1, category: 1 });
diseaseSchema.index({ riskLevel: 1 });

// Pre-save middleware
diseaseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to get treatments by crop
diseaseSchema.statics.getTreatmentsForCrop = function(cropName, issueType) {
    return this.find({
        'crops.crop': cropName,
        category: issueType
    })
    .select('name type chemicalTreatments organicTreatments preventiveMeasures')
    .lean();
};

// Method to search by symptoms
diseaseSchema.statics.searchBySymptoms = function(symptoms, cropName) {
    const symptomRegex = symptoms.map(s => new RegExp(s, 'i'));
    
    return this.find({
        'crops.crop': cropName,
        $or: [
            { 'symptoms.leaves': { $in: symptomRegex } },
            { 'symptoms.stems': { $in: symptomRegex } },
            { 'symptoms.roots': { $in: symptomRegex } },
            { 'symptoms.fruits': { $in: symptomRegex } },
            { 'symptoms.general': { $in: symptomRegex } }
        ]
    })
    .sort({ riskLevel: -1 })
    .limit(10)
    .lean();
};

module.exports = mongoose.model('Disease', diseaseSchema);
