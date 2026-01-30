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
    DialogActions,
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
    Badge,
    Alert,
    LinearProgress,
    Menu,
    List,
    ListItem,
    ListItemText,
    Divider,
    CardActionArea,
    FormControlLabel,
    Checkbox,
    Fab,
    ListItemIcon
} from '@mui/material';
import {
    Add,
    HealthAndSafety,
    Warning,
    CheckCircle,
    Error,
    Science,
    Agriculture,
    BugReport,
    Spa,
    LocalFlorist,
    Upload,
    MoreVert,
    LocalHospital,
    Grass
} from '@mui/icons-material';
import { format } from 'date-fns';
import { cropHealthService } from '../services/api';
import IssueReportForm from './IssueReportForm';
import { 
    BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer
} from 'recharts';

const AIDiagnosisDialog = ({ open, onClose, crop }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>AI Diagnosis</DialogTitle>
            <DialogContent>
                <Typography>
                    AI Diagnosis feature coming soon.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const CropHealthDashboard = () => {
    const [cropHealthRecords, setCropHealthRecords] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [reportIssueOpen, setReportIssueOpen] = useState(false);
    const [aiDiagnosisOpen, setAiDiagnosisOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        crop: '',
        needsAttention: false
    });
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedMenuRecord, setSelectedMenuRecord] = useState(null);

    // Health status colors
    const healthColors = {
        healthy: '#4CAF50',
        warning: '#FF9800',
        critical: '#F44336',
        recovering: '#2196F3'
    };

    // Severity colors
    const severityColors = {
        low: '#4CAF50',
        medium: '#FF9800',
        high: '#F44336',
        critical: '#D32F2F'
    };

    // Growth stage icons
    const growthStageIcons = {
        sowing: <Grass />,
        germination: <LocalFlorist />,
        vegetative: <LocalFlorist />,
        flowering: <Spa />,
        fruiting: <Agriculture />,
        harvesting: <Agriculture />,
        default: <HealthAndSafety />
    };

    useEffect(() => {
        fetchCropHealthData();
    }, [filters]);

    const fetchCropHealthData = async () => {
        setLoading(true);
        try {
            const response = await cropHealthService.getCropHealth(filters);
            setCropHealthRecords(response.cropHealthRecords);
            setStats(response.stats);
        } catch (error) {
            console.error('Error fetching crop health data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleMenuClick = (event, record) => {
        setMenuAnchor(event.currentTarget);
        setSelectedMenuRecord(record);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedMenuRecord(null);
    };

    const handleReportIssue = () => {
        if (selectedMenuRecord) {
            setSelectedCrop(selectedMenuRecord);
            setReportIssueOpen(true);
        }
        handleMenuClose();
    };

    const handleAIDiagnosis = () => {
        if (selectedMenuRecord) {
            setSelectedCrop(selectedMenuRecord);
            setAiDiagnosisOpen(true);
        }
        handleMenuClose();
    };

    const handleViewDetails = () => {
        if (selectedMenuRecord) {
            setSelectedCrop(selectedMenuRecord);
            setDetailsOpen(true);
        }
        handleMenuClose();
    };

    const getHealthIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle color="success" />;
            case 'warning':
                return <Warning color="warning" />;
            case 'critical':
                return <Error color="error" />;
            default:
                return <HealthAndSafety />;
        }
    };

    const renderStatsCards = () => {
        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <HealthAndSafety color="primary" />
                                <Typography color="textSecondary" variant="caption">
                                    Total Crops
                                </Typography>
                            </Box>
                            <Typography variant="h5">{stats.totalCrops || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CheckCircle color="success" />
                                <Typography color="textSecondary" variant="caption">
                                    Healthy
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="success.main">
                                {stats.healthy || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Warning color="warning" />
                                <Typography color="textSecondary" variant="caption">
                                    Warning
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="warning.main">
                                {stats.warning || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Error color="error" />
                                <Typography color="textSecondary" variant="caption">
                                    Critical
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="error.main">
                                {stats.critical || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderCropHealthCard = (record) => {
        const activeIssues = record.issues?.filter(i => i.status !== 'resolved') || [];
        const pendingAlerts = record.alerts?.filter(a => !a.acknowledged) || [];
        
        return (
            <Grid item xs={12} sm={6} md={4} key={record._id}>
                <Card 
                    variant="outlined"
                    sx={{ 
                        height: '100%',
                        borderLeft: `4px solid ${healthColors[record.healthStatus]}`,
                        '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s'
                        }
                    }}
                >
                    <CardActionArea onClick={() => {
                        setSelectedCrop(record);
                        setDetailsOpen(true);
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        {record.cropName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {record.cropVariety} • {record.area} acres
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getHealthIcon(record.healthStatus)}
                                    <Typography 
                                        variant="caption" 
                                        fontWeight="bold"
                                        color={healthColors[record.healthStatus]}
                                    >
                                        {record.healthStatus.toUpperCase()}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                {growthStageIcons[record.growthStage] || growthStageIcons.default}
                                <Typography variant="body2" color="textSecondary">
                                    {record.growthStage} • Score: {record.healthScore}
                                </Typography>
                            </Box>
                            
                            {/* Active Issues */}
                            {activeIssues.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Active Issues:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {activeIssues.slice(0, 3).map((issue, index) => (
                                            <Chip
                                                key={index}
                                                label={issue.name}
                                                size="small"
                                                color={severityColors[issue.severity]}
                                                variant="outlined"
                                            />
                                        ))}
                                        {activeIssues.length > 3 && (
                                            <Chip
                                                label={`+${activeIssues.length - 3}`}
                                                size="small"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            )}
                            
                            {/* Pending Alerts */}
                            {pendingAlerts.length > 0 && (
                                <Alert severity="warning" sx={{ mb: 2, py: 0 }}>
                                    <Typography variant="caption">
                                        {pendingAlerts.length} pending alert{pendingAlerts.length > 1 ? 's' : ''}
                                    </Typography>
                                </Alert>
                            )}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="textSecondary">
                                    Last checked: {format(new Date(record.lastChecked), 'dd MMM')}
                                </Typography>
                                
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuClick(e, record);
                                    }}
                                >
                                    <MoreVert />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>
        );
    };

    const renderHealthOverview = () => {
        const healthData = [
            { status: 'Healthy', count: stats.healthy || 0, color: '#4CAF50' },
            { status: 'Warning', count: stats.warning || 0, color: '#FF9800' },
            { status: 'Critical', count: stats.critical || 0, color: '#F44336' }
        ].filter(item => item.count > 0);

        const issueData = cropHealthRecords.flatMap(record => 
            record.issues?.filter(i => i.status !== 'resolved') || []
        ).reduce((acc, issue) => {
            acc[issue.type] = (acc[issue.type] || 0) + 1;
            return acc;
        }, {});

        const issueChartData = Object.entries(issueData).map(([type, count]) => ({
            type,
            count,
            color: type === 'disease' ? '#F44336' : 
                   type === 'pest' ? '#FF9800' : 
                   type === 'nutrient_deficiency' ? '#2196F3' : '#757575'
        }));

        return (
            <Grid container spacing={3}>
                {/* Health Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Health Distribution
                        </Typography>
                        {healthData.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={healthData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {healthData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [value, 'Crops']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Typography color="textSecondary" align="center" sx={{ mt: 8 }}>
                                No health data available
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Issue Types */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Active Issue Types
                        </Typography>
                        {issueChartData.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={issueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="type" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="count" fill="#8884d8">
                                            {issueChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Typography color="textSecondary" align="center" sx={{ mt: 8 }}>
                                No active issues
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Crops Needing Attention */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Crops Needing Attention
                            </Typography>
                            <Badge badgeContent={stats.activeIssues || 0} color="error">
                                <Warning color="action" />
                            </Badge>
                        </Box>
                        
                        {cropHealthRecords.filter(r => r.healthStatus !== 'healthy').length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Crop</TableCell>
                                            <TableCell>Health Status</TableCell>
                                            <TableCell>Active Issues</TableCell>
                                            <TableCell>Growth Stage</TableCell>
                                            <TableCell>Last Checked</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cropHealthRecords
                                            .filter(r => r.healthStatus !== 'healthy')
                                            .slice(0, 5)
                                            .map((record) => (
                                                <TableRow key={record._id}>
                                                    <TableCell>
                                                        <Typography fontWeight="bold">
                                                            {record.cropName}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {record.fieldName || 'No field'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={record.healthStatus} 
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: `${healthColors[record.healthStatus]}15`,
                                                                color: healthColors[record.healthStatus]
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.issues?.filter(i => i.status !== 'resolved').length || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.growthStage}
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(record.lastChecked), 'dd MMM')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined"
                                                            onClick={() => {
                                                                setSelectedCrop(record);
                                                                setDetailsOpen(true);
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="success">
                                All crops are healthy! No attention needed.
                            </Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    const renderCropDetails = () => {
        if (!selectedCrop) return null;

        const activeIssues = selectedCrop.issues?.filter(i => i.status !== 'resolved') || [];
        const pendingAlerts = selectedCrop.alerts?.filter(a => !a.acknowledged) || [];

        return (
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">
                            {selectedCrop.cropName} - Health Details
                        </Typography>
                        <Box>
                            <IconButton onClick={() => {
                                setDetailsOpen(false);
                                setReportIssueOpen(true);
                            }}>
                                <Add />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                        <Tab label="Overview" value="overview" />
                        <Tab label="Issues" value="issues" />
                        <Tab label="Nutrients" value="nutrients" />
                        <Tab label="Alerts" value="alerts" />
                        <Tab label="History" value="history" />
                    </Tabs>

                    {activeTab === 'overview' && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Health Summary
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ 
                                                width: 80, 
                                                height: 80, 
                                                borderRadius: '50%',
                                                bgcolor: `${healthColors[selectedCrop.healthStatus]}15`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="h4" color={healthColors[selectedCrop.healthStatus]}>
                                                    {selectedCrop.healthScore}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="h6">
                                                    {selectedCrop.healthStatus.toUpperCase()}
                                                </Typography>
                                                <Typography color="textSecondary">
                                                    Growth: {selectedCrop.growthStage}
                                                </Typography>
                                                <Typography color="textSecondary">
                                                    Last checked: {format(new Date(selectedCrop.lastChecked), 'PP')}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" gutterBottom>
                                            Quick Stats
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Active Issues
                                                </Typography>
                                                <Typography variant="h6" color="error.main">
                                                    {activeIssues.length}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Pending Alerts
                                                </Typography>
                                                <Typography variant="h6" color="warning.main">
                                                    {pendingAlerts.length}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Active Issues
                                    </Typography>
                                    {activeIssues.length > 0 ? (
                                        <List>
                                            {activeIssues.map((issue, index) => (
                                                <React.Fragment key={index}>
                                                    <ListItem
                                                        secondaryAction={
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined"
                                                                onClick={() => {
                                                                    // View treatment options
                                                                }}
                                                            >
                                                                Treat
                                                            </Button>
                                                        }
                                                    >
                                                        <ListItemIcon>
                                                            {issue.type === 'disease' ? <LocalHospital /> :
                                                             issue.type === 'pest' ? <BugReport /> :
                                                             <Science />}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="body1" fontWeight="bold">
                                                                        {issue.name}
                                                                    </Typography>
                                                                    <Chip 
                                                                        label={issue.severity} 
                                                                        size="small"
                                                                        color={severityColors[issue.severity]}
                                                                    />
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box>
                                                                    <Typography variant="caption" display="block">
                                                                        Detected: {format(new Date(issue.detectedDate), 'dd MMM yyyy')}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        Affected area: {issue.affectedArea}%
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                    <Divider />
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    ) : (
                                        <Alert severity="success">
                                            No active issues. Crop is healthy!
                                        </Alert>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    )}

                    {activeTab === 'issues' && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">
                                    All Issues ({selectedCrop.issues?.length || 0})
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        setReportIssueOpen(true);
                                    }}
                                >
                                    Report New Issue
                                </Button>
                            </Box>
                            
                            {selectedCrop.issues && selectedCrop.issues.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Issue</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Severity</TableCell>
                                                <TableCell>Detected</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedCrop.issues.map((issue, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography fontWeight="bold">
                                                            {issue.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {issue.symptoms?.slice(0, 2).join(', ')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={issue.type} 
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={issue.severity} 
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: `${severityColors[issue.severity]}15`,
                                                                color: severityColors[issue.severity]
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(issue.detectedDate), 'dd MMM yy')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={issue.status} 
                                                            size="small"
                                                            color={issue.status === 'resolved' ? 'success' : 'warning'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="small">View</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <HealthAndSafety sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                    <Typography variant="h6" color="success.main">
                                        No Issues Reported
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                                        Your crop is healthy and free from issues
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => {
                                            setDetailsOpen(false);
                                            setReportIssueOpen(true);
                                        }}
                                    >
                                        Report First Issue
                                    </Button>
                                </Paper>
                            )}
                        </Box>
                    )}

                    {activeTab === 'nutrients' && (
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Nutrient Status
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(selectedCrop.nutrientStatus || {}).map(([nutrient, data]) => (
                                    <Grid item xs={12} sm={6} md={4} key={nutrient}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                                                </Typography>
                                                <Chip 
                                                    label={data.level} 
                                                    size="small"
                                                    color={
                                                        data.level === 'deficient' ? 'error' :
                                                        data.level === 'low' ? 'warning' :
                                                        data.level === 'adequate' ? 'success' : 'default'
                                                    }
                                                    sx={{ mb: 1 }}
                                                />
                                                {data.recommendedFertilizer && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        {data.recommendedFertilizer}: {data.dosage}
                                                    </Typography>
                                                )}
                                                {data.lastTested && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Tested: {format(new Date(data.lastTested), 'dd MMM yy')}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Check for Nutrient Deficiency
                                </Typography>
                                <Alert severity="info">
                                    Select symptoms to check for possible nutrient deficiencies
                                </Alert>
                                {/* Add symptom selection UI here */}
                            </Box>
                        </Paper>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Crop Health Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => setAiDiagnosisOpen(true)}
                    >
                        AI Diagnosis
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setReportIssueOpen(true)}
                    >
                        Report Issue
                    </Button>
                </Box>
            </Box>

            {renderStatsCards()}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Health Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Health Status"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="healthy">Healthy</MenuItem>
                                <MenuItem value="warning">Warning</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.needsAttention}
                                    onChange={(e) => handleFilterChange('needsAttention', e.target.checked)}
                                />
                            }
                            label="Show only crops needing attention"
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Tabs 
                            value={activeTab} 
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Overview" value="overview" />
                            <Tab label="All Crops" value="all" />
                            <Tab label="Critical" value="critical" />
                            <Tab label="History" value="history" />
                        </Tabs>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <LinearProgress />
            ) : activeTab === 'overview' ? (
                renderHealthOverview()
            ) : (
                <Grid container spacing={2}>
                    {cropHealthRecords.map(renderCropHealthCard)}
                    
                    {cropHealthRecords.length === 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <HealthAndSafety sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" color="primary.main">
                                    No Crop Health Records Found
                                </Typography>
                                <Typography color="textSecondary" sx={{ mb: 3 }}>
                                    Start by reporting the health status of your crops
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setReportIssueOpen(true)}
                                >
                                    Create First Record
                                </Button>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewDetails}>
                    <ListItemText primary="View Details" />
                </MenuItem>
                <MenuItem onClick={handleReportIssue}>
                    <ListItemText primary="Report Issue" />
                </MenuItem>
                <MenuItem onClick={handleAIDiagnosis}>
                    <ListItemText primary="AI Diagnosis" />
                </MenuItem>
                <Divider />
                <MenuItem>
                    <ListItemText primary="Health History" />
                </MenuItem>
                <MenuItem>
                    <ListItemText primary="Export Report" />
                </MenuItem>
            </Menu>

            {/* Issue Report Dialog */}
            <IssueReportForm
                open={reportIssueOpen}
                onClose={() => setReportIssueOpen(false)}
                crop={selectedCrop}
                onSuccess={() => {
                    setReportIssueOpen(false);
                    fetchCropHealthData();
                }}
            />

            {/* AI Diagnosis Dialog */}
            <AIDiagnosisDialog
                open={aiDiagnosisOpen}
                onClose={() => setAiDiagnosisOpen(false)}
                crop={selectedCrop}
            />

            {/* Crop Details Dialog */}
            {renderCropDetails()}

            {/* Floating Action Button for quick reporting */}
            <Fab
                color="primary"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => setReportIssueOpen(true)}
            >
                <Add />
            </Fab>
        </Container>
    );
};

export default CropHealthDashboard;
