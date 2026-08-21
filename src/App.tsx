import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { VehicleIntakeModal } from './pages/backoffice/VehicleIntakeModal';

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { ExecutiveDashboard } from './pages/backoffice/ExecutiveDashboard';
import { AppointmentsPage } from './pages/backoffice/AppointmentsPage';
import { WorkOrdersListPage } from './pages/backoffice/WorkOrdersListPage';
import { WorkOrderDetailPage } from './pages/backoffice/WorkOrderDetailPage';
import { CustomersVehiclesPage } from './pages/backoffice/CustomersVehiclesPage';
import { InventoryPage } from './pages/backoffice/InventoryPage';
import { TireHotelPage } from './pages/backoffice/TireHotelPage';
import { WorkshopBaysPage } from './pages/backoffice/WorkshopBaysPage';
import { TechnicianCenterPage } from './pages/backoffice/TechnicianCenterPage';
import { FinanceLedgerPage } from './pages/backoffice/FinanceLedgerPage';
import { EInvoicePage } from './pages/backoffice/EInvoicePage';
import { MarketingCampaignsPage } from './pages/backoffice/MarketingCampaignsPage';
import { ReportsBIPage } from './pages/backoffice/ReportsBIPage';
import { DataMigrationPage } from './pages/backoffice/DataMigrationPage';
import { TenantSettingsPage } from './pages/backoffice/TenantSettingsPage';
import { SuperAdminDashboard } from './pages/superAdmin/SuperAdminDashboard';
import { PublicTenantLanding } from './pages/publicSite/PublicTenantLanding';

export const App: React.FC = () => {
  // Default entry view is the Tanıtım (Marketing Landing) site
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  const handleNavigate = (tab: string, itemData?: any) => {
    if (tab === 'work_order_detail' && itemData) {
      setSelectedWorkOrder(itemData);
      setActiveTab('work_order_detail');
    } else {
      setActiveTab(tab);
    }
  };

  // If landing page is active, show the marketing tanıtım site first
  if (activeTab === 'landing') {
    return <LandingPage onEnterPanel={() => setActiveTab('dashboard')} />;
  }

  // If public site is open, show customer-facing website directly
  if (activeTab === 'public_site') {
    return <PublicTenantLanding onBackToApp={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewIntake={() => setIsIntakeModalOpen(true)}
        onOpenNewAppointment={() => setActiveTab('appointments')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                onNavigate={handleNavigate}
                onOpenNewIntake={() => setIsIntakeModalOpen(true)}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsPage onOpenNewIntake={() => setIsIntakeModalOpen(true)} />
            )}

            {activeTab === 'work_orders' && (
              <WorkOrdersListPage
                onNavigate={handleNavigate}
                onOpenNewIntake={() => setIsIntakeModalOpen(true)}
              />
            )}

            {activeTab === 'work_order_detail' && selectedWorkOrder && (
              <WorkOrderDetailPage
                workOrder={selectedWorkOrder}
                onBack={() => setActiveTab('work_orders')}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersVehiclesPage initialType="CUSTOMERS" onNavigate={handleNavigate} />
            )}

            {activeTab === 'vehicles' && (
              <CustomersVehiclesPage initialType="VEHICLES" onNavigate={handleNavigate} />
            )}

            {activeTab === 'fleet' && (
              <CustomersVehiclesPage initialType="CUSTOMERS" onNavigate={handleNavigate} />
            )}

            {activeTab === 'inspection' && (
              <WorkOrdersListPage
                onNavigate={handleNavigate}
                onOpenNewIntake={() => setIsIntakeModalOpen(true)}
              />
            )}

            {activeTab === 'inventory' && <InventoryPage />}

            {activeTab === 'purchasing' && <InventoryPage />}

            {activeTab === 'tire_hotel' && <TireHotelPage />}

            {activeTab === 'workshop_bays' && (
              <WorkshopBaysPage onNavigate={handleNavigate} />
            )}

            {activeTab === 'technician_center' && (
              <TechnicianCenterPage onNavigate={handleNavigate} />
            )}

            {activeTab === 'finance' && <FinanceLedgerPage />}

            {activeTab === 'einvoice' && <EInvoicePage />}

            {activeTab === 'marketing' && <MarketingCampaignsPage />}

            {activeTab === 'reports' && <ReportsBIPage />}

            {activeTab === 'data_migration' && <DataMigrationPage />}

            {activeTab === 'automations' && <MarketingCampaignsPage />}

            {activeTab === 'settings' && <TenantSettingsPage />}

            {activeTab === 'super_admin' && <SuperAdminDashboard />}
          </div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Digital Vehicle Intake Modal */}
      <VehicleIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSuccess={(wo) => {
          setSelectedWorkOrder(wo);
          setActiveTab('work_order_detail');
        }}
      />
    </div>
  );
};
