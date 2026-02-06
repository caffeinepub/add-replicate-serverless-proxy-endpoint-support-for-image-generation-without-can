import AppHeader from './AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/app-bg-texture.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10">
        <AppHeader />
        <main>{children}</main>
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
