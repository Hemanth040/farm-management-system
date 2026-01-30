import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const timelineService = {
    // Get activities with filters
    getActivities: (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        return api.get(`/timeline?${params.toString()}`).then(res => res.data);
    },

    // Get activity by ID
    getActivity: (id) => api.get(`/timeline/${id}`).then(res => res.data),

    // Create activity
    createActivity: (data) => api.post('/timeline', data).then(res => res.data),

    // Update activity
    updateActivity: (id, data) => api.put(`/timeline/${id}`, data).then(res => res.data),

    // Delete activity
    deleteActivity: (id) => api.delete(`/timeline/${id}`).then(res => res.data),

    // Start activity
    startActivity: (id) => api.post(`/timeline/${id}/start`).then(res => res.data),

    // Complete activity
    completeActivity: (id, data) => api.post(`/timeline/${id}/complete`, data).then(res => res.data),

    // Add comment
    addComment: (id, comment) => api.post(`/timeline/${id}/comments`, comment).then(res => res.data),

    // Upload attachment
    uploadAttachment: (id, attachment) => api.post(`/timeline/${id}/attachments`, attachment).then(res => res.data),

    // Get analytics
    getAnalytics: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/timeline/analytics/overview${queryParams ? '?' + queryParams : ''}`).then(res => res.data);
    },

    // Generate from crop plan
    generateFromCropPlan: (cropId, startDate) => 
        api.post('/timeline/generate-from-plan', { cropId, startDate }).then(res => res.data)
};

export const resourcesService = {
    getResources: (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });
        return api.get(`/resources?${params.toString()}`).then(res => res.data);
    },
    getResource: (id) => api.get(`/resources/${id}`).then(res => res.data),
    createResource: (data) => api.post('/resources', data).then(res => res.data),
    updateResource: (id, data) => api.put(`/resources/${id}`, data).then(res => res.data),
    deleteResource: (id) => api.delete(`/resources/${id}`).then(res => res.data),
    useResource: (id, data) => api.post(`/resources/${id}/use`, data).then(res => res.data),
    addStock: (id, data) => api.post(`/resources/${id}/add-stock`, data).then(res => res.data),
    resolveAlert: (resourceId, alertId) => api.post(`/resources/${resourceId}/alerts/${alertId}/resolve`).then(res => res.data),
    getAnalytics: () => api.get('/resources/analytics/overview').then(res => res.data),
    exportToCSV: () => {
        return api.get('/resources/export/csv', { responseType: 'blob' }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'resources-export.csv');
            document.body.appendChild(link);
            link.click();
        });
    }
};

export const financialService = {
    getTransactions: (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                if (filters[key] instanceof Date) {
                    params.append(key, filters[key].toISOString());
                } else {
                    params.append(key, filters[key]);
                }
            }
        });
        return api.get(`/financial/transactions?${params.toString()}`).then(res => res.data);
    },
    getTransaction: (id) => api.get(`/financial/transactions/${id}`).then(res => res.data),
    createTransaction: (data) => api.post('/financial/transactions', data).then(res => res.data),
    updateTransaction: (id, data) => api.put(`/financial/transactions/${id}`, data).then(res => res.data),
    deleteTransaction: (id) => api.delete(`/financial/transactions/${id}`).then(res => res.data),
    markPaymentPaid: (id, data) => api.post(`/financial/transactions/${id}/mark-paid`, data).then(res => res.data),
    getProfitLoss: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/financial/profit-loss?${queryParams}`).then(res => res.data);
    },
    getPendingPayments: () => api.get('/financial/pending-payments').then(res => res.data),
    getExpenseBreakdown: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/financial/expense-breakdown?${queryParams}`).then(res => res.data);
    },
    getIncomeBreakdown: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/financial/income-breakdown?${queryParams}`).then(res => res.data);
    },
    getCropWiseProfit: () => api.get('/financial/report').then(res => res.data.cropWiseProfit), // Assuming report endpoint returns cropWiseProfit as part of it or use a specific endpoint if exists. 
    // Actually backend route /financial/report returns cropWiseProfit. Also /financial/profit-loss returns cropWiseProfit.
    // The FinancialDashboard calls `financialService.getCropWiseProfit()` which was expected to be a direct call.
    // In backend/routes/financial.js, `router.get('/profit-loss'...)` returns `cropWiseProfit`.
    // So getProfitLoss returns it. But FinancialDashboard calls both.
    // Let's check FinancialDashboard code provided:
    // `const [transactionsRes, expenseRes, incomeRes, pendingRes, cropRes] = await Promise.all([..., financialService.getCropWiseProfit()])`
    // So I should probably add a specific method or reuse.
    // Backend `router.get('/profit-loss')` returns `{..., cropWiseProfit, ...}`.
    // But there is NO specific endpoint just for cropWiseProfit. 
    // However, `router.get('/report')` returns it too.
    // I will implement getCropWiseProfit to call profit-loss and extract it or just return the profit-loss response.
    // Wait, looking at the backend code provided in prompt 2 step 2:
    // `FinancialTransaction.getCropWiseProfit` is a static method.
    // It is used in `/profit-loss` and `/report`.
    // I will simulate it by calling profit-loss and extracting cropWiseProfit to match the dashboard's expectation if it expects an array directly.
    
    getInsights: () => api.get('/financial/insights').then(res => res.data),
    exportToCSV: (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                if (filters[key] instanceof Date) {
                    params.append(key, filters[key].toISOString());
                } else {
                    params.append(key, filters[key]);
                }
            }
        });
        return api.get(`/financial/export/csv?${params.toString()}`, { responseType: 'blob' }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'financial-report.csv');
            document.body.appendChild(link);
            link.click();
        });
    }
};

