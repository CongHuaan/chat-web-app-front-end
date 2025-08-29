import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listRooms, type Room } from '../services/rooms';
import { createStompClient } from '../ws/stomp';

type Preview = { roomId: number; text: string; unread: boolean };

export default function SidebarRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [previews, setPreviews] = useState<Record<number, Preview>>({});
  const navigate = useNavigate();
  const { roomId } = useParams();
  const activeId = Number(roomId);
  const clientRef = useRef<any>(null);

  useEffect(() => { (async () => { setRooms(await listRooms()); })(); }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<Preview>) => setPreviews(prev => ({ ...prev, [e.detail.roomId]: e.detail }));
    window.addEventListener('room-preview' as any, handler as any);

    // subscribe WS preview channel
    const client = createStompClient(() => {
      client.subscribe('/topic/rooms/preview', (msg: any) => {
        try {
          const body = JSON.parse(msg.body);
          // ignore if this client is the sender
          const me = localStorage.getItem('username');
          console.log('Preview received:', { body, me, shouldIgnore: body.senderName === me });
          if (body.senderName && me && body.senderName === me) return;
          // ignore if preview is for the currently open room
          const currentRoomId = Number(window.location.pathname.split('/').pop());
          if (Number(body.roomId) === currentRoomId) return;
          setPreviews(prev => ({ ...prev, [Number(body.roomId)]: { roomId: Number(body.roomId), text: String(body.content), unread: true } }));
        } catch {}
      });
    }, () => {});
    clientRef.current = client;

    return () => {
      window.removeEventListener('room-preview' as any, handler as any);
      try { client.disconnect(() => {}); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setPreviews(prev => ({ ...prev, [activeId]: { ...(prev[activeId] || { roomId: activeId, text: '', unread: false }), unread: false } }));
  }, [activeId]);

  return (
    <div>
      <form style={{ display: 'flex', gap: 8, padding: 12 }} onSubmit={e => e.preventDefault()}>
        <input placeholder="Tìm kiếm trên Messenger" style={{ flex: 1, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', padding:'8px 12px', borderRadius:8 }} />
        <button>Tạo</button>
      </form>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rooms.map(r => {
          const pv = previews[r.id];
          const isActive = r.id === activeId;
          return (
            <li key={r.id} onClick={() => navigate(`/rooms/${r.id}`)}
                style={{ padding:'10px 12px', cursor:'pointer', color:'#e5e7eb', background: isActive ? '#0b1220' : 'transparent', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700 }}>{r.name}</div>
                <div style={{ fontSize:12, color:'#9ca3af' }}>{pv?.text || r.description}</div>
              </div>
              {pv?.unread && !isActive && <span style={{ width:8, height:8, background:'#60a5fa', borderRadius:9999 }} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}


