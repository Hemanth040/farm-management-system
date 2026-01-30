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
    Typography,
    FormControlLabel,
    Checkbox,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { resourcesService } from '../services/api';

const ResourceForm = ({ resource, onSuccess, onCancel }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        category: 'seeds',
        description: '',
        brand: '',
        specification: '',
        unit: 'kg',
        totalQuantity: 0,
        minimumThreshold: 0,
        location: 'store_room',
        costPerUnit: 0,
        purchaseDate: new Date(),
        expiryDate: null,
        isEquipment: false,
        equipmentType: '',
        warrantyPeriod: 0,
        safetyInstructions: [],
        isHazardous: false
    });

    const steps = ['Basic Info', 'Inventory', 'Cost & Safety', 'Review'];

    const categories = [
        { value: 'seeds', label: '🌱 Seeds' },
        { value: 'fertilizers', label: '🧪 Fertilizers' },
        { value: 'pesticides', label: '🐛 Pesticides' },
        { value: 'herbicides', label: '🌿 Herbicides' },
        { value: 'equipment', label: '🚜 Equipment' },
        { value: 'machinery', label: '⚙️ Machinery' },
        { value: 'water', label: '💧 Water' },
        { value: 'fuel', label: '⛽ Fuel' },
        { value: 'electricity', label: '⚡ Electricity' },
        { value: 'storage', label: '📦 Storage' },
        { value: 'tools', label: '🔧 Tools' },
        { value: 'other', label: '📦 Other' }
    ];

    const units = ['kg', 'g', 'liters', 'ml', 'bags', 'packets', 'units', 'pieces', 'boxes', 'hours'];

    useEffect(() => {
        if (resource) {
            setFormData({
                name: resource.name || '',
                category: resource.category || 'seeds',
                description: resource.description || '',
                brand: resource.brand || '',
                specification: resource.specification || '',
                unit: resource.unit || 'kg',
                totalQuantity: resource.totalQuantity || 0,
                minimumThreshold: resource.minimumThreshold || 0,
                location: resource.location || 'store_room',
                costPerUnit: resource.costPerUnit || 0,
                purchaseDate: resource.purchaseDate ? new Date(resource.purchaseDate) : new Date(),
                expiryDate: resource.expiryDate ? new Date(resource.expiryDate) : null,
                isEquipment: resource.isEquipment || false,
                equipmentType: resource.equipmentType || '',
                warrantyPeriod: resource.warrantyPeriod || 0,
                safetyInstructions: resource.safetyInstructions || [],
                isHazardous: resource.isHazardous || false
            });
        }
    }, [resource]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (resource) {
                await resourcesService.updateResource(resource._id, formData);
            } else {
                await resourcesService.createResource(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving resource:', error);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Resource Name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Category"
                                    onChange={(e) => handleChange('category', e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <MenuItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Brand"
                                value={formData.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                            />
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
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Specification"
                                value={formData.specification}
                                onChange={(e) => handleChange('specification', e.target.value)}
                                placeholder="e.g., Grade, Composition, Model Number"
                            />
                        </Grid>
                    </Grid>
                );
                
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Unit</InputLabel>
                                <Select
                                    value={formData.unit}
                                    label="Unit"
                                    onChange={(e) => handleChange('unit', e.target.value)}
                                >
                                    {units.map(unit => (
                                        <MenuItem key={unit} value={unit}>
                                            {unit}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Total Quantity"
                                type="number"
                                value={formData.totalQuantity}
                                onChange={(e) => handleChange('totalQuantity', parseFloat(e.target.value))}
                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Minimum Threshold"
                                type="number"
                                value={formData.minimumThreshold}
                                onChange={(e) => handleChange('minimumThreshold', parseFloat(e.target.value))}
                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                helperText="Alert when stock goes below this"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Location</InputLabel>
                                <Select
                                    value={formData.location}
                                    label="Location"
                                    onChange={(e) => handleChange('location', e.target.value)}
                                >
                                    <MenuItem value="store_room">Store Room</MenuItem>
                                    <MenuItem value="field">Field</MenuItem>
                                    <MenuItem value="godown">Godown</MenuItem>
                                    <MenuItem value="cold_storage">Cold Storage</MenuItem>
                                    <MenuItem value="pump_house">Pump House</MenuItem>
                                    <MenuItem value="shed">Shed</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isEquipment}
                                        onChange={(e) => handleChange('isEquipment', e.target.checked)}
                                    />
                                }
                                label="This is equipment/machinery"
                            />
                        </Grid>
                        
                        {formData.isEquipment && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Equipment Type"
                                    value={formData.equipmentType}
                                    onChange={(e) => handleChange('equipmentType', e.target.value)}
                                    placeholder="e.g., Tractor, Sprayer, Pump"
                                />
                            </Grid>
                        )}
                    </Grid>
                );
                
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Cost per Unit (₹)"
                                type="number"
                                value={formData.costPerUnit}
                                onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value))}
                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Purchase Date"
                                    value={formData.purchaseDate}
                                    onChange={(date) => handleChange('purchaseDate', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Expiry Date"
                                    value={formData.expiryDate}
                                    onChange={(date) => handleChange('expiryDate', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Warranty Period (months)"
                                type="number"
                                value={formData.warrantyPeriod}
                                onChange={(e) => handleChange('warrantyPeriod', parseInt(e.target.value))}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isHazardous}
                                        onChange={(e) => handleChange('isHazardous', e.target.checked)}
                                    />
                                }
                                label="This is a hazardous material"
                            />
                        </Grid>
                        
                        {formData.isHazardous && (
                            <Grid item xs={12}>
                                <Alert severity="warning">
                                    Please ensure proper storage and handling of hazardous materials
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                );
                
            case 3:
                const totalCost = formData.costPerUnit * formData.totalQuantity;
                
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Resource Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Basic Information
                                </Typography>
                                <Typography>{formData.name}</Typography>
                                <Typography color="textSecondary">
                                    {formData.category} • {formData.brand}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Inventory
                                </Typography>
                                <Typography>
                                    {formData.totalQuantity} {formData.unit}
                                </Typography>
                                <Typography color="textSecondary">
                                    Min threshold: {formData.minimumThreshold} {formData.unit}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Cost
                                </Typography>
                                <Typography>
                                    ₹{formData.costPerUnit} per {formData.unit}
                                </Typography>
                                <Typography color="textSecondary">
                                    Total value: ₹{totalCost.toLocaleString()}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Safety
                                </Typography>
                                <Typography color={formData.isHazardous ? 'warning.main' : 'textSecondary'}>
                                    {formData.isHazardous ? 'Hazardous Material' : 'Safe'}
                                </Typography>
                                {formData.expiryDate && (
                                    <Typography color="textSecondary">
                                        Expires: {new Date(formData.expiryDate).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                        
                        {formData.description && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Description
                                </Typography>
                                <Typography>{formData.description}</Typography>
                            </Box>
                        )}
                    </Box>
                );
                
            default:
                return null;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                
                {renderStepContent(activeStep)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(activeStep - 1)}
                    >
                        Back
                    </Button>
                    
                    <Box>
                        {activeStep < steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={() => setActiveStep(activeStep + 1)}
                                disabled={!formData.name || !formData.category}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!formData.name || !formData.category}
                            >
                                {resource ? 'Update Resource' : 'Create Resource'}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default ResourceForm;
