import { useChat } from '../store/ChatContext';
import { PROMPTS } from '../constants';

export default function PromptLibrary() {
  const { dispatch, sendMessage } = useChat();

  const handleClick = (body: string) => {
    dispatch({ type: 'SET_VIEW', payload: 'chat' });
    // Small delay so the textarea is mounted
    requestAnimationFrame(() => {
      sendMessage(body);
    });
  };

  return (
    <section className="panel glass" id="view-prompts">
      <div className="prompts-header">
        <h2>✦ Prompt Library</h2>
        <p>精选 Prompt Engineering 模板，点击即可载入对话框</p>
      </div>
      <div className="prompt-grid">
        {PROMPTS.map((p) => (
          <div
            key={p.title}
            className="prompt-card"
            onClick={() => handleClick(p.body)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleClick(p.body);
            }}
          >
            <div className="pc-icon">{p.icon}</div>
            <div className="pc-title">{p.title}</div>
            <div className="pc-desc">{p.desc}</div>
            <span className="pc-tag">{p.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
