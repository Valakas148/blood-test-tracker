"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BiomarkerStatus, BiomarkerTrend } from "@/types";
import styles from "./TrendChart.module.scss";

interface TrendChartProps {
  trend: BiomarkerTrend;
  color: string;
}

const STATUS_COLORS: Record<BiomarkerStatus, string> = {
  normal: "#16A34A",
  low: "#D97706",
  high: "#DC2626",
};

function statusColor(status: BiomarkerStatus) {
  return STATUS_COLORS[status] ?? "#64748B";
}

export default function TrendChart({ trend, color }: TrendChartProps) {
  const parseTooltipPayload = (payload: unknown) => {
    if (!Array.isArray(payload) || payload.length === 0) return null;
    const first = payload[0];
    if (typeof first !== "object" || first === null) return null;
    const maybeValue = (first as Record<string, unknown>).value;
    const maybePayload = (first as Record<string, unknown>).payload;

    if (
      typeof maybeValue !== "number" ||
      typeof maybePayload !== "object" ||
      maybePayload === null
    ) {
      return null;
    }

    const rawStatus = (maybePayload as Record<string, unknown>).status;
    if (rawStatus !== "normal" && rawStatus !== "low" && rawStatus !== "high") {
      return null;
    }
    const status: BiomarkerStatus = rawStatus;

    return { value: maybeValue, status };
  };

  const chartData = trend.dataPoints.map((point) => ({
    date: point.date,
    rawDate: point.rawDate,
    value: point.value,
    status: point.status,
  }));

  const minRange = Math.min(trend.referenceRange.min, trend.referenceRange.max);
  const maxRange = Math.max(trend.referenceRange.min, trend.referenceRange.max);

  const customDot = (props: { cx?: number; cy?: number; payload?: { status: BiomarkerStatus } }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={statusColor(payload.status)}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  const customTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { status: BiomarkerStatus } }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0];
    const tone = statusColor(point.payload.status);

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{label}</p>
        <p className={styles.tooltipValue} style={{ color: tone }}>
          {point.value} {trend.unit}
        </p>
        <p className={styles.tooltipStatus} style={{ color: tone }}>
          {point.payload.status.toUpperCase()}
        </p>
      </div>
    );
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.meta}>
        <h3>{trend.name}</h3>
        <p>
          Unit: {trend.unit || "-"} · Reference: {minRange} - {maxRange}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="rawDate" tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(value) => {
            return new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
            }).format(new Date(Number(value)));
          }} />
          <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
          <ReferenceArea
            y1={minRange}
            y2={maxRange}
            fill="#16A34A"
            fillOpacity={0.08}
            strokeOpacity={0}
          />
          <ReferenceLine y={minRange} stroke="#16A34A" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={maxRange} stroke="#16A34A" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Tooltip
            content={(props) => {
              const parsed = parseTooltipPayload(props.payload);
              if (!parsed) {
                return customTooltip({
                  active: props.active,
                  payload: undefined,
                  label: props.label ? String(props.label) : undefined,
                });
              }

              return customTooltip({
                active: props.active,
                payload: [{ value: parsed.value, payload: { status: parsed.status } }],
                label: props.label ? String(props.label) : undefined,
              });
            }}
            labelFormatter={(value) => {
              return new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(Number(value)));
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={customDot}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
