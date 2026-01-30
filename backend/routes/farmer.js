const express = require('express');
const router = express.Router();
const { Farmer, Reminder, Warning, Crop, Activity, Resource, Expense, Income, Worker } = require('../models');

// Middleware for authentication
const auth = require('../middleware/auth');

// Worker List
router.get('/workers', auth, async (req, res) => {
    try {
        const workers = await Worker.find({ farmer: req.user.id });
        res.json(workers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1. REMINDERS
router.post('/reminders', auth, async (req, res) => {
    try {
        const reminder = new Reminder({
            ...req.body,
            farmer: req.user.id
        });
        await reminder.save();
        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/reminders', auth, async (req, res) => {
    try {
        const reminders = await Reminder.find({ farmer: req.user.id })
            .sort({ date: 1 });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. WARNINGS
router.get('/warnings', auth, async (req, res) => {
    try {
        // Get farmer's location and crops
        const farmer = await Farmer.findById(req.user.id);
        
        // Simulated weather warnings
        const warnings = [
            {
                type: 'weather',
                severity: 'high',
                message: 'Heavy rainfall expected in your area tomorrow',
                date: new Date()
            },
            {
                type: 'pest',
                severity: 'medium',
                message: 'Pest alert: Increased locust activity in your region',
                date: new Date()
            }
        ];
        
        res.json(warnings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. CROP PLANNER
router.post('/crops', auth, async (req, res) => {
    try {
        const crop = new Crop({
            ...req.body,
            farmer: req.user.id
        });
        await crop.save();
        res.status(201).json(crop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/crops/plan', auth, async (req, res) => {
    try {
        const { season, landType } = req.query;
        
        // Crop recommendations based on season and land type
        const recommendations = {
            rabi: ['Wheat', 'Barley', 'Mustard', 'Gram'],
            kharif: ['Rice', 'Maize', 'Cotton', 'Soybean'],
            zaid: ['Watermelon', 'Cucumber', 'Bitter gourd']
        };
        
        const crops = recommendations[season] || ['Wheat', 'Rice', 'Maize'];
        res.json({ recommendations: crops });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. ACTIVITY TIMELINE
router.get('/activities', auth, async (req, res) => {
    try {
        const { filter, startDate, endDate } = req.query;
        
        let query = { farmer: req.user.id };
        
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        
        if (filter) {
            query.type = filter;
        }
        
        const activities = await Activity.find(query)
            .sort({ date: -1 })
            .populate('crop', 'name');
            
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. RESOURCE MANAGEMENT
router.get('/resources', auth, async (req, res) => {
    try {
        const resources = await Resource.find({ farmer: req.user.id });
        
        // Check for low inventory
        const alerts = resources.filter(r => r.quantity < r.threshold);
        
        res.json({ resources, alerts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. FINANCIAL MANAGEMENT
router.get('/financial', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Get expenses and income
        const expenses = await Expense.find({
            farmer: req.user.id,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        
        const income = await Income.find({
            farmer: req.user.id,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
        const profit = totalIncome - totalExpense;
        
        res.json({
            expenses,
            income,
            summary: { totalExpense, totalIncome, profit }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. CROP DISEASE DATABASE
router.get('/diseases', auth, async (req, res) => {
    try {
        const { cropName, symptom } = req.query;
        
        // Disease database (in production, this would be in MongoDB)
        const diseases = [
            {
                name: 'Blast Disease',
                crop: 'Rice',
                symptoms: ['Spindle-shaped spots on leaves', 'Gray centers with brown margins'],
                treatment: 'Use resistant varieties, apply Tricyclazole',
                prevention: 'Avoid excessive nitrogen, ensure proper drainage'
            },
            {
                name: 'Powdery Mildew',
                crop: 'Wheat',
                symptoms: ['White powdery growth on leaves', 'Yellowing of leaves'],
                treatment: 'Apply sulfur-based fungicides',
                prevention: 'Maintain proper spacing, avoid overhead irrigation'
            }
        ];
        
        let filteredDiseases = diseases;
        if (cropName) {
            filteredDiseases = diseases.filter(d => 
                d.crop.toLowerCase().includes(cropName.toLowerCase())
            );
        }
        
        res.json(filteredDiseases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. REPORTS & ANALYTICS
router.get('/reports', auth, async (req, res) => {
    try {
        const { reportType, year } = req.query;
        
        // Generate different types of reports
        const reports = {
            yield: await generateYieldReport(req.user.id, year),
            financial: await generateFinancialReport(req.user.id, year),
            resource: await generateResourceReport(req.user.id, year)
        };
        
        res.json(reports[reportType] || reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. WORKER MANAGEMENT
router.post('/workers', auth, async (req, res) => {
    try {
        const worker = new Worker({
            ...req.body,
            farmer: req.user.id
        });
        await worker.save();
        res.status(201).json(worker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 10. PESTICIDE GUIDANCE
router.get('/pesticide-guidance', auth, async (req, res) => {
    try {
        const { crop, pest } = req.query;
        
        const guidance = [
            {
                crop: 'Rice',
                pest: 'Stem Borer',
                pesticide: 'Chlorantraniliprole',
                dosage: '100 ml per acre',
                timing: 'Early infestation stage',
                safety: 'Use gloves and mask, avoid application during windy conditions'
            }
        ];
        
        res.json(guidance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. SELLING PROCESS
router.post('/sales', auth, async (req, res) => {
    try {
        const sale = new Sale({
            ...req.body,
            farmer: req.user.id,
            status: 'pending'
        });
        await sale.save();
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 12. WEED MANAGEMENT
router.get('/weed-management', auth, async (req, res) => {
    try {
        const { crop } = req.query;
        
        const weedData = [
            {
                weed: 'Barnyard Grass',
                cropsAffected: ['Rice', 'Maize'],
                identification: 'Stout stem, hairless leaves with white midvein',
                control: 'Pre-emergence: Butachlor, Post-emergence: Fenoxaprop',
                manual: 'Hand weeding before flowering'
            }
        ];
        
        res.json(weedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to generate yield report
async function generateYieldReport(farmerId, year) {
    const startDate = new Date(`${year || new Date().getFullYear()}-01-01`);
    const endDate = new Date(`${year || new Date().getFullYear()}-12-31`);
    
    const crops = await Crop.find({
        farmer: farmerId,
        actualHarvestDate: { $gte: startDate, $lte: endDate }
    });
    
    const totalArea = crops.reduce((sum, c) => sum + c.area, 0);
    const totalYield = crops.reduce((sum, c) => sum + (c.actualYield || 0), 0);
    const avgYieldPerAcre = totalArea > 0 ? totalYield / totalArea : 0;
    
    return {
        year: year || new Date().getFullYear(),
        totalCrops: crops.length,
        totalArea,
        totalYield,
        avgYieldPerAcre: avgYieldPerAcre.toFixed(2),
        crops: crops.map(c => ({
            name: c.name,
            variety: c.variety,
            area: c.area,
            yield: c.actualYield,
            yieldPerAcre: c.area > 0 ? (c.actualYield / c.area).toFixed(2) : 0
        }))
    };
}

// Helper function to generate financial report
async function generateFinancialReport(farmerId, year) {
    const startDate = new Date(`${year || new Date().getFullYear()}-01-01`);
    const endDate = new Date(`${year || new Date().getFullYear()}-12-31`);
    
    const expenses = await Expense.find({
        farmer: farmerId,
        date: { $gte: startDate, $lte: endDate }
    });
    
    const income = await Income.find({
        farmer: farmerId,
        date: { $gte: startDate, $lte: endDate }
    });
    
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const netProfit = totalIncome - totalExpense;
    
    // Calculate category-wise breakdown
    const expenseByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});
    
    const incomeBySource = income.reduce((acc, i) => {
        acc[i.source] = (acc[i.source] || 0) + i.amount;
        return acc;
    }, {});
    
    return {
        year: year || new Date().getFullYear(),
        summary: {
            totalIncome,
            totalExpense,
            netProfit,
            profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
        },
        expenseByCategory,
        incomeBySource,
        expenseCount: expenses.length,
        incomeCount: income.length
    };
}

// Helper function to generate resource report
async function generateResourceReport(farmerId, year) {
    const resources = await Resource.find({ farmer: farmerId });
    
    const totalValue = resources.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const lowStockCount = resources.filter(r => r.availableQuantity <= r.minimumThreshold).length;
    const equipmentCount = resources.filter(r => r.isEquipment).length;
    
    // Group by category
    const byCategory = resources.reduce((acc, r) => {
        if (!acc[r.category]) {
            acc[r.category] = { count: 0, value: 0 };
        }
        acc[r.category].count++;
        acc[r.category].value += r.totalCost || 0;
        return acc;
    }, {});
    
    return {
        year: year || new Date().getFullYear(),
        summary: {
            totalItems: resources.length,
            totalValue,
            lowStockCount,
            equipmentCount,
            activeCount: resources.filter(r => r.isActive).length
        },
        byCategory,
        items: resources.map(r => ({
            name: r.name,
            category: r.category,
            available: r.availableQuantity,
            total: r.totalQuantity,
            unit: r.unit,
            value: r.totalCost || 0
        }))
    };
}

module.exports = router;
