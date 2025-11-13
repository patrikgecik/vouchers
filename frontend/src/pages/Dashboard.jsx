import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Package, Gift, Tag, Plus, Edit2, Trash2, 
  Check, X, Calendar, DollarSign, Hash, Clock, CheckCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [services, setServices] = useState([]);
  const [usedVouchers, setUsedVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    setOrders([
      {
        id: 1,
        customer_name: 'Ján Novák',
        customer_email: 'jan.novak@email.sk',
        customer_phone: '+421901234567',
        total_amount: 85,
        status: 'pending',
        created_at: '2024-11-09 10:30:00',
        items: [
          { item_name: 'Poukaz 50 EUR', quantity: 1, price: 50 },
          { item_name: 'Masáž chrbta', quantity: 1, price: 35 }
        ]
      },
      {
        id: 2,
        customer_name: 'Mária Kováčová',
        customer_email: 'maria.kovacova@email.sk',
        customer_phone: '+421902345678',
        total_amount: 100,
        status: 'completed',
        created_at: '2024-11-08 14:20:00',
        items: [
          { item_name: 'Poukaz 100 EUR', quantity: 1, price: 100 }
        ]
      },
      {
        id: 3,
        customer_name: 'Peter Horváth',
        customer_email: 'peter.horvath@email.sk',
        customer_phone: '+421903456789',
        total_amount: 55,
        status: 'pending',
        created_at: '2024-11-09 09:15:00',
        items: [
          { item_name: 'Manikúra', quantity: 1, price: 25 },
          { item_name: 'Strihanie vlasov', quantity: 1, price: 30 }
        ]
      }
    ]);

    setVouchers([
      { id: 1, amount: 20, available_count: 50, validity_days: 365, description: 'Základný poukaz' },
      { id: 2, amount: 50, available_count: 30, validity_days: 365, description: 'Stredný poukaz' },
      { id: 3, amount: 100, available_count: 20, validity_days: 365, description: 'Premium poukaz' }
    ]);

    setServices([
      { id: 1, name: 'Masáž chrbta', price: 35, available_count: 15, validity_days: 180, description: '60 min relaxačná masáž' },
      { id: 2, name: 'Manikúra', price: 25, available_count: 25, validity_days: 90, description: 'Kompletná starostlivosť' },
      { id: 3, name: 'Strihanie vlasov', price: 30, available_count: 40, validity_days: 60, description: 'Strihanie s umytím' },
      { id: 4, name: 'Permanentka fitness', price: 45, available_count: 10, validity_days: 30, description: 'Mesačná permanentka' }
    ]);

    setUsedVouchers([
      { 
        id: 1, 
        voucher_code: 'VOUCH-2024-001', 
        original_amount: 50, 
        remaining_amount: 35, 
        used_amount: 15,
        customer_name: 'Ján Novák',
        issue_date: '2024-10-15',
        expiry_date: '2025-10-15',
        status: 'active'
      },
      { 
        id: 2, 
        voucher_code: 'VOUCH-2024-002', 
        original_amount: 100, 
        remaining_amount: 0, 
        used_amount: 100,
        customer_name: 'Mária Kováčová',
        issue_date: '2024-09-20',
        expiry_date: '2025-09-20',
        status: 'used'
      }
    ]);
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
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

  const handleSubmit = (formData) => {
    if (modalType === 'voucher') {
      if (editItem) {
        setVouchers(vouchers.map(v => v.id === editItem.id ? { ...v, ...formData } : v));
      } else {
        setVouchers([...vouchers, { id: Date.now(), ...formData }]);
      }
    } else if (modalType === 'service') {
      if (editItem) {
        setServices(services.map(s => s.id === editItem.id ? { ...s, ...formData } : s));
      } else {
        setServices([...services, { id: Date.now(), ...formData }]);
      }
    }
    closeModal();
  };

  const deleteItem = (type, id) => {
    if (confirm('Naozaj chcete odstrániť túto položku?')) {
      if (type === 'voucher') {
        setVouchers(vouchers.filter(v => v.id !== id));
      } else if (type === 'service') {
        setServices(services.filter(s => s.id !== id));
      }
    }
  };

  const useVoucher = (voucherCode, amount) => {
    setUsedVouchers(usedVouchers.map(v => {
      if (v.voucher_code === voucherCode) {
        const newRemaining = v.remaining_amount - amount;
        return {
          ...v,
          remaining_amount: Math.max(0, newRemaining),
          used_amount: v.used_amount + amount,
          status: newRemaining <= 0 ? 'used' : 'active'
        };
      }
      return v;
    }));
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
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Objednávka #{order.id}
                      </h3>
                      <p className="text-gray-600">{order.created_at}</p>
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
                      {order.items.map((item, idx) => (
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
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Správa poukazov</h2>
              <button
                onClick={() => openModal('voucher')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Pridať poukaz
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map(voucher => (
                <div key={voucher.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-100 text-purple-600 rounded-lg p-3">
                      <Tag size={24} />
                    </div>
                    <div className="flex gap-2">
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
                    {voucher.amount}€
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash size={16} />
                      <span>Dostupné: {voucher.available_count} ks</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Platnosť: {voucher.validity_days} dní</span>
                    </div>
                  </div>
                </div>
              ))}
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

const Modal = ({ type, item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    item || {
      name: '',
      amount: '',
      price: '',
      description: '',
      available_count: '',
      validity_days: 365
    }
  );

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

export default AdminDashboard;