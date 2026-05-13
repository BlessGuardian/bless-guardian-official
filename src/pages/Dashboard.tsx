import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildDashboardData, mockStats, mockAttempts, mockChartData, mockAppBreakdown, type AivenFraudLog } from "@/lib/mockData";
import {
  Shield, ShieldAlert, ShieldCheck, Smartphone, LogOut,
  TrendingUp, AlertTriangle, Lightbulb, HelpCircle, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import logo from "@/assets/logo.png";

const riskColor = { alto: "text-red-400 bg-red-400/10", médio: "text-yellow-400 bg-yellow-400/10", baixo: "text-emerald-400 bg-emerald-400/10" };

const faqItems = [
  { q: "O que é phishing?", a: "Phishing é uma técnica de fraude onde criminosos se passam por empresas ou pessoas confiáveis para roubar dados pessoais, senhas e informações financeiras. Geralmente chegam por e-mail, SMS ou mensagens em apps." },
  { q: "Como o BlessGuardian detecta golpes?", a: "Nosso aplicativo utiliza Inteligência Artificial para analisar notificações e mensagens em tempo real, identificando padrões suspeitos como links maliciosos, linguagem urgente e solicitações de dados pessoais." },
  { q: "Meus dados ficam seguros?", a: "Sim! Todo o processamento é feito localmente no seu dispositivo. Nenhuma mensagem ou dado pessoal é enviado para servidores externos." },
  { q: "O que fazer se recebi uma mensagem suspeita?", a: "Não clique em links, não forneça dados pessoais e não transfira dinheiro. Bloqueie o contato e denuncie para a plataforma onde recebeu a mensagem." },
  { q: "O app funciona com todos os aplicativos?", a: "Atualmente o BlessGuardian monitora notificações de WhatsApp, Telegram, Instagram, SMS e E-mail. Estamos constantemente adicionando suporte a novos apps." },
  { q: "Como ativar a proteção em tempo real?", a: "Após instalar o app, conceda as permissões de Acessibilidade e Notificações nas configurações. O monitoramento começará automaticamente." },
];

const tips = [
  { icon: "🔒", title: "Use senhas fortes", desc: "Combine letras maiúsculas, minúsculas, números e símbolos. Nunca reutilize senhas entre serviços diferentes." },
  { icon: "🔗", title: "Desconfie de links", desc: "Antes de clicar, verifique o domínio. Links encurtados e com erros ortográficos são sinais de golpe." },
  { icon: "📱", title: "Ative verificação em 2 etapas", desc: "Habilite a autenticação de dois fatores em todos os seus aplicativos e contas importantes." },
  { icon: "🚫", title: "Nunca compartilhe códigos", desc: "Bancos e empresas nunca pedem códigos de verificação por mensagem. Isso é sempre golpe." },
  { icon: "⚠️", title: "Cuidado com urgência falsa", desc: "Golpistas criam senso de urgência para que você aja sem pensar. Sempre pare e verifique antes de agir." },
  { icon: "💰", title: "Desconfie de ofertas incríveis", desc: "Promoções boas demais, investimentos com retorno garantido e prêmios inesperados são quase sempre fraude." },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: mockStats,
    attempts: mockAttempts,
    chartData: mockChartData,
    appBreakdown: mockAppBreakdown,
  });

  useEffect(() => {
    const loadFraudLogs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke<{ rows: AivenFraudLog[] }>("get-fraud-logs");

      if (!error && data?.rows?.length) {
        setDashboardData(buildDashboardData(data.rows));
        setIsUsingLiveData(true);
      }

      setIsLoading(false);
    };

    loadFraudLogs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="BlessGuardian" className="h-7 w-7" />
            <span className="font-display text-base font-bold text-foreground">BlessGuardian</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Modo sem autenticação</span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <LogOut className="h-4 w-4 mr-1" /> Voltar
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Área do usuário</p>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard de proteção</h1>
          </div>
          <Badge variant={isUsingLiveData ? "default" : "secondary"} className="w-fit">
            {isLoading ? "Carregando dados" : isUsingLiveData ? "Dados Aiven Cloud" : "Dados demonstrativos"}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<ShieldAlert className="h-5 w-5 text-red-400" />} label="Tentativas Detectadas" value={dashboardData.stats.totalAttempts} />
          <StatCard icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />} label="Golpes Bloqueados" value={dashboardData.stats.blocked} />
          <StatCard icon={<AlertTriangle className="h-5 w-5 text-yellow-400" />} label="Alto Risco" value={dashboardData.stats.highRisk} />
          <StatCard icon={<Smartphone className="h-5 w-5 text-primary" />} label="Apps Protegidos" value={dashboardData.stats.appsProtected} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Visão Geral</TabsTrigger>
            <TabsTrigger value="tips" className="gap-1.5"><Lightbulb className="h-4 w-4" /> Dicass</TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Bar Chart */}
              <Card className="lg:col-span-3 bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-base">Tentativas vs Bloqueadas</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dashboardData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                      <XAxis dataKey="month" stroke="hsl(220,10%,50%)" fontSize={12} />
                      <YAxis stroke="hsl(220,10%,50%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{ background: "hsl(220,30%,12%)", border: "1px solid hsl(220,20%,20%)", borderRadius: 8, color: "#fff" }}
                      />
                      <Bar dataKey="tentativas" fill="hsl(213,90%,55%)" radius={[4, 4, 0, 0]} name="Tentativas" />
                      <Bar dataKey="bloqueadas" fill="hsl(160,60%,45%)" radius={[4, 4, 0, 0]} name="Bloqueadas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="lg:col-span-2 bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-base">Por Aplicativo</CardTitle>
                  <CardDescription>Distribuição de tentativas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={dashboardData.appBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                        {dashboardData.appBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "hsl(220,30%,12%)", border: "1px solid hsl(220,20%,20%)", borderRadius: 8, color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent attempts table */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-base">Tentativas Recentes</CardTitle>
                <CardDescription>Últimas detecções do BlessGuardian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-left">
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">App</th>
                        <th className="pb-3 font-medium">Tipo</th>
                        <th className="pb-3 font-medium">Risco</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium hidden lg:table-cell">Conteúdo</th>
                        <th className="pb-3 font-medium hidden md:table-cell">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.attempts.map((a) => (
                        <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-3 pr-4 whitespace-nowrap">{a.date}</td>
                          <td className="py-3 pr-4 font-medium">{a.app}</td>
                          <td className="py-3 pr-4">{a.type}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${riskColor[a.risk]}`}>
                              {a.risk}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={a.blocked ? "default" : "destructive"} className="text-xs">
                              {a.blocked ? "Bloqueado" : "Alerta"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell max-w-sm truncate" title={a.content ?? undefined}>
                            {a.content ?? "Sem conteúdo"}
                          </td>
                          <td className="py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{a.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip, i) => (
                <Card key={i} className="bg-card/50 border-border hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-3xl mb-3">{tip.icon}</div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
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

export default Dashboard;
