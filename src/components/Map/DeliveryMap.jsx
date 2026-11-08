import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Droplet,
  Store,
  Crosshair,
  Maximize2,
} from 'lucide-react';



export const DeliveryMap = ({
  settings,
  orders = [],
  customers = [],
  vendingMachines = [],
  selectedOrderId,
  onSelectOrder,
  onSelectCustomer,
  isPickingLocation = false,
  onLocationPicked,
  initialCenter,
  initialZoom = 14,
  heightClass = 'h-[500px]',
  showVendingMachines = true,
  showAllCustomers = true,
  filterStatus = 'all',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef([]);
  const tempMarkerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('all');
  const [pickedCoords, setPickedCoords] = useState(null);
  const [mapMode, setMapMode] = useState('streets');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = initialCenter?.lat ?? settings.coordinates.lat;
      const centerLng = initialCenter?.lng ?? settings.coordinates.lng;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: initialZoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Default OpenStreetMap layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | AquaFabz System',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Invalidate size to ensure full tile rendering after container mount
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      // Don't fully destroy to avoid re-rendering issues unless unmounted
    };
  }, []);

  // Handle location picking click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isPickingLocation && onLocationPicked) {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPickedCoords(coords);
        onLocationPicked(coords);

        if (tempMarkerRef.current) {
          tempMarkerRef.current.setLatLng(e.latlng);
        } else {
          const pinIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: `
              <div class="flex items-center justify-center w-9 h-9 bg-rose-600 text-white rounded-full shadow-lg border-2 border-white animate-bounce">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });
          tempMarkerRef.current = L.marker(e.latlng, { icon: pinIcon }).addTo(map);
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, onLocationPicked]);

  // Render markers and delivery route polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Clear old polylines
    routesLayerRef.current.forEach((line) => line.remove());
    routesLayerRef.current = [];

    const stationLat = settings.coordinates.lat;
    const stationLng = settings.coordinates.lng;

    // 1. Water Station HQ Marker
    const hqIcon = L.divIcon({
      className: 'custom-hq-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-cyan-400 rounded-full opacity-40 pulsing-marker"></div>
          <div class="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl shadow-xl border-2 border-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const hqMarker = L.marker([stationLat, stationLng], { icon: hqIcon }).addTo(markersGroup);
    hqMarker.bindPopup(`
      <div class="p-2 min-w-[200px]">
        <div class="flex items-center gap-1.5 text-cyan-600 font-bold text-xs uppercase tracking-wider mb-1">
          <span>Main Water Station HQ</span>
        </div>
        <div class="font-bold text-slate-800 text-sm mb-1">${settings.stationName}</div>
        <div class="text-xs text-slate-600 mb-2">${settings.address}, ${settings.barangay}</div>
        <div class="bg-cyan-50 border border-cyan-100 rounded p-1.5 text-[11px] text-cyan-800">
          📍 Base Coordinates: ${stationLat.toFixed(4)}, ${stationLng.toFixed(4)}
        </div>
      </div>
    `);

    // 2. Vending Machines Markers
    if (showVendingMachines && (activeTab === 'all' || activeTab === 'vending')) {
      vendingMachines.forEach((vm) => {
        const isLow = vm.status === 'low_water';
        const vmColor = isLow ? 'bg-amber-500' : 'bg-indigo-600';

        const vmIcon = L.divIcon({
          className: 'custom-vm-marker',
          html: `
            <div class="group relative flex items-center justify-center">
              <div class="flex items-center justify-center w-9 h-9 ${vmColor} text-white rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M15 6H9"/><path d="M9 10h6"/><path d="M9 14h6"/><circle cx="9" cy="18" r="1"/></svg>
              </div>
              <span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${isLow ? 'bg-amber-400' : 'bg-emerald-400'} border border-white"></span>
              </span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([vm.coordinates.lat, vm.coordinates.lng], { icon: vmIcon }).addTo(markersGroup);
        marker.bindPopup(`
          <div class="p-2 min-w-[210px]">
            <div class="flex items-center justify-between text-xs font-semibold mb-1">
              <span class="text-indigo-600 font-bold">${vm.code}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }">${isLow ? 'Low Water Alert' : 'Operational'}</span>
            </div>
            <div class="font-bold text-slate-800 text-sm">${vm.name}</div>
            <div class="text-xs text-slate-600 mb-2">${vm.locationName}</div>
            <div class="space-y-1 text-xs border-t border-slate-100 pt-2">
              <div class="flex justify-between text-slate-600">
                <span>Water Level:</span>
                <span class="font-bold text-slate-800">${vm.currentWaterLevelLiters}L / ${vm.waterCapacityLiters}L</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Coins in Box:</span>
                <span class="font-bold text-emerald-600">₱${vm.currentCoinTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        `);
      });
    }

    // 3. Customer Delivery Orders Markers & Routes
    const displayedOrders = orders.filter((o) => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (activeTab === 'active_deliveries') {
        return o.status === 'Out for Delivery' || o.status === 'Preparing';
      }
      return true;
    });

    displayedOrders.forEach((order) => {
      const isSelected = selectedOrderId === order.id;

      // Color coding per delivery status
      let pinBg = 'bg-blue-600';
      let statusIcon = '🚚';
      if (order.status === 'Pending') {
        pinBg = 'bg-amber-500';
        statusIcon = '⏳';
      } else if (order.status === 'Preparing') {
        pinBg = 'bg-sky-500';
        statusIcon = '📦';
      } else if (order.status === 'Out for Delivery') {
        pinBg = 'bg-indigo-600';
        statusIcon = '🛵';
      } else if (order.status === 'Delivered') {
        pinBg = 'bg-emerald-600';
        statusIcon = '✓';
      }

      const orderIcon = L.divIcon({
        className: 'custom-order-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${
              order.status === 'Out for Delivery' || isSelected
                ? '<div class="absolute -inset-2 bg-indigo-500 rounded-full opacity-40 pulsing-marker"></div>'
                : ''
            }
            <div class="flex items-center justify-center w-8 h-8 ${pinBg} text-white font-bold text-xs rounded-full shadow-lg border-2 ${
          isSelected ? 'border-amber-300 ring-4 ring-amber-400/50 scale-125' : 'border-white'
        } transition-transform">
              ${statusIcon}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([order.coordinates.lat, order.coordinates.lng], { icon: orderIcon }).addTo(markersGroup);

      marker.on('click', () => {
        if (onSelectOrder) onSelectOrder(order);
      });

      marker.bindPopup(`
        <div class="p-2 min-w-[220px]">
          <div class="flex items-center justify-between text-xs font-semibold mb-1">
            <span class="text-slate-500">${order.orderNumber}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
              order.status === 'Out for Delivery'
                ? 'bg-indigo-100 text-indigo-700'
                : order.status === 'Preparing'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'Delivered'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }">${order.status}</span>
          </div>
          <div class="font-bold text-slate-800 text-sm">${order.customerName}</div>
          <div class="text-xs text-slate-600 mb-1.5">📍 ${order.deliveryAddress}</div>
          <div class="text-xs text-slate-500 mb-2">📞 ${order.customerPhone}</div>
          <div class="bg-slate-50 p-1.5 rounded text-xs space-y-1 mb-2">
            <div class="flex justify-between">
              <span class="text-slate-500">Items:</span>
              <span class="font-medium text-slate-800">${order.items.reduce((sum, i) => sum + i.quantity, 0)} units</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Total:</span>
              <span class="font-bold text-cyan-700">₱${order.totalAmount}</span>
            </div>
            ${order.assignedPersonnel ? `<div class="text-[11px] text-indigo-600 font-medium">Rider: ${order.assignedPersonnel}</div>` : ''}
          </div>
          <div class="text-[11px] text-slate-400">Schedule: ${order.requestedSchedule}</div>
        </div>
      `);

      // Draw route connecting HQ to Out-For-Delivery / Selected order
      if (order.status === 'Out for Delivery' || isSelected) {
        const polyline = L.polyline(
          [
            [stationLat, stationLng],
            [order.coordinates.lat, order.coordinates.lng],
          ],
          {
            color: isSelected ? '#f59e0b' : '#6366f1',
            weight: isSelected ? 4 : 3,
            dashArray: '6, 8',
            opacity: 0.85,
          }
        ).addTo(map);

        routesLayerRef.current.push(polyline);
      }
    });

    // 4. All Registered Customers (When viewing coverage or no orders)
    if (showAllCustomers && (activeTab === 'all' || activeTab === 'coverage')) {
      customers.forEach((cust) => {
        // avoid duplicate markers if customer already in orders
        const alreadyHasOrder = displayedOrders.some((o) => o.customerId === cust.id);
        if (alreadyHasOrder) return;

        const custIcon = L.divIcon({
          className: 'custom-customer-marker',
          html: `
            <div class="flex items-center justify-center w-7 h-7 bg-slate-700 text-white rounded-full shadow border-2 border-white hover:scale-110 transition-transform">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([cust.coordinates.lat, cust.coordinates.lng], { icon: custIcon }).addTo(markersGroup);

        marker.on('click', () => {
          if (onSelectCustomer) onSelectCustomer(cust);
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <span>${cust.customerType}</span>
            </div>
            <div class="font-bold text-slate-800 text-sm">${cust.name}</div>
            <div class="text-xs text-slate-600 mb-1">📍 ${cust.primaryAddress}</div>
            <div class="text-xs text-slate-500 mb-2">📞 ${cust.contactNumber}</div>
            <div class="flex justify-between text-xs bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500">Borrowed Jugs:</span>
              <span class="font-bold text-cyan-700">${cust.containersHeld} containers</span>
            </div>
          </div>
        `);
      });
    }
  }, [
    orders,
    customers,
    vendingMachines,
    settings,
    selectedOrderId,
    filterStatus,
    activeTab,
    showVendingMachines,
    showAllCustomers,
  ]);

  // Center to selected order if changed
  useEffect(() => {
    if (selectedOrderId && mapInstanceRef.current) {
      const order = orders.find((o) => o.id === selectedOrderId);
      if (order) {
        mapInstanceRef.current.flyTo([order.coordinates.lat, order.coordinates.lng], 16, {
          duration: 1.2,
        });
      }
    }
  }, [selectedOrderId, orders]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([settings.coordinates.lat, settings.coordinates.lng], initialZoom, {
        duration: 1,
      });
    }
  };

  // Calculate solid pixel height to prevent zero-height collapse
  const resolvedHeight = (() => {
    if (typeof heightClass === 'string') {
      const match = heightClass.match(/h-\[(\d+)px\]/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    return 460;
  })();

  // Also invalidate size on tab switch
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
    }
  }, [activeTab]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-white flex flex-col">
      {/* Top Map Controls Toolbar (In normal flow above map, eliminating overlaps) */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Layer & Filter Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Points
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active_deliveries')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'active_deliveries'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Active Trips</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'vending'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Vending ({vendingMachines.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coverage')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'coverage'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Customer Base
          </button>
        </div>

        {/* Recenter & Status Indicator */}
        <div className="flex items-center gap-2">
          {isPickingLocation && (
            <div className="flex items-center gap-1.5 bg-rose-600 text-white text-xs px-3 py-1.5 rounded-xl shadow-2xs font-semibold">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Click Map to Pin Location</span>
            </div>
          )}

          <button
            type="button"
            onClick={resetView}
            title="Recenter Map to Station HQ"
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
            <span>Station Base</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Surface with Solid Inline Pixel Height */}
      <div
        ref={mapContainerRef}
        style={{ height: `${resolvedHeight}px`, minHeight: `${resolvedHeight}px` }}
        className="w-full relative z-10"
      />

      {/* Map Legend Footer (In normal flow below map) */}
      <div className="bg-slate-50/90 border-t border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 ring-2 ring-cyan-200"></span>
            <span className="font-semibold text-slate-700">Water Station HQ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>Out for Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Preparing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>Vending Machine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span>Customer Location</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          📍 Binalbagan, Negros Occidental · Active Geofencing
        </div>
      </div>
    </div>
  );
};
