export default function AboutPanel() {
  return (
    <section className="panel glass about-panel" id="view-about">
      <h2>◎ About Synapse</h2>
      <p className="lead">
        一个面向 <b>AI 工程师 / 全栈开发者</b> 的多模型 Prompt 工作台。
      </p>
      <div className="feat-grid">
        <div className="feat">
          <div className="fi">🧠</div>
          <h4>Multi-Model</h4>
          <p>统一接口对接 Claude / GPT / Ollama / vLLM。</p>
        </div>
        <div className="feat">
          <div className="fi">⚡</div>
          <h4>React + TypeScript</h4>
          <p>现代前端架构，类型安全，组件化开发。</p>
        </div>
        <div className="feat">
          <div className="fi">🎨</div>
          <h4>Glassmorphism</h4>
          <p>玻璃拟态 + 霓虹渐变 + 粒子背景。</p>
        </div>
        <div className="feat">
          <div className="fi">📚</div>
          <h4>Prompt Library</h4>
          <p>内置 8+ 高质量提示词模板。</p>
        </div>
        <div className="feat">
          <div className="fi">🔧</div>
          <h4>Tunable</h4>
          <p>Temperature / Top-P / Max Tokens 实时调节。</p>
        </div>
        <div className="feat">
          <div className="fi">📱</div>
          <h4>Responsive</h4>
          <p>桌面 / 平板 / 手机自适应。</p>
        </div>
      </div>
      <div className="stack">
        <span>React</span>
        <span>TypeScript</span>
        <span>Vite</span>
        <span>Canvas API</span>
        <span>Prompt Engineering</span>
        <span>Glassmorphism</span>
      </div>
    </section>
  );
}
