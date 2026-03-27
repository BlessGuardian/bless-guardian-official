import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BlessGuardian" className="h-6 w-6" />
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
