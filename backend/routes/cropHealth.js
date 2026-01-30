const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CropHealth = require('../models/CropHealth');
const Disease = require('../models/DiseaseDatabase');
const { Crop } = require('../models');
// Services are not available yet, mock them for now.
// const { getWeatherData } = require('../services/weatherService');
// const { analyzeCropImage } = require('../services/aiService');

const getWeatherData = async (location) => {
    return {
        temperature: 30,
        humidity: 60,
        rainfall: 0,
        windSpeed: 10
    };
};

const analyzeCropImage = async (imageUrl, cropName, cropStage) => {
    return {
        predictedDisease: 'Blast',
        confidence: 0.85
    };
};

// Get all crop health records
router.get('/', auth, async (req, res) => {
    try {
        const { status, crop, field, needsAttention } = req.query;
        
        let query = { farmer: req.user.id };
        
        if (status) query.healthStatus = status;
        if (crop) query.crop = crop;
        if (field) query.field = field;
        
        let cropHealthRecords = await CropHealth.find(query)
            .populate('crop', 'name variety area sowingDate')
            // .populate('field', 'name location') // Field population might fail if Field model is not setup perfectly or used differently. 
            // Checking index.js, Field is exported.
            // But let's be safe and comment out potentially missing populations if they cause issues, or ensure they exist.
            // Field was added in previous steps.
            .populate('field', 'name location')
            .sort({ healthScore: 1, lastChecked: -1 });
        
        // Filter for crops needing attention
        if (needsAttention === 'true') {
            cropHealthRecords = cropHealthRecords.filter(record => 
                record.healthStatus !== 'healthy' || 
                record.issues.some(issue => issue.status !== 'resolved')
            );
        }
        
        // Calculate summary statistics
        const stats = {
            totalCrops: cropHealthRecords.length,
            healthy: cropHealthRecords.filter(c => c.healthStatus === 'healthy').length,
            warning: cropHealthRecords.filter(c => c.healthStatus === 'warning').length,
            critical: cropHealthRecords.filter(c => c.healthStatus === 'critical').length,
            activeIssues: cropHealthRecords.reduce((sum, c) => 
                sum + c.issues.filter(i => i.status !== 'resolved').length, 0
            ),
            pendingAlerts: cropHealthRecords.reduce((sum, c) => 
                sum + c.alerts.filter(a => !a.acknowledged).length, 0
            )
        };
        
        res.json({ cropHealthRecords, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get crop health by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('crop', 'name variety area sowingDate expectedHarvestDate')
        .populate('field', 'name size soilType location')
        .populate('issues.detectedBy', 'name role')
        .populate('issues.treatment.applied.appliedBy', 'name role');
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        res.json(cropHealth);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or update crop health record
router.post('/', auth, async (req, res) => {
    try {
        const { cropId, growthStage, healthStatus, notes } = req.body;
        
        // Check if crop exists
        const crop = await Crop.findOne({
            _id: cropId,
            farmer: req.user.id
        });
        
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        // Check for existing record
        let cropHealth = await CropHealth.findOne({
            farmer: req.user.id,
            crop: cropId
        });
        
        if (cropHealth) {
            // Update existing record
            cropHealth.growthStage = growthStage || cropHealth.growthStage;
            cropHealth.healthStatus = healthStatus || cropHealth.healthStatus;
            cropHealth.lastChecked = new Date();
            cropHealth.lastUpdatedBy = req.user.id;
            
            if (notes) {
                cropHealth.healthHistory.push({
                    date: new Date(),
                    healthScore: cropHealth.healthScore,
                    issuesCount: cropHealth.issues.length,
                    notes
                });
            }
        } else {
            // Create new record
            cropHealth = new CropHealth({
                farmer: req.user.id,
                crop: cropId,
                cropName: crop.name,
                cropVariety: crop.variety,
                area: crop.area,
                growthStage: growthStage || 'sowing',
                healthStatus: healthStatus || 'healthy',
                healthScore: 100,
                lastChecked: new Date(),
                lastUpdatedBy: req.user.id
            });
        }
        
        await cropHealth.save();
        
        res.json(cropHealth);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report new issue
router.post('/:id/issues', auth, async (req, res) => {
    try {
        const { 
            type, name, symptoms, severity, affectedArea, 
            images, description, fieldId 
        } = req.body;
        
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        // Create issue
        const issue = {
            type,
            name,
            symptoms: symptoms || [],
            severity,
            affectedArea: affectedArea || 0,
            detectedDate: new Date(),
            detectedBy: req.user.id,
            detectionMethod: 'manual',
            status: 'detected'
        };
        
        if (images) issue.images = images;
        if (description) issue.symptoms.push(description);
        if (fieldId) {
            cropHealth.field = fieldId;
        }
        
        // Try to auto-diagnose based on symptoms
        if (symptoms && symptoms.length > 0) {
            const possibleDiseases = await Disease.searchBySymptoms(symptoms, cropHealth.cropName);
            
            if (possibleDiseases.length > 0) {
                issue.aiAnalysis = {
                    diseaseName: possibleDiseases[0].name,
                    confidence: 75, // Placeholder
                    recommendations: possibleDiseases[0].preventiveMeasures?.slice(0, 3) || [],
                    modelVersion: '1.0'
                };
                
                issue.treatment = {
                    recommended: {
                        pesticides: possibleDiseases[0].chemicalTreatments?.slice(0, 2) || [],
                        organicAlternatives: possibleDiseases[0].organicTreatments?.slice(0, 2) || [],
                        culturalPractices: possibleDiseases[0].culturalControls?.slice(0, 3) || [],
                        preventionTips: possibleDiseases[0].preventiveMeasures?.slice(0, 3) || []
                    }
                };
                
                issue.status = 'diagnosed';
            }
        }
        
        cropHealth.issues.push(issue);
        cropHealth.lastChecked = new Date();
        cropHealth.lastUpdatedBy = req.user.id;
        
        await cropHealth.save();
        
        res.json({
            message: 'Issue reported successfully',
            issue: cropHealth.issues[cropHealth.issues.length - 1],
            autoDiagnosis: issue.aiAnalysis ? 'Possible diagnosis found' : 'No auto-diagnosis available'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Image Analysis for disease detection
router.post('/ai-diagnosis', auth, async (req, res) => {
    try {
        const { imageUrl, cropName, cropStage } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }
        
        // Call AI service
        const aiResult = await analyzeCropImage(imageUrl, cropName, cropStage);
        
        // Find matching diseases in database
        const matchingDiseases = await Disease.find({
            'crops.crop': cropName,
            name: { $regex: new RegExp(aiResult.predictedDisease, 'i') }
        })
        .limit(3)
        .lean();
        
        res.json({
            aiAnalysis: aiResult,
            matchingDiseases,
            recommendations: matchingDiseases.length > 0 ? 
                matchingDiseases[0].chemicalTreatments?.slice(0, 2) : []
        });
    } catch (error) {
        console.error('AI diagnosis error:', error);
        res.status(500).json({ error: 'AI diagnosis service unavailable' });
    }
});

// Get treatment recommendations
router.get('/:id/issues/:issueId/treatments', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        const issue = cropHealth.issues.id(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        
        // Get detailed treatment options from disease database
        const diseaseInfo = await Disease.findOne({
            name: { $regex: new RegExp(issue.name, 'i') },
            'crops.crop': cropHealth.cropName
        })
        .select('chemicalTreatments organicTreatments culturalControls preventiveMeasures')
        .lean();
        
        res.json({
            issue: issue.name,
            severity: issue.severity,
            treatments: diseaseInfo || {
                chemicalTreatments: [],
                organicTreatments: [],
                culturalControls: ['Consult local agriculture officer'],
                preventiveMeasures: ['Monitor crop regularly']
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Apply treatment
router.post('/:id/issues/:issueId/treatments/apply', auth, async (req, res) => {
    try {
        const { productName, productType, dosage, cost, notes, nextTreatmentDate } = req.body;
        
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        const treatmentData = {
            productName,
            productType,
            dosage,
            applicationDate: new Date(),
            appliedBy: req.user.id,
            cost,
            notes,
            nextTreatmentDate: nextTreatmentDate ? new Date(nextTreatmentDate) : null
        };
        
        await cropHealth.updateTreatment(req.params.issueId, treatmentData);
        
        res.json({
            message: 'Treatment applied successfully',
            treatment: treatmentData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark issue as resolved
router.post('/:id/issues/:issueId/resolve', auth, async (req, res) => {
    try {
        const { notes } = req.body;
        
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        await cropHealth.resolveIssue(req.params.issueId, notes);
        
        res.json({ message: 'Issue marked as resolved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get preventive alerts
router.get('/:id/alerts', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        // Get weather-based alerts
        const weatherAlerts = await getWeatherAlerts(cropHealth);
        
        // Get disease risk alerts based on growth stage and season
        const diseaseAlerts = await getDiseaseRiskAlerts(cropHealth);
        
        // Combine alerts
        const allAlerts = [...weatherAlerts, ...diseaseAlerts];
        
        res.json({
            currentAlerts: cropHealth.alerts.filter(a => !a.acknowledged),
            preventiveAlerts: allAlerts,
            totalAlerts: allAlerts.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Acknowledge alert
router.post('/:id/alerts/:alertId/acknowledge', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        const alert = cropHealth.alerts.id(req.params.alertId);
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();
        
        await cropHealth.save();
        
        res.json({ message: 'Alert acknowledged' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nutrient deficiency detection
router.post('/:id/nutrient-analysis', auth, async (req, res) => {
    try {
        const { symptoms } = req.body;
        
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        const deficiencies = detectNutrientDeficiency(symptoms, cropHealth.cropName);
        
        // Update nutrient status
        deficiencies.forEach(def => {
            if (cropHealth.nutrientStatus[def.nutrient]) {
                cropHealth.nutrientStatus[def.nutrient].level = 'deficient';
                cropHealth.nutrientStatus[def.nutrient].lastTested = new Date();
                cropHealth.nutrientStatus[def.nutrient].recommendedFertilizer = def.recommendedFertilizer;
                cropHealth.nutrientStatus[def.nutrient].dosage = def.dosage;
            }
        });
        
        await cropHealth.save();
        
        res.json({
            deficiencies,
            recommendations: deficiencies.map(d => ({
                nutrient: d.nutrient,
                fertilizer: d.recommendedFertilizer,
                dosage: d.dosage,
                applicationMethod: 'Soil application or foliar spray'
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get growth stage guidance
router.get('/:id/growth-guidance', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        const guidance = getGrowthStageGuidance(cropHealth.cropName, cropHealth.growthStage);
        
        res.json(guidance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get health history
router.get('/:id/history', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .select('healthHistory growthMetrics issues')
        .lean();
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        // Process history for chart data
        const healthTimeline = cropHealth.healthHistory.map(record => ({
            date: record.date,
            healthScore: record.healthScore,
            issuesCount: record.issuesCount
        }));
        
        const issueHistory = cropHealth.issues.map(issue => ({
            name: issue.name,
            detectedDate: issue.detectedDate,
            resolvedDate: issue.resolvedDate,
            severity: issue.severity,
            status: issue.status
        }));
        
        res.json({
            healthTimeline,
            issueHistory,
            growthMetrics: cropHealth.growthMetrics,
            summary: {
                totalIssues: cropHealth.issues.length,
                resolvedIssues: cropHealth.issues.filter(i => i.status === 'resolved').length,
                avgRecoveryTime: calculateAverageRecoveryTime(cropHealth.issues)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export crop health report
router.get('/:id/report', auth, async (req, res) => {
    try {
        const cropHealth = await CropHealth.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('crop', 'name variety area')
        .populate('field', 'name location');
        
        if (!cropHealth) {
            return res.status(404).json({ error: 'Crop health record not found' });
        }
        
        // Generate report data
        const report = {
            crop: cropHealth.cropName,
            variety: cropHealth.cropVariety,
            currentHealth: cropHealth.healthStatus,
            healthScore: cropHealth.healthScore,
            growthStage: cropHealth.growthStage,
            lastChecked: cropHealth.lastChecked,
            
            activeIssues: cropHealth.issues
                .filter(issue => issue.status !== 'resolved')
                .map(issue => ({
                    name: issue.name,
                    severity: issue.severity,
                    affectedArea: issue.affectedArea,
                    detectedDate: issue.detectedDate
                })),
            
            recentTreatments: cropHealth.issues
                .flatMap(issue => issue.treatment?.applied || [])
                .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
                .slice(0, 5),
            
            nutrientStatus: cropHealth.nutrientStatus,
            
            recommendations: generateRecommendations(cropHealth),
            
            generatedAt: new Date()
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search diseases based on symptoms
router.post('/search-diseases', auth, async (req, res) => {
    try {
        const { symptoms, cropName } = req.body;
        const diseases = await Disease.searchBySymptoms(symptoms, cropName);
        res.json(diseases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
async function getWeatherAlerts(cropHealth) {
    try {
        const weather = await getWeatherData(cropHealth.field?.location);
        
        const alerts = [];
        
        // Check for heavy rainfall alert
        if (weather.rainfall > 50) { // mm
            alerts.push({
                type: 'weather',
                message: `Heavy rainfall (${weather.rainfall}mm) may cause waterlogging`,
                severity: 'warning',
                preventiveMeasures: [
                    'Ensure proper drainage',
                    'Avoid irrigation for next 2 days',
                    'Monitor for fungal diseases'
                ]
            });
        }
        
        // Check for high temperature
        if (weather.temperature > 35) {
            alerts.push({
                type: 'weather',
                message: `High temperature (${weather.temperature}°C) may cause heat stress`,
                severity: 'warning',
                preventiveMeasures: [
                    'Increase irrigation frequency',
                    'Apply mulch to retain soil moisture',
                    'Avoid fertilizer application'
                ]
            });
        }
        
        // Check for high humidity (fungal disease risk)
        if (weather.humidity > 80) {
            alerts.push({
                type: 'disease_risk',
                message: 'High humidity increases fungal disease risk',
                severity: 'alert',
                preventiveMeasures: [
                    'Apply preventive fungicide',
                    'Ensure proper spacing for air circulation',
                    'Avoid overhead irrigation'
                ]
            });
        }
        
        return alerts;
    } catch (error) {
        return [];
    }
}

async function getDiseaseRiskAlerts(cropHealth) {
    const diseases = await Disease.find({
        'crops.crop': cropHealth.cropName,
        'crops.susceptibleStages': cropHealth.growthStage
    })
    .select('name riskLevel favorableConditions preventiveMeasures')
    .lean();
    
    return diseases.map(disease => ({
        type: 'disease_risk',
        message: `Risk of ${disease.name} during ${cropHealth.growthStage} stage`,
        severity: disease.riskLevel === 'high' || disease.riskLevel === 'severe' ? 'alert' : 'warning',
        preventiveMeasures: disease.preventiveMeasures?.slice(0, 3) || ['Consult agriculture officer']
    }));
}

function detectNutrientDeficiency(symptoms, cropName) {
    const deficiencies = [];
    
    // Nitrogen deficiency
    if (symptoms.includes('yellowing leaves') || symptoms.includes('stunted growth')) {
        deficiencies.push({
            nutrient: 'nitrogen',
            symptoms: ['Yellowing of older leaves', 'Stunted growth'],
            recommendedFertilizer: 'Urea or Ammonium Sulfate',
            dosage: cropName === 'Rice' ? '50-60 kg/acre' : '40-50 kg/acre'
        });
    }
    
    // Phosphorus deficiency
    if (symptoms.includes('purple leaves') || symptoms.includes('poor root development')) {
        deficiencies.push({
            nutrient: 'phosphorus',
            symptoms: ['Purple or dark green leaves', 'Poor flowering'],
            recommendedFertilizer: 'DAP or SSP',
            dosage: cropName === 'Wheat' ? '25-30 kg/acre' : '20-25 kg/acre'
        });
    }
    
    // Potassium deficiency
    if (symptoms.includes('brown leaf edges') || symptoms.includes('weak stems')) {
        deficiencies.push({
            nutrient: 'potassium',
            symptoms: ['Brown leaf edges', 'Weak stems'],
            recommendedFertilizer: 'MOP (Muriate of Potash)',
            dosage: '20-25 kg/acre'
        });
    }
    
    return deficiencies;
}

function getGrowthStageGuidance(cropName, growthStage) {
    const guidance = {
        sowing: {
            normal: 'Seeds germinating, emerging from soil',
            commonProblems: ['Poor germination', 'Seed rot', 'Bird damage'],
            do: ['Ensure proper seed depth', 'Maintain soil moisture', 'Use treated seeds'],
            avoid: ['Planting too deep', 'Overwatering', 'Using old seeds']
        },
        vegetative: {
            normal: 'Rapid leaf and stem growth',
            commonProblems: ['Nutrient deficiency', 'Pest attack', 'Weed competition'],
            do: ['Apply nitrogen fertilizer', 'Control weeds', 'Monitor for pests'],
            avoid: ['Over-fertilization', 'Water stress', 'Ignoring early pest signs']
        },
        flowering: {
            normal: 'Flower formation and pollination',
            commonProblems: ['Flower drop', 'Poor pollination', 'Pest damage'],
            do: ['Ensure adequate water', 'Protect from strong winds', 'Monitor flowering'],
            avoid: ['Water stress', 'Pesticide spray during flowering', 'Disturbing plants']
        },
        fruiting: {
            normal: 'Fruit development and maturation',
            commonProblems: ['Fruit drop', 'Fruit rot', 'Bird/animal damage'],
            do: ['Apply potassium fertilizer', 'Support heavy branches', 'Protect fruits'],
            avoid: ['Over-watering', 'Heavy pesticide use', 'Physical damage to fruits']
        }
    };
    
    return guidance[growthStage] || {
        normal: 'Normal growth expected',
        commonProblems: ['Monitor regularly'],
        do: ['Follow standard practices'],
        avoid: ['Neglect monitoring']
    };
}

function calculateAverageRecoveryTime(issues) {
    const resolvedIssues = issues.filter(i => i.resolvedDate && i.detectedDate);
    if (resolvedIssues.length === 0) return 0;
    
    const totalDays = resolvedIssues.reduce((sum, issue) => {
        const days = Math.ceil((new Date(issue.resolvedDate) - new Date(issue.detectedDate)) / (1000 * 60 * 60 * 24));
        return sum + days;
    }, 0);
    
    return Math.round(totalDays / resolvedIssues.length);
}

function generateRecommendations(cropHealth) {
    const recommendations = [];
    
    // Health-based recommendations
    if (cropHealth.healthScore < 50) {
        recommendations.push({
            priority: 'high',
            action: 'Immediate attention needed',
            reason: 'Crop health is critical',
            deadline: 'Today'
        });
    }
    
    // Issue-based recommendations
    cropHealth.issues
        .filter(issue => issue.status !== 'resolved')
        .forEach(issue => {
            recommendations.push({
                priority: issue.severity === 'critical' ? 'high' : 'medium',
                action: `Treat ${issue.name}`,
                reason: `${issue.severity} severity, ${issue.affectedArea}% affected`,
                deadline: 'Within 2 days'
            });
        });
    
    // Nutrient-based recommendations
    Object.entries(cropHealth.nutrientStatus).forEach(([nutrient, data]) => {
        if (data.level === 'deficient') {
            recommendations.push({
                priority: 'medium',
                action: `Apply ${data.recommendedFertilizer}`,
                reason: `${nutrient} deficiency detected`,
                deadline: 'Within 1 week'
            });
        }
    });
    
    // Alert-based recommendations
    cropHealth.alerts
        .filter(alert => !alert.acknowledged)
        .forEach(alert => {
            recommendations.push({
                priority: alert.severity === 'critical' ? 'high' : 'medium',
                action: alert.preventiveMeasures?.[0] || 'Take preventive action',
                reason: alert.message,
                deadline: 'Before next ' + (alert.validTo ? new Date(alert.validTo).toLocaleDateString() : 'check')
            });
        });
    
    return recommendations;
}

module.exports = router;
