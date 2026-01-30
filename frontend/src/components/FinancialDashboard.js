import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Menu,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert
} from '@mui/material';
import {
    Add,
    TrendingUp,
    TrendingDown,
    Payment,
    Receipt,
    Download,
    MoreVert,
    CheckCircle,
    ArrowUpward,
    ArrowDownward,
    ShowChart,
    PieChart
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfYear } from 'date-fns';
import { financialService } from '../services/api';
import TransactionForm from './TransactionForm';
import TransactionDetails from './TransactionDetails';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const FinancialDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showForm, setShowForm] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [filters, setFilters] = useState({
        startDate: startOfYear(new Date()),
        endDate: new Date(),
        type: '',
        category: '',
        paymentStatus: ''
    });
    const [expenseBreakdown, setExpenseBreakdown] = useState([]);
    const [incomeBreakdown, setIncomeBreakdown] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [cropWiseProfit, setCropWiseProfit] = useState([]);
    const [insights, setInsights] = useState([]);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedMenuTransaction, setSelectedMenuTransaction] = useState(null);

    // Expense category colors
    const expenseColors = {
        seeds: '#4CAF50',
        fertilizers: '#FF9800',
        pesticides: '#F44336',
        labor: '#2196F3',
        equipment_fuel: '#795548',
        equipment_repair: '#607D8B',
        irrigation: '#00BCD4',
        electricity: '#FFC107',
        transport: '#9C27B0',
        other: '#757575'
    };

    // Income source colors
    const incomeColors = {
        crop_sale: '#4CAF50',
        livestock_sale: '#8BC34A',
        dairy: '#CDDC39',
        poultry: '#FFEB3B',
        government_subsidy: '#2196F3',
        other: '#9E9E9E'
    };

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const [transactionsRes, expenseRes, incomeRes, pendingRes, cropRes] = await Promise.all([
                financialService.getTransactions(filters),
                financialService.getExpenseBreakdown(filters),
                financialService.getIncomeBreakdown(filters),
                financialService.getPendingPayments(),
                financialService.getCropWiseProfit()
            ]);

            setTransactions(transactionsRes.transactions);
            setSummary(transactionsRes.summary);
            setExpenseBreakdown(expenseRes.breakdown);
            setIncomeBreakdown(incomeRes.breakdown);
            setPendingPayments(pendingRes.pendingPayments);
            setCropWiseProfit(Array.isArray(cropRes) ? cropRes : []);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async () => {
        try {
            const response = await financialService.getInsights();
            setInsights(response.insights || []);
        } catch (error) {
            console.error('Error fetching insights:', error);
        }
    };

    useEffect(() => {
        fetchFinancialData();
        fetchInsights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleMenuClick = (event, transaction) => {
        setMenuAnchor(event.currentTarget);
        setSelectedMenuTransaction(transaction);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedMenuTransaction(null);
    };

    const handleMarkPaid = async () => {
        if (selectedMenuTransaction) {
            try {
                await financialService.markPaymentPaid(selectedMenuTransaction._id);
                fetchFinancialData();
            } catch (error) {
                console.error('Error marking payment as paid:', error);
            }
        }
        handleMenuClose();
    };

    const handleDeleteTransaction = async () => {
        if (selectedMenuTransaction && window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await financialService.deleteTransaction(selectedMenuTransaction._id);
                fetchFinancialData();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
        handleMenuClose();
    };

    const handleExportReport = async () => {
        try {
            await financialService.exportToCSV(filters);
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    const renderSummaryCards = () => {
        const profitColor = summary.netProfit >= 0 ? 'success' : 'error';
        const profitIcon = summary.netProfit >= 0 ? <TrendingUp /> : <TrendingDown />;

        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ArrowUpward color="success" />
                                <Typography color="textSecondary" variant="caption">
                                    Total Income
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="success.main">
                                ₹{summary.totalIncome?.toLocaleString() || '0'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ArrowDownward color="error" />
                                <Typography color="textSecondary" variant="caption">
                                    Total Expenses
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="error.main">
                                ₹{summary.totalExpense?.toLocaleString() || '0'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {profitIcon}
                                <Typography color="textSecondary" variant="caption">
                                    Net Profit
                                </Typography>
                            </Box>
                            <Typography variant="h5" color={`${profitColor}.main`}>
                                ₹{summary.netProfit?.toLocaleString() || '0'}
                            </Typography>
                            {summary.profitMargin !== undefined && (
                                <Typography variant="caption" color="textSecondary">
                                    Margin: {summary.profitMargin.toFixed(1)}%
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Payment color="warning" />
                                <Typography color="textSecondary" variant="caption">
                                    Pending Payments
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="warning.main">
                                {pendingPayments.length}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {pendingPayments.length > 0 ? '₹' + pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString() : 'All clear'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderCharts = () => {
        return (
            <Grid container spacing={3}>
                {/* Expense Breakdown Pie Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Expense Breakdown
                        </Typography>
                        {expenseBreakdown.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={expenseBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ _id, percentage }) => `${_id}: ${percentage.toFixed(1)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="totalAmount"
                                        >
                                            {expenseBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={expenseColors[entry._id] || expenseColors.other} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Typography color="textSecondary" align="center" sx={{ mt: 8 }}>
                                No expense data available
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Income Breakdown Pie Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Income Breakdown
                        </Typography>
                        {incomeBreakdown.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={incomeBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ _id, percentage }) => `${_id}: ${percentage.toFixed(1)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="totalAmount"
                                        >
                                            {incomeBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={incomeColors[entry._id] || incomeColors.other} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Typography color="textSecondary" align="center" sx={{ mt: 8 }}>
                                No income data available
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Crop-wise Profit Bar Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Crop-wise Profit Analysis
                        </Typography>
                        {cropWiseProfit.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cropWiseProfit}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="cropName" />
                                        <YAxis />
                                        <RechartsTooltip formatter={(value, name) => [
                                            `₹${value.toLocaleString()}`,
                                            name === 'netProfit' ? 'Profit' : name === 'totalIncome' ? 'Income' : 'Expense'
                                        ]} />
                                        <Legend />
                                        <Bar dataKey="totalIncome" fill="#4CAF50" name="Income" />
                                        <Bar dataKey="totalExpense" fill="#F44336" name="Expense" />
                                        <Bar dataKey="netProfit" fill="#2196F3" name="Profit" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Typography color="textSecondary" align="center" sx={{ mt: 8 }}>
                                No crop profit data available
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    const renderTransactionTable = () => {
        return (
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Recent Transactions
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExportReport}
                    >
                        Export Report
                    </Button>
                </Box>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Category/Source</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Crop</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.slice(0, 10).map((transaction) => (
                                <TableRow 
                                    key={transaction._id}
                                    sx={{ 
                                        '&:hover': { backgroundColor: 'action.hover' },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        setSelectedTransaction(transaction);
                                        setDetailsOpen(true);
                                    }}
                                >
                                    <TableCell>
                                        {format(new Date(transaction.transactionDate), 'dd MMM yy')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={transaction.type} 
                                            size="small"
                                            color={transaction.type === 'income' ? 'success' : 'error'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {transaction.description}
                                        </Typography>
                                        {transaction.party?.name && (
                                            <Typography variant="caption" color="textSecondary">
                                                {transaction.party.name}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.type === 'income' ? transaction.source : transaction.category}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="bold"
                                            color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                                        >
                                            ₹{transaction.amount.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={transaction.paymentStatus} 
                                            size="small"
                                            color={
                                                transaction.paymentStatus === 'paid' ? 'success' :
                                                transaction.paymentStatus === 'pending' ? 'warning' :
                                                transaction.paymentStatus === 'overdue' ? 'error' : 'default'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {transaction.cropName || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuClick(e, transaction);
                                            }}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {transactions.length > 10 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="text">
                            View All Transactions ({transactions.length})
                        </Button>
                    </Box>
                )}
            </Paper>
        );
    };

    const renderPendingPayments = () => {
        if (pendingPayments.length === 0) {
            return (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" color="success.main">
                        All Clear!
                    </Typography>
                    <Typography color="textSecondary">
                        No pending payments
                    </Typography>
                </Paper>
            );
        }

        return (
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Pending Payments ({pendingPayments.length})
                </Typography>
                <List>
                    {pendingPayments.slice(0, 5).map((payment) => (
                        <React.Fragment key={payment._id}>
                            <ListItem 
                                secondaryAction={
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        onClick={() => {
                                            setSelectedTransaction(payment);
                                            setDetailsOpen(true);
                                        }}
                                    >
                                        View
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body1">
                                                {payment.description}
                                            </Typography>
                                            <Chip 
                                                label={payment.type === 'income' ? 'To Receive' : 'To Pay'} 
                                                size="small"
                                                color={payment.type === 'income' ? 'success' : 'error'}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" display="block">
                                                {payment.party?.name || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Due: {payment.dueDate ? format(new Date(payment.dueDate), 'dd MMM yyyy') : 'N/A'}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <Typography 
                                    variant="body1" 
                                    fontWeight="bold"
                                    color={payment.type === 'income' ? 'success.main' : 'error.main'}
                                >
                                    ₹{payment.amount.toLocaleString()}
                                </Typography>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
                
                {pendingPayments.length > 5 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="text">
                            View All Pending Payments
                        </Button>
                    </Box>
                )}
            </Paper>
        );
    };

    const renderInsights = () => {
        if (insights.length === 0) return null;

        return (
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Financial Insights
                </Typography>
                <Grid container spacing={1}>
                    {insights.map((insight, index) => (
                        <Grid item xs={12} key={index}>
                            <Alert 
                                severity={insight.type === 'warning' ? 'warning' : 'info'}
                                sx={{ mb: 1 }}
                            >
                                {insight.message}
                            </Alert>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Financial Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setShowForm(true)}
                >
                    Add Transaction
                </Button>
            </Box>

            {/* Date Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={filters.startDate}
                                onChange={(date) => handleFilterChange('startDate', date)}
                                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="End Date"
                                value={filters.endDate}
                                onChange={(date) => handleFilterChange('endDate', date)}
                                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filters.type}
                                    label="Type"
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    <MenuItem value="income">Income</MenuItem>
                                    <MenuItem value="expense">Expense</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.paymentStatus}
                                    label="Status"
                                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="overdue">Overdue</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Overview" value="overview" icon={<ShowChart />} />
                    <Tab label="Transactions" value="transactions" icon={<Receipt />} />
                    <Tab label="Pending Payments" value="pending" icon={<Payment />} />
                    <Tab label="Analysis" value="analysis" icon={<PieChart />} />
                </Tabs>
            </Paper>

            {loading ? (
                <LinearProgress />
            ) : (
                <>
                    {renderSummaryCards()}
                    
                    {renderInsights()}
                    
                    {activeTab === 'overview' && (
                        <>
                            {renderCharts()}
                            <Box sx={{ mt: 3 }}>
                                {renderTransactionTable()}
                            </Box>
                        </>
                    )}
                    
                    {activeTab === 'transactions' && (
                        <Box sx={{ mt: 3 }}>
                            {renderTransactionTable()}
                        </Box>
                    )}
                    
                    {activeTab === 'pending' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                {renderPendingPayments()}
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Quick Actions
                                    </Typography>
                                    <List>
                                        <ListItem button onClick={() => {
                                            setSelectedTransaction(null);
                                            setShowForm(true);
                                        }}>
                                            <ListItemText primary="Record Expense" secondary="Add new expense record" />
                                        </ListItem>
                                        <ListItem button onClick={() => {
                                            setSelectedTransaction(null);
                                            setShowForm(true);
                                        }}>
                                            <ListItemText primary="Record Income" secondary="Add new income record" />
                                        </ListItem>
                                        <ListItem button onClick={handleExportReport}>
                                            <ListItemText primary="Export Report" secondary="Download financial report" />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                    
                    {activeTab === 'analysis' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                {renderCharts()}
                            </Grid>
                        </Grid>
                    )}
                </>
            )}

            {/* Transaction Form Dialog */}
            <Dialog 
                open={showForm} 
                onClose={() => setShowForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </DialogTitle>
                <DialogContent>
                    <TransactionForm 
                        transaction={selectedTransaction}
                        onSuccess={() => {
                            setShowForm(false);
                            setSelectedTransaction(null);
                            fetchFinancialData();
                        }}
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedTransaction(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    setSelectedTransaction(selectedMenuTransaction);
                    setDetailsOpen(true);
                    handleMenuClose();
                }}>
                    <ListItemText primary="View Details" />
                </MenuItem>
                <MenuItem onClick={() => {
                    setSelectedTransaction(selectedMenuTransaction);
                    setShowForm(true);
                    handleMenuClose();
                }}>
                    <ListItemText primary="Edit" />
                </MenuItem>
                {selectedMenuTransaction?.paymentStatus !== 'paid' && (
                    <MenuItem onClick={handleMarkPaid}>
                        <ListItemText primary="Mark as Paid" />
                    </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleDeleteTransaction} sx={{ color: 'error.main' }}>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>

            {/* Transaction Details Dialog */}
            {selectedTransaction && (
                <TransactionDetails 
                    open={detailsOpen}
                    transaction={selectedTransaction}
                    onClose={() => setDetailsOpen(false)}
                    onEdit={() => {
                        setDetailsOpen(false);
                        setShowForm(true);
                    }}
                    onMarkPaid={handleMarkPaid}
                />
            )}
        </Container>
    );
};

export default FinancialDashboard;
