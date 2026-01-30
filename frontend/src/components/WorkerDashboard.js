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
    ListItemText,
    Chip,
    TextField
} from '@mui/material';
import {
    CheckCircle,
    Report
} from '@mui/icons-material';

const WorkerDashboard = () => {
    const [attendance, setAttendance] = useState([]);
    const [tasks, setTasks] = useState([
        { id: 1, description: 'Plow Field A', field: 'North Field', status: 'pending', date: '2024-03-20' },
        { id: 2, description: 'Apply Fertilizer', field: 'South Field', status: 'completed', date: '2024-03-19' }
    ]);

    const markAttendance = () => {
        const today = new Date().toISOString().split('T')[0];
        setAttendance([...attendance, { date: today, time: new Date().toLocaleTimeString() }]);
    };

    const completeTask = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, status: 'completed' } : task
        ));
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Worker Dashboard
            </Typography>
            
            <Grid container spacing={3}>
                {/* Attendance */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Today's Attendance
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary"
                                startIcon={<CheckCircle />}
                                onClick={markAttendance}
                                sx={{ mb: 2 }}
                            >
                                Mark Present
                            </Button>
                            {attendance.length > 0 && (
                                <Typography>
                                    Last marked: {attendance[attendance.length - 1].date} at {attendance[attendance.length - 1].time}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tasks */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Today's Tasks
                        </Typography>
                        <List>
                            {tasks.map(task => (
                                <ListItem 
                                    key={task.id}
                                    secondaryAction={
                                        task.status === 'pending' ? (
                                            <Button 
                                                variant="outlined" 
                                                size="small"
                                                onClick={() => completeTask(task.id)}
                                            >
                                                Mark Complete
                                            </Button>
                                        ) : (
                                            <Chip 
                                                icon={<CheckCircle />} 
                                                label="Completed" 
                                                color="success" 
                                                size="small" 
                                            />
                                        )
                                    }
                                >
                                    <ListItemText
                                        primary={task.description}
                                        secondary={`Field: ${task.field} \u2022 ${task.date}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Wages */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Wages Overview
                            </Typography>
                            <Typography variant="h4" color="primary">
                                ₹12,500
                            </Typography>
                            <Typography color="textSecondary">
                                This month's earnings
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Issue Reporting */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Report Issue
                            </Typography>
                            <TextField 
                                label="Issue Description"
                                multiline
                                rows={3}
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <Button 
                                variant="contained" 
                                color="warning"
                                startIcon={<Report />}
                                fullWidth
                            >
                                Submit Report
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default WorkerDashboard;
