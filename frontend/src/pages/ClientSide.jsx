import React, { useState } from 'react';
import { ShoppingCart, Mail, CreditCard, Check, Gift, Store, Download, Plus, Minus, Trash2, MapPin, Phone, Clock } from 'lucide-react';

const GiftCardMarketplace = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState('services');
  const [giftCards, setGiftCards] = useState([]);

  // Company info
  const company = {
    name: 'Serenity Spa & Wellness',
    category: 'Luxusné wellness centrum',
    logo: '🧖',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop',
    description: 'Profesionálne wellness služby pre vašu pohodu a relaxáciu. Ponúkame širokú škálu masáží, kozmetických procedúr a relaxačných balíčkov.',
    address: 'Hlavná 123, Bratislava',
    phone: '+421 912 345 678',
    hours: 'Po-Ne: 9:00 - 21:00'
  };

  // Services
  const services = [
    {
      id: 1,
      name: 'Relaxačná masáž',
      description: 'Celotelovú relaxačná masáž s aromatickými olejmi',
      duration: '60 min',
      price: 50,
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Hĺbková masáž',
      description: 'Terapeutická masáž pre uvoľnenie svalového napätia',
      duration: '75 min',
      price: 65,
      image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Kozmetické ošetrenie',
      description: 'Kompletné čistenie a ošetrenie pleti',
      duration: '90 min',
      price: 75,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop'
    },
    {
      id: 4,
      name: 'Sauna & Jacuzzi',
      description: 'Prístup do wellness zóny na celý deň',
      duration: '4 hodiny',
      price: 40,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop'
    },
    {
      id: 5,
      name: 'VIP Wellness balíček',
      description: 'Masáž + kozmetika + wellness zóna',
      duration: '3 hodiny',
      price: 150,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop'
    },
    {
      id: 6,
      name: 'Thajská masáž',
      description: 'Tradičná thajská masáž pre pružnosť tela',
      duration: '90 min',
      price: 80,
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format&fit=crop'
    }
  ];

  const amounts = [25, 50, 75, 100, 150, 200];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setGiftCards([{
      id: Date.now(),
      recipientName: '',
      recipientEmail: '',
      senderName: '',
      message: '',
      amount: service.price
    }]);
    setStep('personalize');
  };

  const addGiftCard = () => {
    setGiftCards([...giftCards, {
      id: Date.now(),
      recipientName: '',
      recipientEmail: '',
      senderName: '',
      message: '',
      amount: selectedService.price
    }]);
  };

  const removeGiftCard = (id) => {
    if (giftCards.length > 1) {
      setGiftCards(giftCards.filter(card => card.id !== id));
    }
  };

  const updateGiftCard = (id, field, value) => {
    setGiftCards(giftCards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const addToCart = () => {
    const newItems = giftCards.map(card => ({
      ...card,
      service: selectedService,
      cartId: Date.now() + Math.random()
    }));
    setCart([...cart, ...newItems]);
    setSelectedService(null);
    setGiftCards([]);
    setStep('services');
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.amount, 0);
  };

  const generateQRCode = (text) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='white' width='100' height='100'/%3E%3Cg fill='black'%3E%3Crect x='10' y='10' width='5' height='5'/%3E%3Crect x='20' y='10' width='5' height='5'/%3E%3Crect x='30' y='10' width='5' height='5'/%3E%3Crect x='10' y='20' width='5' height='5'/%3E%3Crect x='30' y='20' width='5' height='5'/%3E%3Crect x='10' y='30' width='5' height='5'/%3E%3Crect x='20' y='30' width='5' height='5'/%3E%3Crect x='30' y='30' width='5' height='5'/%3E%3Crect x='65' y='10' width='5' height='5'/%3E%3Crect x='75' y='10' width='5' height='5'/%3E%3Crect x='85' y='10' width='5' height='5'/%3E%3Crect x='65' y='20' width='5' height='5'/%3E%3Crect x='85' y='20' width='5' height='5'/%3E%3Crect x='65' y='30' width='5' height='5'/%3E%3Crect x='75' y='30' width='5' height='5'/%3E%3Crect x='85' y='30' width='5' height='5'/%3E%3Crect x='10' y='65' width='5' height='5'/%3E%3Crect x='20' y='65' width='5' height='5'/%3E%3Crect x='30' y='65' width='5' height='5'/%3E%3Crect x='10' y='75' width='5' height='5'/%3E%3Crect x='30' y='75' width='5' height='5'/%3E%3Crect x='10' y='85' width='5' height='5'/%3E%3Crect x='20' y='85' width='5' height='5'/%3E%3Crect x='30' y='85' width='5' height='5'/%3E%3Crect x='45' y='45' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E`;
  };

  const downloadPDF = async (card) => {
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(139, 115, 85);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(company.name, 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(company.category, 105, 38, { align: 'center' });

    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('DARCEKOVA POUKAZKA', 105, 60, { align: 'center' });

    doc.setFillColor(180, 83, 9);
    doc.rect(20, 70, 170, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('DARCEKOVA SUMA VO VYSKE', 105, 80, { align: 'center' });
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text(`EUR ${card.amount}`, 105, 91, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    doc.setFillColor(245, 245, 245);
    doc.rect(20, 105, 170, 60, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Sluzba:', 25, 115);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(card.service.name, 25, 125);
    doc.text(`Trvanie: ${card.service.duration}`, 25, 133);

    if (card.message) {
      doc.setFont(undefined, 'bold');
      doc.text('Osobny odkaz:', 25, 145);
      doc.setFont(undefined, 'italic');
      const splitMessage = doc.splitTextToSize(`"${card.message}"`, 160);
      doc.text(splitMessage, 25, 153);
    }

    let yPos = 175;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPos, 170, 30, 'FD');
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPos += 10;
    
    if (card.recipientName) {
      doc.setFont(undefined, 'bold');
      doc.text('Pre: ', 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(card.recipientName, 38, yPos);
      yPos += 7;
    }
    
    if (card.senderName) {
      doc.setFont(undefined, 'bold');
      doc.text('Od: ', 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(card.senderName, 38, yPos);
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Ako uplatnit poukazku?', 105, 220, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Predlozte tento voucher pri navsteve alebo uvedte kod pri objednavke', 105, 228, { align: 'center' });

    const voucherCode = `GC-${Date.now().toString().slice(-8)}`;
    doc.setFillColor(180, 83, 9);
    doc.rect(20, 245, 170, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Kod poukazky:', 25, 255);
    doc.setFontSize(12);
    doc.text(voucherCode, 25, 263);
    doc.setFontSize(9);
    doc.text(company.name, 185, 255, { align: 'right' });
    doc.text(company.phone, 185, 263, { align: 'right' });

    doc.save(`Poukazka_${card.recipientName.replace(/\s+/g, '_')}_EUR${card.amount}.pdf`);
  };

  const renderCompanyIntro = () => (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
        <img 
          src={company.coverImage} 
          alt={company.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl md:text-5xl">{company.logo}</span>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">{company.name}</h1>
              <p className="text-sm md:text-base opacity-90">{company.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <p className="text-gray-700 mb-4">{company.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{company.address}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{company.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{company.hours}</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dostupné služby</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map(service => (
            <div 
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            >
              <img 
                src={service.image} 
                alt={service.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{service.duration}</span>
                  <span className="text-lg font-bold text-blue-600">€{service.price}</span>
                </div>
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                  Vybrať službu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white rounded-xl shadow-2xl p-4 border-2 border-blue-500 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Košík ({cart.length})
            </h3>
            <span className="text-xl font-bold text-blue-600">€{getTotalPrice()}</span>
          </div>
          <button
            onClick={() => setStep('checkout')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Prejsť na platbu
          </button>
        </div>
      )}
    </div>
  );

  const renderPersonalize = () => {
    const voucherCode = `GC-${Date.now().toString().slice(-8)}`;
    
    return (
    <div className="space-y-6">
      <button 
        onClick={() => {
          setSelectedService(null);
          setGiftCards([]);
          setStep('services');
        }} 
        className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
      >
        ← Späť na služby
      </button>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800">
          <strong>Vybratá služba:</strong> {selectedService.name} - €{selectedService.price}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Forms */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Prispôsobte darčekové karty</h2>
          
          {giftCards.map((card, index) => (
            <div key={card.id} className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Darčeková karta #{index + 1}</h3>
                {giftCards.length > 1 && (
                  <button
                    onClick={() => removeGiftCard(card.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meno príjemcu *</label>
                <input
                  type="text"
                  value={card.recipientName}
                  onChange={(e) => updateGiftCard(card.id, 'recipientName', e.target.value)}
                  placeholder="Zadajte meno príjemcu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email príjemcu *</label>
                <input
                  type="email"
                  value={card.recipientEmail}
                  onChange={(e) => updateGiftCard(card.id, 'recipientEmail', e.target.value)}
                  placeholder="prijemca@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vaše meno *</label>
                <input
                  type="text"
                  value={card.senderName}
                  onChange={(e) => updateGiftCard(card.id, 'senderName', e.target.value)}
                  placeholder="Vaše meno"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Osobný odkaz</label>
                <textarea
                  value={card.message}
                  onChange={(e) => updateGiftCard(card.id, 'message', e.target.value)}
                  placeholder="Pridajte osobný odkaz..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suma</label>
                <div className="grid grid-cols-3 gap-2">
                  {amounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => updateGiftCard(card.id, 'amount', amount)}
                      className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
                        card.amount === amount
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addGiftCard}
            className="w-full border-2 border-dashed border-blue-400 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Pridať ďalšiu darčekovú kartu
          </button>

          <button
            onClick={addToCart}
            disabled={!giftCards.every(card => card.recipientName && card.recipientEmail && card.senderName)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Pridať do košíka ({giftCards.length})
          </button>
        </div>

        {/* Right: Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Náhľad A4</h3>
          <div 
            className="bg-white shadow-2xl relative overflow-hidden mx-auto"
            style={{ 
              aspectRatio: '210/297',
              maxHeight: '600px',
              maxWidth: '400px'
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 200 280">
                <path d="M20,20 L50,5 L80,20 L80,50 L50,65 L20,50 Z" fill="none" stroke="#8B7355" strokeWidth="0.5"/>
                <path d="M120,20 L150,5 L180,20 L180,50 L150,65 L120,50 Z" fill="none" stroke="#8B7355" strokeWidth="0.5"/>
                <path d="M20,100 L50,85 L80,100 L80,130 L50,145 L20,130 Z" fill="none" stroke="#8B7355" strokeWidth="0.5"/>
                <path d="M120,100 L150,85 L180,100 L180,130 L150,145 L120,130 Z" fill="none" stroke="#8B7355" strokeWidth="0.5"/>
              </svg>
            </div>

            <div className="relative h-full flex flex-col p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{company.logo}</span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-gray-800">{company.name}</h2>
                    <p className="text-xs text-gray-500">{company.category}</p>
                  </div>
                </div>
                <div className="text-3xl">🎁</div>
              </div>

              <div className="text-center mb-4">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-1">DARČEKOVÁ POUKÁŽKA</h1>
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
              </div>

              <div className="bg-amber-700 text-white py-2 px-3 mb-4 text-center">
                <p className="text-xs font-semibold">DARČEKOVÁ SUMA VO VÝŠKE</p>
                <p className="text-2xl md:text-3xl font-bold">€{giftCards[0]?.amount || selectedService.price}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3 flex-grow">
                <h3 className="text-xs font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                  Služba:
                </h3>
                <div className="space-y-1 text-xs text-gray-700">
                  <p className="font-semibold">{selectedService.name}</p>
                  <p className="text-xs text-gray-600">Trvanie: {selectedService.duration}</p>
                  {giftCards[0]?.message && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="font-semibold mb-1">Odkaz:</p>
                      <p className="italic text-xs">"{giftCards[0].message}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-2 mb-3">
                <div className="text-xs space-y-1">
                  {giftCards[0]?.recipientName && (
                    <p><span className="font-semibold">Pre:</span> {giftCards[0].recipientName}</p>
                  )}
                  {giftCards[0]?.senderName && (
                    <p><span className="font-semibold">Od:</span> {giftCards[0].senderName}</p>
                  )}
                </div>
              </div>

              <div className="text-center mb-3">
                <p className="text-xs text-gray-600 mb-1">Ako uplatniť?</p>
                <p className="text-xs text-gray-500">
                  Predložte voucher pri návšteve
                </p>
              </div>

              <div className="bg-amber-700 text-white py-2 px-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold">Kód:</p>
                  <p className="text-xs font-mono">{voucherCode}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                  <img src={generateQRCode(voucherCode)} alt="QR" className="w-full h-full" />
                </div>
                <div className="flex-1 text-right text-xs">
                  <p className="font-semibold text-xs">{company.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderCheckout = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => setStep('services')} 
        className="text-blue-600 hover:underline flex items-center gap-2"
      >
        ← Pokračovať v nákupe
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Váš košík</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.cartId} className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{item.service.name}</h3>
                  <p className="text-sm text-gray-600">{item.service.duration}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Pre: <span className="font-medium">{item.recipientName}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Od: <span className="font-medium">{item.senderName}</span>
                  </p>
                  {item.message && (
                    <p className="text-sm text-gray-600 italic mt-2">"{item.message}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">€{item.amount}</p>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-red-600 hover:text-red-700 mt-2 text-sm"
                  >
                    Odstrániť
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Súhrn objednávky</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Darčekové karty ({cart.length})</span>
                <span className="font-semibold">€{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Poplatok za spracovanie</span>
                <span className="font-semibold">€2.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Spolu</span>
                  <span className="font-bold text-2xl text-blue-600">€{getTotalPrice() + 2}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Číslo karty</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platnosť</label>
                  <input
                    type="text"
                    placeholder="MM/RR"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('success')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Dokončiť nákup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="bg-green-100 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Platba úspešná!</h2>
      
      <p className="text-gray-600">Vaše darčekové karty boli úspešne vytvorené a odoslané príjemcom.</p>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        {cart.map((item, index) => (
          <div key={item.cartId} className="pb-4 border-b last:border-b-0 last:pb-0">
            <div className="flex items-start gap-3 text-left mb-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Darčeková karta #{index + 1} odoslaná na:</p>
                <p className="font-semibold text-gray-800">{item.recipientEmail}</p>
              </div>
            </div>

            <div className="text-left space-y-1 text-sm bg-gray-50 rounded-lg p-3">
              <p><span className="text-gray-600">Služba:</span> <span className="font-medium">{item.service.name}</span></p>
              <p><span className="text-gray-600">Suma:</span> <span className="font-medium">€{item.amount}</span></p>
              <p><span className="text-gray-600">Príjemca:</span> <span className="font-medium">{item.recipientName}</span></p>
              <p><span className="text-gray-600">Od:</span> <span className="font-medium">{item.senderName}</span></p>
            </div>

            <button
              onClick={() => downloadPDF(item)}
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Stiahnuť PDF
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left">
        <p className="text-sm text-blue-800">
          <strong>Potvrdenie:</strong> Konfirmačný email bol odoslaný vám aj všetkým príjemcom!
        </p>
      </div>

      <button
        onClick={() => {
          setStep('services');
          setSelectedService(null);
          setGiftCards([]);
          setCart([]);
        }}
        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
      >
        Vytvoriť ďalšie darčekové karty
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {step === 'services' && renderCompanyIntro()}
        {step === 'personalize' && renderPersonalize()}
        {step === 'checkout' && renderCheckout()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
};

export default GiftCardMarketplace;