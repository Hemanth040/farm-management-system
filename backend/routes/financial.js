const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { FinancialTransaction, Budget } = require('../models/Financial');
const { Crop, TimelineActivity, Resource } = require('../models');

// Get all transactions with filters
router.get('/transactions', auth, async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            type,
            category,
            paymentStatus,
            crop,
            search,
            page = 1,
            limit = 50
        } = req.query;
        
        let query = { farmer: req.user.id };
        
        // Date filter
        if (startDate || endDate) {
            query.transactionDate = {};
            if (startDate) query.transactionDate.$gte = new Date(startDate);
            if (endDate) query.transactionDate.$lte = new Date(endDate);
        }
        
        // Other filters
        if (type) query.type = type;
        if (category) query.category = category;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (crop) query.crop = crop;
        
        // Search filter
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { 'party.name': { $regex: search, $options: 'i' } },
                { cropName: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        
        const [transactions, total] = await Promise.all([
            FinancialTransaction.find(query)
                .populate('crop', 'name variety')
                .populate('activity', 'title')
                .populate('resource', 'name')
                .sort({ transactionDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            FinancialTransaction.countDocuments(query)
        ]);
        
        // Calculate summary
        const summary = await FinancialTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const summaryData = summary[0] || { totalIncome: 0, totalExpense: 0, count: 0 };
        const netProfit = summaryData.totalIncome - summaryData.totalExpense;
        
        res.json({
            transactions,
            summary: {
                ...summaryData,
                netProfit,
                profitMargin: summaryData.totalIncome > 0 ? (netProfit / summaryData.totalIncome) * 100 : 0
            },
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction by ID
router.get('/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await FinancialTransaction.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('crop', 'name variety area')
        .populate('activity', 'title type')
        .populate('resource', 'name category')
        .populate('worker', 'name');
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new transaction
router.post('/transactions', auth, async (req, res) => {
    try {
        const transactionData = {
            ...req.body,
            farmer: req.user.id,
            createdBy: req.user.id,
            updatedBy: req.user.id
        };
        
        // Auto-calculate total amount
        if (!transactionData.totalAmount) {
            transactionData.totalAmount = transactionData.amount + (transactionData.taxAmount || 0);
        }
        
        // Auto-populate crop name if crop ID is provided
        if (transactionData.crop) {
            const crop = await Crop.findById(transactionData.crop);
            if (crop) {
                transactionData.cropName = crop.name;
                transactionData.cropVariety = crop.variety;
            }
        }
        
        const transaction = new FinancialTransaction(transactionData);
        await transaction.save();
        
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update transaction
router.put('/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await FinancialTransaction.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            {
                ...req.body,
                updatedBy: req.user.id,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete transaction
router.delete('/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await FinancialTransaction.findOneAndDelete({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark payment as paid
router.post('/transactions/:id/mark-paid', auth, async (req, res) => {
    try {
        const { paymentDate, paymentMethod, paymentReference } = req.body;
        
        const transaction = await FinancialTransaction.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            {
                paymentStatus: 'paid',
                paymentDate: paymentDate || new Date(),
                paymentMethod: paymentMethod || 'cash',
                paymentReference,
                updatedBy: req.user.id,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get profit/loss summary
router.get('/profit-loss', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        
        const result = await FinancialTransaction.getProfitLoss(req.user.id, start, end);
        
        // Get crop-wise profit
        const cropWiseProfit = await FinancialTransaction.getCropWiseProfit(req.user.id);
        
        // Get monthly trends
        const monthlyTrends = await FinancialTransaction.getMonthlyTrends(req.user.id, start.getFullYear());
        
        res.json({
            period: { start, end },
            summary: result,
            cropWiseProfit,
            monthlyTrends
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get pending payments
router.get('/pending-payments', auth, async (req, res) => {
    try {
        const pendingPayments = await FinancialTransaction.getPendingPayments(req.user.id);
        
        const summary = pendingPayments.reduce((acc, payment) => {
            if (payment.type === 'income') {
                acc.pendingIncome += payment.amount;
            } else if (payment.type === 'expense') {
                acc.pendingExpenses += payment.amount;
            }
            return acc;
        }, { pendingIncome: 0, pendingExpenses: 0 });
        
        res.json({
            pendingPayments,
            summary,
            totalPending: pendingPayments.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get expense breakdown by category
router.get('/expense-breakdown', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let matchQuery = {
            farmer: req.user.id,
            type: 'expense'
        };
        
        if (startDate || endDate) {
            matchQuery.transactionDate = {};
            if (startDate) matchQuery.transactionDate.$gte = new Date(startDate);
            if (endDate) matchQuery.transactionDate.$lte = new Date(endDate);
        }
        
        const breakdown = await FinancialTransaction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    averageAmount: { $avg: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);
        
        const totalExpense = breakdown.reduce((sum, item) => sum + item.totalAmount, 0);
        
        // Add percentage to each category
        const breakdownWithPercent = breakdown.map(item => ({
            ...item,
            percentage: totalExpense > 0 ? (item.totalAmount / totalExpense) * 100 : 0
        }));
        
        res.json({
            breakdown: breakdownWithPercent,
            totalExpense,
            categoryCount: breakdown.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get income breakdown by source
router.get('/income-breakdown', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let matchQuery = {
            farmer: req.user.id,
            type: 'income'
        };
        
        if (startDate || endDate) {
            matchQuery.transactionDate = {};
            if (startDate) matchQuery.transactionDate.$gte = new Date(startDate);
            if (endDate) matchQuery.transactionDate.$lte = new Date(endDate);
        }
        
        const breakdown = await FinancialTransaction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$source',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    averageAmount: { $avg: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);
        
        const totalIncome = breakdown.reduce((sum, item) => sum + item.totalAmount, 0);
        
        // Add percentage to each source
        const breakdownWithPercent = breakdown.map(item => ({
            ...item,
            percentage: totalIncome > 0 ? (item.totalAmount / totalIncome) * 100 : 0
        }));
        
        res.json({
            breakdown: breakdownWithPercent,
            totalIncome,
            sourceCount: breakdown.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate financial report
router.get('/report', auth, async (req, res) => {
    try {
        const { startDate, endDate, reportType } = req.query;
        
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        
        const [profitLoss, expenseBreakdown, incomeBreakdown, pendingPayments, cropWiseProfit] = await Promise.all([
            FinancialTransaction.getProfitLoss(req.user.id, start, end),
            FinancialTransaction.aggregate([
                {
                    $match: {
                        farmer: req.user.id,
                        type: 'expense',
                        transactionDate: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]),
            FinancialTransaction.aggregate([
                {
                    $match: {
                        farmer: req.user.id,
                        type: 'income',
                        transactionDate: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: '$source',
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]),
            FinancialTransaction.getPendingPayments(req.user.id),
            FinancialTransaction.getCropWiseProfit(req.user.id)
        ]);
        
        const report = {
            period: { start, end },
            profitLoss,
            expenseBreakdown,
            incomeBreakdown,
            pendingPayments: {
                items: pendingPayments,
                total: pendingPayments.length
            },
            cropWiseProfit,
            generatedAt: new Date()
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export financial data to CSV
router.get('/export/csv', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = { farmer: req.user.id };
        
        if (startDate || endDate) {
            query.transactionDate = {};
            if (startDate) query.transactionDate.$gte = new Date(startDate);
            if (endDate) query.transactionDate.$lte = new Date(endDate);
        }
        
        const transactions = await FinancialTransaction.find(query)
            .sort({ transactionDate: 1 })
            .lean();
        
        // Create CSV header
        let csv = 'Date,Type,Category/Source,Description,Amount,Payment Status,Crop,Party\n';
        
        // Add data rows
        transactions.forEach(transaction => {
            const row = [
                new Date(transaction.transactionDate).toISOString().split('T')[0],
                transaction.type,
                transaction.type === 'income' ? transaction.source : transaction.category,
                `"${transaction.description}"`, // Corrected: escaped quote within template literal
                transaction.amount,
                transaction.paymentStatus,
                transaction.cropName || '',
                transaction.party?.name || ''
            ].join(',');
            
            csv += row + '\n';
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=financial-report.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Budget Management
router.get('/budgets', auth, async (req, res) => {
    try {
        const budgets = await Budget.find({ farmer: req.user.id })
            .sort({ startDate: -1 })
            .lean();
        
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/budgets', auth, async (req, res) => {
    try {
        const budgetData = {
            ...req.body,
            farmer: req.user.id
        };
        
        const budget = new Budget(budgetData);
        await budget.save();
        
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/budgets/:id', auth, async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }
        
        // Recalculate variances
        budget.calculateVariances();
        await budget.save();
        
        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get budget vs actual comparison
router.get('/budgets/:id/analysis', auth, async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }
        
        // Get actual transactions for this period
        const actualTransactions = await FinancialTransaction.find({
            farmer: req.user.id,
            transactionDate: { $gte: budget.startDate, $lte: budget.endDate }
        });
        
        // Update budget with actual amounts
        budget.categories.forEach(category => {
            const categoryTransactions = actualTransactions.filter(
                t => t.type === 'expense' && t.category === category.category
            );
            category.actualAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        });
        
        budget.cropBudgets.forEach(cropBudget => {
            if (cropBudget.crop) {
                const cropTransactions = actualTransactions.filter(
                    t => t.crop && t.crop.toString() === cropBudget.crop.toString()
                );
                
                cropBudget.actualCost = cropTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                cropBudget.actualRevenue = cropTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
            }
        });
        
        // Recalculate variances
        budget.calculateVariances();
        await budget.save();
        
        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get financial insights
router.get('/insights', auth, async (req, res) => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const [currentYear, previousYear] = await Promise.all([
            FinancialTransaction.aggregate([
                {
                    $match: {
                        farmer: req.user.id,
                        transactionDate: { $gte: new Date(new Date().getFullYear(), 0, 1) }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: '$amount' }
                    }
                }
            ]),
            FinancialTransaction.aggregate([
                {
                    $match: {
                        farmer: req.user.id,
                        transactionDate: {
                            $gte: new Date(new Date().getFullYear() - 1, 0, 1),
                            $lt: new Date(new Date().getFullYear(), 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: '$amount' }
                    }
                }
            ])
        ]);
        
        // Calculate insights
        const insights = [];
        
        // Compare fertilizer costs
        const currentFertilizer = currentYear.find(c => c._id === 'fertilizers')?.total || 0;
        const prevFertilizer = previousYear.find(c => c._id === 'fertilizers')?.total || 0;
        
        if (currentFertilizer > 0 && prevFertilizer > 0) {
            const change = ((currentFertilizer - prevFertilizer) / prevFertilizer) * 100;
            if (Math.abs(change) > 15) {
                insights.push({
                    type: change > 0 ? 'warning' : 'info',
                    message: `Fertilizer cost ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last season`,
                    severity: Math.abs(change) > 30 ? 'high' : 'medium'
                });
            }
        }
        
        // Check labor cost percentage
        const currentLabor = currentYear.find(c => c._id === 'labor')?.total || 0;
        const totalCurrent = currentYear.reduce((sum, c) => sum + c.total, 0);
        
        if (currentLabor > 0 && totalCurrent > 0) {
            const laborPercentage = (currentLabor / totalCurrent) * 100;
            if (laborPercentage > 40) {
                insights.push({
                    type: 'warning',
                    message: `Labor cost is high at ${laborPercentage.toFixed(1)}% of total expenses`,
                    severity: 'medium'
                });
            }
        }
        
        res.json({ insights });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
