import { ApplicationRecord } from '../types';
import { applicationApi } from '../services/applicationApi';
import { aadhaarApi } from '../services/aadhaarApi';
import { rationApi } from '../services/rationApi';
import { panApi } from '../services/panApi';
import { voterApi } from '../services/voterApi';
import { drivingApi } from '../services/drivingApi';
import { vehicleApi } from '../services/vehicleApi';
import { paymentApi } from '../services/paymentApi';

/**
 * Extracts a reliable epoch millisecond timestamp from an ApplicationRecord
 * to ensure applications are always strictly ordered with the newest/latest first.
 */
export function getAppTimestamp(app: ApplicationRecord): number {
  if (!app) return 0;

  // 1. Check details.createdAt or details.submittedAt
  if (app.details?.createdAt) {
    const t = new Date(app.details.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (app.details?.submittedAt) {
    const t = new Date(app.details.submittedAt).getTime();
    if (!isNaN(t)) return t;
  }

  // 2. Check paymentDate
  if (app.paymentDate) {
    const t = new Date(app.paymentDate).getTime();
    if (!isNaN(t)) return t;
  }

  // 3. Extract timestamp from id e.g. "app-1732601938123" or "pay-1732601938123"
  const idMatch = String(app.id || '').match(/\d{10,}/);
  if (idMatch) {
    const t = parseInt(idMatch[0], 10);
    if (!isNaN(t) && t > 1000000000) return t;
  }

  // 4. Extract timestamp from tokenNumber or ticketNumber e.g. "RAT-1732601938123"
  const tokenMatch = String(app.tokenNumber || app.details?.ticketNumber || '').match(/\d{10,}/);
  if (tokenMatch) {
    const t = parseInt(tokenMatch[0], 10);
    if (!isNaN(t) && t > 1000000000) return t;
  }

  // 5. Parse date string
  if (app.date) {
    const parsed = Date.parse(app.date);
    if (!isNaN(parsed)) return parsed;
  }

  return 0;
}

/**
 * Standardizes any backend service queue status (Aadhaar, Ration, PAN, Voter, Driving, Vehicle)
 * into a consistent frontend application status and payment status.
 */
export function mapBackendStatusToAppStatus(backendStatus?: string): {
  status: 'Pending' | 'In Process' | 'Completed' | 'Rejected' | 'Under Review';
  paymentStatus: 'Pending Verification' | 'Verified & Approved' | 'Rejected';
  displayLabel: string;
} {
  const s = (backendStatus || '').trim();
  const lower = s.toLowerCase();

  // Completed / Resolved / Approved states
  if (
    lower.includes('resolved') ||
    lower.includes('completed') ||
    lower.includes('approved') ||
    lower.includes('issued') ||
    lower.includes('closed')
  ) {
    return {
      status: 'Completed',
      paymentStatus: 'Verified & Approved',
      displayLabel: 'Approved & Completed / அங்கீகரிக்கப்பட்டது',
    };
  }

  // Active / In Process states
  if (
    lower.includes('in progress') ||
    lower.includes('in process') ||
    lower.includes('slot') ||
    lower.includes('inspection') ||
    lower.includes('verified')
  ) {
    return {
      status: 'In Process',
      paymentStatus: 'Verified & Approved',
      displayLabel: 'In Process / செயல்பாட்டில்',
    };
  }

  // Rejection states
  if (lower.includes('reject') || lower.includes('cancel')) {
    return {
      status: 'Rejected',
      paymentStatus: 'Rejected',
      displayLabel: 'Rejected / நிராகரிக்கப்பட்டது',
    };
  }

  // Default: Pending / Under Review
  return {
    status: 'Under Review',
    paymentStatus: 'Pending Verification',
    displayLabel: 'Pending Verification / சரிபார்ப்பு நிலுவை',
  };
}

/**
 * Updates an application's status in all localStorage stores (current user and global)
 * and dispatches storage and custom events to update React state across all views.
 */
export function syncTicketStatusToLocal(
  ticketIdOrNumber: string,
  newStatus: string,
  remarks?: string,
  ackNumber?: string
): void {
  if (!ticketIdOrNumber) return;

  const mapped = mapBackendStatusToAppStatus(newStatus);
  const targetId = String(ticketIdOrNumber).trim();

  // Persist directly to MongoDB database
  applicationApi.updateStatus(targetId, mapped.status, remarks, ackNumber).catch((err) => {
    console.warn('Failed to update status in MongoDB:', err);
  });

  try {
    const keysToUpdate = Object.keys(localStorage).filter(
      (k) => k.startsWith('esevai_apps_') || k === 'esevai_all_payments'
    );

    keysToUpdate.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;

        if (key === 'esevai_all_payments') {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            let changed = false;
            const updated = list.map((item) => {
              if (
                item._id === targetId ||
                item.ticketNumber === targetId ||
                item.utrNumber === targetId
              ) {
                changed = true;
                return {
                  ...item,
                  status: mapped.paymentStatus,
                  adminRemarks: remarks || item.adminRemarks,
                  verifiedAt: new Date().toISOString(),
                };
              }
              return item;
            });
            if (changed) {
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        } else {
          // esevai_apps_*
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            let changed = false;
            const updated = list.map((app: ApplicationRecord) => {
              const matches =
                app.id === targetId ||
                app.tokenNumber === targetId ||
                app.details?.ticketNumber === targetId ||
                app.details?._id === targetId ||
                app.utrNumber === targetId ||
                (ackNumber && app.details?.ackNumber === ackNumber);

              if (matches) {
                changed = true;
                return {
                  ...app,
                  status: mapped.status,
                  paymentStatus: mapped.paymentStatus,
                  remarks: remarks || app.remarks,
                  details: {
                    ...(app.details || {}),
                    backendStatus: newStatus,
                    resolutionRemarks: remarks || app.details?.resolutionRemarks,
                    ackNumber: ackNumber || app.details?.ackNumber,
                  },
                };
              }
              return app;
            });
            if (changed) {
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        }
      } catch {}
    });

    // Notify all tabs and active AppContext listeners
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(
      new CustomEvent('app_status_updated', {
        detail: {
          ticketId: targetId,
          newStatus,
          mappedStatus: mapped.status,
          mappedPaymentStatus: mapped.paymentStatus,
          remarks,
          ackNumber,
        },
      })
    );
  } catch (err) {
    console.warn('Could not sync ticket status locally:', err);
  }
}

/**
 * Live reconciliation: Queries all backend service queues and payments from MongoDB,
 * and updates local ApplicationRecord statuses with real database records.
 * Always ensures the newest/latest data appears first (descending).
 */
export async function syncLiveApplicationsWithBackend(
  currentApplications: ApplicationRecord[]
): Promise<ApplicationRecord[]> {
  try {
    const [
      appDbRes,
      aadhaarRes,
      rationRes,
      panRes,
      voterRes,
      drivingRes,
      vehicleRes,
      paymentRes,
    ] = await Promise.allSettled([
      applicationApi.listApplications({ scope: 'all', limit: 200 }),
      aadhaarApi.listIssues({ scope: 'all', limit: 100 }),
      rationApi.listRequests({ scope: 'all', limit: 100 }),
      panApi.listRequests({ scope: 'all', limit: 100 }),
      voterApi.listRequests({ scope: 'all', limit: 100 }),
      drivingApi.listRequests({ scope: 'all', limit: 100 }),
      vehicleApi.listRequests({ scope: 'all', limit: 100 }),
      paymentApi.getAllPayments({ status: 'all' }),
    ]);

    // Flatten all retrieved backend tickets into a lookup map
    const backendTickets: Array<{
      id: string;
      ticketNumber?: string;
      serviceName?: string;
      serviceType?: string;
      applicantName?: string;
      status: string;
      remarks?: string;
      ackNumber?: string;
      phone?: string;
      createdAt?: string;
    }> = [];

    // Safe array extraction helper for all queue response shapes
    const extractList = (res: any, key?: string): any[] => {
      if (!res || res.status !== 'fulfilled' || !res.value) return [];
      const val = res.value;
      if (key && val?.data && Array.isArray(val.data[key])) return val.data[key];
      if (val?.data?.requests && Array.isArray(val.data.requests)) return val.data.requests;
      if (val?.data?.issues && Array.isArray(val.data.issues)) return val.data.issues;
      if (Array.isArray(val?.data)) return val.data;
      if (Array.isArray(val)) return val;
      return [];
    };

    // 0. Central MongoDB Applications
    const appDbItems = extractList(appDbRes);
    appDbItems.forEach((item: any) => {
      backendTickets.push({
        id: item._id,
        ticketNumber: item.tokenNumber,
        serviceName: item.serviceName,
        applicantName: item.applicantName,
        status: item.status,
        remarks: item.remarks,
        ackNumber: item.ackNumber,
        phone: item.applicantPhone,
        createdAt: item.createdAt,
      });
    });

    if (aadhaarRes.status === 'fulfilled' && aadhaarRes.value?.data?.issues) {
      aadhaarRes.value.data.issues.forEach((item: any) => {
        backendTickets.push({
          id: item._id,
          ticketNumber: item.ticketNumber,
          serviceName: item.issueType || 'Aadhaar Service',
          applicantName: item.applicantName,
          status: item.status,
          remarks: item.resolutionRemarks,
          phone: item.applicantPhone,
          createdAt: item.createdAt,
        });
      });
    }

    const rationItems = extractList(rationRes);
    rationItems.forEach((item: any) => {
      backendTickets.push({
        id: item._id,
        ticketNumber: item.ticketNumber,
        serviceName: item.serviceType || 'Ration Smart Card',
        applicantName: item.applicantName,
        status: item.status,
        remarks: item.resolutionRemarks,
        ackNumber: item.tnpdsAckNumber,
        phone: item.applicantPhone,
        createdAt: item.createdAt,
      });
    });

    const panItems = extractList(panRes, 'requests');
    panItems.forEach((item: any) => {
      backendTickets.push({
        id: item._id,
        ticketNumber: item.ticketNumber,
        serviceName: item.serviceType || 'PAN Card Service',
        applicantName: item.applicantName,
        status: item.status,
        remarks: item.resolutionRemarks,
        ackNumber: item.nsdlUtiiAckNumber,
        phone: item.applicantPhone,
        createdAt: item.createdAt,
      });
    });

    const voterItems = extractList(voterRes, 'requests');
    voterItems.forEach((item: any) => {
      backendTickets.push({
        id: item._id,
        ticketNumber: item.ticketNumber,
        serviceName: item.serviceType || 'Voter ID Service',
        applicantName: item.applicantName,
        status: item.status,
        remarks: item.resolutionRemarks,
        ackNumber: item.eciReferenceNumber,
        phone: item.applicantPhone,
        createdAt: item.createdAt,
      });
    });

    const drivingItems = extractList(drivingRes);
    drivingItems.forEach((item: any) => {
      backendTickets.push({
        id: item._id,
        ticketNumber: item.ticketNumber,
        serviceName: item.serviceType || 'Driving License Service',
        applicantName: item.applicantName,
        status: item.status,
        remarks: item.resolutionRemarks,
        ackNumber: item.sarathiAckNumber,
        phone: item.applicantPhone,
        createdAt: item.createdAt,
      });
    });

    const vehicleItems = extractList(vehicleRes);
    vehicleItems.forEach((item: any) => {
      backendTickets.push({
        id: item._id,
        ticketNumber: item.ticketNumber,
        serviceName: item.serviceType || 'Vehicle Registration / Vahan',
        applicantName: item.ownerName || item.applicantName,
        status: item.status,
        remarks: item.resolutionRemarks,
        ackNumber: item.vahanAckNumber,
        phone: item.applicantPhone,
        createdAt: item.createdAt,
      });
    });

    // Payment verification records
    const paymentsList =
      paymentRes.status === 'fulfilled' && Array.isArray(paymentRes.value?.payments)
        ? paymentRes.value.payments
        : [];

    let hasChanges = false;
    let reconciled = currentApplications.map((app) => {
      // Find matching backend ticket
      const match = backendTickets.find(
        (bt) =>
          (bt.ticketNumber && app.tokenNumber === bt.ticketNumber) ||
          (bt.ticketNumber && app.details?.ticketNumber === bt.ticketNumber) ||
          (bt.id && (app.id === bt.id || app.details?._id === bt.id))
      );

      // Find matching payment record
      const payMatch = paymentsList.find(
        (p: any) =>
          (p.ticketNumber && app.tokenNumber === p.ticketNumber) ||
          (p.ticketNumber && app.details?.ticketNumber === p.ticketNumber) ||
          (p.utrNumber && app.utrNumber === p.utrNumber)
      );

      let nextStatus = app.status;
      let nextPaymentStatus = app.paymentStatus;
      let nextRemarks = app.remarks;

      if (match) {
        const mapped = mapBackendStatusToAppStatus(match.status);
        nextStatus = mapped.status;
        nextPaymentStatus = mapped.paymentStatus;
        if (match.remarks) nextRemarks = match.remarks;
      }

      if (payMatch) {
        if (payMatch.status === 'Verified & Approved') {
          nextPaymentStatus = 'Verified & Approved';
          if (nextStatus === 'Under Review' || nextStatus === 'Pending') {
            nextStatus = 'In Process';
          }
        } else if (payMatch.status === 'Rejected') {
          nextPaymentStatus = 'Rejected';
          nextStatus = 'Rejected';
        }
        if (payMatch.adminRemarks) {
          nextRemarks = payMatch.adminRemarks;
        }
      }

      if (
        nextStatus !== app.status ||
        nextPaymentStatus !== app.paymentStatus ||
        nextRemarks !== app.remarks
      ) {
        hasChanges = true;
        return {
          ...app,
          status: nextStatus,
          paymentStatus: nextPaymentStatus,
          remarks: nextRemarks,
          details: {
            ...(app.details || {}),
            backendStatus: match?.status || app.details?.backendStatus,
            resolutionRemarks: match?.remarks || app.details?.resolutionRemarks,
            ackNumber: match?.ackNumber || app.details?.ackNumber,
            createdAt: match?.createdAt || app.details?.createdAt,
          },
        };
      }

      return app;
    });

    // Also include any backend tickets not yet present locally so all recent submissions appear:
    backendTickets.forEach((bt) => {
      const alreadyPresent = reconciled.some(
        (a) =>
          (bt.ticketNumber && a.tokenNumber === bt.ticketNumber) ||
          (bt.ticketNumber && a.details?.ticketNumber === bt.ticketNumber) ||
          (bt.id && (a.id === bt.id || a.details?._id === bt.id))
      );
      if (!alreadyPresent && bt.ticketNumber) {
        hasChanges = true;
        const mapped = mapBackendStatusToAppStatus(bt.status);
        reconciled.unshift({
          id: bt.id || `app-${Date.now()}`,
          tokenNumber: bt.ticketNumber,
          serviceId: 'esevai-service',
          serviceName: bt.serviceName || bt.serviceType || 'e-Sevai Service',
          applicantName: bt.applicantName || 'Citizen',
          mobile: bt.phone || '',
          date: bt.createdAt ? new Date(bt.createdAt).toLocaleString() : new Date().toLocaleString(),
          status: mapped.status,
          fee: 0,
          walletType: 'payments',
          paymentStatus: mapped.paymentStatus,
          remarks: bt.remarks || '',
          details: {
            ticketNumber: bt.ticketNumber,
            _id: bt.id,
            backendStatus: bt.status,
            resolutionRemarks: bt.remarks,
            ackNumber: bt.ackNumber,
            createdAt: bt.createdAt,
          },
        });
      }
    });

    // ALWAYS strictly sort: newest/latest application first (descending timestamp)
    reconciled.sort((a, b) => getAppTimestamp(b) - getAppTimestamp(a));

    return reconciled;
  } catch (err) {
    console.warn('Live application status reconciliation skipped:', err);
    return currentApplications;
  }
}
