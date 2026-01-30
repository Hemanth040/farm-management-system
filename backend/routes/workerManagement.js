const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Worker, Attendance, WageRecord, WorkerIssue, LeaveRequest, TimelineActivity, Activity, Field, Crop } = require('../models');
const auth = require('../middleware/auth');

// ============================================
// WORKER MANAGEMENT - COMPREHENSIVE API
// ============================================

// 1. GET ALL WORKERS
router.get('/', auth, async (req, res) => {
    try {
        const { status, workerType, role, skill, search } = req.query;
        
        let query = { farmer: req.user.id };
        if (status) query.status = status;
        if (workerType) query.workerType = workerType;
        if (role) query.role = role;
        if (skill) query.skills = skill;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        const workers = await Worker.find(query)
            .populate('currentAssignments.activity', 'title type status')
            .populate('currentAssignments.field', 'name')
            .populate('currentAssignments.crop', 'name')
            .sort({ createdAt: -1 });
        
        res.json({ workers, count: workers.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. CREATE NEW WORKER
router.post('/', auth, async (req, res) => {
    try {
        const worker = new Worker({
            ...req.body,
            farmer: req.user.id,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });
        
        await worker.save();
        
        // Populate and return
        const populatedWorker = await Worker.findById(worker._id)
            .populate('currentAssignments.activity', 'title type')
            .populate('currentAssignments.field', 'name')
            .populate('currentAssignments.crop', 'name');
        
        res.status(201).json({ 
            message: 'Worker created successfully', 
            worker: populatedWorker 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. UPDATE WORKER
router.put('/:id', auth, async (req, res) => {
    try {
        const worker = await Worker.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            { 
                ...req.body, 
                updatedBy: req.user.id,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        res.json({ message: 'Worker updated successfully', worker });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE/DEACTIVATE WORKER
router.delete('/:id', auth, async (req, res) => {
    try {
        const worker = await Worker.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            { status: 'inactive', updatedBy: req.user.id },
            { new: true }
        );
        
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        res.json({ message: 'Worker deactivated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. GET WORKER BY ID (DETAILED PROFILE)
router.get('/:id', auth, async (req, res) => {
    try {
        const worker = await Worker.findOne({
            _id: req.params.id,
            farmer: req.user.id
        })
        .populate('currentAssignments.activity', 'title type status date')
        .populate('currentAssignments.field', 'name location')
        .populate('currentAssignments.crop', 'name variety');
        
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        // Get recent attendance
        const recentAttendance = await Attendance.find({
            worker: req.params.id,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ date: -1 }).limit(10);
        
        // Get pending wages
        const pendingWages = await WageRecord.find({
            worker: req.params.id,
            paymentStatus: 'pending'
        });
        
        // Get recent issues
        const recentIssues = await WorkerIssue.find({
            worker: req.params.id
        }).sort({ createdAt: -1 }).limit(5);
        
        res.json({
            worker,
            recentAttendance,
            pendingWages: {
                count: pendingWages.length,
                totalAmount: pendingWages.reduce((sum, w) => sum + w.amount, 0),
                records: pendingWages
            },
            recentIssues
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ATTENDANCE MANAGEMENT
// ============================================

// Get attendance for date range
router.get('/attendance/report', auth, async (req, res) => {
    try {
        const { startDate, endDate, workerId } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        
        let query = {
            farmer: req.user.id,
            date: { $gte: start, $lte: end }
        };
        if (workerId) query.worker = workerId;
        
        const attendance = await Attendance.find(query)
            .populate('worker', 'name phone wageAmount')
            .sort({ date: -1 });
        
        // Calculate summary
        const summary = {
            totalDays: new Set(attendance.map(a => a.date.toDateString())).size,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            halfDay: attendance.filter(a => a.status === 'half_day').length,
            totalWorkers: new Set(attendance.map(a => a.worker._id.toString())).size
        };
        
        // Group by worker
        const byWorker = {};
        attendance.forEach(a => {
            const workerId = a.worker._id.toString();
            if (!byWorker[workerId]) {
                byWorker[workerId] = {
                    worker: a.worker,
                    present: 0,
                    absent: 0,
                    halfDay: 0,
                    totalWages: 0
                };
            }
            byWorker[workerId][a.status === 'half_day' ? 'halfDay' : a.status]++;
            if (a.wageAmount) byWorker[workerId].totalWages += a.wageAmount;
        });
        
        res.json({
            attendance,
            summary,
            byWorker: Object.values(byWorker)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark attendance
router.post('/attendance', auth, async (req, res) => {
    try {
        const { workerId, date, status, checkIn, checkOut, location, notes } = req.body;
        
        // Check if attendance already exists
        let attendance = await Attendance.findOne({
            worker: workerId,
            date: new Date(date)
        });
        
        const worker = await Worker.findOne({ _id: workerId, farmer: req.user.id });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        // Calculate wage for the day
        let wageAmount = 0;
        if (status === 'present') wageAmount = worker.wageAmount;
        else if (status === 'half_day') wageAmount = worker.wageAmount * 0.5;
        
        if (attendance) {
            // Update existing
            attendance.status = status;
            attendance.checkIn = checkIn;
            attendance.checkOut = checkOut;
            attendance.location = location;
            attendance.notes = notes;
            attendance.wageAmount = wageAmount;
            attendance.markedBy = req.user.id;
        } else {
            // Create new
            attendance = new Attendance({
                farmer: req.user.id,
                worker: workerId,
                date: new Date(date),
                status,
                checkIn,
                checkOut,
                location,
                notes,
                wageAmount,
                markedBy: req.user.id
            });
        }
        
        await attendance.save();
        
        // Update worker attendance summary
        await updateWorkerAttendanceSummary(workerId);
        
        res.json({ 
            message: 'Attendance marked successfully', 
            attendance,
            wageAmount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark bulk attendance
router.post('/attendance/bulk', auth, async (req, res) => {
    try {
        const { date, attendanceRecords } = req.body;
        
        const results = [];
        for (const record of attendanceRecords) {
            const worker = await Worker.findOne({ 
                _id: record.workerId, 
                farmer: req.user.id 
            });
            
            if (worker) {
                let wageAmount = 0;
                if (record.status === 'present') wageAmount = worker.wageAmount;
                else if (record.status === 'half_day') wageAmount = worker.wageAmount * 0.5;
                
                const attendance = await Attendance.findOneAndUpdate(
                    {
                        worker: record.workerId,
                        date: new Date(date)
                    },
                    {
                        farmer: req.user.id,
                        status: record.status,
                        wageAmount,
                        markedBy: req.user.id,
                        notes: record.notes
                    },
                    { upsert: true, new: true }
                );
                
                results.push({ worker: worker.name, status: record.status, wageAmount });
                await updateWorkerAttendanceSummary(record.workerId);
            }
        }
        
        res.json({ message: 'Bulk attendance marked successfully', results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// TASK ASSIGNMENT
// ============================================

// Assign task to worker
router.post('/:id/assign', auth, async (req, res) => {
    try {
        const { activityId, fieldId, cropId, startDate, endDate } = req.body;
        
        const worker = await Worker.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        // Add to current assignments
        worker.currentAssignments.push({
            activity: activityId,
            field: fieldId,
            crop: cropId,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            status: 'assigned'
        });
        
        // Update performance
        worker.performance.tasksAssigned += 1;
        
        await worker.save();
        
        // Also update activity with worker assignment
        if (activityId) {
            await Activity.findByIdAndUpdate(activityId, {
                $addToSet: { workers: req.params.id }
            });
        }
        
        res.json({ message: 'Task assigned successfully', worker });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get worker's tasks
router.get('/:id/tasks', auth, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {
            'assignedTo.worker': req.params.id,
            farmer: req.user.id
        };
        if (status) query.status = status;
        
        const tasks = await TimelineActivity.find(query)
            .populate('crop', 'name')
            .populate('field', 'name')
            .sort({ plannedDate: -1 });
        
        res.json({ tasks, count: tasks.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WAGES & PAYMENTS
// ============================================

// Calculate wages for period
router.get('/wages/calculate', auth, async (req, res) => {
    try {
        const { startDate, endDate, workerId } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        
        let attendanceQuery = {
            farmer: req.user.id,
            date: { $gte: start, $lte: end }
        };
        if (workerId) attendanceQuery.worker = workerId;
        
        const attendance = await Attendance.find(attendanceQuery)
            .populate('worker', 'name wageAmount wageType');
        
        // Calculate wages by worker
        const wageCalculations = {};
        attendance.forEach(a => {
            const workerId = a.worker._id.toString();
            if (!wageCalculations[workerId]) {
                wageCalculations[workerId] = {
                    worker: a.worker,
                    presentDays: 0,
                    halfDays: 0,
                    totalDays: 0,
                    totalWages: 0,
                    attendance: []
                };
            }
            
            wageCalculations[workerId].totalDays++;
            if (a.status === 'present') wageCalculations[workerId].presentDays++;
            else if (a.status === 'half_day') wageCalculations[workerId].halfDays++;
            
            wageCalculations[workerId].totalWages += a.wageAmount || 0;
            wageCalculations[workerId].attendance.push({
                date: a.date,
                status: a.status,
                amount: a.wageAmount
            });
        });
        
        res.json({
            period: { start, end },
            calculations: Object.values(wageCalculations),
            summary: {
                totalWorkers: Object.keys(wageCalculations).length,
                totalWages: Object.values(wageCalculations).reduce((sum, w) => sum + w.totalWages, 0),
                totalDays: Object.values(wageCalculations).reduce((sum, w) => sum + w.totalDays, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record payment
router.post('/wages/pay', auth, async (req, res) => {
    try {
        const { workerId, amount, paymentDate, paymentMode, period, notes } = req.body;
        
        const worker = await Worker.findOne({
            _id: workerId,
            farmer: req.user.id
        });
        
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        const wageRecord = new WageRecord({
            farmer: req.user.id,
            worker: workerId,
            amount,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            paymentMode,
            period,
            notes,
            paymentStatus: 'paid',
            paidBy: req.user.id
        });
        
        await wageRecord.save();
        
        // Update worker wage summary
        worker.wageSummary.totalPaid += amount;
        worker.wageSummary.pendingAmount -= amount;
        if (worker.wageSummary.pendingAmount < 0) worker.wageSummary.pendingAmount = 0;
        worker.wageSummary.lastPaymentDate = new Date();
        await worker.save();
        
        res.json({ 
            message: 'Payment recorded successfully', 
            payment: wageRecord,
            worker: {
                name: worker.name,
                totalEarned: worker.wageSummary.totalEarned,
                totalPaid: worker.wageSummary.totalPaid,
                pendingAmount: worker.wageSummary.pendingAmount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get wage history
router.get('/:id/wages', auth, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {
            worker: req.params.id,
            farmer: req.user.id
        };
        if (status) query.paymentStatus = status;
        
        const wages = await WageRecord.find(query)
            .sort({ paymentDate: -1 });
        
        const summary = {
            totalPaid: wages.filter(w => w.paymentStatus === 'paid').reduce((sum, w) => sum + w.amount, 0),
            totalPending: wages.filter(w => w.paymentStatus === 'pending').reduce((sum, w) => sum + w.amount, 0),
            totalRecords: wages.length
        };
        
        res.json({ wages, summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate wage slip
router.get('/:id/wage-slip/:wageId', auth, async (req, res) => {
    try {
        const worker = await Worker.findOne({
            _id: req.params.id,
            farmer: req.user.id
        });
        
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        const wageRecord = await WageRecord.findOne({
            _id: req.params.wageId,
            worker: req.params.id
        });
        
        if (!wageRecord) {
            return res.status(404).json({ error: 'Wage record not found' });
        }
        
        // Get attendance for the period
        const attendance = await Attendance.find({
            worker: req.params.id,
            date: { 
                $gte: new Date(wageRecord.period?.start || wageRecord.paymentDate), 
                $lte: new Date(wageRecord.period?.end || wageRecord.paymentDate) 
            }
        });
        
        const wageSlip = {
            slipNumber: `WS-${wageRecord._id.toString().slice(-6)}`,
            date: wageRecord.paymentDate,
            worker: {
                name: worker.name,
                phone: worker.phone,
                id: worker._id
            },
            period: wageRecord.period,
            attendance: {
                presentDays: attendance.filter(a => a.status === 'present').length,
                halfDays: attendance.filter(a => a.status === 'half_day').length,
                absentDays: attendance.filter(a => a.status === 'absent').length,
                totalDays: attendance.length
            },
            earnings: {
                basicWage: wageRecord.amount,
                bonus: wageRecord.bonus || 0,
                deductions: wageRecord.deductions || 0,
                netPayable: wageRecord.amount + (wageRecord.bonus || 0) - (wageRecord.deductions || 0)
            },
            payment: {
                mode: wageRecord.paymentMode,
                date: wageRecord.paymentDate,
                status: wageRecord.paymentStatus
            }
        };
        
        res.json(wageSlip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ISSUE REPORTING
// ============================================

// Report issue
router.post('/issues', auth, async (req, res) => {
    try {
        const { workerId, type, title, description, activityId, fieldId, photos } = req.body;
        
        const issue = new WorkerIssue({
            farmer: req.user.id,
            worker: workerId,
            reportedBy: req.user.id,
            type,
            title,
            description,
            activity: activityId,
            field: fieldId,
            photos: photos || [],
            status: 'open',
            priority: 'medium'
        });
        
        await issue.save();
        
        // Update worker issues count
        await Worker.findByIdAndUpdate(workerId, {
            $inc: { 'performance.issuesReported': 1 }
        });
        
        res.status(201).json({ 
            message: 'Issue reported successfully', 
            issue 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get issues
router.get('/issues', auth, async (req, res) => {
    try {
        const { status, priority, workerId } = req.query;
        
        let query = { farmer: req.user.id };
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (workerId) query.worker = workerId;
        
        const issues = await WorkerIssue.find(query)
            .populate('worker', 'name phone')
            .populate('activity', 'title')
            .populate('field', 'name')
            .sort({ createdAt: -1 });
        
        res.json({ issues, count: issues.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update issue status
router.put('/issues/:id', auth, async (req, res) => {
    try {
        const { status, resolution, priority } = req.body;
        
        const issue = await WorkerIssue.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            {
                status,
                resolution,
                priority,
                resolvedBy: req.user.id,
                resolvedAt: status === 'resolved' ? new Date() : null
            },
            { new: true }
        );
        
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        
        res.json({ message: 'Issue updated', issue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// LEAVE MANAGEMENT
// ============================================

// Request leave
router.post('/leave', auth, async (req, res) => {
    try {
        const { workerId, startDate, endDate, type, reason } = req.body;
        
        const leaveRequest = new LeaveRequest({
            farmer: req.user.id,
            worker: workerId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            reason,
            status: 'pending'
        });
        
        await leaveRequest.save();
        
        res.status(201).json({ 
            message: 'Leave request submitted', 
            leaveRequest 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get leave requests
router.get('/leave', auth, async (req, res) => {
    try {
        const { status, workerId } = req.query;
        
        let query = { farmer: req.user.id };
        if (status) query.status = status;
        if (workerId) query.worker = workerId;
        
        const leaves = await LeaveRequest.find(query)
            .populate('worker', 'name phone')
            .sort({ createdAt: -1 });
        
        res.json({ leaves, count: leaves.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve/Reject leave
router.put('/leave/:id', auth, async (req, res) => {
    try {
        const { status, approvedBy, notes } = req.body;
        
        const leave = await LeaveRequest.findOneAndUpdate(
            { _id: req.params.id, farmer: req.user.id },
            {
                status,
                approvedBy,
                approvedAt: new Date(),
                notes
            },
            { new: true }
        );
        
        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        // Update worker status if approved
        if (status === 'approved') {
            await Worker.findByIdAndUpdate(leave.worker, {
                status: 'on_leave'
            });
        }
        
        res.json({ message: `Leave ${status}`, leave });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PERFORMANCE & ANALYTICS
// ============================================

// Get worker performance report
router.get('/performance/report', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        
        const workers = await Worker.find({ farmer: req.user.id, status: 'active' });
        
        const performanceData = await Promise.all(workers.map(async (worker) => {
            // Attendance stats
            const attendance = await Attendance.find({
                worker: worker._id,
                date: { $gte: start, $lte: end }
            });
            
            const totalDays = attendance.length;
            const presentDays = attendance.filter(a => a.status === 'present').length;
            const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
            
            // Tasks stats
            const tasks = await TimelineActivity.find({
                'assignedTo.worker': worker._id,
                plannedDate: { $gte: start, $lte: end }
            });
            
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const taskCompletionRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(2) : 0;
            
            // Wages earned
            const wages = await WageRecord.find({
                worker: worker._id,
                paymentDate: { $gte: start, $lte: end },
                paymentStatus: 'paid'
            });
            
            const totalEarned = wages.reduce((sum, w) => sum + w.amount, 0);
            
            // Issues reported
            const issues = await WorkerIssue.countDocuments({
                worker: worker._id,
                createdAt: { $gte: start, $lte: end }
            });
            
            // Calculate productivity score (0-100)
            const attendanceScore = Math.min(parseFloat(attendanceRate), 100);
            const taskScore = Math.min(parseFloat(taskCompletionRate), 100);
            const productivityScore = Math.round((attendanceScore * 0.4) + (taskScore * 0.6));
            
            return {
                worker: {
                    id: worker._id,
                    name: worker.name,
                    phone: worker.phone,
                    role: worker.role,
                    skills: worker.skills
                },
                attendance: {
                    totalDays,
                    presentDays,
                    rate: attendanceRate
                },
                tasks: {
                    assigned: tasks.length,
                    completed: completedTasks,
                    completionRate: taskCompletionRate
                },
                earnings: totalEarned,
                issuesReported: issues,
                productivityScore,
                rating: worker.performance.averageRating
            };
        }));
        
        // Sort by productivity score
        performanceData.sort((a, b) => b.productivityScore - a.productivityScore);
        
        res.json({
            performance: performanceData,
            summary: {
                totalWorkers: performanceData.length,
                averageAttendance: (performanceData.reduce((sum, p) => sum + parseFloat(p.attendance.rate), 0) / performanceData.length).toFixed(2),
                averageTaskCompletion: (performanceData.reduce((sum, p) => sum + parseFloat(p.tasks.completionRate), 0) / performanceData.length).toFixed(2),
                totalEarnings: performanceData.reduce((sum, p) => sum + p.earnings, 0),
                topPerformer: performanceData[0],
                needsImprovement: performanceData.filter(p => p.productivityScore < 60)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get today's attendance summary
router.get('/attendance/today', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const workers = await Worker.find({ farmer: req.user.id, status: 'active' });
        
        const attendance = await Attendance.find({
            farmer: req.user.id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('worker', 'name phone');
        
        const present = attendance.filter(a => a.status === 'present');
        const absent = attendance.filter(a => a.status === 'absent');
        const halfDay = attendance.filter(a => a.status === 'half_day');
        const notMarked = workers.filter(w => 
            !attendance.some(a => a.worker._id.toString() === w._id.toString())
        );
        
        res.json({
            date: today,
            summary: {
                totalWorkers: workers.length,
                present: present.length,
                absent: absent.length,
                halfDay: halfDay.length,
                notMarked: notMarked.length
            },
            details: {
                present,
                absent,
                halfDay,
                notMarked: notMarked.map(w => ({ _id: w._id, name: w.name, phone: w.phone }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updateWorkerAttendanceSummary(workerId) {
    try {
        const attendance = await Attendance.find({ worker: workerId });
        
        const summary = {
            totalDays: attendance.length,
            presentDays: attendance.filter(a => a.status === 'present').length,
            absentDays: attendance.filter(a => a.status === 'absent').length,
            halfDays: attendance.filter(a => a.status === 'half_day').length,
            lastUpdated: new Date()
        };
        
        await Worker.findByIdAndUpdate(workerId, {
            attendanceSummary: summary
        });
    } catch (error) {
        console.error('Error updating attendance summary:', error);
    }
}

module.exports = router;