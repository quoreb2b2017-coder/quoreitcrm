'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIPELINE_COLORS: Record<string, string> = {
  applied: 'var(--primary)',
  screening: '#f59e0b',
  interview: '#3b82f6',
  offered: '#8b5cf6',
  hired: '#10b981',
  rejected: '#6b7280',
};

type PipelineItem = { name: string; count: number; fill: string };

export function PipelinePieChart({ data }: { data: PipelineItem[] }) {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function getPipelineChartColors(status: string): string {
  return PIPELINE_COLORS[status] ?? 'var(--muted-foreground)';
}
