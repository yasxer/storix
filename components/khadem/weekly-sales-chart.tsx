"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface WeeklySalesChartProps {
  data: { name: string; total: number }[]
}

export function WeeklySalesChart({ data }: WeeklySalesChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tickFormatter={(value) => `${value} DA`}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface)" }}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
            formatter={(value: number | string | readonly (number | string)[] | undefined) => [
              `${Number(value || 0).toLocaleString()} DA`,
              "Revenue",
            ]}
          />
          <Bar
            dataKey="total"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
