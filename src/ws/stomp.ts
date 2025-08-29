import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import type { Message as StompMessage, Client as StompClient } from 'stompjs';

// SockJS yêu cầu endpoint dạng http(s) thay vì ws(s)
const RAW_URL = (import.meta as any).env.VITE_WS_URL || 'http://localhost:8080/ws';
const WS_URL = RAW_URL.replace(/^wss?:\/\//i, (m: string) => (m.toLowerCase() === 'wss://' ? 'https://' : 'http://'));

export function createStompClient(onConnect: () => void, onError: (e: any) => void) {
  const sock = new SockJS(WS_URL) as any;
  const client: StompClient = Stomp.over(sock);
  (client as any).debug = () => {};
  client.connect({}, onConnect, onError);
  return client;
}

export type MessageHandler = (msg: StompMessage) => void;