export const cropHealthService = {
    getCropHealth: (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        return api.get(`/crop-health?${params.toString()}`).then(res => res.data);
    },
    getCropHealthById: (id) => api.get(`/crop-health/${id}`).then(res => res.data),
    createCropHealth: (data) => api.post('/crop-health', data).then(res => res.data),
    reportIssue: (id, data) => api.post(`/crop-health/${id}/issues`, data).then(res => res.data),
    aiDiagnosis: (data) => api.post('/crop-health/ai-diagnosis', data).then(res => res.data),
    getTreatments: (id, issueId) => api.get(`/crop-health/${id}/issues/${issueId}/treatments`).then(res => res.data),
    applyTreatment: (id, issueId, data) => api.post(`/crop-health/${id}/issues/${issueId}/treatments/apply`, data).then(res => res.data),
    resolveIssue: (id, issueId, data) => api.post(`/crop-health/${id}/issues/${issueId}/resolve`, data).then(res => res.data),
    getAlerts: (id) => api.get(`/crop-health/${id}/alerts`).then(res => res.data),
    acknowledgeAlert: (id, alertId) => api.post(`/crop-health/${id}/alerts/${alertId}/acknowledge`).then(res => res.data),
    nutrientAnalysis: (id, data) => api.post(`/crop-health/${id}/nutrient-analysis`, data).then(res => res.data),
    getGrowthGuidance: (id) => api.get(`/crop-health/${id}/growth-guidance`).then(res => res.data),
    getHistory: (id) => api.get(`/crop-health/${id}/history`).then(res => res.data),
    getReport: (id) => api.get(`/crop-health/${id}/report`).then(res => res.data),
    searchDiseases: (symptoms, cropName) => api.post('/crop-health/search-diseases', { symptoms, cropName }).then(res => res.data)
};

export const cropService = {
    // Get all crops
    getCrops: () => api.get('/crops').then(res => res.data),
    
    // Get a single crop by ID
    getCropById: (id) => api.get(`/crops/${id}`).then(res => res.data),
    
    // Create a new crop
    createCrop: (data) => api.post('/crops', data).then(res => res.data),
    
    // Update a crop
    updateCrop: (id, data) => api.put(`/crops/${id}`, data).then(res => res.data),
    
    // Delete a crop
    deleteCrop: (id) => api.delete(`/crops/${id}`).then(res => res.data),
    
    // Get crop plan/recommendations
    getCropPlan: (season, landType) => api.get(`/crops/plan`, { params: { season, landType } }).then(res => res.data),
    
    // Get crop recommendations based on season and soil type
    getRecommendations: (season, soilType) => api.get('/crops/recommendations', { params: { season, soilType } }).then(res => res.data),
    
    // Get annual timeline
    getAnnualTimeline: (year) => api.get('/crops/timeline', { params: { year } }).then(res => res.data)
};

export const workerService = {
    // Get all workers
    getWorkers: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/workers?${params}`).then(res => res.data);
    },
    
    // Get a single worker by ID with full details
    getWorkerById: (id) => api.get(`/workers/${id}`).then(res => res.data),
    
    // Create a new worker
    createWorker: (data) => api.post('/workers', data).then(res => res.data),
    
    // Update a worker
    updateWorker: (id, data) => api.put(`/workers/${id}`, data).then(res => res.data),
    
    // Delete/Deactivate a worker
    deleteWorker: (id) => api.delete(`/workers/${id}`).then(res => res.data),
    
    // Assign task to worker
    assignTask: (workerId, data) => api.post(`/workers/${workerId}/assign`, data).then(res => res.data),
    
    // Get worker's tasks
    getWorkerTasks: (workerId, filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/workers/${workerId}/tasks?${params}`).then(res => res.data);
    }
};

