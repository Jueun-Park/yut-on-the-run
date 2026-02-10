import './App.css'

const nextSteps = [
  'Set up Tailwind CSS (NEXT_STEPS Milestone 1.2) so we can style the UI quickly.',
  'Sketch the board/rules/state engine from mvp-spec.md and start stubbing the core functions.',
  'Replace placeholder components in src/components with real Throw/Play/Reward/Game Over views once the engine takes shape.',
]

const references = [
  {
    label: 'NEXT_STEPS.md',
    href: 'https://github.com/Jueun-Park/yut-on-the-run/blob/main/NEXT_STEPS.md',
  },
  {
    label: 'mvp-spec.md',
    href: 'https://github.com/Jueun-Park/yut-on-the-run/blob/main/mvp-spec.md',
  },
]

function App() {
  return (
    <main className="app">
      <header className="header">
        <p className="pill">Answering: “What should we do next?”</p>
        <h1>yut-on-the-run</h1>
        <p className="lede">Single-player Yut prototype; here is the immediate plan.</p>
      </header>

      <section className="card">
        <h2>Immediate next steps</h2>
        <ol className="steps">
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>References</h2>
        <ul className="links">
          {references.map((doc) => (
            <li key={doc.label}>
              <a href={doc.href} target="_blank" rel="noreferrer">
                {doc.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
