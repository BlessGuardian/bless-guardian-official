const steps = [
  {
    number: "01",
    title: "Instale o app",
    description: "Baixe o BlessGuardian pelo GitHub e instale no seu dispositivo Android 12+.",
  },
  {
    number: "02",
    title: "Conceda as permissões",
    description: "Ative as permissões de notificação e acessibilidade para que o agente possa monitorar ameaças.",
  },
  {
    number: "03",
    title: "Fique protegido",
    description: "O BlessGuardian monitora em segundo plano e alerta você imediatamente quando detecta uma fraude.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 border-t border-border">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como <span className="text-primary">funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Três passos simples para começar a se proteger.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="text-5xl font-display font-bold text-primary/20 mb-4">{step.number}</div>
              <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
