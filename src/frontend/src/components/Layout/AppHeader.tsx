export default function AppHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/app-logo.dim_512x512.png"
            alt="AI Image Generator"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold">AI Image Generator</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
