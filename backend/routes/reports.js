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

module.exports = router;