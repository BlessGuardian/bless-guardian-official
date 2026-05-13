export interface FraudAttempt {
  id: string;
  date: string;
  app: string;
  type: string;
  content?: string | null;
  risk: "alto" | "médio" | "baixo";
  blocked: boolean;
  description: string;
}

export interface DashboardStats {
  totalAttempts: number;
  blocked: number;
  highRisk: number;
  appsProtected: number;
}

export interface ChartDataPoint {
  month: string;
  tentativas: number;
  bloqueadas: number;
}

export interface AppBreakdownItem {
  name: string;
  value: number;
  fill: string;
}

export interface DashboardData {
  stats: DashboardStats;
  attempts: FraudAttempt[];
  chartData: ChartDataPoint[];
  appBreakdown: AppBreakdownItem[];
}

export interface AivenFraudLog {
  content: string | null;
  id: string;
  source?: string | null;
  risk_score?: string | number | null;
  is_fraud?: boolean | null;
  explanation: string | null;
  detected_at: string | null;
}

export const emptyDashboardData: DashboardData = {
  stats: {
    totalAttempts: 0,
    blocked: 0,
    highRisk: 0,
    appsProtected: 0,
  },
  attempts: [],
  chartData: [],
  appBreakdown: [],
};

const appColors = [
  "hsl(213, 90%, 55%)",
  "hsl(213, 70%, 70%)",
  "hsl(180, 60%, 50%)",
  "hsl(213, 50%, 45%)",
  "hsl(160, 60%, 45%)",
  "hsl(38, 90%, 55%)",
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const getRisk = (score?: string | number | null): FraudAttempt["risk"] => {
  const value = Number(score ?? 0);
  if (value >= 0.75) return "alto";
  if (value >= 0.4) return "médio";
  return "baixo";
};

export const buildDashboardData = (logs: AivenFraudLog[]): DashboardData => {
  const attempts: FraudAttempt[] = logs.map((log) => ({
    id: log.id,
    content: log.content,
    date: log.detected_at ? dateFormatter.format(new Date(log.detected_at)) : "Sem data",
    app: log.source ?? "Aiven",
    type: (log.is_fraud ?? true) ? "Possível golpe" : "Seguro",
    risk: getRisk(log.risk_score),
    blocked: log.is_fraud ?? true,
    description: log.explanation ?? "Sem descrição disponível",
  }));

  const stats: DashboardStats = {
    totalAttempts: logs.length,
    blocked: logs.filter((log) => log.is_fraud ?? true).length,
    highRisk: logs.filter((log) => getRisk(log.risk_score) === "alto").length,
    appsProtected: new Set(logs.map((log) => log.source ?? "Aiven")).size,
  };

  const chartMap = new Map<string, { month: string; tentativas: number; bloqueadas: number; time: number }>();
  logs.forEach((log) => {
    if (!log.detected_at) return;

    const date = new Date(log.detected_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = chartMap.get(key) ?? {
      month: monthFormatter.format(date).replace(".", ""),
      tentativas: 0,
      bloqueadas: 0,
      time: date.getTime(),
    };

    current.tentativas += 1;
    if (log.is_fraud) current.bloqueadas += 1;
    chartMap.set(key, current);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.time - b.time)
    .slice(-6)
    .map(({ month, tentativas, bloqueadas }) => ({ month, tentativas, bloqueadas }));

  const appCount = new Map<string, number>();
  logs.forEach((log) => {
    const source = log.source ?? "Aiven";
    appCount.set(source, (appCount.get(source) ?? 0) + 1);
  });

  const appBreakdown = Array.from(appCount.entries()).map(([name, value], index) => ({
    name,
    value,
    fill: appColors[index % appColors.length],
  }));

  return { stats, attempts, chartData, appBreakdown };
};
