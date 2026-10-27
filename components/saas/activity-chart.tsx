"use client";
// filename: components/saas/activity-chart.tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
const config = {
  events: { label: "Activity", color: "var(--primary)" },
} satisfies ChartConfig;
export function ActivityChart({
  data,
}: {
  data: { day: string; events: number }[];
}) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground mb-4 text-xs">
        Persisted organization activity · latest 100 events · 7 days · UTC
      </p>
      <ChartContainer config={config} className="h-56 w-full min-w-0">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            isAnimationActive={false}
            dataKey="events"
            fill="var(--color-events)"
            radius={4}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
