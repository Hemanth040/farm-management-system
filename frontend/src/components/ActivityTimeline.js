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
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Avatar,
    LinearProgress,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    Timeline as TimelineIcon,
    Add,
    Edit,
    Delete,
    CheckCircle,
    PlayArrow,
    Warning,
    Photo,
    AttachFile,
    Today,
    ViewWeek,
    ViewDay,
    ViewAgenda,
    ArrowForward,
    ArrowBack,
    Crop,
    People,
    WaterDrop,
    Grass,
    Spa,
    LocalFlorist,
    Build,
    Paid,
    Report,
    MoreVert
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { timelineService } from '../services/api';
import ActivityForm from './ActivityForm';

const ActivityTimeline = () => {
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('week'); // day, week, month, list
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        crop: '',
        priority: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Activity type icons mapping
    const activityIcons = {
        sowing: <Grass color="success" />,
        transplanting: <LocalFlorist color="primary" />,
        irrigation: <WaterDrop color="info" />,
        fertilizer: <Spa color="warning" />,
        pesticide: <Warning color="error" />,
        harvesting: <Crop color="success" />,
        weeding: <Grass color="action" />,
        maintenance: <Build color="action" />,
        labor: <People color="secondary" />,
        payment: <Paid color="success" />,
        issue: <Report color="error" />
    };

    // Priority colors
    const priorityColors = {
        low: 'default',
        medium: 'primary',
        high: 'warning',
        critical: 'error'
    };

    // Status colors
    const statusColors = {
        upcoming: 'info',
        in_progress: 'warning',
        completed: 'success',
        missed: 'error',
        delayed: 'warning'
    };

    useEffect(() => {
        fetchActivities();
    }, [selectedDate, filters]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await timelineService.getActivities({
                startDate: getDateRange().start.toISOString(),
                endDate: getDateRange().end.toISOString(),
                ...filters
            });
            setActivities(response.activities);
            setFilteredActivities(response.activities);
            setStats(response.stats);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = () => {
        const date = selectedDate;
        switch (view) {
            case 'day':
                return {
                    start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                };
            case 'week':
                const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
                const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                return { start: weekStart, end: weekEnd };
            case 'month':
                return {
                    start: new Date(date.getFullYear(), date.getMonth(), 1),
                    end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
                };
            default:
                return {
                    start: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7),
                    end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
                };
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleStartActivity = async (activityId) => {
        try {
            await timelineService.startActivity(activityId);
            fetchActivities();
        } catch (error) {
            console.error('Error starting activity:', error);
        }
    };

    const handleCompleteActivity = async (activityId) => {
        try {
            await timelineService.completeActivity(activityId);
            fetchActivities();
        } catch (error) {
            console.error('Error completing activity:', error);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await timelineService.deleteActivity(activityId);
                fetchActivities();
            } catch (error) {
                console.error('Error deleting activity:', error);
            }
        }
    };

    const renderDayView = () => {
        const dayActivities = filteredActivities.filter(activity => {
            const activityDate = new Date(activity.plannedDate);
            return activityDate.toDateString() === selectedDate.toDateString();
        });

        return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </Typography>
                </Grid>
                {dayActivities.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" align="center">
                                    No activities scheduled for today
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    dayActivities.map((activity) => (
                        <Grid item xs={12} key={activity._id}>
                            <ActivityCard 
                                activity={activity} 
                                onSelect={() => {
                                    setSelectedActivity(activity);
                                    setDetailsOpen(true);
                                }}
                                onStart={handleStartActivity}
                                onComplete={handleCompleteActivity}
                                onDelete={handleDeleteActivity}
                            />
                        </Grid>
                    ))
                )}
            </Grid>
        );
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({
            start: weekStart,
            end: addDays(weekStart, 6)
        });

        return (
            <Grid container spacing={2}>
                {weekDays.map((day, index) => {
                    const dayActivities = filteredActivities.filter(activity => {
                        const activityDate = new Date(activity.plannedDate);
                        return activityDate.toDateString() === day.toDateString();
                    });

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={1.7} key={index}>
                            <Card 
                                variant={isToday(day) ? 'elevation' : 'outlined'} 
                                elevation={isToday(day) ? 3 : 0}
                                sx={{ 
                                    borderColor: isToday(day) ? 'primary.main' : 'divider',
                                    height: '100%'
                                }}
                            >
                                <CardContent>
                                    <Typography 
                                        variant="subtitle2" 
                                        color={isToday(day) ? 'primary' : 'textSecondary'}
                                        gutterBottom
                                    >
                                        {format(day, 'EEE')}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        color={isToday(day) ? 'primary' : 'textPrimary'}
                                    >
                                        {format(day, 'd')}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        {dayActivities.slice(0, 3).map((activity) => (
                                            <Chip
                                                key={activity._id}
                                                label={activity.title}
                                                size="small"
                                                sx={{ 
                                                    mb: 0.5,
                                                    width: '100%',
                                                    justifyContent: 'flex-start'
                                                }}
                                                icon={activityIcons[activity.type]}
                                                color={statusColors[activity.status] || 'default'}
                                                onClick={() => {
                                                    setSelectedActivity(activity);
                                                    setDetailsOpen(true);
                                                }}
                                            />
                                        ))}
                                        {dayActivities.length > 3 && (
                                            <Typography variant="caption" color="textSecondary">
                                                +{dayActivities.length - 3} more
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    const renderListView = () => {
        return (
            <List>
                {filteredActivities.map((activity) => (
                    <React.Fragment key={activity._id}>
                        <ListItem 
                            button
                            onClick={() => {
                                setSelectedActivity(activity);
                                setDetailsOpen(true);
                            }}
                        >
                            <ListItemIcon>
                                {activityIcons[activity.type] || <TimelineIcon />}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {activity.title}
                                        </Typography>
                                        <Chip 
                                            label={activity.status} 
                                            size="small" 
                                            color={statusColors[activity.status]}
                                        />
                                        {activity.priority === 'high' && (
                                            <Chip label="High" size="small" color="warning" />
                                        )}
                                        {activity.priority === 'critical' && (
                                            <Chip label="Critical" size="small" color="error" />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" display="block">
                                            {format(new Date(activity.plannedDate), 'MMM d, yyyy h:mm a')}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {activity.cropName && `Crop: ${activity.cropName}`}
                                            {activity.fieldName && ` • Field: ${activity.fieldName}`}
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Box>
                                {activity.status === 'upcoming' && (
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartActivity(activity._id);
                                        }}
                                    >
                                        <PlayArrow />
                                    </IconButton>
                                )}
                                {activity.status === 'in_progress' && (
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompleteActivity(activity._id);
                                        }}
                                    >
                                        <CheckCircle />
                                    </IconButton>
                                )}
                            </Box>
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        );
    };

    const renderStatsCards = () => {
        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="caption">
                                Total Activities
                            </Typography>
                            <Typography variant="h5">{stats.total || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="caption">
                                Upcoming
                            </Typography>
                            <Typography variant="h5" color="info.main">
                                {stats.upcoming || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="caption">
                                In Progress
                            </Typography>
                            <Typography variant="h5" color="warning.main">
                                {stats.inProgress || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="caption">
                                Overdue
                            </Typography>
                            <Typography variant="h5" color="error.main">
                                {stats.overdue || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Activity Timeline
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setShowForm(true)}
                >
                    Add Activity
                </Button>
            </Box>

            {renderStatsCards()}

            {/* Filters & View Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant={view === 'day' ? 'contained' : 'outlined'}
                                onClick={() => setView('day')}
                                startIcon={<ViewDay />}
                            >
                                Day
                            </Button>
                            <Button
                                variant={view === 'week' ? 'contained' : 'outlined'}
                                onClick={() => setView('week')}
                                startIcon={<ViewWeek />}
                            >
                                Week
                            </Button>
                            <Button
                                variant={view === 'list' ? 'contained' : 'outlined'}
                                onClick={() => setView('list')}
                                startIcon={<ViewAgenda />}
                            >
                                List
                            </Button>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                                <ArrowBack />
                            </IconButton>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Select Date"
                                    value={selectedDate}
                                    onChange={(newDate) => setSelectedDate(newDate)}
                                    renderInput={(params) => <TextField {...params} size="small" />}
                                />
                            </LocalizationProvider>
                            <IconButton onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                                <ArrowForward />
                            </IconButton>
                            {isToday(selectedDate) && (
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    startIcon={<Today />}
                                    onClick={() => setSelectedDate(new Date())}
                                >
                                    Today
                                </Button>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="upcoming">Upcoming</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="overdue">Overdue</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filters.type}
                                    label="Type"
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    <MenuItem value="sowing">Sowing</MenuItem>
                                    <MenuItem value="irrigation">Irrigation</MenuItem>
                                    <MenuItem value="fertilizer">Fertilizer</MenuItem>
                                    <MenuItem value="pesticide">Pesticide</MenuItem>
                                    <MenuItem value="harvesting">Harvesting</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Content */}
            <Paper sx={{ p: 3, minHeight: 400 }}>
                {loading ? (
                    <LinearProgress />
                ) : (
                    <>
                        {view === 'day' && renderDayView()}
                        {view === 'week' && renderWeekView()}
                        {view === 'list' && renderListView()}
                    </>
                )}
            </Paper>

            {/* Activity Form Dialog */}
            <Dialog 
                open={showForm} 
                onClose={() => setShowForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedActivity ? 'Edit Activity' : 'Add New Activity'}
                </DialogTitle>
                <DialogContent>
                    <ActivityForm 
                        activity={selectedActivity}
                        onSuccess={() => {
                            setShowForm(false);
                            setSelectedActivity(null);
                            fetchActivities();
                        }}
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedActivity(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Activity Details Dialog */}
            <Dialog 
                open={detailsOpen} 
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedActivity && (
                    <ActivityDetails 
                        activity={selectedActivity}
                        onClose={() => setDetailsOpen(false)}
                        onEdit={() => {
                            setDetailsOpen(false);
                            setShowForm(true);
                        }}
                        onStart={handleStartActivity}
                        onComplete={handleCompleteActivity}
                        onDelete={handleDeleteActivity}
                    />
                )}
            </Dialog>
        </Container>
    );
};

// Activity Card Component
const ActivityCard = ({ activity, onSelect, onStart, onComplete, onDelete }) => {
    const statusLabels = {
        upcoming: 'Upcoming',
        in_progress: 'In Progress',
        completed: 'Completed',
        missed: 'Missed',
        delayed: 'Delayed'
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {/* activityIcons is defined in parent, so we need to pass it or redefine. 
                                Redefining here for simplicity or we can move it outside. */}
                            <TimelineIcon /> 
                            <Typography variant="subtitle1" fontWeight="bold">
                                {activity.title}
                            </Typography>
                            <Chip 
                                label={statusLabels[activity.status]} 
                                size="small" 
                                color={activity.status === 'completed' ? 'success' : 'primary'}
                            />
                            {activity.priority === 'high' && (
                                <Chip label="High Priority" size="small" color="warning" />
                            )}
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" paragraph>
                            {activity.description}
                        </Typography>
                        
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="caption" display="block" color="textSecondary">
                                    Planned Date
                                </Typography>
                                <Typography variant="body2">
                                    {format(new Date(activity.plannedDate), 'MMM d, yyyy')}
                                </Typography>
                            </Grid>
                            {activity.cropName && (
                                <Grid item xs={6}>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        Crop
                                    </Typography>
                                    <Typography variant="body2">
                                        {activity.cropName}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                    
                    <Box>
                        <IconButton size="small" onClick={onSelect}>
                            <MoreVert />
                        </IconButton>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    {activity.status === 'upcoming' && (
                        <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<PlayArrow />}
                            onClick={() => onStart(activity._id)}
                        >
                            Start
                        </Button>
                    )}
                    {activity.status === 'in_progress' && (
                        <Button 
                            size="small" 
                            variant="contained"
                            startIcon={<CheckCircle />}
                            onClick={() => onComplete(activity._id)}
                        >
                            Complete
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

// Activity Details Component
const ActivityDetails = ({ activity, onClose, onEdit, onStart, onComplete, onDelete }) => {
    const [activeTab, setActiveTab] = useState('details');

    const steps = ['Planned', 'In Progress', 'Completed'];
    const activeStep = activity.status === 'upcoming' ? 0 : 
                      activity.status === 'in_progress' ? 1 : 2;
                      
    const priorityColors = {
        low: 'default',
        medium: 'primary',
        high: 'warning',
        critical: 'error'
    };

    return (
        <>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        {activity.title}
                    </Typography>
                    <Box>
                        <IconButton onClick={onEdit} size="small">
                            <Edit />
                        </IconButton>
                        <IconButton onClick={() => onDelete(activity._id)} size="small" color="error">
                            <Delete />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Details" value="details" />
                    <Tab label="Resources" value="resources" />
                    <Tab label="Comments" value="comments" />
                    <Tab label="Attachments" value="attachments" />
                </Tabs>

                {activeTab === 'details' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Description
                            </Typography>
                            <Typography paragraph>
                                {activity.description || 'No description provided'}
                            </Typography>

                            <Typography variant="subtitle2" color="textSecondary">
                                Status
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Chip label={activity.status} color="primary" />
                                <Chip label={activity.priority} color={priorityColors[activity.priority]} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Schedule
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText 
                                        primary="Planned Date"
                                        secondary={format(new Date(activity.plannedDate), 'PPP')}
                                    />
                                </ListItem>
                                {activity.actualDate && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="Actual Date"
                                            secondary={format(new Date(activity.actualDate), 'PPP')}
                                        />
                                    </ListItem>
                                )}
                                {activity.cropName && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="Crop"
                                            secondary={activity.cropName}
                                        />
                                    </ListItem>
                                )}
                                {activity.fieldName && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="Field"
                                            secondary={activity.fieldName}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 'resources' && (
                    <Box>
                        {activity.resources && activity.resources.length > 0 ? (
                            <List>
                                {activity.resources.map((resource, index) => (
                                    <ListItem key={index}>
                                        <ListItemText 
                                            primary={resource.name}
                                            secondary={`${resource.quantity} ${resource.unit} - ₹${resource.cost}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="textSecondary">
                                No resources assigned
                            </Typography>
                        )}
                    </Box>
                )}

                {activeTab === 'comments' && (
                    <Box>
                        {activity.comments && activity.comments.length > 0 ? (
                            <List>
                                {activity.comments.map((comment, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {comment.userName?.[0]}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={comment.userName}
                                            secondary={
                                                <>
                                                    <Typography variant="body2">
                                                        {comment.text}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {format(new Date(comment.createdAt), 'PPp')}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="textSecondary">
                                No comments yet
                            </Typography>
                        )}
                    </Box>
                )}

                {activeTab === 'attachments' && (
                    <Box>
                        {activity.attachments && activity.attachments.length > 0 ? (
                            <Grid container spacing={2}>
                                {activity.attachments.map((attachment, index) => (
                                    <Grid item xs={6} sm={4} key={index}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {attachment.type === 'photo' ? (
                                                        <Photo />
                                                    ) : (
                                                        <AttachFile />
                                                    )}
                                                    <Typography variant="body2">
                                                        {attachment.filename}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography color="textSecondary">
                                No attachments
                            </Typography>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {activity.status === 'upcoming' && (
                    <Button 
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        onClick={() => {
                            onStart(activity._id);
                            onClose();
                        }}
                    >
                        Start Activity
                    </Button>
                )}
                {activity.status === 'in_progress' && (
                    <Button 
                        variant="contained" 
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                            onComplete(activity._id);
                            onClose();
                        }}
                    >
                        Mark as Complete
                    </Button>
                )}
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </>
    );
};

export default ActivityTimeline;
