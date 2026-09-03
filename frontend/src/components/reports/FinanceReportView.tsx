import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, Loader2, Printer, X
} from 'lucide-react';
import client from '../../api/client';
import ReportsNav from './ReportsNav';

const FinanceReportView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await client.get('/reports/finance');
      if (res.data?.status === 'success') {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch finance report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <ReportsNav />
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-slate-500 font-medium text-sm">Loading Financial Analytics Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      <ReportsNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-amber-600" />
            Financial & Revenue Collection Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tracking invoiced fees, collected revenues, pending tuition balances, and overdue accounts.
          </p>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm text-sm"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Invoiced Amount</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">${reportData.summary.total_invoiced.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total Fee Structures</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Collected Revenue</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">${reportData.summary.total_collected.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Collection Rate: {reportData.summary.collection_rate_pct}%
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Pending Balances</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">${reportData.summary.total_pending.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting Payment</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Overdue Unpaid Fees</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">${reportData.summary.total_overdue.toLocaleString()}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Requires Follow-up</p>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">Monthly Collection vs Pending Revenue</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#475569' }} />
                  <YAxis tick={{ fill: '#475569' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected ($)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">Payment Status Share</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData.payment_status} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {reportData.payment_status.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 text-left print:p-0 print:shadow-none">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                Official Financial Statement Document
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 border border-slate-200 rounded-xl space-y-6 bg-white">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Smart Future Academy</h1>
                  <p className="text-sm font-semibold text-slate-600">Financial Revenue & Tuition Collection Summary</p>
                  <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right border-l-2 border-slate-200 pl-4">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                    FINANCIAL AUDIT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                <p><strong>Total Invoiced:</strong> ${reportData?.summary?.total_invoiced.toLocaleString()}</p>
                <p><strong>Total Revenue Collected:</strong> ${reportData?.summary?.total_collected.toLocaleString()}</p>
                <p><strong>Pending Balances:</strong> ${reportData?.summary?.total_pending.toLocaleString()}</p>
                <p><strong>Overdue Unpaid Fees:</strong> ${reportData?.summary?.total_overdue.toLocaleString()}</p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-700">
                <div>
                  <p>Chief Financial Officer</p>
                  <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>School Principal</p>
                  <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReportView;
