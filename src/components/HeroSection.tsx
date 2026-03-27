import { Shield, ArrowRight } from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 w-fit rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Shield className="h-3.5 w-3.5" />
            Proteção com Inteligência Artificial
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Proteja-se de{" "}
            <span className="text-primary">fraudes</span>{" "}
            em tempo real
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg">
            O BlessGuardian é um agente Android que detecta golpes e fraudes — humanos ou gerados por IA — diretamente nas suas conversas e notificações.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://github.com/cognix-io/anti-fraud-agent-android"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:bg-muted transition-colors"
            >
              Saiba mais
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src={heroPhone}
            alt="BlessGuardian app na tela de um celular"
            width={400}
            height={512}
            className="drop-shadow-2xl max-w-[320px] md:max-w-[400px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
