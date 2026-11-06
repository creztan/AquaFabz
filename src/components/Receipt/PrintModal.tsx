import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, X, Droplets, CheckCircle2 } from 'lucide-react';
import { SalesTransaction, DeliveryOrder, VendingSaleRecord } from '../../types';

export const PrintModal: React.FC = () => {
  const { printableItem, setPrintableItem, triggerPrint, settings } = useApp();

  if (!printableItem) return null;

  const { type, data } = printableItem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Actions (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-slate-800 text-sm">Print Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintableItem(null)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          <div
            id="printable-area"
            className="w-full max-w-md bg-white p-6 shadow-sm border border-slate-200 rounded-xl text-slate-800 font-mono text-xs leading-relaxed"
          >
            {/* Station Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="flex justify-center mb-1">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>
              <h2 className="font-bold text-sm tracking-wide uppercase text-slate-900 font-sans">
                {settings.stationName}
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">{settings.tagline}</p>
              <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                {settings.address}, {settings.barangay}, {settings.city}
              </p>
              <p className="text-[10px] text-slate-600 font-sans">Tel: {settings.contactNumber}</p>
              <div className="mt-1 text-[9px] text-slate-500 font-sans">
                Permit: {settings.businessPermitNo} | DOH: {settings.dohAccreditationNo}
              </div>
            </div>

            {/* Receipt Content by Type */}
            {type === 'receipt' && (
              <ReceiptContent sale={data as SalesTransaction} currency={settings.currencySymbol} />
            )}

            {type === 'order' && (
              <OrderSlipContent order={data as DeliveryOrder} currency={settings.currencySymbol} />
            )}

            {type === 'vending' && (
              <VendingCollectionContent record={data as VendingSaleRecord} currency={settings.currencySymbol} />
            )}

            {type === 'report' && (
              <ReportSlipContent report={data} currency={settings.currencySymbol} />
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans">
              <p className="font-semibold text-slate-700">Thank you for choosing safe drinking water!</p>
              <p className="mt-0.5">This document serves as an Official Transaction Record.</p>
              <p className="mt-1 text-[9px] text-slate-400">AquaFabz Station Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptContent: React.FC<{ sale: SalesTransaction; currency: string }> = ({ sale, currency }) => (
  <div className="py-4 space-y-3">
    <div className="flex justify-between text-[11px]">
      <span>Receipt #: <strong className="text-slate-900">{sale.transactionNumber}</strong></span>
      <span>{sale.date} {sale.time}</span>
    </div>
    <div className="text-[11px]">
      <div>Customer: <strong className="text-slate-900">{sale.customerName}</strong></div>
      <div>Type: {sale.orderType.toUpperCase()} | Served By: {sale.staffName}</div>
    </div>

    {/* Items */}
    <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
      <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
        <span>Item / Description</span>
        <span>Amount</span>
      </div>
      {sale.items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-[11px]">
          <div>
            <div className="font-semibold text-slate-800">{item.productName}</div>
            <div className="text-[10px] text-slate-500">
              {item.quantity} x {currency}{item.unitPrice.toFixed(2)}
            </div>
          </div>
          <div className="font-semibold text-slate-900 self-center">
            {currency}{item.total.toFixed(2)}
          </div>
        </div>
      ))}
    </div>

    {/* Financial Summary */}
    <div className="space-y-1 text-[11px]">
      <div className="flex justify-between">
        <span className="text-slate-600">Subtotal:</span>
        <span>{currency}{sale.subtotal.toFixed(2)}</span>
      </div>
      {sale.discount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <span>Discount:</span>
          <span>-{currency}{sale.discount.toFixed(2)}</span>
        </div>
      )}
      {sale.deliveryFee > 0 && (
        <div className="flex justify-between">
          <span className="text-slate-600">Delivery Fee:</span>
          <span>{currency}{sale.deliveryFee.toFixed(2)}</span>
        </div>
      )}
      {sale.containerDeposit > 0 && (
        <div className="flex justify-between text-indigo-600">
          <span>Container Deposit:</span>
          <span>+{currency}{sale.containerDeposit.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1 text-slate-900">
        <span>TOTAL AMOUNT:</span>
        <span>{currency}{sale.totalAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between pt-1 text-slate-600">
        <span>Payment Method:</span>
        <span className="uppercase font-semibold">{sale.paymentMethod}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Amount Tendered:</span>
        <span>{currency}{sale.amountPaid.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold text-slate-800">
        <span>Change:</span>
        <span>{currency}{sale.change.toFixed(2)}</span>
      </div>
    </div>

    {sale.notes && (
      <div className="p-2 bg-slate-50 rounded text-[10px] text-slate-600 italic">
        Note: {sale.notes}
      </div>
    )}
  </div>
);

const OrderSlipContent: React.FC<{ order: DeliveryOrder; currency: string }> = ({ order, currency }) => (
  <div className="py-4 space-y-3">
    <div className="flex justify-between text-[11px]">
      <span>Order #: <strong className="text-slate-900">{order.orderNumber}</strong></span>
      <span>{order.date} {order.time}</span>
    </div>
    <div className="bg-slate-50 p-2 rounded text-[11px] space-y-0.5">
      <div>Customer: <strong className="text-slate-900">{order.customerName}</strong></div>
      <div>Contact: <strong>{order.customerPhone}</strong></div>
      <div>Destination: {order.deliveryAddress}</div>
      {order.deliveryNotes && (
        <div className="text-amber-800 text-[10px]">⚠️ Note: {order.deliveryNotes}</div>
      )}
      <div>Schedule: <strong>{order.requestedSchedule}</strong></div>
      <div>Assigned Rider: <strong>{order.assignedPersonnel || 'Unassigned'}</strong></div>
      <div>Status: <span className="font-bold uppercase text-indigo-700">{order.status}</span></div>
    </div>

    {/* Items */}
    <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
      <div className="font-bold text-[10px] text-slate-500 uppercase">Items for Delivery</div>
      {order.items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-[11px]">
          <span>{item.quantity}x {item.productName}</span>
          <span className="font-semibold">{currency}{item.total.toFixed(2)}</span>
        </div>
      ))}
    </div>

    <div className="space-y-1 text-[11px]">
      <div className="flex justify-between">
        <span>Delivery Fee:</span>
        <span>{currency}{order.deliveryFee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
        <span>TOTAL PAYABLE:</span>
        <span>{currency}{order.totalAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>Payment Status:</span>
        <span className="font-bold uppercase text-slate-800">{order.paymentStatus} ({order.paymentMethod})</span>
      </div>
      <div className="flex justify-between text-[10px] text-indigo-700 font-semibold pt-1">
        <span>Empty Jugs to Collect:</span>
        <span>{order.containersToReturnCount} containers</span>
      </div>
    </div>
  </div>
);

const VendingCollectionContent: React.FC<{ record: VendingSaleRecord; currency: string }> = ({
  record,
  currency,
}) => (
  <div className="py-4 space-y-3">
    <div className="text-center font-bold text-xs uppercase text-indigo-700">
      Vending Machine Collection Slip
    </div>
    <div className="text-[11px] space-y-1">
      <div>Machine: <strong className="text-slate-900">{record.machineName}</strong></div>
      <div>Collection Date: <strong>{record.date}</strong></div>
      <div>Staff Collector: <strong>{record.recordedBy}</strong></div>
    </div>

    <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5 text-[11px]">
      <div className="flex justify-between">
        <span>Water Dispensed:</span>
        <strong className="text-slate-800">{record.waterDispensedLiters} Liters</strong>
      </div>
      {record.meterReadingStart && record.meterReadingEnd && (
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Meter: {record.meterReadingStart} ➔ {record.meterReadingEnd}</span>
          <span>Diff: {record.meterReadingEnd - record.meterReadingStart}</span>
        </div>
      )}
      {record.waterRefilledLiters && (
        <div className="flex justify-between text-cyan-700 font-semibold">
          <span>Station Tank Replenished:</span>
          <span>+{record.waterRefilledLiters} Liters</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-sm text-emerald-700 pt-1 border-t border-slate-200">
        <span>COINS COLLECTED:</span>
        <span>{currency}{record.coinsCollected.toLocaleString()}</span>
      </div>
    </div>

    {record.notes && (
      <div className="text-[10px] text-slate-600 italic">
        Notes: {record.notes}
      </div>
    )}
  </div>
);

const ReportSlipContent: React.FC<{ report: any; currency: string }> = ({ report, currency }) => (
  <div className="py-4 space-y-3">
    <div className="text-center font-bold text-xs uppercase text-slate-900">
      {report.title || 'Summary Audit Report'}
    </div>
    <div className="text-[11px] text-slate-500 text-center">
      Generated: {new Date().toLocaleDateString()}
    </div>
    <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-2 text-[11px]">
      {report.metrics &&
        report.metrics.map((m: any, idx: number) => (
          <div key={idx} className="flex justify-between">
            <span className="text-slate-600">{m.label}:</span>
            <span className="font-bold text-slate-900">{m.value}</span>
          </div>
        ))}
    </div>
  </div>
);
