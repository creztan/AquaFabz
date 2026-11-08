import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Users,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  History,
  Droplets,
  Edit2,
  Trash2,
  Clock,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Crosshair,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { DeliveryMap } from '../Map/DeliveryMap';

export const CustomerView = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    sales,
    orders,
    containers,
    settings,
    setPrintableItem,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0] || null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custType, setCustType] = useState('Residential');
  const [custAddress, setCustAddress] = useState('');
  const [custBarangay, setCustBarangay] = useState('Brgy. Poblacion');
  const [custLat, setCustLat] = useState(settings.coordinates.lat);
  const [custLng, setCustLng] = useState(settings.coordinates.lng);
  const [custNotes, setCustNotes] = useState('');

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactNumber.includes(searchTerm) ||
      c.primaryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.barangay.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || c.customerType === selectedType;
    return matchesSearch && matchesType;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setCustName('');
    setCustPhone('09');
    setCustEmail('');
    setCustType('Residential');
    setCustAddress('');
    setCustBarangay('Brgy. Poblacion');
    // slight offset from station HQ
    setCustLat(settings.coordinates.lat + (Math.random() - 0.5) * 0.01);
    setCustLng(settings.coordinates.lng + (Math.random() - 0.5) * 0.01);
    setCustNotes('');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (cust) => {
    setIsEditing(true);
    setCustName(cust.name);
    setCustPhone(cust.contactNumber);
    setCustEmail(cust.email || '');
    setCustType(cust.customerType);
    setCustAddress(cust.primaryAddress);
    setCustBarangay(cust.barangay);
    setCustLat(cust.coordinates.lat);
    setCustLng(cust.coordinates.lng);
    setCustNotes(cust.deliveryNotes || '');
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!custName || !custAddress) return;

    if (isEditing && selectedCustomer) {
      updateCustomer(selectedCustomer.id, {
        name: custName,
        contactNumber: custPhone,
        email: custEmail,
        customerType: custType,
        primaryAddress: custAddress,
        barangay: custBarangay,
        coordinates: {
          lat: custLat,
          lng: custLng,
        },
        deliveryNotes: custNotes,
      });
      setSelectedCustomer((prev) =>
        prev
          ? {
              ...prev,
              name: custName,
              contactNumber: custPhone,
              email: custEmail,
              customerType: custType,
              primaryAddress: custAddress,
              barangay: custBarangay,
              coordinates: { lat: custLat, lng: custLng },
              deliveryNotes: custNotes,
            }
          : null
      );
    } else {
      const created = addCustomer({
        name: custName,
        contactNumber: custPhone,
        email: custEmail,
        customerType: custType,
        primaryAddress: custAddress,
        barangay: custBarangay,
        coordinates: {
          lat: custLat,
          lng: custLng,
        },
        deliveryNotes: custNotes,
        status: 'active',
      });
      setSelectedCustomer(created);
    }

    setIsAddEditModalOpen(false);
  };

  // Find customer-specific histories
  const customerOrders = orders.filter((o) => o.customerId === selectedCustomer?.id);
  const customerSales = sales.filter((s) => s.customerId === selectedCustomer?.id);
  const customerContainers = containers.filter((c) => c.customerId === selectedCustomer?.id);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Customer CRM & Geolocation Profiles</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Customer Directory & Delivery Destination Mapping
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain customer records, pinned digital map delivery spots, borrowed container balances, and past transaction histories.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* Main Grid Customer Directory & Right Full Profile View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols */}
        <div className="lg:col-span-5 space-y-3 flex flex-col">
          {/* Search & Type filter */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers, phones, addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'Residential', label: 'Residential' },
                { id: 'Commercial', label: 'Commercial' },
                { id: 'Eatery', label: 'Eatery' },
                { id: 'School/Institution', label: 'School' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium text-[11px] shrink-0 transition-colors ${
                    selectedType === t.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Cards List */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-y-auto max-h-[600px] shadow-sm">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching customers found.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-50/70 border-l-4 border-cyan-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {cust.customerType}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{cust.name}</h4>
                      </div>
                      {cust.containersHeld > 0 && (
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">
                          {cust.containersHeld} jugs
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      📍 {cust.primaryAddress}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>📞 {cust.contactNumber}</span>
                      <span>Total Spent: ₱{cust.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols Customer Profile Detail */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedCustomer.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                      {selectedCustomer.customerType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registered on {selectedCustomer.registeredDate} • ID: {selectedCustomer.id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedCustomer)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove customer record for ${selectedCustomer.name}?`)) {
                        deleteCustomer(selectedCustomer.id);
                        setSelectedCustomer(customers[0] || null);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats & Overview */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Jugs Currently Borrowed:</span>
                  <span className="text-base font-black text-cyan-700 mt-0.5 block">
                    {selectedCustomer.containersHeld} containers
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Deposit: ₱{(selectedCustomer.containersHeld * 200).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Total Lifetime Orders:</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {selectedCustomer.totalOrders} orders
                  </span>
                  <span className="text-[10px] text-slate-400">Station & deliveries</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Total Amount Spent:</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block">
                    ₱{selectedCustomer.totalSpent.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Valued Account</span>
                </div>
              </div>

              {/* Geolocation & Interactive Map Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span>Delivery Location & Map Coordinates</span>
                  </h4>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    GPS: {selectedCustomer.coordinates.lat.toFixed(4)}, {selectedCustomer.coordinates.lng.toFixed(4)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700">Primary Delivery Address: </span>
                    <span className="text-slate-900">{selectedCustomer.primaryAddress} ({selectedCustomer.barangay})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Contact Number: </span>
                    <span className="text-slate-900">{selectedCustomer.contactNumber}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <span className="font-semibold text-slate-700">Email: </span>
                      <span className="text-slate-900">{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.deliveryNotes && (
                    <div className="text-amber-800 text-[11px] font-medium pt-1">
                      ⚠️ Delivery Instructions: {selectedCustomer.deliveryNotes}
                    </div>
                  )}
                </div>

                {/* Additional Delivery Locations if present */}
                {selectedCustomer.additionalLocations && selectedCustomer.additionalLocations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      Additional Delivery Branches / Rooms:
                    </span>
                    {selectedCustomer.additionalLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-indigo-950">{loc.label}:</strong> {loc.address}
                          {loc.deliveryNotes && (
                            <span className="block text-indigo-700 text-[10px]">
                              Note: {loc.deliveryNotes}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-indigo-600">
                          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Transaction History Feed */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <h4 className="font-bold text-xs text-slate-900">
                    Customer Transaction & Delivery History
                  </h4>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerSales.length === 0 && customerOrders.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No past transactions recorded for this customer yet.
                    </div>
                  ) : (
                    <>
                      {customerOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{ord.orderNumber}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                                {ord.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {ord.date} • {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">₱{ord.totalAmount}</span>
                            <button
                              type="button"
                              onClick={() => setPrintableItem({ type: 'order', data: ord })}
                              className="text-[10px] text-cyan-600 hover:underline font-semibold"
                            >
                              Slip
                            </button>
                          </div>
                        </div>
                      ))}

                      {customerSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{sale.transactionNumber}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800">
                                POS Sale
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {sale.date} • {sale.items.length} item(s) • {sale.paymentMethod.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">₱{sale.totalAmount}</span>
                            <button
                              type="button"
                              onClick={() => setPrintableItem({ type: 'receipt', data: sale })}
                              className="text-[10px] text-cyan-600 hover:underline font-semibold"
                            >
                              Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Users className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">Select a Customer</p>
              <p className="text-slate-400 mt-1">
                Choose a customer from the directory to inspect geolocation profile, past orders, and container balances.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal with Map Pin Picker */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-cyan-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {isEditing ? 'Edit Customer Geolocation Profile' : 'Register New Customer Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-cyan-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer / Organization Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Mama Chit's Grill or Juan Dela Cruz"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Classification:</label>
                  <select
                    value={custType}
                    onChange={(e) => setCustType(e.target.value )}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Residential">Residential Household</option>
                    <option value="Commercial">Commercial / Office</option>
                    <option value="Eatery">Eatery / Restaurant</option>
                    <option value="School/Institution">School / Institution</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Phone:</label>
                  <input
                    type="text"
                    placeholder="e.g. 0917-123-4567"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address (Optional):</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Street Address & Landmark:</label>
                  <input
                    type="text"
                    placeholder="e.g. Door 2 Medico Building, Gen. Luna St."
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barangay:</label>
                  <select
                    value={custBarangay}
                    onChange={(e) => setCustBarangay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Brgy. Poblacion">Brgy. Poblacion</option>
                    <option value="Brgy. San Teodoro">Brgy. San Teodoro</option>
                    <option value="Brgy. San Pedro">Brgy. San Pedro</option>
                    <option value="Brgy. Enclaro">Brgy. Enclaro</option>
                    <option value="Brgy. Sto. Rosario">Brgy. Sto. Rosario</option>
                    <option value="Brgy. Paglaum">Brgy. Paglaum</option>
                    <option value="Brgy. Progreso">Brgy. Progreso</option>
                  </select>
                </div>
              </div>

              {/* Geolocation Map Picker */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Interactive Digital Map Delivery Pin Drop:</span>
                  </label>
                  <span className="text-[11px] text-cyan-700 font-mono">
                    Lat: {custLat.toFixed(4)}, Lng: {custLng.toFixed(4)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Click on the map below to pinpoint the delivery destination accurately for riders.
                </div>

                <DeliveryMap
                  settings={settings}
                  isPickingLocation={true}
                  onLocationPicked={(coords) => {
                    setCustLat(coords.lat);
                    setCustLng(coords.lng);
                  }}
                  initialCenter={{ lat: custLat, lng: custLng }}
                  heightClass="h-[220px]"
                  showVendingMachines={false}
                  showAllCustomers={false}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delivery Directions / Gate Notes:</label>
                <textarea
                  rows={2}
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="e.g. Two-story yellow building behind bakery. Ring bell twice."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isEditing ? 'Save Profile' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
