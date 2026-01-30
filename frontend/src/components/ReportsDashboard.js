import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar
} from '@mui/material';
import {
    GetApp,
    Assessment,
    TrendingUp,
    CheckCircle,
    Warning,
    Error,
    Agriculture,
    AttachMoney,
    People,
    LocalFlorist,
    BarChart,
    Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfYear, endOfYear } from 'date-fns';
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { reportsService } from '../services/api';

// Color palette for charts
const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B'];

const ReportsDashboard = () => {
    const [activeTab, setActiveTab] = useState('farm-summary');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date())
    });
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [crops, setCrops] = useState([]);
    
    // Report data states
    const [farmSummary, setFarmSummary] = useState(null);
    const [cropPerformance, setCropPerformance] = useState(null);
    const [activityReport, setActivityReport] = useState(null);
    const [resourceUsage, setResourceUsage] = useState(null);
    const [financialReport, setFinancialReport] = useState(null);
    const [workerPerformance, setWorkerPerformance] = useState(null);
    const [cropHealthReport, setCropHealthReport] = useState(null);

    const fetchAllReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
                cropId: selectedCrop !== 'all' ? selectedCrop : undefined
            };

            const [
                farmRes,
                cropRes,
                activityRes,
                resourceRes,
                financialRes,
                workerRes,
                healthRes
            ] = await Promise.all([
                reportsService.getFarmSummary(params),
                reportsService.getCropPerformance(params),
                reportsService.getActivityReport(params),
                reportsService.getResourceUsage(params),
                reportsService.getFinancialReport(params),
                reportsService.getWorkerPerformance(params),
                reportsService.getCropHealthReport(params)
            ]);

            setFarmSummary(farmRes);
            setCropPerformance(cropRes);
            setActivityReport(activityRes);
            setResourceUsage(resourceRes);
            setFinancialReport(financialRes);
            setWorkerPerformance(workerRes);
            setCropHealthReport(healthRes);
            setCrops(cropRes?.crops?.map(c => ({ id: c.cropId, name: c.name })) || []);
        } catch (err) {
            setError('Failed to load reports. Please try again.');
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, selectedCrop]);

    const handleExport = async (reportType, format) => {
        try {
            const data = await reportsService.exportReport(reportType, format, {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            
            if (format === 'csv') {
                const blob = new Blob([data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${reportType}-report.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    // ============================================
    // FARM SUMMARY REPORT
    // ============================================
    const renderFarmSummary = () => {
        if (!farmSummary) return <LinearProgress />;
        
        const { summary, monthlyTrend } = farmSummary;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment color="primary" />
                    Farm Summary Report
                </Typography>
                
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Crops
                                </Typography>
                                <Typography variant="h4">
                                    {summary.totalCrops}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {summary.totalArea} acres
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Net Profit
                                </Typography>
                                <Typography variant="h4" color={summary.netProfit >= 0 ? 'success.main' : 'error.main'}>
                                    ₹{summary.netProfit?.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {summary.profitMargin}% margin
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Activities
                                </Typography>
                                <Typography variant="h4">
                                    {summary.completedActivities}/{summary.totalActivities}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {summary.activityCompletionRate}% completed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Team Size
                                </Typography>
                                <Typography variant="h4">
                                    {summary.totalWorkers}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {summary.totalResources} resources
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Monthly Trend Chart */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Monthly Financial Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ReTooltip />
                                <Legend />
                                <Area type="monotone" dataKey="income" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="expenses" stackId="1" stroke="#F44336" fill="#F44336" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Insights */}
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                        <strong>Insight:</strong> Your farm has achieved a {summary.profitMargin}% profit margin this period. 
                        {summary.netProfit > 0 
                            ? "Great job! Consider reinvesting in high-performing crops."
                            : "Review your expenses to identify cost-saving opportunities."}
                    </Typography>
                </Alert>
            </Box>
        );
    };

    // ============================================
    // CROP PERFORMANCE REPORT
    // ============================================
    const renderCropPerformance = () => {
        if (!cropPerformance) return <LinearProgress />;
        
        const { crops, summary } = cropPerformance;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Agriculture color="primary" />
                    Crop Performance Report
                </Typography>

                {/* Performance Summary */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Top Performing Crops</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <ReBarChart data={crops.slice(0, 5)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={100} />
                                        <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                        <Bar dataKey="profit" fill="#4CAF50" />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Input Cost vs Income</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <ReBarChart data={crops}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                        <Legend />
                                        <Bar dataKey="inputCost" fill="#FF9800" name="Input Cost" />
                                        <Bar dataKey="income" fill="#4CAF50" name="Income" />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Detailed Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Crop</TableCell>
                                <TableCell>Area (Acres)</TableCell>
                                <TableCell>Input Cost</TableCell>
                                <TableCell>Income</TableCell>
                                <TableCell>Profit</TableCell>
                                <TableCell>Profit/Acre</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {crops.map((crop) => (
                                <TableRow key={crop.cropId}>
                                    <TableCell>
                                        <Typography fontWeight="bold">{crop.name}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {crop.variety}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{crop.area}</TableCell>
                                    <TableCell>₹{crop.inputCost?.toLocaleString()}</TableCell>
                                    <TableCell>₹{crop.income?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography color={crop.profit >= 0 ? 'success.main' : 'error.main'}>
                                            ₹{crop.profit?.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>₹{crop.profitPerAcre}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={crop.status} 
                                            color={crop.status === 'harvested' ? 'success' : 'primary'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {summary.bestPerformingCrop && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography>
                            <strong>Best Performer:</strong> {summary.bestPerformingCrop.name} with 
                            ₹{summary.bestPerformingCrop.profit?.toLocaleString()} profit 
                            (₹{summary.bestPerformingCrop.profitPerAcre}/acre)
                        </Typography>
                    </Alert>
                )}
            </Box>
        );
    };

    // ============================================
    // FINANCIAL REPORT
    // ============================================
    const renderFinancialReport = () => {
        if (!financialReport) return <LinearProgress />;
        
        const { summary, expensesByCategory, incomeBySource, monthlyTrend } = financialReport;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney color="primary" />
                    Financial Report
                </Typography>

                {/* Financial Summary */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'success.light' }}>
                            <CardContent>
                                <Typography variant="h6">Total Income</Typography>
                                <Typography variant="h3">₹{summary.totalIncome?.toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'error.light' }}>
                            <CardContent>
                                <Typography variant="h6">Total Expenses</Typography>
                                <Typography variant="h3">₹{summary.totalExpenses?.toLocaleString()}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: summary.netProfit >= 0 ? 'success.main' : 'error.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6">Net Profit</Typography>
                                <Typography variant="h3">₹{summary.netProfit?.toLocaleString()}</Typography>
                                <Typography variant="body2">{summary.profitMargin}% margin</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RePieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="amount"
                                            nameKey="category"
                                        >
                                            {expensesByCategory?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Income Sources</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RePieChart>
                                        <Pie
                                            data={incomeBySource}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="amount"
                                            nameKey="source"
                                        >
                                            {incomeBySource?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Monthly Profit Trend */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Monthly Profit Trend</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                <Legend />
                                <Line type="monotone" dataKey="profit" stroke="#4CAF50" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    // ============================================
    // ACTIVITY REPORT
    // ============================================
    const renderActivityReport = () => {
        if (!activityReport) return <LinearProgress />;
        
        const { summary, byType, byMonth } = activityReport;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChart color="primary" />
                    Activity Report
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">{summary.total}</Typography>
                                <Typography color="textSecondary">Total Activities</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.completed}</Typography>
                                <Typography color="textSecondary">Completed</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.planned}</Typography>
                                <Typography color="textSecondary">Planned</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">₹{summary.totalCost?.toLocaleString()}</Typography>
                                <Typography color="textSecondary">Total Cost</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Activities by Type</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <ReBarChart data={byType}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="type" />
                                        <YAxis />
                                        <ReTooltip />
                                        <Bar dataKey="count" fill="#2196F3" />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Monthly Activity Status</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <ReBarChart data={byMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ReTooltip />
                                        <Legend />
                                        <Bar dataKey="completed" stackId="a" fill="#4CAF50" />
                                        <Bar dataKey="planned" stackId="a" fill="#FF9800" />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // ============================================
    // RESOURCE USAGE REPORT
    // ============================================
    const renderResourceUsage = () => {
        if (!resourceUsage) return <LinearProgress />;
        
        const { summary, byCategory, resources } = resourceUsage;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalFlorist color="primary" />
                    Resource Usage Report
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">{summary.totalResources}</Typography>
                                <Typography color="textSecondary">Total Resources</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.lowStockItems}</Typography>
                                <Typography color="textSecondary">Low Stock</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="error.main">{summary.outOfStockItems}</Typography>
                                <Typography color="textSecondary">Out of Stock</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">₹{summary.totalUsageCost?.toLocaleString()}</Typography>
                                <Typography color="textSecondary">Usage Cost</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Resource by Category</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RePieChart>
                                        <Pie
                                            data={byCategory}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="totalValue"
                                            nameKey="category"
                                            label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {byCategory?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Stock Alerts</Typography>
                                <List>
                                    {resources?.filter(r => r.lowStock || r.outOfStock).slice(0, 5).map((resource) => (
                                        <ListItem key={resource.resourceId}>
                                            <ListItemIcon>
                                                {resource.outOfStock ? <Error color="error" /> : <Warning color="warning" />}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={resource.name}
                                                secondary={`Available: ${resource.availableQuantity} ${resource.unit}`}
                                            />
                                        </ListItem>
                                    ))}
                                    {resources?.filter(r => r.lowStock || r.outOfStock).length === 0 && (
                                        <ListItem>
                                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                                            <ListItemText primary="All resources at healthy stock levels" />
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // ============================================
    // WORKER PERFORMANCE REPORT
    // ============================================
    const renderWorkerPerformance = () => {
        if (!workerPerformance) return <LinearProgress />;
        
        const { workers, summary } = workerPerformance;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People color="primary" />
                    Worker Performance Report
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">{summary.totalWorkers}</Typography>
                                <Typography color="textSecondary">Total Workers</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.activeWorkers}</Typography>
                                <Typography color="textSecondary">Active</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">{summary.totalTasksCompleted}</Typography>
                                <Typography color="textSecondary">Tasks Completed</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">₹{summary.totalWagesPaid?.toLocaleString()}</Typography>
                                <Typography color="textSecondary">Total Wages</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Worker</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Tasks Completed</TableCell>
                                <TableCell>Completion Rate</TableCell>
                                <TableCell>Total Hours</TableCell>
                                <TableCell>Wages</TableCell>
                                <TableCell>Productivity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workers?.map((worker) => (
                                <TableRow key={worker.workerId}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                {worker.name?.charAt(0)}
                                            </Avatar>
                                            <Typography fontWeight="bold">{worker.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{worker.role}</TableCell>
                                    <TableCell>{worker.completedTasks}/{worker.totalTasks}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`${worker.completionRate}%`}
                                            color={parseFloat(worker.completionRate) >= 80 ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{worker.totalHours} hrs</TableCell>
                                    <TableCell>₹{worker.totalWages?.toLocaleString()}</TableCell>
                                    <TableCell>{worker.productivity} tasks/hr</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    // ============================================
    // CROP HEALTH REPORT
    // ============================================
    const renderCropHealthReport = () => {
        if (!cropHealthReport) return <LinearProgress />;
        
        const { summary, issuesByType, healthRecords } = cropHealthReport;
        
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalFlorist color="primary" />
                    Crop Health Report
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.healthyCrops}</Typography>
                                <Typography color="textSecondary">Healthy Crops</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.warningCrops}</Typography>
                                <Typography color="textSecondary">Warning</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" color="error.main">{summary.criticalCrops}</Typography>
                                <Typography color="textSecondary">Critical</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4">{summary.recoveryRate}%</Typography>
                                <Typography color="textSecondary">Recovery Rate</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Issues by Type</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RePieChart>
                                        <Pie
                                            data={issuesByType}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="type"
                                            label={({ type, count }) => `${type}: ${count}`}
                                        >
                                            {issuesByType?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Health Status Overview</Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Crop</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Score</TableCell>
                                            <TableCell>Issues</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {healthRecords?.slice(0, 5).map((record) => (
                                            <TableRow key={record._id}>
                                                <TableCell>{record.crop} ({record.cropVariety})</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={record.healthStatus}
                                                        color={record.healthStatus === 'healthy' ? 'success' : 
                                                               record.healthStatus === 'warning' ? 'warning' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{record.healthScore}/100</TableCell>
                                                <TableCell>{record.activeIssues} active</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Render based on active tab
    const renderReport = () => {
        switch (activeTab) {
            case 'farm-summary':
                return renderFarmSummary();
            case 'crop-performance':
                return renderCropPerformance();
            case 'financial':
                return renderFinancialReport();
            case 'activities':
                return renderActivityReport();
            case 'resources':
                return renderResourceUsage();
            case 'workers':
                return renderWorkerPerformance();
            case 'crop-health':
                return renderCropHealthReport();
            default:
                return renderFarmSummary();
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assessment fontSize="large" color="primary" />
                        Farm Reports Dashboard
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Filters */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                label="Start Date"
                                value={dateRange.startDate}
                                onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                label="End Date"
                                value={dateRange.endDate}
                                onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>Crop Filter</InputLabel>
                                <Select
                                    value={selectedCrop}
                                    onChange={(e) => setSelectedCrop(e.target.value)}
                                    label="Crop Filter"
                                >
                                    <MenuItem value="all">All Crops</MenuItem>
                                    {crops?.map((crop) => (
                                        <MenuItem key={crop.id} value={crop.id}>
                                            {crop.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={fetchAllReports}
                                    fullWidth
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<GetApp />}
                                    onClick={() => handleExport(activeTab, 'csv')}
                                    fullWidth
                                >
                                    Export
                                </Button>
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
                        <Tab value="farm-summary" label="Farm Summary" icon={<Assessment />} iconPosition="start" />
                        <Tab value="crop-performance" label="Crop Performance" icon={<Agriculture />} iconPosition="start" />
                        <Tab value="financial" label="Financial" icon={<AttachMoney />} iconPosition="start" />
                        <Tab value="activities" label="Activities" icon={<BarChart />} iconPosition="start" />
                        <Tab value="resources" label="Resources" icon={<LocalFlorist />} iconPosition="start" />
                        <Tab value="workers" label="Workers" icon={<People />} iconPosition="start" />
                        <Tab value="crop-health" label="Crop Health" icon={<TrendingUp />} iconPosition="start" />
                    </Tabs>
                </Paper>

                {/* Report Content */}
                <Paper sx={{ p: 3 }}>
                    {loading ? (
                        <Box sx={{ width: '100%', mt: 4 }}>
                            <LinearProgress />
                            <Typography align="center" sx={{ mt: 2 }}>
                                Loading report data...
                            </Typography>
                        </Box>
                    ) : (
                        renderReport()
                    )}
                </Paper>
            </Container>
        </LocalizationProvider>
    );
};

export default ReportsDashboard;