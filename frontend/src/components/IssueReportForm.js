import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    Chip,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Slider,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import {
    Close,
    CloudUpload,
    BugReport,
    LocalHospital,
    Science,
    Grass,
    CheckCircle
} from '@mui/icons-material';
import { cropHealthService } from '../services/api';

const IssueReportForm = ({ open, onClose, crop, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        type: 'disease',
        name: '',
        symptoms: [],
        severity: 'medium',
        affectedArea: 10,
        description: '',
        images: []
    });
    const [possibleDiseases, setPossibleDiseases] = useState([]);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [uploading, setUploading] = useState(false);

    const steps = ['Basic Info', 'Symptoms', 'Severity', 'Review'];

    const issueTypes = [
        { value: 'disease', label: 'Disease', icon: <LocalHospital /> },
        { value: 'pest', label: 'Pest', icon: <BugReport /> },
        { value: 'nutrient_deficiency', label: 'Nutrient Deficiency', icon: <Science /> },
        { value: 'weed', label: 'Weed', icon: <Grass /> },
        { value: 'other', label: 'Other', icon: <LocalHospital /> }
    ];

    const commonSymptoms = [
        'Yellowing leaves',
        'Brown spots',
        'Wilting',
        'Stunted growth',
        'Leaf curling',
        'Holes in leaves',
        'White powdery coating',
        'Purple leaves',
        'Fruit drop',
        'Root rot',
        'Leaf discoloration',
        'Leaf drop',
        'Distorted growth',
        'Sticky residue',
        'Webbing'
    ];

    const searchPossibleDiseases = async () => {
        try {
            const response = await cropHealthService.searchDiseases(
                formData.symptoms,
                crop.cropName
            );
            setPossibleDiseases(response.slice(0, 3));
        } catch (error) {
            console.error('Error searching diseases:', error);
        }
    };

    useEffect(() => {
        if (formData.symptoms.length > 0 && crop) {
            searchPossibleDiseases();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.symptoms, crop]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSymptomToggle = (symptom) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        // Simulate upload
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, {
                    url: URL.createObjectURL(file),
                    filename: file.name,
                    uploadedAt: new Date()
                }]
            }));
            setUploading(false);
        }, 1000);
    };

    const handleSubmit = async () => {
        try {
            await cropHealthService.reportIssue(crop._id, {
                ...formData,
                name: selectedDisease?.name || formData.name || 'Unknown Issue'
            });
            onSuccess();
        } catch (error) {
            console.error('Error reporting issue:', error);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                What type of issue are you reporting?
                            </Typography>
                            <RadioGroup
                                row
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                            >
                                {issueTypes.map(type => (
                                    <FormControlLabel
                                        key={type.value}
                                        value={type.value}
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {type.icon}
                                                {type.label}
                                            </Box>
                                        }
                                    />
                                ))}
                            </RadioGroup>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Issue Name (Optional)"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Aphid infestation, Blast disease"
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
                                placeholder="Describe what you're seeing in your crop..."
                            />
                        </Grid>
                    </Grid>
                );
                
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Select observed symptoms
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {commonSymptoms.map(symptom => (
                                    <Chip
                                        key={symptom}
                                        label={symptom}
                                        clickable
                                        color={formData.symptoms.includes(symptom) ? 'primary' : 'default'}
                                        onClick={() => handleSymptomToggle(symptom)}
                                        variant={formData.symptoms.includes(symptom) ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Box>
                            
                            <TextField
                                fullWidth
                                label="Additional symptoms (comma separated)"
                                placeholder="Add symptoms not listed above"
                                onChange={(e) => {
                                    const newSymptoms = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                    handleChange('symptoms', [...new Set([...formData.symptoms, ...newSymptoms])]);
                                }}
                            />
                        </Grid>
                        
                        {possibleDiseases.length > 0 && (
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Based on symptoms, possible issues detected
                                </Alert>
                                <Grid container spacing={2}>
                                    {possibleDiseases.map((disease, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Card 
                                                variant="outlined"
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    border: selectedDisease?.name === disease.name ? '2px solid #4CAF50' : '1px solid #e0e0e0'
                                                }}
                                                onClick={() => setSelectedDisease(disease)}
                                            >
                                                <CardContent>
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        {disease.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {disease.type} • {disease.riskLevel} risk
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}
                        
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Upload Photos (Optional)
                            </Typography>
                            <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageUpload}
                                />
                                <label htmlFor="image-upload">
                                    <IconButton component="span" disabled={uploading}>
                                        <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
                                    </IconButton>
                                </label>
                                <Typography color="textSecondary">
                                    Click to upload or drag and drop
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    JPG, PNG up to 5MB
                                </Typography>
                            </Box>
                            
                            {formData.images.length > 0 && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {formData.images.map((image, index) => (
                                        <Box key={index} sx={{ position: 'relative' }}>
                                            <img
                                                src={image.url}
                                                alt={image.filename}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                                                onClick={() => handleChange('images', formData.images.filter((_, i) => i !== index))}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                );
                
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                How severe is the issue?
                            </Typography>
                            <RadioGroup
                                value={formData.severity}
                                onChange={(e) => handleChange('severity', e.target.value)}
                            >
                                <FormControlLabel 
                                    value="low" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography>Low Severity</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Minor issue, affecting less than 10% of crop
                                            </Typography>
                                        </Box>
                                    } 
                                />
                                <FormControlLabel 
                                    value="medium" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography>Medium Severity</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Significant issue, affecting 10-30% of crop
                                            </Typography>
                                        </Box>
                                    } 
                                />
                                <FormControlLabel 
                                    value="high" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography>High Severity</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Serious issue, affecting 30-60% of crop
                                            </Typography>
                                        </Box>
                                    } 
                                />
                                <FormControlLabel 
                                    value="critical" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography>Critical Severity</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Emergency, affecting more than 60% of crop
                                            </Typography>
                                        </Box>
                                    } 
                                />
                            </RadioGroup>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Affected Area: {formData.affectedArea}%
                            </Typography>
                            <Slider
                                value={formData.affectedArea}
                                onChange={(e, value) => handleChange('affectedArea', value)}
                                min={1}
                                max={100}
                                valueLabelDisplay="auto"
                                marks={[
                                    { value: 10, label: '10%' },
                                    { value: 30, label: '30%' },
                                    { value: 60, label: '60%' },
                                    { value: 100, label: '100%' }
                                ]}
                            />
                        </Grid>
                    </Grid>
                );
                
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Issue Report
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Basic Information
                                </Typography>
                                <Typography>
                                    {selectedDisease?.name || formData.name || 'Unnamed Issue'}
                                </Typography>
                                <Typography color="textSecondary">
                                    Type: {formData.type} • Severity: {formData.severity}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Impact
                                </Typography>
                                <Typography>
                                    Affected Area: {formData.affectedArea}%
                                </Typography>
                                <Typography color="textSecondary">
                                    Symptoms: {formData.symptoms.slice(0, 3).join(', ')}
                                    {formData.symptoms.length > 3 && '...'}
                                </Typography>
                            </Grid>
                            
                            {selectedDisease && (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        <Typography variant="subtitle2">
                                            Auto-detected: {selectedDisease.name}
                                        </Typography>
                                        <Typography variant="body2">
                                            Recommended treatment: {selectedDisease.treatments?.[0] || 'Consult agriculture officer'}
                                        </Typography>
                                    </Alert>
                                </Grid>
                            )}
                            
                            {formData.description && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Description
                                    </Typography>
                                    <Typography>{formData.description}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                );
                
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Report Crop Issue
                {crop && (
                    <Typography variant="caption" display="block" color="textSecondary">
                        Crop: {crop.cropName} • Field: {crop.fieldName || 'Not specified'}
                    </Typography>
                )}
            </DialogTitle>
            
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ my: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                
                {renderStepContent(activeStep)}
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(activeStep - 1)}
                >
                    Back
                </Button>
                
                <Box sx={{ flexGrow: 1 }} />
                
                {activeStep < steps.length - 1 ? (
                    <Button
                        variant="contained"
                        onClick={() => setActiveStep(activeStep + 1)}
                        disabled={formData.symptoms.length === 0}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        startIcon={<CheckCircle />}
                    >
                        Submit Report
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default IssueReportForm;
