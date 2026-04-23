'use client';

import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, Folder, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { DashboardStatsSkeleton } from '@/components/ui/loading-skeletons';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardPage() {
  const { stats, recentActivity, payments, loading } = useDashboardData();
  const [analytics, setAnalytics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    if (payments && payments.length > 0) {
      api.categories.getAnalytics(payments).then((data: any) => {
        setAnalytics(data.analytics);
        setTrends(data.trends);
      });
    }
  }, [payments]);

  const distributionData = analytics 
    ? analytics.map((a: any) => ({
        name: a.category,
        value: a.totalAmount,
        color: {
          subscription: '#3b82f6',
          invoice: '#10b981',
          donation: '#f59e0b',
          refund: '#ef4444',
          payroll: '#8b5cf6',
          software: '#06b6d4',
          infrastructure: '#6366f1',
          uncategorized: '#94a3b8',
        }[a.category] || '#94a3b8'
      })).filter((a: any) => a.value > 0)
    : [
        { name: 'Completed Projects', value: 65, color: '#10b981' },
        { name: 'Pending Payments', value: 20, color: '#f59e0b' },
        { name: 'Active Contracts', value: 15, color: '#3b82f6' },
      ];

  const trendData = trends.length > 0 ? trends : [
    { month: 'Jan', revenue: 12400, earnings: 9800 },
    { month: 'Feb', revenue: 15200, earnings: 11300 },
    { month: 'Mar', revenue: 18900, earnings: 14500 },
    { month: 'Apr', revenue: 22100, earnings: 16800 },
    { month: 'May', revenue: 19800, earnings: 15200 },
    { month: 'Jun', revenue: 25400, earnings: 20100 },
  ];

  const comparisonData = [
    { period: 'This Month', revenue: 25400, projects: 18 },
    { period: 'Last Month', revenue: 19800, projects: 14 },
    { period: 'This Quarter', revenue: 68200, projects: 47 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <DashboardStatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Line Chart - Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Category Trends
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                {trends.length > 0 && <Badge variant="secondary">Live Data</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {trends.length > 0 ? (
                    Object.keys(trends[0]).filter(k => k !== 'month').map((cat, idx) => (
                      <Line
                        key={cat}
                        type="monotone"
                        dataKey={cat}
                        stroke={[
                          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                          '#8b5cf6', '#06b6d4', '#6366f1', '#94a3b8'
                        ][idx % 8]}
                        strokeWidth={3}
                        name={cat.charAt(0).toUpperCase() + cat.slice(1)}
                      />
                    ))
                  ) : (
                    <>
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Earnings"
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Pie Chart - Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Spending Distribution
                {analytics && <Badge variant="secondary">Live Data</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 3. Bar Chart - Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" radius={4} />
                <Bar dataKey="projects" fill="#10b981" name="Projects" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity found.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-100 dark:border-green-900"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}