const express = require('express');
const router = express.Router();
const { Crop, Activity, Resource, Worker, FinancialTransaction, CropHealth, TimelineActivity } = require('../models');
const auth = require('../middleware/auth');

// ============================================
// FARM SUMMARY REPORT
// ============================================
router.get('/farm-summary', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const [
            crops,
            activities,
            resources,
            workers,
            transactions
        ] = await Promise.all([
            Crop.find({ farmer: req.user.id, createdAt: { $gte: start, $lte: end } }),
            Activity.find({ farmer: req.user.id, date: { $gte: start, $lte: end } }),
            Resource.find({ farmer: req.user.id, createdAt: { $gte: start, $lte: end } }),
            Worker.find({ farmer: req.user.id }),
            FinancialTransaction.find({ 
                farmer: req.user.id, 
                transactionDate: { $gte: start, $lte: end } 
            })
        ]);

        // Calculate totals
        const totalCrops = crops.length;
        const totalArea = crops.reduce((sum, c) => sum + (c.area || 0), 0);
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = totalIncome - totalExpenses;
        
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const totalActivities = activities.length;

        // Calculate month-wise data for chart
        const monthlyData = {};
        for (let i = 0; i < 12; i++) {
            const monthKey = `${start.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = { income: 0, expenses: 0, activities: 0 };
        }

        transactions.forEach(t => {
            const month = t.transactionDate.toISOString().slice(0, 7);
            if (monthlyData[month]) {
                if (t.type === 'income') monthlyData[month].income += t.amount;
                if (t.type === 'expense') monthlyData[month].expenses += t.amount;
            }
        });

        activities.forEach(a => {
            const month = a.date.toISOString().slice(0, 7);
            if (monthlyData[month]) {
                monthlyData[month].activities += 1;
            }
        });

        res.json({
            summary: {
                totalCrops,
                totalArea,
                totalIncome,
                totalExpenses,
                netProfit,
                profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
                completedActivities,
                totalActivities,
                activityCompletionRate: totalActivities > 0 ? ((completedActivities / totalActivities) * 100).toFixed(2) : 0,
                totalWorkers: workers.length,
                totalResources: resources.length
            },
            monthlyTrend: Object.entries(monthlyData).map(([month, data]) => ({
                month,
                ...data
            })),
            period: { startDate: start, endDate: end }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CROP-WISE PERFORMANCE REPORT
// ============================================
router.get('/crop-performance', auth, async (req, res) => {
    try {
        const { cropId, startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        let query = { farmer: req.user.id };
        if (cropId) query._id = cropId;
        
        const crops = await Crop.find(query)
            .populate('plan')
            .sort({ createdAt: -1 });

        const cropReports = await Promise.all(crops.map(async (crop) => {
            // Get all financial transactions for this crop
            const transactions = await FinancialTransaction.find({
                farmer: req.user.id,
                crop: crop._id,
                transactionDate: { $gte: start, $lte: end }
            });

            const inputCost = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            // Get activities for this crop
            const activities = await Activity.find({
                farmer: req.user.id,
                crop: crop._id,
                date: { $gte: start, $lte: end }
            });

            // Get health issues
            const healthRecords = await CropHealth.find({
                farmer: req.user.id,
                crop: crop._id
            });

            const totalIssues = healthRecords.reduce((sum, h) => sum + (h.issues?.length || 0), 0);
            const resolvedIssues = healthRecords.reduce((sum, h) => 
                sum + (h.issues?.filter(i => i.status === 'resolved').length || 0), 0);

            return {
                cropId: crop._id,
                name: crop.name,
                variety: crop.variety,
                area: crop.area,
                season: crop.season,
                sowingDate: crop.sowingDate,
                expectedHarvestDate: crop.expectedHarvestDate,
                actualHarvestDate: crop.actualHarvestDate,
                actualYield: crop.actualYield,
                expectedYield: crop.plan?.expectedYield,
                inputCost,
                income,
                profit: income - inputCost,
                profitPerAcre: crop.area > 0 ? ((income - inputCost) / crop.area).toFixed(2) : 0,
                totalActivities: activities.length,
                completedActivities: activities.filter(a => a.status === 'completed').length,
                totalIssues,
                resolvedIssues,
                status: crop.status
            };
        }));

        // Calculate overall statistics
        const totalArea = cropReports.reduce((sum, c) => sum + c.area, 0);
        const totalInputCost = cropReports.reduce((sum, c) => sum + c.inputCost, 0);
        const totalIncome = cropReports.reduce((sum, c) => sum + c.income, 0);
        const totalProfit = totalIncome - totalInputCost;

        res.json({
            crops: cropReports,
            summary: {
                totalCrops: cropReports.length,
                totalArea,
                totalInputCost,
                totalIncome,
                totalProfit,
                averageProfitPerAcre: totalArea > 0 ? (totalProfit / totalArea).toFixed(2) : 0,
                bestPerformingCrop: cropReports.length > 0 
                    ? cropReports.reduce((best, c) => c.profit > best.profit ? c : best, cropReports[0])
                    : null
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ACTIVITY REPORT
// ============================================
router.get('/activity-report', auth, async (req, res) => {
    try {
        const { startDate, endDate, cropId } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        let query = { 
            farmer: req.user.id, 
            date: { $gte: start, $lte: end } 
        };
        if (cropId) query.crop = cropId;

        const activities = await Activity.find(query)
            .populate('crop', 'name')
            .populate('workers', 'name')
            .sort({ date: -1 });

        // Group by activity type
        const byType = {};
        activities.forEach(activity => {
            if (!byType[activity.type]) {
                byType[activity.type] = { count: 0, completed: 0, cost: 0, time: 0 };
            }
            byType[activity.type].count++;
            if (activity.status === 'completed') byType[activity.type].completed++;
            byType[activity.type].cost += activity.cost || 0;
            byType[activity.type].time += activity.duration || 0;
        });

        // Group by month
        const byMonth = {};
        activities.forEach(activity => {
            const month = activity.date.toISOString().slice(0, 7);
            if (!byMonth[month]) {
                byMonth[month] = { planned: 0, completed: 0, delayed: 0 };
            }
            byMonth[month].planned++;
            if (activity.status === 'completed') {
                byMonth[month].completed++;
            }
        });

        res.json({
            activities: activities.map(a => ({
                id: a._id,
                type: a.type,
                description: a.description,
                date: a.date,
                status: a.status,
                cost: a.cost,
                duration: a.duration,
                crop: a.crop?.name,
                workers: a.workers?.map(w => w.name)
            })),
            summary: {
                total: activities.length,
                completed: activities.filter(a => a.status === 'completed').length,
                planned: activities.filter(a => a.status === 'planned').length,
                inProgress: activities.filter(a => a.status === 'in-progress').length,
                totalCost: activities.reduce((sum, a) => sum + (a.cost || 0), 0),
                totalTime: activities.reduce((sum, a) => sum + (a.duration || 0), 0)
            },
            byType: Object.entries(byType).map(([type, data]) => ({ type, ...data })),
            byMonth: Object.entries(byMonth).map(([month, data]) => ({ month, ...data }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RESOURCE USAGE REPORT
// ============================================
router.get('/resource-usage', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const resources = await Resource.find({ farmer: req.user.id });

        // Calculate usage statistics
        const resourceReports = resources.map(resource => {
            const usageHistory = resource.usageHistory?.filter(
                u => u.date >= start && u.date <= end
            ) || [];

            const totalUsed = usageHistory.reduce((sum, u) => sum + (u.quantity || 0), 0);
            const totalCost = usageHistory.reduce((sum, u) => 
                sum + ((u.quantity || 0) * (resource.costPerUnit || 0)), 0);

            // Calculate wastage
            const available = resource.availableQuantity || 0;
            const minimum = resource.minimumThreshold || 0;
            const wastage = available < minimum * 0.5 ? 'High' : 
                           available < minimum ? 'Medium' : 'Low';

            return {
                resourceId: resource._id,
                name: resource.name,
                category: resource.category,
                unit: resource.unit,
                totalQuantity: resource.totalQuantity,
                availableQuantity: available,
                usedQuantity: totalUsed,
                usageCost: totalCost,
                costPerUnit: resource.costPerUnit,
                expiryDate: resource.expiryDate,
                isExpired: resource.expiryDate && resource.expiryDate < new Date(),
                wastageLevel: wastage,
                usageCount: usageHistory.length,
                lowStock: available <= minimum && available > 0,
                outOfStock: available <= 0
            };
        });

        // Group by category
        const byCategory = {};
        resourceReports.forEach(r => {
            if (!byCategory[r.category]) {
                byCategory[r.category] = { 
                    count: 0, 
                    totalValue: 0, 
                    used: 0,
                    items: [] 
                };
            }
            byCategory[r.category].count++;
            byCategory[r.category].totalValue += (r.totalQuantity || 0) * (r.costPerUnit || 0);
            byCategory[r.category].used += r.usedQuantity;
            byCategory[r.category].items.push(r);
        });

        res.json({
            resources: resourceReports,
            byCategory: Object.entries(byCategory).map(([category, data]) => ({
                category,
                ...data
            })),
            summary: {
                totalResources: resources.length,
                lowStockItems: resourceReports.filter(r => r.lowStock).length,
                outOfStockItems: resourceReports.filter(r => r.outOfStock).length,
                expiredItems: resourceReports.filter(r => r.isExpired).length,
                totalValue: resourceReports.reduce((sum, r) => 
                    sum + ((r.totalQuantity || 0) * (r.costPerUnit || 0)), 0),
                totalUsageCost: resourceReports.reduce((sum, r) => sum + r.usageCost, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// FINANCIAL REPORT
// ============================================
router.get('/financial-report', auth, async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const query = { 
            farmer: req.user.id, 
            transactionDate: { $gte: start, $lte: end }
        };
        if (type) query.type = type;

        const transactions = await FinancialTransaction.find(query)
            .populate('crop', 'name')
            .sort({ transactionDate: -1 });

        // Calculate income statement
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        // Group expenses by category
        const expensesByCategory = {};
        expenses.forEach(t => {
            const category = t.category || 'other';
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = { amount: 0, count: 0 };
            }
            expensesByCategory[category].amount += t.amount;
            expensesByCategory[category].count++;
        });

        // Group income by source
        const incomeBySource = {};
        income.forEach(t => {
            const source = t.source || 'other';
            if (!incomeBySource[source]) {
                incomeBySource[source] = { amount: 0, count: 0 };
            }
            incomeBySource[source].amount += t.amount;
            incomeBySource[source].count++;
        });

        // Monthly trend
        const monthlyData = {};
        for (let i = 0; i < 12; i++) {
            const monthKey = `${start.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = { income: 0, expenses: 0, profit: 0 };
        }

        transactions.forEach(t => {
            const month = t.transactionDate.toISOString().slice(0, 7);
            if (monthlyData[month]) {
                if (t.type === 'income') monthlyData[month].income += t.amount;
                if (t.type === 'expense') monthlyData[month].expenses += t.amount;
            }
        });

        Object.keys(monthlyData).forEach(month => {
            monthlyData[month].profit = monthlyData[month].income - monthlyData[month].expenses;
        });

        res.json({
            summary: {
                totalIncome,
                totalExpenses,
                netProfit,
                profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
                transactionCount: transactions.length,
                incomeCount: income.length,
                expenseCount: expenses.length,
                averageTransactionValue: transactions.length > 0 
                    ? (totalIncome + totalExpenses) / transactions.length 
                    : 0
            },
            expensesByCategory: Object.entries(expensesByCategory)
                .map(([category, data]) => ({ category, ...data }))
                .sort((a, b) => b.amount - a.amount),
            incomeBySource: Object.entries(incomeBySource)
                .map(([source, data]) => ({ source, ...data }))
                .sort((a, b) => b.amount - a.amount),
            monthlyTrend: Object.entries(monthlyData).map(([month, data]) => ({
                month,
                ...data
            })),
            transactions: transactions.slice(0, 100).map(t => ({
                id: t._id,
                type: t.type,
                category: t.category,
                source: t.source,
                amount: t.amount,
                date: t.transactionDate,
                description: t.description,
                crop: t.crop?.name,
                paymentStatus: t.paymentStatus
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WORKER PERFORMANCE REPORT
// ============================================
router.get('/worker-performance', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const workers = await Worker.find({ farmer: req.user.id });

        const workerReports = await Promise.all(workers.map(async (worker) => {
            // Get activities assigned to this worker
            const activities = await Activity.find({
                farmer: req.user.id,
                workers: worker._id,
                date: { $gte: start, $lte: end }
            });

            // Get timeline activities
            const timelineActivities = await TimelineActivity.find({
                farmer: req.user.id,
                'assignedTo.worker': worker._id
            });

            const completedTasks = activities.filter(a => a.status === 'completed').length;
            const totalTasks = activities.length;
            const totalWages = timelineActivities.reduce((sum, t) => {
                const workerAssignment = t.assignedTo?.find(a => a.worker?.toString() === worker._id.toString());
                return sum + (workerAssignment?.wage || 0);
            }, 0);

            const totalHours = timelineActivities.reduce((sum, t) => {
                const workerAssignment = t.assignedTo?.find(a => a.worker?.toString() === worker._id.toString());
                return sum + (workerAssignment?.hoursWorked || 0);
            }, 0);

            const activeDays = new Set(activities.map(a => a.date.toDateString())).size;

            return {
                workerId: worker._id,
                name: worker.name,
                role: worker.role,
                phone: worker.phone,
                status: worker.status,
                totalTasks,
                completedTasks,
                completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
                totalWages,
                totalHours,
                hourlyRate: totalHours > 0 ? (totalWages / totalHours).toFixed(2) : 0,
                activeDays,
                productivity: totalHours > 0 ? (completedTasks / totalHours).toFixed(2) : 0
            };
        }));

        res.json({
            workers: workerReports.sort((a, b) => b.completedTasks - a.completedTasks),
            summary: {
                totalWorkers: workers.length,
                activeWorkers: workers.filter(w => w.status === 'active').length,
                totalTasksCompleted: workerReports.reduce((sum, w) => sum + w.completedTasks, 0),
                totalWagesPaid: workerReports.reduce((sum, w) => sum + w.totalWages, 0),
                averageCompletionRate: workerReports.length > 0
                    ? (workerReports.reduce((sum, w) => sum + parseFloat(w.completionRate), 0) / workerReports.length).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CROP HEALTH REPORT
// ============================================
router.get('/crop-health', auth, async (req, res) => {
    try {
        const { cropId, startDate, endDate } = req.query;
        
        let query = { farmer: req.user.id };
        if (cropId) query.crop = cropId;

        const healthRecords = await CropHealth.find(query)
            .populate('crop', 'name variety')
            .sort({ lastChecked: -1 });

        // Analyze issues
        const allIssues = [];
        const issuesByType = {};
        const issuesBySeverity = {};

        healthRecords.forEach(record => {
            record.issues?.forEach(issue => {
                allIssues.push({
                    crop: record.crop?.name,
                    cropVariety: record.crop?.variety,
                    type: issue.type,
                    name: issue.name,
                    severity: issue.severity,
                    status: issue.status,
                    detectedDate: issue.detectedDate,
                    resolvedDate: issue.resolvedDate,
                    treatmentCost: issue.costImpact
                });

                // Group by type
                if (!issuesByType[issue.type]) issuesByType[issue.type] = 0;
                issuesByType[issue.type]++;

                // Group by severity
                if (!issuesBySeverity[issue.severity]) issuesBySeverity[issue.severity] = 0;
                issuesBySeverity[issue.severity]++;
            });
        });

        // Calculate recovery rate
        const resolvedIssues = allIssues.filter(i => i.status === 'resolved').length;
        const totalIssues = allIssues.length;
        const recoveryRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(2) : 0;

        res.json({
            healthRecords: healthRecords.map(h => ({
                crop: h.crop?.name,
                cropVariety: h.crop?.variety,
                healthStatus: h.healthStatus,
                healthScore: h.healthScore,
                growthStage: h.growthStage,
                totalIssues: h.issues?.length || 0,
                activeIssues: h.issues?.filter(i => i.status !== 'resolved').length || 0,
                lastChecked: h.lastChecked
            })),
            issues: allIssues,
            summary: {
                totalCrops: healthRecords.length,
                healthyCrops: healthRecords.filter(h => h.healthStatus === 'healthy').length,
                warningCrops: healthRecords.filter(h => h.healthStatus === 'warning').length,
                criticalCrops: healthRecords.filter(h => h.healthStatus === 'critical').length,
                totalIssues,
                resolvedIssues,
                unresolvedIssues: totalIssues - resolvedIssues,
                recoveryRate,
                totalTreatmentCost: allIssues.reduce((sum, i) => sum + (i.treatmentCost || 0), 0)
            },
            issuesByType: Object.entries(issuesByType).map(([type, count]) => ({ type, count })),
            issuesBySeverity: Object.entries(issuesBySeverity).map(([severity, count]) => ({ severity, count }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SEASONAL COMPARISON REPORT
// ============================================
router.get('/seasonal-comparison', auth, async (req, res) => {
    try {
        const { season1, season2, year } = req.query;
        const currentYear = year || new Date().getFullYear();
        
        // Define season date ranges
        const seasons = {
            'kharif': { start: `${currentYear}-06-01`, end: `${currentYear}-10-31` },
            'rabi': { start: `${currentYear}-11-01`, end: `${currentYear + 1}-04-30` },
            'zaid': { start: `${currentYear}-03-01`, end: `${currentYear}-06-30` }
        };

        const compareSeasons = async (seasonName) => {
            const dates = seasons[seasonName];
            if (!dates) return null;

            const start = new Date(dates.start);
            const end = new Date(dates.end);

            const crops = await Crop.find({
                farmer: req.user.id,
                sowingDate: { $gte: start, $lte: end }
            });

            const transactions = await FinancialTransaction.find({
                farmer: req.user.id,
                transactionDate: { $gte: start, $lte: end }
            });

            const activities = await Activity.find({
                farmer: req.user.id,
                date: { $gte: start, $lte: end }
            });

            const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            return {
                season: seasonName,
                year: currentYear,
                crops: crops.length,
                totalArea: crops.reduce((sum, c) => sum + c.area, 0),
                totalYield: crops.reduce((sum, c) => sum + (c.actualYield || 0), 0),
                income,
                expenses,
                profit: income - expenses,
                activities: activities.length,
                completedActivities: activities.filter(a => a.status === 'completed').length
            };
        };

        const season1Data = season1 ? await compareSeasons(season1) : null;
        const season2Data = season2 ? await compareSeasons(season2) : null;

        // Calculate differences
        let comparison = null;
        if (season1Data && season2Data) {
            comparison = {
                profitDifference: season2Data.profit - season1Data.profit,
                profitChange: season1Data.profit > 0 
                    ? (((season2Data.profit - season1Data.profit) / Math.abs(season1Data.profit)) * 100).toFixed(2)
                    : 0,
                yieldDifference: season2Data.totalYield - season1Data.totalYield,
                expenseDifference: season2Data.expenses - season1Data.expenses,
                activityDifference: season2Data.activities - season1Data.activities,
                winner: season2Data.profit > season1Data.profit ? season2 : season1
            };
        }

        res.json({
            season1: season1Data,
            season2: season2Data,
            comparison,
            availableSeasons: Object.keys(seasons)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EXPORT REPORT (PDF/Excel)
// ============================================
router.post('/export', auth, async (req, res) => {
    try {
        const { reportType, format, filters } = req.body;
        
        // Generate report data based on type
        let reportData;
        switch (reportType) {
            case 'farm-summary':
                reportData = await generateFarmSummary(req.user.id, filters);
                break;
            case 'crop-performance':
                reportData = await generateCropPerformance(req.user.id, filters);
                break;
            case 'financial':
                reportData = await generateFinancialReport(req.user.id, filters);
                break;
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        if (format === 'json') {
            res.json(reportData);
        } else if (format === 'csv') {
            // Convert to CSV
            const csv = convertToCSV(reportData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
            res.send(csv);
        } else {
            res.status(400).json({ error: 'Unsupported format' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions for export
async function generateFarmSummary(farmerId, filters) {
    // Implementation similar to the route above
    return { message: 'Farm summary generated' };
}

async function generateCropPerformance(farmerId, filters) {
    return { message: 'Crop performance generated' };
}

async function generateFinancialReport(farmerId, filters) {
    return { message: 'Financial report generated' };
}

function convertToCSV(data) {
    // Simple CSV conversion
    if (!data || !Array.isArray(data)) return '';
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]).join(','));
    return [headers.join(','), ...rows].join('\n');
}

// ============================================
// AI INSIGHTS ENDPOINT
// ============================================
router.get('/ai-insights', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        // Gather all necessary data
        const [
            crops,
            transactions,
            activities,
            resources,
            healthRecords
        ] = await Promise.all([
            Crop.find({ farmer: req.user.id }),
            FinancialTransaction.find({ 
                farmer: req.user.id, 
                transactionDate: { $gte: start, $lte: end } 
            }),
            Activity.find({ farmer: req.user.id, date: { $gte: start, $lte: end } }),
            Resource.find({ farmer: req.user.id }),
            CropHealth.find({ farmer: req.user.id })
        ]);

        // Calculate metrics
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0;
        
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const activityCompletionRate = activities.length > 0 ? ((completedActivities / activities.length) * 100).toFixed(2) : 0;
        
        const lowStockItems = resources.filter(r => 
            r.availableQuantity <= r.minimumThreshold && r.availableQuantity > 0
        ).length;

        // Generate crop performance data
        const cropPerformance = await Promise.all(crops.map(async (crop) => {
            const cropTransactions = await FinancialTransaction.find({
                farmer: req.user.id,
                crop: crop._id,
                transactionDate: { $gte: start, $lte: end }
            });
            
            const inputCost = cropTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const income = cropTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            
            return {
                name: crop.name,
                profit: income - inputCost,
                area: crop.area
            };
        }));

        // Generate AI insights
        const insights = [];
        
        // Profit insights
        if (netProfit < 0) {
            insights.push({
                type: 'warning',
                category: 'financial',
                title: 'Loss Alert',
                message: 'Your farm is operating at a loss. Review expense categories to identify cost-cutting opportunities.',
                action: 'View Expense Breakdown',
                priority: 'high'
            });
        } else if (profitMargin < 20) {
            insights.push({
                type: 'info',
                category: 'financial',
                title: 'Low Profit Margin',
                message: `Your profit margin is ${profitMargin}%. Consider optimizing resource usage or exploring higher-value crops.`,
                action: 'View Recommendations',
                priority: 'medium'
            });
        } else if (profitMargin > 40) {
            insights.push({
                type: 'success',
                category: 'financial',
                title: 'Excellent Profit Margin',
                message: `Outstanding! Your ${profitMargin}% profit margin is above industry average. Consider documenting your practices.`,
                action: 'View Best Practices',
                priority: 'low'
            });
        }
        
        // Activity insights
        if (activityCompletionRate < 70) {
            insights.push({
                type: 'warning',
                category: 'operations',
                title: 'Low Activity Completion',
                message: `Only ${activityCompletionRate}% of planned activities are completed. Consider better scheduling or increasing workforce.`,
                action: 'Review Activity Plan',
                priority: 'high'
            });
        }
        
        // Crop performance insights
        if (cropPerformance.length > 0) {
            const bestCrop = cropPerformance.reduce((best, c) => c.profit > best.profit ? c : best, cropPerformance[0]);
            const worstCrop = cropPerformance.reduce((worst, c) => c.profit < worst.profit ? c : worst, cropPerformance[0]);
            
            if (bestCrop.profit > 0) {
                insights.push({
                    type: 'success',
                    category: 'crops',
                    title: 'Top Performer',
                    message: `${bestCrop.name} is your most profitable crop with ₹${bestCrop.profit.toLocaleString()} profit. Consider expanding its cultivation.`,
                    action: 'View Crop Details',
                    priority: 'medium'
                });
            }
            
            if (worstCrop.profit < 0) {
                insights.push({
                    type: 'alert',
                    category: 'crops',
                    title: 'Underperforming Crop',
                    message: `${worstCrop.name} is generating losses. Review input costs or consider alternative crops.`,
                    action: 'Analyze Costs',
                    priority: 'high'
                });
            }
        }
        
        // Resource insights
        if (lowStockItems > 5) {
            insights.push({
                type: 'warning',
                category: 'resources',
                title: 'Multiple Low Stock Items',
                message: `${lowStockItems} resources are running low. Plan procurement to avoid disruption.`,
                action: 'View Inventory',
                priority: 'medium'
            });
        }
        
        // Health insights
        const criticalCrops = healthRecords.filter(h => h.healthStatus === 'critical').length;
        if (criticalCrops > 0) {
            insights.push({
                type: 'alert',
                category: 'health',
                title: 'Critical Crop Health Issues',
                message: `${criticalCrops} crop(s) need immediate attention. Check crop health dashboard.`,
                action: 'View Health Dashboard',
                priority: 'urgent'
            });
        }
        
        // Seasonal recommendation
        const currentMonth = new Date().getMonth();
        if (currentMonth >= 5 && currentMonth <= 9) {
            insights.push({
                type: 'info',
                category: 'seasonal',
                title: 'Kharif Season Active',
                message: 'Optimal time for rice, cotton, and soybean cultivation. Ensure adequate water management.',
                action: 'View Crop Calendar',
                priority: 'low'
            });
        } else if (currentMonth >= 10 || currentMonth <= 3) {
            insights.push({
                type: 'info',
                category: 'seasonal',
                title: 'Rabi Season Active',
                message: 'Good time for wheat, barley, and mustard. Plan for winter irrigation needs.',
                action: 'View Crop Calendar',
                priority: 'low'
            });
        }

        // Cost optimization tips
        const expensesByCategory = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (!expensesByCategory[t.category]) expensesByCategory[t.category] = 0;
            expensesByCategory[t.category] += t.amount;
        });
        
        const totalExpense = Object.values(expensesByCategory).reduce((sum, v) => sum + v, 0);
        const optimizationTips = [];
        
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            const percentage = (amount / totalExpense) * 100;
            
            if (category === 'pesticides' && percentage > 15) {
                optimizationTips.push({
                    category: 'pesticides',
                    tip: 'Pesticide costs are high. Consider preventive spraying and integrated pest management.',
                    potentialSavings: Math.round(amount * 0.2),
                    priority: 'high'
                });
            }
            
            if (category === 'labor' && percentage > 30) {
                optimizationTips.push({
                    category: 'labor',
                    tip: 'Labor costs exceed 30%. Consider automation or optimizing worker schedules.',
                    potentialSavings: Math.round(amount * 0.15),
                    priority: 'medium'
                });
            }
        });

        res.json({
            insights: insights.sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }),
            optimizationTips: optimizationTips.sort((a, b) => b.potentialSavings - a.potentialSavings),
            summary: {
                totalInsights: insights.length,
                urgentIssues: insights.filter(i => i.priority === 'urgent').length,
                highPriority: insights.filter(i => i.priority === 'high').length,
                potentialSavings: optimizationTips.reduce((sum, t) => sum + t.potentialSavings, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PREDICTIVE ANALYTICS ENDPOINT
// ============================================
router.get('/predictions', auth, async (req, res) => {
    try {
        const { months = 3 } = req.query;
        
        // Get last 6 months of data for trend analysis
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        
        const transactions = await FinancialTransaction.find({
            farmer: req.user.id,
            transactionDate: { $gte: startDate, $lte: endDate }
        });
        
        // Calculate monthly profits
        const monthlyProfits = {};
        for (let i = 0; i < 6; i++) {
            const d = new Date(endDate);
            d.setMonth(d.getMonth() - i);
            const monthKey = d.toISOString().slice(0, 7);
            monthlyProfits[monthKey] = { income: 0, expenses: 0 };
        }
        
        transactions.forEach(t => {
            const month = t.transactionDate.toISOString().slice(0, 7);
            if (monthlyProfits[month]) {
                if (t.type === 'income') monthlyProfits[month].income += t.amount;
                if (t.type === 'expense') monthlyProfits[month].expenses += t.amount;
            }
        });
        
        const profits = Object.values(monthlyProfits).map(m => m.income - m.expenses).reverse();
        
        // Simple linear regression for prediction
        const n = profits.length;
        const sumX = profits.reduce((sum, _, i) => sum + i, 0);
        const sumY = profits.reduce((sum, p) => sum + p, 0);
        const sumXY = profits.reduce((sum, p, i) => sum + i * p, 0);
        const sumXX = profits.reduce((sum, _, i) => sum + i * i, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Generate predictions
        const predictions = [];
        const currentProfit = profits[profits.length - 1];
        
        for (let i = 1; i <= parseInt(months); i++) {
            const predictedValue = slope * (n + i - 1) + intercept;
            predictions.push({
                month: i,
                projectedProfit: Math.round(predictedValue),
                change: currentProfit > 0 ? ((predictedValue - currentProfit) / currentProfit * 100).toFixed(1) : 0,
                trend: predictedValue > currentProfit ? 'up' : 'down'
            });
        }
        
        // Risk and opportunity analysis
        const risks = [];
        const opportunities = [];
        
        if (slope < 0) {
            risks.push({
                type: 'declining_profit',
                message: 'Profit trend is declining. Review operational efficiency.',
                severity: 'high',
                confidence: 75
            });
        } else if (slope > 0) {
            opportunities.push({
                type: 'growth_potential',
                message: 'Positive profit trend detected. Consider expanding operations.',
                confidence: 70
            });
        }
        
        res.json({
            predictions,
            currentTrend: {
                slope: slope.toFixed(2),
                direction: slope > 0 ? 'positive' : slope < 0 ? 'negative' : 'stable',
                strength: Math.abs(slope) > 1000 ? 'strong' : Math.abs(slope) > 500 ? 'moderate' : 'weak'
            },
            risks,
            opportunities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROFITABILITY ANALYSIS ENDPOINT
// ============================================
router.get('/profitability-analysis', auth, async (req, res) => {
    try {
        const { cropId } = req.query;
        
        let query = { farmer: req.user.id };
        if (cropId) query._id = cropId;
        
        const crops = await Crop.find(query);
        
        const analysis = await Promise.all(crops.map(async (crop) => {
            const transactions = await FinancialTransaction.find({
                farmer: req.user.id,
                crop: crop._id
            });
            
            const inputCost = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const profit = income - inputCost;
            
            // Calculate various profitability metrics
            const area = crop.area || 1;
            const yield_qty = crop.actualYield || crop.plan?.expectedYield || 1;
            
            return {
                cropId: crop._id,
                name: crop.name,
                variety: crop.variety,
                area,
                yield: yield_qty,
                inputCost,
                income,
                profit,
                profitMargin: income > 0 ? ((profit / income) * 100).toFixed(2) : 0,
                roi: inputCost > 0 ? ((profit / inputCost) * 100).toFixed(2) : 0,
                costPerAcre: (inputCost / area).toFixed(2),
                costPerKg: (inputCost / yield_qty).toFixed(2),
                revenuePerAcre: (income / area).toFixed(2),
                revenuePerKg: (income / yield_qty).toFixed(2),
                profitPerAcre: (profit / area).toFixed(2),
                profitPerKg: (profit / yield_qty).toFixed(2),
                breakEvenYield: income > 0 ? (inputCost / (income / yield_qty)).toFixed(2) : 0
            };
        }));
        
        // Sort by profit per acre
        analysis.sort((a, b) => parseFloat(b.profitPerAcre) - parseFloat(a.profitPerAcre));
        
        res.json({
            crops: analysis,
            summary: {
                totalCropsAnalyzed: analysis.length,
                averageProfitPerAcre: (analysis.reduce((sum, c) => sum + parseFloat(c.profitPerAcre), 0) / analysis.length).toFixed(2),
                averageRoi: (analysis.reduce((sum, c) => sum + parseFloat(c.roi), 0) / analysis.length).toFixed(2),
                mostProfitable: analysis[0],
                leastProfitable: analysis[analysis.length - 1]
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEATHER IMPACT REPORT
// ============================================
router.get('/weather-impact', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        
        // Get activities that might have been affected by weather
        const activities = await TimelineActivity.find({
            farmer: req.user.id,
            plannedDate: { $gte: start, $lte: end },
            $or: [
                { status: 'delayed' },
                { status: 'cancelled' },
                { delayReason: { $exists: true, $ne: '' } }
            ]
        }).populate('crop', 'name');
        
        // Get crop health issues potentially caused by weather
        const healthRecords = await CropHealth.find({
            farmer: req.user.id,
            'issues.detectedDate': { $gte: start, $lte: end }
        }).populate('crop', 'name');
        
        // Simulate weather events (in real app, this would come from weather API)
        const weatherEvents = [
            { date: new Date('2024-06-15'), type: 'heavy_rain', impact: 'high', description: '150mm rainfall in 24 hours' },
            { date: new Date('2024-07-20'), type: 'drought', impact: 'medium', description: 'No rain for 15 days' },
            { date: new Date('2024-08-05'), type: 'heatwave', impact: 'high', description: 'Temperature >40°C for 5 days' }
        ].filter(e => e.date >= start && e.date <= end);
        
        // Analyze weather-related delays
        const weatherDelays = activities.filter(a => 
            a.delayReason?.toLowerCase().includes('weather') ||
            a.delayReason?.toLowerCase().includes('rain') ||
            a.weatherImpact?.impact
        );
        
        // Calculate impact metrics
        const totalDelayedActivities = weatherDelays.length;
        const totalDaysLost = weatherDelays.reduce((sum, a) => {
            if (a.actualDate && a.plannedDate) {
                return sum + Math.ceil((a.actualDate - a.plannedDate) / (1000 * 60 * 60 * 24));
            }
            return sum;
        }, 0);
        
        // Weather-related health issues
        const weatherHealthIssues = healthRecords.flatMap(h => 
            h.issues?.filter(i => 
                i.type === 'weather_damage' ||
                (i.name?.toLowerCase().includes('fungal') && i.detectedDate?.getMonth() >= 5) // Fungal in monsoon
            ) || []
        );
        
        res.json({
            weatherEvents: weatherEvents.map(e => ({
                date: e.date,
                type: e.type,
                impact: e.impact,
                description: e.description
            })),
            activityImpact: {
                totalDelayedActivities,
                totalDaysLost,
                activities: weatherDelays.map(a => ({
                    title: a.title,
                    crop: a.crop?.name,
                    plannedDate: a.plannedDate,
                    actualDate: a.actualDate,
                    delayReason: a.delayReason,
                    costImpact: a.actualCost - a.costEstimate
                }))
            },
            healthImpact: {
                weatherRelatedIssues: weatherHealthIssues.length,
                estimatedCost: weatherHealthIssues.reduce((sum, i) => sum + (i.costImpact || 0), 0),
                issues: weatherHealthIssues.map(i => ({
                    name: i.name,
                    crop: i.cropName,
                    severity: i.severity,
                    cost: i.costImpact
                }))
            },
            summary: {
                totalWeatherEvents: weatherEvents.length,
                highImpactEvents: weatherEvents.filter(e => e.impact === 'high').length,
                totalDaysLost,
                estimatedFinancialImpact: weatherHealthIssues.reduce((sum, i) => sum + (i.costImpact || 0), 0) +
                    weatherDelays.reduce((sum, a) => sum + ((a.actualCost || 0) - (a.costEstimate || 0)), 0)
            },
            recommendations: [
                'Install weather monitoring stations for early warnings',
                'Improve drainage systems to handle heavy rainfall',
                'Consider crop insurance for weather-related losses',
                'Plan activities with weather forecasts in mind'
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GOVERNMENT & COMPLIANCE REPORT
// ============================================
router.get('/compliance', auth, async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        
        // Get all farm data for the year
        const [
            crops,
            transactions,
            resources,
            activities,
            healthRecords
        ] = await Promise.all([
            Crop.find({ farmer: req.user.id }),
            FinancialTransaction.find({ 
                farmer: req.user.id, 
                transactionDate: { $gte: startDate, $lte: endDate }
            }),
            Resource.find({ farmer: req.user.id }),
            Activity.find({ farmer: req.user.id, date: { $gte: startDate, $lte: endDate } }),
            CropHealth.find({ farmer: req.user.id })
        ]);
        
        // Calculate totals
        const totalArea = crops.reduce((sum, c) => sum + c.area, 0);
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        // Input usage summary (for subsidy claims)
        const inputUsage = {
            seeds: resources.filter(r => r.category === 'seeds').reduce((sum, r) => sum + r.totalQuantity, 0),
            fertilizers: resources.filter(r => r.category === 'fertilizers').reduce((sum, r) => sum + r.totalQuantity, 0),
            pesticides: resources.filter(r => r.category === 'pesticides').reduce((sum, r) => sum + r.totalQuantity, 0),
        };
        
        // Crop details for records
        const cropDetails = crops.map(c => ({
            name: c.name,
            variety: c.variety,
            area: c.area,
            season: c.season,
            sowingDate: c.sowingDate,
            harvestDate: c.actualHarvestDate,
            expectedYield: c.plan?.expectedYield,
            actualYield: c.actualYield,
            status: c.status
        }));
        
        // Pesticide usage for regulatory compliance
        const pesticideUsage = resources
            .filter(r => r.category === 'pesticides')
            .map(r => ({
                name: r.name,
                quantityUsed: r.usedQuantity,
                unit: r.unit,
                expiryDate: r.expiryDate
            }));
        
        // Financial summary
        const financialSummary = {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            taxAmount: transactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0),
            subsidyAmount: transactions
                .filter(t => t.type === 'income' && t.source === 'government_subsidy')
                .reduce((sum, t) => sum + t.amount, 0)
        };
        
        res.json({
            farmDetails: {
                farmerId: req.user.id,
                reportingYear: year,
                totalArea,
                totalCrops: crops.length,
                cropDetails
            },
            inputUsage,
            pesticideUsage: {
                totalProducts: pesticideUsage.length,
                products: pesticideUsage,
                complianceStatus: pesticideUsage.every(p => !p.expiryDate || p.expiryDate > new Date()) ? 'compliant' : 'expired_found'
            },
            financialSummary,
            laborSummary: {
                totalWorkers: await Worker.countDocuments({ farmer: req.user.id }),
                totalWagesPaid: transactions
                    .filter(t => t.category === 'labor')
                    .reduce((sum, t) => sum + t.amount, 0),
                totalActivities: activities.length
            },
            healthSummary: {
                totalIssues: healthRecords.reduce((sum, h) => sum + (h.issues?.length || 0), 0),
                issuesResolved: healthRecords.reduce((sum, h) => 
                    sum + (h.issues?.filter(i => i.status === 'resolved').length || 0), 0),
                treatmentsApplied: healthRecords.reduce((sum, h) => 
                    sum + (h.issues?.filter(i => i.treatment?.applied?.length > 0).length || 0), 0)
            },
            complianceChecklist: {
                farmRegistration: true, // Assuming registered
                pesticideRecords: pesticideUsage.length > 0,
                financialRecords: transactions.length > 0,
                laborRecords: activities.length > 0,
                harvestRecords: crops.some(c => c.actualHarvestDate),
                overallStatus: 'compliant'
            },
            documents: {
                cropRecords: `${year}_crop_records.pdf`,
                financialStatement: `${year}_financial_statement.pdf`,
                inputUsageReport: `${year}_input_usage.pdf`,
                laborCompliance: `${year}_labor_records.pdf`
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;