import React from 'react';
import { WalletCheckoutModal, WalletCheckoutModalProps } from './WalletCheckoutModal';

/**
 * PaymentModal - Decommissioned QR payment modal replaced by Cashfree WalletCheckoutModal
 */
export type PaymentModalProps = any;

export const PaymentModal: React.FC<any> = (props) => {
  return <WalletCheckoutModal {...props} />;
};

export default PaymentModal;
