import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Grass,
    Dashboard as DashboardIcon,
    Notifications,
    Warning,
    CalendarToday,
    Inventory,
    Assessment,
    Nature,
    Group,
    LocalOffer,
    Sell
} from '@mui/icons-material';
import ActivityTimeline from './ActivityTimeline';
import ResourcesManagement from './ResourcesManagement';
import FinancialDashboard from './FinancialDashboard';
import CropHealthDashboard from './CropHealthDashboard';
import ReportsDashboard from './ReportsDashboard';
import WorkersManagement from './WorkersManagement';

const FarmerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [reminders, setReminders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch initial data
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        // API call to fetch reminders
        const mockReminders = [
            { id: 1, title: 'Irrigation', date: '2024-03-20', type: 'irrigation', crop: 'Wheat' },
            { id: 2, title: 'Fertilizer Application', date: '2024-03-22', type: 'fertilizer', crop: 'Rice' },
            { id: 3, title: 'Harvest Wheat', date: '2024-03-25', type: 'harvest', crop: 'Wheat' }
        ];
        setReminders(mockReminders);
    };

    const features = [
        { id: 'reminders', icon: <Notifications />, title: 'Reminders', color: '#4CAF50' },
        { id: 'warnings', icon: <Warning />, title: 'Warnings', color: '#FF9800' },
        { id: 'planner', icon: <CalendarToday />, title: 'Crop Planner', color: '#2196F3' },
        { id: 'timeline', icon: <DashboardIcon />, title: 'Activity Timeline', color: '#9C27B0' },
        { id: 'resources', icon: <Inventory />, title: 'Resources', color: '#795548' },
        { id: 'financial', icon: <Assessment />, title: 'Financial', color: '#607D8B' },
        { id: 'diseases', icon: <Nature />, title: 'Crop Health', color: '#E91E63' },
        { id: 'reports', icon: <Assessment />, title: 'Reports', color: '#00BCD4' },
        { id: 'workers', icon: <Group />, title: 'Workers', color: '#FF5722' },
        { id: 'pesticides', icon: <LocalOffer />, title: 'Pesticide Guide', color: '#8BC34A' },
        { id: 'selling', icon: <Sell />, title: 'Selling', color: '#3F51B5' },
        { id: 'weeds', icon: <Grass />, title: 'Weed Management', color: '#009688' }
    ];

    const renderOverview = () => (
        <Grid container spacing={3}>
            {/* Quick Stats */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Active Crops
                        </Typography>
                        <Typography variant="h5">3</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Pending Tasks
                        </Typography>
                        <Typography variant="h5">7</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Low Stock Items
                        </Typography>
                        <Typography variant="h5">2</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Total Workers
                        </Typography>
                        <Typography variant="h5">12</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Reminders */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Upcoming Reminders
                    </Typography>
                    <List>
                        {reminders.map((reminder) => (
                            <ListItem key={reminder.id} secondaryAction={
                                <Chip label={reminder.crop} size="small" />
                            }>
                                <ListItemText
                                    primary={reminder.title}
                                    secondary={`Due: ${reminder.date}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* Warnings */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Active Warnings
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Heavy Rainfall Expected"
                                secondary="Tomorrow - Take necessary precautions"
                                primaryTypographyProps={{ color: 'warning.main' }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Pest Alert: Locust Activity"
                                secondary="High activity reported in your region"
                                primaryTypographyProps={{ color: 'error.main' }}
                            />
                        </ListItem>
                    </List>
                </Paper>
            </Grid>

            {/* Features Grid */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    All Features
                </Typography>
                <Grid container spacing={2}>
                    {features.map((feature) => (
                        <Grid item xs={6} sm={4} md={3} key={feature.id}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#f5f5f5' }
                                }}
                                onClick={() => {
                                    if (feature.id === 'planner') {
                                        navigate('/crop-planner');
                                    } else {
                                        setActiveTab(feature.id);
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <IconButton sx={{ color: feature.color, mb: 1 }}>
                                        {feature.icon}
                                    </IconButton>
                                    <Typography variant="subtitle1">
                                        {feature.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );

    const renderReminders = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Reminders Management
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Add New Reminder
                    </Typography>
                    {/* Add reminder form would go here */}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Scheduled Reminders
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Crop</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Irrigation</TableCell>
                                    <TableCell>Water Field A</TableCell>
                                    <TableCell>2024-03-20</TableCell>
                                    <TableCell>Wheat</TableCell>
                                    <TableCell><Chip label="Pending" color="warning" size="small" /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fertilizer</TableCell>
                                    <TableCell>Apply Urea</TableCell>
                                    <TableCell>2024-03-22</TableCell>
                                    <TableCell>Rice</TableCell>
                                    <TableCell><Chip label="Scheduled" color="info" size="small" /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Farmer Dashboard
            </Typography>
            
            {/* Navigation Tabs */}
            <Paper sx={{ mb: 3, p: 1 }}>
                <Grid container spacing={1}>
                    <Grid item>
                        <Button 
                            variant={activeTab === 'overview' ? 'contained' : 'text'}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </Button>
                    </Grid>
                    {features.map(feature => (
                        <Grid item key={feature.id}>
                            <Button
                                variant={activeTab === feature.id ? 'contained' : 'text'}
                                onClick={() => {
                                    if (feature.id === 'planner') {
                                        navigate('/crop-planner');
                                    } else {
                                        setActiveTab(feature.id);
                                    }
                                }}
                                startIcon={feature.icon}
                            >
                                {feature.title}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Content Area */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'reminders' && renderReminders()}
            {activeTab === 'timeline' && <ActivityTimeline />}
            {activeTab === 'resources' && <ResourcesManagement />}
            {activeTab === 'financial' && <FinancialDashboard />}
            {activeTab === 'diseases' && <CropHealthDashboard />}
            {activeTab === 'reports' && <ReportsDashboard />}
            {activeTab === 'workers' && <WorkersManagement />}
            {/* activeTab === 'planner' is handled by navigation now */}
        </Container>
    );
};

export default FarmerDashboard;