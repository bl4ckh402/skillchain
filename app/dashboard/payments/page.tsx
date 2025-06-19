"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  CreditCard,
  Wallet,
  DollarSign,
  Calendar,
  ChevronDown,
  Filter,
  ArrowDown,
  Users,
  FileText,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

const PaymentsDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [tableFilter, setTableFilter] = useState("all");
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Mock data - in a real app this would come from your API
  const earningsData = [
    { month: "Jan", earnings: 0 },
    { month: "Feb", earnings: 0 },
    { month: "Mar", earnings: 1200 },
    { month: "Apr", earnings: 2400 },
    { month: "May", earnings: 1800 },
    { month: "Jun", earnings: 3200 },
    { month: "Jul", earnings: 4800 },
    { month: "Aug", earnings: 3600 },
    { month: "Sep", earnings: 5200 },
    { month: "Oct", earnings: 6400 },
    { month: "Nov", earnings: 5800 },
    { month: "Dec", earnings: 7200 },
  ];

  const paymentMethodsData = [
    { name: "Credit Card", value: 70 },
    { name: "PayPal", value: 15 },
    { name: "Crypto", value: 15 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const studentsByCountry = [
    { country: "United States", count: 87 },
    { country: "Germany", count: 45 },
    { country: "India", count: 32 },
    { country: "United Kingdom", count: 28 },
    { country: "Canada", count: 20 },
  ];

  const recentTransactions = [
    {
      id: "tx1",
      date: "2023-11-20",
      studentName: "John Doe",
      studentAvatar: "",
      amount: 49.99,
      course: "Blockchain Fundamentals",
      status: "completed",
      paymentMethod: "credit-card",
    },
    {
      id: "tx2",
      date: "2023-11-18",
      studentName: "Sarah Wilson",
      studentAvatar: "",
      amount: 79.99,
      course: "Smart Contract Development",
      status: "completed",
      paymentMethod: "paypal",
    },
    {
      id: "tx3",
      date: "2023-11-15",
      studentName: "Michael Chen",
      studentAvatar: "",
      amount: 99.99,
      course: "DeFi Masterclass",
      status: "completed",
      paymentMethod: "crypto",
    },
    {
      id: "tx4",
      date: "2023-11-10",
      studentName: "Emma Thompson",
      studentAvatar: "",
      amount: 49.99,
      course: "Blockchain Fundamentals",
      status: "completed",
      paymentMethod: "credit-card",
    },
    {
      id: "tx5",
      date: "2023-11-05",
      studentName: "Alex Rodriguez",
      studentAvatar: "",
      amount: 29.99,
      course: "Web3 Introduction",
      status: "pending",
      paymentMethod: "paypal",
    },
  ];

  // Helper functions for formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Calculate stats
  const totalEarnings = earningsData.reduce(
    (sum, item) => sum + item.earnings,
    0
  );
  const thisMonthEarnings = earningsData[11].earnings; // December
  const lastMonthEarnings = earningsData[10].earnings; // November
  const monthlyChange = thisMonthEarnings - lastMonthEarnings;
  const monthlyChangePercent = (monthlyChange / lastMonthEarnings) * 100;

  const handleTimeRangeChange = (value: any) => {
    setTimeRange(value);
    // In a real app, you would fetch data for the new time range
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    // In a real app, you would:
    // 1. Call your backend API to get a Stripe account connection link
    // 2. Redirect the user to Stripe to complete the onboarding
    setTimeout(() => {
      setStripeConnected(true);
      setStripeLoading(false);
      setShowConnectModal(false);
    }, 1500);
  };

  const filteredTransactions = recentTransactions.filter((tx) => {
    if (tableFilter === "all") return true;
    if (tableFilter === "completed" && tx.status === "completed") return true;
    if (tableFilter === "pending" && tx.status === "pending") return true;
    return false;
  });

  // Modal Component for Stripe Connect
  const ConnectStripeModal = ({
    isOpen,
    onClose,
    onConnect,
    isLoading,
  }: {
    isOpen: boolean;
    onClose: any;
    onConnect: any;
    isLoading: boolean;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Connect with Stripe</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Connect your Stripe account to receive payments directly to your
            bank account. Stripe is our payment processor that handles all
            transactions securely.
          </p>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              onClick={onConnect}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect Stripe Account"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Stripe Connect Modal */}
      <ConnectStripeModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnectStripe}
        isLoading={stripeLoading}
      />

      <div className="py-8 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Payments Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your earnings and payments
              </p>
            </div>

            {stripeConnected ? (
              <Badge className="flex items-center gap-1 px-3 py-1 text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300">
                <CreditCard className="w-4 h-4" />
                Connected to Stripe
              </Badge>
            ) : (
              <Button
                className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                onClick={() => setShowConnectModal(true)}
                disabled={stripeLoading}
              >
                {stripeLoading ? "Connecting..." : "Connect with Stripe"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-6">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
            <TabsList className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800/50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Payouts
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[160px] border-blue-200 dark:border-blue-800">
                  <SelectValue placeholder="Select Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                  <SelectItem value="alltime">All time</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-blue-200 dark:border-blue-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardDescription>Total Earnings</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(totalEarnings)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    {monthlyChange > 0 ? (
                      <>
                        <Badge className="text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          {monthlyChangePercent.toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          from last month
                        </span>
                      </>
                    ) : (
                      <>
                        <Badge className="text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-300">
                          <ArrowDown className="w-3 h-3 mr-1" />
                          {Math.abs(monthlyChangePercent).toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          from last month
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardDescription>This Month</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(thisMonthEarnings)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <Badge className="text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                      <Calendar className="w-3 h-3 mr-1" />
                      December
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      monthly earnings
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardDescription>Available for Payout</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(thisMonthEarnings * 0.8)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      Request Payout
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Next automatic: Dec 31
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg">Earnings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earningsData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#ccc"
                          strokeOpacity={0.3}
                        />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => `$${value}`}
                          domain={[0, "dataMax + 1000"]}
                        />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Earnings"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-rows-2">
                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {paymentMethodsData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {studentsByCountry.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span>{item.country}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {item.count} students
                            </span>
                            <div className="w-16 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="h-full bg-blue-500"
                                style={{
                                  width: `${
                                    (item.count / studentsByCountry[0].count) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2 font-medium text-left">Date</th>
                        <th className="p-2 font-medium text-left">Student</th>
                        <th className="p-2 font-medium text-left">Course</th>
                        <th className="p-2 font-medium text-left">Amount</th>
                        <th className="p-2 font-medium text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.slice(0, 5).map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="p-2 text-sm">{formatDate(tx.date)}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={tx.studentAvatar}
                                  alt={tx.studentName}
                                />
                                <AvatarFallback className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                  {tx.studentName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{tx.studentName}</span>
                            </div>
                          </td>
                          <td className="p-2 text-sm">{tx.course}</td>
                          <td className="p-2 text-sm font-medium">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(tx.status)}>
                              {tx.status.charAt(0).toUpperCase() +
                                tx.status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("transactions")}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    View All Transactions
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <CardTitle>All Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-9 w-full md:w-[240px] border-blue-200 dark:border-blue-800"
                    />
                  </div>
                  <Select value={tableFilter} onValueChange={setTableFilter}>
                    <SelectTrigger className="w-[130px] border-blue-200 dark:border-blue-800">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3 font-medium text-left">
                          Transaction ID
                        </th>
                        <th className="p-3 font-medium text-left">Date</th>
                        <th className="p-3 font-medium text-left">Student</th>
                        <th className="p-3 font-medium text-left">Course</th>
                        <th className="p-3 font-medium text-left">Amount</th>
                        <th className="p-3 font-medium text-left">
                          Payment Method
                        </th>
                        <th className="p-3 font-medium text-left">Status</th>
                        <th className="p-3 font-medium text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="p-3 font-mono text-sm">{tx.id}</td>
                          <td className="p-3 text-sm">{formatDate(tx.date)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={tx.studentAvatar}
                                  alt={tx.studentName}
                                />
                                <AvatarFallback className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                  {tx.studentName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{tx.studentName}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{tx.course}</td>
                          <td className="p-3 text-sm font-medium">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {tx.paymentMethod === "credit-card" && (
                                <CreditCard className="w-4 h-4 text-blue-500" />
                              )}
                              {tx.paymentMethod === "paypal" && (
                                <DollarSign className="w-4 h-4 text-blue-500" />
                              )}
                              {tx.paymentMethod === "crypto" && (
                                <Wallet className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-sm capitalize">
                                {tx.paymentMethod.replace("-", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(tx.status)}>
                              {tx.status.charAt(0).toUpperCase() +
                                tx.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {filteredTransactions.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {recentTransactions.length}
                    </span>{" "}
                    transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400"
                    >
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>
                      View your payout history and schedule future payouts
                    </CardDescription>
                  </div>
                  <Button
                    className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    disabled={!stripeConnected}
                  >
                    Request Payout
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stripeConnected ? (
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="border-blue-100 dark:border-blue-900">
                        <CardHeader className="pb-2">
                          <CardDescription>
                            Available for Payout
                          </CardDescription>
                          <CardTitle>
                            {formatCurrency(thisMonthEarnings * 0.8)}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border-blue-100 dark:border-blue-900">
                        <CardHeader className="pb-2">
                          <CardDescription>Pending Balance</CardDescription>
                          <CardTitle>
                            {formatCurrency(thisMonthEarnings * 0.2)}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border-blue-100 dark:border-blue-900">
                        <CardHeader className="pb-2">
                          <CardDescription>
                            Next Automatic Payout
                          </CardDescription>
                          <CardTitle>Dec 31, 2023</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    <div>
                      <h3 className="mb-4 font-medium">Recent Payouts</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="p-3 font-medium text-left">
                                Date
                              </th>
                              <th className="p-3 font-medium text-left">
                                Amount
                              </th>
                              <th className="p-3 font-medium text-left">
                                Status
                              </th>
                              <th className="p-3 font-medium text-left">
                                Destination
                              </th>
                              <th className="p-3 font-medium text-left">
                                Receipt
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <td className="p-3 text-sm">Nov 30, 2023</td>
                              <td className="p-3 text-sm font-medium">
                                {formatCurrency(5800 * 0.8)}
                              </td>
                              <td className="p-3">
                                <Badge className="text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300">
                                  Completed
                                </Badge>
                              </td>
                              <td className="p-3 text-sm">
                                Bank Account (•••• 1234)
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="sr-only">View receipt</span>
                                </Button>
                              </td>
                            </tr>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <td className="p-3 text-sm">Oct 31, 2023</td>
                              <td className="p-3 text-sm font-medium">
                                {formatCurrency(6400 * 0.8)}
                              </td>
                              <td className="p-3">
                                <Badge className="text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300">
                                  Completed
                                </Badge>
                              </td>
                              <td className="p-3 text-sm">
                                Bank Account (•••• 1234)
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="sr-only">View receipt</span>
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentsDashboard;
