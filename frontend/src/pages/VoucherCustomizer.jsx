import React, { useState, useEffect } from 'react';
import { 
  VOUCHER_FORMATS, 
  COLOR_THEMES, 
  VOUCHER_LAYOUTS, 
  generateVoucherHTML 
} from '../config/voucherTemplatesConfig';

const VoucherCustomizer = ({ onTemplateChange, initialConfig = {} }) => {
  const [config, setConfig] = useState({
    formatId: 'a4-portrait',
    colorThemeId: 'blue-ocean', // Opravené ID
    layoutId: 'modern-gradient', // Opravené ID
    companyName: 'Vaša spoločnosť',
    title: 'DARČEKOVÁ POUKÁŽKA',
    logo: null,
    icon: '🎁',
    showDecorations: true,
    showQR: true,
    footerInfo: '',
    ...initialConfig
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // Aktualizuj template pri zmene konfigurácie
  useEffect(() => {
    if (onTemplateChange) {
      const template = generateVoucherHTML(config);
      onTemplateChange(template, config);
    }
  }, [config, onTemplateChange]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kontrola veľkosti súboru (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Súbor je príliš veľký. Maximálna veľkosť je 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target.result;
        setLogoPreview(logoData);
        handleConfigChange('logo', logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    handleConfigChange('logo', null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🎨 Prispôsobenie šablóny
      </h3>

      {/* Výber formátu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📐 Formát poukazu
        </label>
        <select
          value={config.formatId}
          onChange={(e) => handleConfigChange('formatId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {VOUCHER_FORMATS.map(format => (
            <option key={format.id} value={format.id}>
              {format.name} ({format.width} × {format.height})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {VOUCHER_FORMATS.find(f => f.id === config.formatId)?.description}
        </p>
      </div>

      {/* Výber layoutu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎯 Štýl šablóny
        </label>
        <div className="grid grid-cols-2 gap-3">
          {VOUCHER_LAYOUTS.map(layout => (
            <button
              key={layout.id}
              onClick={() => handleConfigChange('layoutId', layout.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                config.layoutId === layout.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{layout.preview}</div>
              <div className="font-medium text-sm">{layout.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Výber farebnej schémy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎨 Farebná schéma
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleConfigChange('colorThemeId', theme.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.colorThemeId === theme.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.secondary }}
                ></div>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.accent }}
                ></div>
              </div>
              <div className="text-xs font-medium text-gray-700">
                {theme.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Firemné informácie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🏢 Názov spoločnosti
        </label>
        <input
          type="text"
          value={config.companyName}
          onChange={(e) => handleConfigChange('companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Názov vašej spoločnosti"
        />
      </div>

      {/* Titulok */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 Titulok poukazu
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => handleConfigChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="DARČEKOVÁ POUKÁŽKA"
        />
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🖼️ Logo spoločnosti
        </label>
        {logoPreview ? (
          <div className="flex items-center space-x-3">
            <img 
              src={logoPreview} 
              alt="Logo preview" 
              className="w-16 h-16 object-contain border border-gray-200 rounded"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Logo nahrané</p>
              <button
                onClick={removeLogo}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Odstrániť
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Nahrať logo</span>
              <span className="text-xs text-gray-500">PNG, JPG do 2MB</span>
            </label>
          </div>
        )}
      </div>

      {/* Ikona */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎁 Ikona darčeku
        </label>
        <div className="flex space-x-2 flex-wrap gap-2">
          {['🎁', '💝', '🎉', '🌟', '💎', '🏆', '🎊', '🎈', '🌹', '💰'].map(icon => (
            <button
              key={icon}
              onClick={() => handleConfigChange('icon', icon)}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                config.icon === icon
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Doplňujúce informácie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📋 Doplňujúce informácie (footer)
        </label>
        <textarea
          value={config.footerInfo}
          onChange={(e) => handleConfigChange('footerInfo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="2"
          placeholder="Napr.: Kontakt, adresa, webstránka..."
        />
      </div>

      {/* Prepínače */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="showDecorations"
            checked={config.showDecorations}
            onChange={(e) => handleConfigChange('showDecorations', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showDecorations" className="text-sm font-medium text-gray-700">
            ✨ Zobraziť dekoratívne prvky
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="showQR"
            checked={config.showQR}
            onChange={(e) => handleConfigChange('showQR', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showQR" className="text-sm font-medium text-gray-700">
            📱 Zobraziť QR kód
          </label>
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            setConfig({
              formatId: 'a4-portrait',
              colorThemeId: 'blue-ocean',
              layoutId: 'modern-gradient',
              companyName: 'Vaša spoločnosť',
              title: 'DARČEKOVÁ POUKÁŽKA',
              logo: null,
              icon: '🎁',
              showDecorations: true,
              showQR: true,
              footerInfo: '',
            });
            setLogoPreview(null);
          }}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          🔄 Resetovať na predvolené
        </button>
      </div>
    </div>
  );
};

export default VoucherCustomizer;