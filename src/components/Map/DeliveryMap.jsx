import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Droplets,
  Store,
  Crosshair,
  Maximize2,
  Route,
  LocateFixed,
  ChevronRight,
  Info,
} from 'lucide-react';

// Pure local Haversine distance calculation in kilometers (Zero APIs)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Local travel time estimation in minutes (Zero APIs)
export function estimateDriveMinutes(distanceKm) {
  if (!distanceKm || distanceKm <= 0) return 3;
  return Math.max(3, Math.round(distanceKm * 2.8 + 2));
}

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
  onUpdateStatus,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef([]);
  const tempMarkerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('all');
  const [driverLocation, setDriverLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const stationLat = settings?.coordinates?.lat ?? 10.1585;
  const stationLng = settings?.coordinates?.lng ?? 122.8688;

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Selected order metrics (Local math)
  const selectedMetrics = useMemo(() => {
    if (!selectedOrder) return null;
    const originLat = driverLocation?.lat ?? stationLat;
    const originLng = driverLocation?.lng ?? stationLng;
    const dist = calculateDistanceKm(
      originLat,
      originLng,
      selectedOrder.coordinates.lat,
      selectedOrder.coordinates.lng
    );
    const eta = estimateDriveMinutes(dist);
    return { dist, eta, isFromDriverGPS: !!driverLocation };
  }, [selectedOrder, driverLocation, stationLat, stationLng]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = initialCenter?.lat ?? stationLat;
      const centerLng = initialCenter?.lng ?? stationLng;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: initialZoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Free, open-source OpenStreetMap tiles (No API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | AquaFabz System',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }
  }, []);

  // 2. Handle location picking click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isPickingLocation && onLocationPicked) {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
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

  // 3. Render markers, sequential stop numbers, and connecting route lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Clear old polylines
    routesLayerRef.current.forEach((line) => line.remove());
    routesLayerRef.current = [];

    // --- Station HQ Marker ---
    const hqIcon = L.divIcon({
      className: 'custom-hq-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2.5 bg-cyan-400 rounded-full opacity-40 pulsing-marker"></div>
          <div class="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-cyan-600 to-blue-700 text-white rounded-2xl shadow-xl border-2 border-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <span class="absolute -bottom-5 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
            Station HQ
          </span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const hqMarker = L.marker([stationLat, stationLng], { icon: hqIcon }).addTo(markersGroup);
    hqMarker.bindPopup(`
      <div class="p-2 min-w-[210px] text-xs">
        <div class="flex items-center gap-1.5 text-cyan-600 font-bold uppercase tracking-wider mb-1 text-[10px]">
          <span>AquaFabz Station HQ</span>
        </div>
        <div class="font-black text-slate-800 text-sm mb-1">${settings?.stationName || 'AquaFabz'}</div>
        <div class="text-slate-600 mb-2">${settings?.address || 'Poblacion'}, ${settings?.barangay || 'Binalbagan'}</div>
        <div class="bg-cyan-50 border border-cyan-100 rounded-lg p-2 text-[11px] text-cyan-900 font-mono">
          📍 Base Coordinates: ${stationLat.toFixed(4)}, ${stationLng.toFixed(4)}
        </div>
      </div>
    `);

    // --- Driver Vehicle Marker (Browser HTML5 Geolocation, Zero APIs) ---
    if (driverLocation) {
      const driverIcon = L.divIcon({
        className: 'custom-driver-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-3 bg-emerald-500 rounded-full opacity-40 animate-ping"></div>
            <div class="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-xl border-2 border-white">
              <span class="text-lg">🛵</span>
            </div>
            <span class="absolute -top-5 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-white whitespace-nowrap">
              You (Rider)
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon }).addTo(markersGroup);
    }

    // --- Vending Machines ---
    if (showVendingMachines && (activeTab === 'all' || activeTab === 'vending')) {
      vendingMachines.forEach((vm) => {
        const isLow = vm.status === 'low_water';
        const vmColor = isLow ? 'bg-amber-500' : 'bg-purple-600';

        const vmIcon = L.divIcon({
          className: 'custom-vm-marker',
          html: `
            <div class="group relative flex items-center justify-center">
              <div class="flex items-center justify-center w-8 h-8 ${vmColor} text-white rounded-xl shadow-md border-2 border-white hover:scale-110 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M15 6H9"/><path d="M9 10h6"/><path d="M9 14h6"/><circle cx="9" cy="18" r="1"/></svg>
              </div>
              <span class="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span class="relative inline-flex rounded-full h-3 w-3 ${isLow ? 'bg-amber-400' : 'bg-emerald-400'} border border-white"></span>
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([vm.coordinates.lat, vm.coordinates.lng], { icon: vmIcon }).addTo(
          markersGroup
        );
        marker.bindPopup(`
          <div class="p-2 min-w-[210px] text-xs">
            <div class="flex items-center justify-between text-xs font-semibold mb-1">
              <span class="text-purple-600 font-bold">${vm.code}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }">${isLow ? 'Low Water Alert' : 'Operational'}</span>
            </div>
            <div class="font-bold text-slate-800 text-sm">${vm.name}</div>
            <div class="text-slate-600 mb-2">${vm.locationName}</div>
            <div class="space-y-1 text-xs border-t border-slate-100 pt-2">
              <div class="flex justify-between text-slate-600">
                <span>Water Level:</span>
                <span class="font-bold text-slate-800">${vm.currentWaterLevelLiters}L / ${vm.waterCapacityLiters}L</span>
              </div>
            </div>
          </div>
        `);
      });
    }

    // --- Customer Delivery Orders ---
    const displayedOrders = orders.filter((o) => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (activeTab === 'active_deliveries') {
        return o.status === 'Out for Delivery' || o.status === 'Preparing';
      }
      return true;
    });

    const routeWaypoints = [[stationLat, stationLng]];

    displayedOrders.forEach((order, index) => {
      const isSelected = selectedOrderId === order.id;
      const stopNumber = index + 1;

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

      // Local distance calculation (zero API calls)
      const distFromStation = calculateDistanceKm(
        stationLat,
        stationLng,
        order.coordinates.lat,
        order.coordinates.lng
      );
      const driveMins = estimateDriveMinutes(distFromStation);

      const orderIcon = L.divIcon({
        className: 'custom-order-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${
              isSelected
                ? '<div class="absolute -inset-3 bg-amber-400 rounded-full opacity-60 animate-ping"></div>'
                : order.status === 'Out for Delivery'
                ? '<div class="absolute -inset-2 bg-indigo-500 rounded-full opacity-40 pulsing-marker"></div>'
                : ''
            }
            <div class="flex items-center justify-center w-9 h-9 ${pinBg} text-white font-bold text-xs rounded-2xl shadow-xl border-2 ${
          isSelected
            ? 'border-amber-300 ring-4 ring-amber-400/60 scale-125 z-30'
            : 'border-white hover:scale-110'
        } transition-all">
              ${statusIcon}
            </div>

            <!-- Sequential Stop Number Badge -->
            <span class="absolute -top-2 -right-2 w-5 h-5 rounded-full ${
              isSelected ? 'bg-amber-400 text-amber-950 ring-2 ring-white' : 'bg-slate-900 text-white'
            } font-black text-[10px] flex items-center justify-center shadow-md">
              ${stopNumber}
            </span>

            <!-- Local Distance Pill -->
            <span class="absolute -bottom-5 bg-white/95 text-slate-800 text-[9px] font-bold px-1 py-0.2 rounded shadow-xs border border-slate-200 whitespace-nowrap pointer-events-none">
              ${distFromStation} km
            </span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([order.coordinates.lat, order.coordinates.lng], {
        icon: orderIcon,
      }).addTo(markersGroup);

      marker.on('click', () => {
        if (onSelectOrder) onSelectOrder(order);
      });

      marker.bindPopup(`
        <div class="p-2.5 min-w-[220px] text-xs">
          <div class="flex items-center justify-between text-xs font-semibold mb-1">
            <span class="font-mono text-indigo-600 font-bold">Stop #${stopNumber} · ${order.orderNumber}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              order.status === 'Out for Delivery'
                ? 'bg-indigo-100 text-indigo-700'
                : order.status === 'Preparing'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'Delivered'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }">${order.status}</span>
          </div>
          <div class="font-black text-slate-900 text-sm mb-0.5">${order.customerName}</div>
          <div class="text-slate-600 mb-1">📍 ${order.deliveryAddress} (${order.barangay})</div>
          <div class="text-slate-500 mb-2">📞 ${order.customerPhone}</div>

          <div class="bg-indigo-50/70 p-2 rounded-xl text-xs space-y-1 mb-2 border border-indigo-100">
            <div class="flex justify-between">
              <span class="text-slate-600">Items:</span>
              <span class="font-bold text-slate-900">${order.items.reduce((s, i) => s + i.quantity, 0)} jugs</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Empty Jugs:</span>
              <span class="font-bold text-cyan-700">${order.containersToReturnCount} to collect</span>
            </div>
            <div class="flex justify-between border-t border-indigo-100/80 pt-1 font-bold">
              <span>Amount:</span>
              <span class="text-emerald-700 font-black">₱${order.totalAmount}</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-500 mb-2 font-medium">
            📏 Distance from Station: <strong>${distFromStation} km</strong> (~${driveMins} mins)
          </div>
        </div>
      `);

      routeWaypoints.push([order.coordinates.lat, order.coordinates.lng]);

      // Direct accent line to Selected Order or Out-for-Delivery
      if (isSelected || order.status === 'Out for Delivery') {
        const polyline = L.polyline(
          [
            [driverLocation ? driverLocation.lat : stationLat, driverLocation ? driverLocation.lng : stationLng],
            [order.coordinates.lat, order.coordinates.lng],
          ],
          {
            color: isSelected ? '#f59e0b' : '#6366f1',
            weight: isSelected ? 4 : 3,
            dashArray: isSelected ? '8, 8' : '6, 6',
            opacity: 0.9,
          }
        ).addTo(map);

        routesLayerRef.current.push(polyline);
      }
    });

    // Multi-stop route line connecting all stops sequentially
    if (routeWaypoints.length > 2) {
      const fullRouteLine = L.polyline(routeWaypoints, {
        color: '#818cf8',
        weight: 2.5,
        dashArray: '5, 6',
        opacity: 0.65,
      }).addTo(map);
      routesLayerRef.current.push(fullRouteLine);
    }

    // --- Registered Customer Pins (Coverage) ---
    if (showAllCustomers && (activeTab === 'all' || activeTab === 'coverage')) {
      customers.forEach((cust) => {
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

        const marker = L.marker([cust.coordinates.lat, cust.coordinates.lng], {
          icon: custIcon,
        }).addTo(markersGroup);

        marker.on('click', () => {
          if (onSelectCustomer) onSelectCustomer(cust);
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[200px] text-xs">
            <span class="text-slate-500 font-semibold text-[10px]">${cust.customerType}</span>
            <div class="font-bold text-slate-800 text-sm">${cust.name}</div>
            <div class="text-slate-600 mb-1">📍 ${cust.primaryAddress}</div>
            <div class="text-slate-500 mb-2">📞 ${cust.contactNumber}</div>
            <div class="flex justify-between text-xs bg-slate-50 p-1.5 rounded">
              <span>Borrowed Jugs:</span>
              <strong class="text-cyan-700">${cust.containersHeld} containers</strong>
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
    driverLocation,
  ]);

  // Center to selected order with smooth flyTo animation
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

  // Map controls
  const resetToStation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([stationLat, stationLng], initialZoom, {
        duration: 1,
      });
    }
  };

  const fitAllStops = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const coords = [[stationLat, stationLng]];
    orders.forEach((o) => {
      coords.push([o.coordinates.lat, o.coordinates.lng]);
    });
    if (driverLocation) {
      coords.push([driverLocation.lat, driverLocation.lng]);
    }

    if (coords.length > 1) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  };

  // Browser HTML5 Geolocation (Standard Web API built into browser, 0 external APIs)
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDriverLocation(loc);
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
          }
        },
        () => {
          // Simulation near station if browser permission is blocked
          const simLat = stationLat + 0.0025;
          const simLng = stationLng + 0.0035;
          setDriverLocation({ lat: simLat, lng: simLng });
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([simLat, simLng], 16, { duration: 1 });
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Calculate solid pixel height to prevent zero-height collapse
  const resolvedHeight = useMemo(() => {
    if (typeof heightClass === 'string') {
      const match = heightClass.match(/h-\[(\d+)px\]/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    return 480;
  }, [heightClass]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 60);
    }
  }, [activeTab, resolvedHeight]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-white flex flex-col relative">
      {/* Top Map Controls Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Layer & Filter Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-600 text-white shadow-2xs font-bold'
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
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Active Trips</span>
          </button>
          {showVendingMachines && (
            <button
              type="button"
              onClick={() => setActiveTab('vending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'vending'
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Vending ({vendingMachines.length})</span>
            </button>
          )}
          {showAllCustomers && (
            <button
              type="button"
              onClick={() => setActiveTab('coverage')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'coverage'
                  ? 'bg-slate-800 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Customer Base
            </button>
          )}
        </div>

        {/* Action Controls: Fit Route, Locate Me, Re-center */}
        <div className="flex items-center gap-1.5">
          {orders.length > 0 && (
            <button
              type="button"
              onClick={fitAllStops}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Fit all delivery destinations in view"
            >
              <Route className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fit Route</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLocateMe}
            className={`px-2.5 py-1.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
              driverLocation ? 'text-emerald-700 font-bold' : 'text-slate-700'
            }`}
            title="Locate Driver Vehicle (HTML5 Browser GPS)"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${driverLocation ? 'text-emerald-600' : 'text-slate-600'}`} />
            <span>{isLocating ? 'Locating...' : driverLocation ? 'GPS Active' : 'Locate Me'}</span>
          </button>

          <button
            type="button"
            onClick={resetToStation}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            title="Recenter Map to Station HQ"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
            <span>Station Base</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div
        ref={mapContainerRef}
        style={{ height: `${resolvedHeight}px`, minHeight: `${resolvedHeight}px` }}
        className="w-full relative z-10"
      />

      {/* Floating In-App Destination Card (Zero APIs, Pure React Component) */}
      {selectedOrder && (
        <div className="absolute bottom-11 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-200 shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {selectedOrder.orderNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrder.status === 'Out for Delivery'
                      ? 'bg-indigo-600 text-white'
                      : selectedOrder.status === 'Delivered'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedOrder.status}
                </span>
                {selectedMetrics && (
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                    {selectedMetrics.dist} km · ~{selectedMetrics.eta} mins
                  </span>
                )}
              </div>
              <h4 className="font-black text-slate-900 text-sm mt-1">{selectedOrder.customerName}</h4>
              <p className="text-xs text-slate-600 flex items-start gap-1 font-medium mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>{selectedOrder.deliveryAddress} ({selectedOrder.barangay})</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectOrder && onSelectOrder(null)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">To Deliver</span>
              <span className="font-bold text-slate-900">
                {selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} units
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Empty to Collect</span>
              <span className="font-bold text-cyan-700">
                {selectedOrder.containersToReturnCount} jugs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${selectedOrder.customerPhone}`}
              className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Call Customer</span>
            </a>

            {onUpdateStatus && selectedOrder.status !== 'Delivered' && (
              <button
                type="button"
                onClick={() =>
                  onUpdateStatus(
                    selectedOrder.id,
                    selectedOrder.status === 'Out for Delivery' ? 'Delivered' : 'Out for Delivery'
                  )
                }
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {selectedOrder.status === 'Out for Delivery' ? 'Deliver' : 'Depart'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="bg-slate-50/90 border-t border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 z-10">
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

        <div className="text-[11px] text-slate-500 font-mono">
          📍 Binalbagan, Negros Occidental · Self-Contained Local Map
        </div>
      </div>
    </div>
  );
};
