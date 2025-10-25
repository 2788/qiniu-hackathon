import { ThemeToggle } from '../theme-toggle';

export function Header() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          AI
        </div>
        <h1 className="text-lg font-semibold">智能客服系统</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
