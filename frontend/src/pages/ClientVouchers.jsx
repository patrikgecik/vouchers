import React, { useState, useEffect } from 'react';
import { ShoppingCart, Mail, CreditCard, Check, Gift, Store, Download, Plus, Minus, Trash2, MapPin, Phone, Clock } from 'lucide-react';
import { generateVoucherWithTemplate } from '../utils/pdfGenerator.js';
import { generateVoucherHTML } from '../config/voucherTemplatesConfig.js';
import { validatePaymentData, formatCardNumber, getCardType } from '../utils/cardValidation.js';
import VoucherCustomizer from './VoucherCustomizer.jsx';
import { fetchCompanyProfile } from '../utils/coreApi.js';

const FALLBACK_COVER_IMAGE = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop';

const ClientVoucherMarketplace = ({ companySlug }) => {
  // Updated for customizer system
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState('type');
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucherType, setVoucherType] = useState('service'); // 'service' alebo 'amount'
  const [customAmount, setCustomAmount] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState('');
  
  useEffect(() => {
    if (!companySlug) {
      setCompany(null);
      setCompanyError('Chýba identifikátor firmy v URL (napr. /client/moj-salon).');
      setCompanyLoading(false);
      return;
    }

    let isMounted = true;

    const loadCompany = async () => {
      try {
        setCompanyLoading(true);
        setCompanyError('');
        setCompany(null);
        const profile = await fetchCompanyProfile(companySlug);
        if (!isMounted) return;

        const settings = profile?.settings || {};
        const branding = settings.branding || {};
        const combinedAddress = profile.address || [profile.city, profile.country].filter(Boolean).join(', ');

        setCompany({
          id: profile.id,
          slug: profile.slug,
          name: profile.name,
          email: profile.email,
          category: profile.category || settings.category || 'Klientska zóna',
          logo: branding.emojiLogo || branding.logoEmoji || '🏷️',
          logoUrl: profile.logoUrl || branding.logoUrl || null,
          coverImage: profile.coverImage || branding.coverImage || branding.heroImage || FALLBACK_COVER_IMAGE,
          description: profile.description || settings.description || '',
          address: combinedAddress,
          phone: profile.phone || settings.contactPhone || '',
          hours: profile.hours || settings.businessHours?.text || 'Podľa dohody'
        });
      } catch (error) {
        if (!isMounted) return;
        setCompany(null);
        setCompanyError(error.message || 'Nepodarilo sa načítať údaje o firme.');
      } finally {
        if (isMounted) {
          setCompanyLoading(false);
        }
      }
    };

    loadCompany();

    return () => {
      isMounted = false;
    };
  }, [companySlug]);
  
  // Template customization
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateConfig, setTemplateConfig] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Available voucher colors (same as in Dashboard)
  const voucherColors = [
    { id: 'blue', name: 'Modrá', bg: 'bg-blue-500', text: 'text-white', preview: '#3B82F6', accent: 'border-blue-500 text-blue-600' },
    { id: 'green', name: 'Zelená', bg: 'bg-green-500', text: 'text-white', preview: '#10B981', accent: 'border-green-500 text-green-600' },
    { id: 'purple', name: 'Fialová', bg: 'bg-purple-500', text: 'text-white', preview: '#8B5CF6', accent: 'border-purple-500 text-purple-600' },
    { id: 'pink', name: 'Ružová', bg: 'bg-pink-500', text: 'text-white', preview: '#EC4899', accent: 'border-pink-500 text-pink-600' },
    { id: 'amber', name: 'Oranžová', bg: 'bg-amber-500', text: 'text-white', preview: '#F59E0B', accent: 'border-amber-500 text-amber-600' },
    { id: 'teal', name: 'Tyrkysová', bg: 'bg-teal-500', text: 'text-white', preview: '#14B8A6', accent: 'border-teal-500 text-teal-600' },
    { id: 'red', name: 'Červená', bg: 'bg-red-500', text: 'text-white', preview: '#EF4444', accent: 'border-red-500 text-red-600' },
    { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', text: 'text-white', preview: '#6366F1', accent: 'border-indigo-500 text-indigo-600' }
  ];

  // Fetch vouchers from API
  useEffect(() => {
    if (!companySlug) return;
    fetchVouchers(companySlug);
  }, [companySlug]);

  // Available amounts for vouchers
  const amounts = [25, 50, 75, 100, 150, 200];

  // Function to get voucher image based on price
  const getVoucherImage = (price) => {
    if (price <= 25) {
      return 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&auto=format&fit=crop';
    } else if (price <= 50) {
      return 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&auto=format&fit=crop';
    } else if (price <= 100) {
      return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop';
    } else if (price <= 150) {
      return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop';
    } else {
      return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop';
    }
  };

  const fetchVouchers = async (slug) => {
    try {
      setLoading(true);
      const queryParam = slug ? `?company=${encodeURIComponent(slug)}` : '';
      const response = await fetch(`/api/vouchers${queryParam}`);
      const data = await response.json();
      
      // Transform API data to match frontend structure
      const transformedVouchers = data.map(voucher => {
        const price = voucher.amount || (voucher.value_cents ? voucher.value_cents / 100 : 0);
        const expiryDate = voucher.expires_at ? new Date(voucher.expires_at) : null;
        const isExpired = expiryDate && expiryDate < new Date();
        
        return {
          id: voucher.id,
          name: `Poukážka €${price.toFixed(2)}`,
          description: voucher.status || `Všeobecná poukážka v hodnote €${price.toFixed(2)}`,
          price: price,
          duration: expiryDate ? 
            (isExpired ? 
              `Expirovala ${expiryDate.toLocaleDateString('sk-SK')}` : 
              `Platná do ${expiryDate.toLocaleDateString('sk-SK')}`
            ) : 'Bez časového obmedzenia',
          image: getVoucherImage(price),
          qr_code: voucher.qr_code,
          status: voucher.status,
          expires_at: voucher.expires_at,
          isExpired: isExpired,
          isAvailable: voucher.status === 'active' && !isExpired,
          color: voucher.color || 'blue' // Default to blue if no color specified
        };
      });
      
      setVouchers(transformedVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherSelect = (voucher) => {
    setSelectedVoucher(voucher);
    setPurchaseDetails([{
      id: Date.now(),
      recipientName: '',
      recipientEmail: '',
      senderName: '',
      message: '',
      amount: amounts[0] // Default to first amount (25)
    }]);
    setStep('personalize');
  };

  const addPurchaseDetail = () => {
    setPurchaseDetails([...purchaseDetails, {
      id: Date.now(),
      recipientName: '',
      recipientEmail: '',
      senderName: '',
      message: '',
      amount: amounts[0] // Default to first amount (25)
    }]);
  };

  const removePurchaseDetail = (id) => {
    if (purchaseDetails.length > 1) {
      setPurchaseDetails(purchaseDetails.filter(detail => detail.id !== id));
    }
  };

  const updatePurchaseDetail = (id, field, value) => {
    setPurchaseDetails(purchaseDetails.map(detail => 
      detail.id === id ? { ...detail, [field]: value } : detail
    ));
  };

  const validatePurchaseDetails = () => {
    const errors = [];
    
    purchaseDetails.forEach((detail, index) => {
      if (!detail.recipientName.trim()) {
        errors.push(`Poukážka ${index + 1}: Zadajte meno príjemcu`);
      }
      if (!detail.recipientEmail.trim()) {
        errors.push(`Poukážka ${index + 1}: Zadajte email príjemcu`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detail.recipientEmail)) {
        errors.push(`Poukážka ${index + 1}: Zadajte platný email`);
      }
      if (!detail.senderName.trim()) {
        errors.push(`Poukážka ${index + 1}: Zadajte vaše meno`);
      }
    });
    
    return errors;
  };

  const addToCart = () => {
    const errors = validatePurchaseDetails();
    
    if (errors.length > 0) {
      alert('Prosím opravte tieto chyby:\n\n' + errors.join('\n'));
      return;
    }

    const newItems = purchaseDetails.map(detail => ({
      ...detail,
      voucher: selectedVoucher,
      cartId: Date.now() + Math.random()
    }));
    setCart([...cart, ...newItems]);
    setSelectedVoucher(null);
    setPurchaseDetails([]);
    setStep('services');
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.amount, 0);
  };

  const createVoucherPurchase = async () => {
    // Simple validation for payment form
    const cardNumber = document.querySelector('input[placeholder="1234 5678 9012 3456"]')?.value;
    const expiry = document.querySelector('input[placeholder="MM/RR"]')?.value;
    const cvv = document.querySelector('input[placeholder="123"]')?.value;
    
    if (!cardNumber || !expiry || !cvv) {
      alert('Prosím vyplňte všetky platobné údaje');
      return;
    }
    
    try {
      // Here you would integrate with your payment system
      // For now, we'll simulate a successful purchase
      const promises = cart.map(async (item) => {
        const response = await fetch('/api/vouchers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: item.amount,
            description: `Voucher pre ${item.recipientName} od ${item.senderName}`,
            validity_days: 365
          }),
        });
        return response.json();
      });

      await Promise.all(promises);
      setStep('success');
    } catch (error) {
      console.error('Error creating voucher purchase:', error);
      alert('Chyba pri vytváraní objednávky. Skúste to znovu.');
    }
  };

  // Handler pre zmenu template customization
  const handleTemplateChange = (template, config) => {
    setCurrentTemplate(template);
    setTemplateConfig(config);
  };

  const downloadPDF = async (item) => {
    try {
      console.log('🚀 Starting PDF generation with custom template...');
      
      // Príprava dát pre PDF
      const voucherData = {
        amount: item.amount,
        customerName: item.recipientName || 'Darčeková poukážka',
        serviceName: item.voucher?.name || 'Služba',
        code: `VC-${Date.now().toString().slice(-8)}`,
        expiresAt: item.voucher?.expires_at ? 
          new Date(item.voucher.expires_at).toLocaleDateString('sk-SK') : 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('sk-SK'),
        message: item.message,
        companyName: company.name,
        companyInfo: `${company.phone} | ${company.email || 'info@company.sk'}`
      };

      // Použiť custom template ak existuje, inak predvolený
      let templateHtml;
      if (currentTemplate && typeof currentTemplate === 'string') {
        console.log('📄 Using custom template');
        templateHtml = currentTemplate;
      } else {
        console.log('📄 Generating default template');
        // Predvolený template s konfiguráciou spoločnosti
        const defaultConfig = {
          formatId: 'a4-portrait',
          colorThemeId: 'blue',
          layoutId: 'modern',
          companyName: company.name,
          title: 'DARČEKOVÁ POUKÁŽKA',
          logo: null,
          icon: '🎁',
          showDecorations: true,
          showQR: true,
          footerInfo: `${company.address} | ${company.phone}`,
        };
        
        try {
          templateHtml = generateVoucherHTML(defaultConfig);
          console.log('📄 Template generated successfully');
        } catch (templateError) {
          console.error('❌ Error generating template:', templateError);
          // Fallback na jednoduchý HTML template
          templateHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .voucher { border: 2px solid #333; padding: 20px; text-align: center; }
                .amount { font-size: 24px; font-weight: bold; color: #0066cc; }
              </style>
            </head>
            <body>
              <div class="voucher">
                <h1>{{companyName}}</h1>
                <h2>DARČEKOVÁ POUKÁŽKA</h2>
                <div class="amount">€{{amount}}</div>
                <p><strong>Pre:</strong> {{customerName}}</p>
                <p><strong>Služba:</strong> {{serviceName}}</p>
                <p><strong>Kód:</strong> {{code}}</p>
                <p><strong>Platné do:</strong> {{expiresAt}}</p>
                <p>{{message}}</p>
            </body>
            </html>
          `;
        }
      }

      if (!templateHtml) {
        throw new Error('Template HTML is undefined or empty');
      }

      console.log('📄 Generating PDF for template:', templateHtml ? 'defined' : 'undefined');
      await generateVoucherWithTemplate(templateHtml, voucherData);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Chyba pri generovaní PDF. Skúste to znovu.');
    }
  };

  // Výber typu poukazu
  const renderVoucherTypeSelection = () => (
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
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-14 w-14 object-contain" />
            ) : (
              <span className="text-4xl md:text-5xl">{company.logo}</span>
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">{company.name}</h1>
              <p className="text-sm md:text-base opacity-90">{company.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Výber typu poukazu */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Aký typ poukazu chcete?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poukaz na konkrétnu službu */}
          <div 
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              voucherType === 'service' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setVoucherType('service')}
          >
            <div className="text-center">
              <Gift className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Poukaz na službu</h3>
              <p className="text-gray-600 text-sm">
                Vyberte konkrétnu službu ktorú chcete darovať. 
                Cena je už stanovená podľa služby.
              </p>
            </div>
          </div>

          {/* Poukaz v hodnote */}
          <div 
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              voucherType === 'amount' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setVoucherType('amount')}
          >
            <div className="text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Poukaz v hodnote</h3>
              <p className="text-gray-600 text-sm">
                Zadajte vlastnú sumu. Obdarovaný si môže vybrať 
                ľubovoľnú službu v rámci hodnoty poukazu.
              </p>
            </div>
          </div>
        </div>

        {/* Ak je vybraný poukaz v hodnote, zobrazíme pole pre sumu */}
        {voucherType === 'amount' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hodnota poukazu (€)
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Zadajte sumu napr. 50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="10"
              step="5"
            />
            <p className="text-xs text-gray-500 mt-1">Minimálna suma je 10€</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (voucherType === 'service') {
                setStep('services');
              } else if (voucherType === 'amount' && customAmount >= 10) {
                // Vytvoríme virtuálnu službu s custom sumou
                setSelectedVoucher({
                  id: 'custom',
                  name: `Poukaz v hodnote €${customAmount}`,
                  description: 'Vlastná hodnota poukazu',
                  price: parseFloat(customAmount),
                  duration: 'Podľa výberu',
                  color: 'blue'
                });
                setStep('details');
              }
            }}
            disabled={voucherType === 'amount' && (!customAmount || customAmount < 10)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {voucherType === 'service' ? 'Vybrať službu' : 'Pokračovať s týmto poukazom'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderVoucherGrid = () => (
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
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-14 w-14 object-contain" />
            ) : (
              <span className="text-4xl md:text-5xl">{company.logo}</span>
            )}
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

      {/* Vouchers Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {loading ? 'Načítavam poukážky...' : 
           vouchers.filter(voucher => voucher.isAvailable).length > 0 ? 'Dostupné poukážky' :
           'Momentálne nie sú dostupné žiadne poukážky'
          }
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Načítavam poukážky...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Momentálne nie sú dostupné žiadne poukážky.</p>
          </div>
        ) : (
          <div>
            {/* Available Vouchers */}
            {vouchers.filter(voucher => voucher.isAvailable).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {vouchers.filter(voucher => voucher.isAvailable).map(voucher => {
                  const colorConfig = voucherColors.find(c => c.id === voucher.color) || voucherColors[0];
                  return (
                  <div 
                    key={voucher.id}
                    onClick={() => handleVoucherSelect(voucher)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                  >
                    <img 
                      src={voucher.image} 
                      alt={voucher.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{voucher.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorConfig.accent.replace('text-', 'bg-').replace('-600', '-100')} ${colorConfig.accent}`}>
                          Dostupné
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{voucher.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-gray-500">{voucher.duration}</span>
                        <span className={`text-xl font-bold ${colorConfig.accent.split(' ')[1]}`}>€{voucher.price.toFixed(2)}</span>
                      </div>
                      <button className={`w-full py-2 rounded-lg hover:opacity-90 transition text-sm font-semibold ${colorConfig.bg} ${colorConfig.text}`}>
                        Vybrať poukážku
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Unavailable Vouchers */}
            {vouchers.filter(voucher => !voucher.isAvailable).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-600 mb-4">Momentálne nedostupné</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {vouchers.filter(voucher => !voucher.isAvailable).map(voucher => (
                    <div 
                      key={voucher.id}
                      className="bg-gray-100 rounded-xl shadow-md overflow-hidden opacity-60"
                    >
                      <img 
                        src={voucher.image} 
                        alt={voucher.name}
                        className="w-full h-40 object-cover filter grayscale"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-600">{voucher.name}</h3>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            {voucher.isExpired ? 'Expirované' : 'Neaktívne'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{voucher.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-gray-400">{voucher.duration}</span>
                          <span className="text-xl font-bold text-gray-500">€{voucher.price.toFixed(2)}</span>
                        </div>
                        <button 
                          disabled
                          className="w-full bg-gray-400 text-white py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
                        >
                          Nedostupné
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white rounded-xl shadow-2xl p-4 border-2 border-blue-500 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Košík ({cart.length})
            </h3>
            <span className="text-xl font-bold text-blue-600">€{getTotalPrice().toFixed(2)}</span>
          </div>
          <button
            onClick={() => {
              setHasSubmitted(true);
              
              // Validácia všetkých polí
              const allValid = purchaseDetails.every(detail => 
                detail.recipientName.trim() && 
                detail.recipientEmail.trim() && 
                /\S+@\S+\.\S+/.test(detail.recipientEmail) &&
                detail.senderName.trim()
              );
              
              if (allValid) {
                setStep('checkout');
              }
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Prejsť na platbu
          </button>
        </div>
      )}
    </div>
  );

  const VoucherPreview = ({ template, customerName, amount, serviceName, voucherType }) => {
    const voucherCode = `VC-${Date.now().toString().slice(-8)}`;
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('sk-SK');
    
    return (
      <div className="sticky top-4">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Náhľad poukážky
            </h3>
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🎨 Prispôsobiť
            </button>
          </div>
          
          {/* Statický náhľad namiesto iframe */}
          <div 
            className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
            style={{ aspectRatio: '210/297', maxHeight: '400px' }}
          >
            <div className="h-full flex flex-col p-4 text-xs">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="h-8 w-8 object-contain rounded-full" />
                  ) : (
                    <span className="text-lg">{company.logo}</span>
                  )}
                  <div>
                    <h2 className="text-xs font-bold text-gray-800">{company.name}</h2>
                    <p className="text-xs text-gray-500">{company.category}</p>
                  </div>
                </div>
                <div className="text-2xl">🎁</div>
              </div>

              {/* Title */}
              <div className="text-center mb-3">
                <h1 className="text-sm font-bold text-gray-800 mb-1">DARČEKOVÁ POUKÁŽKA</h1>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
              </div>

              {/* Amount */}
              <div className="bg-blue-600 text-white py-2 px-3 mb-3 text-center rounded">
                <p className="text-xs font-semibold">HODNOTA</p>
                <p className="text-lg font-bold">€{amount || '0.00'}</p>
              </div>

              {/* Service Info */}
              <div className="bg-gray-50 rounded p-2 mb-2 flex-1">
                <h3 className="text-xs font-bold text-gray-800 mb-1">Služba:</h3>
                <p className="text-xs font-semibold">{serviceName || 'Všeobecná poukážka'}</p>
                <p className="text-xs text-gray-600 mt-1">Platnosť: {expiryDate}</p>
              </div>

              {/* Recipient Info */}
              <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                <div className="text-xs">
                  {customerName && (
                    <p><span className="font-semibold">Pre:</span> {customerName}</p>
                  )}
                  <p><span className="font-semibold">Kód:</span> {voucherCode}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-blue-600 text-white py-1 px-2 text-center rounded mt-auto">
                <p className="text-xs">{company.name}</p>
                <p className="text-xs">{company.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            {templateConfig ? `Vlastná šablóna` : 'Predvolená šablóna'}
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalize = () => {
    const voucherCode = `VC-${Date.now().toString().slice(-8)}`;
    
    const displayAmount = voucherType === 'service' ? (selectedVoucher?.price ? selectedVoucher.price.toFixed(2) : '0.00') : (purchaseDetails[0]?.amount || amounts[0]);
    
    return (
      <div className="space-y-6">
        <button 
          onClick={() => {
            setSelectedVoucher(null);
            setPurchaseDetails([]);
            setStep('services');
          }} 
          className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
        >
          ← Späť na poukážky
        </button>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="text-sm text-blue-800">
            <p><strong>Vybratá služba:</strong> {selectedVoucher?.name}</p>
            <p><strong>Platnosť:</strong> {selectedVoucher?.duration}</p>
            {selectedVoucher?.description && (
              <p><strong>Popis:</strong> {selectedVoucher?.description}</p>
            )}
            <p className="mt-2 text-xs">💡 Môžete vybrať vlastnú sumu pre darčekové poukážky nižšie</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Prispôsobte poukážky</h2>
            {purchaseDetails.map((detail, index) => (
              <div key={detail.id} className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Poukážka #{index + 1}</h3>
                  {purchaseDetails.length > 1 && (
                    <button
                      onClick={() => removePurchaseDetail(detail.id)}
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
                    value={detail.recipientName}
                    onChange={(e) => updatePurchaseDetail(detail.id, 'recipientName', e.target.value)}
                    placeholder="Zadajte meno príjemcu"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      hasSubmitted && !detail.recipientName.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {hasSubmitted && !detail.recipientName.trim() && (
                    <p className="text-red-500 text-xs mt-1">Toto pole je povinné</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email príjemcu *</label>
                  <input
                    type="email"
                    value={detail.recipientEmail}
                    onChange={(e) => updatePurchaseDetail(detail.id, 'recipientEmail', e.target.value)}
                    placeholder="prijemca@email.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      hasSubmitted && (!detail.recipientEmail.trim() || !/\S+@\S+\.\S+/.test(detail.recipientEmail)) 
                        ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {hasSubmitted && !detail.recipientEmail.trim() && (
                    <p className="text-red-500 text-xs mt-1">Toto pole je povinné</p>
                  )}
                  {hasSubmitted && detail.recipientEmail.trim() && !/\S+@\S+\.\S+/.test(detail.recipientEmail) && (
                    <p className="text-red-500 text-xs mt-1">Neplatný formát emailu</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vaše meno *</label>
                  <input
                    type="text"
                    value={detail.senderName}
                    onChange={(e) => updatePurchaseDetail(detail.id, 'senderName', e.target.value)}
                    placeholder="Vaše meno"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !detail.senderName.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {!detail.senderName.trim() && (
                    <p className="text-red-500 text-xs mt-1">Toto pole je povinné</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Osobný odkaz</label>
                  <textarea
                    value={detail.message}
                    onChange={(e) => updatePurchaseDetail(detail.id, 'message', e.target.value)}
                    placeholder="Pridajte osobný odkaz..."
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Zobrazíme výber sumy LEN pre poukazy v hodnote */}
                {voucherType === 'amount' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suma</label>
                    <div className="grid grid-cols-3 gap-2">
                      {amounts.map(amount => (
                        <button
                          key={amount}
                          onClick={() => updatePurchaseDetail(detail.id, 'amount', amount)}
                          className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
                            detail.amount === amount
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          €{amount}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex flex-col gap-6">
                      <button 
                        onClick={() => {
                          setSelectedVoucher(null);
                          setPurchaseDetails([]);
                          setStep('services');
                        }} 
                        className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
                      >
                        ← Späť na poukážky
                      </button>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div className="text-sm text-blue-800">
                          <p><strong>Vybratá služba:</strong> {selectedVoucher?.name}</p>
                          <p><strong>Platnosť:</strong> {selectedVoucher?.duration}</p>
                          {selectedVoucher?.description && (
                            <p><strong>Popis:</strong> {selectedVoucher?.description}</p>
                          )}
                          <p className="mt-2 text-xs">💡 Môžete vybrať vlastnú sumu pre darčekové poukážky nižšie</p>
                        </div>
                      </div>

                      {/* Formulár na personalizáciu */}
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Prispôsobte poukážky</h2>
                        {purchaseDetails.map((detail, index) => (
                          <div key={detail.id} className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4">
                            {/* ...form fields... */}
                          </div>
                        ))}

                        <button
                          onClick={addPurchaseDetail}
                          className="w-full border-2 border-dashed border-blue-400 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Pridať ďalšiu darčekovú kartu
                        </button>

                        <button
                          onClick={() => {
                            setSelectedVoucher(null);
                            setPurchaseDetails([]);
                            setStep('services');
                          }}
                          className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                          Vybrať inú poukážku
                        </button>

                        <button
                          onClick={addToCart}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Pridať do košíka ({purchaseDetails.length} {purchaseDetails.length === 1 ? 'karta' : 'karty'})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Pravý náhľad poukážky */}
          <div className="lg:sticky lg:top-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Náhľad poukážky</h3>
            <div 
              className="bg-white shadow-2xl relative mx-auto border-2 border-gray-200 rounded-lg overflow-hidden"
              style={{ aspectRatio: '210/297', maxHeight: '450px', maxWidth: '320px' }}
            >
              <div className="h-full flex flex-col p-3 text-xs">
                {/* Service Info */}
                <div className="bg-gray-50 rounded p-2 mb-2 flex-1">
                  <h3 className="text-xs font-bold text-gray-800 mb-1">Služba:</h3>
                  <p className="text-xs font-semibold">{selectedVoucher?.name}</p>
                  <p className="text-xs text-gray-600">{selectedVoucher?.duration}</p>
                  {purchaseDetails[0]?.message && (
                    <div className="mt-2 pt-1 border-t border-gray-300">
                      <p className="text-xs font-semibold mb-1">Odkaz:</p>
                      <p className="text-xs italic">"{purchaseDetails[0].message}"</p>
                    </div>
                  )}
                </div>

                {/* Recipient Info */}
                <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                  <div className="text-xs space-y-1">
                    {purchaseDetails[0]?.recipientName && (
                      <p><span className="font-semibold">Pre:</span> {purchaseDetails[0].recipientName}</p>
                    )}
                    {purchaseDetails[0]?.senderName && (
                      <p><span className="font-semibold">Od:</span> {purchaseDetails[0].senderName}</p>
                    )}
                    <p><span className="font-semibold">Kód:</span> {voucherCode}</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-600">Predložte voucher pri návšteve</p>
                </div>

                {/* Footer */}
                <div className="bg-amber-600 text-white py-1 px-2 text-center rounded mt-auto">
                  <p className="text-xs font-semibold">{company.name}</p>
                  <p className="text-xs">{company.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Customizer - zobrazí sa nad náhľadom vpravo */}
        {showCustomizer && (
          <VoucherCustomizer 
            onTemplateChange={handleTemplateChange}
            initialConfig={{
              companyName: company.name,
              footerInfo: `${company.address} | ${company.phone}`,
            }}
          />
        )}
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
                  <h3 className="font-bold text-gray-800 text-lg">{item.voucher.name}</h3>
                  <p className="text-sm text-gray-600">{item.voucher.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.voucher.duration}</p>
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
                  <p className="text-xl font-bold text-blue-600">€{item.amount.toFixed(2)}</p>
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
                <span>Poukážky ({cart.length})</span>
                <span className="font-semibold">€{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Poplatok za spracovanie</span>
                <span className="font-semibold">€2.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Spolu</span>
                  <span className="font-bold text-2xl text-blue-600">€{(getTotalPrice() + 2).toFixed(2)}</span>
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
              onClick={createVoucherPurchase}
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
      
      <p className="text-gray-600">Vaše poukážky boli úspešne vytvorené a odoslané príjemcom.</p>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        {cart.map((item, index) => (
          <div key={item.cartId} className="pb-4 border-b last:border-b-0 last:pb-0">
            <div className="flex items-start gap-3 text-left mb-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Poukážka #{index + 1} odoslaná na:</p>
                <p className="font-semibold text-gray-800">{item.recipientEmail}</p>
              </div>
            </div>

            <div className="text-left space-y-1 text-sm bg-gray-50 rounded-lg p-3">
              <p><span className="text-gray-600">Poukážka:</span> <span className="font-medium">{item.voucher.name}</span></p>
              <p><span className="text-gray-600">Suma:</span> <span className="font-medium">€{item.amount.toFixed(2)}</span></p>
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
          setSelectedVoucher(null);
          setPurchaseDetails([]);
          setCart([]);
        }}
        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
      >
        Vytvoriť ďalšie poukážky
      </button>
    </div>
  );

  if (!companySlug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white p-6 rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold mb-3 text-gray-900">Chýba identifikátor firmy</h1>
          <p className="text-gray-600">
            Otvorte túto stránku cez adresu v tvare <code>/client/&lt;slug-firmy&gt;</code>, napríklad{' '}
            <code>/client/moj-salon</code>.
          </p>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white p-6 rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold mb-3 text-gray-900">Nenašla sa firma</h1>
          <p className="text-gray-600 mb-4">{companyError}</p>
          <p className="text-sm text-gray-500">Skontrolujte identifikátor v URL alebo kontaktujte podporu.</p>
        </div>
      </div>
    );
  }

  if (companyLoading || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam údaje o firme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation - zobrazí sa len ak nie je success */}
        {step !== 'success' && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${step === 'type' || step === 'services' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'type' || step === 'services' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Výber</span>
                </div>
                <div className={`w-8 h-1 ${step === 'personalize' || step === 'checkout' || step === 'success' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step === 'personalize' || step === 'checkout' || step === 'success' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'personalize' || step === 'checkout' || step === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Údaje</span>
                </div>
                <div className={`w-8 h-1 ${step === 'checkout' || step === 'success' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step === 'checkout' || step === 'success' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'checkout' || step === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Platba</span>
                </div>
              </div>
              
              {step !== 'type' && step !== 'services' && (
                <button
                  onClick={() => {
                    if (step === 'personalize') {
                      setStep(voucherType === 'service' ? 'services' : 'type');
                    } else if (step === 'checkout') {
                      setStep('personalize');
                    }
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Späť
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {step === 'type' && renderVoucherTypeSelection()}
        {step === 'services' && renderVoucherGrid()}
        {step === 'personalize' && renderPersonalize()}
        {step === 'checkout' && renderCheckout()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
};

export default ClientVoucherMarketplace;
