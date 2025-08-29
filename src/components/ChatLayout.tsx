import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function ChatLayout({ sidebar, children }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100%', gap: 0, background:'#0f172a' }}>
      <aside style={{ borderRight: '1px solid #1f2937', overflowY: 'auto', background:'#111827' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #1f2937', color:'#e5e7eb' }}>
          <Link to="/rooms" style={{ fontWeight: 600, textDecoration: 'none', color:'#e5e7eb' }}>Đoạn chat</Link>
        </div>
        {sidebar}
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', background:'#0f172a', minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}


