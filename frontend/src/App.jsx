// Location: /frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/common/MainLayout';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';

// Dashboards
import AdminDashboard from './components/dashboard/AdminDashboard';
import InvestigatorDashboard from './components/dashboard/InvestigatorDashboard';
import CustodianDashboard from './components/dashboard/CustodianDashboard';
import AnalyzerDashboard from './components/dashboard/AnalyzerDashboard';
import ViewerDashboard from './components/dashboard/ViewerDashboard';

// Admin Components
import UserManagement from './components/admin/UserManagement';
import AuditLogs from './components/admin/AuditLogs';
import SystemSettings from './components/admin/SystemSettings';
import BackupRestore from './components/admin/BackupRestore';

// Evidence Components
import EvidenceList from './components/evidence/EvidenceList';
import EvidenceUpload from './components/evidence/EvidenceUpload';
import EvidenceDetails from './components/evidence/EvidenceDetails';
import EvidenceSearch from './components/evidence/EvidenceSearch';
import BulkUpload from './components/evidence/BulkUpload';

// Custody Components
import CustodyTimeline from './components/custody/CustodyTimeline';
import TransferCustody from './components/custody/TransferCustody';
import VerifyIntegrity from './components/custody/VerifyIntegrity';
import CustodyReport from './components/custody/CustodyReport';

// Report Components
import ForensicReport from './components/reports/ForensicReport';
import InvestigationReport from './components/reports/InvestigationReport';
import DashboardAnalytics from './components/reports/DashboardAnalytics';

function App() {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/audit-logs" element={<AuditLogs />} />
                        <Route path="/admin/settings" element={<SystemSettings />} />
                        <Route path="/admin/backup" element={<BackupRestore />} />

                        {/* Investigator Routes */}
                        <Route path="/investigator/dashboard" element={<InvestigatorDashboard />} />
                        <Route path="/evidence" element={<EvidenceList />} />
                        <Route path="/evidence/upload" element={<EvidenceUpload />} />
                        <Route path="/evidence/bulk-upload" element={<BulkUpload />} />
                        <Route path="/evidence/:id" element={<EvidenceDetails />} />
                        <Route path="/evidence/search" element={<EvidenceSearch />} />

                        {/* Custodian Routes */}
                        <Route path="/custodian/dashboard" element={<CustodianDashboard />} />
                        <Route path="/custody/transfer" element={<TransferCustody />} />
                        <Route path="/custody/timeline/:evidenceId" element={<CustodyTimeline />} />
                        <Route path="/custody/verify/:evidenceId" element={<VerifyIntegrity />} />
                        <Route path="/custody/report/:evidenceId" element={<CustodyReport />} />

                        {/* Analyzer Routes */}
                        <Route path="/analyzer/dashboard" element={<AnalyzerDashboard />} />
                        <Route path="/analyzer/forensic/:evidenceId" element={<ForensicReport />} />
                        <Route path="/analyzer/analytics" element={<DashboardAnalytics />} />

                        {/* Viewer Routes */}
                        <Route path="/viewer/dashboard" element={<ViewerDashboard />} />
                        <Route path="/viewer/evidence/:id" element={<EvidenceDetails />} />

                        {/* Common Routes */}
                        <Route path="/reports/investigation/:caseId" element={<InvestigationReport />} />
                    </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </>
    );
}

export default App;