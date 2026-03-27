import { ShieldCheck, Brain, BellRing, Eye, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Detecção por IA",
    description: "Análise inteligente de mensagens para identificar padrões de golpes gerados por humanos ou inteligência artificial.",
  },
  {
    icon: BellRing,
    title: "Monitoramento de notificações",
    description: "Intercepta notificações de apps de mensagens e identifica ameaças antes mesmo de você abrir a conversa.",
  },
  {
    icon: Eye,
    title: "Captura por acessibilidade",
    description: "Lê conversas abertas na tela em tempo real com debounce e deduplicação para máxima eficiência.",
  },
  {
    icon: Zap,
    title: "Tempo real",
    description: "Processamento instantâneo com alertas imediatos quando uma ameaça é detectada nas suas mensagens.",
  },
  {
    icon: Lock,
    title: "Privacidade primeiro",
    description: "Seus dados ficam no seu dispositivo. O processamento é local, sem envio de mensagens para servidores externos.",
  },
  {
    icon: ShieldCheck,
    title: "Apps monitorados",
    description: "Compatível com WhatsApp, Telegram, Instagram, Google Messages e Samsung Messages.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 border-t border-border">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Segurança <span className="text-primary">completa</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Múltiplas camadas de proteção trabalhando juntas para manter você seguro contra fraudes digitais.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 text-card-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
