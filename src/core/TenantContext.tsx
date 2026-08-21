import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { store } from '../services/store';

interface TenantContextType {
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  updateTenantBranding: (branding: Partial<Tenant['branding']>) => void;
  updateFeatureFlags: (flags: Record<string, boolean>) => void;
  refreshData: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(store.getTenants());
  const [activeTenantId, setActiveTenantId] = useState<string>(store.getActiveTenantId());
  const [ticker, setTicker] = useState(0);

  const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0] || {
    id: 'default',
    slug: 'default',
    name: 'AutoService',
    status: 'ACTIVE',
    planId: 'PROFESSIONAL',
    branding: {
      primaryColor: '#0284c7',
      secondaryColor: '#0f172a',
      accentColor: '#f59e0b',
      companyName: 'AutoService Ltd.',
      legalName: 'AutoService Ltd.',
      taxOffice: 'Merkez',
      taxNo: '1234567890',
      phone: '0850 000 00 00',
      email: 'info@autoservice.com',
      address: 'Oto Sanayi Sitesi',
      city: 'İstanbul',
      currency: '₺',
      vatRate: 20,
    },
    featureFlags: { inventory: true, fleet: true, tire_hotel: true, einvoice: true, whatsapp: true, advanced_reports: true, ai_copilot: true },
    createdAt: new Date().toISOString(),
  };

  const switchTenant = (tenantId: string) => {
    store.setActiveTenantId(tenantId);
    setActiveTenantId(tenantId);
    setTenants(store.getTenants());
  };

  const updateTenantBranding = (newBranding: Partial<Tenant['branding']>) => {
    const updated: Tenant = {
      ...currentTenant,
      branding: {
        ...currentTenant.branding,
        ...newBranding,
      },
    };
    store.saveTenant(updated);
    setTenants(store.getTenants());
  };

  const updateFeatureFlags = (flags: Record<string, boolean>) => {
    const updated: Tenant = {
      ...currentTenant,
      featureFlags: {
        ...currentTenant.featureFlags,
        ...flags,
      },
    };
    store.saveTenant(updated);
    setTenants(store.getTenants());
  };

  const refreshData = () => {
    setTicker(prev => prev + 1);
    setTenants(store.getTenants());
  };

  useEffect(() => {
    // Dynamic CSS variable injection for tenant brand colors
    if (currentTenant.branding.primaryColor) {
      document.documentElement.style.setProperty('--primary', currentTenant.branding.primaryColor);
    }
  }, [currentTenant]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenants,
        switchTenant,
        updateTenantBranding,
        updateFeatureFlags,
        refreshData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
