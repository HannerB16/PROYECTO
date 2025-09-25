import { Route, Routes } from 'react-router-dom';

import { MainLayout } from './layouts/MainLayout';
import AnalyticsPage from './pages/AnalyticsPage';
import HomePage from './pages/HomePage';
import WorkspacesPage from './pages/WorkspacesPage';

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
