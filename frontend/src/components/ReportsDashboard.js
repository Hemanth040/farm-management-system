import React, { useState, useEffect, useRef } from 'react';
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
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Divider,
    Badge
} from '@mui/material';
import {
    GetApp,
    Assessment,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Warning,
    Error,
    Agriculture,
    AttachMoney,
    People,
    LocalFlorist,
    BarChart,
    Refresh,
    CompareArrows,
    Build,
    Cloud,
    Description,
    Insights,
    Calculate,
    PictureAsPdf,
    FilterList,
    DateRange,
    Dashboard,
    ExpandMore,
    Lightbulb,
    Savings,
    TrendingFlat,
    Speed
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfYear, endOfYear, subMonths } from 'date-fns';
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
    Area,
    ComposedChart,
    Scatter,
    ScatterChart,
    ZAxis
} from 'recharts';
import { reportsService } from '../services/api';
import { useReactToPrint } from 'react-to-print';

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
    const [seasonalComparison, setSeasonalComparison] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [profitabilityAnalysis, setProfitabilityAnalysis] = useState(null);
    
    // Custom report builder state
    const [customReportDialog, setCustomReportDialog] = useState(false);
    const [customReportConfig, setCustomReportConfig] = useState({
        includeFarmSummary: true,
        includeCropPerformance: true,
        includeFinancial: true,
        includeActivities: false,
        includeResources: false,
        includeWorkers: false,
        includeHealth: false,
        includeAIInsights: true,
        includePredictions: false
    });
    
    const printRef = useRef();

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
                healthRes,
                aiRes,
                predRes,
                profitRes
            ] = await Promise.all([
                reportsService.getFarmSummary(params),
                reportsService.getCropPerformance(params),
                reportsService.getActivityReport(params),
                reportsService.getResourceUsage(params),
                reportsService.getFinancialReport(params),
                reportsService.getWorkerPerformance(params),
                reportsService.getCropHealthReport(params),
                reportsService.getAIInsights(params),
                reportsService.getPredictions(params),
                reportsService.getProfitabilityAnalysis(params)
            ]);

            setFarmSummary(farmRes);
            setCropPerformance(cropRes);
            setActivityReport(activityRes);
            setResourceUsage(resourceRes);
            setFinancialReport(financialRes);
            setWorkerPerformance(workerRes);
            setCropHealthReport(healthRes);
            setAiInsights(aiRes);
            setPredictions(predRes);
            setProfitabilityAnalysis(profitRes);
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

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: 'Farm Report'
    });

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

    // AI INSIGHTS COMPONENT
    const renderAIInsights = () => {
        if (!aiInsights) return null;
        
        const { insights, optimizationTips, summary } = aiInsights;
        
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Insights color="primary" />
                    AI-Powered Insights
                    {summary.urgentIssues > 0 && (
                        <Badge badgeContent={summary.urgentIssues} color="error">
                            <Error color="error" />
                        </Badge>
                    )}
                </Typography>
                
                <Grid container spacing={2}>
                    {insights.map((insight, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Alert 
                                severity={insight.type}
                                sx={{ height: '100%' }}
                                action={
                                    <Button color="inherit" size="small">
                                        {insight.action}
                                    </Button>
                                }
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {insight.title}
                                </Typography>
                                <Typography variant="body2">
                                    {insight.message}
                                </Typography>
                            </Alert>
                        </Grid>
                    ))}
                </Grid>
                
                {optimizationTips.length > 0 && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Savings color="success" />
                                Cost Optimization Opportunities
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Potential total savings: ₹{summary.potentialSavings?.toLocaleString()}
                            </Typography>
                            <List>
                                {optimizationTips.slice(0, 3).map((tip, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <Lightbulb color="warning" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={tip.tip}
                                            secondary={`Potential savings: ₹${tip.potentialSavings?.toLocaleString()} • Priority: ${tip.priority}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                )}
            </Box>
        );
    };

    // PREDICTIVE ANALYTICS COMPONENT
    const renderPredictions = () => {
        if (!predictions) return null;
        
        const { predictions: futurePredictions, currentTrend, risks, opportunities } = predictions;
        
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp color="primary" />
                    Predictive Analytics
                    <Chip 
                        label={`Trend: ${currentTrend.direction}`}
                        color={currentTrend.direction === 'positive' ? 'success' : 
                               currentTrend.direction === 'negative' ? 'error' : 'default'}
                        size="small"
                    />
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>3-Month Profit Forecast</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <ComposedChart data={futurePredictions}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" label={{ value: 'Months Ahead', position: 'insideBottom', offset: -5 }} />
                                        <YAxis />
                                        <ReTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                        <Bar dataKey="projectedProfit" fill="#8884d8" name="Projected Profit" />
                                        <Line type="monotone" dataKey="projectedProfit" stroke="#ff7300" strokeWidth={2} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Risk & Opportunities</Typography>
                                {risks.map((risk, idx) => (
                                    <Alert severity="error" sx={{ mb: 1 }} key={idx}>
                                        <Typography variant="body2">{risk.message}</Typography>
                                    </Alert>
                                ))}
                                {opportunities.map((opp, idx) => (
                                    <Alert severity="success" sx={{ mb: 1 }} key={idx}>
                                        <Typography variant="body2">{opp.message}</Typography>
                                    </Alert>
                                ))}
                                {risks.length === 0 && opportunities.length === 0 && (
                                    <Alert severity="info">No significant risks or opportunities detected.</Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // PROFITABILITY ANALYSIS COMPONENT
    const renderProfitabilityAnalysis = () => {
        if (!profitabilityAnalysis) return null;
        
        const { crops, summary } = profitabilityAnalysis;
        
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calculate color="primary" />
                    Profitability Analysis
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary">Avg Profit/Acre</Typography>
                                <Typography variant="h4">₹{summary.averageProfitPerAcre}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary">Avg ROI</Typography>
                                <Typography variant="h4">{summary.averageRoi}%</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'success.light' }}>
                            <CardContent>
                                <Typography color="textSecondary">Best Performer</Typography>
                                <Typography variant="h6">{summary.mostProfitable?.name}</Typography>
                                <Typography variant="body2">₹{summary.mostProfitable?.profitPerAcre}/acre</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'error.light' }}>
                            <CardContent>
                                <Typography color="textSecondary">Needs Attention</Typography>
                                <Typography variant="h6">{summary.leastProfitable?.name}</Typography>
                                <Typography variant="body2">₹{summary.leastProfitable?.profitPerAcre}/acre</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Crop</TableCell>
                                <TableCell>Profit/Acre</TableCell>
                                <TableCell>Profit/KG</TableCell>
                                <TableCell>ROI %</TableCell>
                                <TableCell>Cost/KG</TableCell>
                                <TableCell>Break-even</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {crops.map((crop) => (
                                <TableRow key={crop.cropId}>
                                    <TableCell>
                                        <Typography fontWeight="bold">{crop.name}</Typography>
                                        <Typography variant="caption">{crop.variety}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`₹${crop.profitPerAcre}`}
                                            color={parseFloat(crop.profitPerAcre) > 0 ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>₹{crop.profitPerKg}</TableCell>
                                    <TableCell>{crop.roi}%</TableCell>
                                    <TableCell>₹{crop.costPerKg}</TableCell>
                                    <TableCell>{crop.breakEvenYield} kg</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {/* Scatter plot: Cost vs Revenue per acre */}
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Cost vs Revenue Efficiency (per Acre)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="costPerAcre" name="Cost per Acre" unit="₹" />
                                <YAxis type="number" dataKey="revenuePerAcre" name="Revenue per Acre" unit="₹" />
                                <ZAxis type="number" dataKey="profitPerAcre" range={[100, 500]} />
                                <ReTooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Legend />
                                <Scatter name="Crops" data={crops} fill="#8884d8">
                                    {crops.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={parseFloat(entry.profitPerAcre) > 0 ? '#4CAF50' : '#F44336'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    // SEASONAL COMPARISON COMPONENT
    const renderSeasonalComparison = () => {
        return (
            <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareArrows color="primary" />
                    Seasonal Comparison
                </Typography>
                <Alert severity="info">
                    Select two seasons to compare performance. This helps identify which season works best for your farm.
                </Alert>
            </Box>
        );
    };

    // CUSTOM REPORT BUILDER DIALOG
    const renderCustomReportDialog = () => (
        <Dialog open={customReportDialog} onClose={() => setCustomReportDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Build color="primary" />
                    Custom Report Builder
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Select the components you want to include in your custom report
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeFarmSummary} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeFarmSummary: e.target.checked})} />}
                            label="Farm Summary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeCropPerformance} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeCropPerformance: e.target.checked})} />}
                            label="Crop Performance"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeFinancial} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeFinancial: e.target.checked})} />}
                            label="Financial Report"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeActivities} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeActivities: e.target.checked})} />}
                            label="Activity Report"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeResources} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeResources: e.target.checked})} />}
                            label="Resource Usage"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeWorkers} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeWorkers: e.target.checked})} />}
                            label="Worker Performance"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeHealth} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeHealth: e.target.checked})} />}
                            label="Crop Health"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includeAIInsights} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includeAIInsights: e.target.checked})} />}
                            label="AI Insights"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Switch checked={customReportConfig.includePredictions} 
                                onChange={(e) => setCustomReportConfig({...customReportConfig, includePredictions: e.target.checked})} />}
                            label="Predictions"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCustomReportDialog(false)}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={() => {
                        setCustomReportDialog(false);
                        handlePrint();
                    }}
                    startIcon={<PictureAsPdf />}
                >
                    Generate PDF
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Render all report sections
    const renderAllReports = () => (
        <div ref={printRef}>
            {/* AI Insights - always show at top */}
            {aiInsights && renderAIInsights()}
            
            {/* Farm Summary */}
            {customReportConfig.includeFarmSummary && farmSummary && (
                <Box sx={{ mb: 4, pageBreakAfter: 'always' }}>
                    {/* Farm Summary Content */}
                    <Typography variant="h4" gutterBottom>Farm Summary Report</Typography>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary">Total Crops</Typography>
                                    <Typography variant="h4">{farmSummary.summary.totalCrops}</Typography>
                                    <Typography variant="body2">{farmSummary.summary.totalArea} acres</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary">Net Profit</Typography>
                                    <Typography variant="h4" color={farmSummary.summary.netProfit >= 0 ? 'success' : 'error'}>
                                        ₹{farmSummary.summary.netProfit?.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">{farmSummary.summary.profitMargin}% margin</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary">Activities</Typography>
                                    <Typography variant="h4">
                                        {farmSummary.summary.completedActivities}/{farmSummary.summary.totalActivities}
                                    </Typography>
                                    <Typography variant="body2">{farmSummary.summary.activityCompletionRate}% completed</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary">Team Size</Typography>
                                    <Typography variant="h4">{farmSummary.summary.totalWorkers}</Typography>
                                    <Typography variant="body2">{farmSummary.summary.totalResources} resources</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}
            
            {/* Predictions */}
            {customReportConfig.includePredictions && predictions && renderPredictions()}
            
            {/* Profitability Analysis */}
            {profitabilityAnalysis && renderProfitabilityAnalysis()}
            
            {/* Other reports... */}
        </div>
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Dashboard fontSize="large" color="primary" />
                            Comprehensive Farm Reports
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Build />}
                                onClick={() => setCustomReportDialog(true)}
                            >
                                Custom Report
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PictureAsPdf />}
                                onClick={handlePrint}
                            >
                                Print PDF
                            </Button>
                        </Box>
                    </Box>
                    
                    {/* Filters */}
                    <Grid container spacing={2} sx={{ mt: 3 }}>
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
                                        <MenuItem key={crop.id} value={crop.id}>{crop.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={fetchAllReports}
                                fullWidth
                                sx={{ height: '100%' }}
                            >
                                Refresh Data
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading */}
                {loading && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <LinearProgress />
                        <Typography align="center" sx={{ mt: 2 }}>
                            Loading comprehensive reports...
                        </Typography>
                    </Box>
                )}

                {/* Reports Content */}
                {!loading && (
                    <Paper sx={{ p: 3 }}>
                        {renderAllReports()}
                    </Paper>
                )}

                {/* Custom Report Dialog */}
                {renderCustomReportDialog()}
            </Container>
        </LocalizationProvider>
    );
};

export default ReportsDashboard;