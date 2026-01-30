import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  SpeedDial,
  SpeedDialAction,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Menu,
  Checkbox,
  FormGroup,
  RadioGroup,
  Radio,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardMedia,
  CardActions,
  Autocomplete,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  Fab,
} from '@mui/material';
import {
  People,
  CheckCircle,
  Cancel,
  Schedule,
  Work,
  Payment,
  Report,
  BeachAccess,
  Assessment,
  Add,
  Edit,
  Delete,
  FilterList,
  Search,
  Download,
  Print,
  LocationOn,
  CameraAlt,
  Notifications,
  Refresh,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  MoreVert,
  CloudUpload,
  Check,
  Close,
  Visibility,
  AttachMoney,
  Timer,
  Speed,
  Star,
  ExpandMore,
  Share,
  Close as CloseIcon,
  FileDownload,
  Email,
  Phone,
  Person,
  ArrowBack,
  ArrowForward,
  Today,
  AccessTime,
  LocalAtm,
  Warning,
  Info,
  Help,
  Settings,
  Brightness4,
  Brightness7,
  Fullscreen,
  Menu as MenuIcon,
  GroupWork,
  Task,
  Build,
  School,
  History,
  LocalHospital,
  Security,
  Call,
  Message,
  EmojiEvents,
  ThumbUp,
  ThumbDown,
  HourglassEmpty,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, parseISO } from 'date-fns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Mock Data
const mockWorkers = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    photo: 'https://i.pravatar.cc/150?img=11',
    phone: '+91 98765 43210',
    role: 'Permanent',
    skills: ['Tractor Operation', 'Irrigation', 'Harvesting'],
    wage: 450,
    wageType: 'daily',
    status: 'active',
    joinDate: '2020-03-15',
    experience: 5,
    certifications: ['Tractor License', 'Pesticide Handling'],
    training: ['Organic Farming', 'Safety Protocols'],
    leaveBalance: { casual: 12, sick: 10, earned: 15 },
    attendance: [],
    tasks: [],
    payments: [],
    issues: [],
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: 2,
    name: 'Sita Devi',
    photo: 'https://i.pravatar.cc/150?img=5',
    phone: '+91 98765 43211',
    role: 'Seasonal',
    skills: ['Planting', 'Weeding', 'Sorting'],
    wage: 350,
    wageType: 'daily',
    status: 'active',
    joinDate: '2023-01-10',
    experience: 3,
    certifications: [],
    training: ['Crop Management'],
    leaveBalance: { casual: 5, sick: 5, earned: 0 },
    attendance: [],
    tasks: [],
    payments: [],
    issues: [],
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: 3,
    name: 'Mohan Singh',
    photo: 'https://i.pravatar.cc/150?img=3',
    phone: '+91 98765 43212',
    role: 'Temporary',
    skills: ['Loading', 'Packing', 'Transport'],
    wage: 400,
    wageType: 'hourly',
    status: 'active',
    joinDate: '2024-02-01',
    experience: 2,
    certifications: ['Heavy Vehicle License'],
    training: [],
    leaveBalance: { casual: 0, sick: 0, earned: 0 },
    attendance: [],
    tasks: [],
    payments: [],
    issues: [],
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: 4,
    name: 'Lakshmi Narayan',
    photo: 'https://i.pravatar.cc/150?img=9',
    phone: '+91 98765 43213',
    role: 'Permanent',
    skills: ['Supervision', 'Quality Control', 'Record Keeping'],
    wage: 600,
    wageType: 'daily',
    status: 'active',
    joinDate: '2019-06-20',
    experience: 8,
    certifications: ['Supervisor Training', 'First Aid'],
    training: ['Leadership', 'Financial Management'],
    leaveBalance: { casual: 15, sick: 12, earned: 20 },
    attendance: [],
    tasks: [],
    payments: [],
    issues: [],
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: 5,
    name: 'Rajesh Patel',
    photo: 'https://i.pravatar.cc/150?img=13',
    phone: '+91 98765 43214',
    role: 'Permanent',
    skills: ['Equipment Maintenance', 'Repair', 'Welding'],
    wage: 550,
    wageType: 'daily',
    status: 'on-leave',
    joinDate: '2021-08-15',
    experience: 6,
    certifications: ['Welding Certificate', 'Equipment Operator'],
    training: ['Advanced Repair', 'Safety Standards'],
    leaveBalance: { casual: 8, sick: 6, earned: 12 },
    attendance: [],
    tasks: [],
    payments: [],
    issues: [],
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: 6,
    name: 'Anita Sharma',
    photo: 'https://i.pravatar.cc/150?img=24',
    phone: '+91 98765 43215',
    role: 'Seasonal',
    skills: ['Hand Pollination', 'Pruning', 'Grafting'],
    wage: 380,
    wageType: 'task-based',
    status: 'active',
    joinDate: '2023-06-01',
    experience: 4,
    certifications: ['Horticulture Diploma'],
    training: ['Advanced Grafting', 'Pest Management'],
    leaveBalance: { casual: 6, sick: 5, earned: 0 },
    attendance: [],
    tasks: [],
    payments: [],
    issues: [],
    location: { lat: 12.9716, lng: 77.5946 },
  },
];

const mockTasks = [
  { id: 1, title: 'Irrigation Setup', field: 'North Field', priority: 'high', status: 'pending', assignedTo: [], dueDate: '2024-03-25', estimatedHours: 4 },
  { id: 2, title: 'Harvest Wheat', field: 'East Field', priority: 'urgent', status: 'in-progress', assignedTo: [1, 2], dueDate: '2024-03-24', estimatedHours: 8 },
  { id: 3, title: 'Apply Fertilizer', field: 'South Field', priority: 'medium', status: 'completed', assignedTo: [1], dueDate: '2024-03-20', estimatedHours: 3 },
  { id: 4, title: 'Equipment Maintenance', field: 'Workshop', priority: 'high', status: 'pending', assignedTo: [5], dueDate: '2024-03-26', estimatedHours: 6 },
  { id: 5, title: 'Prune Fruit Trees', field: 'Orchard', priority: 'medium', status: 'in-progress', assignedTo: [6], dueDate: '2024-03-25', estimatedHours: 5 },
];

