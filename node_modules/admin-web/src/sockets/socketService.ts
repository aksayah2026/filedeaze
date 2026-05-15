import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080/ws';

class SocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.client?.connected || this.isConnecting) return;
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS(SOCKET_URL),
          debug: (str) => {
            if (import.meta.env.DEV) console.log('[STOMP]', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
          this.isConnecting = false;
          console.log('WebSocket Connected');
          resolve();
        };

        this.client.onStompError = (frame) => {
          this.isConnecting = false;
          console.error('STOMP Error:', frame.headers['message']);
          reject(new Error(frame.headers['message']));
        };

        this.client.onWebSocketError = (event) => {
          this.isConnecting = false;
          console.error('WebSocket Transport Error:', event);
          reject(event);
        };

        this.client.activate();
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  subscribe(topic: string, callback: (data: any) => void) {
    if (!this.client || !this.client.connected) {
      setTimeout(() => this.subscribe(topic, callback), 1000);
      return;
    }

    if (this.subscriptions.has(topic)) return;

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error('Socket Parse Error:', e);
      }
    });

    this.subscriptions.set(topic, subscription);
    return subscription;
  }

  subscribeToUserNotifications(userId: string, callback: (data: any) => void) {
    return this.subscribe(`/topic/notifications/${userId}`, callback);
  }

  subscribeToTechnicianLocation(technicianId: string, callback: (data: any) => void) {
    return this.subscribe(`/topic/tracking/${technicianId}`, callback);
  }

  subscribeToTickets(callback: (data: any) => void) {
    return this.subscribe('/topic/service-requests', callback);
  }

  subscribeToTechnicianStatus(callback: (data: any) => void) {
    return this.subscribe('/topic/technician-status', callback);
  }

  subscribeToNotifications(callback: (data: any) => void) {
    return this.subscribe('/topic/notifications', callback);
  }

  unsubscribe(topic: string) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions.clear();
      this.isConnecting = false;
    }
  }
}

export const socketService = new SocketService();
