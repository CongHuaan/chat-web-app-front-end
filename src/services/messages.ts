import api from './api';

export type Message = {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  roomId: number;
};

export async function listByRoom(roomId: number): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/api/messages/room/${roomId}`);
  return data;
}

export async function sendMessage(roomId: number, content: string): Promise<Message> {
  const params = new URLSearchParams();
  params.set('content', content);
  const { data } = await api.post<Message>(`/api/messages/room/${roomId}`, undefined, { params });
  return data;
}


