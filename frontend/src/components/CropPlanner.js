import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    Box,
    Alert,
    Snackbar,
    List
} from '@mui/material';
import {
    Add,
    CalendarToday,
    WaterDrop,
    Grass,
    Spa,
    Timeline,
    CheckCircle,
    Schedule
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format, addDays, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

const CropPlanner = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [crops, setCrops] = useState([]);
    const [newCrop, setNewCrop] = useState({
        name: '',
        variety: '',
        season: '',
        landType: '',
        area: '',
        sowingDate: new Date(),
        expectedHarvestDate: null,
        soilType: 'loam',
        waterSource: 'rainfed'
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedLandType, setSelectedLandType] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [planDetails, setPlanDetails] = useState(null);
    const [annualTimeline, setAnnualTimeline] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const fetchCrops = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crops`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCrops(response.data);
        } catch (error) {
            console.error('Error fetching crops:', error);
            showSnackbar('Error loading crops', 'error');
        }
    }, [API_URL, showSnackbar]);

    const fetchAnnualTimeline = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const currentYear = new Date().getFullYear();
            const response = await axios.get(`${API_URL}/crops/timeline`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { year: currentYear }
            });
            setAnnualTimeline(response.data);
        } catch (error) {
            console.error('Error fetching timeline:', error);
        }
    }, [API_URL]);

    // Fetch existing crops and timeline
    useEffect(() => {
        fetchCrops();
        fetchAnnualTimeline();
    }, [fetchCrops, fetchAnnualTimeline]);

    const getCropRecommendations = useCallback(async () => {
        if (!selectedSeason || !selectedLandType) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crops/recommendations`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    season: selectedSeason,
                    soilType: selectedLandType 
                }
            });
            setRecommendations(response.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            showSnackbar('Error loading crop recommendations', 'error');
        }
    }, [API_URL, selectedSeason, selectedLandType, showSnackbar]);

    useEffect(() => {
        getCropRecommendations();
    }, [getCropRecommendations]);

    const calculateCropPlan = () => {
        if (!newCrop.name || !newCrop.area || !newCrop.sowingDate) {
            return null;
        }

        // Get crop requirements
        const selectedCrop = recommendations.find(c => c.name === newCrop.name);
        if (!selectedCrop) return null;

        const area = parseFloat(newCrop.area);
        const sowingDate = new Date(newCrop.sowingDate);
        const harvestDate = newCrop.expectedHarvestDate ? 
            new Date(newCrop.expectedHarvestDate) : 
            addDays(sowingDate, parseInt(selectedCrop.duration.split('-')[0]) || 120);

        // Calculate seed required
        const seedRequired = `${(selectedCrop.seedPerAcre * area).toFixed(2)} kg`;

        // Generate operations with dates
        const operations = (selectedCrop.operations || []).map(op => ({
            name: op.name,
            description: op.description || `Perform ${op.name} for ${newCrop.name}`,
            daysAfterSowing: op.daysAfterSowing,
            type: op.type,
            scheduledDate: addDays(sowingDate, op.daysAfterSowing)
        }));

        // Calculate total cost
        const costPerAcre = {
            'Wheat': 15000,
            'Rice': 20000,
            'Cotton': 25000,
            'default': 18000
        };
        const totalCost = (costPerAcre[newCrop.name] || costPerAcre['default']) * area;

        const plan = {
            crop: newCrop.name,
            variety: newCrop.variety,
            area: area,
            sowingDate: sowingDate.toISOString(),
            expectedHarvestDate: harvestDate.toISOString(),
            seedRequired: seedRequired,
            fertilizerRequired: selectedCrop.fertilizer,
            waterRequirement: selectedCrop.water,
            expectedYield: selectedCrop.yield,
            duration: selectedCrop.duration,
            totalCost: totalCost,
            operations: operations
        };

        setPlanDetails(plan);
        return plan;
    };

    const saveCropPlan = async () => {
        const plan = calculateCropPlan();
        if (!plan) {
            showSnackbar('Please complete all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crops`, {
                ...newCrop,
                area: parseFloat(newCrop.area),
                sowingDate: newCrop.sowingDate.toISOString(),
                expectedHarvestDate: newCrop.expectedHarvestDate?.toISOString(),
                planDetails: plan
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar('Crop plan saved successfully! Timeline events created.', 'success');
            
            // Refresh data
            await fetchCrops();
            await fetchAnnualTimeline();
            
            // Close dialog and reset
            setDialogOpen(false);
            resetForm();
            setActiveStep(0);
        } catch (error) {
            console.error('Error saving crop plan:', error);
            showSnackbar('Error saving crop plan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewCrop({
            name: '',
            variety: '',
            season: '',
            landType: '',
            area: '',
            sowingDate: new Date(),
            expectedHarvestDate: null,
            soilType: 'loam',
            waterSource: 'rainfed'
        });
        setPlanDetails(null);
        setSelectedSeason('');
        setSelectedLandType('');
        setRecommendations([]);
    };

    const handleInputChange = (field, value) => {
        setNewCrop(prev => ({
            ...prev,
            [field]: value
        }));

        // Auto-calculate harvest date
        if (field === 'name' && value && newCrop.sowingDate) {
            const selectedCrop = recommendations.find(c => c.name === value);
            if (selectedCrop) {
                const days = parseInt(selectedCrop.duration.split('-')[0]) || 120;
                const harvestDate = addDays(new Date(newCrop.sowingDate), days);
                setNewCrop(prev => ({
                    ...prev,
                    expectedHarvestDate: harvestDate
                }));
            }
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Season</InputLabel>
                                <Select
                                    value={selectedSeason}
                                    label="Season"
                                    onChange={(e) => {
                                        setSelectedSeason(e.target.value);
                                        handleInputChange('season', e.target.value);
                                    }}
                                >
                                    <MenuItem value="rabi">Rabi (Winter: Oct-Mar)</MenuItem>
                                    <MenuItem value="kharif">Kharif (Monsoon: Jun-Nov)</MenuItem>
                                    <MenuItem value="zaid">Zaid (Summer: Mar-Jun)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Land Type</InputLabel>
                                <Select
                                    value={selectedLandType}
                                    label="Land Type"
                                    onChange={(e) => {
                                        setSelectedLandType(e.target.value);
                                        handleInputChange('landType', e.target.value);
                                    }}
                                >
                                    <MenuItem value="sandy">Sandy Soil</MenuItem>
                                    <MenuItem value="loam">Loam Soil</MenuItem>
                                    <MenuItem value="clay">Clay Soil</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {selectedSeason && selectedLandType && recommendations.length > 0 && (
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Recommended crops for {selectedSeason.toUpperCase()} season in {selectedLandType} soil:
                                </Alert>
                                <Grid container spacing={2}>
                                    {recommendations.map((crop, index) => (
                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                            <Card 
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    border: newCrop.name === crop.name ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                                                    '&:hover': { borderColor: '#4CAF50', transform: 'translateY(-2px)' },
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => handleInputChange('name', crop.name)}
                                            >
                                                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                                    {crop.name === 'Rice' && <WaterDrop sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />}
                                                    {crop.name === 'Wheat' && <Grass sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />}
                                                    {crop.name === 'Cotton' && <Spa sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />}
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                        {crop.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                        Yield: {crop.yield}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                        Duration: {crop.duration}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                );

            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Crop Name"
                                value={newCrop.name}
                                disabled
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Variety"
                                value={newCrop.variety}
                                onChange={(e) => handleInputChange('variety', e.target.value)}
                                sx={{ mb: 2 }}
                                placeholder="e.g., HD-2967, Pusa-44"
                            />
                            <TextField
                                fullWidth
                                label="Area (acres)"
                                type="number"
                                value={newCrop.area}
                                onChange={(e) => handleInputChange('area', e.target.value)}
                                sx={{ mb: 2 }}
                                InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                            />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Water Source</InputLabel>
                                <Select
                                    value={newCrop.waterSource}
                                    label="Water Source"
                                    onChange={(e) => handleInputChange('waterSource', e.target.value)}
                                >
                                    <MenuItem value="rainfed">Rainfed</MenuItem>
                                    <MenuItem value="canal">Canal Irrigation</MenuItem>
                                    <MenuItem value="tube-well">Tube Well</MenuItem>
                                    <MenuItem value="drip">Drip Irrigation</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Sowing Date"
                                    value={newCrop.sowingDate}
                                    onChange={(date) => handleInputChange('sowingDate', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                                />
                                <DatePicker
                                    label="Expected Harvest Date"
                                    value={newCrop.expectedHarvestDate}
                                    onChange={(date) => handleInputChange('expectedHarvestDate', date)}
                                    minDate={newCrop.sowingDate}
                                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                                />
                            </LocalizationProvider>
                            {newCrop.name && recommendations.find(c => c.name === newCrop.name) && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Requirements:</strong><br />
                                        • {recommendations.find(c => c.name === newCrop.name).fertilizer}<br />
                                        • Water: {recommendations.find(c => c.name === newCrop.name).water}<br />
                                        • Duration: {recommendations.find(c => c.name === newCrop.name).duration}
                                    </Typography>
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                );

            case 2:
                const plan = calculateCropPlan();
                return plan ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Crop Plan Summary
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Basic Information
                                    </Typography>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><strong>Crop</strong></TableCell>
                                                <TableCell>{plan.crop} ({plan.variety})</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Area</strong></TableCell>
                                                <TableCell>{plan.area} acres</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Season</strong></TableCell>
                                                <TableCell>{newCrop.season?.toUpperCase()}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Sowing Date</strong></TableCell>
                                                <TableCell>{format(new Date(plan.sowingDate), 'dd MMM yyyy')}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Harvest Date</strong></TableCell>
                                                <TableCell>{format(new Date(plan.expectedHarvestDate), 'dd MMM yyyy')}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Resource Requirements
                                    </Typography>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell><strong>Seed Required</strong></TableCell>
                                                <TableCell>{plan.seedRequired}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Fertilizer</strong></TableCell>
                                                <TableCell>{plan.fertilizerRequired}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Water Requirement</strong></TableCell>
                                                <TableCell>{plan.waterRequirement}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Expected Yield</strong></TableCell>
                                                <TableCell>{plan.expectedYield}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>Estimated Cost</strong></TableCell>
                                                <TableCell>₹{plan.totalCost.toLocaleString()}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Operation Timeline (Generated Automatically)
                                    </Typography>
                                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                        {plan.operations.map((op, index) => (
                                            <Card key={index} variant="outlined" sx={{ mb: 1, p: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {op.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {format(new Date(op.scheduledDate), 'dd MMM yyyy')} • {op.type}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label="Upcoming" 
                                                        size="small" 
                                                        color="info"
                                                        icon={<Schedule />}
                                                    />
                                                </Box>
                                            </Card>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="success">
                                <Typography variant="body2">
                                    <strong>Note:</strong> This plan will automatically create {plan.operations.length} timeline events 
                                    in your annual calendar after saving.
                                </Typography>
                            </Alert>
                        </Grid>
                    </Grid>
                ) : (
                    <Alert severity="warning">
                        Please complete all required fields to generate the plan.
                    </Alert>
                );

            default:
                return null;
        }
    };

    // Render Annual Timeline
    const renderAnnualTimeline = () => {
        if (!annualTimeline.monthlyTimeline) return null;

        const months = eachMonthOfInterval({
            start: startOfYear(new Date()),
            end: endOfYear(new Date())
        });

        return (
            <Paper sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Annual Timeline ({new Date().getFullYear()})
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Total Events: {annualTimeline.stats?.totalEvents || 0}
                    </Typography>
                </Box>
                
                <Grid container spacing={2}>
                    {months.map((month, index) => {
                        const monthKey = format(month, 'MMM');
                        const events = annualTimeline.monthlyTimeline?.[monthKey] || [];
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" color="primary" gutterBottom>
                                            {monthKey}
                                        </Typography>
                                        {events.length > 0 ? (
                                            <Box>
                                                {events.slice(0, 3).map((event, idx) => (
                                                    <Box key={idx} sx={{ mb: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                                            {event.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                            {format(new Date(event.date), 'dd')} • {event.type}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                                {events.length > 3 && (
                                                    <Typography variant="caption" color="primary">
                                                        +{events.length - 3} more events
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">
                                                No events scheduled
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                
                {/* Timeline Visualization */}
                {annualTimeline.events && annualTimeline.events.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Upcoming Events Timeline
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={annualTimeline.events.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(date) => format(new Date(date), 'dd MMM')}
                                    />
                                    <YAxis />
                                    <RechartsTooltip 
                                        labelFormatter={(date) => format(new Date(date), 'dd MMM yyyy')}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="status" 
                                        stroke="#8884d8" 
                                        name="Event Status"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                )}
            </Paper>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Crop Planner & Timeline Manager
            </Typography>

            <Grid container spacing={3}>
                {/* Main Planning Section */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h5">
                                    Crop Planning
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Plan your crops and automatically generate farming timeline
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setDialogOpen(true)}
                            >
                                New Crop Plan
                            </Button>
                        </Box>

                        {/* Existing Crop Plans */}
                        <Typography variant="h6" gutterBottom>
                            Your Crop Plans ({crops.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Crop</TableCell>
                                        <TableCell>Season</TableCell>
                                        <TableCell>Area</TableCell>
                                        <TableCell>Sowing Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Timeline Events</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {crops.map((crop) => (
                                        <TableRow key={crop._id || crop.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {crop.name === 'Rice' && <WaterDrop sx={{ mr: 1, color: 'primary.main' }} />}
                                                    {crop.name === 'Wheat' && <Grass sx={{ mr: 1, color: 'success.main' }} />}
                                                    {crop.name === 'Cotton' && <Spa sx={{ mr: 1, color: 'info.main' }} />}
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {crop.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {crop.variety}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={crop.season?.toUpperCase()} 
                                                    size="small"
                                                    color={crop.season === 'rabi' ? 'primary' : crop.season === 'kharif' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>{crop.area} acres</TableCell>
                                            <TableCell>
                                                {format(new Date(crop.sowingDate), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={crop.status} 
                                                    size="small"
                                                    color={
                                                        crop.status === 'growing' ? 'success' :
                                                        crop.status === 'harvested' ? 'warning' :
                                                        crop.status === 'planned' ? 'info' : 'default'
                                                    }
                                                    icon={crop.status === 'planned' ? <Schedule /> : <CheckCircle />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<Timeline />}
                                                    onClick={() => {
                                                        // View timeline events for this crop
                                                    }}
                                                >
                                                    View Events
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Annual Timeline Section */}
                    {renderAnnualTimeline()}
                </Grid>

                {/* Sidebar - Statistics */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Crop Distribution
                        </Typography>
                        {crops.length > 0 ? (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={crops.map(crop => ({
                                                name: crop.name,
                                                value: crop.area,
                                                color: crop.status === 'growing' ? '#4CAF50' : 
                                                       crop.status === 'harvested' ? '#FF9800' : '#2196F3'
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {crops.map((entry, index) => (
                                                <Cell key={`cell-${index}`} 
                                                    fill={
                                                        entry.status === 'growing' ? '#4CAF50' : 
                                                        entry.status === 'harvested' ? '#FF9800' : '#2196F3'
                                                    } 
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [`${value} acres`, 'Area']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        ) : (
                            <Alert severity="info">
                                No crops planned yet. Create your first crop plan!
                            </Alert>
                        )}
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Stats
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography color="textSecondary" variant="caption">
                                            Total Area
                                        </Typography>
                                        <Typography variant="h5">
                                            {crops.reduce((sum, crop) => sum + (parseFloat(crop.area) || 0), 0).toFixed(1)} acres
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography color="textSecondary" variant="caption">
                                            Active Crops
                                        </Typography>
                                        <Typography variant="h5">
                                            {crops.filter(c => c.status === 'growing').length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography color="textSecondary" variant="caption">
                                            Total Cost
                                        </Typography>
                                        <Typography variant="h5">
                                            ₹{crops.reduce((sum, crop) => sum + (crop.plan?.totalCost || 0), 0).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card variant="outlined">
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography color="textSecondary" variant="caption">
                                            Timeline Events
                                        </Typography>
                                        <Typography variant="h5">
                                            {annualTimeline.stats?.totalEvents || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Crop Rotation Suggestions
                        </Typography>
                        <List dense>
                            {[
                                { crop1: 'Wheat', crop2: 'Rice', crop3: 'Legumes', benefit: 'Improves soil nitrogen' },
                                { crop1: 'Cotton', crop2: 'Wheat', crop3: 'Mustard', benefit: 'Breaks pest cycle' },
                                { crop1: 'Rice', crop2: 'Vegetables', crop3: 'Pulses', benefit: 'Diversifies income' }
                            ].map((rotation, index) => (
                                <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="caption" fontWeight="bold">
                                            {rotation.crop1} → {rotation.crop2} → {rotation.crop3}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                            {rotation.benefit}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog for New Crop Plan */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => {
                    if (!loading) {
                        setDialogOpen(false);
                        resetForm();
                        setActiveStep(0);
                    }
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Create New Crop Plan
                    {planDetails && (
                        <Typography variant="caption" color="primary" sx={{ ml: 2 }}>
                            {planDetails.crop} - {planDetails.area} acres
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={activeStep} sx={{ my: 3 }}>
                        {['Select Crop', 'Set Details', 'Review Plan', 'Save'].map((label, index) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {renderStepContent(activeStep)}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => {
                            if (activeStep > 0) {
                                setActiveStep(activeStep - 1);
                            } else {
                                setDialogOpen(false);
                                resetForm();
                            }
                        }}
                        disabled={loading}
                    >
                        {activeStep === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (activeStep < 3) {
                                setActiveStep(activeStep + 1);
                            } else {
                                saveCropPlan();
                            }
                        }}
                        disabled={
                            loading || 
                            (activeStep === 2 && !calculateCropPlan()) ||
                            (activeStep === 0 && (!selectedSeason || !selectedLandType))
                        }
                    >
                        {loading ? 'Saving...' : 
                         activeStep === 3 ? 'Save Crop Plan' : 'Next'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    severity={snackbar.severity} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CropPlanner;