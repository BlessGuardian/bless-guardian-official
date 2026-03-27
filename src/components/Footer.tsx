import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold text-sm">BlessGuardian</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Projeto de TCC — Instituto Mauá de Tecnologia • {new Date().getFullYear()}
        </p>
        <a
          href="https://github.com/cognix-io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          github.com/cognix-io
        </a>
      </div>
    </footer>
  );
};

export default Footer;
