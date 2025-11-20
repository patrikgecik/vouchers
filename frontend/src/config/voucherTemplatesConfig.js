// voucherTemplatesConfig.js
// Konfiguračný súbor - žiadny JSX, iba JavaScript konštanty a funkcie

// ============= FORMÁTY =============
export const VOUCHER_FORMATS = [
  { id: 'a4-portrait', name: 'A4 na výšku', width: '210mm', height: '297mm', description: 'Štandardný A4 formát na výšku' },
  { id: 'a4-landscape', name: 'A4 na šírku', width: '297mm', height: '210mm', description: 'A4 formát na šírku' },
  { id: 'card', name: 'Kreditná karta', width: '85.6mm', height: '53.98mm', description: 'Veľkosť kreditnej karty' },
  { id: 'postcard', name: 'Pohľadnica', width: '148mm', height: '105mm', description: 'Formát pohľadnice A6' },
  { id: 'square', name: 'Štvorec', width: '150mm', height: '150mm', description: 'Štvorec pre Instagram a sociálne siete' }
];

// ============= FAREBNÉ TÉMY =============
export const COLOR_THEMES = [
  { id: 'blue-ocean', name: 'Modrý oceán', primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa', text: '#1f2937', background: '#f8fafc' },
  { id: 'emerald', name: 'Smaragdová', primary: '#059669', secondary: '#10b981', accent: '#34d399', text: '#1f2937', background: '#f0fdf4' },
  { id: 'royal-purple', name: 'Kráľovská fialová', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa', text: '#1f2937', background: '#faf5ff' },
  { id: 'luxury-gold', name: 'Luxusné zlato', primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24', text: '#1f2937', background: '#fffbeb' },
  { id: 'passion-red', name: 'Vášnivá červená', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171', text: '#1f2937', background: '#fef2f2' },
  { id: 'teal-fresh', name: 'Svieža tyrkysová', primary: '#0d9488', secondary: '#14b8a6', accent: '#5eead4', text: '#1f2937', background: '#f0fdfa' },
  { id: 'rose-elegant', name: 'Elegantná ružová', primary: '#e11d48', secondary: '#f43f5e', accent: '#fb7185', text: '#1f2937', background: '#fff1f2' },
  { id: 'midnight', name: 'Polnočná', primary: '#1e293b', secondary: '#334155', accent: '#64748b', text: '#0f172a', background: '#f8fafc' },
  { id: 'sunset', name: 'Západ slnka', primary: '#ea580c', secondary: '#fb923c', accent: '#fdba74', text: '#1f2937', background: '#fff7ed' },
  { id: 'forest', name: 'Lesná', primary: '#166534', secondary: '#16a34a', accent: '#4ade80', text: '#1f2937', background: '#f0fdf4' }
];

// ============= KATEGÓRIE DIZAJNOV =============
export const LAYOUT_CATEGORIES = [
  { id: 'all', name: 'Všetky', icon: '🎨' },
  { id: 'modern', name: 'Moderné', icon: '✨' },
  { id: 'classic', name: 'Klasické', icon: '👔' },
  { id: 'premium', name: 'Prémium', icon: '💎' },
  { id: 'fun', name: 'Zábavné', icon: '🎉' },
  { id: 'natural', name: 'Prírodné', icon: '🌿' },
  { id: 'professional', name: 'Profesionálne', icon: '💼' }
];

// ============= DIZAJNOVÉ LAYOUTY =============
export const VOUCHER_LAYOUTS = [
  { id: 'modern-gradient', name: 'Moderný gradient', preview: '🎨', category: 'modern' },
  { id: 'classic-elegant', name: 'Klasická elegancia', preview: '👔', category: 'classic' },
  { id: 'minimalist-clean', name: 'Minimalistický čistý', preview: '⚪', category: 'modern' },
  { id: 'luxury-premium', name: 'Luxusný prémium', preview: '💎', category: 'premium' },
  { id: 'playful-fun', name: 'Hravý zábavný', preview: '🎉', category: 'fun' },
  { id: 'geometric-modern', name: 'Geometrický moderný', preview: '📐', category: 'modern' },
  { id: 'botanical-natural', name: 'Botanický prírodný', preview: '🌿', category: 'natural' },
  { id: 'corporate-professional', name: 'Korporátny profesionálny', preview: '💼', category: 'professional' }
];

// ============= HELPER FUNKCIE =============
export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function adjustColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// ============= HTML ŠABLÓNY PRE KAŽDÝ DIZAJN =============
const layoutTemplates = {
  'modern-gradient': (config, colors) => `
    <div style="max-width: 400px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px ${hexToRgba(colors.primary, 0.3)};">
      <div style="padding: 30px; text-align: center; color: white;">
        ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 50px; margin-bottom: 15px; filter: brightness(0) invert(1);" />` : `<div style="font-size: 40px; margin-bottom: 10px;">${config.icon}</div>`}
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${config.title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${config.companyName}</p>
      </div>
      
      <div style="background: white; padding: 30px; min-height: 300px;">
        <div style="background: linear-gradient(135deg, ${colors.background} 0%, white 100%); border-radius: 15px; padding: 30px; margin-bottom: 25px; border: 3px solid ${colors.accent}; text-align: center;">
          <div style="font-size: 48px; font-weight: 800; color: ${colors.primary}; margin: 0;">€{{amount}}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="background: ${colors.background}; padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid ${colors.secondary};">
            <p style="margin: 0; font-size: 11px; color: ${colors.secondary}; font-weight: 600; text-transform: uppercase;">Služba</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: ${colors.text};">{{serviceName}}</p>
          </div>
          
          <div style="background: ${colors.background}; padding: 15px; border-radius: 10px; border-left: 4px solid ${colors.accent};">
            <p style="margin: 0; font-size: 11px; color: ${colors.secondary}; font-weight: 600; text-transform: uppercase;">Pre</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: ${colors.text};">{{customerName}}</p>
          </div>
        </div>
        
        <div style="border-top: 2px dashed ${colors.accent}; padding-top: 20px; font-size: 12px; color: ${colors.secondary};">
          <p style="margin: 5px 0;"><strong>Kód:</strong> {{code}}</p>
          <p style="margin: 5px 0; color: #ef4444;"><strong>Platnosť:</strong> {{expiresAt}}</p>
        </div>
        
        ${config.footerInfo ? `<p style="margin: 20px 0 0 0; font-size: 10px; color: ${colors.secondary}; text-align: center; line-height: 1.4;">${config.footerInfo}</p>` : ''}
      </div>
    </div>
  `,

  'classic-elegant': (config, colors) => `
    <div style="max-width: 400px; background: white; border: 4px double ${colors.primary}; padding: 40px; font-family: 'Georgia', serif;">
      <div style="text-align: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 25px; margin-bottom: 30px;">
        ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 50px; margin-bottom: 15px;" />` : `<div style="font-size: 40px; margin-bottom: 10px; color: ${colors.primary};">🏆</div>`}
        <h1 style="margin: 0; font-size: 26px; color: ${colors.primary}; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">${config.title}</h1>
        <p style="margin: 12px 0 0 0; font-size: 14px; color: ${colors.secondary}; font-style: italic;">${config.companyName}</p>
      </div>
      
      <div style="border: 3px double ${colors.accent}; padding: 30px; margin: 30px 0; background: linear-gradient(to bottom, white 0%, ${colors.background} 100%); text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: ${colors.secondary}; text-transform: uppercase; letter-spacing: 2px;">Hodnota poukážky</p>
        <div style="font-size: 48px; font-weight: bold; color: ${colors.primary}; font-family: 'Georgia', serif;">€{{amount}}</div>
      </div>
      
      <div style="line-height: 2;">
        <p style="margin: 8px 0; font-size: 14px; color: ${colors.text};"><strong style="color: ${colors.primary};">Služba:</strong> {{serviceName}}</p>
        <p style="margin: 8px 0; font-size: 14px; color: ${colors.text};"><strong style="color: ${colors.primary};">Príjemca:</strong> {{customerName}}</p>
        <p style="margin: 8px 0; font-size: 12px; color: ${colors.secondary};"><strong>Kód:</strong> {{code}}</p>
        <p style="margin: 8px 0; font-size: 12px; color: #ef4444;"><strong>Platnosť do:</strong> {{expiresAt}}</p>
      </div>
      
      ${config.footerInfo ? `<p style="margin: 25px 0 0 0; padding-top: 20px; border-top: 1px solid ${colors.accent}; font-size: 10px; color: ${colors.secondary}; text-align: center; font-style: italic;">${config.footerInfo}</p>` : ''}
    </div>
  `,

  'minimalist-clean': (config, colors) => `
    <div style="max-width: 400px; background: white; padding: 50px 40px; font-family: 'Arial', sans-serif; border-left: 6px solid ${colors.primary};">
      ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 40px; margin-bottom: 25px;" />` : ''}
      
      <h1 style="margin: 0 0 5px 0; font-size: 18px; color: ${colors.text}; font-weight: 300; text-transform: uppercase; letter-spacing: 4px;">${config.title}</h1>
      <p style="margin: 0 0 40px 0; font-size: 13px; color: ${colors.secondary};">${config.companyName}</p>
      
      <div style="margin: 40px 0;">
        <div style="font-size: 64px; font-weight: 100; color: ${colors.primary}; line-height: 1;">€{{amount}}</div>
      </div>
      
      <div style="margin: 40px 0; padding: 25px 0; border-top: 1px solid ${colors.accent}; border-bottom: 1px solid ${colors.accent};">
        <p style="margin: 8px 0; font-size: 14px; color: ${colors.text};">{{serviceName}}</p>
        <p style="margin: 8px 0; font-size: 13px; color: ${colors.secondary};">{{customerName}}</p>
      </div>
      
      <div style="font-size: 11px; color: ${colors.secondary}; line-height: 1.8;">
        <p style="margin: 5px 0;">Kód: <span style="font-family: monospace; color: ${colors.primary};">{{code}}</span></p>
        <p style="margin: 5px 0; color: #ef4444;">Platnosť: {{expiresAt}}</p>
      </div>
      
      ${config.footerInfo ? `<p style="margin: 30px 0 0 0; font-size: 10px; color: ${colors.secondary}; line-height: 1.5;">${config.footerInfo}</p>` : ''}
    </div>
  `,

  'luxury-premium': (config, colors) => `
    <div style="max-width: 400px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 4px; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%); border-radius: 14px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, ${colors.primary} 0%, ${adjustColor(colors.primary, -20)} 100%); padding: 35px; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, ${hexToRgba('#ffffff', 0.03)} 10px, ${hexToRgba('#ffffff', 0.03)} 20px);"></div>
          
          ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 55px; margin-bottom: 15px; position: relative; z-index: 1; filter: brightness(0) invert(1);" />` : `<div style="font-size: 45px; margin-bottom: 10px; position: relative; z-index: 1;">💎</div>`}
          
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 1;">${config.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9); position: relative; z-index: 1;">${config.companyName}</p>
        </div>
        
        <div style="padding: 35px;">
          <div style="background: linear-gradient(135deg, ${colors.background} 0%, white 100%); border: 3px solid ${colors.primary}; border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: ${colors.secondary}; text-transform: uppercase; letter-spacing: 2px;">Hodnota</p>
            <div style="font-size: 54px; font-weight: 700; color: ${colors.primary}; text-shadow: 2px 2px 0 ${hexToRgba(colors.primary, 0.1)};">€{{amount}}</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
            <div style="border-left: 4px solid ${colors.accent}; padding-left: 12px;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: ${colors.secondary}; text-transform: uppercase;">Služba</p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${colors.text};">{{serviceName}}</p>
            </div>
            <div style="border-left: 4px solid ${colors.accent}; padding-left: 12px;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: ${colors.secondary}; text-transform: uppercase;">Pre</p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${colors.text};">{{customerName}}</p>
            </div>
          </div>
          
          <div style="border-top: 2px solid ${colors.accent}; padding-top: 20px; font-size: 11px; color: ${colors.secondary};">
            <p style="margin: 4px 0;"><strong>Kód:</strong> {{code}}</p>
            <p style="margin: 4px 0; color: #ef4444;"><strong>Platnosť do:</strong> {{expiresAt}}</p>
          </div>
          
          ${config.footerInfo ? `<p style="margin: 20px 0 0 0; font-size: 9px; color: ${colors.secondary}; text-align: center; line-height: 1.4;">${config.footerInfo}</p>` : ''}
        </div>
        
        <div style="height: 6px; background: linear-gradient(to right, ${colors.primary}, ${colors.accent}, ${colors.primary});"></div>
      </div>
    </div>
  `,

  'playful-fun': (config, colors) => `
    <div style="max-width: 400px; background: ${colors.background}; padding: 8px; border-radius: 25px; position: relative;">
      <div style="position: absolute; top: 15px; left: 15px; font-size: 30px; opacity: 0.2;">🎈</div>
      <div style="position: absolute; top: 45px; right: 20px; font-size: 35px; opacity: 0.2;">⭐</div>
      <div style="position: absolute; bottom: 35px; left: 30px; font-size: 25px; opacity: 0.2;">🎁</div>
      <div style="position: absolute; bottom: 15px; right: 15px; font-size: 32px; opacity: 0.2;">🎊</div>
      
      <div style="background: white; border-radius: 20px; border: 5px dashed ${colors.primary}; overflow: hidden; position: relative; z-index: 1;">
        <div style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.secondary} 100%); padding: 28px; text-align: center; transform: rotate(-1deg); margin: -5px -5px 0 -5px; color: white;">
          ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 50px; margin-bottom: 12px; filter: brightness(0) invert(1);" />` : `<div style="font-size: 48px; margin-bottom: 8px;">${config.icon}</div>`}
          
          <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; text-shadow: 3px 3px 0 rgba(0,0,0,0.2);">${config.title}</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">${config.companyName}</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%); color: white; border-radius: 20px; padding: 30px; margin-bottom: 25px; transform: rotate(1deg); box-shadow: 0 5px 15px ${hexToRgba(colors.primary, 0.3)}; text-align: center;">
            <div style="font-size: 54px; font-weight: 900; text-shadow: 3px 3px 0 rgba(0,0,0,0.2);">€{{amount}}</div>
          </div>
          
          <div style="background: ${colors.background}; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-size: 15px; color: ${colors.primary}; font-weight: 700;">🎯 {{serviceName}}</p>
            <p style="margin: 0; font-size: 14px; color: ${colors.text}; font-weight: 600;">👤 {{customerName}}</p>
          </div>
          
          <div style="font-size: 12px; color: ${colors.secondary}; line-height: 1.8;">
            <p style="margin: 6px 0;">🔑 Kód: <strong>{{code}}</strong></p>
            <p style="margin: 6px 0; color: #ef4444;">⏰ Platnosť: <strong>{{expiresAt}}</strong></p>
          </div>
          
          ${config.footerInfo ? `<p style="margin: 20px 0 0 0; font-size: 10px; color: ${colors.secondary}; text-align: center; line-height: 1.4;">${config.footerInfo}</p>` : ''}
        </div>
      </div>
    </div>
  `,

  'geometric-modern': (config, colors) => `
    <div style="max-width: 400px; background: white; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 100px 100px 0; border-color: transparent ${colors.primary} transparent transparent; opacity: 0.1;"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 0; height: 0; border-style: solid; border-width: 80px 0 0 80px; border-color: transparent transparent transparent ${colors.secondary}; opacity: 0.1;"></div>
      
      <div style="position: relative; z-index: 1; padding: 30px;">
        <div style="background: ${colors.primary}; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); padding: 35px 25px 50px 25px; margin: -30px -30px 0 -30px; color: white; text-align: center;">
          ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 45px; margin-bottom: 15px; filter: brightness(0) invert(1);" />` : ''}
          
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 3px;">${config.title}</h1>
          <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">${config.companyName}</p>
        </div>
        
        <div style="margin-top: -20px; position: relative;">
          <div style="background: white; border: 3px solid ${colors.primary}; padding: 25px; text-align: center; box-shadow: 8px 8px 0 ${colors.accent};">
            <div style="font-size: 48px; font-weight: 900; color: ${colors.primary};">€{{amount}}</div>
          </div>
        </div>
        
        <div style="margin-top: 25px; padding: 20px; background: ${colors.background};">
          <p style="margin: 8px 0; font-size: 14px; color: ${colors.text};"><strong>Služba:</strong> {{serviceName}}</p>
          <p style="margin: 8px 0; font-size: 14px; color: ${colors.text};"><strong>Pre:</strong> {{customerName}}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; border-left: 5px solid ${colors.secondary}; font-size: 12px; color: ${colors.secondary};">
          <p style="margin: 4px 0;">Kód: {{code}}</p>
          <p style="margin: 4px 0; color: #ef4444;">Platnosť: {{expiresAt}}</p>
        </div>
        
        ${config.footerInfo ? `<p style="margin: 20px 0 0 0; font-size: 10px; color: ${colors.secondary}; text-align: center; line-height: 1.4;">${config.footerInfo}</p>` : ''}
      </div>
    </div>
  `,

  'botanical-natural': (config, colors) => `
    <div style="max-width: 400px; background: linear-gradient(to bottom, white 0%, ${colors.background} 100%); border-radius: 15px; border: 2px solid ${colors.primary}; overflow: hidden; position: relative;">
      <div style="position: absolute; top: 20px; left: 20px; font-size: 45px; opacity: 0.12; color: ${colors.primary};">🌿</div>
      <div style="position: absolute; top: 50px; right: 25px; font-size: 30px; opacity: 0.12; color: ${colors.secondary};">🍃</div>
      <div style="position: absolute; bottom: 35px; left: 35px; font-size: 38px; opacity: 0.12; color: ${colors.accent};">🌱</div>
      <div style="position: absolute; bottom: 55px; right: 20px; font-size: 42px; opacity: 0.12; color: ${colors.primary};">🌾</div>
      
      <div style="padding: 30px; text-align: center; border-bottom: 1px solid ${colors.accent}; position: relative; z-index: 1;">
        ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 45px; margin-bottom: 12px;" />` : `<div style="font-size: 42px; margin-bottom: 10px; color: ${colors.primary};">🌿</div>`}
        
        <h1 style="margin: 0; font-size: 24px; color: ${colors.primary}; font-weight: 400; letter-spacing: 2px; font-style: italic;">${config.title}</h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: ${colors.secondary};">${config.companyName}</p>
      </div>
      
      <div style="padding: 35px; position: relative; z-index: 1;">
        <div style="background: white; border: 2px solid ${colors.accent}; border-radius: 50%; width: 180px; height: 180px; margin: 0 auto 30px auto; display: flex; align-items: center; justify-content: center; flex-direction: column; box-shadow: 0 4px 15px ${hexToRgba(colors.primary, 0.15)};">
          <p style="margin: 0 0 8px 0; font-size: 11px; color: ${colors.secondary};">Hodnota</p>
          <div style="font-size: 42px; font-weight: 600; color: ${colors.primary};">€{{amount}}</div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="margin: 6px 0; font-size: 14px; color: ${colors.text};">{{serviceName}}</p>
          <p style="margin: 6px 0; font-size: 13px; color: ${colors.secondary}; font-style: italic;">pre {{customerName}}</p>
        </div>
        
        <div style="border-top: 1px dashed ${colors.accent}; padding-top: 18px; font-size: 11px; color: ${colors.secondary}; text-align: center;">
          <p style="margin: 4px 0;">Kód: {{code}}</p>
          <p style="margin: 4px 0; color: #ef4444;">Platné do: {{expiresAt}}</p>
        </div>
        
        ${config.footerInfo ? `<p style="margin: 20px 0 0 0; font-size: 10px; color: ${colors.secondary}; text-align: center; line-height: 1.4;">${config.footerInfo}</p>` : ''}
      </div>
    </div>
  `,

  'corporate-professional': (config, colors) => `
    <div style="max-width: 400px; background: #f5f5f5;">
      <div style="background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: ${colors.primary}; padding: 25px; display: flex; align-items: center; justify-content: space-between;">
          <div style="flex: 1;">
            ${config.logo ? `<img src="${config.logo}" alt="Logo" style="max-height: 40px;" />` : ''}
          </div>
          
          <div style="flex: 2; text-align: right; color: white;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase;">${config.title}</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">${config.companyName}</p>
          </div>
        </div>
        
        <div style="padding: 35px;">
          <div style="background: ${colors.background}; border-left: 5px solid ${colors.primary}; padding: 25px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0; font-size: 11px; color: ${colors.secondary}; text-transform: uppercase; font-weight: 600;">Hodnota poukážky</p>
            <div style="font-size: 46px; font-weight: 700; color: ${colors.primary};">€{{amount}}</div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.accent}; color: ${colors.secondary}; font-weight: 600;">Služba:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.accent}; text-align: right; color: ${colors.text}; font-weight: 600;">{{serviceName}}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.accent}; color: ${colors.secondary}; font-weight: 600;">Príjemca:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.accent}; text-align: right; color: ${colors.text}; font-weight: 600;">{{customerName}}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.accent}; color: ${colors.secondary}; font-weight: 600;">Kód:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.accent}; text-align: right; font-family: monospace; color: ${colors.text}; font-weight: 600;">{{code}}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: ${colors.secondary}; font-weight: 600;">Platnosť do:</td>
              <td style="padding: 12px 0; text-align: right; color: #ef4444; font-weight: 600;">{{expiresAt}}</td>
            </tr>
          </table>
          
          ${config.footerInfo ? `<p style="margin: 25px 0 0 0; padding-top: 20px; border-top: 1px solid ${colors.accent}; font-size: 10px; color: ${colors.secondary}; text-align: center; line-height: 1.4;">${config.footerInfo}</p>` : ''}
        </div>
        
        <div style="height: 4px; background: ${colors.primary};"></div>
      </div>
    </div>
  `
};

// ============= FUNKCIA NA GENEROVANIE HTML ŠABLÓNY =============
export const generateVoucherHTML = (config) => {
  const colors = config.customColors || COLOR_THEMES.find(c => c.id === config.colorThemeId) || COLOR_THEMES[0];
  const layoutTemplate = layoutTemplates[config.layoutId] || layoutTemplates['modern-gradient'];
  
  return layoutTemplate(config, colors);
};

// ============= FUNKCIA NA VYPLNENIE DÁTAMI =============
export const fillVoucherData = (template, data) => {
  return template
    .replace(/\{\{amount\}\}/g, data.amount || '0')
    .replace(/\{\{serviceName\}\}/g, data.serviceName || 'Služba')
    .replace(/\{\{customerName\}\}/g, data.customerName || 'Zákazník')
    .replace(/\{\{code\}\}/g, data.code || 'XXXX-XXXX')
    .replace(/\{\{expiresAt\}\}/g, data.expiresAt || '31.12.2025')
    .replace(/\{\{companyName\}\}/g, data.companyName || 'Vaša firma');
}