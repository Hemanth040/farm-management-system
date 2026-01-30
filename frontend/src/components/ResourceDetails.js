import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Chip,
    Divider,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    IconButton
} from '@mui/material';
import {
    Edit,
    Warning,
    CheckCircle,
    Error
} from '@mui/icons-material';
import { format } from 'date-fns';
import { resourcesService } from '../services/api';

const ResourceDetails = ({ open, resource, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!resource) return null;

    const getStockStatus = () => {
        if (resource.availableQuantity <= 0) return { status: 'out_of_stock', color: 'error', icon: <Error /> };
        if (resource.availableQuantity <= resource.minimumThreshold) return { status: 'low_stock', color: 'warning', icon: <Warning /> };
        return { status: 'in_stock', color: 'success', icon: <CheckCircle /> };
    };

    const stockStatus = getStockStatus();

    const tabs = [
        { label: 'Overview', value: 'overview' },
        { label: 'Usage History', value: 'usage' },
        { label: 'Alerts', value: 'alerts' },
        { label: 'Linked Crops', value: 'crops' }
    ];

    const renderOverview = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        {resource.name}
                    </Typography>
                    <Chip 
                        label={stockStatus.status.replace('_', ' ').toUpperCase()} 
                        color={stockStatus.color}
                        icon={stockStatus.icon}
                    />
                </Box>
                {resource.brand && (
                    <Typography color="textSecondary">
                        Brand: {resource.brand}
                    </Typography>
                )}
            </Grid>

            <Grid item xs={12}>
                <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Inventory Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption">Available</Typography>
                        <Typography variant="h6">
                            {resource.availableQuantity} {resource.unit}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption">Total</Typography>
                        <Typography>
                            {resource.totalQuantity} {resource.unit}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption">Used</Typography>
                        <Typography>
                            {resource.usedQuantity} {resource.unit}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption">Min Threshold</Typography>
                        <Typography>
                            {resource.minimumThreshold} {resource.unit}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cost & Location
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption">Cost per Unit</Typography>
                        <Typography>
                            ₹{resource.costPerUnit || 0}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption">Total Value</Typography>
                        <Typography variant="h6" color="primary">
                            ₹{(resource.totalCost || 0).toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption">Location</Typography>
                        <Typography>
                            {resource.location.replace('_', ' ')}
                        </Typography>
                    </Grid>
                    {resource.expiryDate && (
                        <Grid item xs={6}>
                            <Typography variant="caption">Expiry Date</Typography>
                            <Typography color={new Date(resource.expiryDate) < new Date() ? 'error' : 'textPrimary'}>
                                {format(new Date(resource.expiryDate), 'dd MMM yyyy')}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {resource.description && (
                <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Description
                    </Typography>
                    <Typography>{resource.description}</Typography>
                </Grid>
            )}

            {resource.isEquipment && (
                <Grid item xs={12}>
                    <Alert severity="info">
                        <Typography variant="subtitle2">Equipment Details</Typography>
                        <Typography variant="body2">
                            Status: {resource.equipmentStatus}
                            {resource.nextMaintenanceDate && (
                                <> • Next Maintenance: {format(new Date(resource.nextMaintenanceDate), 'dd MMM yyyy')}</>
                            )}
                        </Typography>
                    </Alert>
                </Grid>
            )}
        </Grid>
    );

    const renderUsageHistory = () => (
        <Box>
            {resource.usageHistory && resource.usageHistory.length > 0 ? (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Activity</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Crop</TableCell>
                                <TableCell>Worker</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resource.usageHistory.slice(0, 10).map((usage, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {format(new Date(usage.date), 'dd MMM yy')}
                                    </TableCell>
                                    <TableCell>
                                        {usage.activityTitle || 'Manual Entry'}
                                    </TableCell>
                                    <TableCell>
                                        {usage.quantity} {resource.unit}
                                    </TableCell>
                                    <TableCell>
                                        {usage.cropName || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {usage.workerName || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography color="textSecondary" align="center">
                    No usage history recorded
                </Typography>
            )}
        </Box>
    );

    const renderAlerts = () => (
        <Box>
            {resource.alerts && resource.alerts.filter(a => !a.resolved).length > 0 ? (
                resource.alerts
                    .filter(a => !a.resolved)
                    .map((alert, index) => (
                        <Alert 
                            key={index}
                            severity={alert.severity}
                            sx={{ mb: 1 }}
                            action={
                                <Button 
                                    size="small" 
                                    color="inherit"
                                    onClick={() => resourcesService.resolveAlert(resource._id, alert._id)}
                                >
                                    Resolve
                                </Button>
                            }
                        >
                            {alert.message}
                        </Alert>
                    ))
            ) : (
                <Typography color="textSecondary" align="center">
                    No active alerts
                </Typography>
            )}
        </Box>
    );

    const renderCrops = () => (
        <Box>
            {resource.crops && resource.crops.length > 0 ? (
                <Grid container spacing={2}>
                    {resource.crops.map((cropLink, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="subtitle2">
                                    {cropLink.cropName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Usage Rate: {cropLink.usageRate} {resource.unit} per acre
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography color="textSecondary" align="center">
                    Not linked to any crops
                </Typography>
            )}
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Resource Details
                    <IconButton onClick={onEdit} size="small">
                        <Edit />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        {tabs.map(tab => (
                            <Tab key={tab.value} label={tab.label} value={tab.value} />
                        ))}
                    </Tabs>
                </Box>

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'usage' && renderUsageHistory()}
                {activeTab === 'alerts' && renderAlerts()}
                {activeTab === 'crops' && renderCrops()}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ResourceDetails;
