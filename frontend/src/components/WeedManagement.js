import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    Alert,
    LinearProgress,
    TextField,
    Stepper,
    Step,
    StepLabel,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Avatar,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Radio,
    RadioGroup,
    Slider,
    Switch,
    Menu,
    Fab,
    Snackbar,
    Alert as MuiAlert,
    Chip as MuiChip,
    CardActionArea,
    Pagination,
    InputAdornment,
    Autocomplete
} from '@mui/material';
import {
    Add,
    Warning,
    CheckCircle,
    Error,
    Agriculture,
    Grass,
    LocalFlorist,
    Upload,
    MoreVert,
    LocalHospital,
    Science,
    BugReport,
    Spa,
    TrendingUp,
    TrendingDown,
    Map,
    Schedule,
    Security,
    Money,
    ExpandMore,
    ArrowBack,
    ArrowForward,
    Check,
    Close,
    PhotoCamera,
    LocationOn,
    CalendarToday,
    Person,
    Assignment,
    Dashboard,
    Search,
    FilterList,
    History,
    Analytics,
    SupportAgent,
    Gavel,
    Nature,
    Build,
    LocalDrink,
    Lightbulb,
    NotificationsActive,
    Link as LinkIcon,
    Verified,
    Info
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
    ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Mock Data
const MOCK_WEEDS = [
    {
        id: 1,
        name: 'Parthenium',
        localName: 'Congress Grass',
        scientificName: 'Parthenium hysterophorus',
        type: 'broadleaf',
        crops: ['wheat', 'maize', 'cotton', 'vegetables'],
        symptoms: ['tall growth', 'feathery leaves', 'white flowers'],
        competitionRisk: 'high',
        yieldLoss: '40-90%',
        images: ['https://example.com/parthenium1.jpg'],
        description: 'Aggressive invasive weed that releases allelopathic chemicals',
        controlMethods: ['mechanical', 'chemical', 'biological']
    },
    {
        id: 2,
        name: 'Phalaris',
        localName: 'Canary Grass',
        scientificName: 'Phalaris minor',
        type: 'grassy',
        crops: ['wheat', 'barley'],
        symptoms: ['resembles wheat', 'seed heads', 'blue-green color'],
        competitionRisk: 'high',
        yieldLoss: '15-30%',
        images: ['https://example.com/phalaris1.jpg'],
        description: 'Major grassy weed in wheat fields',
        controlMethods: ['chemical', 'cultural']
    },
    {
        id: 3,
        name: 'Cyperus',
        localName: 'Motha',
        scientificName: 'Cyperus rotundus',
        type: 'sedge',
        crops: ['sugarcane', 'maize', 'cotton', 'rice'],
        symptoms: ['triangular stems', 'underground tubers', 'purple flowers'],
        competitionRisk: 'high',
        yieldLoss: '20-50%',
        images: ['https://example.com/cyperus1.jpg'],
        description: 'Worlds worst weed with extensive tuber system',
        controlMethods: ['mechanical', 'chemical', 'cultural', 'organic']
    },
    {
        id: 4,
        name: 'Chenopodium',
        localName: 'Bathua',
        scientificName: 'Chenopodium album',
        type: 'broadleaf',
        crops: ['wheat', 'maize', 'vegetables'],
        symptoms: ['mealy leaves', 'white powdery coating', 'dense growth'],
        competitionRisk: 'medium',
        yieldLoss: '10-25%',
        images: ['https://example.com/chenopodium1.jpg'],
        description: 'Fast-growing annual broadleaf weed',
        controlMethods: ['mechanical', 'cultural', 'organic']
    },
    {
        id: 5,
        name: 'Trianthema',
        localName: 'Itsit',
        scientificName: 'Trianthema portulacastrum',
        type: 'broadleaf',
        crops: ['cotton', 'groundnut', 'maize'],
        symptoms: ['prostrate growth', 'opposite leaves', 'pink flowers'],
        competitionRisk: 'medium',
        yieldLoss: '15-35%',
        images: ['https://example.com/trianthema1.jpg'],
        description: 'Drought-tolerant summer weed',
        controlMethods: ['mechanical', 'chemical', 'cultural']
    },
    {
        id: 6,
        name: 'Echinochloa',
        localName: 'Savan',
        scientificName: 'Echinochloa crus-galli',
        type: 'grassy',
        crops: ['rice', 'maize', 'sorghum'],
        symptoms: ['barnyard grass appearance', 'purple tinge', 'dense stands'],
        competitionRisk: 'high',
        yieldLoss: '30-70%',
        images: ['https://example.com/echinochloa1.jpg'],
        description: 'Major weed in rice fields',
        controlMethods: ['chemical', 'cultural', 'mechanical']
    },
    {
        id: 7,
        name: 'Amaranthus',
        localName: 'Chaulai',
        scientificName: 'Amaranthus viridis',
        type: 'broadleaf',
        crops: ['cotton', 'maize', 'vegetables'],
        symptoms: ['reddish stems', 'oval leaves', 'dense inflorescence'],
        competitionRisk: 'medium',
        yieldLoss: '10-20%',
        images: ['https://example.com/amaranthus1.jpg'],
        description: 'Fast-growing broadleaf weed',
        controlMethods: ['mechanical', 'cultural', 'organic']
    },
    {
        id: 8,
        name: 'Eupatorium',
        localName: 'Jangli pudina',
        scientificName: 'Chromolaena odorata',
        type: 'broadleaf',
        crops: ['plantation', 'tea', 'coffee'],
        symptoms: ['strong odor', 'serrated leaves', 'purple flowers'],
        competitionRisk: 'high',
        yieldLoss: '50-80%',
        images: ['https://example.com/eupatorium1.jpg'],
        description: 'Invasive perennial shrub',
        controlMethods: ['mechanical', 'chemical', 'biological']
    }
];

const MOCK_HERBICIDES = [
    {
        id: 1,
        name: 'Glyphosate',
        type: 'non-selective',
        modeOfAction: 'systemic',
        applicationStage: 'pre-planting',
        dosage: '1.0-1.5 kg/ha',
        waterRequirement: '400-500 l/ha',
        waitingPeriod: 7,
        cropRotation: 15,
        safetyPeriod: 7,
        cost: 350,
        toxicity: 'low',
        resistanceRisk: 'medium',
        compatibility: ['metolachlor', 'atrazine'],
        incompatible: ['paraquat'],
        organic: false,
        equipment: ['knapsack', 'tractor-mounted'],
        precautions: ['wear protective clothing', 'avoid drift', 'rain-free period 6 hours']
    },
    {
        id: 2,
        name: '2,4-D',
        type: 'selective',
        modeOfAction: 'hormone',
        applicationStage: 'post-emergence',
        dosage: '0.5-1.0 kg/ha',
        waterRequirement: '300-400 l/ha',
        waitingPeriod: 30,
        cropRotation: 60,
        safetyPeriod: 30,
        cost: 200,
        toxicity: 'moderate',
        resistanceRisk: 'low',
        compatibility: ['mcpa', 'dicamba'],
        incompatible: ['organic phosphates'],
        organic: false,
        equipment: ['knapsack', 'boom sprayer'],
        precautions: ['avoid sensitive crops', 'calm weather', 'no volatilization']
    },
    {
        id: 3,
        name: 'Pendimethalin',
        type: 'selective',
        modeOfAction: 'cell division inhibitor',
        applicationStage: 'pre-emergence',
        dosage: '1.0-1.5 kg/ha',
        waterRequirement: '400-500 l/ha',
        waitingPeriod: 90,
        cropRotation: 120,
        safetyPeriod: 90,
        cost: 450,
        toxicity: 'low',
        resistanceRisk: 'low',
        compatibility: ['atrazine', 'metolachlor'],
        incompatible: ['strong acids'],
        organic: false,
        equipment: ['flat fan nozzles', 'boom sprayer'],
        precautions: ['soil incorporation needed', 'moisture required', 'uniform application']
    },
    {
        id: 4,
        name: 'Atrazine',
        type: 'selective',
        modeOfAction: 'photosynthesis inhibitor',
        applicationStage: 'pre-emergence',
        dosage: '1.0-1.5 kg/ha',
        waterRequirement: '400-500 l/ha',
        waitingPeriod: 60,
        cropRotation: 365,
        safetyPeriod: 60,
        cost: 300,
        toxicity: 'low',
        resistanceRisk: 'high',
        compatibility: ['pendimethalin', '2,4-D'],
        incompatible: ['strong alkalis'],
        organic: false,
        equipment: ['boom sprayer'],
        precautions: ['groundwater risk', 'buffer zones', 'restricted use']
    },
    {
        id: 5,
        name: 'Isoproturon',
        type: 'selective',
        modeOfAction: 'photosynthesis inhibitor',
        applicationStage: 'early post-emergence',
        dosage: '1.0-1.25 kg/ha',
        waterRequirement: '400-500 l/ha',
        waitingPeriod: 120,
        cropRotation: 150,
        safetyPeriod: 120,
        cost: 400,
        toxicity: 'low',
        resistanceRisk: 'high',
        compatibility: ['2,4-D', 'clodinafop'],
        incompatible: ['copper compounds'],
        organic: false,
        equipment: ['knapsack', 'boom sprayer'],
        precautions: [' Phalaris control', 'wheat only', 'timely application']
    },
    {
        id: 6,
        name: 'Clodinafop',
        type: 'selective',
        modeOfAction: 'ACCase inhibitor',
        applicationStage: 'post-emergence',
        dosage: '0.06-0.08 kg/ha',
        waterRequirement: '300-400 l/ha',
        waitingPeriod: 60,
        cropRotation: 90,
        safetyPeriod: 60,
        cost: 550,
        toxicity: 'low',
        resistanceRisk: 'high',
        compatibility: ['metribuzin', 'metsulfuron'],
        incompatible: ['broadleaf herbicides mix'],
        organic: false,
        equipment: ['knapsack', 'boom sprayer'],
        precautions: ['grassy weeds only', 'surfactant needed', 'proper timing']
    },
    {
        id: 7,
        name: 'Vinegar Solution',
        type: 'contact',
        modeOfAction: 'burning',
        applicationStage: 'any',
        dosage: '10-20% solution',
        waterRequirement: '200-300 l/ha',
        waitingPeriod: 0,
        cropRotation: 0,
        safetyPeriod: 0,
        cost: 50,
        toxicity: 'very low',
        resistanceRisk: 'none',
        compatibility: ['salt solutions'],
        incompatible: ['none'],
        organic: true,
        equipment: ['hand sprayer', 'knapsack'],
        precautions: ['multiple applications', 'hot weather best', 'spot treatment']
    },
    {
        id: 8,
        name: 'Corn Gluten Meal',
        type: 'pre-emergent',
        modeOfAction: 'growth inhibitor',
        applicationStage: 'pre-emergence',
        dosage: '450-900 kg/ha',
        waterRequirement: 'dry application',
        waitingPeriod: 0,
        cropRotation: 0,
        safetyPeriod: 0,
        cost: 800,
        toxicity: 'none',
        resistanceRisk: 'none',
        compatibility: ['organic mulch'],
        incompatible: ['none'],
        organic: true,
        equipment: ['broadcast spreader'],
        precautions: ['nitrogen source', 'timing critical', 'water activation']
    }
];

const MOCK_FIELDS = [
    { id: 1, name: 'Field A', area: 5.5, crop: 'Wheat', location: 'North' },
    { id: 2, name: 'Field B', area: 3.2, crop: 'Cotton', location: 'South' },
    { id: 3, name: 'Field C', area: 8.0, crop: 'Maize', location: 'East' },
    { id: 4, name: 'Field D', area: 4.5, crop: 'Sugarcane', location: 'West' },
    { id: 5, name: 'Field E', area: 6.0, crop: 'Rice', location: 'Central' },
    { id: 6, name: 'Field F', area: 2.8, crop: 'Vegetables', location: 'North' }
];

const MOCK_ISSUES = [
    {
        id: 1,
        fieldId: 1,
        fieldName: 'Field A',
        crop: 'Wheat',
        weedName: 'Phalaris',
        severity: 'severe',
        coverage: 65,
        stage: 'early post-emergence',
        reportedBy: 'John Doe',
        reportDate: '2026-01-20',
        status: 'applied',
        assignedTo: 'Supervisor A',
        photos: 3,
        controlMethod: 'chemical',
        herbicide: 'Isoproturon',
        cost: 2200,
        notes: 'Heavy infestation near irrigation channels',
        actions: [
            { date: '2026-01-20', action: 'Reported', by: 'John Doe' },
            { date: '2026-01-21', action: 'Control Planned', by: 'Supervisor A' },
            { date: '2026-01-22', action: 'Applied', by: 'Worker Team A' }
        ]
    },
    {
        id: 2,
        fieldId: 2,
        fieldName: 'Field B',
        crop: 'Cotton',
        weedName: 'Trianthema',
        severity: 'moderate',
        coverage: 40,
        stage: 'vegetative',
        reportedBy: 'Jane Smith',
        reportDate: '2026-01-25',
        status: 'control_planned',
        assignedTo: 'Supervisor B',
        photos: 2,
        controlMethod: 'mechanical',
        herbicide: null,
        cost: 1200,
        notes: 'Scattered patches, inter-row cultivation recommended',
        actions: [
            { date: '2026-01-25', action: 'Reported', by: 'Jane Smith' },
            { date: '2026-01-26', action: 'Control Planned', by: 'Supervisor B' }
        ]
    },
    {
        id: 3,
        fieldId: 3,
        fieldName: 'Field C',
        crop: 'Maize',
        weedName: 'Parthenium',
        severity: 'mild',
        coverage: 15,
        stage: 'pre-emergence',
        reportedBy: 'Mike Johnson',
        reportDate: '2026-01-28',
        status: 'reported',
        assignedTo: null,
        photos: 1,
        controlMethod: null,
        herbicide: null,
        cost: 0,
        notes: 'Early detection, preventive measures advised',
        actions: [
            { date: '2026-01-28', action: 'Reported', by: 'Mike Johnson' }
        ]
    },
    {
        id: 4,
        fieldId: 4,
        fieldName: 'Field D',
        crop: 'Sugarcane',
        weedName: 'Cyperus',
        severity: 'severe',
        coverage: 70,
        stage: 'late-stage',
        reportedBy: 'Sarah Wilson',
        reportDate: '2026-01-15',
        status: 'cleared',
        assignedTo: 'Supervisor C',
        photos: 4,
        controlMethod: 'cultural',
        herbicide: null,
        cost: 3500,
        notes: 'Repeated issue, multiple tubers found',
        actions: [
            { date: '2026-01-15', action: 'Reported', by: 'Sarah Wilson' },
            { date: '2026-01-16', action: 'Control Planned', by: 'Supervisor C' },
            { date: '2026-01-18', action: 'Applied', by: 'Worker Team C' },
            { date: '2026-01-25', action: 'Cleared', by: 'Sarah Wilson' }
        ]
    },
    {
        id: 5,
        fieldId: 1,
        fieldName: 'Field A',
        crop: 'Wheat',
        weedName: 'Chenopodium',
        severity: 'moderate',
        coverage: 35,
        stage: 'early post-emergence',
        reportedBy: 'John Doe',
        reportDate: '2026-01-10',
        status: 'cleared',
        assignedTo: 'Supervisor A',
        photos: 2,
        controlMethod: 'chemical',
        herbicide: '2,4-D',
        cost: 1100,
        notes: 'Hand weeding backup done',
        actions: [
            { date: '2026-01-10', action: 'Reported', by: 'John Doe' },
            { date: '2026-01-11', action: 'Control Planned', by: 'Supervisor A' },
            { date: '2026-01-12', action: 'Applied', by: 'Worker Team A' },
            { date: '2026-01-18', action: 'Cleared', by: 'John Doe' }
        ]
    }
];

const MOCK_HISTORY = [
    { month: 'Aug', year: 2025, issues: 8, controlled: 7, severity: 'moderate' },
    { month: 'Sep', year: 2025, issues: 5, controlled: 5, severity: 'low' },
    { month: 'Oct', year: 2025, issues: 3, controlled: 3, severity: 'low' },
    { month: 'Nov', year: 2025, issues: 6, controlled: 5, severity: 'moderate' },
    { month: 'Dec', year: 2025, issues: 4, controlled: 4, severity: 'low' },
    { month: 'Jan', year: 2026, issues: 5, controlled: 2, severity: 'moderate' }
];

const SEVERITY_CONFIG = {
    mild: { color: '#4CAF50', label: 'Mild', icon: CheckCircle },
    moderate: { color: '#FF9800', label: 'Moderate', icon: Warning },
    severe: { color: '#F44336', label: 'Severe', icon: Error }
};

const STATUS_CONFIG = {
    reported: { color: '#9E9E9E', label: 'Reported' },
    control_planned: { color: '#2196F3', label: 'Control Planned' },
    applied: { color: '#FF9800', label: 'Applied' },
    cleared: { color: '#4CAF50', label: 'Cleared' }
};

const GROWTH_STAGES = [
    { value: 'pre-emergence', label: 'Pre-Emergence', description: 'Before crop emerges' },
    { value: 'early-post-emergence', label: 'Early Post-Emergence', description: '2-3 weeks after sowing' },
    { value: 'vegetative', label: 'Vegetative Stage', description: 'Active growth phase' },
    { value: 'late-stage', label: 'Late Stage', description: 'Reproductive phase onwards' }
];

const WEED_TYPES = [
    { value: 'broadleaf', label: 'Broadleaf Weeds', icon: Spa, description: 'Dicotyledonous plants with net-like veins' },
    { value: 'grassy', label: 'Grassy Weeds', icon: Grass, description: 'Monocotyledonous plants with parallel veins' },
    { value: 'sedge', label: 'Sedge Weeds', icon: Nature, description: 'Triangular stems, often found in wet areas' }
];

const CONTROL_METHODS = [
    { value: 'mechanical', label: 'Mechanical', icon: Build, description: 'Manual/Mechanical removal' },
    { value: 'chemical', label: 'Chemical', icon: Science, description: 'Herbicide application' },
    { value: 'cultural', label: 'Cultural', icon: Agriculture, description: 'Crop rotation, mulching, etc.' },
    { value: 'organic', label: 'Organic', icon: Spa, description: 'Organic herbicides and methods' },
    { value: 'biological', label: 'Biological', icon: BugReport, description: 'Natural enemies and bio-control' }
];

const CROPS = [
    { value: 'wheat', label: 'Wheat', season: 'rabi' },
    { value: 'maize', label: 'Maize', season: 'kharif' },
    { value: 'cotton', label: 'Cotton', season: 'kharif' },
    { value: 'sugarcane', label: 'Sugarcane', season: 'annual' },
    { value: 'rice', label: 'Rice', season: 'kharif' },
    { value: 'groundnut', label: 'Groundnut', season: 'kharif' },
    { value: 'vegetables', label: 'Vegetables', season: 'all' },
    { value: 'barley', label: 'Barley', season: 'rabi' }
];

const SYMPTOMS = [
    'Tall growth habit',
    'Dense patches',
    'Similar to crop',
    'Underground tubers',
    'Quick spreading',
    'Difficult to pull',
    'Thorny/Spiny',
    'Strong odor',
    'Milky sap',
    'Hairy leaves',
    'Colorful flowers',
    'Prostrate growth'
];

const WeedManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Dashboard stats
    const [stats, setStats] = useState({
        activeIssues: 0,
        controlledThisMonth: 0,
        atRiskFields: 0,
        organicOptionsUsed: 0
    });

    // Identification wizard state
    const [identifyStep, setIdentifyStep] = useState(0);
    const [identifyData, setIdentifyData] = useState({
        crop: '',
        weedType: '',
        symptoms: [],
        stage: '',
        photos: []
    });
    const [identifiedWeeds, setIdentifiedWeeds] = useState([]);

    // Weed library filters
    const [libraryFilters, setLibraryFilters] = useState({
        crop: '',
        type: '',
        risk: ''
    });
    const [selectedWeed, setSelectedWeed] = useState(null);

    // Issue reporting
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [newIssue, setNewIssue] = useState({
        fieldId: '',
        crop: '',
        weedName: '',
        severity: 'mild',
        coverage: 20,
        stage: '',
        notes: '',
        photos: []
    });

    // Issues board
    const [issues, setIssues] = useState(MOCK_ISSUES);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [issueMenuAnchor, setIssueMenuAnchor] = useState(null);

    // Cost calculator
    const [costCalculator, setCostCalculator] = useState({
        fieldArea: 0,
        herbicide: '',
        dosage: 0,
        waterRate: 0,
        laborHours: 0,
        equipment: ''
    });

    // Herbicide compatibility
    const [compatibilityCheck, setCompatibilityCheck] = useState({
        herbicide1: '',
        herbicide2: '',
        crop: ''
    });

    // Supervisor validation
    const [supervisorReview, setSupervisorReview] = useState({
        issueId: null,
        approved: false,
        comments: '',
        alternative: ''
    });

    useEffect(() => {
        calculateStats();
    }, [issues]);

    const calculateStats = () => {
        const active = issues.filter(i => i.status !== 'cleared').length;
        const controlled = issues.filter(i => 
            i.status === 'cleared' && 
            new Date(i.actions[i.actions.length - 1]?.date).getMonth() === new Date().getMonth()
        ).length;
        const atRisk = new Set(issues.filter(i => i.severity === 'severe').map(i => i.fieldId)).size;
        const organic = issues.filter(i => i.controlMethod === 'organic' && i.status === 'applied').length;
        
        setStats({
            activeIssues: active,
            controlledThisMonth: controlled,
            atRiskFields: atRisk,
            organicOptionsUsed: organic
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Identification Wizard
    const identifySteps = ['Select Crop', 'Weed Type', 'Symptoms', 'Growth Stage', 'Upload Photos'];

    const handleIdentifyNext = () => {
        if (identifyStep < identifySteps.length - 1) {
            setIdentifyStep(identifyStep + 1);
        } else {
            // Perform identification
            performIdentification();
        }
    };

    const handleIdentifyBack = () => {
        if (identifyStep > 0) {
            setIdentifyStep(identifyStep - 1);
        }
    };

    const performIdentification = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const matches = MOCK_WEEDS.filter(weed => {
                const cropMatch = weed.crops.includes(identifyData.crop);
                const typeMatch = !identifyData.weedType || weed.type === identifyData.weedType;
                const symptomMatch = identifyData.symptoms.length === 0 || 
                    identifyData.symptoms.some(s => weed.symptoms.some(ws => ws.toLowerCase().includes(s.toLowerCase())));
                return cropMatch && typeMatch && symptomMatch;
            });
            setIdentifiedWeeds(matches.length > 0 ? matches : MOCK_WEEDS.slice(0, 3));
            setLoading(false);
            showSnackbar(`Found ${matches.length} potential matches`);
        }, 1500);
    };

    const resetIdentification = () => {
        setIdentifyStep(0);
        setIdentifyData({
            crop: '',
            weedType: '',
            symptoms: [],
            stage: '',
            photos: []
        });
        setIdentifiedWeeds([]);
    };

    const handleSymptomToggle = (symptom) => {
        setIdentifyData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const renderIdentifyStep = () => {
        switch (identifyStep) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Select Crop</Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Crop</InputLabel>
                            <Select
                                value={identifyData.crop}
                                label="Crop"
                                onChange={(e) => setIdentifyData({ ...identifyData, crop: e.target.value })}
                            >
                                {CROPS.map(crop => (
                                    <MenuItem key={crop.value} value={crop.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Agriculture fontSize="small" />
                                            {crop.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {identifyData.crop && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Selected: {CROPS.find(c => c.value === identifyData.crop)?.label}
                            </Alert>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Weed Type</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {WEED_TYPES.map(type => (
                                <Grid item xs={12} sm={4} key={type.value}>
                                    <Card 
                                        sx={{ 
                                            cursor: 'pointer',
                                            border: identifyData.weedType === type.value ? '2px solid #4CAF50' : '1px solid #e0e0e0'
                                        }}
                                        onClick={() => setIdentifyData({ ...identifyData, weedType: type.value })}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <type.icon color={identifyData.weedType === type.value ? 'success' : 'action'} />
                                                <Typography variant="subtitle1">{type.label}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="textSecondary">
                                                {type.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Symptoms Checklist</Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Select all symptoms you observe
                        </Typography>
                        <FormGroup sx={{ mt: 2 }}>
                            <Grid container spacing={1}>
                                {SYMPTOMS.map(symptom => (
                                    <Grid item xs={12} sm={6} key={symptom}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={identifyData.symptoms.includes(symptom)}
                                                    onChange={() => handleSymptomToggle(symptom)}
                                                />
                                            }
                                            label={symptom}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </FormGroup>
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Growth Stage</Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Crop Growth Stage</InputLabel>
                            <Select
                                value={identifyData.stage}
                                label="Crop Growth Stage"
                                onChange={(e) => setIdentifyData({ ...identifyData, stage: e.target.value })}
                            >
                                {GROWTH_STAGES.map(stage => (
                                    <MenuItem key={stage.value} value={stage.value}>
                                        <Box>
                                            <Typography>{stage.label}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {stage.description}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Upload Photos</Typography>
                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                mt: 2,
                                cursor: 'pointer',
                                '&:hover': { borderColor: '#4CAF50', bgcolor: '#f5f5f5' }
                            }}
                        >
                            <PhotoCamera sx={{ fontSize: 48, color: 'action', mb: 1 }} />
                            <Typography>Click or drag to upload photos</Typography>
                            <Typography variant="caption" color="textSecondary">
                                Supports JPG, PNG (Max 10MB)
                            </Typography>
                            <input type="file" multiple accept="image/*" hidden />
                        </Box>
                        {identifyData.photos.length > 0 && (
                            <Typography sx={{ mt: 2 }}>
                                {identifyData.photos.length} photo(s) selected
                            </Typography>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    // Issue Reporting
    const handleReportIssue = () => {
        if (!newIssue.fieldId || !newIssue.weedName) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        const field = MOCK_FIELDS.find(f => f.id === parseInt(newIssue.fieldId));
        const issue = {
            id: issues.length + 1,
            fieldId: field.id,
            fieldName: field.name,
            crop: newIssue.crop || field.crop,
            weedName: newIssue.weedName,
            severity: newIssue.severity,
            coverage: newIssue.coverage,
            stage: newIssue.stage,
            reportedBy: 'Current User',
            reportDate: new Date().toISOString().split('T')[0],
            status: 'reported',
            assignedTo: null,
            photos: newIssue.photos.length,
            controlMethod: null,
            herbicide: null,
            cost: 0,
            notes: newIssue.notes,
            actions: [
                { date: new Date().toISOString().split('T')[0], action: 'Reported', by: 'Current User' }
            ]
        };

        setIssues([issue, ...issues]);
        setReportDialogOpen(false);
        setNewIssue({
            fieldId: '',
            crop: '',
            weedName: '',
            severity: 'mild',
            coverage: 20,
            stage: '',
            notes: '',
            photos: []
        });
        showSnackbar('Issue reported successfully');
    };

    const handleIssueMenuClick = (event, issue) => {
        setIssueMenuAnchor(event.currentTarget);
        setSelectedIssue(issue);
    };

    const handleUpdateIssueStatus = (newStatus) => {
        if (!selectedIssue) return;

        const updatedIssues = issues.map(issue => {
            if (issue.id === selectedIssue.id) {
                return {
                    ...issue,
                    status: newStatus,
                    actions: [
                        ...issue.actions,
                        {
                            date: new Date().toISOString().split('T')[0],
                            action: newStatus === 'control_planned' ? 'Control Planned' :
                                   newStatus === 'applied' ? 'Applied' : 'Cleared',
                            by: 'Current User'
                        }
                    ]
                };
            }
            return issue;
        });

        setIssues(updatedIssues);
        setIssueMenuAnchor(null);
        setSelectedIssue(null);
        showSnackbar(`Issue status updated to ${newStatus.replace('_', ' ')}`);
    };

    // Cost Calculator
    const calculateTotalCost = () => {
        const herbicide = MOCK_HERBICIDES.find(h => h.name === costCalculator.herbicide);
        if (!herbicide) return 0;

        const herbicideCost = costCalculator.fieldArea * herbicide.cost * (costCalculator.dosage || 1);
        const laborCost = costCalculator.laborHours * 200; // Rs. 200 per hour
        const equipmentCost = costCalculator.equipment === 'tractor-mounted' ? 500 : 200;
        const waterCost = (costCalculator.waterRate * costCalculator.fieldArea / 1000) * 2; // Rs. 2 per liter

        return herbicideCost + laborCost + equipmentCost + waterCost;
    };

    // Herbicide Compatibility Check
    const checkCompatibility = () => {
        const herb1 = MOCK_HERBICIDES.find(h => h.name === compatibilityCheck.herbicide1);
        const herb2 = MOCK_HERBICIDES.find(h => h.name === compatibilityCheck.herbicide2);
        
        if (!herb1 || !herb2) return null;

        const isCompatible = !herb1.incompatible.includes(herb2.name) && !herb2.incompatible.includes(herb1.name);
        const safetyIssue = herb1.toxicity === 'high' || herb2.toxicity === 'high';
        
        return {
            compatible: isCompatible,
            safetyIssue,
            herb1,
            herb2,
            message: isCompatible 
                ? 'Herbicides are compatible'
                : 'WARNING: Herbicides are NOT compatible'
        };
    };

    // Render Dashboard
    const renderDashboard = () => {
        const historyData = MOCK_HISTORY.map(h => ({
            name: `${h.month} ${h.year}`,
            issues: h.issues,
            controlled: h.controlled
        }));

        const severityData = [
            { name: 'Mild', count: issues.filter(i => i.severity === 'mild').length, color: '#4CAF50' },
            { name: 'Moderate', count: issues.filter(i => i.severity === 'moderate').length, color: '#FF9800' },
            { name: 'Severe', count: issues.filter(i => i.severity === 'severe').length, color: '#F44336' }
        ];

        const weedTypeData = [
            { name: 'Broadleaf', count: issues.filter(i => {
                const weed = MOCK_WEEDS.find(w => w.name === i.weedName);
                return weed?.type === 'broadleaf';
            }).length },
            { name: 'Grassy', count: issues.filter(i => {
                const weed = MOCK_WEEDS.find(w => w.name === i.weedName);
                return weed?.type === 'grassy';
            }).length },
            { name: 'Sedge', count: issues.filter(i => {
                const weed = MOCK_WEEDS.find(w => w.name === i.weedName);
                return weed?.type === 'sedge';
            }).length }
        ];

        return (
            <Box>
                {/* Quick Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Warning color="warning" />
                                    <Typography color="textSecondary" variant="caption">Active Issues</Typography>
                                </Box>
                                <Typography variant="h4" color="warning.main">{stats.activeIssues}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CheckCircle color="success" />
                                    <Typography color="textSecondary" variant="caption">Controlled This Month</Typography>
                                </Box>
                                <Typography variant="h4" color="success.main">{stats.controlledThisMonth}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOn color="error" />
                                    <Typography color="textSecondary" variant="caption">At-Risk Fields</Typography>
                                </Box>
                                <Typography variant="h4" color="error.main">{stats.atRiskFields}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Spa color="success" />
                                    <Typography color="textSecondary" variant="caption">Organic Used</Typography>
                                </Box>
                                <Typography variant="h4" color="success.main">{stats.organicOptionsUsed}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 350 }}>
                            <Typography variant="h6" gutterBottom>Issue Trends</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={historyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar dataKey="issues" fill="#FF9800" name="Reported" />
                                    <Bar dataKey="controlled" fill="#4CAF50" name="Controlled" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 350 }}>
                            <Typography variant="h6" gutterBottom>Issue Severity Distribution</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 350 }}>
                            <Typography variant="h6" gutterBottom>Weed Types Distribution</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={weedTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" fill="#2196F3" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 350 }}>
                            <Typography variant="h6" gutterBottom>Recent Issues</Typography>
                            <List dense>
                                {issues.slice(0, 5).map(issue => (
                                    <ListItem key={issue.id}>
                                        <ListItemIcon>
                                            {issue.severity === 'severe' ? <Error color="error" /> :
                                             issue.severity === 'moderate' ? <Warning color="warning" /> :
                                             <CheckCircle color="success" />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${issue.weedName} - ${issue.fieldName}`}
                                            secondary={`${issue.severity} • ${issue.status.replace('_', ' ')} • ${format(new Date(issue.reportDate), 'dd MMM')}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Field Heatmap Visualization */}
                <Paper sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Field Weed Risk Heatmap</Typography>
                    <Grid container spacing={2}>
                        {MOCK_FIELDS.map(field => {
                            const fieldIssues = issues.filter(i => i.fieldId === field.id && i.status !== 'cleared');
                            const hasSevere = fieldIssues.some(i => i.severity === 'severe');
                            const hasModerate = fieldIssues.some(i => i.severity === 'moderate');
                            const color = hasSevere ? '#F44336' : hasModerate ? '#FF9800' : '#4CAF50';
                            
                            return (
                                <Grid item xs={6} sm={4} md={2} key={field.id}>
                                    <Card sx={{ bgcolor: `${color}15`, borderLeft: `4px solid ${color}` }}>
                                        <CardContent>
                                            <Typography variant="subtitle2">{field.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{field.crop}</Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Chip 
                                                    size="small" 
                                                    label={hasSevere ? 'High Risk' : hasModerate ? 'Medium Risk' : 'Low Risk'}
                                                    sx={{ bgcolor: color, color: 'white' }}
                                                />
                                            </Box>
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                {fieldIssues.length} active issues
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            </Box>
        );
    };

    // Render Identification
    const renderIdentification = () => {
        if (identifiedWeeds.length > 0) {
            return (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Identification Results</Typography>
                        <Button variant="outlined" onClick={resetIdentification}>Start New</Button>
                    </Box>
                    <Grid container spacing={2}>
                        {identifiedWeeds.map(weed => (
                            <Grid item xs={12} sm={6} md={4} key={weed.id}>
                                <Card 
                                    sx={{ 
                                        height: '100%',
                                        cursor: 'pointer',
                                        '&:hover': { boxShadow: 4 }
                                    }}
                                    onClick={() => setSelectedWeed(weed)}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6">{weed.name}</Typography>
                                            <Chip 
                                                size="small" 
                                                label={weed.type}
                                                color={weed.type === 'broadleaf' ? 'success' : weed.type === 'grassy' ? 'primary' : 'warning'}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                            {weed.scientificName}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Local: {weed.localName}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Chip 
                                                size="small" 
                                                label={`Risk: ${weed.competitionRisk}`}
                                                color={weed.competitionRisk === 'high' ? 'error' : 'warning'}
                                                sx={{ mr: 0.5 }}
                                            />
                                            <Chip 
                                                size="small" 
                                                label={`Yield: ${weed.yieldLoss}`}
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {weed.description.substring(0, 100)}...
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            );
        }

        return (
            <Box>
                <Typography variant="h6" gutterBottom>Weed Identification Wizard</Typography>
                <Stepper activeStep={identifyStep} sx={{ mb: 4 }}>
                    {identifySteps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper sx={{ p: 3, mb: 2 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <LinearProgress />
                            <Typography sx={{ mt: 2 }}>Analyzing...</Typography>
                        </Box>
                    ) : (
                        renderIdentifyStep()
                    )}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        disabled={identifyStep === 0}
                        onClick={handleIdentifyBack}
                        startIcon={<ArrowBack />}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleIdentifyNext}
                        disabled={loading || (identifyStep === 0 && !identifyData.crop)}
                        endIcon={identifyStep === identifySteps.length - 1 ? <Check /> : <ArrowForward />}
                    >
                        {identifyStep === identifySteps.length - 1 ? 'Identify' : 'Next'}
                    </Button>
                </Box>
            </Box>
        );
    };

    // Render Weed Library
    const renderWeedLibrary = () => {
        const filteredWeeds = MOCK_WEEDS.filter(weed => {
            const cropMatch = !libraryFilters.crop || weed.crops.includes(libraryFilters.crop);
            const typeMatch = !libraryFilters.type || weed.type === libraryFilters.type;
            const riskMatch = !libraryFilters.risk || weed.competitionRisk === libraryFilters.risk;
            return cropMatch && typeMatch && riskMatch;
        });

        return (
            <Box>
                <Typography variant="h6" gutterBottom>Crop-wise Weed Library</Typography>
                
                {/* Filters */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by Crop</InputLabel>
                                <Select
                                    value={libraryFilters.crop}
                                    label="Filter by Crop"
                                    onChange={(e) => setLibraryFilters({ ...libraryFilters, crop: e.target.value })}
                                >
                                    <MenuItem value="">All Crops</MenuItem>
                                    {CROPS.map(crop => (
                                        <MenuItem key={crop.value} value={crop.value}>{crop.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Weed Type</InputLabel>
                                <Select
                                    value={libraryFilters.type}
                                    label="Weed Type"
                                    onChange={(e) => setLibraryFilters({ ...libraryFilters, type: e.target.value })}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {WEED_TYPES.map(type => (
                                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Risk Level</InputLabel>
                                <Select
                                    value={libraryFilters.risk}
                                    label="Risk Level"
                                    onChange={(e) => setLibraryFilters({ ...libraryFilters, risk: e.target.value })}
                                >
                                    <MenuItem value="">All Risks</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Weed Cards */}
                <Grid container spacing={2}>
                    {filteredWeeds.map(weed => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={weed.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Spa sx={{ fontSize: 60, color: 'grey.400' }} />
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" noWrap>{weed.name}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        {weed.scientificName}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        Local: {weed.localName}
                                    </Typography>
                                    <Box sx={{ mt: 1, mb: 1 }}>
                                        <Chip 
                                            size="small" 
                                            label={weed.type}
                                            sx={{ mr: 0.5 }}
                                        />
                                        <Chip 
                                            size="small" 
                                            label={`Yield ${weed.yieldLoss}`}
                                            color={weed.competitionRisk === 'high' ? 'error' : 'warning'}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        {weed.description.substring(0, 80)}...
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => setSelectedWeed(weed)}>View Details</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {filteredWeeds.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">No weeds found matching your filters</Typography>
                    </Paper>
                )}
            </Box>
        );
    };

    // Render Issues Board
    const renderIssues = () => {
        const columns = ['reported', 'control_planned', 'applied', 'cleared'];

        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Weed Issue Tracking Board</Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setReportDialogOpen(true)}
                    >
                        Report Issue
                    </Button>
                </Box>

                {/* Kanban Board */}
                <Grid container spacing={2}>
                    {columns.map(status => (
                        <Grid item xs={12} sm={6} md={3} key={status}>
                            <Paper sx={{ p: 1, height: '100%', minHeight: 400, bgcolor: '#f5f5f5' }}>
                                <Box sx={{ 
                                    p: 1, 
                                    mb: 1, 
                                    bgcolor: STATUS_CONFIG[status].color,
                                    borderRadius: 1
                                }}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                                        {STATUS_CONFIG[status].label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'white' }}>
                                        {issues.filter(i => i.status === status).length} issues
                                    </Typography>
                                </Box>
                                
                                {issues.filter(i => i.status === status).map(issue => (
                                    <Card key={issue.id} sx={{ mb: 1, cursor: 'pointer' }}>
                                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="subtitle2">{issue.weedName}</Typography>
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => handleIssueMenuClick(e, issue)}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="caption" color="textSecondary">
                                                {issue.fieldName} • {issue.crop}
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip 
                                                    size="small" 
                                                    label={issue.severity}
                                                    color={SEVERITY_CONFIG[issue.severity].color === '#F44336' ? 'error' : 
                                                           SEVERITY_CONFIG[issue.severity].color === '#FF9800' ? 'warning' : 'success'}
                                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                                />
                                                {issue.coverage > 50 && (
                                                    <Chip 
                                                        size="small" 
                                                        label="High Coverage"
                                                        color="error"
                                                        sx={{ fontSize: '0.7rem', height: 20, ml: 0.5 }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                                                {format(new Date(issue.reportDate), 'dd MMM')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    // Render History
    const renderHistory = () => {
        const sortedIssues = [...issues].sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
        
        return (
            <Box>
                <Typography variant="h6" gutterBottom>Weed Management History</Typography>
                
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Field</TableCell>
                                <TableCell>Crop</TableCell>
                                <TableCell>Weed</TableCell>
                                <TableCell>Severity</TableCell>
                                <TableCell>Control Method</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedIssues.map(issue => (
                                <TableRow key={issue.id} hover>
                                    <TableCell>{format(new Date(issue.reportDate), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{issue.fieldName}</TableCell>
                                    <TableCell>{issue.crop}</TableCell>
                                    <TableCell>{issue.weedName}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            size="small" 
                                            label={issue.severity}
                                            color={issue.severity === 'severe' ? 'error' : issue.severity === 'moderate' ? 'warning' : 'success'}
                                        />
                                    </TableCell>
                                    <TableCell>{issue.controlMethod || 'Not planned'}</TableCell>
                                    <TableCell>₹{issue.cost}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            size="small" 
                                            label={STATUS_CONFIG[issue.status]?.label || issue.status}
                                            sx={{ bgcolor: STATUS_CONFIG[issue.status]?.color || '#9E9E9E', color: 'white' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {sortedIssues.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                        <Typography color="textSecondary">No history available</Typography>
                    </Paper>
                )}
            </Box>
        );
    };

    // Render Analytics
    const renderAnalytics = () => {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>Weed Analytics & Insights</Typography>
                
                <Grid container spacing={3}>
                    {/* Repeated Weed Types */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Most Common Weeds</Typography>
                            <List>
                                {['Parthenium', 'Phalaris', 'Cyperus'].map((weed, index) => {
                                    const count = issues.filter(i => i.weedName === weed).length;
                                    return (
                                        <ListItem key={weed}>
                                            <ListItemText
                                                primary={`${index + 1}. ${weed}`}
                                                secondary={`Found in ${count} fields`}
                                            />
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={(count / issues.length) * 100} 
                                                sx={{ width: 100, ml: 2 }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Cost Analysis */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Cost Analysis</Typography>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Total Spent This Month: <strong>₹{issues.filter(i => i.status === 'applied').reduce((acc, i) => acc + i.cost, 0)}</strong>
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Average per Issue: <strong>₹{Math.round(issues.filter(i => i.cost > 0).reduce((acc, i) => acc + i.cost, 0) / issues.filter(i => i.cost > 0).length || 0)}</strong>
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Most Expensive: <strong>₹{Math.max(...issues.map(i => i.cost), 0)}</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Cost Savings (Organic): <strong>₹{Math.round(issues.filter(i => i.controlMethod === 'organic').reduce((acc, i) => acc + i.cost * 0.3, 0))}</strong>
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Cost Calculator */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Cost Calculator & Resource Planning</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Field Area (hectares)"
                                        type="number"
                                        value={costCalculator.fieldArea}
                                        onChange={(e) => setCostCalculator({ ...costCalculator, fieldArea: parseFloat(e.target.value) || 0 })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Herbicide</InputLabel>
                                        <Select
                                            value={costCalculator.herbicide}
                                            label="Herbicide"
                                            onChange={(e) => setCostCalculator({ ...costCalculator, herbicide: e.target.value })}
                                        >
                                            {MOCK_HERBICIDES.map(h => (
                                                <MenuItem key={h.id} value={h.name}>
                                                    {h.name} (₹{h.cost}/ha)
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Labor Hours"
                                        type="number"
                                        value={costCalculator.laborHours}
                                        onChange={(e) => setCostCalculator({ ...costCalculator, laborHours: parseFloat(e.target.value) || 0 })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Equipment Type</InputLabel>
                                        <Select
                                            value={costCalculator.equipment}
                                            label="Equipment Type"
                                            onChange={(e) => setCostCalculator({ ...costCalculator, equipment: e.target.value })}
                                        >
                                            <MenuItem value="knapsack">Knapsack Sprayer</MenuItem>
                                            <MenuItem value="tractor-mounted">Tractor Mounted</MenuItem>
                                            <MenuItem value="manual">Manual Tools</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="h6">
                                    Estimated Total Cost: ₹{Math.round(calculateTotalCost())}
                                </Typography>
                                {costCalculator.herbicide && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2">
                                            Herbicide: ₹{Math.round(MOCK_HERBICIDES.find(h => h.name === costCalculator.herbicide)?.cost * costCalculator.fieldArea || 0)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Labor: ₹{Math.round(costCalculator.laborHours * 200)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Equipment: ₹{costCalculator.equipment === 'tractor-mounted' ? 500 : 200}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Herbicide Compatibility Check */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Herbicide Compatibility Check</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Herbicide 1</InputLabel>
                                        <Select
                                            value={compatibilityCheck.herbicide1}
                                            label="Herbicide 1"
                                            onChange={(e) => setCompatibilityCheck({ ...compatibilityCheck, herbicide1: e.target.value })}
                                        >
                                            {MOCK_HERBICIDES.map(h => (
                                                <MenuItem key={h.id} value={h.name}>{h.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Herbicide 2</InputLabel>
                                        <Select
                                            value={compatibilityCheck.herbicide2}
                                            label="Herbicide 2"
                                            onChange={(e) => setCompatibilityCheck({ ...compatibilityCheck, herbicide2: e.target.value })}
                                        >
                                            {MOCK_HERBICIDES.map(h => (
                                                <MenuItem key={h.id} value={h.name}>{h.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            
                            {compatibilityCheck.herbicide1 && compatibilityCheck.herbicide2 && (
                                <Box sx={{ mt: 2 }}>
                                    {(() => {
                                        const result = checkCompatibility();
                                        if (!result) return null;
                                        return (
                                            <Alert severity={result.compatible ? 'success' : 'error'}>
                                                <Typography variant="subtitle2">{result.message}</Typography>
                                                {result.safetyIssue && (
                                                    <Typography variant="body2">
                                                        ⚠️ High toxicity herbicide involved - Extra precautions required
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                    Rotation restriction: {Math.max(result.herb1.cropRotation, result.herb2.cropRotation)} days
                                                </Typography>
                                            </Alert>
                                        );
                                    })()}
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Organic Options */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Organic & Sustainable Options</Typography>
                            <List dense>
                                {MOCK_HERBICIDES.filter(h => h.organic).map(herbicide => (
                                    <ListItem key={herbicide.id}>
                                        <ListItemIcon>
                                            <Spa color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={herbicide.name}
                                            secondary={`${herbicide.applicationStage} • ₹${herbicide.cost}/ha`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" gutterBottom>Cultural Methods:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['Crop Rotation', 'Mulching', 'Intercropping', 'Hand Weeding', 'Flame Weeding', 'Solarization'].map(method => (
                                    <Chip key={method} size="small" label={method} color="success" variant="outlined" />
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    <Grass sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Weed Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<NotificationsActive />}>
                        Alerts
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setReportDialogOpen(true)}
                    >
                        Report Issue
                    </Button>
                </Box>
            </Box>

            {/* Main Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab value="dashboard" icon={<Dashboard />} label="Dashboard" />
                    <Tab value="identify" icon={<Search />} label="Identify" />
                    <Tab value="library" icon={<LocalFlorist />} label="Weed Library" />
                    <Tab value="issues" icon={<Assignment />} label="Issues" />
                    <Tab value="history" icon={<History />} label="History" />
                    <Tab value="analytics" icon={<Analytics />} label="Analytics" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'identify' && renderIdentification()}
            {activeTab === 'library' && renderWeedLibrary()}
            {activeTab === 'issues' && renderIssues()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'analytics' && renderAnalytics()}

            {/* Weed Details Dialog */}
            <Dialog open={!!selectedWeed} onClose={() => setSelectedWeed(null)} maxWidth="md" fullWidth>
                {selectedWeed && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h5">{selectedWeed.name}</Typography>
                                <Chip label={selectedWeed.type} color="primary" />
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ bgcolor: 'grey.200', height: 200, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Spa sx={{ fontSize: 80, color: 'grey.400' }} />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Scientific: {selectedWeed.scientificName}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        Local Name: {selectedWeed.localName}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {selectedWeed.description}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2">Affects Crops:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {selectedWeed.crops.map(crop => (
                                                <Chip key={crop} size="small" label={crop} />
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2">Symptoms:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {selectedWeed.symptoms.map(symptom => (
                                                <Chip key={symptom} size="small" variant="outlined" label={symptom} />
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom>Control Recommendations</Typography>
                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Chemical Control</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Herbicide</TableCell>
                                                    <TableCell>Stage</TableCell>
                                                    <TableCell>Dosage</TableCell>
                                                    <TableCell>Cost</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {MOCK_HERBICIDES.filter(h => !h.organic && h.applicationStage !== 'any').slice(0, 3).map(h => (
                                                    <TableRow key={h.id}>
                                                        <TableCell>{h.name}</TableCell>
                                                        <TableCell>{h.applicationStage}</TableCell>
                                                        <TableCell>{h.dosage}</TableCell>
                                                        <TableCell>₹{h.cost}/ha</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Organic & Cultural Methods</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon><Spa color="success" /></ListItemIcon>
                                            <ListItemText primary="Mulching" secondary="Apply 10-15 cm organic mulch" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><Agriculture color="success" /></ListItemIcon>
                                            <ListItemText primary="Crop Rotation" secondary="Rotate with non-host crops" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><Build color="success" /></ListItemIcon>
                                            <ListItemText primary="Mechanical Control" secondary="Hand weeding or cultivation" />
                                        </ListItem>
                                    </List>
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Safety & Compliance</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Always wear protective clothing when handling herbicides
                                    </Alert>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Waiting Period:</strong> 7-30 days before harvest depending on herbicide
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Crop Rotation:</strong> Follow rotation restrictions to prevent carryover
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Environmental:</strong> Avoid spray drift to water bodies and sensitive areas
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedWeed(null)}>Close</Button>
                            <Button 
                                variant="contained" 
                                onClick={() => {
                                    setNewIssue({ ...newIssue, weedName: selectedWeed.name });
                                    setReportDialogOpen(true);
                                    setSelectedWeed(null);
                                }}
                            >
                                Report This Weed
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Report Issue Dialog */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Report Weed Issue</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Field</InputLabel>
                                <Select
                                    value={newIssue.fieldId}
                                    label="Field"
                                    onChange={(e) => {
                                        const field = MOCK_FIELDS.find(f => f.id === parseInt(e.target.value));
                                        setNewIssue({ 
                                            ...newIssue, 
                                            fieldId: e.target.value,
                                            crop: field?.crop || ''
                                        });
                                    }}
                                >
                                    {MOCK_FIELDS.map(field => (
                                        <MenuItem key={field.id} value={field.id}>
                                            {field.name} ({field.crop})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Crop"
                                value={newIssue.crop}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Weed Name</InputLabel>
                                <Select
                                    value={newIssue.weedName}
                                    label="Weed Name"
                                    onChange={(e) => setNewIssue({ ...newIssue, weedName: e.target.value })}
                                >
                                    {MOCK_WEEDS.map(weed => (
                                        <MenuItem key={weed.id} value={weed.name}>
                                            {weed.name} ({weed.localName})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Severity</InputLabel>
                                <Select
                                    value={newIssue.severity}
                                    label="Severity"
                                    onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                                >
                                    <MenuItem value="mild">Mild (&lt;25% coverage)</MenuItem>
                                    <MenuItem value="moderate">Moderate (25-50% coverage)</MenuItem>
                                    <MenuItem value="severe">Severe (&gt;50% coverage)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Weed Coverage: {newIssue.coverage}%</Typography>
                            <Slider
                                value={newIssue.coverage}
                                onChange={(e, value) => setNewIssue({ ...newIssue, coverage: value })}
                                min={0}
                                max={100}
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Crop Growth Stage</InputLabel>
                                <Select
                                    value={newIssue.stage}
                                    label="Crop Growth Stage"
                                    onChange={(e) => setNewIssue({ ...newIssue, stage: e.target.value })}
                                >
                                    {GROWTH_STAGES.map(stage => (
                                        <MenuItem key={stage.value} value={stage.value}>{stage.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 1,
                                    p: 2,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: '#4CAF50' }
                                }}
                            >
                                <PhotoCamera sx={{ color: 'action' }} />
                                <Typography variant="caption">Upload Photos</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Additional Notes"
                                value={newIssue.notes}
                                onChange={(e) => setNewIssue({ ...newIssue, notes: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleReportIssue}>Submit Report</Button>
                </DialogActions>
            </Dialog>

            {/* Issue Actions Menu */}
            <Menu
                anchorEl={issueMenuAnchor}
                open={Boolean(issueMenuAnchor)}
                onClose={() => setIssueMenuAnchor(null)}
            >
                {selectedIssue?.status === 'reported' && (
                    <MenuItem onClick={() => handleUpdateIssueStatus('control_planned')}>
                        <ListItemIcon><Lightbulb fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Plan Control" />
                    </MenuItem>
                )}
                {selectedIssue?.status === 'control_planned' && (
                    <MenuItem onClick={() => handleUpdateIssueStatus('applied')}>
                        <ListItemIcon><Check fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Mark as Applied" />
                    </MenuItem>
                )}
                {selectedIssue?.status === 'applied' && (
                    <MenuItem onClick={() => handleUpdateIssueStatus('cleared')}>
                        <ListItemIcon><Verified fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Mark as Cleared" />
                    </MenuItem>
                )}
                <Divider />
                <MenuItem>
                    <ListItemIcon><Info fontSize="small" /></ListItemIcon>
                    <ListItemText primary="View Details" />
                </MenuItem>
            </Menu>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    severity={snackbar.severity}
                    onClose={handleCloseSnackbar}
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                sx={{ position: 'fixed', bottom: 24, right: 24 }}
                onClick={() => setReportDialogOpen(true)}
            >
                <Add />
            </Fab>
        </Container>
    );
};

export default WeedManagement;