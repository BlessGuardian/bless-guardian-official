import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import { buildDashboardData, type AivenFraudLog, type FraudAttempt } from "@/lib/dashboardData";
import { ShieldAlert, Gauge, Layers, Loader2, User as UserIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Category = { name: string; value: number };

const colors = ["hsl(213, 90%, 55%)", "hsl(180, 60%, 50%)", "hsl(160, 60%, 45%)", "hsl(38, 90%, 55%)", "hsl(213, 70%, 70%)", "hsl(0, 70%, 60%)"];
const tooltipStyle = { background: "hsl(220,30%,12%)", border: "1px solid hsl(220,20%,20%)", borderRadius: 8, color: "#fff" };
const riskColor = { alto: "text-red-400 bg-red-400/10", médio: "text-yellow-400 bg-yellow-400/10", baixo: "text-emerald-400 bg-emerald-400/10" };

const CategoryChart = ({ data }: { data: Category[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
      <XAxis type="number" stroke="hsl(220,10%,50%)" fontSize={12} />
      <YAxis type="category" dataKey="name" stroke="hsl(220,10%,50%)" fontSize={12} width={100} />
      <Tooltip contentStyle={tooltipStyle} />
      <Bar dataKey="value" name="Tentativas" radius={[0, 4, 4, 0]}>
        {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const StatsSection = () => {
  const user = getCurrentUser();
  const [global, setGlobal] = useState<{ byCategory: Category[]; total: number } | null>(null);
  const [mine, setMine] = useState<{ attempts: FraudAttempt[]; byCategory: Category[]; score: number | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [g, m] = await Promise.all([
          supabase.functions.invoke("get-fraud-logs", { body: { aggregate: true } }),
          user ? supabase.functions.invoke("get-fraud-logs", { body: { token: user.token } }) : Promise.resolve(null),
        ]);
        if (g.data?.byCategory) setGlobal(g.data);
        if (m?.data && !m.data.error) {
          const built = buildDashboardData((m.data.rows ?? []) as AivenFraudLog[]);
          setMine({ attempts: built.attempts, byCategory: m.data.byCategory ?? [], score: m.data.score ?? null });
        }
      } catch (e) {
        console.error("Falha ao carregar estatísticas:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 border-t border-border">
        <div className="container flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando estatísticas...
        </div>
      </section>
    );
  }

  if (!global) return null;

  const scorePct = mine?.score != null ? Math.round(mine.score * 100) : null;

  return (
    <section className="py-24 border-t border-border">
      <div className="container space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Proteção em números</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">O panorama dos golpes no Brasil</h2>
          <p className="text-muted-foreground">
            Estatísticas gerais e anônimas de todas as detecções do BlessGuardian. Nenhum dado pessoal é exposto.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-4">
            <Stat icon={<ShieldAlert className="h-5 w-5 text-red-400" />} label="Tentativas detectadas" value={global.total} />
            <Stat icon={<Layers className="h-5 w-5 text-primary" />} label="Tipos de golpe" value={global.byCategory.length} />
          </div>
          <Card className="lg:col-span-2 bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-base">Tipos de golpe mais comuns</CardTitle>
              <CardDescription>Todos os usuários</CardDescription>
            </CardHeader>
            <CardContent><CategoryChart data={global.byCategory} /></CardContent>
          </Card>
        </div>

        {user && mine && (
          <div className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><UserIcon className="h-4 w-4" /> {user.email}</p>
                <h3 className="font-display text-2xl font-bold text-foreground">Seus registros</h3>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">Abrir meu painel <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="grid gap-4">
                <Stat icon={<ShieldAlert className="h-5 w-5 text-red-400" />} label="Suas tentativas detectadas" value={mine.attempts.length} />
                <Stat icon={<Gauge className="h-5 w-5 text-yellow-400" />} label="Score de vulnerabilidade" value={scorePct != null ? `${scorePct}%` : "—"} />
              </div>
              <Card className="lg:col-span-2 bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-base">Seus golpes por tipo</CardTitle>
                  <CardDescription>Apenas as suas mensagens</CardDescription>
                </CardHeader>
                <CardContent>
                  {mine.byCategory.length ? <CategoryChart data={mine.byCategory} /> : <p className="text-sm text-muted-foreground py-10 text-center">Sem dados ainda</p>}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-base">Últimas detecções</CardTitle>
                <CardDescription>Detalhes das mensagens analisadas no seu aparelho</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mine.attempts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro encontrado</p>}
                {mine.attempts.slice(0, 6).map((a) => (
                  <div key={a.id} className="rounded-lg border border-border/60 p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-foreground">{a.app}</span>
                      <span className="text-muted-foreground">{a.date}</span>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${riskColor[a.risk]}`}>risco {a.risk}</span>
                      <Badge variant={a.blocked ? "default" : "secondary"} className="text-xs">{a.type}</Badge>
                    </div>
                    {a.content && <p className="text-sm text-foreground">“{a.content}”</p>}
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <Card className="bg-card/50 border-border">
    <CardContent className="flex items-center gap-4 pt-6">
      <div className="rounded-xl bg-muted/50 p-3">{icon}</div>
      <div>
        <p className="text-2xl font-bold font-display text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export default StatsSection;
