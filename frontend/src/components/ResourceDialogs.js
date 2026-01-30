import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { resourcesService, cropService, workerService } from '../services/api';

export const UseResourceDialog = ({ open, resource, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [cropId, setCropId] = useState('');
    const [workerId, setWorkerId] = useState('');
    const [crops, setCrops] = useState([]);
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const cropsData = await cropService.getCrops();
            setCrops(Array.isArray(cropsData) ? cropsData : []);
            
            const workersData = await workerService.getWorkers();
            setWorkers(Array.isArray(workersData) ? workersData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            await resourcesService.useResource(resource._id, {
                quantity: parseFloat(quantity),
                cropId,
                workerId,
                notes
            });
            onSuccess();
        } catch (error) {
            console.error('Error using resource:', error);
            // Handle error (show toast/alert)
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Use Resource: {resource?.name}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label={`Quantity (${resource?.unit})`}
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            helperText={`Available: ${resource?.availableQuantity} ${resource?.unit}`}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Crop (Optional)</InputLabel>
                            <Select
                                value={cropId}
                                label="Crop (Optional)"
                                onChange={(e) => setCropId(e.target.value)}
                            >
                                <MenuItem value="">None</MenuItem>
                                {crops.map(crop => (
                                    <MenuItem key={crop._id} value={crop._id}>
                                        {crop.name} - {crop.variety}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Worker (Optional)</InputLabel>
                            <Select
                                value={workerId}
                                label="Worker (Optional)"
                                onChange={(e) => setWorkerId(e.target.value)}
                            >
                                <MenuItem value="">None</MenuItem>
                                {workers.map(worker => (
                                    <MenuItem key={worker._id} value={worker._id}>
                                        {worker.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={!quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > (resource?.availableQuantity || 0)}
                >
                    Confirm Usage
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const AddStockDialog = ({ open, resource, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState('');
    const [costPerUnit, setCostPerUnit] = useState(resource?.costPerUnit || '');
    const [vendorName, setVendorName] = useState(resource?.vendor?.name || '');
    const [purchaseDate, setPurchaseDate] = useState(new Date());

    const handleSubmit = async () => {
        try {
            await resourcesService.addStock(resource._id, {
                quantity: parseFloat(quantity),
                costPerUnit: parseFloat(costPerUnit),
                vendor: { name: vendorName },
                purchaseDate
            });
            onSuccess();
        } catch (error) {
            console.error('Error adding stock:', error);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add Stock: {resource?.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={`Quantity to Add (${resource?.unit})`}
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Cost Per Unit (₹)"
                                type="number"
                                value={costPerUnit}
                                onChange={(e) => setCostPerUnit(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Vendor Name"
                                value={vendorName}
                                onChange={(e) => setVendorName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DatePicker
                                label="Purchase Date"
                                value={purchaseDate}
                                onChange={(date) => setPurchaseDate(date)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!quantity || parseFloat(quantity) <= 0}
                    >
                        Add Stock
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};
