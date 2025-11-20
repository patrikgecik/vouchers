// Utility funkcia pre generovanie PDF pomocou HTML šablón na backende
export const generateVoucherWithTemplate = async (templateHtml, voucherData) => {
  try {
    // Validácia vstupov
    if (!templateHtml || typeof templateHtml !== 'string') {
      throw new Error('Template HTML is required and must be a string');
    }
    
    if (!voucherData || typeof voucherData !== 'object') {
      throw new Error('Voucher data is required and must be an object');
    }

    console.log('📄 Generating PDF for template:', templateHtml.length > 0 ? `${templateHtml.length} characters` : 'empty');
    
    // Príprava dát pre HTML šablónu
    const templateData = {
      companyName: voucherData.companyName || 'Serenity Spa & Wellness',
      amount: voucherData.amount ? voucherData.amount.toFixed(2) : '0.00',
      customerName: voucherData.customerName || 'Zákazník',
      serviceName: voucherData.serviceName || 'Služba',
      code: voucherData.code || `VC-${Date.now().toString().slice(-8)}`,
      expiresAt: voucherData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('sk-SK'),
      message: voucherData.message || '',
      companyInfo: voucherData.companyInfo || 'Kontakt: info@serenityspa.sk | +421 912 345 678'
    };

    // Nahradenie placeholder-ov v HTML šablóne
    let htmlContent = templateHtml;
    Object.keys(templateData).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      htmlContent = htmlContent.replace(regex, templateData[key] || '');
    });

    console.log(`🚀 Sending HTML to backend for PDF generation...`);
    
    // Poslanie HTML na backend pre konverziu na PDF
    const response = await fetch('/api/vouchers/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        voucherData: templateData
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    // Získanie PDF ako blob
    const pdfBlob = await response.blob();
    
    // Vytvorenie download linku
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Poukazka_${(templateData.customerName || 'voucher').replace(/[^a-zA-Z0-9]/g, '_')}_EUR${templateData.amount}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log('✅ PDF generated and downloaded successfully!');
    
    return { success: true, message: 'PDF stiahnuý úspešne' };
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    
    // Fallback - použijeme jednoduchý HTML export ak backend nefunguje
    console.log('🔄 Falling back to HTML preview...');
    return generateHtmlFallback(templateHtml, voucherData);
  }
};

// Fallback funkcia pre HTML náhľad ak backend nefunguje
const generateHtmlFallback = (templateHtml, voucherData) => {
  try {
    const templateData = {
      companyName: voucherData.companyName || 'Serenity Spa & Wellness',
      amount: voucherData.amount ? voucherData.amount.toFixed(2) : '0.00',
      customerName: voucherData.customerName || 'Zákazník',
      serviceName: voucherData.serviceName || 'Služba',
      code: voucherData.code || `VC-${Date.now().toString().slice(-8)}`,
      expiresAt: voucherData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('sk-SK'),
      message: voucherData.message || ''
    };

    let htmlContent = templateHtml;
    Object.keys(templateData).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      htmlContent = htmlContent.replace(regex, templateData[key] || '');
    });

    // Otvorenie v novom okne na tlač
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Poukážka - ${templateData.customerName}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();

    return { success: true, message: 'Otvorený v novom okne na tlač' };
    
  } catch (error) {
    console.error('❌ Error in HTML fallback:', error);
    throw error;
  }
};