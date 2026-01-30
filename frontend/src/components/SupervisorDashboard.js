import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    Dashboard,
    Chat,
    Assignment,
    TrendingUp,
    Checklist
} from '@mui/icons-material';

const SupervisorDashboard = () => {
    const [activeTab, setActiveTab] = useState('schemes');

    const schemes = [
        { id: 1, name: 'PM-KISAN', deadline: '2024-04-30', status: 'Open' },
        { id: 2, name: 'Soil Health Card', deadline: '2024-03-31', status: 'Open' },
        { id: 3, name: 'Crop Insurance', deadline: '2024-05-15', status: 'Upcoming' }
    ];

    const farmers = [
        { id: 1, name: 'Rajesh Kumar', location: 'Village A', crops: ['Wheat', 'Rice'], lastVisit: '2024-03-10' },
        { id: 2, name: 'Suresh Patel', location: 'Village B', crops: ['Cotton', 'Maize'], lastVisit: '2024-03-12' }
    ];

    const renderGovernmentSchemes = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    Government Schemes & Subsidies
                </Typography>
            </Grid>
            {schemes.map(scheme => (
                <Grid item xs={12} md={4} key={scheme.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {scheme.name}
                            </Typography>
                            <Typography color="textSecondary">
                                Deadline: {scheme.deadline}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color={scheme.status === 'Open' ? 'primary' : 'default'}
                                sx={{ mt: 2 }}
                            >
                                View Details
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderChatSystem = () => (
        <Paper sx={{ p: 3, height: '70vh' }}>
            <Typography variant="h5" gutterBottom>
                Farmer Communication
            </Typography>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={4}>
                    <Typography variant="subtitle1" gutterBottom>
                        Farmers List
                    </Typography>
                    <List>
                        {farmers.map(farmer => (
                            <ListItem key={farmer.id} button>
                                <ListItemText 
                                    primary={farmer.name}
                                    secondary={farmer.location}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={8}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Chat with Rajesh Kumar
                        </Typography>
                        {/* Chat messages would go here */}
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );

    const renderCropPrediction = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Crop Prediction & Analytics
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Yield Forecast
                            </Typography>
                            {/* Prediction chart would go here */}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Risk Assessment
                            </Typography>
                            {/* Risk factors would go here */}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Supervisor Dashboard
            </Typography>
            
            {/* Navigation */}
            <Paper sx={{ mb: 3, p: 1 }}>
                <Grid container spacing={1}>
                    {[
                        { id: 'schemes', label: 'Govt Schemes', icon: <Dashboard /> },
                        { id: 'chat', label: 'Communication', icon: <Chat /> },
                        { id: 'records', label: 'Records', icon: <Assignment /> },
                        { id: 'prediction', label: 'Crop Prediction', icon: <TrendingUp /> },
                        { id: 'todo', label: 'To-Do List', icon: <Checklist /> }
                    ].map(item => (
                        <Grid item key={item.id}>
                            <Button
                                variant={activeTab === item.id ? 'contained' : 'text'}
                                onClick={() => setActiveTab(item.id)}
                                startIcon={item.icon}
                            >
                                {item.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Content */}
            {activeTab === 'schemes' && renderGovernmentSchemes()}
            {activeTab === 'chat' && renderChatSystem()}
            {activeTab === 'prediction' && renderCropPrediction()}
        </Container>
    );
};

export default SupervisorDashboard;
