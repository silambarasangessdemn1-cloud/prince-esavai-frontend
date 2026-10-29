export type WalletType = 'payments' | 'cards';

export type ActionBadgeColor = 'green' | 'blue' | 'purple' | 'amber';

export type CornerTriangleColor = 'green' | 'blue' | 'amber';

export type ServiceFormType =
  | 'can_registration'
  | 'ration_family_head'
  | 'ration_mobile_link'
  | 'ration_qr_code'
  | 'birth_certificate'
  | 'death_certificate'
  | 'smartcard_search'
  | 'pvc_maker'
  | 'vehicle_rc'
  | 'driving_license'
  | 'aadhaar_issue'
  | 'generic';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  actionLabel: string;
  actionColor: ActionBadgeColor;
  cornerColor: CornerTriangleColor;
  price: number;
  walletType: WalletType;
  iconType: string;
  isNew?: boolean;
  isPopular?: boolean;
  formType: ServiceFormType;
  subtitle?: string;
  description?: string;
  processingTime?: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  ribbonColor: string; // e.g. bg-cyan-400, bg-purple-500
  services: ServiceItem[];
}

export type ApplicationStatus = 'Completed' | 'In Process' | 'Under Review' | 'Rejected';

export type PaymentStatus = 'Pending Verification' | 'Verified & Approved' | 'Rejected' | 'Exempted';

export interface ApplicationRecord {
  id: string;
  tokenNumber: string;
  serviceId: string;
  serviceName: string;
  applicantName: string;
  mobile: string;
  date: string;
  status: ApplicationStatus;
  fee: number;
  walletType: WalletType;
  details: Record<string, any>;
  documents?: { name: string; size: string }[];
  remarks?: string;

  // Payment & UTR Verification Details
  paymentStatus?: PaymentStatus;
  utrNumber?: string;
  paidAmount?: number;
  paymentMethod?: string;
  upiIdUsed?: string;
  paymentScreenshot?: string;
  paymentDate?: string;
  paymentVerifiedBy?: string;
  paymentVerifiedAt?: string;
  rejectionReason?: string;
}

export interface PaymentSubmission {
  ticketNumber: string;
  serviceId: string;
  serviceName: string;
  category?: string;
  applicantName: string;
  applicantPhone: string;
  amount: number;
  utrNumber: string;
  upiIdUsed?: string;
  paymentScreenshot?: string;
  paymentMethod?: string;
  status?: PaymentStatus;
}

export interface PricingItem {
  serviceId: string;
  serviceName: string;
  category: string;
  price: number;
  isActive?: boolean;
  processingTime?: string;
}

export interface PaymentGatewaySettings {
  upiId: string;
  payeeName: string;
  qrCodeImage: string;
  isPaymentRequired: boolean;
}

export interface TransactionRecord {
  id: string;
  title: string;
  amount: number;
  type: 'debit' | 'credit';
  wallet: WalletType;
  date: string;
  time: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  refId: string;
}

export interface CenterProfile {
  centerName: string;
  agentName: string;
  vleId: string;
  mobile: string;
  email: string;
  district: string;
  taluk: string;
  address: string;
  pincode: string;
  joiningDate: string;
  terminalId: string;
}
