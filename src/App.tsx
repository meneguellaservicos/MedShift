import React from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import { ShiftsView } from './components/shifts';
import HospitalsView from './components/HospitalsView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';

const AppContent: React.FC = () => {
  const {
    user,
    currentView,
    sortedShifts,
    hospitals,
    enabledHospitals,
    showEconomicValues,
    login,
    register,
    addShift,
    bulkAddShifts,
    editShift,
    deleteShift,
    togglePaid,
    addHospital,
    editHospital,
    deleteHospital,
    toggleHospitalStatus,
    setCurrentView,
  } = useAppContext();

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} />;
  }

  // Se o usuário for superusuário e estiver na view admin, mostrar o painel administrativo
  if (user.role === 'superuser' && currentView === 'admin') {
    return <AdminPanel currentUser={user} onBackToApp={() => setCurrentView('dashboard')} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            shifts={sortedShifts}
            hospitals={hospitals}
            showEconomicValues={showEconomicValues}
          />
        );
      case 'shifts':
        return (
          <ShiftsView
            shifts={sortedShifts}
            hospitals={hospitals}
            enabledHospitals={enabledHospitals}
            onAddShift={addShift}
            onBulkAddShifts={bulkAddShifts}
            onEditShift={editShift}
            onDeleteShift={deleteShift}
            onTogglePaid={togglePaid}
            showEconomicValues={showEconomicValues}
          />
        );
      case 'hospitals':
        return (
          <HospitalsView
            hospitals={hospitals}
            onAddHospital={addHospital}
            onEditHospital={editHospital}
            onDeleteHospital={deleteHospital}
            onToggleHospitalStatus={toggleHospitalStatus}
            showEconomicValues={showEconomicValues}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            shifts={sortedShifts} 
            hospitals={hospitals} 
            showEconomicValues={showEconomicValues} 
          />
        );
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
};

function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}

export default App;