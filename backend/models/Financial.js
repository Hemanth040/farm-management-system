const mongoose = require('mongoose');

// Transaction Types
const TRANSACTION_TYPES = ['income', 'expense', 'loan', 'investment', 'subsidy', 'repayment'];

// Expense Categories
const EXPENSE_CATEGORIES = [
    'seeds', 'fertilizers', 'pesticides', 'labor', 'equipment_fuel', 
    'equipment_repair', 'irrigation', 'electricity', 'transport', 
    'rent', 'storage', 'packaging', 'other'
];

// Income Sources
const INCOME_SOURCES = [
    'crop_sale', 'livestock_sale', 'dairy', 'poultry', 'government_subsidy',
    'loan_disbursement', 'other'
];

// Payment Methods
const PAYMENT_METHODS = ['cash', 'upi', 'bank_transfer', 'cheque', 'credit'];

// Payment Status
const PAYMENT_STATUS = ['pending', 'partial', 'paid', 'overdue', 'cancelled'];

const financialTransactionSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Transaction Information
    type: {
        type: String,
        enum: TRANSACTION_TYPES,
        required: true
    },
    category: {
        type: String,
        enum: EXPENSE_CATEGORIES,
        required: function() { return this.type === 'expense'; }
    },
    source: {
        type: String,
        enum: INCOME_SOURCES,
        required: function() { return this.type === 'income'; }
    },
    
    // Financial Details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Date Information
    transactionDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: Date,
    paymentDate: Date,
    
    // Description
    description: {
        type: String,
        required: true
    },
    notes: String,
    
    // Payment Information
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHODS,
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUS,
        default: 'pending'
    },
    paymentReference: String,
    
    // Buyer/Seller/Vendor Information
    party: {
        name: String,
        type: {
            type: String,
            enum: ['buyer', 'seller', 'worker', 'vendor', 'bank', 'government', 'other']
        },
        contact: String,
        gstin: String
    },
    
    // Associations
    crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    },
    cropName: String,
    cropVariety: String,
    
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimelineActivity'
    },
    activityTitle: String,
    
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    },
    resourceName: String,
    
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    },
    workerName: String,
    
    // Loan Specific Fields
    loan: {
        principal: Number,
        interestRate: Number,
        tenure: Number, // in months
        lender: String,
        loanType: String,
        emiAmount: Number,
        remainingBalance: Number,
        nextEmiDate: Date
    },
    
    // Subsidy Specific Fields
    subsidy: {
        schemeName: String,
        schemeCode: String,
        appliedDate: Date,
        approvedDate: Date,
        disbursedDate: Date,
        applicationNumber: String,
        status: String
    },
    
    // Budget Information
    budget: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
    },
    isPlanned: {
        type: Boolean,
        default: false
    },
    plannedAmount: Number,
    variance: Number, // actual - planned
    
    // Attachments
    attachments: [{
        filename: String,
        url: String,
        type: String, // invoice, receipt, bill, other
        uploadedAt: Date
    }],
    
    // Tax & Compliance
    gstAmount: Number,
    tdsAmount: Number,
    isTaxable: Boolean,
    hsnCode: String,
    
    // Audit Trail
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Reconciliation
    isReconciled: {
        type: Boolean,
        default: false
    },
    reconciledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reconciledAt: Date,
    
    // Tags & Metadata
    tags: [String],
    isRecurring: Boolean,
    recurrencePattern: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    name: {
        type: String,
        required: true
    },
    description: String,
    
    // Budget Period
    periodType: {
        type: String,
        enum: ['monthly', 'quarterly', 'seasonal', 'annual', 'custom'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    
    // Budget Categories
    categories: [{
        category: {
            type: String,
            enum: EXPENSE_CATEGORIES
        },
        plannedAmount: {
            type: Number,
            required: true,
            min: 0
        },
        actualAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        variance: {
            type: Number,
            default: 0
        }
    }],
    
    // Crop-wise Budget
    cropBudgets: [{
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop'
        },
        cropName: String,
        plannedCost: Number,
        actualCost: Number,
        plannedRevenue: Number,
        actualRevenue: Number
    }],
    
    // Overall Budget
    totalPlannedExpense: {
        type: Number,
        required: true,
        min: 0
    },
    totalActualExpense: {
        type: Number,
        default: 0,
        min: 0
    },
    
    totalPlannedRevenue: {
        type: Number,
        required: true,
        min: 0
    },
    totalActualRevenue: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    
    // Alerts
    alerts: [{
        type: {
            type: String,
            enum: ['overspending', 'underspending', 'revenue_shortfall', 'profit_target']
        },
        message: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        triggeredAt: Date,
        resolved: Boolean
    }],
    
    // Performance Metrics
    variancePercentage: Number,
    utilizationRate: Number,
    roi: Number,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware for calculations
financialTransactionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Calculate total amount
    if (!this.totalAmount) {
        this.totalAmount = this.amount + (this.taxAmount || 0);
    }
    
    // Calculate variance if planned amount exists
    if (this.plannedAmount) {
        this.variance = this.amount - this.plannedAmount;
    }
    
    // Auto-update payment status based on dates
    if (this.dueDate && this.paymentStatus === 'pending') {
        const today = new Date();
        if (today > this.dueDate) {
            this.paymentStatus = 'overdue';
        }
    }
    
    next();
});

