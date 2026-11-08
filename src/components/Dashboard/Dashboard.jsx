import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { AdminDashboard } from './AdminDashboard.jsx';
import { StaffDashboard } from './StaffDashboard.jsx';
import { DriverDashboard } from './DriverDashboard.jsx';
import { CustomerPortalView } from '../CustomerPortal/CustomerPortalView.jsx';

export const Dashboard = ({
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
