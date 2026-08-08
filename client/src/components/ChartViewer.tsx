/**
 * ChartViewer Component
 * Renders charts from query results using Recharts
 */

import { useMemo, useState } from 'react';
import { QueryResult } from '@/lib/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BarChart3, LineChart as LineChartIcon, Dot as ScatterIcon, PieChart as PieChartIcon } from 'lucide-react';

interface ChartViewerProps {
  result: QueryResult | null;
}

const COLORS = [
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#14b8a6', // teal
];

export default function ChartViewer({ result }: ChartViewerProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'scatter' | 'pie'>('bar');

  const chartData = useMemo(() => {
    if (!result || result.rows.length === 0) return null;

    const numericCols = result.columns.filter(c => c.type === 'numeric');
    const textCols = result.columns.filter(c => c.type === 'text');

    if (numericCols.length === 0) return null;

    return {
      data: result.rows,
      xAxis: textCols[0]?.name || numericCols[0]?.name,
      yAxis: numericCols[0]?.name,
      yAxis2: numericCols[1]?.name,
    };
  }, [result]);

  if (!result || !chartData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Execute a query with numeric data to visualize
        </p>
      </div>
    );
  }

  const { data, xAxis, yAxis, yAxis2 } = chartData;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chart Type Selector */}
      <div className="px-3 py-2 border-b border-border flex gap-2">
        <ToggleGroup type="single" value={chartType} onValueChange={(v) => v && setChartType(v as any)}>
          <ToggleGroupItem value="bar" title="Bar Chart" className="data-[state=on]:bg-accent">
            <BarChart3 size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="line" title="Line Chart" className="data-[state=on]:bg-accent">
            <LineChartIcon size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="scatter" title="Scatter Plot" className="data-[state=on]:bg-accent">
            <ScatterIcon size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="pie" title="Pie Chart" className="data-[state=on]:bg-accent">
            <PieChartIcon size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Chart Container */}
      <div className="flex-1 flex items-center justify-center p-4 bg-background/50">
        <ResponsiveContainer width="100%" height="100%">
          <>
          {chartType === 'bar' && (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey={xAxis}
                stroke="currentColor"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="currentColor" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
              />
              <Legend />
              <>
                <Bar dataKey={yAxis} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                {yAxis2 && (
                  <Bar dataKey={yAxis2} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                )}
              </>
            </BarChart>
          )}

          {chartType === 'line' && (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey={xAxis}
                stroke="currentColor"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="currentColor" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={yAxis}
                stroke="#06b6d4"
                dot={{ fill: '#06b6d4', r: 4 }}
                strokeWidth={2}
              />
              {yAxis2 ? (
                <Line
                  type="monotone"
                  dataKey={yAxis2}
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  strokeWidth={2}
                />
              ) : null}
            </LineChart>
          )}

          {chartType === 'scatter' && (
            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                type="number"
                dataKey={xAxis}
                stroke="currentColor"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="number"
                dataKey={yAxis}
                stroke="currentColor"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Scatter name={yAxis} data={data} fill="#06b6d4" />
            </ScatterChart>
          )}

          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#06b6d4"
                dataKey={yAxis}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          )}
          </>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
