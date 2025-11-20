// Utility funkcie pre validáciu kreditných kariet

// Luhn algoritmus pre validáciu čísla karty
export const validateCardNumber = (cardNumber) => {
  // Odstránime všetky medzery a pomlčky
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Skontrolujeme či sú to len číslice
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }

  // Skontrolujeme dĺžku (13-19 číslic)
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  // Luhn algoritmus
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit = digit % 10 + 1;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Detekcia typu karty
export const getCardType = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Visa
  if (/^4/.test(cleanNumber)) {
    return { type: 'visa', name: 'Visa' };
  }
  
  // Mastercard
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return { type: 'mastercard', name: 'Mastercard' };
  }
  
  // American Express
  if (/^3[47]/.test(cleanNumber)) {
    return { type: 'amex', name: 'American Express' };
  }
  
  // Discover
  if (/^6/.test(cleanNumber)) {
    return { type: 'discover', name: 'Discover' };
  }
  
  return { type: 'unknown', name: 'Neznámy typ' };
};

// Validácia CVV
export const validateCVV = (cvv, cardType) => {
  if (!cvv) return false;
  
  const cleanCVV = cvv.replace(/\s/g, '');
  
  // American Express má 4-ciferný CVV, ostatné 3-ciferný
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cleanCVV);
  } else {
    return /^\d{3}$/.test(cleanCVV);
  }
};

// Validácia dátumu expirácie
export const validateExpiryDate = (month, year) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  // Skontrolujeme formát
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  
  // Ak je to aktuálny rok, mesiac musí byť v budúcnosti
  if (expYear === currentYear && expMonth <= currentMonth) return false;
  
  return true;
};

// Formátovanie čísla karty (pridanie medzier)
export const formatCardNumber = (value) => {
  const cleanValue = value.replace(/\s/g, '');
  const cardType = getCardType(cleanValue);
  
  let formatted = '';
  
  if (cardType.type === 'amex') {
    // American Express: 4-6-5 formát
    formatted = cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  } else {
    // Ostatné: 4-4-4-4 formát
    formatted = cleanValue.replace(/(\d{4})/g, '$1 ').trim();
  }
  
  return formatted;
};

// Kompletná validácia platobných údajov
export const validatePaymentData = (paymentData) => {
  const errors = {};
  
  // Číslo karty
  if (!paymentData.cardNumber || !validateCardNumber(paymentData.cardNumber)) {
    errors.cardNumber = 'Neplatné číslo karty';
  }
  
  // Meno držiteľa
  if (!paymentData.cardHolder || paymentData.cardHolder.trim().length < 2) {
    errors.cardHolder = 'Zadajte meno držiteľa karty';
  }
  
  // CVV
  const cardType = getCardType(paymentData.cardNumber || '').type;
  if (!paymentData.cvv || !validateCVV(paymentData.cvv, cardType)) {
    errors.cvv = cardType === 'amex' ? 'CVV musí mať 4 číslice' : 'CVV musí mať 3 číslice';
  }
  
  // Mesiac a rok expirácie
  if (!validateExpiryDate(paymentData.expiryMonth, paymentData.expiryYear)) {
    errors.expiry = 'Neplatný dátum expirácie';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};