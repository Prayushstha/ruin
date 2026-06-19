/**
 * App shell — the composition root. For now a minimal landing; providers
 * (router, auth, realtime) and the feature router get added here as the
 * features are built.
 */
function App() {
  return (
    <main className="app-shell">
      <h1>ruin</h1>
      <p>Game night for friend groups.</p>
    </main>
  )
}

export default App