const mockIssues = [
  { id: 1, type: 'equipment', title: 'Tractor Breakdown', description: 'Engine not starting, needs immediate repair', reportedBy: 1, date: '2024-03-20', status: 'open', priority: 'urgent', photos: [] },
  { id: 2, type: 'crop', title: 'Pest Infestation', description: 'Cotton plants showing signs of bollworm damage', reportedBy: 2, date: '2024-03-19', status: 'in-progress', priority: 'high', photos: [] },
  { id: 3, type: 'safety', title: 'Broken Fence', description: 'Boundary fence damaged, animals entering fields', reportedBy: 4, date: '2024-03-18', status: 'resolved', priority: 'medium', photos: [] },
];

const mockLeaveRequests = [
  { id: 1, workerId: 5, type: 'sick', startDate: '2024-03-20', endDate: '2024-03-22', days: 3, reason: 'Fever and cold', status: 'approved', appliedOn: '2024-03-18' },
  { id: 2, workerId: 2, type: 'casual', startDate: '2024-03-25', endDate: '2024-03-26', days: 2, reason: 'Family function', status: 'pending', appliedOn: '2024-03-20' },
  { id: 3, workerId: 3, type: 'earned', startDate: '2024-04-01', endDate: '2024-04-05', days: 5, reason: 'Vacation', status: 'pending', appliedOn: '2024-03-19' },
];

