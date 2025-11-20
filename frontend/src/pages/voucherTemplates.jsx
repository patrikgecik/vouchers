// VoucherConfigurator.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Eye, Download, Palette, Layout, Type, ImagePlus, Settings } from 'lucide-react';
import {
  VOUCHER_FORMATS,
  COLOR_THEMES,
  VOUCHER_LAYOUTS,
  LAYOUT_CATEGORIES,
  generateVoucherHTML,
  fillVoucherData
} from '../config/voucherTemplatesConfig';

const VoucherConfigurator = () => {
  const [activeTab, setActiveTab] = useState('layout');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [config, setConfig] = useState({
    layoutId: 'modern-gradient',
    formatId: 'a4-portrait',
    colorThemeId: 'blue-ocean',
    title: 'DARČEKOVÁ POUKÁŽKA',
    companyName: 'Vaša firma s.r.o.',
    logo: null,
    icon: '🎁',
    footerInfo: 'Poukážku možno uplatniť v našich prevádzkach. Neplatí na akciové ponuky.',
    showDecorations: true,
    showQR: true,
    font: 'Segoe UI'
  });

  const [previewData, setPreviewData] = useState({
    amount: '50',
    serviceName: 'Relaxačná masáž 60 min',
    customerName: 'Jana Nováková',
    code: 'GIFT-2024-A3B7',
    expiresAt: '31.12.2025'
  });

  // --- ADD THIS: update preview HTML when config changes ---
  const [htmlPreview, setHtmlPreview] = useState('');
  useEffect(() => {
    setHtmlPreview(fillVoucherData(generateVoucherHTML(config), previewData));
  }, [config, previewData]);
  // --------------------------------------------------------

  const filteredLayouts = selectedCategory === 'all' 
    ? VOUCHER_LAYOUTS 
    : VOUCHER_LAYOUTS.filter(l => l.category === selectedCategory);

  const selectedLayout = VOUCHER_LAYOUTS.find(l => l.id === config.layoutId);
  const selectedFormat = VOUCHER_FORMATS.find(f => f.id === config.formatId);
  const selectedColors = COLOR_THEMES.find(c => c.id === config.colorThemeId);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = () => {
    const template = generateVoucherHTML(config);
    const filledTemplate = fillVoucherData(template, previewData);
    
    // Tu by ste mohli použiť knižnicu ako html2pdf alebo poslať na backend
    console.log('Generovanie PDF...', filledTemplate);
    alert('Funkcia generovania PDF bude implementovaná s html2pdf knižnicou');
  };

  const tabs = [
    { id: 'layout', name: 'Dizajn', icon: <Layout className="w-4 h-4" /> },
    { id: 'colors', name: 'Farby', icon: <Palette className="w-4 h-4" /> },
    { id: 'format', name: 'Formát', icon: <Type className="w-4 h-4" /> },
    { id: 'content', name: 'Obsah', icon: <Settings className="w-4 h-4" /> },
    { id: 'branding', name: 'Logo', icon: <ImagePlus className="w-4 h-4" /> }
  ];

  // Add a mapping for layout-specific styles
  const layoutStyles = {
    'modern-gradient': {
      borderLeft: `8px solid ${selectedColors?.primary}`,
      background: `linear-gradient(135deg, ${selectedColors?.primary} 0%, ${selectedColors?.accent} 100%)`,
      boxShadow: '0 4px 32px 0 rgba(59,130,246,0.12)'
    },
    'classic-elegant': {
      borderLeft: `8px solid ${selectedColors?.secondary}`,
      background: '#fffbe6',
      boxShadow: '0 2px 16px 0 rgba(220, 180, 120, 0.12)'
    },
    'minimalist-clean': {
      borderLeft: `8px solid #e5e7eb`,
      background: '#fff',
      boxShadow: 'none'
    },
    'luxury-premium': {
      borderLeft: `8px solid gold`,
      background: 'linear-gradient(135deg, #fbbf24 0%, #fffbe6 100%)',
      boxShadow: '0 4px 32px 0 rgba(251,191,36,0.12)'
    },
    'playful-fun': {
      borderLeft: `8px solid ${selectedColors?.accent}`,
      background: 'linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)',
      boxShadow: '0 4px 32px 0 rgba(244,63,94,0.12)'
    },
    'geometric-modern': {
      borderLeft: `8px solid ${selectedColors?.primary}`,
      background: 'repeating-linear-gradient(45deg, #e0e7ff, #e0e7ff 10px, #fff 10px, #fff 20px)',
      boxShadow: '0 4px 32px 0 rgba(59,130,246,0.12)'
    },
    'botanical-natural': {
      borderLeft: `8px solid #16a34a`,
      background: 'linear-gradient(135deg, #bbf7d0 0%, #f0fdf4 100%)',
      boxShadow: '0 4px 32px 0 rgba(22,163,74,0.12)'
    },
    'corporate-professional': {
      borderLeft: `8px solid #334155`,
      background: '#f8fafc',
      boxShadow: '0 4px 32px 0 rgba(51,65,85,0.12)'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Konfigurátor poukážok</h1>
          <p className="text-gray-600">Vytvorte si vlastný dizajn darčekových poukážok pre vašu firmu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Konfigurácia */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {tab.icon}
                        <span>{tab.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                
                {/* LAYOUT Tab */}
                {activeTab === 'layout' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Vyberte dizajn</h3>
                    
                    {/* Kategórie */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {LAYOUT_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                    
                    {/* Layouts Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {filteredLayouts.map(layout => (
                        <button
                          key={layout.id}
                          onClick={() => setConfig({ ...config, layoutId: layout.id })}
                          className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                            config.layoutId === layout.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-4xl mb-2">{layout.preview}</div>
                          <div className="text-sm font-medium text-gray-900">{layout.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* COLORS Tab */}
                {activeTab === 'colors' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Vyberte farebnú schému</h3>
                    <div className="space-y-3">
                      {COLOR_THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => setConfig({ ...config, colorThemeId: theme.id })}
                          className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                            config.colorThemeId === theme.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.primary }}></div>
                              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.secondary }}></div>
                              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.accent }}></div>
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{theme.name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* FORMAT Tab */}
                {activeTab === 'format' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Vyberte formát</h3>
                    <div className="space-y-3">
                      {VOUCHER_FORMATS.map(format => (
                        <button
                          key={format.id}
                          onClick={() => setConfig({ ...config, formatId: format.id })}
                          className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                            config.formatId === format.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{format.name}</div>
                          <div className="text-sm text-gray-600">{format.width} × {format.height}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENT Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Obsah a nastavenia</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Názov poukážky</label>
                      <input
                        type="text"
                        value={config.title}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Názov firmy</label>
                      <input
                        type="text"
                        value={config.companyName}
                        onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ikona emoji</label>
                      <input
                        type="text"
                        value={config.icon}
                        onChange={(e) => setConfig({ ...config, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="🎁"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Informácie v pätičke</label>
                      <textarea
                        value={config.footerInfo}
                        onChange={(e) => setConfig({ ...config, footerInfo: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.showDecorations}
                          onChange={(e) => setConfig({ ...config, showDecorations: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Zobraziť dekorácie</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.showQR}
                          onChange={(e) => setConfig({ ...config, showQR: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Zobraziť QR kód</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* BRANDING Tab */}
                {activeTab === 'branding' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Logo firmy</h3>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      {config.logo ? (
                        <div className="space-y-3">
                          <img src={config.logo} alt="Logo" className="max-h-32 mx-auto" />
                          <button
                            onClick={() => setConfig({ ...config, logo: null })}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Odstrániť logo
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Kliknite pre nahratie loga</p>
                          <p className="text-xs text-gray-500">PNG, JPG, SVG (max 2MB)</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        💡 <strong>Tip:</strong> Pre najlepšie výsledky používajte logo vo formáte PNG s priesvitným pozadím.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Náhľad */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Náhľad poukážky
                </h2>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Stiahnuť PDF
                  </button>
                </div>
              </div>

              {/* Info Panel */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Dizajn:</span>
                    <div className="font-semibold text-gray-900">{selectedLayout?.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Farby:</span>
                    <div className="font-semibold text-gray-900">{selectedColors?.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Formát:</span>
                    <div className="font-semibold text-gray-900">{selectedFormat?.name}</div>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="border-2 border-gray-200 rounded-xl p-8 bg-gray-50 flex items-center justify-center min-h-[500px]">
                {/* Replace static preview with dynamic HTML preview */}
                <div
                  className="bg-white p-8 rounded-lg shadow-2xl max-w-md"
                  dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  ℹ️ Toto je zjednodušený náhľad. Finálna poukážka bude vykreslená v plnom detaile podľa vybraného dizajnu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherConfigurator;