import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="BlessGuardian" className="h-8 w-8" />
          <span className="font-display text-lg font-bold text-foreground">BlessGuardian</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
          <a href="#apps" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Apps protegidos</a>
          <a
            href="https://github.com/cognix-io/anti-fraud-agent-android"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Baixar no GitHub
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
          <a href="#features" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Recursos</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Como funciona</a>
          <a href="#apps" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Apps protegidos</a>
          <a
            href="https://github.com/cognix-io/anti-fraud-agent-android"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Baixar no GitHub
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
