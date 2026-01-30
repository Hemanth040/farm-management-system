import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Chip,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Divider,
    Badge,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Switch,
    Radio,
    RadioGroup,
    FormLabel,
    Collapse,
    Stepper,
    Step,
    StepLabel,
    MobileStepper,
    useTheme,
    styled,
    Stack,
    LinearProgress,
    AlertTitle,
    Snackbar
} from '@mui/material';
import {
    Notifications,
    Warning,
    Error,
    CheckCircle,
    AccessTime,
    CalendarToday,
    Agriculture,
    Cloud,
    Water,
    LocalFlorist,
    Build,
    AttachMoney,
    People,
    Settings,
    FilterList,
    History,
    Add,
    Edit,
    Delete,
    Done,
    Snooze,
    Refresh,
    ExpandMore,
    ExpandLess,
    Flag,
    PriorityHigh,
    Info,
    NotificationsActive,
    NotificationsOff,
    Message,
    Phone,
    Email,
    Person,
    TrendingUp,
    TrendingDown,
    LocalHospital,
    BugReport,
    Grass,
    Inventory,
    Engineering,
    Schedule,
    MoreVert,
    ChevronLeft,
    ChevronRight,
    Close,
    ArrowForward,
    PlayArrow,
    Pause,
    Sync,
    LocalShipping,
    Payment,
    AccountBalance,
    Search,
    ClearAll,
    Visibility,
    VisibilityOff,
    NotificationsPaused,
    Translate
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, addHours, isPast, isToday, isTomorrow, differenceInDays, parseISO, startOfDay, endOfDay, isBefore } from 'date-fns';

// Custom styled components
const PriorityBadge = styled(Chip)(({ priority }) => ({
    fontWeight: 'bold',
    ...(priority === 'critical' && {
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '2px solid #ef5350'
    }),
    ...(priority === 'medium' && {
        backgroundColor: '#fff3e0',
        color: '#ef6c00',
        border: '2px solid #ffa726'
    }),
    ...(priority === 'informational' && {
        backgroundColor: '#e3f2fd',
        color: '#1565c0',
        border: '2px solid #42a5f5'
    })
}));

const WarningCard = styled(Card)(({ severity }) => ({
    borderLeft: '6px solid',
    ...(severity === 'critical' && {
        borderLeftColor: '#f44336',
        backgroundColor: '#ffebee'
    }),
    ...(severity === 'high' && {
        borderLeftColor: '#ff9800',
        backgroundColor: '#fff3e0'
    }),
    ...(severity === 'medium' && {
        borderLeftColor: '#ffc107',
        backgroundColor: '#fffde7'
    }),
    ...(severity === 'low' && {
        borderLeftColor: '#4caf50',
        backgroundColor: '#e8f5e9'
    })
}));

const NotificationChannelIcon = ({ channel }) => {
    switch (channel) {
        case 'push': return <NotificationsActive fontSize="small" />;
        case 'sms': return <Message fontSize="small" />;
        case 'email': return <Email fontSize="small" />;
        case 'inapp': return <Notifications fontSize="small" />;
        default: return <Notifications fontSize="small" />;
    }
};

