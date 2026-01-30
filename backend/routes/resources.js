const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
// Import models from index or directly, consistent with project style
// Using require('../models') if possible, otherwise direct.
// In timeline.js I used direct require for TimelineActivity and destructuring for Crop, Worker.
// Let's check what's available in ../models/index.js.
// It has Crop, CropPlan, TimelineEvent, Activity, Worker, Field, TimelineActivity.
const { Crop, TimelineActivity, Worker } = require('../models');

// Get all resources with filters
router.get('/', auth, async (req, res) => {
    try {
        const {
            category,
            location,
            isEquipment,
            lowStock,
            expired,
            maintenanceDue,
            search
        } = req.query;
        
        let query = { farmer: req.user.id, isArchived: false };
        
        // Apply filters
        if (category) query.category = category;
        if (location) query.location = location;
        if (isEquipment) query.isEquipment = isEquipment === 'true';
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }
        
        let resources = await Resource.find(query)
            .populate('crops.crop', 'name variety')
            .sort({ category: 1, name: 1 });
        
        // Apply additional filters after query
        if (lowStock === 'true') {
            resources = resources.filter(r => r.availableQuantity <= r.minimumThreshold);
        }
        
        if (expired === 'true') {
            const now = new Date();
            resources = resources.filter(r => r.expiryDate && r.expiryDate < now);
        }
        
        if (maintenanceDue === 'true') {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            resources = resources.filter(r => 
                r.isEquipment && 
                r.nextMaintenanceDate && 
                r.nextMaintenanceDate <= nextWeek
            );
        }
        
        // Calculate summary statistics
        const stats = {
            totalResources: resources.length,
            totalValue: resources.reduce((sum, r) => sum + (r.totalCost || 0), 0),
            lowStockCount: resources.filter(r => r.availableQuantity <= r.minimumThreshold).length,
            equipmentCount: resources.filter(r => r.isEquipment).length,
            expiredCount: resources.filter(r => r.expiryDate && r.expiryDate < new Date()).length,
            byCategory: resources.reduce((acc, r) => {
                acc[r.category] = (acc[r.category] || 0) + 1;
                return acc;
            }, {})
        };
        
        res.json({ resources, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resource by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('crops.crop', 'name variety area')
        .populate('usageHistory.activity', 'title type')
        .populate('usageHistory.crop', 'name')
        .populate('usageHistory.worker', 'name')
        .populate('supervisorNotes.supervisor', 'name role');
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new resource
router.post('/', auth, async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            farmer: req.user.id,
            createdBy: req.user.id,
            updatedBy: req.user.id
        };
        
        // Set available quantity equal to total quantity for new resources
        if (resourceData.totalQuantity && !resourceData.availableQuantity) {
            resourceData.availableQuantity = resourceData.totalQuantity;
        }
        
        const resource = new Resource(resourceData);
        await resource.save();
        
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update resource
router.put('/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            {
                ...req.body,
                updatedBy: req.user.id,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Archive resource (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const resource = await Resource.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            { isArchived: true, updatedAt: new Date() },
            { new: true }
        );
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        res.json({ message: 'Resource archived successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Use resource (deduct from inventory)
router.post('/:id/use', auth, async (req, res) => {
    try {
        const { quantity, activityId, cropId, workerId, notes } = req.body;
        
        const resource = await Resource.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        // Get activity details
        let activityTitle = '';
        if (activityId) {
            const activity = await TimelineActivity.findById(activityId);
            activityTitle = activity?.title || '';
        }
        
        // Get crop details
        let cropName = '';
        if (cropId) {
            const crop = await Crop.findById(cropId);
            cropName = crop?.name || '';
        }

        // Get worker details
        let workerName = '';
        if (workerId) {
             const worker = await Worker.findById(workerId);
             workerName = worker?.name || '';
        }
        
        // Use the resource
        await resource.useResource({
            quantity: parseFloat(quantity),
            activity: activityId,
            activityTitle,
            crop: cropId,
            cropName,
            worker: workerId,
            workerName,
            notes,
            approved: true,
            approvedBy: req.user.id
        });
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add stock to resource
router.post('/:id/add-stock', auth, async (req, res) => {
    try {
        const { quantity, costPerUnit, vendor, purchaseDate } = req.body;
        
        const resource = await Resource.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        await resource.addStock(
            parseFloat(quantity),
            costPerUnit ? parseFloat(costPerUnit) : undefined,
            vendor
        );
        
        if (purchaseDate) {
            resource.purchaseDate = new Date(purchaseDate);
            await resource.save();
        }
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resource usage history
router.get('/:id/usage-history', auth, async (req, res) => {
    try {
        const { startDate, endDate, cropId } = req.query;
        
        const resource = await Resource.findOne({
            _id: req.params.id,
            farmer: req.user.id
        }).select('usageHistory');
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        let usageHistory = resource.usageHistory;
        
        // Apply filters
        if (startDate || endDate) {
            usageHistory = usageHistory.filter(usage => {
                const usageDate = new Date(usage.date);
                if (startDate && usageDate < new Date(startDate)) return false;
                if (endDate && usageDate > new Date(endDate)) return false;
                return true;
            });
        }
        
        if (cropId) {
            usageHistory = usageHistory.filter(usage => 
                usage.crop && usage.crop.toString() === cropId
            );
        }
        
        // Sort by date
        usageHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(usageHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add supervisor note
router.post('/:id/supervisor-notes', auth, async (req, res) => {
    try {
        const { note } = req.body;
        
        const resource = await Resource.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        resource.supervisorNotes.push({
            supervisor: req.user.id,
            supervisorName: req.user.name,
            note,
            date: new Date(),
            approved: false
        });
        
        await resource.save();
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark alert as resolved
router.post('/:id/alerts/:alertId/resolve', auth, async (req, res) => {
    try {
        const resource = await Resource.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        const alert = resource.alerts.id(req.params.alertId);
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        
        alert.resolved = true;
        await resource.save();
        
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resource analytics
router.get('/analytics/overview', auth, async (req, res) => {
    try {
        const resources = await Resource.find({ 
            farmer: req.user.id,
            isArchived: false 
        });
        
        // Total value by category
        const valueByCategory = resources.reduce((acc, resource) => {
            const category = resource.category;
            acc[category] = (acc[category] || 0) + (resource.totalCost || 0);
            return acc;
        }, {});
        
        // Monthly usage trend
        const monthlyUsage = {};
        resources.forEach(resource => {
            resource.monthlyUsage.forEach(monthly => {
                if (!monthlyUsage[monthly.month]) {
                    monthlyUsage[monthly.month] = { quantity: 0, cost: 0 };
                }
                monthlyUsage[monthly.month].quantity += monthly.quantity;
                monthlyUsage[monthly.month].cost += monthly.cost;
            });
        });
        
        // Top used resources
        const topUsed = resources
            .map(r => ({
                name: r.name,
                category: r.category,
                usedQuantity: r.usedQuantity,
                unit: r.unit,
                cost: r.usedQuantity * (r.costPerUnit || 0)
            }))
            .sort((a, b) => b.usedQuantity - a.usedQuantity)
            .slice(0, 10);
        
        // Resource health status
        const lowStockItems = await Resource.getLowStockItems(req.user.id);
        const expiredItems = await Resource.getExpiredItems(req.user.id);
        const maintenanceDueItems = await Resource.getMaintenanceDueItems(req.user.id);
        
        res.json({
            overview: {
                totalResources: resources.length,
                totalValue: resources.reduce((sum, r) => sum + (r.totalCost || 0), 0),
                activeAlerts: resources.reduce((sum, r) => sum + r.alerts.filter(a => !a.resolved).length, 0)
            },
            valueByCategory,
            monthlyUsage,
            topUsed,
            alerts: {
                lowStock: lowStockItems.length,
                expired: expiredItems.length,
                maintenanceDue: maintenanceDueItems.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recommendations based on crop plan
router.get('/recommendations', auth, async (req, res) => {
    try {
        const { cropId, area } = req.query;
        
        if (!cropId) {
            return res.status(400).json({ error: 'Crop ID is required' });
        }
        
        const crop = await Crop.findOne({
            _id: cropId,
            farmer: req.user.id
        });
        
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        // Get standard recommendations for this crop
        const recommendations = await getCropRecommendations(crop.name, parseFloat(area || crop.area));
        
        // Check current inventory
        const resources = await Resource.find({
            farmer: req.user.id,
            isArchived: false
        });
        
        const recommendationsWithInventory = recommendations.map(rec => {
            const existingResource = resources.find(r => 
                r.name.toLowerCase().includes(rec.name.toLowerCase()) ||
                rec.name.toLowerCase().includes(r.name.toLowerCase())
            );
            
            return {
                ...rec,
                existingInInventory: existingResource ? {
                    available: existingResource.availableQuantity,
                    unit: existingResource.unit,
                    needs: Math.max(0, rec.quantity - existingResource.availableQuantity)
                } : null
            };
        });
        
        res.json({
            crop: crop.name,
            area: area || crop.area,
            recommendations: recommendationsWithInventory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function for crop recommendations
async function getCropRecommendations(cropName, area) {
    const recommendations = {
        'Rice': [
            { name: 'Rice Seeds', category: 'seeds', quantity: 8 * area, unit: 'kg' },
            { name: 'Urea', category: 'fertilizers', quantity: 60 * area, unit: 'kg' },
            { name: 'DAP', category: 'fertilizers', quantity: 30 * area, unit: 'kg' },
            { name: 'MOP', category: 'fertilizers', quantity: 30 * area, unit: 'kg' },
            { name: 'Insecticide', category: 'pesticides', quantity: 2 * area, unit: 'liters' }
        ],
        'Wheat': [
            { name: 'Wheat Seeds', category: 'seeds', quantity: 40 * area, unit: 'kg' },
            { name: 'Urea', category: 'fertilizers', quantity: 50 * area, unit: 'kg' },
            { name: 'DAP', category: 'fertilizers', quantity: 25 * area, unit: 'kg' },
            { name: 'Herbicide', category: 'herbicides', quantity: 1 * area, unit: 'liters' }
        ],
        'Cotton': [
            { name: 'Cotton Seeds', category: 'seeds', quantity: 2 * area, unit: 'kg' },
            { name: 'NPK Fertilizer', category: 'fertilizers', quantity: 80 * area, unit: 'kg' },
            { name: 'Pesticide', category: 'pesticides', quantity: 3 * area, unit: 'liters' }
        ]
    };
    
    return recommendations[cropName] || [
        { name: 'Seeds', category: 'seeds', quantity: 10 * area, unit: 'kg' },
        { name: 'General Fertilizer', category: 'fertilizers', quantity: 50 * area, unit: 'kg' },
        { name: 'General Pesticide', category: 'pesticides', quantity: 1 * area, unit: 'liters' }
    ];
}

// Export resources to CSV
router.get('/export/csv', auth, async (req, res) => {
    try {
        const resources = await Resource.find({ 
            farmer: req.user.id,
            isArchived: false 
        });
        
        // Create CSV header
        let csv = 'Name,Category,Available Quantity,Unit,Cost per Unit,Total Cost,Location,Expiry Date,Status\n';
        
        // Add data rows
        resources.forEach(resource => {
            const row = [
                `"${resource.name}"`, // Corrected escaping for double quotes within a string
                resource.category,
                resource.availableQuantity,
                resource.unit,
                resource.costPerUnit || 0,
                resource.totalCost || 0,
                resource.location,
                resource.expiryDate ? resource.expiryDate.toISOString().split('T')[0] : '',
                resource.isEquipment ? resource.equipmentStatus : 'Active'
            ].join(',');
            
            csv += row + '\n';
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=resources-export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
