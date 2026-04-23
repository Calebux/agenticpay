import { apiCall } from '@/lib/api/client';

export interface VerificationRequest {
    repositoryUrl: string;
    milestoneDescription: string;
    projectId: string;
}

export interface VerificationResponse {
    id: string;
    projectId: string;
    status: 'passed' | 'failed' | 'pending';
    score: number;
    summary: string;
    details: string[];
    verifiedAt: string;
}

export interface InvoiceRequest {
    projectId: string;
    workDescription: string;
    hoursWorked: number;
    hourlyRate: number;
}

export const api = {
    /**
     * AI Work Verification
     */
    verifyWork: async (data: VerificationRequest) => {
        return apiCall<VerificationResponse>('/verification/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    },

    /**
     * AI Invoice Generation
     */
    generateInvoice: async (data: InvoiceRequest) => {
        return apiCall('/invoice/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    },

    /**
     * Get Verification Result
     */
    getVerification: async (id: string) => {
        return apiCall(`/verification/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Categories API
     */
    categories: {
        getDefinitions: async () => {
            return apiCall('/categories/definitions', { method: 'GET' });
        },
        override: async (paymentId: string, category: string) => {
            return apiCall('/categories/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, category }),
            });
        },
        getAnalytics: async (payments: any[]) => {
            return apiCall('/categories/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payments }),
            });
        },
        export: async (payments: any[], category: string = 'all') => {
            return apiCall('/categories/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payments, category }),
            });
        }
    }
};
