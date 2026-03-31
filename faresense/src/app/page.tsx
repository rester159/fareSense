import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="px-6 pt-safe pt-12 pb-2 animate-fade-in">
        <div className="max-w-lg mx-auto">
          <h1
            className="text-2xl font-black font-[var(--font-display)] tracking-tight text-teal"
            style={{ textShadow: '0 0 30px rgba(0,212,170,0.2)' }}
          >
            FareSense
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Know before you book.</p>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-8 pb-6 animate-fade-in-up delay-100">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-black font-[var(--font-display)] leading-tight text-text-primary">
            Stop overpaying<br />for flights.
          </h2>
          <p className="text-text-secondary text-base mt-3 leading-relaxed">
            AI-powered fare predictions tell you exactly when to buy — and when to wait.
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="px-6 pb-6 animate-fade-in-up delay-300">
        <div className="max-w-lg mx-auto">
          <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-xl">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="px-6 pb-8 animate-fade-in delay-500">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center gap-6">
            {[
              { value: '10M+', label: 'data points' },
              { value: '83%', label: 'accuracy' },
              { value: '100%', label: 'free' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-teal font-bold text-lg font-[var(--font-display)]">{item.value}</div>
                <div className="text-text-muted text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-12 animate-fade-in-up delay-700">
        <div className="max-w-lg mx-auto">
          <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-4 px-1">
            How it works
          </h3>
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Search',
                desc: 'Enter your route and travel dates',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Predict',
                desc: 'Our AI analyzes millions of data points instantly',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Save',
                desc: 'Buy now or wait — we tell you the best move',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-4 bg-surface rounded-2xl border border-surface-border p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-text-primary font-semibold text-sm">{item.title}</div>
                  <div className="text-text-muted text-xs mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
