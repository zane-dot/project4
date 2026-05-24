import { useChat } from '../store/ChatContext';

export default function Topbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { activeView, dispatch, currentModelConfig } = useChat();

  const views = [
    { key: 'chat' as const, label: '⚡ Chat' },
    { key: 'prompts' as const, label: '✦ Prompts' },
    { key: 'about' as const, label: '◎ About' },
  ];

  return (
    <header className="topbar glass">
      <div className="brand">
        <button className="mobile-menu-btn" onClick={onMenuOpen} aria-label="Open menu">
          ☰
        </button>
        <div className="logo">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="6" stroke="url(#g1)" strokeWidth="2" />
            <circle cx="6" cy="8" r="2.5" fill="url(#g1)" />
            <circle cx="26" cy="8" r="2.5" fill="url(#g1)" />
            <circle cx="6" cy="24" r="2.5" fill="url(#g1)" />
            <circle cx="26" cy="24" r="2.5" fill="url(#g1)" />
            <path d="M8 9 L13 14 M24 9 L19 14 M8 23 L13 18 M24 23 L19 18" stroke="url(#g1)" strokeWidth="1.5" />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h1>Synapse</h1>
          <span className="tag">AI Prompt Studio · v2.0</span>
        </div>
      </div>

      <nav className="nav-pills">
        {views.map((v) => (
          <button
            key={v.key}
            className={`pill ${activeView === v.key ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: v.key })}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div className="status">
        <span className={`dot ${currentModelConfig.live ? 'pulse' : ''}`} />
        <span>
          {currentModelConfig.name} {currentModelConfig.live ? '· LIVE' : '· Mock'}
        </span>
      </div>
    </header>
  );
}
