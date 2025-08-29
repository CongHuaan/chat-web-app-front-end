declare module 'stompjs' {
  export type Message = { body: string };
  export interface Client {
    connect(headers: any, onConnect: () => void, onError?: (e: any) => void): void;
    disconnect(callback?: () => void): void;
    subscribe(destination: string, callback: (message: Message) => void): { unsubscribe: () => void };
    send(destination: string, headers?: any, body?: string): void;
    debug?: (...args: any[]) => void;
  }
  const Stomp: { over(ws: any): Client };
  export default Stomp;
}


