// ====================================================
// Mock dashboard data — replace with real API calls later
// ====================================================

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

export const mockStats: DashboardStats = {
  totalAttempts: 47,
  blocked: 42,
  highRisk: 12,
  appsProtected: 5,
};

export const mockAttempts: FraudAttempt[] = [
  { id: "1", date: "2026-04-15", app: "WhatsApp", type: "Phishing", risk: "alto", blocked: true, description: "Link malicioso detectado em mensagem de contato desconhecido" },
  { id: "2", date: "2026-04-14", app: "SMS", type: "Smishing", risk: "alto", blocked: true, description: "SMS falso simulando banco solicitando dados pessoais" },
  { id: "3", date: "2026-04-13", app: "Instagram", type: "Engenharia Social", risk: "médio", blocked: true, description: "Perfil falso tentando obter informações pessoais" },
  { id: "4", date: "2026-04-12", app: "Telegram", type: "Scam", risk: "alto", blocked: false, description: "Oferta fraudulenta de investimento com retorno garantido" },
  { id: "5", date: "2026-04-11", app: "WhatsApp", type: "Clonagem", risk: "alto", blocked: true, description: "Tentativa de clonagem de conta via código de verificação" },
  { id: "6", date: "2026-04-10", app: "E-mail", type: "Phishing", risk: "médio", blocked: true, description: "E-mail falso imitando serviço de streaming" },
  { id: "7", date: "2026-04-09", app: "SMS", type: "Smishing", risk: "baixo", blocked: true, description: "SMS com promoção falsa de operadora" },
  { id: "8", date: "2026-04-08", app: "WhatsApp", type: "Falso Suporte", risk: "médio", blocked: true, description: "Mensagem fingindo ser suporte técnico de banco" },
];

export const mockChartData = [
  { month: "Nov", tentativas: 8, bloqueadas: 7 },
  { month: "Dez", tentativas: 12, bloqueadas: 11 },
  { month: "Jan", tentativas: 6, bloqueadas: 5 },
  { month: "Fev", tentativas: 9, bloqueadas: 8 },
  { month: "Mar", tentativas: 15, bloqueadas: 14 },
  { month: "Abr", tentativas: 10, bloqueadas: 9 },
];

export const mockAppBreakdown = [
  { name: "WhatsApp", value: 18, fill: "hsl(213, 90%, 55%)" },
  { name: "SMS", value: 12, fill: "hsl(213, 70%, 70%)" },
  { name: "Instagram", value: 8, fill: "hsl(213, 50%, 45%)" },
  { name: "Telegram", value: 5, fill: "hsl(180, 60%, 50%)" },
  { name: "E-mail", value: 4, fill: "hsl(213, 40%, 60%)" },
];

export interface AivenFraudLog {
  content: string | null;
  id: string;
  source: string | null;
  risk_score: string | number | null;
  is_fraud: boolean | null;
  explanation: string | null;
  detected_at: string | null;
}

const appColors = [
  "hsl(213, 90%, 55%)",
  "hsl(213, 70%, 70%)",
  "hsl(180, 60%, 50%)",
  "hsl(213, 50%, 45%)",
  "hsl(160, 60%, 45%)",
  "hsl(38, 90%, 55%)",
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const getRisk = (score: string | number | null): FraudAttempt["risk"] => {
  const value = Number(score ?? 0);
  if (value >= 0.75) return "alto";
  if (value >= 0.4) return "médio";
  return "baixo";
};

export const buildDashboardData = (logs: AivenFraudLog[]) => {
  const attempts: FraudAttempt[] = logs.map((log) => ({
    id: log.id,
    content: log.content,
    date: log.detected_at ? dateFormatter.format(new Date(log.detected_at)) : "Sem data",
    app: log.source ?? "Desconhecido",
    type: log.is_fraud ? "Possível golpe" : "Seguro",
    risk: getRisk(log.risk_score),
    blocked: Boolean(log.is_fraud),
    description: log.explanation ?? "Sem descrição disponível",
  }));

  const stats: DashboardStats = {
    totalAttempts: logs.length,
    blocked: logs.filter((log) => log.is_fraud).length,
    highRisk: logs.filter((log) => getRisk(log.risk_score) === "alto").length,
    appsProtected: new Set(logs.map((log) => log.source).filter(Boolean)).size,
  };

  const chartMap = new Map<string, { month: string; tentativas: number; bloqueadas: number; time: number }>();
  logs.forEach((log) => {
    if (!log.detected_at) return;
    const date = new Date(log.detected_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = chartMap.get(key) ?? { month: monthFormatter.format(date).replace(".", ""), tentativas: 0, bloqueadas: 0, time: date.getTime() };
    current.tentativas += 1;
    if (log.is_fraud) current.bloqueadas += 1;
    chartMap.set(key, current);
  });

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.time - b.time)
    .slice(-6)
    .map(({ month, tentativas, bloqueadas }) => ({ month, tentativas, bloqueadas }));

  const appCount = new Map<string, number>();
  logs.forEach((log) => appCount.set(log.source ?? "Desconhecido", (appCount.get(log.source ?? "Desconhecido") ?? 0) + 1));

  const appBreakdown = Array.from(appCount.entries()).map(([name, value], index) => ({
    name,
    value,
    fill: appColors[index % appColors.length],
  }));

  return { stats, attempts, chartData, appBreakdown };
};
