interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketSubscription {
  callback: (data: any) => void;
  filter?: (data: any) => boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, WebSocketSubscription[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem('token');
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}/ws?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connecté');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onOpen();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket déconnecté');
        this.isConnecting = false;
        this.onClose();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        this.isConnecting = false;
        this.onError();
      };

    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }

  subscribe(type: string, callback: (data: any) => void, filter?: (data: any) => boolean): () => void {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, []);
    }

    const subscription: WebSocketSubscription = { callback, filter };
    this.subscriptions.get(type)!.push(subscription);

    // Retourne une fonction de désabonnement
    return () => {
      const subs = this.subscriptions.get(type);
      if (subs) {
        const index = subs.indexOf(subscription);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const subscriptions = this.subscriptions.get(message.type);
    if (subscriptions) {
      subscriptions.forEach(sub => {
        if (!sub.filter || sub.filter(message.data)) {
          sub.callback(message.data);
        }
      });
    }
  }

  private onOpen(): void {
    // Envoyer un ping pour maintenir la connexion
    this.send('ping', { timestamp: Date.now() });
  }

  private onClose(): void {
    this.attemptReconnect();
  }

  private onError(): void {
    this.attemptReconnect();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Impossible de se reconnecter au WebSocket après plusieurs tentatives');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
}

export const websocketService = new WebSocketService();

// Auto-connexion si un token est présent
if (localStorage.getItem('token')) {
  websocketService.connect();
}