const WarningsReminders = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    
    // Filter states
    const [filters, setFilters] = useState({
        crop: 'all',
        type: 'all',
        severity: 'all',
        status: 'all',
        dateRange: 'all'
    });
    
    // Sort states
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
    
    // Dialog states
    const [createReminderDialog, setCreateReminderDialog] = useState(false);
    const [snoozeDialog, setSnoozeDialog] = useState({ open: false, item: null, type: '' });
    const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, item: null, type: '' });
    const [warningDetailsDialog, setWarningDetailsDialog] = useState({ open: false, warning: null });
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);
    
    // Expanded states
    const [expandedWarning, setExpandedWarning] = useState(null);
    const [expandedReminder, setExpandedReminder] = useState(null);
    
    // Language state
    const [language, setLanguage] = useState('en');
    
    // ==================== MOCK DATA ====================
    
    // Reminders Data
    const [reminders, setReminders] = useState([
        {
            id: 'r1',
            type: 'activity',
            subtype: 'sow',
            title: 'Sow Wheat in North Field',
            description: 'Optimal sowing time for wheat. Soil temperature is ideal.',
            cropId: 'crop1',
            cropName: 'Wheat',
            fieldId: 'field1',
            fieldName: 'North Field',
            dueDate: addDays(new Date(), 2),
            dueTime: '06:00',
            priority: 'critical',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-25'),
            channels: ['inapp', 'push'],
            isRead: false,
            linkedActivity: { id: 'act1', name: 'Sowing' },
            assignee: { id: 'w1', name: 'Ramesh' },
            notes: 'Use certified seeds. Check seed drill before starting.',
            autoGenerated: true,
            source: 'crop_planner'
        },
        {
            id: 'r2',
            type: 'activity',
            subtype: 'irrigate',
            title: 'Irrigate Rice Paddy - Block A',
            description: 'Soil moisture below threshold. Critical for grain formation stage.',
            cropId: 'crop2',
            cropName: 'Rice',
            fieldId: 'field2',
            fieldName: 'East Paddy',
            dueDate: addDays(new Date(), 0),
            dueTime: '16:00',
            priority: 'critical',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-28'),
            channels: ['inapp', 'sms'],
            isRead: false,
            linkedActivity: { id: 'act2', name: 'Irrigation' },
            assignee: { id: 'w2', name: 'Suresh' },
            notes: 'Check water pump pressure. Irrigate for 3 hours continuously.',
            autoGenerated: true,
            source: 'sensor_data'
        },
        {
            id: 'r3',
            type: 'custom',
            subtype: 'one_time',
            title: 'Apply Fertilizer - Urea Top Dressing',
            description: 'Second dose of nitrogen for cotton crop.',
            cropId: 'crop3',
            cropName: 'Cotton',
            fieldId: 'field3',
            fieldName: 'South Field',
            dueDate: addDays(new Date(), 5),
            dueTime: '08:00',
            priority: 'medium',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-20'),
            channels: ['inapp'],
            isRead: true,
            linkedActivity: { id: 'act3', name: 'Fertilizing' },
            assignee: { id: 'w3', name: 'Ganesh' },
            notes: '50kg urea per acre. Apply before irrigation.',
            autoGenerated: false,
            source: 'manual'
        },
        {
            id: 'r4',
            type: 'financial',
            subtype: 'payment',
            title: 'Pay Worker Wages - Weekly',
            description: 'Weekly payment due for 8 workers. Total: ₹12,400',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), 1),
            dueTime: '18:00',
            priority: 'medium',
            status: 'pending',
            recurring: true,
            recurringPattern: 'weekly',
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-01'),
            channels: ['inapp', 'push', 'sms'],
            isRead: false,
            linkedActivity: null,
            assignee: null,
            notes: 'Pay via UPI or cash. Maintain payment records.',
            autoGenerated: true,
            source: 'payroll_system'
        },
        {
            id: 'r5',
            type: 'resource',
            subtype: 'low_stock',
            title: 'Low Stock Alert - DAP Fertilizer',
            description: 'Only 25kg DAP remaining. Reorder before next application.',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), 7),
            dueTime: '10:00',
            priority: 'medium',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-28'),
            channels: ['inapp'],
            isRead: false,
            linkedActivity: null,
            assignee: { id: 'w1', name: 'Ramesh' },
            notes: 'Contact Agro Supplies. Current price: ₹1450/bag.',
            autoGenerated: true,
            source: 'inventory_system'
        },
        {
            id: 'r6',
            type: 'financial',
            subtype: 'emi',
            title: 'Loan EMI Payment Due',
            description: 'Kisan Credit Card EMI of ₹8,500 due this month.',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), 3),
            dueTime: '23:59',
            priority: 'critical',
            status: 'pending',
            recurring: true,
            recurringPattern: 'monthly',
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-01'),
            channels: ['inapp', 'sms', 'email'],
            isRead: false,
            linkedActivity: null,
            assignee: null,
            notes: 'Auto-debit enabled. Ensure sufficient balance.',
            autoGenerated: true,
            source: 'bank_system'
        },
        {
            id: 'r7',
            type: 'activity',
            subtype: 'spray',
            title: 'Pesticide Spray - Cotton',
            description: 'Control bollworm infestation. Spray Thiodicarb 75 WP.',
            cropId: 'crop3',
            cropName: 'Cotton',
            fieldId: 'field3',
            fieldName: 'South Field',
            dueDate: addDays(new Date(), -1),
            dueTime: '07:00',
            priority: 'critical',
            status: 'overdue',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-25'),
            channels: ['inapp', 'push', 'sms'],
            isRead: false,
            linkedActivity: { id: 'act4', name: 'Pesticide Spray' },
            assignee: { id: 'w4', name: 'Mahesh' },
            notes: 'Wear protective gear. Check wind direction before spraying.',
            autoGenerated: true,
            source: 'pest_monitoring'
        },
        {
            id: 'r8',
            type: 'resource',
            subtype: 'expiry',
            title: 'Pesticide Expiring Soon',
            description: 'Monocrotophos batch expires in 15 days. Use or discard.',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), 15),
            dueTime: '12:00',
            priority: 'medium',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-15'),
            channels: ['inapp'],
            isRead: true,
            linkedActivity: null,
            assignee: null,
            notes: 'Batch #MP2024-0892. 5 liters remaining.',
            autoGenerated: true,
            source: 'inventory_system'
        },
        {
            id: 'r9',
            type: 'custom',
            subtype: 'recurring',
            title: 'Daily Equipment Check',
            description: 'Inspect tractor, pump, and sprayer before use.',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), 0),
            dueTime: '06:00',
            priority: 'informational',
            status: 'completed',
            recurring: true,
            recurringPattern: 'daily',
            completedAt: new Date(),
            snoozedUntil: null,
            createdAt: new Date('2026-01-01'),
            channels: ['inapp'],
            isRead: true,
            linkedActivity: null,
            assignee: { id: 'w1', name: 'Ramesh' },
            notes: 'Check oil levels, tire pressure, and battery.',
            autoGenerated: false,
            source: 'manual'
        },
        {
            id: 'r10',
            type: 'activity',
            subtype: 'harvest',
            title: 'Harvest Ready - Maize',
            description: 'Maize in West Field is ready for harvest. Moisture at 18%.',
            cropId: 'crop4',
            cropName: 'Maize',
            fieldId: 'field4',
            fieldName: 'West Field',
            dueDate: addDays(new Date(), 0),
            dueTime: '08:00',
            priority: 'critical',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-28'),
            channels: ['inapp', 'push', 'sms'],
            isRead: false,
            linkedActivity: { id: 'act5', name: 'Harvesting' },
            assignee: { id: 'w5', name: 'Dinesh' },
            notes: 'Arrange laborers. Book tractor trolley for transport.',
            autoGenerated: true,
            source: 'crop_monitoring'
        },
        {
            id: 'r11',
            type: 'financial',
            subtype: 'payment',
            title: 'Receive Payment from Buyer',
            description: 'Payment of ₹45,000 due from ABC Traders for previous harvest.',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), 2),
            dueTime: '17:00',
            priority: 'medium',
            status: 'pending',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-20'),
            channels: ['inapp'],
            isRead: true,
            linkedActivity: null,
            assignee: null,
            notes: 'Follow up with Mr. Sharma. Invoice #INV-2026-042.',
            autoGenerated: false,
            source: 'manual'
        },
        {
            id: 'r12',
            type: 'resource',
            subtype: 'service',
            title: 'Tractor Service Due',
            description: 'Complete engine service overdue by 50 hours.',
            cropId: null,
            cropName: null,
            fieldId: null,
            fieldName: null,
            dueDate: addDays(new Date(), -3),
            dueTime: '09:00',
            priority: 'high',
            status: 'overdue',
            recurring: false,
            recurringPattern: null,
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date('2026-01-15'),
            channels: ['inapp', 'push'],
            isRead: false,
            linkedActivity: null,
            assignee: { id: 'w1', name: 'Ramesh' },
            notes: 'Contact service center. Estimate: ₹3,500.',
            autoGenerated: true,
            source: 'equipment_tracker'
        }
    ]);
    
    // Warnings Data
    const [warnings, setWarnings] = useState([
        {
            id: 'w1',
            type: 'weather',
            subtype: 'heavy_rain',
            title: 'Heavy Rain Forecast - Next 48 Hours',
            description: 'IMD predicts 120mm rainfall. Risk of waterlogging in low-lying areas.',
            severity: 'critical',
            status: 'active',
            affectedCrops: [
                { id: 'crop2', name: 'Rice', field: 'East Paddy', impact: 'May benefit if drainage is good' },
                { id: 'crop3', name: 'Cotton', field: 'South Field', impact: 'High risk of flower shedding' }
            ],
            actions: [
                'Ensure drainage channels are clear',
                'Harvest any ready crops immediately',
                'Move equipment to higher ground',
                'Check paddy field water levels'
            ],
            generatedAt: new Date('2026-01-29'),
            expiresAt: addDays(new Date(), 2),
            source: 'weather_api',
            isRead: false,
            channels: ['inapp', 'push', 'sms'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 95
        },
        {
            id: 'w2',
            type: 'crop_health',
            subtype: 'disease_risk',
            title: 'Blight Disease Risk - Wheat',
            description: 'High humidity and temperature favoring fungal blight. Spores detected in air.',
            severity: 'high',
            status: 'active',
            affectedCrops: [
                { id: 'crop1', name: 'Wheat', field: 'North Field', impact: 'Leaf blight risk very high' }
            ],
            actions: [
                'Apply preventive fungicide immediately',
                'Avoid irrigation in evening hours',
                'Monitor for yellow spots on leaves',
                'Increase field ventilation if possible'
            ],
            generatedAt: new Date('2026-01-28'),
            expiresAt: addDays(new Date(), 5),
            source: 'disease_prediction_model',
            isRead: false,
            channels: ['inapp', 'push'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 85
        },
        {
            id: 'w3',
            type: 'crop_health',
            subtype: 'pest_outbreak',
            title: 'Bollworm Infestation Detected - Cotton',
            description: 'Pheromone traps showing increased moth activity. Larvae found on 15% plants.',
            severity: 'critical',
            status: 'active',
            affectedCrops: [
                { id: 'crop3', name: 'Cotton', field: 'South Field', impact: 'Active infestation spreading' }
            ],
            actions: [
                'Immediate pesticide application required',
                'Use recommended bio-pesticides',
                'Release Trichogramma wasps for biological control',
                'Check neighboring fields for spread',
                'Monitor twice daily for 1 week'
            ],
            generatedAt: new Date('2026-01-27'),
            expiresAt: addDays(new Date(), 7),
            source: 'pest_monitoring_system',
            isRead: false,
            channels: ['inapp', 'push', 'sms'],
            autoGenerated: true,
            supervisorAlert: true,
            priorityScore: 98
        },
        {
            id: 'w4',
            type: 'weed',
            subtype: 'weed_risk',
            title: 'Critical Weeding Period - Maize',
            description: 'Maize at knee-high stage. Weed competition can reduce yield by 40%.',
            severity: 'high',
            status: 'active',
            affectedCrops: [
                { id: 'crop4', name: 'Maize', field: 'West Field', impact: 'Urgent weeding required' }
            ],
            actions: [
                'Schedule manual weeding within 2 days',
                'Consider mechanical weeding if available',
                'Apply post-emergence herbicide if suitable',
                'Remove weeds before they set seed'
            ],
            generatedAt: new Date('2026-01-28'),
            expiresAt: addDays(new Date(), 3),
            source: 'crop_stage_tracker',
            isRead: true,
            channels: ['inapp'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 80
        },
        {
            id: 'w5',
            type: 'resource',
            subtype: 'low_stock',
            title: 'Critical Stock Level - Seeds',
            description: 'Wheat seed stock below safety level. Only 8kg remaining.',
            severity: 'medium',
            status: 'active',
            affectedCrops: [
                { id: 'crop1', name: 'Wheat', field: 'North Field', impact: 'May delay sowing if not restocked' }
            ],
            actions: [
                'Purchase certified seeds immediately',
                'Contact 3 suppliers for best price',
                'Check seed quality certificate',
                'Arrange transport for bulk order'
            ],
            generatedAt: new Date('2026-01-28'),
            expiresAt: addDays(new Date(), 5),
            source: 'inventory_system',
            isRead: false,
            channels: ['inapp'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 70
        },
        {
            id: 'w6',
            type: 'activity',
            subtype: 'delay',
            title: 'Irrigation Delay - Critical Growth Stage',
            description: 'Rice irrigation delayed by 3 days during flowering stage.',
            severity: 'high',
            status: 'active',
            affectedCrops: [
                { id: 'crop2', name: 'Rice', field: 'East Paddy', impact: 'Yield loss risk: 10-15%' }
            ],
            actions: [
                'Immediate irrigation required today',
                'Increase water depth to 7-10cm',
                'Apply stress-relieving micronutrients',
                'Document delay for future reference'
            ],
            generatedAt: new Date('2026-01-28'),
            expiresAt: addDays(new Date(), 1),
            source: 'activity_tracker',
            isRead: false,
            channels: ['inapp', 'push'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 88
        },
        {
            id: 'w7',
            type: 'weather',
            subtype: 'heatwave',
            title: 'Heatwave Alert - Next 5 Days',
            description: 'Temperature expected to reach 42°C. Risk of heat stress in crops.',
            severity: 'high',
            status: 'active',
            affectedCrops: [
                { id: 'crop1', name: 'Wheat', field: 'North Field', impact: 'Grain filling may be affected' },
                { id: 'crop4', name: 'Maize', field: 'West Field', impact: 'Silking stage vulnerable' }
            ],
            actions: [
                'Increase irrigation frequency',
                'Apply mulch to conserve soil moisture',
                'Avoid spraying during peak heat',
                'Monitor for wilting symptoms'
            ],
            generatedAt: new Date('2026-01-29'),
            expiresAt: addDays(new Date(), 5),
            source: 'weather_api',
            isRead: false,
            channels: ['inapp', 'push', 'sms'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 82
        },
        {
            id: 'w8',
            type: 'supervisor',
            subtype: 'government_alert',
            title: 'Government Alert: Locust Warning',
            description: 'Agriculture Department: Locust movement detected in neighboring district.',
            severity: 'critical',
            status: 'active',
            affectedCrops: [
                { id: 'crop1', name: 'Wheat', field: 'All Fields', impact: 'High risk of crop devastation' }
            ],
            actions: [
                'Set up pheromone traps immediately',
                'Contact KVK for preventive measures',
                'Join WhatsApp group for updates',
                'Report any locust sightings to 1800-xxx-xxxx',
                'Prepare for emergency spraying'
            ],
            generatedAt: new Date('2026-01-29'),
            expiresAt: addDays(new Date(), 14),
            source: 'government_agency',
            isRead: false,
            channels: ['inapp', 'push', 'sms', 'email'],
            autoGenerated: true,
            supervisorAlert: true,
            priorityScore: 100
        },
        {
            id: 'w9',
            type: 'worker',
            subtype: 'equipment_damage',
            title: 'Worker Report: Pump Motor Issue',
            description: 'Worker Suresh reported unusual noise from irrigation pump motor.',
            severity: 'medium',
            status: 'active',
            affectedCrops: [
                { id: 'crop2', name: 'Rice', field: 'East Paddy', impact: 'Irrigation may be interrupted' }
            ],
            actions: [
                'Inspect pump motor immediately',
                'Check for bearing damage',
                'Contact electrician if needed',
                'Keep backup pump ready'
            ],
            generatedAt: new Date('2026-01-29'),
            expiresAt: addDays(new Date(), 1),
            source: 'worker_report',
            isRead: false,
            channels: ['inapp'],
            autoGenerated: false,
            supervisorAlert: false,
            reportedBy: { id: 'w2', name: 'Suresh', time: '09:30' },
            priorityScore: 75
        },
        {
            id: 'w10',
            type: 'crop_health',
            subtype: 'nutrient_deficiency',
            title: 'Nitrogen Deficiency Symptoms - Cotton',
            description: 'Yellowing of lower leaves observed. Nitrogen levels below optimal.',
            severity: 'medium',
            status: 'active',
            affectedCrops: [
                { id: 'crop3', name: 'Cotton', field: 'South Field', impact: 'Growth rate slowing' }
            ],
            actions: [
                'Apply nitrogen fertilizer within 2 days',
                'Use foliar spray for quick recovery',
                'Soil test to confirm deficiency',
                'Adjust future fertilizer schedule'
            ],
            generatedAt: new Date('2026-01-28'),
            expiresAt: addDays(new Date(), 4),
            source: 'crop_monitoring',
            isRead: true,
            channels: ['inapp'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 65
        },
        {
            id: 'w11',
            type: 'weather',
            subtype: 'frost',
            title: 'Frost Warning - Tonight',
            description: 'Temperature expected to drop to 2°C. Risk of frost damage.',
            severity: 'critical',
            status: 'resolved',
            affectedCrops: [
                { id: 'crop1', name: 'Wheat', field: 'North Field', impact: 'Frost damage to young plants' }
            ],
            actions: [
                'Light irrigation in evening',
                'Create smoke cover if possible',
                'Cover sensitive crops with mulch',
                'Monitor temperature every 2 hours'
            ],
            generatedAt: new Date('2026-01-25'),
            expiresAt: new Date('2026-01-26'),
            resolvedAt: new Date('2026-01-26'),
            resolution: 'Preventive measures successful. No damage reported.',
            source: 'weather_api',
            isRead: true,
            channels: ['inapp', 'push', 'sms'],
            autoGenerated: true,
            supervisorAlert: true,
            priorityScore: 90
        },
        {
            id: 'w12',
            type: 'activity',
            subtype: 'worker_absence',
            title: 'Worker Absence Alert',
            description: '3 workers absent today. Critical activities may be delayed.',
            severity: 'medium',
            status: 'active',
            affectedCrops: [
                { id: 'crop3', name: 'Cotton', field: 'South Field', impact: 'Weeding delayed' }
            ],
            actions: [
                'Call backup workers immediately',
                'Prioritize critical activities',
                'Reschedule less urgent tasks',
                'Document absence for payroll'
            ],
            generatedAt: new Date('2026-01-29'),
            expiresAt: addDays(new Date(), 0),
            source: 'attendance_system',
            isRead: false,
            channels: ['inapp'],
            autoGenerated: true,
            supervisorAlert: false,
            priorityScore: 60
        }
    ]);
    
    // History Data
    const [history, setHistory] = useState([
        {
            id: 'h1',
            type: 'reminder',
            action: 'completed',
            title: 'Sow Wheat in North Field',
            completedBy: 'Ramesh',
            completedAt: new Date('2026-01-20'),
            notes: 'Completed successfully. 50kg seeds used.',
            originalDueDate: new Date('2026-01-20'),
            priority: 'critical'
        },
        {
            id: 'h2',
            type: 'warning',
            action: 'resolved',
            title: 'Heavy Rain Forecast',
            resolvedBy: 'System',
            resolvedAt: new Date('2026-01-22'),
            notes: 'Rainfall was moderate. No damage reported.',
            actionsTaken: ['Cleared drainage', 'Moved equipment'],
            severity: 'high'
        },
        {
            id: 'h3',
            type: 'reminder',
            action: 'snoozed',
            title: 'Tractor Service',
            snoozedBy: 'Admin',
            snoozedAt: new Date('2026-01-25'),
            snoozeDuration: '3 days',
            notes: 'Service delayed due to festival holidays.',
            priority: 'medium'
        },
        {
            id: 'h4',
            type: 'reminder',
            action: 'rescheduled',
            title: 'Fertilizer Application',
            rescheduledBy: 'Admin',
            rescheduledAt: new Date('2026-01-26'),
            fromDate: new Date('2026-01-25'),
            toDate: new Date('2026-01-28'),
            notes: 'Rescheduled due to rain forecast.',
            priority: 'high'
        },
        {
            id: 'h5',
            type: 'warning',
            action: 'dismissed',
            title: 'Low Stock Alert - Seeds',
            dismissedBy: 'Admin',
            dismissedAt: new Date('2026-01-24'),
            notes: 'False alarm. Stock verified manually.',
            severity: 'medium'
        },
        {
            id: 'h6',
            type: 'reminder',
            action: 'completed',
            title: 'Weekly Worker Payment',
            completedBy: 'System',
            completedAt: new Date('2026-01-27'),
            notes: 'Auto-payment successful. Total: ₹12,400',
            originalDueDate: new Date('2026-01-27'),
            priority: 'medium'
        }
    ]);
    
    // Settings
    const [settings, setSettings] = useState({
        notifications: {
            inapp: true,
            push: true,
            sms: false,
            email: true
        },
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '06:00'
        },
        priorities: {
            critical: { inapp: true, push: true, sms: true, email: true },
            high: { inapp: true, push: true, sms: false, email: true },
            medium: { inapp: true, push: false, sms: false, email: false },
            low: { inapp: true, push: false, sms: false, email: false }
        },
        autoSnooze: {
            enabled: true,
            duration: 30 // minutes
        },
        language: 'en',
        simpleMode: false
    });
    
    // New reminder form state
    const [newReminder, setNewReminder] = useState({
        title: '',
        description: '',
        type: 'custom',
        subtype: 'one_time',
        dueDate: new Date(),
        dueTime: '08:00',
        priority: 'medium',
        recurring: false,
        recurringPattern: 'daily',
        cropId: '',
        fieldId: '',
        assigneeId: '',
        channels: ['inapp'],
        notes: ''
    });
    
    // ==================== COMPUTED DATA ====================
    
    const stats = useMemo(() => {
        const pendingReminders = reminders.filter(r => r.status === 'pending' || r.status === 'overdue').length;
        const overdueReminders = reminders.filter(r => r.status === 'overdue').length;
        const activeWarnings = warnings.filter(w => w.status === 'active').length;
        const criticalWarnings = warnings.filter(w => w.status === 'active' && w.severity === 'critical').length;
        const unreadAlerts = [...reminders, ...warnings].filter(item => !item.isRead).length;
        const todaysItems = reminders.filter(r => isToday(r.dueDate) && (r.status === 'pending' || r.status === 'overdue')).length;
        
        return {
            pendingReminders,
            overdueReminders,
            activeWarnings,
            criticalWarnings,
            unreadAlerts,
            todaysItems
        };
    }, [reminders, warnings]);
    
    const filteredReminders = useMemo(() => {
        let filtered = [...reminders];
        
        if (filters.crop !== 'all') {
            filtered = filtered.filter(r => r.cropId === filters.crop);
        }
        if (filters.type !== 'all') {
            filtered = filtered.filter(r => r.type === filters.type);
        }
        if (filters.severity !== 'all') {
            filtered = filtered.filter(r => r.priority === filters.severity);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(r => r.status === filters.status);
        }
        
        filtered.sort((a, b) => {
            const priorityOrder = { critical: 3, high: 3, medium: 2, low: 1, informational: 0 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            if (sortConfig.key === 'date') {
                return sortConfig.direction === 'asc' 
                    ? a.dueDate - b.dueDate 
                    : b.dueDate - a.dueDate;
            }
            return 0;
        });
        
        return filtered;
    }, [reminders, filters, sortConfig]);
    
    const filteredWarnings = useMemo(() => {
        let filtered = [...warnings];
        
        if (filters.crop !== 'all') {
            filtered = filtered.filter(w => w.affectedCrops.some(c => c.id === filters.crop));
        }
        if (filters.type !== 'all') {
            filtered = filtered.filter(w => w.type === filters.type);
        }
        if (filters.severity !== 'all') {
            filtered = filtered.filter(w => w.severity === filters.severity);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(w => w.status === filters.status);
        }
        
        filtered.sort((a, b) => b.priorityScore - a.priorityScore);
        
        return filtered;
    }, [warnings, filters]);
    
    const filteredHistory = useMemo(() => {
        let filtered = [...history];
        
        filtered.sort((a, b) => b.completedAt || b.resolvedAt || b.snoozedAt || b.rescheduledAt || b.dismissedAt - 
                                (a.completedAt || a.resolvedAt || a.snoozedAt || a.rescheduledAt || a.dismissedAt));
        
        return filtered;
    }, [history]);
    
    // ==================== HANDLERS ====================
    
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };
    
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    
    const handleMarkComplete = (reminderId) => {
        const reminder = reminders.find(r => r.id === reminderId);
        setReminders(prev => prev.map(r => 
            r.id === reminderId 
                ? { ...r, status: 'completed', completedAt: new Date() }
                : r
        ));
        
        setHistory(prev => [{
            id: `h${Date.now()}`,
            type: 'reminder',
            action: 'completed',
            title: reminder.title,
            completedBy: 'You',
            completedAt: new Date(),
            notes: 'Marked as complete',
            originalDueDate: reminder.dueDate,
            priority: reminder.priority
        }, ...prev]);
        
        showSnackbar('Reminder marked as complete', 'success');
    };
    
    const handleSnooze = (item, type) => {
        setSnoozeDialog({ open: true, item, type });
    };
    
    const handleSnoozeConfirm = (duration) => {
        const { item, type } = snoozeDialog;
        const snoozedUntil = addHours(new Date(), duration);
        
        if (type === 'reminder') {
            setReminders(prev => prev.map(r => 
                r.id === item.id 
                    ? { ...r, snoozedUntil, status: 'snoozed' }
                    : r
            ));
            
            setHistory(prev => [{
                id: `h${Date.now()}`,
                type: 'reminder',
                action: 'snoozed',
                title: item.title,
                snoozedBy: 'You',
                snoozedAt: new Date(),
                snoozeDuration: `${duration} hours`,
                notes: `Snoozed for ${duration} hours`,
                priority: item.priority
            }, ...prev]);
        }
        
        setSnoozeDialog({ open: false, item: null, type: '' });
        showSnackbar(`Snoozed for ${duration} hours`, 'info');
    };
    
    const handleReschedule = (item, type) => {
        setRescheduleDialog({ open: true, item, type });
    };
    
    const handleRescheduleConfirm = (newDate) => {
        const { item, type } = rescheduleDialog;
        
        if (type === 'reminder') {
            setReminders(prev => prev.map(r => 
                r.id === item.id 
                    ? { ...r, dueDate: newDate, status: 'pending' }
                    : r
            ));
            
            setHistory(prev => [{
                id: `h${Date.now()}`,
                type: 'reminder',
                action: 'rescheduled',
                title: item.title,
                rescheduledBy: 'You',
                rescheduledAt: new Date(),
                fromDate: item.dueDate,
                toDate: newDate,
                notes: `Rescheduled to ${format(newDate, 'MMM dd, yyyy')}`,
                priority: item.priority
            }, ...prev]);
        }
        
        setRescheduleDialog({ open: false, item: null, type: '' });
        showSnackbar('Rescheduled successfully', 'success');
    };
    
    const handleDismissWarning = (warningId) => {
        const warning = warnings.find(w => w.id === warningId);
        setWarnings(prev => prev.map(w => 
            w.id === warningId 
                ? { ...w, status: 'dismissed', dismissedAt: new Date() }
                : w
        ));
        
        setHistory(prev => [{
            id: `h${Date.now()}`,
            type: 'warning',
            action: 'dismissed',
            title: warning.title,
            dismissedBy: 'You',
            dismissedAt: new Date(),
            notes: 'Manually dismissed',
            severity: warning.severity
        }, ...prev]);
        
        showSnackbar('Warning dismissed', 'info');
    };
    
    const handleResolveWarning = (warningId) => {
        const warning = warnings.find(w => w.id === warningId);
        setWarnings(prev => prev.map(w => 
            w.id === warningId 
                ? { ...w, status: 'resolved', resolvedAt: new Date() }
                : w
        ));
        
        setHistory(prev => [{
            id: `h${Date.now()}`,
            type: 'warning',
            action: 'resolved',
            title: warning.title,
            resolvedBy: 'You',
            resolvedAt: new Date(),
            notes: 'Issue resolved',
            actionsTaken: warning.actions,
            severity: warning.severity
        }, ...prev]);
        
        showSnackbar('Warning marked as resolved', 'success');
    };
    
    const handleMarkRead = (itemId, type) => {
        if (type === 'reminder') {
            setReminders(prev => prev.map(r => 
                r.id === itemId ? { ...r, isRead: true } : r
            ));
        } else {
            setWarnings(prev => prev.map(w => 
                w.id === itemId ? { ...w, isRead: true } : w
            ));
        }
    };
    
    const handleCreateReminder = () => {
        const reminder = {
            id: `r${Date.now()}`,
            ...newReminder,
            status: 'pending',
            completedAt: null,
            snoozedUntil: null,
            createdAt: new Date(),
            isRead: false,
            autoGenerated: false,
            source: 'manual'
        };
        
        setReminders(prev => [reminder, ...prev]);
        setCreateReminderDialog(false);
        setNewReminder({
            title: '',
            description: '',
            type: 'custom',
            subtype: 'one_time',
            dueDate: new Date(),
            dueTime: '08:00',
            priority: 'medium',
            recurring: false,
            recurringPattern: 'daily',
            cropId: '',
            fieldId: '',
            assigneeId: '',
            channels: ['inapp'],
            notes: ''
        });
        
        showSnackbar('Reminder created successfully', 'success');
    };
    
    const handleDeleteReminder = (reminderId) => {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
        showSnackbar('Reminder deleted', 'info');
    };
    
    const handleSaveSettings = () => {
        setSettingsDialog(false);
        showSnackbar('Settings saved successfully', 'success');
    };
    
    const handleClearFilters = () => {
        setFilters({
            crop: 'all',
            type: 'all',
            severity: 'all',
            status: 'all',
            dateRange: 'all'
        });
    };
    
    // ==================== RENDER HELPERS ====================
    
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            case 'informational': return 'default';
            default: return 'default';
        }
    };
    
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'critical': return <Error color="error" />;
            case 'high': return <Warning color="error" />;
            case 'medium': return <Info color="warning" />;
            case 'low': return <Info color="info" />;
            case 'informational': return <Info color="action" />;
            default: return <Info />;
        }
    };
    
    const getTypeIcon = (type) => {
        switch (type) {
            case 'activity': return <Agriculture />;
            case 'custom': return <CalendarToday />;
            case 'financial': return <AttachMoney />;
            case 'resource': return <Inventory />;
            case 'weather': return <Cloud />;
            case 'crop_health': return <LocalHospital />;
            case 'weed': return <Grass />;
            case 'supervisor': return <People />;
            case 'worker': return <Person />;
            default: return <Notifications />;
        }
    };
    
    const getStatusChip = (status) => {
        switch (status) {
            case 'pending': return <Chip size="small" label="Pending" color="warning" />;
            case 'completed': return <Chip size="small" label="Done" color="success" />;
            case 'overdue': return <Chip size="small" label="Overdue" color="error" />;
            case 'snoozed': return <Chip size="small" label="Snoozed" color="default" />;
            case 'active': return <Chip size="small" label="Active" color="error" />;
            case 'resolved': return <Chip size="small" label="Resolved" color="success" />;
            case 'dismissed': return <Chip size="small" label="Dismissed" color="default" />;
            default: return <Chip size="small" label={status} />;
        }
    };
    
    const formatDueDate = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isPast(date) && !isToday(date)) return `${Math.abs(differenceInDays(date, new Date()))} days ago`;
        return format(date, 'MMM dd');
    };
    
    // ==================== DIALOG COMPONENTS ====================
    
    const CreateReminderDialog = () => (
        <Dialog open={createReminderDialog} onClose={() => setCreateReminderDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Add color="primary" />
                    Create New Reminder
                </Box>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={newReminder.title}
                            onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                            placeholder="e.g., Apply Fertilizer"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Description"
                            value={newReminder.description}
                            onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                            placeholder="Add details about this reminder"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={newReminder.type}
                                onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                                label="Type"
                            >
                                <MenuItem value="activity">Activity</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                                <MenuItem value="financial">Financial</MenuItem>
                                <MenuItem value="resource">Resource</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={newReminder.priority}
                                onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
                                label="Priority"
                            >
                                <MenuItem value="critical">Critical</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="informational">Informational</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Due Date"
                            value={newReminder.dueDate}
                            onChange={(date) => setNewReminder({ ...newReminder, dueDate: date })}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="time"
                            label="Due Time"
                            value={newReminder.dueTime}
                            onChange={(e) => setNewReminder({ ...newReminder, dueTime: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={newReminder.recurring}
                                    onChange={(e) => setNewReminder({ ...newReminder, recurring: e.target.checked })}
                                />
                            }
                            label="Recurring Reminder"
                        />
                    </Grid>
                    {newReminder.recurring && (
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Repeat Pattern</InputLabel>
                                <Select
                                    value={newReminder.recurringPattern}
                                    onChange={(e) => setNewReminder({ ...newReminder, recurringPattern: e.target.value })}
                                    label="Repeat Pattern"
                                >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Notification Channels</InputLabel>
                            <Select
                                multiple
                                value={newReminder.channels}
                                onChange={(e) => setNewReminder({ ...newReminder, channels: e.target.value })}
                                label="Notification Channels"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                <MenuItem value="inapp">In-App</MenuItem>
                                <MenuItem value="push">Push Notification</MenuItem>
                                <MenuItem value="sms">SMS</MenuItem>
                                <MenuItem value="email">Email</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Notes"
                            value={newReminder.notes}
                            onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                            placeholder="Additional notes or instructions"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCreateReminderDialog(false)}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={handleCreateReminder}
                    disabled={!newReminder.title}
                    startIcon={<Add />}
                >
                    Create Reminder
                </Button>
            </DialogActions>
        </Dialog>
    );
    
    const SnoozeDialog = () => {
        const [duration, setDuration] = useState(1);
        
        return (
            <Dialog open={snoozeDialog.open} onClose={() => setSnoozeDialog({ open: false, item: null, type: '' })}>
                <DialogTitle>
                    <NotificationsPaused sx={{ mr: 1 }} />
                    Snooze Reminder
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        How long would you like to snooze "{snoozeDialog.item?.title}"?
                    </Typography>
                    <RadioGroup value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}>
                        <FormControlLabel value={1} control={<Radio />} label="1 hour" />
                        <FormControlLabel value={3} control={<Radio />} label="3 hours" />
                        <FormControlLabel value={6} control={<Radio />} label="6 hours" />
                        <FormControlLabel value={24} control={<Radio />} label="1 day" />
                        <FormControlLabel value={72} control={<Radio />} label="3 days" />
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSnoozeDialog({ open: false, item: null, type: '' })}>Cancel</Button>
                    <Button variant="contained" onClick={() => handleSnoozeConfirm(duration)}>
                        Snooze
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };
    
    const RescheduleDialog = () => {
        const [newDate, setNewDate] = useState(rescheduleDialog.item?.dueDate || new Date());
        
        return (
            <Dialog open={rescheduleDialog.open} onClose={() => setRescheduleDialog({ open: false, item: null, type: '' })}>
                <DialogTitle>
                    <Schedule sx={{ mr: 1 }} />
                    Reschedule
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Select new date for "{rescheduleDialog.item?.title}":
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <DatePicker
                            label="New Due Date"
                            value={newDate}
                            onChange={setNewDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={new Date()}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRescheduleDialog({ open: false, item: null, type: '' })}>Cancel</Button>
                    <Button variant="contained" onClick={() => handleRescheduleConfirm(newDate)}>
                        Reschedule
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };
    
    const WarningDetailsDialog = () => {
        const warning = warningDetailsDialog.warning;
        if (!warning) return null;
        
        return (
            <Dialog 
                open={warningDetailsDialog.open} 
                onClose={() => setWarningDetailsDialog({ open: false, warning: null })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning color={warning.severity === 'critical' ? 'error' : 'warning'} />
                        {warning.title}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity={warning.severity} sx={{ mb: 2 }}>
                        <AlertTitle>
                            {warning.severity === 'critical' ? 'Critical Warning' : 
                             warning.severity === 'high' ? 'High Priority Warning' : 'Warning'}
                        </AlertTitle>
                        {warning.description}
                    </Alert>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Affected Crops
                    </Typography>
                    <List>
                        {warning.affectedCrops.map((crop, idx) => (
                            <ListItem key={idx}>
                                <ListItemIcon>
                                    <Agriculture color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${crop.name} - ${crop.field}`}
                                    secondary={crop.impact}
                                />
                            </ListItem>
                        ))}
                    </List>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Recommended Actions
                    </Typography>
                    <List>
                        {warning.actions.map((action, idx) => (
                            <ListItem key={idx}>
                                <ListItemIcon>
                                    <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText primary={action} />
                            </ListItem>
                        ))}
                    </List>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="textSecondary">
                        Generated: {format(warning.generatedAt, 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Source: {warning.source.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    {warning.reportedBy && (
                        <Typography variant="body2" color="textSecondary">
                            Reported by: {warning.reportedBy.name} at {warning.reportedBy.time}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWarningDetailsDialog({ open: false, warning: null })}>
                        Close
                    </Button>
                    {warning.status === 'active' && (
                        <>
                            <Button 
                                variant="outlined" 
                                color="error"
                                onClick={() => {
                                    handleDismissWarning(warning.id);
                                    setWarningDetailsDialog({ open: false, warning: null });
                                }}
                            >
                                Dismiss
                            </Button>
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => {
                                    handleResolveWarning(warning.id);
                                    setWarningDetailsDialog({ open: false, warning: null });
                                }}
                                startIcon={<CheckCircle />}
                            >
                                Mark Resolved
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        );
    };
    
    const SettingsDialog = () => (
        <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings color="primary" />
                    Notification Settings
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="h6" gutterBottom>Notification Channels</Typography>
                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={settings.notifications.inapp} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, inapp: e.target.checked } })} />}
                        label="In-App Notifications"
                    />
                    <FormControlLabel
                        control={<Switch checked={settings.notifications.push} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, push: e.target.checked } })} />}
                        label="Push Notifications"
                    />
                    <FormControlLabel
                        control={<Switch checked={settings.notifications.sms} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, sms: e.target.checked } })} />}
                        label="SMS Notifications"
                    />
                    <FormControlLabel
                        control={<Switch checked={settings.notifications.email} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, email: e.target.checked } })} />}
                        label="Email Notifications"
                    />
                </FormGroup>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Quiet Hours</Typography>
                <FormControlLabel
                    control={<Switch checked={settings.quietHours.enabled} onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, enabled: e.target.checked } })} />}
                    label="Enable Quiet Hours"
                />
                {settings.quietHours.enabled && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="time"
                                label="Start Time"
                                value={settings.quietHours.start}
                                onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, start: e.target.value } })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="time"
                                label="End Time"
                                value={settings.quietHours.end}
                                onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, end: e.target.value } })}
                            />
                        </Grid>
                    </Grid>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Priority-Based Notifications</Typography>
                {Object.entries(settings.priorities).map(([priority, channels]) => (
                    <Box key={priority} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                            {priority} Priority
                        </Typography>
                        <FormGroup row>
                            <FormControlLabel
                                control={<Checkbox checked={channels.inapp} onChange={(e) => setSettings({ ...settings, priorities: { ...settings.priorities, [priority]: { ...channels, inapp: e.target.checked } } })} />}
                                label="In-App"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={channels.push} onChange={(e) => setSettings({ ...settings, priorities: { ...settings.priorities, [priority]: { ...channels, push: e.target.checked } } })} />}
                                label="Push"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={channels.sms} onChange={(e) => setSettings({ ...settings, priorities: { ...settings.priorities, [priority]: { ...channels, sms: e.target.checked } } })} />}
                                label="SMS"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={channels.email} onChange={(e) => setSettings({ ...settings, priorities: { ...settings.priorities, [priority]: { ...channels, email: e.target.checked } } })} />}
                                label="Email"
                            />
                        </FormGroup>
                    </Box>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Preferences</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Language</InputLabel>
                    <Select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        label="Language"
                    >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="hi">Hindi</MenuItem>
                        <MenuItem value="mr">Marathi</MenuItem>
                        <MenuItem value="te">Telugu</MenuItem>
                        <MenuItem value="ta">Tamil</MenuItem>
                        <MenuItem value="kn">Kannada</MenuItem>
                        <MenuItem value="gu">Gujarati</MenuItem>
                        <MenuItem value="pa">Punjabi</MenuItem>
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={<Switch checked={settings.simpleMode} onChange={(e) => setSettings({ ...settings, simpleMode: e.target.checked })} />}
                    label="Simple Mode (Easy Language)"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveSettings} startIcon={<CheckCircle />}>
                    Save Settings
                </Button>
            </DialogActions>
        </Dialog>
    );
    
    const FilterDialog = () => (
        <Dialog open={filterDialog} onClose={() => setFilterDialog(false)}>
            <DialogTitle>
                <FilterList sx={{ mr: 1 }} />
                Filter Items
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Crop</InputLabel>
                            <Select
                                value={filters.crop}
                                onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
                                label="Crop"
                            >
                                <MenuItem value="all">All Crops</MenuItem>
                                <MenuItem value="crop1">Wheat</MenuItem>
                                <MenuItem value="crop2">Rice</MenuItem>
                                <MenuItem value="crop3">Cotton</MenuItem>
                                <MenuItem value="crop4">Maize</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                label="Type"
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="activity">Activity</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                                <MenuItem value="financial">Financial</MenuItem>
                                <MenuItem value="resource">Resource</MenuItem>
                                <MenuItem value="weather">Weather</MenuItem>
                                <MenuItem value="crop_health">Crop Health</MenuItem>
                                <MenuItem value="weed">Weed</MenuItem>
                                <MenuItem value="supervisor">Supervisor</MenuItem>
                                <MenuItem value="worker">Worker</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Severity/Priority</InputLabel>
                            <Select
                                value={filters.severity}
                                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                                label="Severity/Priority"
                            >
                                <MenuItem value="all">All Levels</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="informational">Informational</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                label="Status"
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="overdue">Overdue</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClearFilters} startIcon={<ClearAll />}>
                    Clear All
                </Button>
                <Button onClick={() => setFilterDialog(false)} variant="contained">
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
    
    // ==================== TAB RENDERERS ====================
    
    const renderDashboard = () => (
        <Box>
            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: 'warning.light' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime color="warning" />
                                <Typography color="textSecondary" variant="body2">Pending</Typography>
                            </Box>
                            <Typography variant="h4">{stats.pendingReminders}</Typography>
                            <Typography variant="caption">Reminders</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: 'error.light' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Warning color="error" />
                                <Typography color="textSecondary" variant="body2">Active</Typography>
                            </Box>
                            <Typography variant="h4">{stats.activeWarnings}</Typography>
                            <Typography variant="caption">Warnings</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: stats.overdueReminders > 0 ? 'error.light' : 'success.light' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Error color={stats.overdueReminders > 0 ? 'error' : 'success'} />
                                <Typography color="textSecondary" variant="body2">Overdue</Typography>
                            </Box>
                            <Typography variant="h4" color={stats.overdueReminders > 0 ? 'error' : 'success'}>
                                {stats.overdueReminders}
                            </Typography>
                            <Typography variant="caption">Items</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Badge badgeContent={stats.unreadAlerts} color="error">
                                    <Notifications color="action" />
                                </Badge>
                                <Typography color="textSecondary" variant="body2">Unread</Typography>
                            </Box>
                            <Typography variant="h4">{stats.unreadAlerts}</Typography>
                            <Typography variant="caption">Alerts</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Today's Items */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday color="primary" />
                Today's Items ({stats.todaysItems})
            </Typography>
            
            <Grid container spacing={2}>
                {reminders
                    .filter(r => isToday(r.dueDate) && (r.status === 'pending' || r.status === 'overdue'))
                    .slice(0, 4)
                    .map(reminder => (
                        <Grid item xs={12} sm={6} key={reminder.id}>
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    borderLeft: 4, 
                                    borderLeftColor: reminder.status === 'overdue' ? 'error.main' : 'warning.main'
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" noWrap>{reminder.title}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {reminder.dueTime} • {reminder.cropName || 'No Crop'}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            size="small" 
                                            label={reminder.priority} 
                                            color={getPriorityColor(reminder.priority)}
                                        />
                                    </Box>
                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={() => handleMarkComplete(reminder.id)}
                                            startIcon={<Done />}
                                        >
                                            Done
                                        </Button>
                                        <Button 
                                            size="small" 
                                            onClick={() => handleSnooze(reminder, 'reminder')}
                                            startIcon={<Snooze />}
                                        >
                                            Snooze
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                {stats.todaysItems === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="success">
                            No items due today. You're all caught up!
                        </Alert>
                    </Grid>
                )}
            </Grid>
            
            {/* Critical Warnings */}
            {stats.criticalWarnings > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityHigh color="error" />
                        Critical Warnings ({stats.criticalWarnings})
                    </Typography>
                    
                    {warnings
                        .filter(w => w.status === 'active' && w.severity === 'critical')
                        .map(warning => (
                            <Alert 
                                key={warning.id} 
                                severity="error" 
                                sx={{ mb: 1 }}
                                action={
                                    <Button 
                                        color="inherit" 
                                        size="small"
                                        onClick={() => setWarningDetailsDialog({ open: true, warning })}
                                    >
                                        View
                                    </Button>
                                }
                            >
                                <AlertTitle>{warning.title}</AlertTitle>
                                {warning.description}
                            </Alert>
                        ))
                    }
                </>
            )}
            
            {/* Quick Actions */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Quick Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" startIcon={<Add />} onClick={() => setCreateReminderDialog(true)}>
                    Add Reminder
                </Button>
                <Button variant="outlined" startIcon={<Visibility />} onClick={() => setActiveTab(1)}>
                    View All Reminders
                </Button>
                <Button variant="outlined" startIcon={<Warning />} onClick={() => setActiveTab(2)}>
                    View Warnings
                </Button>
                <Button variant="outlined" startIcon={<Settings />} onClick={() => setSettingsDialog(true)}>
                    Settings
                </Button>
            </Stack>
        </Box>
    );
    
    const renderReminders = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    All Reminders ({filteredReminders.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<FilterList />}
                        onClick={() => setFilterDialog(true)}
                    >
                        Filter
                    </Button>
                    <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Add />}
                        onClick={() => setCreateReminderDialog(true)}
                    >
                        Add
                    </Button>
                </Box>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'date'}
                                    direction={sortConfig.direction}
                                    onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                >
                                    Due Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Crop/Field</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Channels</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReminders.map((reminder) => (
                            <TableRow 
                                key={reminder.id}
                                sx={{ 
                                    bgcolor: reminder.status === 'overdue' ? 'error.50' : 
                                            !reminder.isRead ? 'action.hover' : 'inherit'
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getTypeIcon(reminder.type)}
                                        <Box>
                                            <Typography variant="body2" fontWeight={!reminder.isRead ? 'bold' : 'normal'}>
                                                {reminder.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" noWrap>
                                                {reminder.description.substring(0, 40)}...
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip size="small" label={reminder.type} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color={reminder.status === 'overdue' ? 'error' : 'inherit'}>
                                        {formatDueDate(reminder.dueDate)}
                                    </Typography>
                                    <Typography variant="caption">{reminder.dueTime}</Typography>
                                </TableCell>
                                <TableCell>
                                    {reminder.cropName && (
                                        <Typography variant="body2">{reminder.cropName}</Typography>
                                    )}
                                    {reminder.fieldName && (
                                        <Typography variant="caption" color="textSecondary">{reminder.fieldName}</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        size="small" 
                                        label={reminder.priority} 
                                        color={getPriorityColor(reminder.priority)}
                                    />
                                </TableCell>
                                <TableCell>{getStatusChip(reminder.status)}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.5}>
                                        {reminder.channels.map(ch => (
                                            <Tooltip key={ch} title={ch}>
                                                <NotificationChannelIcon channel={ch} />
                                            </Tooltip>
                                        ))}
                                    </Stack>
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                        {reminder.status === 'pending' || reminder.status === 'overdue' ? (
                                            <>
                                                <Tooltip title="Mark Complete">
                                                    <IconButton size="small" color="success" onClick={() => handleMarkComplete(reminder.id)}>
                                                        <Done />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Snooze">
                                                    <IconButton size="small" onClick={() => handleSnooze(reminder, 'reminder')}>
                                                        <Snooze />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reschedule">
                                                    <IconButton size="small" onClick={() => handleReschedule(reminder, 'reminder')}>
                                                        <Schedule />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        ) : null}
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDeleteReminder(reminder.id)}>
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredReminders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="textSecondary" sx={{ py: 4 }}>
                                        No reminders found matching your filters
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
    
    const renderWarnings = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Active Warnings ({filteredWarnings.filter(w => w.status === 'active').length})
                </Typography>
                <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<FilterList />}
                    onClick={() => setFilterDialog(true)}
                >
                    Filter
                </Button>
            </Box>
            
            <Grid container spacing={2}>
                {filteredWarnings
                    .filter(w => w.status === 'active')
                    .map(warning => (
                        <Grid item xs={12} key={warning.id}>
                            <WarningCard severity={warning.severity}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                            {warning.severity === 'critical' ? <Error color="error" /> :
                                             warning.severity === 'high' ? <Warning color="error" /> :
                                             warning.severity === 'medium' ? <Warning color="warning" /> :
                                             <Info color="info" />}
                                            <Box>
                                                <Typography variant="h6" fontWeight={!warning.isRead ? 'bold' : 'normal'}>
                                                    {warning.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                    <Chip 
                                                        size="small" 
                                                        label={warning.type.replace(/_/g, ' ')} 
                                                        color={getPriorityColor(warning.severity)}
                                                    />
                                                    {warning.supervisorAlert && (
                                                        <Chip size="small" label="Supervisor" color="primary" />
                                                    )}
                                                    {warning.autoGenerated && (
                                                        <Chip size="small" label="Auto" variant="outlined" />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <IconButton onClick={() => setWarningDetailsDialog({ open: true, warning })}>
                                            <ArrowForward />
                                        </IconButton>
                                    </Box>
                                    
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        {warning.description}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Affected Crops:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {warning.affectedCrops.map((crop, idx) => (
                                                <Chip 
                                                    key={idx} 
                                                    size="small" 
                                                    icon={<Agriculture />}
                                                    label={`${crop.name} (${crop.field})`}
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Recommended Actions:
                                        </Typography>
                                        <List dense>
                                            {warning.actions.slice(0, 3).map((action, idx) => (
                                                <ListItem key={idx} sx={{ py: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                                        <CheckCircle color="success" fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={action} />
                                                </ListItem>
                                            ))}
                                            {warning.actions.length > 3 && (
                                                <Typography variant="caption" color="primary">
                                                    +{warning.actions.length - 3} more actions
                                                </Typography>
                                            )}
                                        </List>
                                    </Box>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">
                                            Generated: {format(warning.generatedAt, 'MMM dd, HH:mm')}
                                            {warning.reportedBy && ` • Reported by: ${warning.reportedBy.name}`}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button 
                                                size="small" 
                                                variant="outlined"
                                                onClick={() => handleDismissWarning(warning.id)}
                                            >
                                                Dismiss
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="success"
                                                onClick={() => handleResolveWarning(warning.id)}
                                                startIcon={<CheckCircle />}
                                            >
                                                Resolved
                                            </Button>
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </WarningCard>
                        </Grid>
                    ))}
                {filteredWarnings.filter(w => w.status === 'active').length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="success">
                            No active warnings. Everything looks good!
                        </Alert>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
    
    const renderHistory = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Activity History
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Action</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>By</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredHistory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Chip 
                                        size="small" 
                                        label={item.action}
                                        color={
                                            item.action === 'completed' || item.action === 'resolved' ? 'success' :
                                            item.action === 'dismissed' ? 'default' :
                                            'info'
                                        }
                                    />
                                </TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>
                                    <Chip size="small" label={item.type} variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    {format(
                                        item.completedAt || item.resolvedAt || item.snoozedAt || item.rescheduledAt || item.dismissedAt,
                                        'MMM dd, HH:mm'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {item.completedBy || item.resolvedBy || item.snoozedBy || item.rescheduledBy || item.dismissedBy}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {item.notes}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredHistory.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="textSecondary" sx={{ py: 4 }}>
                                        No history records found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
    
    const renderSettings = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Quick Settings
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Notification Channels</Typography>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Switch checked={settings.notifications.inapp} />}
                                    label="In-App Notifications"
                                />
                                <FormControlLabel
                                    control={<Switch checked={settings.notifications.push} />}
                                    label="Push Notifications"
                                />
                                <FormControlLabel
                                    control={<Switch checked={settings.notifications.sms} />}
                                    label="SMS Notifications"
                                />
                                <FormControlLabel
                                    control={<Switch checked={settings.notifications.email} />}
                                    label="Email Notifications"
                                />
                            </FormGroup>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Quiet Hours</Typography>
                            <FormControlLabel
                                control={<Switch checked={settings.quietHours.enabled} />}
                                label="Enable Quiet Hours"
                            />
                            {settings.quietHours.enabled && (
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    {settings.quietHours.start} - {settings.quietHours.end}
                                </Typography>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="h6" gutterBottom>Language</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Current: {settings.language === 'en' ? 'English' : settings.language}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <FormControlLabel
                                control={<Switch checked={settings.simpleMode} />}
                                label="Simple Mode (Easy Language)"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
                <Button 
                    variant="contained" 
                    startIcon={<Settings />}
                    onClick={() => setSettingsDialog(true)}
                >
                    Open Full Settings
                </Button>
            </Box>
        </Box>
    );
    
    // ==================== MAIN RENDER ====================
    
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Notifications fontSize="large" color="primary" />
                                Warnings & Reminders
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Stay on top of your farm activities and alerts
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Language">
                                <IconButton onClick={() => setSettingsDialog(true)}>
                                    <Translate />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Settings">
                                <IconButton onClick={() => setSettingsDialog(true)}>
                                    <Settings />
                                </IconButton>
                            </Tooltip>
                            <Badge badgeContent={stats.unreadAlerts} color="error">
                                <IconButton>
                                    <Notifications />
                                </IconButton>
                            </Badge>
                        </Box>
                    </Box>
                    
                    {/* Tabs */}
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        sx={{ mt: 2 }}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab 
                            icon={<Dashboard />} 
                            label="Dashboard" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<Badge badgeContent={stats.pendingReminders} color="warning"><AccessTime /></Badge>} 
                            label="Reminders" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<Badge badgeContent={stats.activeWarnings} color="error"><Warning /></Badge>} 
                            label="Warnings" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<History />} 
                            label="History" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<Settings />} 
                            label="Settings" 
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>
                
                {/* Tab Content */}
                <Paper sx={{ p: 3 }}>
                    {activeTab === 0 && renderDashboard()}
                    {activeTab === 1 && renderReminders()}
                    {activeTab === 2 && renderWarnings()}
                    {activeTab === 3 && renderHistory()}
                    {activeTab === 4 && renderSettings()}
                </Paper>
                
                {/* Dialogs */}
                <CreateReminderDialog />
                <SnoozeDialog />
                <RescheduleDialog />
                <WarningDetailsDialog />
                <SettingsDialog />
                <FilterDialog />
                
                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </LocalizationProvider>
    );
};

export default WarningsReminders;
