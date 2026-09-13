"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Building2, Users, CreditCard, BarChart4, ShieldCheck, Mail, Phone, Globe, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Table, Tag, Typography as AntTypography } from "antd";
import { useList } from "@/hooks/api/useList";
import dayjs from "dayjs";

const { Text } = AntTypography;

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    revenueThisMonth: 0,
  });

  useEffect(() => {
    // In a real implementation, you would fetch real data
    // For now, let's simulate loading data
    const timer = setTimeout(() => {
      setStats({
        totalCompanies: 42,
        totalUsers: 156,
        activeSubscriptions: 28,
        trialSubscriptions: 14,
        expiredSubscriptions: 8,
        revenueThisMonth: 12650,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const { data: regData, isLoading: regLoading } = useList<any>("registered-agencies-home", "/api/admin/registered-agencies", {
    page,
    limit,
  });

  const regRows = regData?.data?.items || [];
  const regTotal = regData?.data?.total || 0;

  const regColumns = [
    {
      title: "SL",
      dataIndex: "serial_no",
      key: "serial_no",
      width: 60,
      render: (sn: number) => <span className="text-xs text-slate-400 font-mono">{sn}</span>,
    },
    {
      title: "Agency & License",
      dataIndex: "agency_name_license",
      key: "agency_name_license",
      render: (text: string) => {
        const [name, license] = text.split('\n')
        return (
          <div>
            <div className="font-bold text-slate-800 leading-tight">{name}</div>
            <div className="text-[10px] text-slate-500">Lic: {license}</div>
          </div>
        )
      },
    },
    {
      title: "Contact",
      dataIndex: "agency_email_number_website",
      key: "contact",
      render: (text: string) => {
        const parts = text?.split('\n').filter(Boolean)
        return (
          <div className="text-xs space-y-0.5">
            {parts?.slice(0, 2).map((part, index) => (
              <div key={index} className="truncate max-w-[150px]">{part}</div>
            ))}
          </div>
        )
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => {
        const expiryDate = record.license_expired_date
        const isExpired = dayjs(expiryDate).isBefore(dayjs())
        return (
          <Tag color={isExpired ? "error" : "success"} className="text-[10px] uppercase font-bold px-2 py-0">
            {isExpired ? "Expired" : "Valid"}
          </Tag>
        )
      },
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || session.user.userType !== "PLATFORM") {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access this page. Please log in with a platform account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session.user.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-gray-500 mt-1">
              <Link href="/admin/companies" className="text-primary">View all companies</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              <Link href="/admin/users" className="text-primary">Manage users</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Agencies</CardTitle>
            <ShieldCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,258</div>
            <p className="text-xs text-gray-500 mt-1">
              <Link href="/admin/registered-agencies" className="text-primary">View registry</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500">+{stats.trialSubscriptions} trial</span> / <span className="text-red-500">{stats.expiredSubscriptions} expired</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <BarChart4 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenueThisMonth.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              <Link href="/admin/analytics" className="text-primary">View analytics</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest activities in your admin portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-2 border-primary pl-4 py-1">
              <p className="font-medium">New company registered</p>
              <p className="text-sm text-gray-500">TravelPlus Agency registered 2 hours ago</p>
            </div>
            <div className="border-l-2 border-primary pl-4 py-1">
              <p className="font-medium">Subscription upgraded</p>
              <p className="text-sm text-gray-500">GlobeExplorer Agency upgraded to Premium 5 hours ago</p>
            </div>
            <div className="border-l-2 border-primary pl-4 py-1">
              <p className="font-medium">Support request</p>
              <p className="text-sm text-gray-500">Adventure Travel reported an issue with payments 1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Government Registered Agencies</CardTitle>
              <CardDescription>Latest travel agencies from the official registry.</CardDescription>
            </div>
            <Link href="/admin/registered-agencies">
               <Button variant="outline" size="sm">View Full Registry</Button>
             </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              columns={regColumns}
              dataSource={regRows}
              rowKey="id"
              loading={regLoading}
              pagination={{
                current: page,
                pageSize: limit,
                total: regTotal,
                showSizeChanger: true,
                onChange: (p, ps) => {
                  setPage(p)
                  setLimit(ps)
                },
                size: "small",
              }}
              className="border-t"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
