'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HiresPerMonthItem } from '@/types';

export function HiresBarChart({ data }: { data: HiresPerMonthItem[] }) {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          stroke="var(--border)"
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          stroke="var(--border)"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'var(--foreground)' }}
        />
        <Bar
          dataKey="count"
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
          name="Hires"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
