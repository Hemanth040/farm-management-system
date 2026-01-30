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
    TextField,
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
    LinearProgress,
    Menu,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Add,
    Inventory,
    Warning,
    Schedule,
    Download,
    Search,
    MoreVert,
    Science,
    Agriculture,
    Build,
    WaterDrop,
    LocalGasStation,
    Storage,
    AttachMoney,
    CheckCircle
} from '@mui/icons-material';
import { differenceInDays } from 'date-fns';
import { resourcesService } from '../services/api';
import ResourceForm from './ResourceForm';
import ResourceDetails from './ResourceDetails';
import { UseResourceDialog, AddStockDialog } from './ResourceDialogs';
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const ResourcesManagement = () => {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [usageOpen, setUsageOpen] = useState(false);
    const [addStockOpen, setAddStockOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        lowStock: false,
        expired: false,
        maintenanceDue: false,
        search: ''
    });
    const [analytics, setAnalytics] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedMenuResource, setSelectedMenuResource] = useState(null);

    // Category icons
    const categoryIcons = {
        seeds: <Agriculture color="success" />,
        fertilizers: <Science color="warning" />,
        pesticides: <Warning color="error" />,
        herbicides: <Warning color="error" />,
        equipment: <Build color="action" />,
        machinery: <Build color="action" />,
        water: <WaterDrop color="info" />,
        fuel: <LocalGasStation color="warning" />,
        electricity: <LocalGasStation color="secondary" />,
        storage: <Storage color="primary" />,
        default: <Inventory color="action" />
    };

    // Category colors
    const categoryColors = {
        seeds: '#4CAF50',
        fertilizers: '#FF9800',
        pesticides: '#F44336',
        herbicides: '#E91E63',
        equipment: '#795548',
        machinery: '#795548',
        water: '#2196F3',
        fuel: '#FF5722',
        electricity: '#9C27B0',
        storage: '#607D8B',
        default: '#757575'
    };

    useEffect(() => {
        fetchResources();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        filterResources();
    }, [resources, filters, activeTab]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await resourcesService.getResources(filters);
            setResources(response.resources);
            setFilteredResources(response.resources);
            setStats(response.stats);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await resourcesService.getAnalytics();
            setAnalytics(response);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const filterResources = () => {
        let filtered = resources;
        
        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(r => r.category === filters.category);
        }
        
        // Apply location filter
        if (filters.location) {
            filtered = filtered.filter(r => r.location === filters.location);
        }
        
        // Apply low stock filter
        if (filters.lowStock) {
            filtered = filtered.filter(r => r.availableQuantity <= r.minimumThreshold);
        }
        
        // Apply expired filter
        if (filters.expired) {
            const now = new Date();
            filtered = filtered.filter(r => r.expiryDate && new Date(r.expiryDate) < now);
        }
        
        // Apply maintenance due filter
        if (filters.maintenanceDue) {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(r => 
                r.isEquipment && 
                r.nextMaintenanceDate && 
                new Date(r.nextMaintenanceDate) <= nextWeek
            );
        }
        
        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(r => 
                r.name.toLowerCase().includes(searchLower) ||
                r.description?.toLowerCase().includes(searchLower) ||
                r.brand?.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply tab filter
        switch (activeTab) {
            case 'lowStock':
                filtered = filtered.filter(r => r.availableQuantity <= r.minimumThreshold);
                break;
            case 'equipment':
                filtered = filtered.filter(r => r.isEquipment);
                break;
            case 'expired':
                filtered = filtered.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date());
                break;
            case 'alerts':
                filtered = filtered.filter(r => r.alerts?.some(a => !a.resolved));
                break;
            default:
                break;
        }
        
        setFilteredResources(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleMenuClick = (event, resource) => {
        setMenuAnchor(event.currentTarget);
        setSelectedMenuResource(resource);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedMenuResource(null);
    };

    const handleUseResource = async () => {
        setUsageOpen(true);
        handleMenuClose();
    };

    const handleAddStock = async () => {
        setAddStockOpen(true);
        handleMenuClose();
    };

    const handleDeleteResource = async () => {
        if (selectedMenuResource && window.confirm(`Are you sure you want to archive ${selectedMenuResource.name}?`)) {
            try {
                await resourcesService.deleteResource(selectedMenuResource._id);
                fetchResources();
                fetchAnalytics();
            } catch (error) {
                console.error('Error deleting resource:', error);
            }
        }
        handleMenuClose();
    };

    const getStockStatus = (resource) => {
        if (resource.availableQuantity <= 0) return { status: 'out_of_stock', color: 'error', label: 'Out of Stock' };
        if (resource.availableQuantity <= resource.minimumThreshold) return { status: 'low_stock', color: 'warning', label: 'Low Stock' };
        return { status: 'in_stock', color: 'success', label: 'In Stock' };
    };

    const getExpiryStatus = (resource) => {
        if (!resource.expiryDate) return null;
        
        const expiryDate = new Date(resource.expiryDate);
        const today = new Date();
        const daysToExpiry = differenceInDays(expiryDate, today);
        
        if (daysToExpiry < 0) return { status: 'expired', color: 'error', label: 'Expired', days: Math.abs(daysToExpiry) };
        if (daysToExpiry <= 30) return { status: 'expiring_soon', color: 'warning', label: 'Expiring Soon', days: daysToExpiry };
        return { status: 'valid', color: 'success', label: 'Valid', days: daysToExpiry };
    };

    const renderStatsCards = () => {
        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Inventory color="primary" />
                                <Typography color="textSecondary" variant="caption">
                                    Total Resources
                                </Typography>
                            </Box>
                            <Typography variant="h5">{stats.totalResources || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachMoney color="success" />
                                <Typography color="textSecondary" variant="caption">
                                    Total Value
                                </Typography>
                            </Box>
                            <Typography variant="h5">
                                ₹{(stats.totalValue || 0).toLocaleString()}
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
                                    Low Stock
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="warning.main">
                                {stats.lowStockCount || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Build color="info" />
                                <Typography color="textSecondary" variant="caption">
                                    Equipment
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="info.main">
                                {stats.equipmentCount || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderResourceCard = (resource) => {
        const stockStatus = getStockStatus(resource);
        const expiryStatus = getExpiryStatus(resource);
        
        return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={resource._id}>
                <Card 
                    variant="outlined"
                    sx={{ 
                        height: '100%',
                        borderColor: categoryColors[resource.category] || categoryColors.default,
                        borderLeftWidth: 4,
                        borderLeftColor: categoryColors[resource.category] || categoryColors.default,
                        '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s'
                        }
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {categoryIcons[resource.category] || categoryIcons.default}
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {resource.name}
                                </Typography>
                            </Box>
                            <IconButton 
                                size="small" 
                                onClick={(e) => handleMenuClick(e, resource)}
                            >
                                <MoreVert />
                            </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" paragraph>
                            {resource.description || 'No description'}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={resource.category} 
                                size="small" 
                                sx={{ 
                                    bgcolor: `${categoryColors[resource.category] || categoryColors.default}15`,
                                    color: categoryColors[resource.category] || categoryColors.default,
                                    mr: 1 
                                }}
                            />
                            {resource.brand && (
                                <Chip label={resource.brand} size="small" variant="outlined" sx={{ mr: 1 }} />
                            )}
                        </Box>
                        
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" display="block">
                                    Available
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {resource.availableQuantity} {resource.unit}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" display="block">
                                    Total
                                </Typography>
                                <Typography variant="body2">
                                    {resource.totalQuantity} {resource.unit}
                                </Typography>
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                                label={stockStatus.label} 
                                size="small" 
                                color={stockStatus.color}
                                icon={stockStatus.status === 'in_stock' ? <CheckCircle /> : <Warning />}
                            />
                            
                            {expiryStatus && (
                                <Chip 
                                    label={`${expiryStatus.days}d`} 
                                    size="small" 
                                    color={expiryStatus.color}
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    const renderAnalytics = () => {
        if (!analytics) return null;
        
        const categoryData = Object.entries(analytics.valueByCategory || {}).map(([name, value]) => ({
            name,
            value
        }));
        
        const monthlyUsageData = Object.entries(analytics.monthlyUsage || {}).map(([month, data]) => ({
            month: month.slice(5), // Remove year
            quantity: data.quantity,
            cost: data.cost
        })).slice(-6); // Last 6 months
        
        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Resource Analytics
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                            Value by Category
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={categoryColors[entry.name] || categoryColors.default} 
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                            Monthly Usage Trend
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyUsageData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <RechartsTooltip formatter={(value, name) => [
                                        name === 'quantity' ? `${value} units` : `₹${value}`,
                                        name === 'quantity' ? 'Quantity' : 'Cost'
                                    ]} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="quantity" 
                                        stroke="#8884d8" 
                                        name="Quantity"
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="cost" 
                                        stroke="#82ca9d" 
                                        name="Cost"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Top Used Resources
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Resource</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Used Quantity</TableCell>
                                        <TableCell align="right">Cost</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(analytics.topUsed || []).map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={item.category} 
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: `${categoryColors[item.category] || categoryColors.default}15`,
                                                        color: categoryColors[item.category] || categoryColors.default
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.usedQuantity} {item.unit}
                                            </TableCell>
                                            <TableCell align="right">
                                                ₹{item.cost.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Resource Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => resourcesService.exportToCSV()}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setShowForm(true)}
                    >
                        Add Resource
                    </Button>
                </Box>
            </Box>

            {renderStatsCards()}
            
            {/* Filters & Tabs */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search resources..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    label="Category"
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    <MenuItem value="seeds">Seeds</MenuItem>
                                    <MenuItem value="fertilizers">Fertilizers</MenuItem>
                                    <MenuItem value="pesticides">Pesticides</MenuItem>
                                    <MenuItem value="equipment">Equipment</MenuItem>
                                    <MenuItem value="water">Water</MenuItem>
                                    <MenuItem value="fuel">Fuel</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Location</InputLabel>
                                <Select
                                    value={filters.location}
                                    label="Location"
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                >
                                    <MenuItem value="">All Locations</MenuItem>
                                    <MenuItem value="store_room">Store Room</MenuItem>
                                    <MenuItem value="field">Field</MenuItem>
                                    <MenuItem value="godown">Godown</MenuItem>
                                    <MenuItem value="cold_storage">Cold Storage</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <Button
                                variant={filters.lowStock ? "contained" : "outlined"}
                                color="warning"
                                size="small"
                                onClick={() => handleFilterChange('lowStock', !filters.lowStock)}
                                startIcon={<Warning />}
                            >
                                Low Stock
                            </Button>
                            
                            <Button
                                variant={filters.maintenanceDue ? "contained" : "outlined"}
                                color="info"
                                size="small"
                                onClick={() => handleFilterChange('maintenanceDue', !filters.maintenanceDue)}
                                startIcon={<Schedule />}
                            >
                                Maintenance Due
                            </Button>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Tabs 
                            value={activeTab} 
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="All" value="all" />
                            <Tab 
                                label={
                                    <Badge badgeContent={stats.lowStockCount} color="warning" showZero>
                                        Low Stock
                                    </Badge>
                                } 
                                value="lowStock" 
                            />
                            <Tab label="Equipment" value="equipment" />
                            <Tab label="Expired" value="expired" />
                            <Tab label="Alerts" value="alerts" />
                        </Tabs>
                    </Grid>
                </Grid>
            </Paper>

            {/* Analytics Section */}
            {renderAnalytics()}

            {/* Resources Grid */}
            {loading ? (
                <LinearProgress />
            ) : filteredResources.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        No resources found. Add your first resource!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setShowForm(true)}
                        sx={{ mt: 2 }}
                    >
                        Add Resource
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {filteredResources.map(renderResourceCard)}
                </Grid>
            )}

            {/* Resource Form Dialog */}
            <Dialog 
                open={showForm} 
                onClose={() => setShowForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedResource ? 'Edit Resource' : 'Add New Resource'}
                </DialogTitle>
                <DialogContent>
                    <ResourceForm 
                        resource={selectedResource}
                        onSuccess={() => {
                            setShowForm(false);
                            setSelectedResource(null);
                            fetchResources();
                            fetchAnalytics();
                        }}
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedResource(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    setSelectedResource(selectedMenuResource);
                    setDetailsOpen(true);
                    handleMenuClose();
                }}>
                    <ListItemText primary="View Details" />
                </MenuItem>
                <MenuItem onClick={() => {
                    setSelectedResource(selectedMenuResource);
                    setShowForm(true);
                    handleMenuClose();
                }}>
                    <ListItemText primary="Edit" />
                </MenuItem>
                <MenuItem onClick={handleUseResource}>
                    <ListItemText primary="Use Resource" />
                </MenuItem>
                <MenuItem onClick={handleAddStock}>
                    <ListItemText primary="Add Stock" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDeleteResource} sx={{ color: 'error.main' }}>
                    <ListItemText primary="Archive" />
                </MenuItem>
            </Menu>

            {/* Resource Details Dialog */}
            {selectedResource && (
                <ResourceDetails 
                    open={detailsOpen}
                    resource={selectedResource}
                    onClose={() => setDetailsOpen(false)}
                    onEdit={() => {
                        setDetailsOpen(false);
                        setShowForm(true);
                    }}
                />
            )}

            {/* Use Resource Dialog */}
            {selectedMenuResource && (
                <UseResourceDialog 
                    open={usageOpen}
                    resource={selectedMenuResource}
                    onClose={() => setUsageOpen(false)}
                    onSuccess={() => {
                        setUsageOpen(false);
                        fetchResources();
                        fetchAnalytics();
                    }}
                />
            )}

            {/* Add Stock Dialog */}
            {selectedMenuResource && (
                <AddStockDialog 
                    open={addStockOpen}
                    resource={selectedMenuResource}
                    onClose={() => setAddStockOpen(false)}
                    onSuccess={() => {
                        setAddStockOpen(false);
                        fetchResources();
                        fetchAnalytics();
                    }}
                />
            )}
        </Container>
    );
};

export default ResourcesManagement;
