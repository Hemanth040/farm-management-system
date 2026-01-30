const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Weed = require('../models/Weed');
const WeedIssue = require('../models/WeedIssue');
const Crop = require('../models/CropHealth').base?.model('Crop') || require('../models').Crop;
const Field = require('../models/Field');
const TimelineEvent = require('../models/Timeline');

// GET /api/weeds - List all weeds with filtering
router.get('/', auth, async (req, res) => {
    try {
        const { 
            crop, 
            category, 
            search, 
            severity, 
            verified, 
            region,
            limit = 50,
            page = 1
        } = req.query;
        
        let query = {};
        
        // Filter by crop
        if (crop) {
            query['affectedCrops.crop'] = crop;
        }
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Filter by severity
        if (severity) {
            query['affectedCrops.impactLevel'] = severity;
        }
        
        // Filter by verification status
        if (verified !== undefined) {
            query.verifiedByExperts = verified === 'true';
        }
        
        // Filter by region
        if (region) {
            query['regionInfo.region'] = region;
        }
        
        // Text search
        if (search) {
            query.$text = { $search: search };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let weedsQuery = Weed.find(query)
            .select('name scientificName category affectedCrops photos description verifiedByExperts')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ name: 1 });
        
        if (search) {
            weedsQuery = weedsQuery.sort({ score: { $meta: 'textScore' } });
        }
        
        const [weeds, total] = await Promise.all([
            weedsQuery.lean(),
            Weed.countDocuments(query)
        ]);
        
        res.json({
            weeds,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching weeds:', error);
        res.status(500).json({ error: 'Failed to fetch weeds', details: error.message });
    }
});

// GET /api/weeds/:id - Get weed details with control recommendations
router.get('/:id', auth, async (req, res) => {
    try {
        const { crop } = req.query;
        
        let weed = await Weed.findById(req.params.id);
        
        if (!weed) {
            return res.status(404).json({ error: 'Weed not found' });
        }
        
        let response = weed.toObject();
        
        // If crop is specified, get crop-specific recommendations
        if (crop) {
            const cropControlMethods = weed.getControlMethodsForCrop(crop);
            if (cropControlMethods) {
                response.cropSpecific = cropControlMethods;
            }
            
            // Filter affected crops info
            const cropInfo = weed.affectedCrops.find(c => c.crop === crop);
            if (cropInfo) {
                response.affectedCropInfo = cropInfo;
            }
        }
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching weed details:', error);
        res.status(500).json({ error: 'Failed to fetch weed details', details: error.message });
    }
});

// POST /api/weeds/identify - Identify weed by symptoms/crop
router.post('/identify', auth, async (req, res) => {
    try {
        const { 
            cropName, 
            symptoms, 
            leafShape, 
            leafColor, 
            flowerColor,
            category,
            growthHabit,
            identificationData
        } = req.body;
        
        if (!cropName) {
            return res.status(400).json({ error: 'Crop name is required' });
        }
        
        let possibleWeeds = [];
        
        // Search by symptoms if provided
        if (symptoms && symptoms.length > 0) {
            const symptomResults = await Weed.findBySymptoms(symptoms, cropName);
            possibleWeeds = [...possibleWeeds, ...symptomResults];
        }
        
        // Search by identification data if provided
        if (identificationData || leafShape || leafColor || flowerColor) {
            const searchData = identificationData || {
                leafShape: leafShape ? [leafShape] : undefined,
                leafColor: leafColor ? [leafColor] : undefined,
                flowerColor: flowerColor ? [flowerColor] : undefined,
                category,
                growthHabit
            };
            
            const idResults = await Weed.searchByIdentification(searchData);
            possibleWeeds = [...possibleWeeds, ...idResults];
        }
        
        // If no specific criteria, get all weeds affecting the crop
        if (possibleWeeds.length === 0) {
            possibleWeeds = await Weed.findByCrop(cropName);
        }
        
        // Remove duplicates and sort by relevance
        const uniqueWeeds = [...new Map(possibleWeeds.map(w => [w._id.toString(), w])).values()];
        
        // Sort by impact level and prevalence
        const sortedWeeds = uniqueWeeds.sort((a, b) => {
            const impactOrder = { severe: 4, major: 3, moderate: 2, minor: 1 };
            const impactA = impactOrder[a.affectedCrops?.[0]?.impactLevel] || 0;
            const impactB = impactOrder[b.affectedCrops?.[0]?.impactLevel] || 0;
            return impactB - impactA;
        });
        
        // Limit results and format
        const results = sortedWeeds.slice(0, 10).map(weed => ({
            _id: weed._id,
            name: weed.name,
            scientificName: weed.scientificName,
            category: weed.category,
            affectedCrops: weed.affectedCrops,
            photos: weed.photos?.slice(0, 2),
            description: weed.description?.general,
            controlMethods: {
                mechanical: weed.controlMethods?.mechanical?.length || 0,
                chemical: weed.controlMethods?.chemical?.length || 0,
                cultural: weed.controlMethods?.cultural?.length || 0,
                organic: weed.controlMethods?.organic?.length || 0
            },
            matchConfidence: calculateMatchConfidence(weed, req.body)
        }));
        
        res.json({
            cropName,
            criteria: req.body,
            possibleMatches: results,
            totalMatches: sortedWeeds.length
        });
    } catch (error) {
        console.error('Error identifying weed:', error);
        res.status(500).json({ error: 'Failed to identify weed', details: error.message });
    }
});

// GET /api/weeds/crop/:cropId - Get crop-specific weed library
router.get('/crop/:cropId', auth, async (req, res) => {
    try {
        const { category, impactLevel, season } = req.query;
        
        // Get crop details
        const crop = await Crop.findById(req.params.cropId);
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        let query = { 'affectedCrops.crop': crop.name };
        
        if (category) query.category = category;
        if (impactLevel) query['affectedCrops.impactLevel'] = impactLevel;
        if (season) query['affectedCrops.susceptibleStages'] = season;
        
        const weeds = await Weed.find(query)
            .select('name scientificName category affectedCrops photos description controlMethods severityThresholds')
            .sort({ 'affectedCrops.impactLevel': -1 })
            .lean();
        
        // Format response with crop-specific info
        const formattedWeeds = weeds.map(weed => {
            const cropInfo = weed.affectedCrops.find(c => c.crop === crop.name);
            return {
                _id: weed._id,
                name: weed.name,
                scientificName: weed.scientificName,
                category: weed.category,
                impactLevel: cropInfo?.impactLevel,
                susceptibleStages: cropInfo?.susceptibleStages,
                prevalence: cropInfo?.prevalence,
                photos: weed.photos?.slice(0, 2),
                description: weed.description?.general,
                severityThresholds: weed.severityThresholds,
                controlMethods: {
                    mechanical: weed.controlMethods?.mechanical || [],
                    chemical: weed.controlMethods?.chemical?.slice(0, 3) || [],
                    cultural: weed.controlMethods?.cultural || [],
                    organic: weed.controlMethods?.organic || []
                }
            };
        });
        
        // Group by category
        const groupedByCategory = formattedWeeds.reduce((acc, weed) => {
            if (!acc[weed.category]) acc[weed.category] = [];
            acc[weed.category].push(weed);
            return acc;
        }, {});
        
        res.json({
            crop: {
                _id: crop._id,
                name: crop.name,
                variety: crop.variety
            },
            totalWeeds: formattedWeeds.length,
            byCategory: groupedByCategory,
            weeds: formattedWeeds
        });
    } catch (error) {
        console.error('Error fetching crop weed library:', error);
        res.status(500).json({ error: 'Failed to fetch weed library', details: error.message });
    }
});

// POST /api/weeds/issues - Report weed issue
router.post('/issues', auth, async (req, res) => {
    try {
        const {
            fieldId,
            cropId,
            weedTypeId,
            weedName,
            severity,
            infestationArea,
            affectedPercentage,
            weedDensity,
            photos,
            observations,
            symptoms,
            detectionMethod,
            location,
            cropStage,
            notes
        } = req.body;
        
        // Validate required fields
        if (!fieldId || !cropId || !severity) {
            return res.status(400).json({ 
                error: 'Field ID, Crop ID, and severity are required' 
            });
        }
        
        // Get crop details
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        // Get field details
        const field = await Field.findById(fieldId);
        if (!field) {
            return res.status(404).json({ error: 'Field not found' });
        }
        
        // Get weed type details if provided
        let weedType = null;
        let weedCategory = null;
        let weedScientificName = null;
        
        if (weedTypeId) {
            weedType = await Weed.findById(weedTypeId);
            if (weedType) {
                weedCategory = weedType.category;
                weedScientificName = weedType.scientificName;
            }
        }
        
        // Calculate severity score
        const severityScore = calculateSeverityScore(severity, affectedPercentage, weedDensity);
        
        // Create the issue
        const issue = new WeedIssue({
            farmer: req.user.id,
            reportedBy: req.user.id,
            reporterRole: req.user.role || 'farmer',
            field: fieldId,
            fieldName: field.name,
            location: location || {
                coordinates: field.location?.coordinates,
                address: field.location?.address
            },
            crop: cropId,
            cropName: crop.name,
            cropVariety: crop.variety,
            cropStage: cropStage || 'vegetative',
            weedType: weedTypeId,
            weedName: weedName || weedType?.name || 'Unknown',
            weedCategory,
            weedScientificName,
            detectionMethod: detectionMethod || 'manual',
            severity,
            severityScore,
            infestation: {
                area: infestationArea || field.size || 0,
                unit: 'acre',
                affectedPercentage: affectedPercentage || 0,
                weedDensity: weedDensity || 'medium',
                distribution: 'patchy'
            },
            observations: observations || [],
            symptoms: symptoms || [],
            photos: photos?.map(photo => ({
                url: photo.url,
                filename: photo.filename,
                description: photo.description,
                uploadedBy: req.user.id
            })) || [],
            status: 'reported',
            notes,
            priority: severity === 'severe' ? 'high' : severity === 'moderate' ? 'medium' : 'low'
        });
        
        await issue.save();
        
        // Create timeline event
        const timelineEvent = new TimelineEvent({
            farmer: req.user.id,
            crop: cropId,
            title: `Weed Issue: ${issue.weedName}`,
            description: `Weed infestation reported in ${field.name}. Severity: ${severity}`,
            type: 'other',
            date: new Date(),
            status: 'upcoming'
        });
        await timelineEvent.save();
        
        // Update issue with timeline reference
        issue.timelineEvent = timelineEvent._id;
        await issue.save();
        
        res.status(201).json({
            message: 'Weed issue reported successfully',
            issue,
            recommendations: weedType ? await getControlRecommendations(weedType, crop.name, severity) : null
        });
    } catch (error) {
        console.error('Error reporting weed issue:', error);
        res.status(500).json({ error: 'Failed to report weed issue', details: error.message });
    }
});

// GET /api/weeds/issues - List weed issues with filters
router.get('/issues', auth, async (req, res) => {
    try {
        const {
            status,
            severity,
            crop,
            field,
            weedType,
            startDate,
            endDate,
            active = 'true',
            limit = 50,
            page = 1
        } = req.query;
        
        const options = {
            status,
            severity,
            crop,
            field
        };
        
        // Date filtering
        if (startDate || endDate) {
            options.startDate = startDate;
            options.endDate = endDate;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let query = { farmer: req.user.id };
        
        if (active === 'true') {
            query.isActive = true;
        }
        
        if (status) query.status = status;
        if (severity) query.severity = severity;
        if (crop) query.crop = crop;
        if (field) query.field = field;
        if (weedType) query.weedType = weedType;
        
        if (startDate || endDate) {
            query.detectionDate = {};
            if (startDate) query.detectionDate.$gte = new Date(startDate);
            if (endDate) query.detectionDate.$lte = new Date(endDate);
        }
        
        const [issues, total] = await Promise.all([
            WeedIssue.find(query)
                .populate('weedType', 'name category photos')
                .populate('crop', 'name variety')
                .populate('field', 'name location size')
                .populate('reportedBy', 'name role')
                .sort({ detectionDate: -1 })
                .limit(parseInt(limit))
                .skip(skip),
            WeedIssue.countDocuments(query)
        ]);
        
        // Calculate summary statistics
        const stats = await WeedIssue.aggregate([
            { $match: { farmer: req.user.id, isActive: true } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    bySeverity: {
                        $push: '$severity'
                    },
                    byStatus: {
                        $push: '$status'
                    },
                    activeCount: {
                        $sum: {
                            $cond: {
                                if: { $in: ['$status', ['reported', 'diagnosed', 'control_planned', 'control_applied', 'monitoring']] },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    totalArea: { $sum: '$infestation.area' }
                }
            }
        ]);
        
        res.json({
            issues,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            stats: stats[0] || {
                total: 0,
                activeCount: 0,
                totalArea: 0
            }
        });
    } catch (error) {
        console.error('Error fetching weed issues:', error);
        res.status(500).json({ error: 'Failed to fetch weed issues', details: error.message });
    }
});

// GET /api/weeds/issues/:id - Get specific issue details
router.get('/issues/:id', auth, async (req, res) => {
    try {
        const issue = await WeedIssue.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('weedType', 'name scientificName category photos description controlMethods')
        .populate('crop', 'name variety area sowingDate')
        .populate('field', 'name location size soilType')
        .populate('reportedBy', 'name role')
        .populate('controlApplications.appliedBy', 'name')
        .populate('controlApplications.supervisedBy', 'name')
        .populate('monitoringRecords.monitoredBy', 'name');
        
        if (!issue) {
            return res.status(404).json({ error: 'Weed issue not found' });
        }
        
        res.json(issue);
    } catch (error) {
        console.error('Error fetching weed issue:', error);
        res.status(500).json({ error: 'Failed to fetch weed issue', details: error.message });
    }
});

// PUT /api/weeds/issues/:id - Update issue status
router.put('/issues/:id', auth, async (req, res) => {
    try {
        const { status, notes, resolutionData } = req.body;
        
        const issue = await WeedIssue.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!issue) {
            return res.status(404).json({ error: 'Weed issue not found' });
        }
        
        // Update status
        if (status) {
            await issue.updateStatus(status, req.user, notes);
        }
        
        // Resolve if status is cleared
        if (status === 'cleared' && resolutionData) {
            await issue.resolve(resolutionData);
        }
        
        // Update other fields if provided
        if (req.body.assignedControlMethod) {
            await issue.assignControlMethod(req.body.assignedControlMethod, req.user);
        }
        
        if (req.body.severity && req.body.severity !== issue.severity) {
            issue.severity = req.body.severity;
            issue.severityScore = calculateSeverityScore(
                req.body.severity,
                issue.infestation?.affectedPercentage,
                issue.infestation?.weedDensity
            );
        }
        
        await issue.save();
        
        res.json({
            message: 'Issue updated successfully',
            issue: await WeedIssue.findById(issue._id)
                .populate('weedType', 'name category')
                .populate('crop', 'name')
                .populate('field', 'name')
        });
    } catch (error) {
        console.error('Error updating weed issue:', error);
        res.status(500).json({ error: 'Failed to update weed issue', details: error.message });
    }
});

// GET /api/weeds/severity-check - Check severity thresholds
router.get('/severity-check', auth, async (req, res) => {
    try {
        const { weedId, density, affectedPercentage } = req.query;
        
        if (!weedId) {
            return res.status(400).json({ error: 'Weed ID is required' });
        }
        
        const weed = await Weed.findById(weedId).select('name severityThresholds');
        if (!weed) {
            return res.status(404).json({ error: 'Weed not found' });
        }
        
        let guidance = null;
        
        if (weed.severityThresholds) {
            // Convert weed density to numeric value
            const densityMap = { low: 1, medium: 2, high: 3, severe: 4 };
            const densityValue = densityMap[density] || 2;
            
            guidance = weed.getSeverityGuidance(densityValue);
        }
        
        // Provide default guidance if not available
        if (!guidance) {
            guidance = {
                level: affectedPercentage > 50 ? 'severe' : affectedPercentage > 25 ? 'high' : affectedPercentage > 10 ? 'moderate' : 'low',
                weedDensity: density || 'medium',
                action: affectedPercentage > 50 ? 'Immediate control action required' : 'Schedule control measures',
                urgency: affectedPercentage > 50 ? 'Within 24-48 hours' : affectedPercentage > 25 ? 'Within 1 week' : 'Monitor and plan'
            };
        }
        
        res.json({
            weed: weed.name,
            currentStatus: {
                density: density || 'unknown',
                affectedPercentage: parseFloat(affectedPercentage) || 0
            },
            guidance,
            allThresholds: weed.severityThresholds
        });
    } catch (error) {
        console.error('Error checking severity:', error);
        res.status(500).json({ error: 'Failed to check severity', details: error.message });
    }
});

// GET /api/weeds/compatibility-check - Check herbicide compatibility
router.get('/compatibility-check', auth, async (req, res) => {
    try {
        const { herbicide, crop, weed, fieldCondition } = req.query;
        
        if (!herbicide || !crop) {
            return res.status(400).json({ 
                error: 'Herbicide name and crop name are required' 
            });
        }
        
        // Search for weed with this herbicide
        let weedData = null;
        if (weed) {
            weedData = await Weed.findOne({
                name: { $regex: new RegExp(weed, 'i') },
                'affectedCrops.crop': crop
            }).select('controlMethods.chemical name');
        }
        
        // Find herbicide details
        let herbicideInfo = null;
        if (weedData && weedData.controlMethods?.chemical) {
            herbicideInfo = weedData.controlMethods.chemical.find(h => 
                h.herbicideName?.toLowerCase().includes(herbicide.toLowerCase()) ||
                h.activeIngredient?.toLowerCase().includes(herbicide.toLowerCase())
            );
        }
        
        // Build compatibility report
        const compatibility = {
            herbicide,
            crop,
            weed: weedData?.name,
            isCompatible: true,
            warnings: [],
            restrictions: [],
            recommendations: []
        };
        
        if (herbicideInfo) {
            compatibility.selectivity = herbicideInfo.selectivity;
            compatibility.applicationMethod = herbicideInfo.applicationMethod;
            compatibility.timing = herbicideInfo.timing;
            compatibility.rainfastness = herbicideInfo.rainfastness;
            compatibility.safetyPeriod = herbicideInfo.safetyPeriod;
            
            if (herbicideInfo.restrictedCrops?.includes(crop)) {
                compatibility.isCompatible = false;
                compatibility.warnings.push(`Not recommended for ${crop}`);
            }
            
            if (herbicideInfo.incompatibleHerbicides?.length > 0) {
                compatibility.warnings.push(`Do not mix with: ${herbicideInfo.incompatibleHerbicides.join(', ')}`);
            }
            
            if (herbicideInfo.precautions) {
                compatibility.restrictions = herbicideInfo.precautions;
            }
        } else {
            compatibility.warnings.push('Herbicide information not found in database. Please verify with local agriculture office.');
        }
        
        // Add general recommendations
        compatibility.recommendations = [
            'Always read and follow label instructions',
            'Check weather conditions before application',
            'Use appropriate PPE during application',
            'Maintain buffer zones from water bodies',
            'Keep records of all applications'
        ];
        
        res.json(compatibility);
    } catch (error) {
        console.error('Error checking compatibility:', error);
        res.status(500).json({ error: 'Failed to check compatibility', details: error.message });
    }
});

// GET /api/weeds/history/:fieldId - Get weed history for field
router.get('/history/:fieldId', auth, async (req, res) => {
    try {
        const { startDate, endDate, includeResolved = 'true' } = req.query;
        
        // Verify field belongs to user
        const field = await Field.findOne({
            _id: req.params.fieldId,
            farmer: req.user.id
        });
        
        if (!field) {
            return res.status(404).json({ error: 'Field not found' });
        }
        
        const options = {};
        if (startDate) options.startDate = startDate;
        if (endDate) options.endDate = endDate;
        
        let query = { field: req.params.fieldId };
        
        if (includeResolved !== 'true') {
            query.status = { $nin: ['cleared', 'controlled'] };
        }
        
        const history = await WeedIssue.getWeedHistoryForField(req.params.fieldId, options);
        
        // Aggregate statistics
        const stats = {
            totalIssues: history.length,
            byWeedType: {},
            bySeverity: { mild: 0, moderate: 0, severe: 0 },
            byStatus: {},
            totalArea: 0,
            totalCost: 0,
            recurrenceRate: 0
        };
        
        let recurrenceCount = 0;
        
        history.forEach(issue => {
            // By weed type
            if (!stats.byWeedType[issue.weedName]) {
                stats.byWeedType[issue.weedName] = {
                    count: 0,
                    issues: []
                };
            }
            stats.byWeedType[issue.weedName].count++;
            stats.byWeedType[issue.weedName].issues.push(issue);
            
            // By severity
            if (stats.bySeverity[issue.severity] !== undefined) {
                stats.bySeverity[issue.severity]++;
            }
            
            // By status
            if (!stats.byStatus[issue.status]) stats.byStatus[issue.status] = 0;
            stats.byStatus[issue.status]++;
            
            // Area and cost
            stats.totalArea += issue.infestation?.area || 0;
            stats.totalCost += issue.actualCost?.totalCost || issue.costEstimate?.totalCost || 0;
            
            // Recurrence
            if (issue.recurrence?.isRecurrence) {
                recurrenceCount++;
            }
        });
        
        if (history.length > 0) {
            stats.recurrenceRate = (recurrenceCount / history.length) * 100;
        }
        
        res.json({
            field: {
                _id: field._id,
                name: field.name,
                size: field.size
            },
            history,
            stats,
            summary: {
                totalIssues: history.length,
                activeIssues: history.filter(i => !['cleared', 'controlled'].includes(i.status)).length,
                totalArea: stats.totalArea,
                totalCost: stats.totalCost,
                averageCostPerIssue: history.length > 0 ? stats.totalCost / history.length : 0
            }
        });
    } catch (error) {
        console.error('Error fetching field history:', error);
        res.status(500).json({ error: 'Failed to fetch field history', details: error.message });
    }
});

// POST /api/weeds/control-apply - Apply control method
router.post('/control-apply', auth, async (req, res) => {
    try {
        const {
            issueId,
            methodType,
            productsUsed,
            equipmentUsed,
            laborUsed,
            applicationDate,
            areaCovered,
            cost,
            notes,
            weatherConditions,
            photos
        } = req.body;
        
        if (!issueId || !methodType) {
            return res.status(400).json({ 
                error: 'Issue ID and method type are required' 
            });
        }
        
        const issue = await WeedIssue.findOne({
            _id: issueId,
            farmer: req.user.id
        });
        
        if (!issue) {
            return res.status(404).json({ error: 'Weed issue not found' });
        }
        
        const applicationData = {
            methodType,
            methodName: issue.assignedControlMethod?.methodName || methodType,
            productsUsed: productsUsed || [],
            equipmentUsed: equipmentUsed || [],
            laborUsed: laborUsed || [],
            applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
            areaCovered: areaCovered || issue.infestation?.area,
            cost: cost || 0,
            notes,
            weatherConditions,
            photos: photos || [],
            appliedBy: req.user.id,
            appliedByName: req.user.name,
            status: 'completed'
        };
        
        await issue.addControlApplication(applicationData);
        
        // Update actual cost
        const totalCost = issue.controlApplications.reduce((sum, app) => sum + (app.cost || 0), 0);
        issue.actualCost = {
            ...issue.actualCost,
            totalCost,
            materialCost: issue.actualCost?.materialCost || 0,
            laborCost: issue.actualCost?.laborCost || 0,
            equipmentCost: issue.actualCost?.equipmentCost || 0,
            otherCosts: issue.actualCost?.otherCosts || 0,
            currency: 'INR'
        };
        
        await issue.save();
        
        res.json({
            message: 'Control method applied successfully',
            application: applicationData,
            issue: await WeedIssue.findById(issueId)
                .populate('weedType', 'name')
                .populate('crop', 'name')
        });
    } catch (error) {
        console.error('Error applying control method:', error);
        res.status(500).json({ error: 'Failed to apply control method', details: error.message });
    }
});

// POST /api/weeds/monitoring - Add monitoring record
router.post('/monitoring', auth, async (req, res) => {
    try {
        const {
            issueId,
            currentSeverity,
            weedDensity,
            regrowth,
            regrowthPercentage,
            cropRecovery,
            effectiveness,
            weedKillPercentage,
            newWeedsDetected,
            newWeeds,
            photos,
            notes,
            nextMonitoringDate
        } = req.body;
        
        if (!issueId) {
            return res.status(400).json({ error: 'Issue ID is required' });
        }
        
        const issue = await WeedIssue.findOne({
            _id: issueId,
            farmer: req.user.id
        });
        
        if (!issue) {
            return res.status(404).json({ error: 'Weed issue not found' });
        }
        
        const monitoringData = {
            currentSeverity,
            weedDensity,
            regrowth,
            regrowthPercentage,
            cropRecovery,
            effectiveness,
            weedKillPercentage,
            newWeedsDetected,
            newWeeds: newWeeds || [],
            photos: photos || [],
            notes,
            nextMonitoringDate: nextMonitoringDate ? new Date(nextMonitoringDate) : null,
            monitoredBy: req.user.id,
            monitoredByName: req.user.name
        };
        
        await issue.addMonitoringRecord(monitoringData);
        
        res.json({
            message: 'Monitoring record added successfully',
            monitoring: monitoringData,
            issue: await WeedIssue.findById(issueId)
                .populate('weedType', 'name')
                .populate('crop', 'name')
        });
    } catch (error) {
        console.error('Error adding monitoring record:', error);
        res.status(500).json({ error: 'Failed to add monitoring record', details: error.message });
    }
});

// GET /api/weeds/analytics/:cropId - Get weed analytics for crop
router.get('/analytics/:cropId', auth, async (req, res) => {
    try {
        const { startDate, endDate, field } = req.query;
        
        // Get crop details
        const crop = await Crop.findOne({
            _id: req.params.cropId,
            farmer: req.user.id
        });
        
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        const options = {
            crop: req.params.cropId,
            startDate,
            endDate,
            field
        };
        
        const analytics = await WeedIssue.getAnalytics(req.user.id, options);
        
        // Get weed-specific data for this crop
        const weedIssues = await WeedIssue.find({
            farmer: req.user.id,
            crop: req.params.cropId,
            isActive: true
        })
        .select('weedName weedCategory severity status detectionDate controlledDate costEstimate infestation controlApplications')
        .lean();
        
        // Calculate trends
        const monthlyData = weedIssues.reduce((acc, issue) => {
            const month = new Date(issue.detectionDate).toISOString().slice(0, 7); // YYYY-MM
            if (!acc[month]) {
                acc[month] = {
                    month,
                    issues: 0,
                    byWeed: {},
                    totalArea: 0,
                    totalCost: 0
                };
            }
            
            acc[month].issues++;
            acc[month].totalArea += issue.infestation?.area || 0;
            acc[month].totalCost += issue.costEstimate?.totalCost || 0;
            
            if (!acc[month].byWeed[issue.weedName]) {
                acc[month].byWeed[issue.weedName] = 0;
            }
            acc[month].byWeed[issue.weedName]++;
            
            return acc;
        }, {});
        
        // Most problematic weeds
        const weedFrequency = {};
        weedIssues.forEach(issue => {
            if (!weedFrequency[issue.weedName]) {
                weedFrequency[issue.weedName] = {
                    count: 0,
                    severity: issue.severity,
                    totalArea: 0,
                    totalCost: 0
                };
            }
            weedFrequency[issue.weedName].count++;
            weedFrequency[issue.weedName].totalArea += issue.infestation?.area || 0;
            weedFrequency[issue.weedName].totalCost += issue.costEstimate?.totalCost || 0;
        });
        
        const topWeeds = Object.entries(weedFrequency)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data }));
        
        // Cost analysis
        const costAnalysis = weedIssues.reduce((acc, issue) => {
            const cost = issue.actualCost?.totalCost || issue.costEstimate?.totalCost || 0;
            acc.total += cost;
            
            if (cost > acc.highest.cost) {
                acc.highest = { cost, weed: issue.weedName, issue: issue._id };
            }
            
            acc.byMethod[issue.assignedControlMethod?.methodType || 'unknown'] = 
                (acc.byMethod[issue.assignedControlMethod?.methodType || 'unknown'] || 0) + cost;
            
            return acc;
        }, { total: 0, highest: { cost: 0 }, byMethod: {} });
        
        res.json({
            crop: {
                _id: crop._id,
                name: crop.name,
                variety: crop.variety
            },
            summary: analytics[0] || {
                totalIssues: weedIssues.length,
                totalArea: 0,
                totalCost: 0
            },
            trends: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
            topProblematicWeeds: topWeeds,
            costAnalysis,
            issues: weedIssues
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
    }
});

// POST /api/weeds/assign-control - Assign control method to issue
router.post('/assign-control', auth, async (req, res) => {
    try {
        const {
            issueId,
            methodType,
            methodName,
            selectedOptions,
            expectedEffectiveness,
            chemicalDetails,
            mechanicalDetails,
            culturalDetails,
            organicDetails,
            rationale
        } = req.body;
        
        if (!issueId || !methodType) {
            return res.status(400).json({ 
                error: 'Issue ID and method type are required' 
            });
        }
        
        const issue = await WeedIssue.findOne({
            _id: issueId,
            farmer: req.user.id
        });
        
        if (!issue) {
            return res.status(404).json({ error: 'Weed issue not found' });
        }
        
        const methodData = {
            methodType,
            methodName,
            selectedOptions,
            expectedEffectiveness,
            chemicalDetails,
            mechanicalDetails,
            culturalDetails,
            organicDetails,
            rationale
        };
        
        await issue.assignControlMethod(methodData, req.user);
        
        // Recalculate cost estimate
        issue.calculateCostEstimate();
        await issue.save();
        
        res.json({
            message: 'Control method assigned successfully',
            assignedMethod: issue.assignedControlMethod,
            costEstimate: issue.costEstimate
        });
    } catch (error) {
        console.error('Error assigning control method:', error);
        res.status(500).json({ error: 'Failed to assign control method', details: error.message });
    }
});

// Helper Functions
function calculateMatchConfidence(weed, criteria) {
    let confidence = 50; // Base confidence
    
    // Increase confidence if symptoms match
    if (criteria.symptoms && weed.identification) {
        const leafShapes = weed.identification.leaves?.shape || [];
        const matchingSymptoms = criteria.symptoms.filter(s => 
            leafShapes.some(ls => ls.toLowerCase().includes(s.toLowerCase()))
        );
        confidence += (matchingSymptoms.length / criteria.symptoms.length) * 30;
    }
    
    // Increase if category matches
    if (criteria.category && weed.category === criteria.category) {
        confidence += 10;
    }
    
    // Decrease if growth habit doesn't match
    if (criteria.growthHabit && weed.growthCharacteristics?.growthRate !== criteria.growthHabit) {
        confidence -= 10;
    }
    
    return Math.min(Math.round(confidence), 100);
}

function calculateSeverityScore(severity, affectedPercentage, weedDensity) {
    const severityWeights = { mild: 1, moderate: 2, severe: 3 };
    const densityWeights = { low: 1, medium: 2, high: 3, severe: 4 };
    
    const severityWeight = severityWeights[severity] || 1;
    const densityWeight = densityWeights[weedDensity] || 2;
    const areaFactor = (affectedPercentage || 0) / 100;
    
    const score = (severityWeight * 25 + densityWeight * 15 + areaFactor * 40);
    return Math.min(Math.round(score), 100);
}

async function getControlRecommendations(weed, cropName, severity) {
    const methods = weed.getControlMethodsForCrop(cropName);
    
    if (!methods) return null;
    
    // Prioritize methods based on severity
    let recommendations = {
        immediate: [],
        primary: [],
        alternative: []
    };
    
    // Chemical for severe infestations
    if (severity === 'severe' && methods.chemical?.length > 0) {
        recommendations.immediate = methods.chemical
            .filter(h => h.effectiveness === 'excellent' || h.effectiveness === 'good')
            .slice(0, 2);
    }
    
    // Mechanical for moderate
    if (methods.mechanical?.length > 0) {
        recommendations.primary = methods.mechanical
            .slice(0, 2);
    }
    
    // Cultural/Organic as alternatives
    recommendations.alternative = [
        ...(methods.cultural || []).slice(0, 1),
        ...(methods.organic || []).slice(0, 1)
    ];
    
    return recommendations;
}

module.exports = router;
