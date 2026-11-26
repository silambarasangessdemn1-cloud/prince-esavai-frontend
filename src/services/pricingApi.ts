import { PaymentGatewaySettings, PricingItem } from '../types';
import { API_ENDPOINTS } from '../config/apiConfig';

export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  upiId: 'jjesper143@oksbi',
  payeeName: 'j jesper',
  qrCodeImage: '/assets/qrcode.jpeg',
  isPaymentRequired: true,
};

export const DEFAULT_SERVICE_PRICES: Record<string, number> = {
  // ── 1. Ration Services ──────────────────────────────
  'add-family-member': 60,
  'remove-family-member': 60,
  'ration-family-head': 60,
  'address-fps-change': 60,
  'ration-mobile-link': 50,
  'name-correction': 60,
  'dob-correction': 60,
  'address-correction': 60,
  'photo-change': 60,
  'smartcard-number-missing': 50,
  'ration-qr-code': 40,
  'smartcard-pdf-green': 50,
  'ration-smartcard-instant': 50,
  'ration-member-add': 60,
  'ration-address-change': 60,

  // ── 2. CAN Services ─────────────────────────────────
  'can-saved-app-remove': 50,
  'can-return-app-remove': 50,
  'can-certificate-find': 60,
  'can-legal-heir-find': 70,
  'can-deleted': 60,
  'can-mobile-link': 50,
  'can-registration': 60,

  // ── 3. Aadhaar Services ─────────────────────────────
  'mobile-no-update': 50,
  'address-update': 60,
  'physical-card': 70,
  're-kyc': 50,
  'name-dob-correction': 60,
  'biometric-update': 100,
  'bank-seeding': 50,
  'photo-update': 60,
  'aadhaar-issue': 60,
  'aadhaar-mobile-link': 50,
  'aadhaar-address-update': 60,
  'aadhaar-name-correction': 60,
  'aadhaar-dob-correction': 60,
  'aadhaar-biometric-update': 100,
  'aadhaar-doc-update': 50,

  // ── 4. PAN Services ─────────────────────────────────
  'new-pan-form-49a': 107,
  'pan-correction-changes': 110,
  'reprint-physical-pan': 100,
  'minor-to-major-pan': 110,
  'instant-epan-service': 60,
  'aadhaar-pan-linking': 50,
  'find-lost-pan': 60,
  'pvc-plastic-card-order': 80,
  'pan-form-49a': 107,
  'pan-csf-correction': 110,
  'pan-instant-epan': 60,
  'pan-link-aadhaar': 50,
  'pan-minor-to-major': 110,
  'pan-duplicate-reprint': 100,

  // ── 5. Voter Services ───────────────────────────────
  'form-6-new-voter': 50,
  'form-8-correction': 50,
  'form-8-replacement': 50,
  'form-8-shifting': 50,
  'form-6b-aadhaar-link': 40,
  'download-eepic': 40,
  'search-electoral-roll': 30,
  'form-7-deletion': 50,
  'voter-form-6': 50,
  'voter-form-8-correction': 50,
  'voter-form-8-address': 50,
  'voter-e-epic-download': 40,
  'voter-link-mobile': 40,
  'voter-electoral-search': 30,

  // ── 6. Driving Services ─────────────────────────────
  'learner-license-ll': 150,
  'permanent-dl-apply': 200,
  'dl-renewal-expiry': 120,
  'duplicate-dl-reissue': 100,
  'change-address-dl': 80,
  'link-mobile-dl': 50,
  'download-digital-dl-pvc': 60,
  'find-lost-dl-number': 70,
  'driving-dl-application': 150,
  'driving-dl-renewal': 120,
  'driving-duplicate-dl': 100,
  'driving-address-change': 80,
  'driving-idp': 250,

  // ── 7. Vehicle Services ─────────────────────────────
  'veh-rc-extract': 60,
  'veh-insurance': 40,
  'veh-pucc-emission': 50,
  'veh-rc-smartcard': 60,
  'veh-mobile-link': 50,
  'veh-traffic-challan': 50,
  'veh-rc-transfer': 200,
  'veh-duplicate-rc': 150,
  'veh-address-change': 80,
  'veh-hypothecation': 100,
  'vehicle-rc-extract': 60,
  'vehicle-insurance-check': 40,
  'vehicle-pucc-emission': 50,
  'vehicle-rc-smartcard-pdf': 60,
  'vehicle-link-mobile': 50,
  'vehicle-traffic-fine': 50,
  'vehicle-ownership-transfer': 200,
  'vehicle-duplicate-rc': 150,

  // ── 8. Certificates & PVC ───────────────────────────
  'pvc-maker': 80,
  'birth-certificate': 60,
  'death-certificate': 60,
  'income-certificate': 60,
  'community-certificate': 60,
  'nativity-certificate': 60,
  'first-graduate-certificate': 60,
};

const BASE = API_ENDPOINTS.pricing;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const pricingApi = {
  /**
   * Fetch current pricing configuration (from API or local cache)
   */
  async getPricing() {
    const config = await this.getConfig();
    return {
      success: true,
      prices: config.prices,
      data: {
        prices: config.prices,
        services: Object.entries(config.prices).map(([serviceId, price]) => ({ serviceId, price })),
      },
    };
  },

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

