'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { ForecastPoint } from '@/types/prediction';
import { formatPrice, futureDate } from '@/lib/formatters';
import Card from './ui/Card';

interface ForecastChartProps {
  forecast: ForecastPoint[];
  currentPrice: number;
  action: 'BUY' | 'WAIT';
  predictedDaysToDrop: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-surface border border-surface-border rounded-xl px-3 py-2 shadow-xl">
      <div className="text-text-primary font-semibold text-sm">
        {formatPrice(data.predictedPrice)}
      </div>
      <div className="text-text-muted text-xs">
        {data.daysFromNow === 0 ? 'Today' : `${futureDate(data.daysFromNow)} (Day ${data.daysFromNow})`}
      </div>
    </div>
  );
}

export default function ForecastChart({ forecast, currentPrice, action, predictedDaysToDrop }: ForecastChartProps) {
  const isTeal = action === 'WAIT';

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = forecast.map(f => f.predictedPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.15;
    return { minPrice: Math.floor(min - padding), maxPrice: Math.ceil(max + padding) };
  }, [forecast]);

  const gradientId = 'forecastGradient';
  const lineColor = isTeal ? '#00D4AA' : '#FF9F1C';
  const gradientColor = isTeal ? '0, 212, 170' : '255, 159, 28';

  return (
    <Card className="p-4 animate-fade-in-up delay-600">
      <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-4">
        30-Day Price Forecast
      </h3>
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`rgba(${gradientColor}, 0.3)`} />
                <stop offset="100%" stopColor={`rgba(${gradientColor}, 0.02)`} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E2A45"
              vertical={false}
            />
            <XAxis
              dataKey="daysFromNow"
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v === 0 ? 'Now' : `${v}d`}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={currentPrice}
              stroke="#64748B"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            {isTeal && predictedDaysToDrop > 0 && (
              <ReferenceLine
                x={predictedDaysToDrop}
                stroke={lineColor}
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: 'Best time',
                  position: 'top',
                  fill: lineColor,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="predictedPrice"
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: lineColor,
                stroke: '#0A0F1C',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-text-muted rounded" style={{ borderTop: '1px dashed #64748B' }} />
          <span>Current price</span>
        </div>
        {isTeal && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: lineColor }} />
            <span>Best time to buy</span>
          </div>
        )}
      </div>
    </Card>
  );
}
