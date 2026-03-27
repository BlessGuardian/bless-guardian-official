import { ArrowRight } from "lucide-react";

const CtaSection = () => {
  return (
    <section className="py-20 border-t border-border">
      <div className="container">
        <div className="relative rounded-2xl border border-primary/20 bg-primary/5 p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comece a se proteger <span className="text-primary">hoje</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              O BlessGuardian é open source e gratuito. Baixe agora e tenha proteção contra fraudes no seu Android.
            </p>
            <a
              href="https://github.com/cognix-io/anti-fraud-agent-android"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ver no GitHub
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
