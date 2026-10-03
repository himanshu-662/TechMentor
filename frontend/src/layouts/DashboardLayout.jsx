import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatbotPopup from '../components/chat/ChatbotPopup';

export const DashboardLayout = ({ children, activeTab, onSelectTab }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sticky Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />

      {/* Main Content Area with isolated scrolling */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 p-6 md:p-8 pb-36 md:pb-40 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating AI Mentor Chatbot Pop-up */}
      <ChatbotPopup />
    </div>
  );
};

export default DashboardLayout;