// Static methods for financial calculations
financialTransactionSchema.statics.getProfitLoss = async function(farmerId, startDate, endDate) {
    const matchQuery = {
        farmer: farmerId,
        transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };
    
    const [income, expenses] = await Promise.all([
        this.aggregate([
            { $match: { ...matchQuery, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        this.aggregate([
            { $match: { ...matchQuery, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ]);
    
    const totalIncome = income[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const netProfit = totalIncome - totalExpenses;
    
    return {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
    };
};

financialTransactionSchema.statics.getCropWiseProfit = async function(farmerId, season) {
    const transactions = await this.aggregate([
        {
            $match: {
                farmer: mongoose.Types.ObjectId(farmerId),
                crop: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: '$crop',
                cropName: { $first: '$cropName' },
                totalIncome: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                    }
                },
                totalExpense: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                    }
                }
            }
        },
        {
            $project: {
                cropName: 1,
                totalIncome: 1,
                totalExpense: 1,
                netProfit: { $subtract: ['$totalIncome', '$totalExpense'] },
                profitMargin: {
                    $cond: [
                        { $gt: ['$totalIncome', 0] },
                        { $multiply: [{ $divide: [{ $subtract: ['$totalIncome', '$totalExpense'] }, '$totalIncome'] }, 100] },
                        0
                    ]
                }
            }
        },
        { $sort: { netProfit: -1 } }
    ]);
    
    return transactions;
};

financialTransactionSchema.statics.getPendingPayments = async function(farmerId) {
    return this.find({
        farmer: farmerId,
        paymentStatus: { $in: ['pending', 'partial', 'overdue'] }
    }).sort({ dueDate: 1 });
};

financialTransactionSchema.statics.getMonthlyTrends = async function(farmerId, year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    return this.aggregate([
        {
            $match: {
                farmer: mongoose.Types.ObjectId(farmerId),
                transactionDate: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$transactionDate' },
                    month: { $month: '$transactionDate' }
                },
                income: {
                    $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                expenses: {
                    $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                income: 1,
                expenses: 1,
                profit: { $subtract: ['$income', '$expenses'] },
                count: 1
            }
        },
        { $sort: { year: 1, month: 1 } }
    ]);
};

// Budget schema methods
budgetSchema.methods.calculateVariances = function() {
    this.totalActualExpense = this.categories.reduce((sum, cat) => sum + (cat.actualAmount || 0), 0);
    this.totalActualRevenue = this.cropBudgets.reduce((sum, crop) => sum + (crop.actualRevenue || 0), 0);
    
    // Calculate variances
    this.categories.forEach(category => {
        category.variance = (category.actualAmount || 0) - category.plannedAmount;
    });
    
    this.cropBudgets.forEach(crop => {
        crop.variance = (crop.actualCost || 0) - crop.plannedCost;
    });
    
    const expenseVariance = this.totalActualExpense - this.totalPlannedExpense;
    const revenueVariance = this.totalActualRevenue - this.totalPlannedRevenue;
    
    this.variancePercentage = this.totalPlannedExpense > 0 
        ? (expenseVariance / this.totalPlannedExpense) * 100 
        : 0;
    
    this.utilizationRate = this.totalPlannedExpense > 0 
        ? (this.totalActualExpense / this.totalPlannedExpense) * 100 
        : 0;
    
    // Calculate ROI if there's revenue
    if (this.totalActualExpense > 0 && this.totalActualRevenue > 0) {
        this.roi = ((this.totalActualRevenue - this.totalActualExpense) / this.totalActualExpense) * 100;
    }
    
    // Generate alerts
    this.generateAlerts();
};

budgetSchema.methods.generateAlerts = function() {
    this.alerts = [];
    
    // Overspending alert
    if (this.totalActualExpense > this.totalPlannedExpense * 1.1) { // 10% over budget
        this.alerts.push({
            type: 'overspending',
            message: `Overspending by ${((this.totalActualExpense - this.totalPlannedExpense) / this.totalPlannedExpense * 100).toFixed(1)}%`,
            severity: 'high',
            triggeredAt: new Date()
        });
    }
    
    // Revenue shortfall alert
    if (this.totalActualRevenue < this.totalPlannedRevenue * 0.9) { // 10% under revenue
        this.alerts.push({
            type: 'revenue_shortfall',
            message: `Revenue shortfall by ${((this.totalPlannedRevenue - this.totalActualRevenue) / this.totalPlannedRevenue * 100).toFixed(1)}%`,
            severity: 'medium',
            triggeredAt: new Date()
        });
    }
    
    // Check individual category overspending
    this.categories.forEach(category => {
        if (category.actualAmount > category.plannedAmount * 1.2) { // 20% over category budget
            this.alerts.push({
                type: 'overspending',
                message: `${category.category} overspending by ${((category.actualAmount - category.plannedAmount) / category.plannedAmount * 100).toFixed(1)}%`,
                severity: category.actualAmount > category.plannedAmount * 1.5 ? 'high' : 'medium',
                triggeredAt: new Date()
            });
        }
    });
};

const FinancialTransaction = mongoose.model('FinancialTransaction', financialTransactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);

module.exports = { FinancialTransaction, Budget };
