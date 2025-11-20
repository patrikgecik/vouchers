# 🎨 Šablóny pre darčekové poukazy

## 📋 Ako vytvoriť vlastnú šablónu

### 1. Otvorte template-creator.html
- Otvorte súbor `template-creator.html` v prehliadači
- Uvidíte ukážku šablóny s označenými pozíciami textu
- Použite ju ako základ pre svoj dizajn

### 2. Vytvorte vlastný dizajn
- **Rozmery:** 794x1123 pixelov (zodpovedá A4 formátu)
- **Formát:** PNG s priehľadným pozadím alebo JPG
- **Kvalita:** Minimálne 300 DPI pre tlač

### 3. Pozície textu (PRESNE dodržujte!)

#### 📍 Súradnice v mm (od ľavého horného rohu):
- **SUMA:** x: 50mm, y: 80mm → Veľkosť: 24pt, bold, farba: #1e40af
- **MENO:** x: 50mm, y: 120mm → Veľkosť: 14pt, farba: #000000  
- **SLUŽBA:** x: 50mm, y: 140mm → Veľkosť: 12pt, farba: #333333
- **KÓD:** x: 50mm, y: 160mm → Veľkosť: 10pt, farba: #666666
- **PLATNOSŤ:** x: 50mm, y: 180mm → Veľkosť: 10pt, farba: #666666

### 4. Názvy súborov (PRESNE):
- `classic-blue-template.png` - Modrá šablóna
- `elegant-green-template.png` - Zelená šablóna  
- `modern-purple-template.png` - Fialová šablóna
- `luxury-gold-template.png` - Zlatá šablóna

### 5. ✅ Testovanie
1. Umiestnite PNG súbor do tohto priečinka
2. Reštartujte aplikáciu (Ctrl+C a znovu spustite)
3. V admin paneli vytvorte poukaz s príslušnou farbou
4. Stiahnite PDF - mal by obsahovať váš dizajn + text na správnych miestach

## 🎯 Tipy pre dobrý dizajn:

- **Nechajte voľné miesta** pre text na označených pozíciách  
- **Používajte kontrastné farby** - text musí byť čitateľný
- **Dizajn by mal byť profesionálny** a reprezentovať vašu značku
- **Testujte tlač** - ako vyzerá na papieri vs. obrazovke

## 🔧 Riešenie problémov:

**Obrázok sa nenačítava?**
- Skontrolujte názov súboru (presná zhoda)
- Skontrolujte formát (PNG/JPG)
- Reštartujte server

**Text nie je viditeľný?**
- Skontrolujte farbu pozadia v tých miestach
- Upravte farby v konfigurácii šablóny

**Pozície textu nie sú správne?**
- Súradnice sú v mm, nie pixeloch
- 50mm = cca 189px pri 96 DPI