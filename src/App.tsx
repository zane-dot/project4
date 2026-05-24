import { useState } from 'react';
import ParticleBackground from './components/ParticleBackground';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import MobileDrawer from './components/MobileDrawer';
import ChatPanel from './components/ChatPanel';
import PromptLibrary from './components/PromptLibrary';
import AboutPanel from './components/AboutPanel';
import { useChat } from './store/ChatContext';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { activeView } = useChat();

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />
      <div className="bg-glow glow-3" />
      <ParticleBackground />

      <Topbar onMenuOpen={() => setDrawerOpen(true)} />

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="layout">
        <Sidebar className="desktop-sidebar" />
        {activeView === 'chat' && <ChatPanel />}
        {activeView === 'prompts' && <PromptLibrary />}
        {activeView === 'about' && <AboutPanel />}
      </main>
    </>
  );
}
