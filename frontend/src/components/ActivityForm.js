import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Button,
    Chip,
    Autocomplete,
    Typography,
    IconButton,
    Paper,
    Divider
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { timelineService, cropService, workerService } from '../services/api';

const ACTIVITY_TYPES = [
    { value: 'sowing', label: '🌱 Sowing/Transplanting' },
    { value: 'irrigation', label: '💧 Irrigation' },
    { value: 'fertilizer', label: '🌿 Fertilizer Application' },
    { value: 'pesticide', label: '🧪 Pesticide/Herbicide' },
    { value: 'field_preparation', label: '🚜 Field Preparation' },
    { value: 'harvesting', label: '🌾 Harvesting' },
    { value: 'weeding', label: '🧹 Weeding' },
    { value: 'maintenance', label: '🛠 Equipment Maintenance' },
    { value: 'labor', label: '👷 Labor Work' },
    { value: 'payment', label: '💰 Payments/Wages' },
    { value: 'issue', label: '⚠️ Issue/Incident' }
];

const ActivityForm = ({ activity, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        description: '',
        plannedDate: new Date(),
        plannedStartTime: '08:00',
        plannedEndTime: '17:00',
        duration: 8,
        status: 'upcoming',
        priority: 'medium',
        crop: '',
        field: '',
        area: '',
        assignedTo: [],
        resources: [],
        costEstimate: 0,
        attachments: [],
        tags: []
    });

    const [crops, setCrops] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [resourceForm, setResourceForm] = useState({ name: '', quantity: '', unit: 'kg', cost: '' });

    useEffect(() => {
        if (activity) {
            setFormData(activity);
            if (activity.assignedTo) {
                setSelectedWorkers(activity.assignedTo);
            }
        }
        fetchCrops();
        fetchWorkers();
    }, [activity]);

    const fetchCrops = async () => {
        try {
            const response = await cropService.getCrops();
            // Handle if response is array or object with data
            setCrops(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Error fetching crops:', error);
        }
    };

    const fetchWorkers = async () => {
        try {
            const response = await workerService.getWorkers();
            setWorkers(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddResource = () => {
        if (resourceForm.name && resourceForm.quantity) {
            const newResource = {
                ...resourceForm,
                quantity: parseFloat(resourceForm.quantity),
                cost: parseFloat(resourceForm.cost) || 0
            };
            
            setFormData(prev => ({
                ...prev,
                resources: [...prev.resources, newResource]
            }));
            
            setResourceForm({ name: '', quantity: '', unit: 'kg', cost: '' });
        }
    };

    const handleRemoveResource = (index) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleAddWorker = (worker) => {
        if (worker && !selectedWorkers.find(w => w._id === worker._id)) {
            setSelectedWorkers(prev => [...prev, worker]);
            setFormData(prev => ({
                ...prev,
                assignedTo: [...prev.assignedTo, {
                    worker: worker._id,
                    workerName: worker.name,
                    role: 'worker',
                    hoursWorked: 0,
                    wage: 0
                }]
            }));
        }
    };

    const handleRemoveWorker = (workerId) => {
        setSelectedWorkers(prev => prev.filter(w => w._id !== workerId));
        setFormData(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.filter(a => a.worker !== workerId)
        }));
    };

    const handleSubmit = async () => {
        try {
            if (activity) {
                await timelineService.updateActivity(activity._id, formData);
            } else {
                await timelineService.createActivity(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving activity:', error);
        }
    };

    const totalCost = formData.resources.reduce((sum, r) => sum + (r.cost || 0), 0);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Activity Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Activity Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Activity Type"
                                onChange={(e) => handleChange('type', e.target.value)}
                            >
                                {ACTIVITY_TYPES.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </Grid>

                    {/* Schedule */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Schedule
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <DatePicker
                            label="Planned Date"
                            value={formData.plannedDate}
                            onChange={(date) => handleChange('plannedDate', date)}
                            renderInput={(params) => <TextField {...params} fullWidth required />}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            value={formData.plannedStartTime}
                            onChange={(e) => handleChange('plannedStartTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Duration (hours)"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => handleChange('duration', e.target.value)}
                        />
                    </Grid>

                    {/* Priority & Status */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={formData.priority}
                                label="Priority"
                                onChange={(e) => handleChange('priority', e.target.value)}
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <MenuItem value="upcoming">Upcoming</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Crop Association */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Crop & Field Association
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Crop</InputLabel>
                            <Select
                                value={formData.crop}
                                label="Select Crop"
                                onChange={(e) => handleChange('crop', e.target.value)}
                            >
                                <MenuItem value="">None</MenuItem>
                                {crops.map(crop => (
                                    <MenuItem key={crop._id} value={crop._id}>
                                        {crop.name} ({crop.variety}) - {crop.area} acres
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Field/Plot Name"
                            value={formData.field}
                            onChange={(e) => handleChange('field', e.target.value)}
                        />
                    </Grid>

                    {/* Worker Assignment */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Worker Assignment
                        </Typography>
                        <Autocomplete
                            options={workers}
                            getOptionLabel={(worker) => worker.name}
                            renderInput={(params) => (
                                <TextField {...params} label="Assign Workers" />
                            )}
                            onChange={(event, worker) => worker && handleAddWorker(worker)}
                        />
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedWorkers.map(worker => (
                                <Chip
                                    key={worker._id}
                                    label={worker.name}
                                    onDelete={() => handleRemoveWorker(worker._id)}
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Resource Management */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Resource Management
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Resource Name"
                                        value={resourceForm.name}
                                        onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Quantity"
                                        type="number"
                                        value={resourceForm.quantity}
                                        onChange={(e) => setResourceForm(prev => ({ ...prev, quantity: e.target.value }))}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Unit"
                                        value={resourceForm.unit}
                                        onChange={(e) => setResourceForm(prev => ({ ...prev, unit: e.target.value }))}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Cost (₹)"
                                        type="number"
                                        value={resourceForm.cost}
                                        onChange={(e) => setResourceForm(prev => ({ ...prev, cost: e.target.value }))}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={handleAddResource}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {formData.resources.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Added Resources (Total: ₹{totalCost})
                                </Typography>
                                <Grid container spacing={1}>
                                    {formData.resources.map((resource, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {resource.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {resource.quantity} {resource.unit} • ₹{resource.cost}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleRemoveResource(index)}
                                                        color="error"
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Grid>

                    {/* Cost Estimation */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Cost Estimation
                        </Typography>
                        <TextField
                            fullWidth
                            label="Estimated Cost (₹)"
                            type="number"
                            value={formData.costEstimate}
                            onChange={(e) => handleChange('costEstimate', parseFloat(e.target.value))}
                        />
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleSubmit}
                                disabled={!formData.title || !formData.type}
                            >
                                {activity ? 'Update Activity' : 'Create Activity'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default ActivityForm;
