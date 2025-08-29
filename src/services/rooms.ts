import api from './api';

export type Room = { id: number; name: string; description?: string };

export async function listRooms(): Promise<Room[]> {
  const { data } = await api.get<Room[]>('/api/rooms');
  return data;
}

export async function createRoom(name: string, description?: string): Promise<Room> {
  const params = new URLSearchParams();
  params.set('name', name);
  if (description) params.set('description', description);
  const { data } = await api.post<Room>('/api/rooms', undefined, { params });
  return data;
}

export async function joinRoom(roomId: number) {
  await api.post(`/api/rooms/${roomId}/join`);
}

export async function leaveRoom(roomId: number) {
  await api.post(`/api/rooms/${roomId}/leave`);
}


