// src/components/admin/AdminMetricsPanel.tsx
'use client';

type DayPoint = { date: string; count: number };

type Metrics = {
  postsByDay: DayPoint[];
  messagesByDay: DayPoint[];
  viewsByDay: DayPoint[];
  commentsByDay: DayPoint[];
  totals: {
    users: number;
    activeUsers: number;
    blockedUsers: number;
    posts: number;
    messages: number;
    pageViews: number;
    comments: number;
    pendingReports: number;
  };
};

type AdminMetricsPanelProps = {
  metrics: Metrics;
};

export default function AdminMetricsPanel({ metrics }: AdminMetricsPanelProps) {
  const totalActions = metrics.totals.posts + metrics.totals.messages + metrics.totals.comments;
  const engagementRate = metrics.totals.pageViews > 0
    ? ((metrics.totals.messages + metrics.totals.comments) / metrics.totals.pageViews) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-base font-bold text-brand-text mb-3">Visites</h3>
          <MetricLine data={metrics.viewsByDay} color="#00E5FF" />
          <p className="text-[11px] text-gray-500 mt-2">{formatTrend(metrics.viewsByDay)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-base font-bold text-brand-text mb-3">Publications</h3>
          <MetricLine data={metrics.postsByDay} color="#00BFFF" />
          <p className="text-[11px] text-gray-500 mt-2">{formatTrend(metrics.postsByDay)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-base font-bold text-brand-text mb-3">Messages</h3>
          <MetricLine data={metrics.messagesByDay} color="#87CEEB" />
          <p className="text-[11px] text-gray-500 mt-2">{formatTrend(metrics.messagesByDay)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-base font-bold text-brand-text mb-3">Publications vs Messages</h3>
          <MetricBar
            datasets={[
              { label: 'Publications', values: metrics.postsByDay, color: '#00BFFF' },
              { label: 'Messages', values: metrics.messagesByDay, color: '#87CEEB' },
            ]}
          />
          <p className="text-[11px] text-gray-500 mt-2">Comparaison journalière</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-base font-bold text-brand-text mb-3">Répartition des interactions</h3>
          <div className="flex items-center gap-4">
            <MetricDonut
              slices={[
                { label: 'Publications', value: metrics.totals.posts, color: '#00E5FF' },
                { label: 'Messages', value: metrics.totals.messages, color: '#00BFFF' },
                { label: 'Commentaires', value: metrics.totals.comments, color: '#B388FF' },
              ]}
            />
            <div className="space-y-2 text-sm">
              {[
                { label: 'Publications', value: metrics.totals.posts, color: '#00E5FF' },
                { label: 'Messages', value: metrics.totals.messages, color: '#00BFFF' },
                { label: 'Commentaires', value: metrics.totals.comments, color: '#B388FF' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-bold text-brand-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-base font-bold text-brand-text mb-3">Activité globale</h3>
          <div className="flex items-center gap-4">
            <MetricSemiCircle value={metrics.totals.pageViews} max={Math.max(metrics.totals.pageViews, 1)} color="#00E5FF" label="Visites" />
            <MetricSemiCircle value={metrics.totals.comments} max={Math.max(metrics.totals.comments, 1)} color="#B388FF" label="Commentaires" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
        <h3 className="text-lg font-bold text-brand-text mb-4">Interprétation en temps réel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Trafic</p>
            <p className="text-xl font-bold text-brand-text">{metrics.totals.pageViews}</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.viewsByDay.length > 1
                ? `Pic le ${metrics.viewsByDay.reduce((max, item) => item.count > max.count ? item : max, metrics.viewsByDay[0]).date}`
                : 'Données en cours de collecte'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Sur les 30 derniers jours</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Engagement</p>
            <p className="text-xl font-bold text-brand-text">{engagementRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {engagementRate > 5 ? ' Bon' : engagementRate > 2 ? 'Moyen' : 'Faible'} taux de transformation visiteur → action
            </p>
            <p className="text-xs text-gray-400 mt-1">Messages + commentaires / visites</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Animation</p>
            <p className="text-xl font-bold text-brand-text">{totalActions}</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.totals.posts > metrics.totals.messages ? 'Les publications dominent les échanges' : 'Les messages dominent les publications'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Publications + messages + commentaires</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTrend(data: DayPoint[]) {
  if (data.length < 2) return '';
  const first = data.slice(0, Math.max(1, Math.floor(data.length / 3))).reduce((s, d) => s + d.count, 0);
  const last = data.slice(Math.floor(data.length * 2 / 3)).reduce((s, d) => s + d.count, 0);
  if (last > first * 1.1) return '📈 Hausse';
  if (last < first * 0.9) return '📉 Baisse';
  return '➡️ Stable';
}

function MetricLine({ data, color }: { data: DayPoint[]; color: string }) {
  if (!data || data.length === 0) return <p className="text-xs text-gray-400">Aucune donnée</p>;

  const width = 480;
  const height = 180;
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: height - padding - (d.count / maxCount) * chartHeight,
    value: d.count,
    date: d.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const labels = data.filter((_, i) => i % Math.ceil(data.length / 6) === 0);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[320px]">
        <path d={areaD} fill={color} opacity={0.1} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
        {labels.map((d, i) => {
          const idx = data.indexOf(d);
          const x = padding + (idx / Math.max(data.length - 1, 1)) * chartWidth;
          return (
            <text key={i} x={x} y={height - 10} textAnchor="middle" className="text-xs fill-gray-500">
              {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function MetricBar({
  datasets,
}: {
  datasets: Array<{ label: string; values: DayPoint[]; color: string }>;
}) {
  const allValues = datasets.flatMap((ds) => ds.values.map((v) => v.count));
  const maxCount = Math.max(...allValues, 1);

  const merged = datasets[0].values.map((item, i) => ({
    date: item.date,
    counts: datasets.map((ds) => (ds.values[i]?.count ?? 0)),
  }));

  const width = 480;
  const height = 180;
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / Math.max(merged.length, 1) * 0.6;
  const gap = chartWidth / Math.max(merged.length, 1) * 0.4;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[320px]">
        {merged.map((item, i) => {
          const x = padding + i * (barWidth + gap);
          return datasets.map((ds, j) => {
            const h = (item.counts[j] / maxCount) * chartHeight;
            const y = height - padding - h;
            return (
              <rect
                key={`${i}-${j}`}
                x={x + j * (barWidth / datasets.length)}
                y={y}
                width={barWidth / datasets.length - 1}
                height={h}
                fill={ds.color}
                rx={2}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}

function MetricDonut({ slices }: { slices: Array<{ label: string; value: number; color: string }> }) {
  const total = slices.reduce((s, slice) => s + slice.value, 0);
  const size = 180;
  const center = size / 2;
  const radius = 70;
  const innerRadius = 40;
  const circumference = 2 * Math.PI * radius;

  const offsets: number[] = [];
  for (let i = 0; i < slices.length; i += 1) {
    if (total === 0) break;
    const currentOffset = i === 0 ? 0 : offsets[i - 1] + (slices[i - 1].value / total) * circumference;
    offsets.push(currentOffset);
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-40">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#E9ECEF" strokeWidth={innerRadius} />
        {slices.map((slice, idx) => {
          if (total === 0) return null;
          const ratio = slice.value / total;
          const dash = ratio * circumference;
          const gap = circumference - dash;
          const currentOffset = offsets[idx] ?? 0;

          return (
            <circle
              key={slice.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={innerRadius}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-brand-text">{total}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
      </div>
    </div>
  );
}

function MetricSemiCircle({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const size = 220;
  const center = size / 2;
  const radius = 90;
  const strokeWidth = 24;
  const circumference = Math.PI * radius;
  const ratio = Math.min(value / max, 1);
  const dash = ratio * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-20">
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#E9ECEF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
        <text x={center} y={center + 6} textAnchor="middle" className="text-sm font-bold fill-brand-text">
          {value}
        </text>
      </svg>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
