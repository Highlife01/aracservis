import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../services/mockSeedData';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  isSuperAdmin: boolean;
  canAccessModule: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  const switchRole = (role: UserRole) => {
    setCurrentUser(prev => ({
      ...prev,
      role,
      name: role === 'SUPER_ADMIN' ? 'SaaS Super Admin' : 
            role === 'TENANT_OWNER' ? 'Ahmet Yılmaz (İşletme Sahibi)' :
            role === 'SERVICE_ADVISOR' ? 'Murat Danışman (Servis Danışmanı)' :
            role === 'TECHNICIAN' ? 'Kemal Teknisyen (Usta)' :
            role === 'ACCOUNTANT' ? 'Selin Muhasebe (Finans)' :
            role === 'FLEET_MANAGER' ? 'Mehmet Demir (Filo Müdürü)' :
            role === 'END_CUSTOMER' ? 'Can Kaya (Araç Sahibi)' : 'Kullanıcı'
    }));
  };

  const switchUser = (userId: string) => {
    const found = INITIAL_USERS.find(u => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const canAccessModule = (moduleName: string): boolean => {
    const role = currentUser.role;
    if (role === 'SUPER_ADMIN' || role === 'TENANT_OWNER' || role === 'TENANT_MANAGER') return true;
    
    switch (moduleName) {
      case 'WORK_ORDERS':
      case 'APPOINTMENTS':
      case 'INTAKE':
        return ['SERVICE_ADVISOR', 'BRANCH_MANAGER', 'TECHNICIAN'].includes(role);
      case 'INSPECTION':
      case 'TECHNICIAN_CENTER':
        return ['TECHNICIAN', 'SERVICE_ADVISOR', 'BRANCH_MANAGER'].includes(role);
      case 'INVENTORY':
      case 'PURCHASING':
        return ['INVENTORY_MANAGER', 'SERVICE_ADVISOR', 'BRANCH_MANAGER'].includes(role);
      case 'TIRE_HOTEL':
        return ['TIRE_SPECIALIST', 'SERVICE_ADVISOR', 'BRANCH_MANAGER'].includes(role);
      case 'FINANCE':
      case 'EINVOICE':
        return ['ACCOUNTANT', 'BRANCH_MANAGER'].includes(role);
      case 'CRM':
      case 'VEHICLES':
        return ['SERVICE_ADVISOR', 'BRANCH_MANAGER'].includes(role);
      case 'FLEET_PORTAL':
        return ['FLEET_MANAGER'].includes(role);
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        switchUser,
        availableUsers: INITIAL_USERS,
        isSuperAdmin,
        canAccessModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
