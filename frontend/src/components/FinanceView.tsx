import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, X } from 'lucide-react';
import client from '../api/client';

const FinanceView: React.FC = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newInvoice, setNewInvoice] = useState({ student_id: '', fee_structure_id: '', issue_date: '', due_date: '', amount_due: '' });
  const [newPayment, setNewPayment] = useState({ invoice_id: '', amount_paid: '', payment_method: '' });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await client.get('/finance/invoices');
      if (res.data?.status === 'success') {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
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
      setNewInvoice({ student_id: '', fee_structure_id: '', issue_date: '', due_date: '', amount_due: '' });
      fetchInvoices();
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
      setNewPayment({ invoice_id: '', amount_paid: '', payment_method: '' });
      fetchInvoices();
    } catch (err) {
      console.error("Failed to record payment", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-500" />
          Finance & Billing
        </h2>
        <div className="space-x-2">
          <button onClick={() => setIsInvoiceModalOpen(true)} className="btn-primary">Create Invoice</button>
          <button onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Record Payment</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col border-l-4 border-l-blue-500">
          <span className="text-sm font-medium text-slate-500">Total Revenue</span>
          <span className="text-3xl font-bold text-slate-800 mt-2">$0.00</span>
        </div>
        <div className="card p-6 flex flex-col border-l-4 border-l-orange-500">
          <span className="text-sm font-medium text-slate-500">Pending Invoices</span>
          <span className="text-3xl font-bold text-slate-800 mt-2">{invoices.filter((i: any) => i.status === 'Pending').length}</span>
        </div>
        <div className="card p-6 flex flex-col border-l-4 border-l-green-500">
          <span className="text-sm font-medium text-slate-500">Paid Invoices</span>
          <span className="text-3xl font-bold text-slate-800 mt-2">{invoices.filter((i: any) => i.status === 'Paid').length}</span>
        </div>
      </div>

      <div className="card p-0">
        <div className="p-4 border-b border-slate-100 flex items-center">
          <h3 className="font-bold text-slate-800">Recent Invoices</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Invoice ID</th>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.student_id}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">${inv.amount_due.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.due_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Create New Invoice</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newInvoice.student_id} onChange={(e) => setNewInvoice({...newInvoice, student_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fee Structure ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newInvoice.fee_structure_id} onChange={(e) => setNewInvoice({...newInvoice, fee_structure_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                  <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newInvoice.issue_date} onChange={(e) => setNewInvoice({...newInvoice, issue_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newInvoice.due_date} onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount Due</label>
                  <input type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newInvoice.amount_due} onChange={(e) => setNewInvoice({...newInvoice, amount_due: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Record Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice ID</label>
                <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" value={newPayment.invoice_id} onChange={(e) => setNewPayment({...newPayment, invoice_id: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
                <input type="number" step="0.01" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" value={newPayment.amount_paid} onChange={(e) => setNewPayment({...newPayment, amount_paid: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" value={newPayment.payment_method} onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}>
                  <option value="">Select method...</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary bg-green-600 hover:bg-green-700 flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Payment
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
