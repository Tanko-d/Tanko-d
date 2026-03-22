"use client"

import { 
  Fuel, 
  Users, 
  Car, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

const stats = [
  {
    title: "Total Spent",
    value: "$1,234,567",
    change: "+12.5%",
    trend: "up",
    icon: Fuel,
    description: "This month"
  },
  {
    title: "Active Users",
    value: "248",
    change: "+8",
    trend: "up",
    icon: Users,
    description: "New this month"
  },
  {
    title: "Registered Units",
    value: "312",
    change: "+15",
    trend: "up",
    icon: Car,
    description: "Total active"
  },
  {
    title: "Liters Loaded",
    value: "45,678",
    change: "-2.3%",
    trend: "down",
    icon: TrendingUp,
    description: "This month"
  },
]

const consumptionData = [
  { month: "Jan", spend: 85000, liters: 3200 },
  { month: "Feb", spend: 92000, liters: 3450 },
  { month: "Mar", spend: 78000, liters: 2980 },
  { month: "Apr", spend: 105000, liters: 4100 },
  { month: "May", spend: 112000, liters: 4350 },
  { month: "Jun", spend: 98000, liters: 3800 },
]

const recentTransactions = [
  {
    id: 1,
    driver: "Juan Pérez",
    unit: "Kenworth T680",
    plates: "ABC-123-D",
    location: "Central CDMX Station",
    amount: 4500,
    liters: 180,
    date: "Today, 10:32 AM"
  },
  {
    id: 2,
    driver: "María García",
    unit: "Freightliner Cascadia",
    plates: "DEF-456-E",
    location: "Reforma Station",
    amount: 3200,
    liters: 128,
    date: "Today, 09:15 AM"
  },
  {
    id: 3,
    driver: "Carlos López",
    unit: "Volvo VNL",
    plates: "GHI-789-F",
    location: "North Station",
    amount: 5100,
    liters: 204,
    date: "Yesterday, 06:45 PM"
  },
  {
    id: 4,
    driver: "Ana Martínez",
    unit: "International LT",
    plates: "JKL-012-G",
    location: "South Express Station",
    amount: 2800,
    liters: 112,
    date: "Yesterday, 03:20 PM"
  },
  {
    id: 5,
    driver: "Roberto Sánchez",
    unit: "Peterbilt 579",
    plates: "MNO-345-H",
    location: "East Station",
    amount: 4200,
    liters: 168,
    date: "Yesterday, 11:00 AM"
  },
]

const topUnits = [
  { unit: "Kenworth T680", plates: "ABC-123-D", spend: 85000, liters: 3400 },
  { unit: "Freightliner Cascadia", plates: "DEF-456-E", spend: 72000, liters: 2880 },
  { unit: "Volvo VNL", plates: "GHI-789-F", spend: 68000, liters: 2720 },
  { unit: "International LT", plates: "JKL-012-G", spend: 55000, liters: 2200 },
  { unit: "Peterbilt 579", plates: "MNO-345-H", spend: 48000, liters: 1920 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Fleet fuel wallet — general usage summary</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spend</CardTitle>
            <CardDescription>Fuel spend (USD) over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString("en-US")}`, "Spend"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liters per Month</CardTitle>
            <CardDescription>Fuel volume loaded per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString("en-US")} L`, "Liters"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="liters" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest fuel loads registered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Fuel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.driver}</p>
                      <p className="text-xs text-muted-foreground">{tx.unit} - {tx.plates}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${tx.amount.toLocaleString("en-US")}</p>
                    <p className="text-xs text-muted-foreground">{tx.liters} L</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Consuming Units</CardTitle>
            <CardDescription>Top 5 units by fuel spend this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUnits.map((unit, index) => (
                <div 
                  key={unit.plates} 
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{unit.unit}</p>
                      <p className="text-xs text-muted-foreground">{unit.plates}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${unit.spend.toLocaleString("en-US")}</p>
                    <p className="text-xs text-muted-foreground">{unit.liters.toLocaleString("en-US")} L</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
