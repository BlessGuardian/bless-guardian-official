import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, ShieldCheck, Smartphone, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface GlobalStats {
  stats: {
    totalAnalisadas: number;
    golpesBloqueados: number;
    appsMonitorados: number;
    usuariosProtegidos: number;
  };
  byApp: { name: string; value: number }[];
  monthly: { month: string; tentativas: number; bloqueadas: number }[];
}

const appColors = [
  "hsl(213, 90%, 55%)",
  "hsl(213, 70%, 70%)",
  "hsl(180, 60%, 50%)",
  "hsl(213, 50%, 45%)",
  "hsl(160, 60%, 45%)",
  "hsl(38, 90%, 55%)",
];

const tooltipStyle = {
  background: "hsl(220,30%,12%)",
  border: "1px solid hsl(220,20%,20%)",
  borderRadius: 8,
  color: "#fff",
};

const StatsSection = () => {
  const [data, setData] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: result, error } = await supabase.functions.invoke<GlobalStats>("get-fraud-logs", {
          body: { aggregate: true },
        });
        if (error) throw error;
        if (result && result.stats) setData(result);
      } catch (e) {
        console.error("Falha ao carregar estatísticas globais:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
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

  if (!data) return null;

  const cards = [
    { icon: <ShieldAlert className="h-5 w-5 text-red-400" />, label: "Mensagens analisadas", value: data.stats.totalAnalisadas },
    { icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />, label: "Golpes bloqueados", value: data.stats.golpesBloqueados },
    { icon: <Smartphone className="h-5 w-5 text-primary" />, label: "Apps monitorados", value: data.stats.appsMonitorados },
    { icon: <Users className="h-5 w-5 text-yellow-400" />, label: "Usuários protegidos", value: data.stats.usuariosProtegidos },
  ];

  return (
    <section className="py-24 border-t border-border">
      <div className="container space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Proteção em números</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            O panorama dos golpes no Brasil
          </h2>
          <p className="text-muted-foreground">
            Estatísticas gerais e anônimas de todas as detecções do BlessGuardian. Nenhum dado pessoal é exposto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <Card key={i} className="bg-card/50 border-border">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-xl bg-muted/50 p-3">{card.icon}</div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-base">Tentativas por mês</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                  <XAxis dataKey="month" stroke="hsl(220,10%,50%)" fontSize={12} />
                  <YAxis stroke="hsl(220,10%,50%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="tentativas" fill="hsl(213,90%,55%)" radius={[4, 4, 0, 0]} name="Tentativas" />
                  <Bar dataKey="bloqueadas" fill="hsl(160,60%,45%)" radius={[4, 4, 0, 0]} name="Bloqueadas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-base">Apps com mais tentativas</CardTitle>
              <CardDescription>Onde os golpistas mais atacam</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.byApp} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {data.byApp.map((_, i) => (
                      <Cell key={i} fill={appColors[i % appColors.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
