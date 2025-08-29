import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listByRoom, sendMessage } from '../services/messages';
import type { Message } from '../services/messages';
import type { Message as StompMessage, Client } from 'stompjs';
import { createStompClient } from '../ws/stomp';
import ChatLayout from '../components/ChatLayout';
import SidebarRooms from '../components/SidebarRooms';

export default function RoomChat() {
  const { roomId } = useParams();
  const id = Number(roomId);
  const [messages, setMessages] = useState<Message[]>([]);
  const idsRef = useRef<Set<number>>(new Set());
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const clientRef = useRef<Client | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listByRoom(id);
        idsRef.current = new Set((data || []).map(m => Number(m.id)) as any);
        setMessages(data);
        queueMicrotask(() => {
          if (scrollerRef.current) {
            scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight });
          }
        });
      } catch (e: any) {
        setError(e?.response?.data || 'Lỗi tải tin nhắn');
      }
    };
    load();

    let subscription: { unsubscribe: () => void } | null = null;
    const client = createStompClient(() => {
      console.log('WS connected');
      subscription = client.subscribe(`/topic/rooms/${id}`, (msg: StompMessage) => {
        console.log('Received message', msg.body);
        try {
          const raw = JSON.parse(msg.body);
          const body: Message = { ...raw, id: Number(raw.id) };
          // gửi sự kiện preview/unread cho sidebar
          // Bỏ dispatch local preview để người gửi không thấy preview của chính mình
          setMessages(prev => {
            const idNum = Number(body.id);
            if (idNum && idsRef.current.has(idNum)) return prev;
            if (idNum) idsRef.current.add(idNum);
            const next = [...prev, body];
            console.log('UI add message, total=', next.length);
            queueMicrotask(() => scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' }));
            return next;
          });
        } catch {}
      });
      console.log('Subscribed', `/topic/rooms/${id}`);
    }, (e) => console.error('WS error', e));
    clientRef.current = client;
    return () => {
      try { if (subscription) subscription.unsubscribe(); } catch {}
      try { client.disconnect(() => {}); } catch {}
    };
  }, [id]);

  // Fallback: sau khi messages render xong lần đầu, đảm bảo cuộn xuống cuối
  useEffect(() => {
    if (!initialScrollDone.current && messages.length > 0) {
      initialScrollDone.current = true;
      setTimeout(() => {
        if (scrollerRef.current) {
          scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight });
        }
      }, 0);
    }
  }, [messages.length]);

  // reset scroll flag whenever room changes to enforce scroll on enter
  useEffect(() => {
    initialScrollDone.current = false;
  }, [id]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await sendMessage(id, content.trim());
      setContent('');
    } catch (e: any) {
      setError(e?.response?.data || 'Gửi tin thất bại');
    }
  };

  return (
    <ChatLayout sidebar={<SidebarRooms />}>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: 'calc(100vh - 80px)', minHeight: 0 }}>
        <div style={{ padding: 12, borderBottom: '1px solid #1f2937', fontWeight: 600, color:'#e5e7eb' }}>Phòng #{id}</div>
        {error && <div style={{ color: 'red', padding: 12 }}>{error}</div>}
        <div ref={scrollerRef} style={{ overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {messages.map((m, i) => {
            const isMine = m.senderName === (localStorage.getItem('username') || '');
            return (
              <div key={`${m.id}-${i}`} style={{ display:'flex', flexDirection:'column', alignItems: isMine ? 'flex-end':'flex-start' }}>
                <div style={{ fontSize:12, color:'#9ca3af', marginBottom: 2 }}>{m.senderName}</div>
                <div style={{ background: isMine ? '#6d28d9':'#374151', padding: '10px 14px', borderRadius: 18, maxWidth: '70%', color:'#e5e7eb' }}>
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={onSend} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #1f2937', background:'#111827' }}>
          <input value={content} onChange={e => setContent(e.target.value)} placeholder="Aa" style={{ flex: 1, background:'#111827', border:'1px solid #1f2937', color:'#e5e7eb', padding:'10px 14px', borderRadius: 24 }} />
          <button type="submit">Gửi</button>
        </form>
      </div>
    </ChatLayout>
  );
}


