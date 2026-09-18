import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Search, Filter, ChevronDown, ChevronUp, X, Loader2, Package, Eye, Clock, CheckCircle, Truck, XCircle, ArrowUpDown } from 'lucide-react';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Paid: 'bg-green-100 text-green-800',
  Failed: 'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'total_amount'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOrders();
      setOrders(data || []);
    } catch (e) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription for new orders
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    let result = [...orders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(o => o.order_status === statusFilter);
    }
    if (paymentFilter) {
      result = result.filter(o => o.payment_status === paymentFilter);
    }
    result.sort((a, b) => {
      const aVal = sortField === 'created_at' ? new Date(a.created_at).getTime() : Number(a.total_amount);
      const bVal = sortField === 'created_at' ? new Date(b.created_at).getTime() : Number(b.total_amount);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return result;
  }, [orders, searchQuery, statusFilter, paymentFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedOrders = filtered.slice((page - 1) * perPage, page * perPage);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, order_status: newStatus }));
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderPaymentStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, payment_status: newStatus }));
      }
      toast.success(`Payment status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  const toggleSort = (field: 'created_at' | 'total_amount') => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif font-bold text-text-main">Orders</h1>
        <div className="text-sm text-text-muted">{filtered.length} total orders</div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl card-shadow p-4 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name, email, phone..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white"
          >
            <option value="">All Payments</option>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-text-muted">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">Items</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted cursor-pointer select-none" onClick={() => toggleSort('total_amount')}>
                  <span className="flex items-center gap-1">Total <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                  <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-main">{order.customer_name}</div>
                    <div className="text-xs text-text-muted">{order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{order.order_items?.length || 0} item(s)</td>
                  <td className="px-4 py-3 font-medium text-text-main">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.order_status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openDetail(order)}
                      className="p-2 rounded-lg text-primary hover:bg-primary-light transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-muted">
                    <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl card-shadow p-4 border border-gray-100" onClick={() => openDetail(order)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-primary text-sm">{order.order_number}</p>
                <p className="font-medium text-text-main">{order.customer_name}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}>
                {order.order_status}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-muted">
              <span>{order.order_items?.length || 0} item(s)</span>
              <span className="font-medium text-text-main">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        ))}
        {paginatedOrders.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 relative">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-serif font-bold text-text-main">Order Details</h2>
                <p className="text-sm text-primary font-medium">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setDetailOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-text-muted">Name:</span> <span className="font-medium ml-1">{selectedOrder.customer_name}</span></div>
                  <div><span className="text-text-muted">Phone:</span> <span className="font-medium ml-1">{selectedOrder.customer_phone}</span></div>
                  <div className="md:col-span-2"><span className="text-text-muted">Email:</span> <span className="font-medium ml-1">{selectedOrder.customer_email}</span></div>
                  <div className="md:col-span-2"><span className="text-text-muted">Address:</span> <span className="font-medium ml-1">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</span></div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Ordered Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-14 h-14 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-main text-sm">{item.product_name}</p>
                        <p className="text-xs text-text-muted">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.finish && ' • '}
                          {item.finish && `Finish: ${item.finish}`}
                          {' • '}Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-text-main whitespace-nowrap">
                        ₹{Number(item.unit_price).toLocaleString('en-IN')} × {item.quantity} = ₹{Number(item.total_price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span className="font-medium">₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span className="font-medium text-green-600">{Number(selectedOrder.shipping_charge) > 0 ? `₹${Number(selectedOrder.shipping_charge).toLocaleString('en-IN')}` : 'Free'}</span></div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between"><span className="text-text-muted">Discount</span><span className="font-medium text-green-600">-₹{Number(selectedOrder.discount).toLocaleString('en-IN')}</span></div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="font-bold text-text-main text-base">Grand Total</span>
                  <span className="font-bold text-primary text-lg">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Controls */}
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Order Status</label>
                    <select
                      value={selectedOrder.order_status}
                      onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white"
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Payment Status</label>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={e => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white"
                    >
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-text-muted flex flex-wrap gap-4 border-t border-gray-100 pt-4">
                <span>Payment: {selectedOrder.payment_method}</span>
                <span>Created: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                <span>Updated: {new Date(selectedOrder.updated_at).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
