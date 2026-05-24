import { useRef, useEffect } from 'react';
import { useChat } from '../store/ChatContext';
import MessageBubble from './MessageBubble';
import Composer from './Composer';

const QUICK_PROMPTS: { icon: string; text: string }[] = [
  { icon: '💡', text: '解释 Transformer 注意力机制' },
  { icon: '⚛️', text: '用 React 写一个 Todo' },
  { icon: '🐛', text: '帮我审查这段代码' },
  { icon: '📝', text: '优化我的 Prompt' },
];

export default function ChatPanel() {
  const { messages, sendMessage } = useChat();
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <section className="panel glass" id="view-chat">
      <div className="chat-area" ref={chatRef}>
        {!hasMessages ? (
          <div className="welcome">
            <div className="hero-orb" />
            <h2>
              Welcome to <span className="grad">Synapse</span>
            </h2>
            <p>多模型 AI 对话与 Prompt 工程实验台。选择一个模板开始 ↓</p>
            <div className="quick-prompts">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.text}
                  className="qp"
                  onClick={() => sendMessage(q.text)}
                >
                  {q.icon} {q.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
      </div>
      <Composer />
    </section>
  );
}
