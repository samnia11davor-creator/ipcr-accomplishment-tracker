import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { CommitmentsPage } from '@/pages/CommitmentsPage';
import { AccomplishmentPage } from '@/pages/AccomplishmentPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ImportPage } from '@/pages/ImportPage';
import { BackupAuditPage } from '@/pages/BackupAuditPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="commitments" element={<CommitmentsPage />} />
          <Route path="accomplishments" element={<AccomplishmentPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="backup" element={<BackupAuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

