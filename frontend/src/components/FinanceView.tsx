import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, X, Plus, CreditCard, Receipt, FileText } from 'lucide-react';
import client from '../api/client';

const FinanceView: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    student_id: '',
    fee_structure_id: '1',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    amount_due: '500'
  });

  const [newPayment, setNewPayment] = useState({
    invoice_id: '',
    amount_paid: '',
    payment_method: 'Card'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, stRes] = await Promise.all([
        client.get('/finance/invoices'),
        client.get('/students/')
      ]);

      if (invRes.data?.status === 'success') setInvoices(invRes.data.data);
      if (stRes.data?.status === 'success') setStudents(stRes.data.data);
    } catch (err) {
      console.error("Failed to fetch finance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/finance/invoices', {
        student_id: parseInt(newInvoice.student_id),
        fee_structure_id: parseInt(newInvoice.fee_structure_id),
        issue_date: newInvoice.issue_date,
        due_date: newInvoice.due_date,
        amount_due: parseFloat(newInvoice.amount_due)
      });
      setIsInvoiceModalOpen(false);
      setNewInvoice({
        student_id: '',
        fee_structure_id: '1',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        amount_due: '500'
      });
      fetchData();
    } catch (err) {
      console.error("Failed to add invoice", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/finance/payments', {
        invoice_id: parseInt(newPayment.invoice_id),
        amount_paid: parseFloat(newPayment.amount_paid),
        payment_method: newPayment.payment_method
      });
      setIsPaymentModalOpen(false);
      setNewPayment({ invoice_id: '', amount_paid: '', payment_method: 'Card' });
      fetchData();
    } catch (err) {
      console.error("Failed to record payment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCollected = invoices.filter((i: any) => i.status === 'Paid').reduce((acc, cur) => acc + (cur.amount_due || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center">
            <DollarSign className="w-7 h-7 mr-2 text-emerald-600 shrink-0" />
            Finance & Billing Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage student tuition fees, issue billing invoices, and record incoming payments.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsInvoiceModalOpen(true)} 
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-md text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Invoice
          </button>
          <button 
            onClick={() => setIsPaymentModalOpen(true)} 
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-md flex items-center"
          >
            <CreditCard className="w-4 h-4 mr-1.5 text-emerald-400" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col border-l-4 border-l-emerald-500 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Collected</span>
          <span className="text-3xl font-extrabold text-slate-800 mt-2">${totalCollected.toFixed(2)}</span>
        </div>
        <div className="card p-6 flex flex-col border-l-4 border-l-amber-500 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Invoices</span>
          <span className="text-3xl font-extrabold text-slate-800 mt-2">{invoices.filter((i: any) => i.status === 'Pending').length}</span>
        </div>
        <div className="card p-6 flex flex-col border-l-4 border-l-blue-500 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Invoices</span>
          <span className="text-3xl font-extrabold text-slate-800 mt-2">{invoices.length}</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card p-0 overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center">
            <Receipt className="w-4 h-4 mr-2 text-emerald-600" />
            Recent Billing Invoices
          </h3>
          <span className="text-xs text-slate-500 font-medium">Total: {invoices.length} Records</span>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                  <th className="px-6 py-4 font-semibold">Invoice Ref</th>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Amount Due</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">Student #{inv.student_id}</td>
                    <td className="px-6 py-4 text-slate-800 font-extrabold">${inv.amount_due.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{inv.due_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        inv.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No invoices found. Click "Create Invoice" to start billing.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal 1: Create Invoice */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                Create New Invoice
              </h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                <select 
                  required 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                  value={newInvoice.student_id} 
                  onChange={(e) => setNewInvoice({...newInvoice, student_id: e.target.value})}
                >
                  <option value="">Select Student...</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
                  <input type="date" required className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" value={newInvoice.issue_date} onChange={(e) => setNewInvoice({...newInvoice, issue_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input type="date" required className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" value={newInvoice.due_date} onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Due ($) *</label>
                <input type="number" step="0.01" required placeholder="500.00" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" value={newInvoice.amount_due} onChange={(e) => setNewInvoice({...newInvoice, amount_due: e.target.value})} />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Payment */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                Record Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Invoice *</label>
                <select 
                  required 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                  value={newPayment.invoice_id} 
                  onChange={(e) => setNewPayment({...newPayment, invoice_id: e.target.value})}
                >
                  <option value="">Select Invoice...</option>
                  {invoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      INV-{inv.id.toString().padStart(4, '0')} - Student #{inv.student_id} (${inv.amount_due})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid ($) *</label>
                <input type="number" step="0.01" required placeholder="e.g. 500.00" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" value={newPayment.amount_paid} onChange={(e) => setNewPayment({...newPayment, amount_paid: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select required className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" value={newPayment.payment_method} onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
