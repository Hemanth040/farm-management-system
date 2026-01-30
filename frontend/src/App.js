import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CropPlanner from './components/CropPlanner';
import FarmerDashboard from './components/FarmerDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import WorkerDashboard from './components/WorkerDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FF9800',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/crop-planner" element={<CropPlanner />} />
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/worker" element={<WorkerDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
