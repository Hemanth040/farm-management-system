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
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { financialService, cropService } from '../services/api';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { format } from 'date-fns';

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [crops, setCrops] = useState([]);
    const [formData, setFormData] = useState({
        type: 'expense',
        description: '',
        amount: 0,
        transactionDate: new Date(),
        category: 'seeds',
        source: 'crop_sale',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        dueDate: null,
        crop: '',
        party: {
            name: '',
            type: 'vendor'
        },
        notes: ''
    });

    const steps = ['Basic Info', 'Details', 'Review'];
    
    const expenseCategories = [
        { value: 'seeds', label: '🌱 Seeds' },
        { value: 'fertilizers', label: '🧪 Fertilizers' },
        { value: 'pesticides', label: '🐛 Pesticides' },
        { value: 'labor', label: '👷 Labor' },
        { value: 'equipment_fuel', label: '⛽ Equipment Fuel' },
        { value: 'equipment_repair', label: '🔧 Equipment Repair' },
        { value: 'irrigation', label: '💧 Irrigation' },
        { value: 'electricity', label: '⚡ Electricity' },
        { value: 'transport', label: '🚚 Transport' },
        { value: 'other', label: '📦 Other' }
    ];
    
    const incomeSources = [
        { value: 'crop_sale', label: '🌾 Crop Sale' },
        { value: 'livestock_sale', label: '🐄 Livestock Sale' },
        { value: 'dairy', label: '🥛 Dairy' },
        { value: 'poultry', label: '🐓 Poultry' },
        { value: 'government_subsidy', label: '🏛️ Government Subsidy' },
        { value: 'other', label: '📦 Other' }
    ];
    
    const paymentMethods = [
        { value: 'cash', label: '💵 Cash' },
        { value: 'upi', label: '📱 UPI' },
        { value: 'bank_transfer', label: '🏦 Bank Transfer' },
        { value: 'cheque', label: '📝 Cheque' },
        { value: 'credit', label: '💳 Credit' }
    ];

    useEffect(() => {
        fetchCrops();
        if (transaction) {
            setFormData({
                type: transaction.type || 'expense',
                description: transaction.description || '',
                amount: transaction.amount || 0,
                transactionDate: transaction.transactionDate ? new Date(transaction.transactionDate) : new Date(),
                category: transaction.category || 'seeds',
                source: transaction.source || 'crop_sale',
                paymentMethod: transaction.paymentMethod || 'cash',
                paymentStatus: transaction.paymentStatus || 'pending',
                dueDate: transaction.dueDate ? new Date(transaction.dueDate) : null,
                crop: transaction.crop?._id || '',
                party: transaction.party || { name: '', type: 'vendor' },
                notes: transaction.notes || ''
            });
        }
    }, [transaction]);

    const fetchCrops = async () => {
        try {
            const response = await cropService.getCrops();
            setCrops(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching crops:', error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePartyChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            party: { ...prev.party, [field]: value }
        }));
    };

    const handleSubmit = async () => {
        try {
            if (transaction) {
                await financialService.updateTransaction(transaction._id, formData);
            } else {
                await financialService.createTransaction(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const renderBasicInfo = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FormControl component="fieldset">
                    <Typography variant="subtitle2" gutterBottom>
                        Transaction Type
                    </Typography>
                    <RadioGroup
                        row
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                    >
                        <FormControlLabel 
                            value="income" 
                            control={<Radio />} 
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ArrowUpward color="success" />
                                    Income
                                </Box>
                            } 
                        />
                        <FormControlLabel 
                            value="expense" 
                            control={<Radio />} 
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ArrowDownward color="error" />
                                    Expense
                                </Box>
                            } 
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
            
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Amount (₹)"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    required
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Transaction Date"
                        value={formData.transactionDate}
                        onChange={(date) => handleChange('transactionDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                </LocalizationProvider>
            </Grid>
        </Grid>
    );

    const renderDetails = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                {formData.type === 'expense' ? (
                    <FormControl fullWidth required>
                        <InputLabel>Expense Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Expense Category"
                            onChange={(e) => handleChange('category', e.target.value)}
                        >
                            {expenseCategories.map(cat => (
                                <MenuItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <FormControl fullWidth required>
                        <InputLabel>Income Source</InputLabel>
                        <Select
                            value={formData.source}
                            label="Income Source"
                            onChange={(e) => handleChange('source', e.target.value)}
                        >
                            {incomeSources.map(src => (
                                <MenuItem key={src.value} value={src.value}>
                                    {src.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Grid>
            
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                        value={formData.paymentMethod}
                        label="Payment Method"
                        onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    >
                        {paymentMethods.map(method => (
                            <MenuItem key={method.value} value={method.value}>
                                {method.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        value={formData.paymentStatus}
                        label="Payment Status"
                        onChange={(e) => handleChange('paymentStatus', e.target.value)}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="partial">Partial</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Due Date (Optional)"
                        value={formData.dueDate}
                        onChange={(date) => handleChange('dueDate', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Linked Crop (Optional)</InputLabel>
                    <Select
                        value={formData.crop}
                        label="Linked Crop (Optional)"
                        onChange={(e) => handleChange('crop', e.target.value)}
                    >
                        <MenuItem value="">None</MenuItem>
                        {crops.map(crop => (
                            <MenuItem key={crop._id} value={crop._id}>
                                {crop.name} ({crop.variety})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Party Name"
                    value={formData.party.name}
                    onChange={(e) => handlePartyChange('name', e.target.value)}
                    placeholder={formData.type === 'income' ? 'Buyer name' : 'Vendor name'}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Party Type</InputLabel>
                    <Select
                        value={formData.party.type}
                        label="Party Type"
                        onChange={(e) => handlePartyChange('type', e.target.value)}
                    >
                        <MenuItem value="buyer">Buyer</MenuItem>
                        <MenuItem value="seller">Seller</MenuItem>
                        <MenuItem value="vendor">Vendor</MenuItem>
                        <MenuItem value="worker">Worker</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Notes (Optional)"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                />
            </Grid>
        </Grid>
    );

    const renderReview = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Review Transaction
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Basic Information
                    </Typography>
                    <Typography>
                        {formData.description}
                    </Typography>
                    <Typography color="textSecondary">
                        {formData.type === 'income' ? 'Income' : 'Expense'} • {format(formData.transactionDate, 'dd MMM yyyy')}
                    </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Amount
                    </Typography>
                    <Typography variant="h5" color={formData.type === 'income' ? 'success.main' : 'error.main'}>
                        ₹{formData.amount.toLocaleString()}
                    </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        {formData.type === 'income' ? 'Source' : 'Category'}
                    </Typography>
                    <Typography>
                        {formData.type === 'income' 
                            ? incomeSources.find(s => s.value === formData.source)?.label || formData.source
                            : expenseCategories.find(c => c.value === formData.category)?.label || formData.category
                        }
                    </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Payment
                    </Typography>
                    <Typography>
                        {paymentMethods.find(m => m.value === formData.paymentMethod)?.label || formData.paymentMethod}
                    </Typography>
                    <Typography color="textSecondary">
                        Status: {formData.paymentStatus}
                    </Typography>
                </Grid>
                
                {formData.party.name && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Party Details
                        </Typography>
                        <Typography>
                            {formData.party.name} ({formData.party.type})
                        </Typography>
                    </Grid>
                )}
                
                {formData.crop && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Linked Crop
                        </Typography>
                        <Typography>
                            {crops.find(c => c._id === formData.crop)?.name || 'Selected crop'}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return renderBasicInfo();
            case 1:
                return renderDetails();
            case 2:
                return renderReview();
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
                                disabled={!formData.description || !formData.amount}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!formData.description || !formData.amount}
                            >
                                {transaction ? 'Update Transaction' : 'Create Transaction'}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default TransactionForm;
