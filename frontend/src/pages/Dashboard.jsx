import React, { useState, useEffect } from 'react';
// V iných súboroch importujte takto:
// V iných súboroch importujte takto:
import VoucherConfigurator from '../components/VoucherConfigurator';

// Alebo ak potrebujete len konfiguráciu:
import { COLOR_THEMES, VOUCHER_FORMATS, VOUCHER_LAYOUTS } from '../config/voucherTemplatesConfig';
import {
  ShoppingBag, Tag, Gift, Plus, Edit2, Trash2, Check, CheckCircle, Hash, Calendar, DollarSign
} from 'lucide-react';

// voucherColors must be outside any function/component
const voucherColors = [
  { id: 'blue', name: 'Modrá', bg: 'bg-blue-500', text: 'text-white', preview: '#3B82F6' },
  { id: 'green', name: 'Zelená', bg: 'bg-green-500', text: 'text-white', preview: '#10B981' },
  { id: 'purple', name: 'Fialová', bg: 'bg-purple-500', text: 'text-white', preview: '#8B5CF6' },
  { id: 'pink', name: 'Ružová', bg: 'bg-pink-500', text: 'text-white', preview: '#EC4899' },
  { id: 'amber', name: 'Oranžová', bg: 'bg-amber-500', text: 'text-white', preview: '#F59E0B' },
  { id: 'teal', name: 'Tyrkysová', bg: 'bg-teal-500', text: 'text-white', preview: '#14B8A6' },
  { id: 'red', name: 'Červená', bg: 'bg-red-500', text: 'text-white', preview: '#EF4444' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', text: 'text-white', preview: '#6366F1' }
];

const Modal = ({ type, item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(() => {
    if (item) {
      // Ak upravujeme existujúci item, namapuj údaje správne
      if (type === 'voucher') {
        return {
          amount: item.amount ? item.amount.toString() : (item.value_cents ? (item.value_cents / 100).toString() : ''),
          description: item.status || item.description || '',
          available_count: item.available_count || 1,
          validity_days: item.validity_days || 365,
          color: item.color || 'blue'
        };
      } else if (type === 'service') {
        return {
          name: item.name || '',
          price: item.price || '',
          description: item.description || '',
          available_count: item.available_count || '',
          validity_days: item.validity_days || 365
        };
      }
    }
    
    // Nový item - prázdne hodnoty
    return {
      name: '',
      amount: '',
      price: '',
      description: '',
      available_count: 1,
      validity_days: 365,
      color: 'blue'
    };
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSubmit(formData);
  };

  const isVoucher = type === 'voucher';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {item ? 'Upraviť' : 'Pridať'} {isVoucher ? 'poukaz' : 'službu'}
        </h3>

        <div className="space-y-4">
          {!isVoucher && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Názov služby
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          )}

          {isVoucher ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Suma (€)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cena (€)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Popis
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              rows="3"
            />
          </div>

          {type === 'voucher' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Farba poukážky
              </label>
              <div className="grid grid-cols-4 gap-2">
                {voucherColors.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleChange('color', color.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.color === color.id 
                        ? 'border-gray-800 ring-2 ring-gray-300' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-8 ${color.bg} rounded mb-1`}></div>
                    <span className="text-xs text-gray-600">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Počet kusov
            </label>
            <input
              type="number"
              value={formData.available_count}
              onChange={(e) => handleChange('available_count', e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Platnosť (dni)
            </label>
            <input
              type="number"
              value={formData.validity_days}
              onChange={(e) => handleChange('validity_days', e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {item ? 'Uložiť' : 'Pridať'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Zrušiť
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [services, setServices] = useState([]);
  const [usedVouchers, setUsedVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [voucherFilter, setVoucherFilter] = useState('all'); // all, active, used, expired

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      console.log('Fetching data from API...');
      
      // Fetch orders
      const ordersResponse = await fetch('/api/orders');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log('Orders data:', ordersData);
        setOrders(ordersData);
      }

      // Fetch vouchers  
      const vouchersResponse = await fetch('/api/vouchers');
      if (vouchersResponse.ok) {
        const vouchersData = await vouchersResponse.json();
        console.log('Vouchers data:', vouchersData);
        setVouchers(vouchersData);
      }

      // Fetch services
      const servicesResponse = await fetch('/api/services');
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        console.log('Services data:', servicesData);
        setServices(servicesData);
      }

      // Fetch used vouchers
      const usedVouchersResponse = await fetch('/api/used-vouchers');
      if (usedVouchersResponse.ok) {
        const usedVouchersData = await usedVouchersResponse.json();
        console.log('Used vouchers data:', usedVouchersData);
        setUsedVouchers(usedVouchersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalType === 'voucher') {
        if (editItem) {
          // Update existing voucher
          const response = await fetch(`/api/vouchers/${editItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            const updatedVoucher = await response.json();
            setVouchers(vouchers.map(v => v.id === editItem.id ? updatedVoucher : v));
          }
        } else {
          // Create new voucher
          const response = await fetch('/api/vouchers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            const newVoucher = await response.json();
            setVouchers([...vouchers, newVoucher]);
          }
        }
      } else if (modalType === 'service') {
        if (editItem) {
          // Update existing service
          const response = await fetch(`/api/services/${editItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            const updatedService = await response.json();
            setServices(services.map(s => s.id === editItem.id ? updatedService : s));
          }
        } else {
          // Create new service
          const response = await fetch('/api/services', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            const newService = await response.json();
            setServices([...services, newService]);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    closeModal();
  };

  const deleteItem = async (type, id) => {
    if (confirm('Naozaj chcete odstrániť túto položku?')) {
      try {
        if (type === 'voucher') {
          const response = await fetch(`/api/vouchers/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setVouchers(vouchers.filter(v => v.id !== id));
          }
        } else if (type === 'service') {
          const response = await fetch(`/api/services/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setServices(services.filter(s => s.id !== id));
          }
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const useVoucher = async (voucherCode, amount) => {
    try {
      const response = await fetch(`/api/used-vouchers/use/${voucherCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        const updatedVoucher = await response.json();
        setUsedVouchers(usedVouchers.map(v => 
          v.voucher_code === voucherCode ? updatedVoucher : v
        ));
      }
    } catch (error) {
      console.error('Error using voucher:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Správa poukazov, služieb a objednávok</p>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'orders' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <ShoppingBag size={20} />
              <span className="font-semibold">Objednávky</span>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'vouchers' 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Tag size={20} />
              <span className="font-semibold">Poukazy</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'services' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Gift size={20} />
              <span className="font-semibold">Služby</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'templates' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Tag size={20} />
              <span className="font-semibold">Šablóny PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'usage' 
                  ? 'border-orange-600 text-orange-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <CheckCircle size={20} />
              <span className="font-semibold">Uplatnenie</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Zoznam objednávok</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {orders.filter(o => o.status === 'pending').length} nových
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Žiadne objednávky</p>
                  <p className="text-gray-400">Objednávky sa zobrazujú tu keď sú vytvorené</p>
                </div>
              ) : (
                orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Objednávka #{order.id}
                      </h3>
                      <p className="text-gray-600">{new Date(order.created_at).toLocaleString('sk-SK')}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status === 'pending' ? 'Čaká' : 'Vybavená'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Zákazník</p>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm">{order.customer_email}</p>
                      <p className="text-sm">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Položky</p>
                      {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []).map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.quantity}× {item.item_name} - {item.price}€
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-2xl font-bold text-blue-600">
                      Celkom: {order.total_amount}€
                    </div>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check size={18} />
                        Označiť ako vybavenú
                      </button>
                    )}
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Správa poukazov</h2>
                {/* Filter tlačidlá */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setVoucherFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      voucherFilter === 'all' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Všetky ({vouchers.length})
                  </button>
                  <button
                    onClick={() => setVoucherFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      voucherFilter === 'active' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Aktívne ({vouchers.filter(v => v.status === 'active' && new Date(v.expires_at) >= new Date()).length})
                  </button>
                  <button
                    onClick={() => setVoucherFilter('used')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      voucherFilter === 'used' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Použité ({vouchers.filter(v => v.status === 'used').length})
                  </button>
                  <button
                    onClick={() => setVoucherFilter('expired')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      voucherFilter === 'expired' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Expirované ({vouchers.filter(v => new Date(v.expires_at) < new Date() || v.status === 'expired').length})
                  </button>
                </div>
              </div>
              <button
                onClick={() => openModal('voucher')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Pridať poukaz
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Filtrovanie vouchers podľa vybraného filtra
                let filteredVouchers = vouchers;
                
                if (voucherFilter === 'active') {
                  filteredVouchers = vouchers.filter(v => 
                    v.status === 'active' && new Date(v.expires_at) >= new Date()
                  );
                } else if (voucherFilter === 'used') {
                  filteredVouchers = vouchers.filter(v => v.status === 'used');
                } else if (voucherFilter === 'expired') {
                  filteredVouchers = vouchers.filter(v => 
                    new Date(v.expires_at) < new Date() || v.status === 'expired'
                  );
                }

                return filteredVouchers.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                    <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      {voucherFilter === 'all' ? 'Žiadne poukazy' :
                       voucherFilter === 'active' ? 'Žiadne aktívne poukazy' :
                       voucherFilter === 'used' ? 'Žiadne použité poukazy' :
                       'Žiadne expirované poukazy'}
                    </p>
                    <p className="text-gray-400">
                      {voucherFilter === 'all' ? 'Vytvorte svoj prvý poukaz pomocou tlačidla vyššie' :
                       'Skúste zmeniť filter aby ste videli iné poukazy'}
                    </p>
                  </div>
                ) : (
                  filteredVouchers.map(voucher => {
                    const colorConfig = voucherColors.find(c => c.id === voucher.color) || voucherColors[0];
                    return (
                      <div key={voucher.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`${colorConfig.bg} ${colorConfig.text} rounded-lg p-3`}>
                          <Tag size={24} />
                        </div>
                    <div className="flex gap-2 items-center">
                      {/* Status badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        voucher.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : voucher.status === 'used' 
                            ? 'bg-gray-100 text-gray-800'
                            : voucher.status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}>
                        {voucher.status === 'active' ? 'Aktívny' :
                         voucher.status === 'used' ? 'Použitý' :
                         voucher.status === 'expired' ? 'Expirovaný' :
                         voucher.status || 'Neznámy'}
                      </span>
                      <button
                        onClick={() => openModal('voucher', voucher)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteItem('voucher', voucher.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    €{voucher.amount ? voucher.amount.toFixed(2) : (voucher.value_cents ? (voucher.value_cents / 100).toFixed(2) : '0.00')}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{voucher.code}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash size={16} />
                      <span>Dostupné: {voucher.available_count} ks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={
                        new Date(voucher.expires_at) < new Date() 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      } />
                      <span className={
                        new Date(voucher.expires_at) < new Date() 
                          ? 'text-red-600 font-semibold' 
                          : 'text-gray-600'
                      }>
                        Platnosť do: {new Date(voucher.expires_at).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                    
                    {/* Dodatočné info o stave */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className={`w-3 h-3 rounded-full ${
                        voucher.status === 'active' && new Date(voucher.expires_at) >= new Date()
                          ? 'bg-green-500' 
                          : voucher.status === 'used' 
                            ? 'bg-gray-500'
                            : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {voucher.status === 'active' && new Date(voucher.expires_at) >= new Date()
                          ? 'Pripravený na použitie'
                          : voucher.status === 'used' 
                            ? 'Už bol uplatnený'
                            : 'Nie je platný'}
                      </span>
                    </div>
                  </div>
                  
                  {voucher.qr_code && (
                    <img 
                      src={voucher.qr_code} 
                      alt="QR Code" 
                      className="w-32 h-32 mt-4 mx-auto"
                    />
                  )}
                </div>
              );
            })
          );
        })()}
        </div>
      </div>
)}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Správa služieb</h2>
              <button
                onClick={() => openModal('service')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Pridať službu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('service', service)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteItem('service', service.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600" />
                      <span className="font-bold text-lg">{service.price}€</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-blue-600" />
                      <span>{service.available_count} ks</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar size={16} className="text-purple-600" />
                      <span className="text-sm">Platnosť: {service.validity_days} dní</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Šablóny pre poukazy</h2>
            </div>

            {/* Pridajte konfigurátor poukážok */}
            <VoucherConfigurator />

            {/* Pôvodný grid šablón môžete ponechať alebo odstrániť podľa potreby */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VOUCHER_LAYOUTS.map((layout, index) => {
                const colorTheme = COLOR_THEMES[index % COLOR_THEMES.length];
                return (
                  <div key={layout.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div 
                      className="h-48 flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${colorTheme.background} 0%, ${colorTheme.accent}30 100%)` 
                      }}
                    >
                      <div className="text-center">
                        <Tag size={40} className="mx-auto mb-2" style={{ color: colorTheme.primary }} />
                        <p className="text-sm font-medium" style={{ color: colorTheme.text }}>
                          {layout.name} šablóna
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{layout.name}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Popis:</strong> {layout.description}</p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colorTheme.primary }}
                          ></div>
                          <span className="text-xs">Farba: {colorTheme.name}</span>
                        </div>
                      </div>
                      <button 
                        className="mt-4 w-full py-2 px-4 rounded-lg transition-colors text-white"
                        style={{ 
                          backgroundColor: colorTheme.primary,
                          ':hover': { backgroundColor: colorTheme.secondary }
                        }}
                        onClick={() => {
                          alert(`Šablóna ${layout.name} - ${colorTheme.name} je pripravená na použitie`);
                        }}
                      >
                        Použiť šablónu
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Ako fungujú šablóny?</h3>
              <div className="space-y-2 text-blue-800 text-sm">
                <p>• <strong>Pripravené šablóny:</strong> Použite jednu z pripravených šablón s preddefinovanými pozíciami textu</p>
                <p>• <strong>Vlastné obrázky:</strong> Môžete nahrať vlastné obrázky šablón do priečinka <code>/public/templates/</code></p>
                <p>• <strong>Automatické mapovanie:</strong> Farba poukazu automaticky určuje použitú šablónu</p>
                <p>• <strong>Pevné pozície:</strong> Text sa umiestňuje na vopred definované súradnice pre konzistentný výsledok</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Uplatnenie poukazov</h2>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Použiť poukaz</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Kód poukazu"
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="number"
                  placeholder="Suma na použitie"
                  className="border rounded-lg px-4 py-2"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Použiť
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {usedVouchers.map(voucher => (
                <div key={voucher.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {voucher.voucher_code}
                      </h3>
                      <p className="text-gray-600">{voucher.customer_name}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${
                      voucher.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {voucher.status === 'active' ? 'Aktívny' : 'Použitý'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Pôvodná suma</p>
                      <p className="text-lg font-bold">{voucher.original_amount}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Použité</p>
                      <p className="text-lg font-bold text-red-600">{voucher.used_amount}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Zostatok</p>
                      <p className="text-lg font-bold text-green-600">{voucher.remaining_amount}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Platnosť do</p>
                      <p className="text-sm">{voucher.expiry_date}</p>
                    </div>
                  </div>

                  {voucher.status === 'active' && voucher.remaining_amount > 0 && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="number"
                        placeholder="Suma"
                        className="border rounded-lg px-4 py-2 w-32"
                        max={voucher.remaining_amount}
                      />
                      <button
                        onClick={() => useVoucher(voucher.voucher_code, 10)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                      >
                        Použiť
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          type={modalType}
          item={editItem}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;