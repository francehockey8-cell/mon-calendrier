'use client';

import { useEffect, useState } from 'react';

export default function Diag() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const msgs: string[] = [`✅ JS exécuté à ${new Date().toLocaleTimeString('fr-FR')}`];

    const onError = (e: ErrorEvent) => {
      setMessages((prev) => [...prev, `❌ ${e.message}`]);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      setMessages((prev) => [
        ...prev,
        `❌ Promise: ${(e.reason && e.reason.message) || String(e.reason)}`,
      ]);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    setMessages(msgs);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: messages.some((m) => m.startsWith('❌')) ? '#dc2626' : '#16a34a',
        color: '#fff',
        padding: '8px 12px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 99999,
        maxHeight: '180px',
        overflowY: 'auto',
      }}
    >
      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
}