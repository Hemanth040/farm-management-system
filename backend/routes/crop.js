const express = require('express');
const router = express.Router();
const { Crop, Activity, CropPlan, TimelineEvent } = require('../models');
const auth = require('../middleware/auth');

// Get all crops for a farmer
router.get('/', auth, async (req, res) => {
    try {
        const crops = await Crop.find({ farmer: req.user.id })
            .sort({ sowingDate: 1 })
            .populate('plan');
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new crop plan
router.post('/', auth, async (req, res) => {
    try {
        const {
            name,
            variety,
            season,
            landType,
            area,
            sowingDate,
            expectedHarvestDate,
            soilType,
            waterSource,
            planDetails
        } = req.body;

        // Create crop
        const crop = new Crop({
            farmer: req.user.id,
            name,
            variety,
            season,
            landType,
            area: parseFloat(area),
            sowingDate: new Date(sowingDate),
            expectedHarvestDate: new Date(expectedHarvestDate),
            soilType,
            waterSource,
            status: 'planned'
        });

        await crop.save();

        // Create crop plan
        if (planDetails) {
            const cropPlan = new CropPlan({
                crop: crop._id,
                seedRequired: planDetails.seedRequired,
                fertilizerRequired: planDetails.fertilizerRequired,
                waterRequirement: planDetails.waterRequirement,
                expectedYield: planDetails.expectedYield,
                duration: planDetails.duration,
                totalCost: planDetails.totalCost,
                operations: planDetails.operations || []
            });
            await cropPlan.save();

            // Link plan to crop
            crop.plan = cropPlan._id;
            await crop.save();

            // Generate timeline events
            await generateTimelineEvents(crop, cropPlan, req.user.id);
        }

        res.status(201).json({ crop, message: 'Crop plan created successfully' });
    } catch (error) {
        console.error('Error creating crop:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate timeline events from crop plan
const generateTimelineEvents = async (crop, cropPlan, farmerId) => {
    try {
        const events = [];
        const sowingDate = new Date(crop.sowingDate);
        
        // Add sowing event
        events.push({
            farmer: farmerId,
            crop: crop._id,
            title: `Sowing: ${crop.name} (${crop.variety || 'Unknown Variety'})`,
            description: `Start sowing ${crop.name} in ${crop.area} acres`,
            type: 'sowing',
            date: sowingDate,
            status: 'upcoming'
        });

        // Add operation events from plan
        if (cropPlan.operations && cropPlan.operations.length > 0) {
            cropPlan.operations.forEach((operation, index) => {
                const eventDate = new Date(sowingDate);
                // Handle daysAfterSowing carefully
                const days = operation.daysAfterSowing !== undefined ? operation.daysAfterSowing : (index + 1) * 15;
                eventDate.setDate(eventDate.getDate() + days);
                
                events.push({
                    farmer: farmerId,
                    crop: crop._id,
                    title: `${operation.name} for ${crop.name}`,
                    description: operation.description || `Perform ${operation.name} operation`,
                    type: operation.type || 'operation',
                    date: eventDate,
                    status: 'upcoming'
                });
            });
        }

        // Add fertilizer application events (every 30 days) - supplementary
        const daysToHarvest = Math.floor((new Date(crop.expectedHarvestDate) - sowingDate) / (1000 * 60 * 60 * 24));
        const fertilizerApplications = Math.floor(daysToHarvest / 30);
        
        // Check if fertilizer events already exist in operations to avoid duplicates? 
        // For now, let's assume operations are primary, but this loop adds generic recurring events.
        // To avoid clutter, I'll only add if explicit operations are sparse? 
        // No, the requirement says "Generate timeline events", and the code provided has this logic.
        // I will stick to the provided logic but maybe check if "Fertilizer" is already in operations.
        // Actually, let's stick to the user's code to be safe, assuming they want these reminders.
        
        for (let i = 1; i <= fertilizerApplications; i++) {
            const eventDate = new Date(sowingDate);
            eventDate.setDate(eventDate.getDate() + i * 30);
            
            // Only add if not duplicate date/type? simple check
            events.push({
                farmer: farmerId,
                crop: crop._id,
                title: `Fertilizer Application - ${crop.name}`,
                description: `Apply fertilizer for ${crop.name} (${i}/${fertilizerApplications})`,
                type: 'fertilizer',
                date: eventDate,
                status: 'upcoming'
            });
        }

        // Add irrigation events (every 7 days)
        const irrigationEvents = Math.floor(daysToHarvest / 7);
        for (let i = 1; i <= irrigationEvents; i++) {
            const eventDate = new Date(sowingDate);
            eventDate.setDate(eventDate.getDate() + i * 7);
            
            events.push({
                farmer: farmerId,
                crop: crop._id,
                title: `Irrigation - ${crop.name}`,
                description: `Water the ${crop.name} crop`,
                type: 'irrigation',
                date: eventDate,
                status: 'upcoming'
            });
        }

        // Add pest control events (every 21 days)
        const pestControlEvents = Math.floor(daysToHarvest / 21);
        for (let i = 1; i <= pestControlEvents; i++) {
            const eventDate = new Date(sowingDate);
            eventDate.setDate(eventDate.getDate() + i * 21);
            
            events.push({
                farmer: farmerId,
                crop: crop._id,
                title: `Pest Control - ${crop.name}`,
                description: `Check and apply pest control measures`,
                type: 'pest-control',
                date: eventDate,
                status: 'upcoming'
            });
        }

        // Add harvesting event
        events.push({
            farmer: farmerId,
            crop: crop._id,
            title: `Harvesting: ${crop.name}`,
            description: `Harvest ${crop.name} from ${crop.area} acres`,
            type: 'harvesting',
            date: new Date(crop.expectedHarvestDate),
            status: 'upcoming'
        });

        // Save all events to database
        await TimelineEvent.insertMany(events);

        console.log(`Generated ${events.length} timeline events for crop: ${crop.name}`);
    } catch (error) {
        console.error('Error generating timeline events:', error);
    }
};

// Get crop recommendations
router.get('/recommendations', auth, async (req, res) => {
    try {
        const { season, soilType } = req.query;
        
        const recommendations = {
            rabi: {
                sandy: ['Wheat', 'Barley', 'Mustard', 'Gram', 'Potato'],
                loam: ['Wheat', 'Barley', 'Mustard', 'Gram', 'Peas', 'Onion'],
                clay: ['Wheat', 'Mustard', 'Gram', 'Lentil', 'Garlic']
            },
            kharif: {
                sandy: ['Rice', 'Maize', 'Cotton', 'Soybean', 'Groundnut'],
                loam: ['Rice', 'Maize', 'Cotton', 'Soybean', 'Sugarcane'],
                clay: ['Rice', 'Jute', 'Sugarcane', 'Turmeric', 'Ginger']
            },
            zaid: {
                sandy: ['Watermelon', 'Cucumber', 'Bitter Gourd', 'Pumpkin'],
                loam: ['Watermelon', 'Muskmelon', 'Cucumber', 'Tomato'],
                clay: ['Rice', 'Vegetables', 'Fodder Crops']
            }
        };

        const crops = recommendations[season]?.[soilType] || [];
        
        // Get additional details for each crop
        const cropDetails = crops.map(cropName => {
            const requirements = getCropRequirements(cropName);
            return {
                name: cropName,
                ...requirements
            };
        });

        res.json(cropDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get crop requirements
const getCropRequirements = (cropName) => {
    const requirements = {
        Wheat: {
            seedPerAcre: 40,
            fertilizer: 'NPK 120:60:40 kg/ha',
            water: '500-600 mm',
            duration: '120-140 days',
            yield: '2.5-3.5 tons/acre',
            operations: [
                { name: 'Land Preparation', daysAfterSowing: -7, type: 'preparation' },
                { name: 'Sowing', daysAfterSowing: 0, type: 'sowing' },
                { name: 'First Irrigation', daysAfterSowing: 21, type: 'irrigation' },
                { name: 'Weeding', daysAfterSowing: 30, type: 'weeding' },
                { name: 'Fertilizer Application', daysAfterSowing: 45, type: 'fertilizer' },
                { name: 'Second Irrigation', daysAfterSowing: 60, type: 'irrigation' },
                { name: 'Harvesting', daysAfterSowing: 120, type: 'harvesting' }
            ]
        },
        Rice: {
            seedPerAcre: 8,
            fertilizer: 'NPK 100:50:50 kg/ha',
            water: '1000-1500 mm',
            duration: '100-150 days',
            yield: '2-3 tons/acre',
            operations: [
                { name: 'Nursery Preparation', daysAfterSowing: -30, type: 'preparation' },
                { name: 'Transplanting', daysAfterSowing: 0, type: 'sowing' },
                { name: 'First Irrigation', daysAfterSowing: 1, type: 'irrigation' },
                { name: 'Weeding', daysAfterSowing: 20, type: 'weeding' },
                { name: 'Fertilizer Application', daysAfterSowing: 30, type: 'fertilizer' },
                { name: 'Pest Control', daysAfterSowing: 45, type: 'pest-control' },
                { name: 'Harvesting', daysAfterSowing: 120, type: 'harvesting' }
            ]
        },
        // Add more crops as needed
    };

    return requirements[cropName] || requirements['Wheat'];
};

// Get annual timeline
router.get('/timeline', auth, async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year || new Date().getFullYear();
        const startDate = new Date(`${targetYear}-01-01`);
        const endDate = new Date(`${targetYear}-12-31`);

        const timeline = await TimelineEvent.find({
            farmer: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        })
        .populate('crop', 'name variety area')
        .sort({ date: 1 });

        // Group by month
        const monthlyTimeline = {};
        timeline.forEach(event => {
            const month = event.date.toLocaleString('default', { month: 'short' });
            if (!monthlyTimeline[month]) {
                monthlyTimeline[month] = [];
            }
            monthlyTimeline[month].push(event);
        });

        res.json({
            events: timeline,
            monthlyTimeline,
            stats: {
                totalEvents: timeline.length,
                upcoming: timeline.filter(e => e.status === 'upcoming').length,
                completed: timeline.filter(e => e.status === 'completed').length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
