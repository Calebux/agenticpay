'use client';

import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Wallet,
  Loader2,
  QrCode,
  Tag,
  Download,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PaymentCardSkeleton } from '@/components/ui/loading-skeletons';
import { EmptyState } from '@/components/empty/EmptyState';
import { formatDateTimeInTimeZone } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { PaymentQRModal } from '@/components/payment/QRCode';

export default function PaymentsPage() {
  const router = useRouter();
  const { payments, loading } = useDashboardData();
  const timezone = useAuthStore((state) => state.timezone);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const address = useAuthStore((state) => state.address);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    'subscription',
    'invoice',
    'donation',
    'refund',
    'payroll',
    'software',
    'infrastructure',
    'uncategorized',
  ];

  const handleCategoryOverride = async (paymentId: string, category: string) => {
    try {
      await api.categories.override(paymentId, category);
      toast.success('Category updated successfully');
      // In a real app, we'd refetch or update local state
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.categories.export(payments, filterCategory);
      // Create a blob and download it
      const blob = new Blob([response as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${filterCategory}.csv`;
      a.click();
      toast.success('Export started');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const filteredPayments = filterCategory === 'all' 
    ? payments 
    : payments.filter(p => p.category === filterCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payment History
          </h1>
          <p className="text-gray-600 mt-1">
            View all your payment transactions
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payments...
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <PaymentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payment History
          </h1>
          <p className="text-gray-600 mt-1">
            View all your payment transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {filterCategory === 'all' ? 'All Categories' : filterCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                All Categories
              </DropdownMenuItem>
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          {address && (
            <Button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Receive Payment
            </Button>
          )}
        </div>
      </div>

      {/* --- PAYMENT LIST --- */}
      <div className="space-y-4">
        {filteredPayments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(payment.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{payment.projectTitle}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="focus:outline-none">
                              <Badge variant="secondary" className="hover:bg-gray-200 cursor-pointer flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {payment.category}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {categories.map(cat => (
                              <DropdownMenuItem key={cat} onClick={() => handleCategoryOverride(payment.id, cat)}>
                                {cat}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.type === 'milestone_payment' ? 'Milestone Payment' : 'Full Payment'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTimeInTimeZone(payment.timestamp, timezone)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {payment.amount} {payment.currency}
                    </p>
                    {payment.transactionHash && (
                      <a
                        href={`https://testnet.cronoscan.com/tx/${payment.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 justify-end"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                {payment.transactionHash && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 font-mono break-all">
                      {payment.transactionHash}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Wallet}
              title="No payments found"
              description={filterCategory === 'all' ? "Your payment history will appear here once you receive payments." : `No payments found in the "${filterCategory}" category.`}
              action={filterCategory === 'all' ? {
                label: 'View Projects',
                onClick: () => router.push('/dashboard/projects'),
              } : {
                label: 'Clear Filter',
                onClick: () => setFilterCategory('all'),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* QR Modal */}
      {address && (
        <PaymentQRModal
          address={address}
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
}