const mockPayments = [
  { id: 1, workerId: 1, amount: 10800, period: '2024-03-01 to 2024-03-15', days: 24, deductions: 200, bonus: 500, paidOn: '2024-03-16', method: 'Bank Transfer', status: 'paid' },
  { id: 2, workerId: 2, amount: 8400, period: '2024-03-01 to 2024-03-15', days: 24, deductions: 0, bonus: 0, paidOn: '2024-03-16', method: 'Cash', status: 'paid' },
  { id: 3, workerId: 4, amount: 14400, period: '2024-03-01 to 2024-03-15', days: 24, deductions: 300, bonus: 800, paidOn: '2024-03-16', method: 'Bank Transfer', status: 'paid' },
  { id: 4, workerId: 1, amount: 11000, period: '2024-03-16 to 2024-03-31', days: 25, deductions: 200, bonus: 600, paidOn: null, method: null, status: 'pending' },
];

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkersManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [workers, setWorkers] = useState(mockWorkers);
  const [tasks, setTasks] = useState(mockTasks);
  const [issues, setIssues] = useState(mockIssues);
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [payments, setPayments] = useState(mockPayments);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [darkMode, setDarkMode] = useState(false);

  // Dialog States
  const [workerDialog, setWorkerDialog] = useState({ open: false, mode: 'add', worker: null });
  const [taskDialog, setTaskDialog] = useState({ open: false, mode: 'add', task: null });
  const [issueDialog, setIssueDialog] = useState({ open: false, mode: 'add', issue: null });
  const [leaveDialog, setLeaveDialog] = useState({ open: false, mode: 'request', leave: null });
  const [paymentDialog, setPaymentDialog] = useState({ open: false, payment: null });
  const [wageSlipDialog, setWageSlipDialog] = useState({ open: false, worker: null });
  const [attendanceDialog, setAttendanceDialog] = useState({ open: false, worker: null });
  const [workerDetailsDialog, setWorkerDetailsDialog] = useState({ open: false, worker: null });
  const [bulkAttendanceDialog, setBulkAttendanceDialog] = useState({ open: false });
  const [exportDialog, setExportDialog] = useState({ open: false });
  const [notificationDialog, setNotificationDialog] = useState({ open: false });

  // Form States
  const [workerForm, setWorkerForm] = useState({
    name: '',
    phone: '',
    role: 'Permanent',
    skills: [],
    wage: '',
    wageType: 'daily',
    status: 'active',
    experience: '',
    certifications: [],
    training: [],
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    field: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: new Date(),
    estimatedHours: '',
    description: '',
  });

  const [issueForm, setIssueForm] = useState({
    type: 'equipment',
    title: '',
    description: '',
    priority: 'medium',
    photos: [],
  });

  const [leaveForm, setLeaveForm] = useState({
    type: 'casual',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    workerId: '',
    amount: '',
    period: '',
    days: '',
    deductions: '',
    bonus: '',
    method: 'Bank Transfer',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'absence', message: '3 workers absent today', date: new Date(), read: false },
    { id: 2, type: 'payment', message: 'Payment due for 4 workers', date: new Date(), read: false },
    { id: 3, type: 'issue', message: 'New issue reported: Tractor Breakdown', date: new Date(), read: false },
  ]);

  // Effects
  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, [activeTab]);

  useEffect(() => {
    // Generate attendance for selected date if not exists
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    if (!attendance[dateKey]) {
      const newAttendance = {};
      workers.forEach(worker => {
        newAttendance[worker.id] = 'present';
      });
      setAttendance(prev => ({ ...prev, [dateKey]: newAttendance }));
    }
  }, [selectedDate, workers]);

  // Statistics
  const stats = useMemo(() => {
    const totalWorkers = workers.length;
    const presentToday = Object.values(attendance[format(selectedDate, 'yyyy-MM-dd')] || {}).filter(a => a === 'present').length;
    const pendingWages = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const openIssues = issues.filter(i => i.status === 'open' || i.status === 'in-progress').length;
    const onLeave = workers.filter(w => w.status === 'on-leave').length;
    const permanentWorkers = workers.filter(w => w.role === 'Permanent').length;
    const avgAttendance = totalWorkers > 0 ? ((presentToday / (totalWorkers - onLeave)) * 100).toFixed(1) : 0;

    return {
      totalWorkers,
      presentToday,
      pendingWages,
      openIssues,
      onLeave,
      permanentWorkers,
      avgAttendance,
    };
  }, [workers, attendance, selectedDate, payments, issues]);

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.phone.includes(searchQuery) ||
        worker.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'all' || worker.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [workers, searchQuery, roleFilter, statusFilter]);

  // Today's Tasks
  const todayTasks = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(task => task.dueDate === today || task.status === 'in-progress');
  }, [tasks]);

  // Event Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Worker Management
  const openAddWorker = () => {
    setWorkerForm({
      name: '',
      phone: '',
      role: 'Permanent',
      skills: [],
      wage: '',
      wageType: 'daily',
      status: 'active',
      experience: '',
      certifications: [],
      training: [],
    });
    setWorkerDialog({ open: true, mode: 'add', worker: null });
  };

  const openEditWorker = (worker) => {
    setWorkerForm({
      name: worker.name,
      phone: worker.phone,
      role: worker.role,
      skills: worker.skills,
      wage: worker.wage,
      wageType: worker.wageType,
      status: worker.status,
      experience: worker.experience,
      certifications: worker.certifications,
      training: worker.training,
    });
    setWorkerDialog({ open: true, mode: 'edit', worker });
  };

  const saveWorker = () => {
    if (workerDialog.mode === 'add') {
      const newWorker = {
        id: workers.length + 1,
        ...workerForm,
        photo: `https://i.pravatar.cc/150?img=${workers.length + 11}`,
        joinDate: new Date().toISOString().split('T')[0],
        leaveBalance: { casual: 12, sick: 10, earned: 0 },
        attendance: [],
        tasks: [],
        payments: [],
        issues: [],
        location: { lat: 12.9716, lng: 77.5946 },
      };
      setWorkers([...workers, newWorker]);
      showSnackbar('Worker added successfully');
    } else {
      setWorkers(workers.map(w => w.id === workerDialog.worker.id ? { ...w, ...workerForm } : w));
      showSnackbar('Worker updated successfully');
    }
    setWorkerDialog({ ...workerDialog, open: false });
  };

  const deleteWorker = (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      setWorkers(workers.filter(w => w.id !== workerId));
      showSnackbar('Worker deleted successfully');
    }
  };

  // Attendance Management
  const markAttendance = (workerId, status) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setAttendance(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [workerId]: status },
    }));
    showSnackbar(`Attendance marked: ${status}`);
  };

  const bulkMarkAttendance = (status) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newAttendance = {};
    workers.forEach(worker => {
      newAttendance[worker.id] = status;
    });
    setAttendance(prev => ({ ...prev, [dateKey]: newAttendance }));
    setBulkAttendanceDialog({ open: false });
    showSnackbar(`All workers marked as ${status}`);
  };

  // Task Management
  const openAddTask = () => {
    setTaskForm({
      title: '',
      field: '',
      priority: 'medium',
      assignedTo: [],
      dueDate: new Date(),
      estimatedHours: '',
      description: '',
    });
    setTaskDialog({ open: true, mode: 'add', task: null });
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title,
      field: task.field,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: parseISO(task.dueDate),
      estimatedHours: task.estimatedHours,
      description: task.description || '',
    });
    setTaskDialog({ open: true, mode: 'edit', task });
  };

  const saveTask = () => {
    if (taskDialog.mode === 'add') {
      const newTask = {
        id: tasks.length + 1,
        ...taskForm,
        status: 'pending',
        dueDate: format(taskForm.dueDate, 'yyyy-MM-dd'),
      };
      setTasks([...tasks, newTask]);
      showSnackbar('Task created successfully');
    } else {
      setTasks(tasks.map(t => t.id === taskDialog.task.id ? {
        ...t,
        ...taskForm,
        dueDate: format(taskForm.dueDate, 'yyyy-MM-dd'),
      } : t));
      showSnackbar('Task updated successfully');
    }
    setTaskDialog({ ...taskDialog, open: false });
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    showSnackbar(`Task marked as ${status}`);
  };

  // Issue Management
  const openReportIssue = () => {
    setIssueForm({
      type: 'equipment',
      title: '',
      description: '',
      priority: 'medium',
      photos: [],
    });
    setIssueDialog({ open: true, mode: 'add', issue: null });
  };

  const reportIssue = () => {
    const newIssue = {
      id: issues.length + 1,
      ...issueForm,
      reportedBy: 1, // Current user
      date: new Date().toISOString().split('T')[0],
      status: 'open',
    };
    setIssues([...issues, newIssue]);
    setIssueDialog({ ...issueDialog, open: false });
    showSnackbar('Issue reported successfully');
  };

  const updateIssueStatus = (issueId, status) => {
    setIssues(issues.map(i => i.id === issueId ? { ...i, status } : i));
    showSnackbar(`Issue marked as ${status}`);
  };

  // Leave Management
  const openLeaveRequest = () => {
    setLeaveForm({
      type: 'casual',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    });
    setLeaveDialog({ open: true, mode: 'request', leave: null });
  };

  const submitLeaveRequest = () => {
    const days = Math.ceil((leaveForm.endDate - leaveForm.startDate) / (1000 * 60 * 60 * 24)) + 1;
    const newLeave = {
      id: leaveRequests.length + 1,
      workerId: 1, // Current user
      ...leaveForm,
      days,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests([...leaveRequests, newLeave]);
    setLeaveDialog({ ...leaveDialog, open: false });
    showSnackbar('Leave request submitted');
  };

  const approveLeave = (leaveId) => {
    setLeaveRequests(leaveRequests.map(l => l.id === leaveId ? { ...l, status: 'approved' } : l));
    showSnackbar('Leave approved');
  };

  const rejectLeave = (leaveId) => {
    setLeaveRequests(leaveRequests.map(l => l.id === leaveId ? { ...l, status: 'rejected' } : l));
    showSnackbar('Leave rejected');
  };

  // Payment Management
  const openPaymentDialog = (worker = null) => {
    setPaymentForm({
      workerId: worker?.id || '',
      amount: '',
      period: '',
      days: '',
      deductions: '',
      bonus: '',
      method: 'Bank Transfer',
    });
    setPaymentDialog({ open: true, payment: null });
  };

  const recordPayment = () => {
    const newPayment = {
      id: payments.length + 1,
      ...paymentForm,
      paidOn: new Date().toISOString().split('T')[0],
      status: 'paid',
    };
    setPayments([...payments, newPayment]);
    setPaymentDialog({ ...paymentDialog, open: false });
    showSnackbar('Payment recorded successfully');
  };

  const generateWageSlip = (worker) => {
    setWageSlipDialog({ open: true, worker });
  };

  const downloadWageSlip = () => {
    showSnackbar('Wage slip downloaded', 'success');
    setWageSlipDialog({ ...wageSlipDialog, open: false });
  };

  // Export
  const exportData = (type) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'workers':
        data = workers;
        filename = 'workers.csv';
        break;
      case 'attendance':
        data = Object.entries(attendance).map(([date, records]) => ({ date, ...records }));
        filename = 'attendance.csv';
        break;
      case 'payments':
        data = payments;
        filename = 'payments.csv';
        break;
      default:
        break;
    }

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showSnackbar(`Exported ${type} successfully`);
    setExportDialog({ ...exportDialog, open: false });
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => obj[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  // Calculate Performance
  const calculatePerformance = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    const workerAttendance = Object.values(attendance).filter(a => a[workerId] === 'present').length;
    const totalDays = Object.keys(attendance).length;
    const attendanceRate = totalDays > 0 ? (workerAttendance / totalDays) * 100 : 0;
    const completedTasks = tasks.filter(t => t.assignedTo.includes(workerId) && t.status === 'completed').length;
    const totalAssigned = tasks.filter(t => t.assignedTo.includes(workerId)).length;
    const taskCompletion = totalAssigned > 0 ? (completedTasks / totalAssigned) * 100 : 0;
    const productivity = (attendanceRate * 0.4) + (taskCompletion * 0.6);

    return {
      attendanceRate: attendanceRate.toFixed(1),
      taskCompletion: taskCompletion.toFixed(1),
      productivity: productivity.toFixed(1),
      completedTasks,
      totalAssigned,
    };
  };

  // Render Helper Functions
  const getRoleColor = (role) => {
    switch (role) {
      case 'Permanent': return 'success';
      case 'Temporary': return 'warning';
      case 'Seasonal': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'on-leave': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Workers Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your workforce, attendance, tasks, and payments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton onClick={() => setNotificationDialog({ open: true })}>
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton onClick={() => setExportDialog({ open: true })}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={() => showSnackbar('Data refreshed')}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">Total Workers</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalWorkers}</Typography>
                <Typography variant="caption" color="success.main">
                  +{workers.filter(w => new Date(w.joinDate) > subDays(new Date(), 30)).length} this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">Present Today</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.presentToday}</Typography>
                <Typography variant="caption" color={stats.avgAttendance > 80 ? 'success.main' : 'warning.main'}>
                  {stats.avgAttendance}% attendance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Payment color="warning" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">Pending Wages</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>₹{stats.pendingWages.toLocaleString()}</Typography>
                <Typography variant="caption" color="error">
                  {payments.filter(p => p.status === 'pending').length} pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Report color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">Open Issues</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.openIssues}</Typography>
                <Typography variant="caption" color={stats.openIssues > 5 ? 'error.main' : 'warning.main'}>
                  Need attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BeachAccess color="info" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">On Leave</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.onLeave}</Typography>
                <Typography variant="caption" color="info.main">
                  {leaveRequests.filter(l => l.status === 'pending').length} pending requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star color="secondary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">Permanent Staff</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.permanentWorkers}</Typography>
                <Typography variant="caption" color="secondary.main">
                  {((stats.permanentWorkers / stats.totalWorkers) * 100).toFixed(0)}% of workforce
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
          >
            <Tab icon={<Assessment />} label="Overview" iconPosition="start" />
            <Tab icon={<People />} label="Workers List" iconPosition="start" />
            <Tab icon={<CheckCircle />} label="Attendance" iconPosition="start" />
            <Tab icon={<Work />} label="Tasks" iconPosition="start" />
            <Tab icon={<Payment />} label="Wages" iconPosition="start" />
            <Tab icon={<Report />} label="Issues" iconPosition="start" />
            <Tab icon={<BeachAccess />} label="Leave" iconPosition="start" />
            <Tab icon={<TrendingUp />} label="Performance" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Today's Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Attendance Summary</Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Present</Typography>
                            <Typography variant="body2" color="success.main">{stats.presentToday}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(stats.presentToday / stats.totalWorkers) * 100} 
                            color="success"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Absent</Typography>
                            <Typography variant="body2" color="error.main">{stats.totalWorkers - stats.presentToday - stats.onLeave}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={((stats.totalWorkers - stats.presentToday - stats.onLeave) / stats.totalWorkers) * 100} 
                            color="error"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">On Leave</Typography>
                            <Typography variant="body2" color="info.main">{stats.onLeave}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(stats.onLeave / stats.totalWorkers) * 100} 
                            color="info"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Task Status</Typography>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip size="small" color="error" label="Urgent" />
                            <Typography>{tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip size="small" color="warning" label="High Priority" />
                            <Typography>{tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip size="small" color="info" label="In Progress" />
                            <Typography>{tasks.filter(t => t.status === 'in-progress').length}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip size="small" color="success" label="Completed Today" />
                            <Typography>{tasks.filter(t => t.status === 'completed').length}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Recent Activity
                </Typography>
                <List>
                  {[
                    { text: 'Ramesh Kumar marked attendance', time: '2 hours ago', icon: <CheckCircle color="success" /> },
                    { text: 'New issue reported: Tractor Breakdown', time: '3 hours ago', icon: <Report color="error" /> },
                    { text: 'Payment processed for 4 workers', time: '5 hours ago', icon: <Payment color="success" /> },
                    { text: 'Task completed: Harvest Wheat', time: 'Yesterday', icon: <Work color="success" /> },
                    { text: 'Leave request from Sita Devi', time: 'Yesterday', icon: <BeachAccess color="info" /> },
                  ].map((activity, idx) => (
                    <ListItem key={idx}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'background.paper' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.text}
                        secondary={activity.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Today's Tasks
                </Typography>
                <List dense>
                  {todayTasks.length > 0 ? todayTasks.map(task => (
                    <ListItem key={task.id} sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <ListItemText
                        primary={task.title}
                        secondary={`${task.field} • ${task.assignedTo.length} workers`}
                      />
                      <Chip
                        size="small"
                        label={task.status}
                        color={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'}
                      />
                    </ListItem>
                  )) : (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                      No tasks for today
                    </Typography>
                  )}
                </List>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setActiveTab(3)}
                >
                  View All Tasks
                </Button>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="contained" startIcon={<Add />} onClick={openAddWorker} fullWidth>
                    Add Worker
                  </Button>
                  <Button variant="outlined" startIcon={<CheckCircle />} onClick={() => setActiveTab(2)} fullWidth>
                    Mark Attendance
                  </Button>
                  <Button variant="outlined" startIcon={<Work />} onClick={openAddTask} fullWidth>
                    Create Task
                  </Button>
                  <Button variant="outlined" startIcon={<Report />} onClick={openReportIssue} fullWidth>
                    Report Issue
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Workers List Tab */}
        <TabPanel value={activeTab} index={1}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                <TextField
                  placeholder="Search workers..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ minWidth: 250 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role">
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="Permanent">Permanent</MenuItem>
                    <MenuItem value="Temporary">Temporary</MenuItem>
                    <MenuItem value="Seasonal">Seasonal</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on-leave">On Leave</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button variant="contained" startIcon={<Add />} onClick={openAddWorker}>
                Add Worker
              </Button>
            </Box>

            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Worker</TableCell>
                    {!isMobile && <TableCell>Contact</TableCell>}
                    <TableCell>Role</TableCell>
                    {!isTablet && <TableCell>Skills</TableCell>}
                    <TableCell>Wage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWorkers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((worker) => (
                    <TableRow key={worker.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={worker.photo} sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle2">{worker.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: #{worker.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Typography variant="body2">{worker.phone}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {worker.experience} years exp.
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip size="small" label={worker.role} color={getRoleColor(worker.role)} />
                      </TableCell>
                      {!isTablet && (
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {worker.skills.slice(0, 2).map((skill, idx) => (
                              <Chip key={idx} size="small" variant="outlined" label={skill} />
                            ))}
                            {worker.skills.length > 2 && (
                              <Chip size="small" variant="outlined" label={`+${worker.skills.length - 2}`} />
                            )}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2">₹{worker.wage}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          per {worker.wageType === 'task-based' ? 'task' : worker.wageType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={worker.status} color={getStatusColor(worker.status)} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setWorkerDetailsDialog({ open: true, worker })}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditWorker(worker)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generate Wage Slip">
                          <IconButton size="small" onClick={() => generateWageSlip(worker)}>
                            <Payment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => deleteWorker(worker.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredWorkers.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={activeTab} index={2}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <Typography variant="h6">
                  {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setBulkAttendanceDialog({ open: true })}
              >
                Bulk Mark Attendance
              </Button>
            </Box>

            <Grid container spacing={2}>
              {workers.map(worker => {
                const dateKey = format(selectedDate, 'yyyy-MM-dd');
                const status = attendance[dateKey]?.[worker.id] || 'present';
                return (
                  <Grid item xs={12} sm={6} md={4} key={worker.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={worker.photo} sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle2">{worker.name}</Typography>
                            <Chip size="small" label={worker.role} color={getRoleColor(worker.role)} />
                          </Box>
                        </Box>

                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Attendance</InputLabel>
                          <Select
                            value={status}
                            onChange={(e) => markAttendance(worker.id, e.target.value)}
                            label="Attendance"
                          >
                            <MenuItem value="present">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle color="success" sx={{ mr: 1 }} />
                                Present
                              </Box>
                            </MenuItem>
                            <MenuItem value="half-day">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Schedule color="warning" sx={{ mr: 1 }} />
                                Half Day
                              </Box>
                            </MenuItem>
                            <MenuItem value="absent">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Cancel color="error" sx={{ mr: 1 }} />
                                Absent
                              </Box>
                            </MenuItem>
                            <MenuItem value="leave">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BeachAccess color="info" sx={{ mr: 1 }} />
                                On Leave
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {status === 'present' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AccessTime />}
                              fullWidth
                            >
                              Check In
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<LocationOn />}
                              fullWidth
                            >
                              Geo Tag
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Attendance Summary
              </Typography>
              <Grid container spacing={2}>
                {eachDayOfInterval({
                  start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                  end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
                }).map((day, idx) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayAttendance = attendance[dateKey] || {};
                  const present = Object.values(dayAttendance).filter(a => a === 'present').length;
                  const total = workers.filter(w => w.status === 'active').length;
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2">{format(day, 'EEE')}</Typography>
                          <Typography variant="h4" sx={{ my: 1 }}>
                            {present}/{total}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(present / total) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(day, 'MMM do')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>
        </TabPanel>

        {/* Tasks Tab */}
        <TabPanel value={activeTab} index={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Task Management</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={openAddTask}>
                Create Task
              </Button>
            </Box>

            <Grid container spacing={2}>
              {['pending', 'in-progress', 'completed'].map(status => (
                <Grid item xs={12} md={4} key={status}>
                  <Typography variant="subtitle1" sx={{ mb: 2, textTransform: 'capitalize' }}>
                    {status.replace('-', ' ')} ({tasks.filter(t => t.status === status).length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasks
                      .filter(task => task.status === status)
                      .map(task => (
                        <Card key={task.id} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2">{task.title}</Typography>
                              <Chip
                                size="small"
                                label={task.priority}
                                color={getPriorityColor(task.priority)}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {task.field}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="caption">
                                {task.estimatedHours} hours • Due {task.dueDate}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                              <People fontSize="small" color="action" />
                              <Typography variant="caption">
                                {task.assignedTo.length} workers assigned
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {status !== 'completed' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => updateTaskStatus(task.id, 'completed')}
                                  fullWidth
                                >
                                  Complete
                                </Button>
                              )}
                              {status === 'pending' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => updateTaskStatus(task.id, 'in-progress')}
                                  fullWidth
                                >
                                  Start
                                </Button>
                              )}
                              <IconButton size="small" onClick={() => openEditTask(task)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </TabPanel>

        {/* Wages Tab */}
        <TabPanel value={activeTab} index={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Wages & Payments</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Download />} onClick={() => setExportDialog({ open: true })}>
                  Export
                </Button>
                <Button variant="contained" startIcon={<Payment />} onClick={() => openPaymentDialog()}>
                  Record Payment
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment History
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map(payment => {
                        const worker = workers.find(w => w.id === payment.workerId);
                        return (
                          <TableRow key={payment.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={worker?.photo} sx={{ mr: 1, width: 32, height: 32 }} />
                                <Typography variant="body2">{worker?.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{payment.period}</TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2">₹{payment.amount.toLocaleString()}</Typography>
                              {payment.deductions > 0 && (
                                <Typography variant="caption" color="error">
                                  -₹{payment.deductions} deductions
                                </Typography>
                              )}
                              {payment.bonus > 0 && (
                                <Typography variant="caption" color="success.main" display="block">
                                  +₹{payment.bonus} bonus
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={payment.status}
                                color={payment.status === 'paid' ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>{payment.method || '-'}</TableCell>
                            <TableCell align="right">
                              {payment.status === 'paid' ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Download />}
                                  onClick={() => generateWageSlip(worker)}
                                >
                                  Slip
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => {
                                    setPayments(payments.map(p =>
                                      p.id === payment.id ? { ...p, status: 'paid', paidOn: new Date().toISOString().split('T')[0], method: 'Bank Transfer' } : p
                                    ));
                                    showSnackbar('Payment marked as paid');
                                  }}
                                >
                                  Pay
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Summary
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Typography color="text.secondary" variant="body2">Total Paid (This Month)</Typography>
                      <Typography variant="h4" color="success.main">
                        ₹{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography color="text.secondary" variant="body2">Pending Payments</Typography>
                      <Typography variant="h4" color="warning.main">
                        ₹{payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      By Payment Method
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Bank Transfer</Typography>
                        <Typography variant="body2">
                          {payments.filter(p => p.method === 'Bank Transfer').length} payments
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Cash</Typography>
                        <Typography variant="body2">
                          {payments.filter(p => p.method === 'Cash').length} payments
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                  Wage Configuration
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Daily Wage Rate"
                          secondary="₹400 - ₹600"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Hourly Rate"
                          secondary="₹50 - ₹75"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Task-based Rate"
                          secondary="Varies by task"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Overtime Rate"
                          secondary="1.5x regular wage"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Issues Tab */}
        <TabPanel value={activeTab} index={5}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Issue Reporting & Management</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={openReportIssue}>
                Report Issue
              </Button>
            </Box>

            <Grid container spacing={2}>
              {['open', 'in-progress', 'resolved'].map(status => (
                <Grid item xs={12} md={4} key={status}>
                  <Typography variant="subtitle1" sx={{ mb: 2, textTransform: 'capitalize' }}>
                    {status.replace('-', ' ')} ({issues.filter(i => i.status === status).length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {issues
                      .filter(issue => issue.status === status)
                      .map(issue => {
                        const reporter = workers.find(w => w.id === issue.reportedBy);
                        return (
                          <Card key={issue.id} variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Chip
                                  size="small"
                                  label={issue.type}
                                  icon={issue.type === 'equipment' ? <Build /> : issue.type === 'crop' ? <LocalHospital /> : <Security />}
                                  color={issue.type === 'equipment' ? 'warning' : issue.type === 'crop' ? 'error' : 'info'}
                                />
                                <Chip
                                  size="small"
                                  label={issue.priority}
                                  color={getPriorityColor(issue.priority)}
                                />
                              </Box>
                              <Typography variant="subtitle2" gutterBottom>{issue.title}</Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {issue.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Avatar src={reporter?.photo} sx={{ width: 24, height: 24 }} />
                                <Typography variant="caption">
                                  Reported by {reporter?.name} on {issue.date}
                                </Typography>
                              </Box>
                              {issue.photos.length > 0 && (
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  <Chip size="small" icon={<CameraAlt />} label={`${issue.photos.length} photos`} />
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                {status === 'open' && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => updateIssueStatus(issue.id, 'in-progress')}
                                    fullWidth
                                  >
                                    Start Resolution
                                  </Button>
                                )}
                                {status === 'in-progress' && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => updateIssueStatus(issue.id, 'resolved')}
                                    fullWidth
                                  >
                                    Mark Resolved
                                  </Button>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </TabPanel>

        {/* Leave Tab */}
        <TabPanel value={activeTab} index={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Leave Management</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={openLeaveRequest}>
                Request Leave
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>
                  Leave Requests
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveRequests.map(leave => {
                        const worker = workers.find(w => w.id === leave.workerId);
                        return (
                          <TableRow key={leave.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={worker?.photo} sx={{ mr: 1, width: 32, height: 32 }} />
                                <Typography variant="body2">{worker?.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={leave.type} color="info" />
                            </TableCell>
                            <TableCell>
                              {leave.startDate} to {leave.endDate}
                              <Typography variant="caption" display="block">
                                {leave.days} days
                              </Typography>
                            </TableCell>
                            <TableCell>{leave.reason}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={leave.status}
                                color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {leave.status === 'pending' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => approveLeave(leave.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => rejectLeave(leave.id)}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Leave Balance Summary
                </Typography>
                {workers.slice(0, 3).map(worker => (
                  <Card key={worker.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={worker.photo} sx={{ mr: 2 }} />
                        <Typography variant="subtitle2">{worker.name}</Typography>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                            <Typography variant="h6" color="success.dark">{worker.leaveBalance.casual}</Typography>
                            <Typography variant="caption">Casual</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                            <Typography variant="h6" color="error.dark">{worker.leaveBalance.sick}</Typography>
                            <Typography variant="caption">Sick</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                            <Typography variant="h6" color="info.dark">{worker.leaveBalance.earned}</Typography>
                            <Typography variant="caption">Earned</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={activeTab} index={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Worker Performance Reports
            </Typography>

            <Grid container spacing={2}>
              {workers.map(worker => {
                const performance = calculatePerformance(worker.id);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={worker.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={worker.photo} sx={{ mr: 2, width: 56, height: 56 }} />
                          <Box>
                            <Typography variant="h6">{worker.name}</Typography>
                            <Chip size="small" label={worker.role} color={getRoleColor(worker.role)} />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Productivity Score</Typography>
                            <Typography variant="subtitle2" color="primary">
                              {performance.productivity}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={parseFloat(performance.productivity)}
                            sx={{ height: 8, borderRadius: 4 }}
                            color={parseFloat(performance.productivity) > 80 ? 'success' : parseFloat(performance.productivity) > 60 ? 'warning' : 'error'}
                          />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                              <Typography variant="h6" color="success.main">
                                {performance.attendanceRate}%
                              </Typography>
                              <Typography variant="caption">Attendance</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                              <Typography variant="h6" color="info.main">
                                {performance.taskCompletion}%
                              </Typography>
                              <Typography variant="caption">Tasks Done</Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="body2" color="text.secondary">
                          Tasks: {performance.completedTasks}/{performance.totalAssigned} completed
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Experience: {worker.experience} years
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Skills: {worker.skills.length}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            fullWidth
                            startIcon={<Assessment />}
                          >
                            View Full Report
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Worker</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Productivity</TableCell>
                      <TableCell align="right">Attendance</TableCell>
                      <TableCell align="right">Tasks</TableCell>
                      <TableCell>Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workers
                      .map(worker => ({
                        ...worker,
                        performance: calculatePerformance(worker.id),
                      }))
                      .sort((a, b) => parseFloat(b.performance.productivity) - parseFloat(a.performance.productivity))
                      .slice(0, 5)
                      .map((worker, idx) => (
                        <TableRow key={worker.id} hover>
                          <TableCell>
                            <Chip
                              size="small"
                              label={`#${idx + 1}`}
                              color={idx === 0 ? 'warning' : idx === 1 ? 'default' : idx === 2 ? 'default' : 'default'}
                              icon={idx < 3 ? <EmojiEvents /> : undefined}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={worker.photo} sx={{ mr: 1, width: 32, height: 32 }} />
                              <Typography variant="body2">{worker.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{worker.role}</TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" color="primary">
                              {worker.performance.productivity}%
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{worker.performance.attendanceRate}%</TableCell>
                          <TableCell align="right">{worker.performance.completedTasks}</TableCell>
                          <TableCell>
                            <Rating
                              value={parseFloat(worker.performance.productivity) / 20}
                              readOnly
                              size="small"
                              precision={0.5}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </TabPanel>

        {/* Add/Edit Worker Dialog */}
        <Dialog open={workerDialog.open} onClose={() => setWorkerDialog({ ...workerDialog, open: false })} maxWidth="md" fullWidth>
          <DialogTitle>
            {workerDialog.mode === 'add' ? 'Add New Worker' : 'Edit Worker'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={workerForm.phone}
                  onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={workerForm.role}
                    onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="Permanent">Permanent</MenuItem>
                    <MenuItem value="Temporary">Temporary</MenuItem>
                    <MenuItem value="Seasonal">Seasonal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={workerForm.status}
                    onChange={(e) => setWorkerForm({ ...workerForm, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on-leave">On Leave</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wage Amount (₹)"
                  type="number"
                  value={workerForm.wage}
                  onChange={(e) => setWorkerForm({ ...workerForm, wage: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Wage Type</InputLabel>
                  <Select
                    value={workerForm.wageType}
                    onChange={(e) => setWorkerForm({ ...workerForm, wageType: e.target.value })}
                    label="Wage Type"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="task-based">Task-based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  value={workerForm.experience}
                  onChange={(e) => setWorkerForm({ ...workerForm, experience: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={['Tractor Operation', 'Irrigation', 'Harvesting', 'Planting', 'Weeding', 'Sorting', 'Packing', 'Supervision']}
                  value={workerForm.skills}
                  onChange={(e, newValue) => setWorkerForm({ ...workerForm, skills: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Skills" placeholder="Add skills" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={['Tractor License', 'Pesticide Handling', 'First Aid', 'Supervisor Training']}
                  value={workerForm.certifications}
                  onChange={(e, newValue) => setWorkerForm({ ...workerForm, certifications: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Certifications" placeholder="Add certifications" />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWorkerDialog({ ...workerDialog, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={saveWorker}>
              {workerDialog.mode === 'add' ? 'Add Worker' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit Task Dialog */}
        <Dialog open={taskDialog.open} onClose={() => setTaskDialog({ ...taskDialog, open: false })} maxWidth="md" fullWidth>
          <DialogTitle>
            {taskDialog.mode === 'add' ? 'Create New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Task Title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field/Location"
                  value={taskForm.field}
                  onChange={(e) => setTaskForm({ ...taskForm, field: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date"
                  value={taskForm.dueDate}
                  onChange={(date) => setTaskForm({ ...taskForm, dueDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Hours"
                  type="number"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assign Workers</InputLabel>
                  <Select
                    multiple
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    label="Assign Workers"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const worker = workers.find(w => w.id === value);
                          return <Chip key={value} label={worker?.name} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {workers.map((worker) => (
                      <MenuItem key={worker.id} value={worker.id}>
                        <Checkbox checked={taskForm.assignedTo.includes(worker.id)} />
                        <ListItemText primary={worker.name} secondary={worker.role} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialog({ ...taskDialog, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={saveTask}>
              {taskDialog.mode === 'add' ? 'Create Task' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Report Issue Dialog */}
        <Dialog open={issueDialog.open} onClose={() => setIssueDialog({ ...issueDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    value={issueForm.type}
                    onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value })}
                    label="Issue Type"
                  >
                    <MenuItem value="equipment">Equipment Damage</MenuItem>
                    <MenuItem value="crop">Crop Problem</MenuItem>
                    <MenuItem value="safety">Safety Issue</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Issue Title"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={issueForm.priority}
                    onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  component="label"
                >
                  Upload Photos
                  <input type="file" hidden multiple accept="image/*" />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIssueDialog({ ...issueDialog, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={reportIssue} color="error">
              Report Issue
            </Button>
          </DialogActions>
        </Dialog>

        {/* Leave Request Dialog */}
        <Dialog open={leaveDialog.open} onClose={() => setLeaveDialog({ ...leaveDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    label="Leave Type"
                  >
                    <MenuItem value="casual">Casual Leave</MenuItem>
                    <MenuItem value="sick">Sick Leave</MenuItem>
                    <MenuItem value="earned">Earned Leave</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={leaveForm.startDate}
                  onChange={(date) => setLeaveForm({ ...leaveForm, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={leaveForm.endDate}
                  onChange={(date) => setLeaveForm({ ...leaveForm, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLeaveDialog({ ...leaveDialog, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={submitLeaveRequest}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog.open} onClose={() => setPaymentDialog({ ...paymentDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Worker</InputLabel>
                  <Select
                    value={paymentForm.workerId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, workerId: e.target.value })}
                    label="Worker"
                  >
                    {workers.map(worker => (
                      <MenuItem key={worker.id} value={worker.id}>{worker.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Days Worked"
                  type="number"
                  value={paymentForm.days}
                  onChange={(e) => setPaymentForm({ ...paymentForm, days: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Period"
                  placeholder="e.g., 2024-03-01 to 2024-03-15"
                  value={paymentForm.period}
                  onChange={(e) => setPaymentForm({ ...paymentForm, period: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deductions (₹)"
                  type="number"
                  value={paymentForm.deductions}
                  onChange={(e) => setPaymentForm({ ...paymentForm, deductions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bonus (₹)"
                  type="number"
                  value={paymentForm.bonus}
                  onChange={(e) => setPaymentForm({ ...paymentForm, bonus: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    label="Payment Method"
                  >
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Check">Check</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialog({ ...paymentDialog, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={recordPayment}>
              Record Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Wage Slip Dialog */}
        <Dialog open={wageSlipDialog.open} onClose={() => setWageSlipDialog({ ...wageSlipDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment />
              Wage Slip
            </Box>
          </DialogTitle>
          <DialogContent>
            {wageSlipDialog.worker && (
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" gutterBottom>Farm Management System</Typography>
                  <Typography variant="subtitle1">Wage Slip</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Period: {format(new Date(), 'MMMM yyyy')}
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Worker Name</Typography>
                    <Typography variant="body1">{wageSlipDialog.worker.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Worker ID</Typography>
                    <Typography variant="body1">#{wageSlipDialog.worker.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Role</Typography>
                    <Typography variant="body1">{wageSlipDialog.worker.role}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Join Date</Typography>
                    <Typography variant="body1">{wageSlipDialog.worker.joinDate}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>Earnings</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Basic Wage</Typography>
                  <Typography variant="body2">₹{(wageSlipDialog.worker.wage * 26).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Bonus</Typography>
                  <Typography variant="body2" color="success.main">+₹500</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overtime</Typography>
                  <Typography variant="body2">₹0</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" gutterBottom>Deductions</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Advance</Typography>
                  <Typography variant="body2" color="error">-₹200</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Net Pay</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{(wageSlipDialog.worker.wage * 26 + 500 - 200).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    This is a computer-generated slip and does not require signature.
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWageSlipDialog({ ...wageSlipDialog, open: false })}>Close</Button>
            <Button variant="contained" startIcon={<Download />} onClick={downloadWageSlip}>
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>

        {/* Worker Details Dialog */}
        <Dialog open={workerDetailsDialog.open} onClose={() => setWorkerDetailsDialog({ ...workerDetailsDialog, open: false })} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {workerDetailsDialog.worker && (
                <>
                  <Avatar src={workerDetailsDialog.worker.photo} sx={{ width: 64, height: 64 }} />
                  <Box>
                    <Typography variant="h6">{workerDetailsDialog.worker.name}</Typography>
                    <Chip size="small" label={workerDetailsDialog.worker.role} color={getRoleColor(workerDetailsDialog.worker.role)} />
                  </Box>
                </>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            {workerDetailsDialog.worker && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemAvatar><Avatar><Phone /></Avatar></ListItemAvatar>
                      <ListItemText primary="Phone" secondary={workerDetailsDialog.worker.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar><Avatar><Work /></Avatar></ListItemAvatar>
                      <ListItemText primary="Role" secondary={workerDetailsDialog.worker.role} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar><Avatar><CalendarToday /></Avatar></ListItemAvatar>
                      <ListItemText primary="Joined" secondary={workerDetailsDialog.worker.joinDate} />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {workerDetailsDialog.worker.skills.map((skill, idx) => (
                      <Chip key={idx} label={skill} size="small" />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Certifications</Typography>
                  {workerDetailsDialog.worker.certifications.length > 0 ? (
                    <List dense>
                      {workerDetailsDialog.worker.certifications.map((cert, idx) => (
                        <ListItem key={idx}>
                          <ListItemAvatar><Avatar><School /></Avatar></ListItemAvatar>
                          <ListItemText primary={cert} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No certifications</Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Performance</Typography>
                  {(() => {
                    const perf = calculatePerformance(workerDetailsDialog.worker.id);
                    return (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">Attendance Rate: {perf.attendanceRate}%</Typography>
                          <LinearProgress variant="determinate" value={parseFloat(perf.attendanceRate)} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">Task Completion: {perf.taskCompletion}%</Typography>
                          <LinearProgress variant="determinate" value={parseFloat(perf.taskCompletion)} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">Productivity Score: {perf.productivity}%</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(perf.productivity)} 
                            color="success"
                            sx={{ height: 6, borderRadius: 3 }} 
                          />
                        </Box>
                      </>
                    );
                  })()}

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Leave Balance</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="h6" color="success.dark">
                          {workerDetailsDialog.worker.leaveBalance.casual}
                        </Typography>
                        <Typography variant="caption">Casual</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="h6" color="error.dark">
                          {workerDetailsDialog.worker.leaveBalance.sick}
                        </Typography>
                        <Typography variant="caption">Sick</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="h6" color="info.dark">
                          {workerDetailsDialog.worker.leaveBalance.earned}
                        </Typography>
                        <Typography variant="caption">Earned</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWorkerDetailsDialog({ ...workerDetailsDialog, open: false })}>Close</Button>
            <Button variant="contained" onClick={() => {
              setWorkerDetailsDialog({ ...workerDetailsDialog, open: false });
              openEditWorker(workerDetailsDialog.worker);
            }}>
              Edit Worker
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Attendance Dialog */}
        <Dialog open={bulkAttendanceDialog.open} onClose={() => setBulkAttendanceDialog({ ...bulkAttendanceDialog, open: false })} maxWidth="xs" fullWidth>
          <DialogTitle>Bulk Mark Attendance</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mark all workers as:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<CheckCircle />} onClick={() => bulkMarkAttendance('present')} fullWidth>
                All Present
              </Button>
              <Button variant="outlined" startIcon={<Schedule />} onClick={() => bulkMarkAttendance('half-day')} fullWidth>
                All Half Day
              </Button>
              <Button variant="outlined" startIcon={<Cancel />} onClick={() => bulkMarkAttendance('absent')} fullWidth>
                All Absent
              </Button>
              <Button variant="outlined" startIcon={<BeachAccess />} onClick={() => bulkMarkAttendance('leave')} fullWidth>
                All On Leave
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkAttendanceDialog({ ...bulkAttendanceDialog, open: false })}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialog.open} onClose={() => setExportDialog({ ...exportDialog, open: false })} maxWidth="xs" fullWidth>
          <DialogTitle>Export Data</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select data to export as CSV:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<People />} onClick={() => exportData('workers')} fullWidth>
                Workers List
              </Button>
              <Button variant="outlined" startIcon={<CheckCircle />} onClick={() => exportData('attendance')} fullWidth>
                Attendance Records
              </Button>
              <Button variant="outlined" startIcon={<Payment />} onClick={() => exportData('payments')} fullWidth>
                Payment History
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog({ ...exportDialog, open: false })}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog open={notificationDialog.open} onClose={() => setNotificationDialog({ ...notificationDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications />
              Notifications
              <Chip size="small" label={notifications.filter(n => !n.read).length} color="error" />
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {notifications.map(notification => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: notification.type === 'absence' ? 'error.main' :
                        notification.type === 'payment' ? 'warning.main' :
                          notification.type === 'issue' ? 'error.main' : 'primary.main'
                    }}>
                      {notification.type === 'absence' ? <Cancel /> :
                        notification.type === 'payment' ? <Payment /> :
                          notification.type === 'issue' ? <Report /> : <Info />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={format(notification.date, 'MMM do, h:mm a')}
                  />
                  {!notification.read && (
                    <Chip size="small" label="New" color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}>Close</Button>
            <Button variant="outlined" onClick={() => {
              setNotifications(notifications.map(n => ({ ...n, read: true })));
              showSnackbar('All notifications marked as read');
            }}>
              Mark All Read
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default WorkersManagement;
