import os

BASE_DIR = "frontend"

folders = [
    "public/assets",

    "src/assets/images",
    "src/assets/styles",

    "src/components/common",
    "src/components/auth",
    "src/components/dashboard",
    "src/components/evidence",
    "src/components/custody",
    "src/components/reports",
    "src/components/admin",
    "src/components/notifications",

    "src/contexts",
    "src/services",
    "src/hooks",
    "src/utils",
]

files = [
    "public/index.html",
    "public/assets/emblem.png",
    "public/assets/favicon.ico",

    "src/assets/images/emblem.png",
    "src/assets/images/logo.png",
    "src/assets/images/govt-bg.png",

    "src/assets/styles/theme.css",
    "src/assets/styles/components.css",

    "src/components/common/Header.jsx",
    "src/components/common/Footer.jsx",
    "src/components/common/Sidebar.jsx",
    "src/components/common/Breadcrumb.jsx",
    "src/components/common/NotificationBell.jsx",
    "src/components/common/ProfileDropdown.jsx",
    "src/components/common/SearchBar.jsx",

    "src/components/auth/Login.jsx",
    "src/components/auth/RobotVerification.jsx",
    "src/components/auth/ForgotPassword.jsx",

    "src/components/dashboard/AdminDashboard.jsx",
    "src/components/dashboard/InvestigatorDashboard.jsx",
    "src/components/dashboard/CustodianDashboard.jsx",
    "src/components/dashboard/AnalyzerDashboard.jsx",
    "src/components/dashboard/ViewerDashboard.jsx",

    "src/components/evidence/EvidenceList.jsx",
    "src/components/evidence/EvidenceUpload.jsx",
    "src/components/evidence/EvidenceDetails.jsx",
    "src/components/evidence/EvidenceSearch.jsx",
    "src/components/evidence/EvidenceQRCode.jsx",
    "src/components/evidence/BulkUpload.jsx",

    "src/components/custody/CustodyTimeline.jsx",
    "src/components/custody/TransferCustody.jsx",
    "src/components/custody/VerifyIntegrity.jsx",
    "src/components/custody/CustodyReport.jsx",

    "src/components/reports/ForensicReport.jsx",
    "src/components/reports/InvestigationReport.jsx",
    "src/components/reports/GeneratePDF.jsx",
    "src/components/reports/DashboardAnalytics.jsx",

    "src/components/admin/UserManagement.jsx",
    "src/components/admin/SystemSettings.jsx",
    "src/components/admin/AuditLogs.jsx",
    "src/components/admin/BackupRestore.jsx",

    "src/components/notifications/NotificationList.jsx",
    "src/components/notifications/NotificationPreferences.jsx",

    "src/contexts/AuthContext.jsx",
    "src/contexts/NotificationContext.jsx",
    "src/contexts/ThemeContext.jsx",

    "src/services/api.js",
    "src/services/auth.js",
    "src/services/socket.js",
    "src/services/storage.js",

    "src/hooks/useAuth.js",
    "src/hooks/useNotification.js",
    "src/hooks/useWebSocket.js",

    "src/utils/validators.js",
    "src/utils/helpers.js",
    "src/utils/constants.js",
    "src/utils/formatters.js",

    "src/App.jsx",
    "src/index.js",
    "src/index.css",

    "package.json",
    "Dockerfile",
    "nginx.conf",
]

for folder in folders:
    os.makedirs(os.path.join(BASE_DIR, folder), exist_ok=True)

for file in files:
    path = os.path.join(BASE_DIR, file)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        open(path, "w", encoding="utf-8").close()

print("✅ Frontend structure updated successfully!")