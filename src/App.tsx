import { useEffect, useState, useCallback } from 'react';
import { supabase, type Alert } from '@/lib/supabase';
import { Layout, type PageKey } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Mines } from '@/pages/Mines';
import { Sensors } from '@/pages/Sensors';
import { Compliance } from '@/pages/Compliance';
import { Alerts } from '@/pages/Alerts';
import { Inspections } from '@/pages/Inspections';
import { Incidents } from '@/pages/Incidents';
import { AIInsights } from '@/pages/AIInsights';

function App() {
  const [page, setPage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  const loadAlertCount = useCallback(async () => {
    const { count } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    setActiveAlertCount(count ?? 0);
  }, []);

  useEffect(() => {
    loadAlertCount();
    const interval = setInterval(loadAlertCount, 30000);
    return () => clearInterval(interval);
  }, [loadAlertCount]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'mines': return <Mines />;
      case 'sensors': return <Sensors />;
      case 'compliance': return <Compliance />;
      case 'alerts': return <Alerts />;
      case 'inspections': return <Inspections />;
      case 'incidents': return <Incidents />;
      case 'ai-insights': return <AIInsights />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <Layout
      currentPage={page}
      onNavigate={setPage}
      alertCount={activeAlertCount}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
