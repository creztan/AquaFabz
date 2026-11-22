import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';
import { DriverDashboard } from './DriverDashboard';
import { CustomerPortalView } from '../CustomerPortal/CustomerPortalView';

export interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenPOS: () => void;
  onOpenNewOrder: () => void;
  onOpenVendingRecord: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenPOS,
  onOpenNewOrder,
  onOpenVendingRecord,
}) => {
  const { currentUser } = useApp();

  if (currentUser.role === 'customer') {
    return <CustomerPortalView />;
  }

  if (currentUser.role === 'delivery') {
    return <DriverDashboard onNavigate={onNavigate} />;
  }

  if (currentUser.role === 'staff') {
    return (
      <StaffDashboard
        onNavigate={onNavigate}
        onOpenPOS={onOpenPOS}
        onOpenNewOrder={onOpenNewOrder}
        onOpenVendingRecord={onOpenVendingRecord}
      />
    );
  }

  // Default to Owner / Admin Exclusive Dashboard Landing
  return (
    <AdminDashboard
      onNavigate={onNavigate}
      onOpenPOS={onOpenPOS}
      onOpenNewOrder={onOpenNewOrder}
      onOpenVendingRecord={onOpenVendingRecord}
    />
  );
};
