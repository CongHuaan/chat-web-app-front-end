import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listRooms, createRoom, joinRoom, leaveRoom } from '../services/rooms';
import type { Room } from '../services/rooms';
import ChatLayout from '../components/ChatLayout';
import SidebarRooms from '../components/SidebarRooms';

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setError('');
    try {
      setRooms(await listRooms());
    } catch (e: any) {
      setError(e?.response?.data || 'Lỗi tải phòng');
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createRoom(name, description);
      setName(''); setDescription('');
      load();
    } catch (e: any) {
      setError(e?.response?.data || 'Tạo phòng thất bại');
    }
  };

  return (
    <ChatLayout sidebar={<SidebarRooms />}>
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>Chọn phòng để bắt đầu chat</div>
    </ChatLayout>
  );
}