// Enhanced Worker Management Service
export const workerManagementService = {
    // Attendance Management
    getAttendanceReport: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/workers/attendance/report?${queryParams}`).then(res => res.data);
    },
    
    getTodayAttendance: () => api.get('/workers/attendance/today').then(res => res.data),
    
    markAttendance: (data) => api.post('/workers/attendance', data).then(res => res.data),
    
    markBulkAttendance: (data) => api.post('/workers/attendance/bulk', data).then(res => res.data),
    
    // Wages & Payments
    calculateWages: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/workers/wages/calculate?${queryParams}`).then(res => res.data);
    },
    
    recordPayment: (data) => api.post('/workers/wages/pay', data).then(res => res.data),
    
    getWorkerWages: (workerId, params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/workers/${workerId}/wages?${queryParams}`).then(res => res.data);
    },
    
    generateWageSlip: (workerId, wageId) => 
        api.get(`/workers/${workerId}/wage-slip/${wageId}`).then(res => res.data),
    
    // Issue Reporting
    reportIssue: (data) => api.post('/workers/issues', data).then(res => res.data),
    
    getIssues: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/workers/issues?${params}`).then(res => res.data);
    },
    
    updateIssue: (issueId, data) => api.put(`/workers/issues/${issueId}`, data).then(res => res.data),
    
    // Leave Management
    requestLeave: (data) => api.post('/workers/leave', data).then(res => res.data),
    
    getLeaveRequests: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/workers/leave?${params}`).then(res => res.data);
    },
    
    updateLeaveStatus: (leaveId, data) => api.put(`/workers/leave/${leaveId}`, data).then(res => res.data),
    
    // Performance Reports
    getPerformanceReport: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/workers/performance/report?${queryParams}`).then(res => res.data);
    }
};

export const authService = {
    // Login user
    login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
    
    // Register user
    register: (data) => api.post('/auth/register', data).then(res => res.data),
    
    // Get current user profile
    getProfile: () => api.get('/auth/profile').then(res => res.data),
    
    // Update user profile
    updateProfile: (data) => api.put('/auth/profile', data).then(res => res.data),
    
    // Logout (client-side only)
    logout: () => {
        localStorage.removeItem('token');
    }
};

export const farmerService = {
    // Reminders
    getReminders: () => api.get('/farmer/reminders').then(res => res.data),
    createReminder: (data) => api.post('/farmer/reminders', data).then(res => res.data),
    updateReminder: (id, data) => api.put(`/farmer/reminders/${id}`, data).then(res => res.data),
    deleteReminder: (id) => api.delete(`/farmer/reminders/${id}`).then(res => res.data),
    
    // Warnings
    getWarnings: () => api.get('/farmer/warnings').then(res => res.data),
    
    // Activities
    getActivities: (filters) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/farmer/activities?${params}`).then(res => res.data);
    },
    
    // Resources
    getFarmerResources: () => api.get('/farmer/resources').then(res => res.data),
    
    // Financial
    getFarmerFinancial: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/farmer/financial?${queryParams}`).then(res => res.data);
    },
    
    // Diseases
    getDiseases: (cropName, symptom) => api.get('/farmer/diseases', { params: { cropName, symptom } }).then(res => res.data),
    
    // Reports
    getReports: (reportType, year) => api.get('/farmer/reports', { params: { reportType, year } }).then(res => res.data),
    
    // Pesticide Guidance
    getPesticideGuidance: (crop, pest) => api.get('/farmer/pesticide-guidance', { params: { crop, pest } }).then(res => res.data),
    
    // Sales
    getSales: () => api.get('/farmer/sales').then(res => res.data),
    createSale: (data) => api.post('/farmer/sales', data).then(res => res.data),
    
    // Weed Management
    getWeedManagement: (crop) => api.get('/farmer/weed-management', { params: { crop } }).then(res => res.data)
};

export const reportsService = {
    // Farm Summary Report
    getFarmSummary: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/farm-summary?${queryParams}`).then(res => res.data);
    },
    
    // Crop Performance Report
    getCropPerformance: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/crop-performance?${queryParams}`).then(res => res.data);
    },
    
    // Activity Report
    getActivityReport: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/activity-report?${queryParams}`).then(res => res.data);
    },
    
    // Resource Usage Report
    getResourceUsage: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/resource-usage?${queryParams}`).then(res => res.data);
    },
    
    // Financial Report
    getFinancialReport: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/financial-report?${queryParams}`).then(res => res.data);
    },
    
    // Worker Performance Report
    getWorkerPerformance: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/worker-performance?${queryParams}`).then(res => res.data);
    },
    
    // Crop Health Report
    getCropHealthReport: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/crop-health?${queryParams}`).then(res => res.data);
    },
    
    // Seasonal Comparison Report
    getSeasonalComparison: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/seasonal-comparison?${queryParams}`).then(res => res.data);
    },
    
    // AI Insights
    getAIInsights: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/ai-insights?${queryParams}`).then(res => res.data);
    },
    
    // Predictive Analytics
    getPredictions: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/predictions?${queryParams}`).then(res => res.data);
    },
    
    // Profitability Analysis
    getProfitabilityAnalysis: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/profitability-analysis?${queryParams}`).then(res => res.data);
    },
    
    // Weather Impact Report
    getWeatherImpact: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/weather-impact?${queryParams}`).then(res => res.data);
    },
    
    // Government & Compliance Report
    getComplianceReport: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return api.get(`/reports/compliance?${queryParams}`).then(res => res.data);
    },
    
    // Export Report
    exportReport: (reportType, format, params = {}) => {
        return api.post('/reports/export', { reportType, format, filters: params }, {
            responseType: format === 'csv' ? 'text' : 'json'
        }).then(res => res.data);
    }
};

export default api;
