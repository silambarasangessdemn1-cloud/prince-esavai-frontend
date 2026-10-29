import { PaymentGatewaySettings, PricingItem } from '../types';

export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  upiId: 'jjesper143@oksbi',
  payeeName: 'j jesper',
  qrCodeImage: '/assets/qrcode.jpeg',
  isPaymentRequired: true,
};

export const DEFAULT_SERVICE_PRICES: Record<string, number> = {
  // Ration Services
  'ration-family-head': 60,
  'ration-mobile-link': 50,
  'ration-qr-code': 40,
  'ration-smartcard-instant': 50,
  'ration-member-add': 60,
  'ration-address-change': 60,

  // Aadhaar Services
  'aadhaar-mobile-link': 50,
  'aadhaar-address-update': 60,
  'aadhaar-name-correction': 60,
  'aadhaar-dob-correction': 60,
  'aadhaar-biometric-update': 100,
  'aadhaar-doc-update': 50,
  'aadhaar-issue': 60,

  // Voter Services
  'voter-form-6': 50,
  'voter-form-8-correction': 50,
  'voter-form-8-address': 50,
  'voter-e-epic-download': 40,
  'voter-link-mobile': 40,
  'voter-electoral-search': 30,

  // PAN Services
  'pan-form-49a': 107,
  'pan-csf-correction': 110,
  'pan-instant-epan': 60,
  'pan-link-aadhaar': 50,
  'pan-minor-to-major': 110,
  'pan-duplicate-reprint': 100,

  // Farmer Services
  'farmer-pm-kisan': 50,
  'farmer-fmb-sketch': 60,
  'farmer-crop-insurance': 80,
  'farmer-drip-irrigation': 100,
  'farmer-machinery-subsidy': 100,
  'farmer-uzhavar-sandhai': 40,
  'farmer-soil-health-card': 50,

  // Driving Services
  'driving-dl-application': 150,
  'driving-dl-renewal': 120,
  'driving-duplicate-dl': 100,
  'driving-address-change': 80,
  'driving-idp': 250,

  // Vehicle Services
  'vehicle-rc-extract': 60,
  'vehicle-insurance-check': 40,
  'vehicle-pucc-emission': 50,
  'vehicle-rc-smartcard-pdf': 60,
  'vehicle-link-mobile': 50,
  'vehicle-traffic-fine': 50,
  'vehicle-ownership-transfer': 200,
  'vehicle-duplicate-rc': 150,

  // Other common forms
  'can-registration': 60,
  'birth-certificate': 60,
  'death-certificate': 60,
  'pvc-maker': 80,
};

const BASE = '/api/pricing';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const pricingApi = {
  /**
   * Fetch current pricing configuration (from API or local cache)
   */
  async getConfig(): Promise<{
    settings: PaymentGatewaySettings;
    prices: Record<string, number>;
  }> {
    // 1. Check local cache first
    let localPrices = { ...DEFAULT_SERVICE_PRICES };
    let localSettings = { ...DEFAULT_PAYMENT_SETTINGS };

    try {
      const savedPrices = localStorage.getItem('esevai_service_prices');
      if (savedPrices) {
        localPrices = { ...localPrices, ...JSON.parse(savedPrices) };
      }
      const savedSettings = localStorage.getItem('esevai_payment_settings');
      if (savedSettings) {
        localSettings = { ...localSettings, ...JSON.parse(savedSettings) };
      }
    } catch {}

    // 2. Fetch from backend API
    try {
      const res = await fetch(BASE, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const apiConfig = json.data;
          if (apiConfig.upiId) localSettings.upiId = apiConfig.upiId;
          if (apiConfig.payeeName) localSettings.payeeName = apiConfig.payeeName;
          if (apiConfig.qrCodeImage) localSettings.qrCodeImage = apiConfig.qrCodeImage;
          if (apiConfig.isPaymentRequired !== undefined) {
            localSettings.isPaymentRequired = apiConfig.isPaymentRequired;
          }

          if (Array.isArray(apiConfig.services)) {
            apiConfig.services.forEach((s: any) => {
              if (s.serviceId && typeof s.price === 'number') {
                localPrices[s.serviceId] = s.price;
              }
            });
          }

          // Update local cache
          localStorage.setItem('esevai_service_prices', JSON.stringify(localPrices));
          localStorage.setItem('esevai_payment_settings', JSON.stringify(localSettings));
        }
      }
    } catch {
      // Backend unavailable; use local cache
    }

    return { settings: localSettings, prices: localPrices };
  },

  /**
   * Update full pricing configuration
   */
  async saveConfig(
    settings: PaymentGatewaySettings,
    prices: Record<string, number>,
    servicesList?: PricingItem[]
  ): Promise<boolean> {
    try {
      localStorage.setItem('esevai_service_prices', JSON.stringify(prices));
      localStorage.setItem('esevai_payment_settings', JSON.stringify(settings));

      const servicesArray = servicesList || Object.entries(prices).map(([serviceId, price]) => ({
        serviceId,
        serviceName: serviceId,
        category: 'General',
        price,
      }));

      await fetch(BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          upiId: settings.upiId,
          payeeName: settings.payeeName,
          qrCodeImage: settings.qrCodeImage,
          isPaymentRequired: settings.isPaymentRequired,
          services: servicesArray,
        }),
      });

      return true;
    } catch {
      return true; // Still true since saved to localStorage
    }
  },

  /**
   * Update price for a single service
   */
  async updatePrice(serviceId: string, price: number, serviceName?: string, category?: string): Promise<boolean> {
    try {
      let currentPrices = { ...DEFAULT_SERVICE_PRICES };
      const saved = localStorage.getItem('esevai_service_prices');
      if (saved) currentPrices = { ...currentPrices, ...JSON.parse(saved) };
      currentPrices[serviceId] = price;
      localStorage.setItem('esevai_service_prices', JSON.stringify(currentPrices));

      await fetch(`${BASE}/service/${serviceId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ price, serviceName, category }),
      });
      return true;
    } catch {
      return true;
    }
  },
};

