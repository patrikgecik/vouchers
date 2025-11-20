import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Gift } from 'lucide-react';

const VoucherRedeem = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Získame kód z URL parametrov
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
      validateVoucher(codeFromUrl);
    }
  }, []);

  const validateVoucher = async (voucherCode) => {
    setStatus('loading');
    setError('');

    try {
      const response = await fetch(`/api/vouchers/validate/${voucherCode}`);
      const data = await response.json();

      if (response.ok) {
        setVoucher(data);
        setStatus('success');
      } else {
        setError(data.message || 'Neplatný kód poukazu');
        setStatus('error');
      }
    } catch (err) {
      setError('Chyba pri overovaní poukazu');
      setStatus('error');
    }
  };

  const redeemVoucher = async () => {
    setStatus('loading');

    try {
      const response = await fetch(`/api/vouchers/redeem/${code}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        alert('Poukaz bol úspešne uplatnený!');
        setVoucher({...voucher, status: 'used'});
      } else {
        setError(data.message || 'Chyba pri uplatňovaní poukazu');
        setStatus('error');
      }
    } catch (err) {
      setError('Chyba pri uplatňovaní poukazu');
      setStatus('error');
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Overujem poukaz...</p>
          </div>
        );

      case 'success':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Platný poukaz!</h2>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8" />
                <span className="text-sm opacity-90">DARČEKOVÁ POUKÁŽKA</span>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">€{voucher.amount}</div>
                <div className="text-lg opacity-90 mb-2">{voucher.service_name}</div>
                <div className="text-sm opacity-75">Kód: {voucher.code}</div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={voucher.status === 'used' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  {voucher.status === 'used' ? 'Už bol uplatnený' : 'Pripravený na použitie'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platný do:</span>
                <span className="text-gray-800">
                  {new Date(voucher.expires_at).toLocaleDateString('sk-SK')}
                </span>
              </div>
              {voucher.customer_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pre:</span>
                  <span className="text-gray-800">{voucher.customer_name}</span>
                </div>
              )}
            </div>

            {voucher.status !== 'used' && new Date(voucher.expires_at) > new Date() && (
              <button
                onClick={redeemVoucher}
                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
              >
                Uplatniť poukaz
              </button>
            )}

            {voucher.status === 'used' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-center">
                  Tento poukaz už bol uplatnený a nemôže byť použitý znovu.
                </p>
              </div>
            )}

            {new Date(voucher.expires_at) <= new Date() && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-800 text-center">
                  Tento poukaz expiroval a nemôže byť použitý.
                </p>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Neplatný poukaz</h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Overiť poukaz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kód poukazu
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Zadajte kód poukazu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => validateVoucher(code)}
                disabled={!code}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Overiť poukaz
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Uplatnenie poukazu</h1>
          <p className="text-gray-600">Naskenujte QR kód alebo zadajte kód manuálne</p>
        </div>

        {renderStatus()}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Späť na hlavnú stránku
          </a>
        </div>
      </div>
    </div>
  );
};

export default VoucherRedeem;