import { toast } from "sonner";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL;

export interface WSMessage<T = unknown> {
  type?: string;
  data: T;
  created_at?: string;
}

export interface WSOptions<T = unknown> {
  path: string;
  onMessage?: (data: WSMessage<T>) => void;
  onOpen?: (ws: WebSocket) => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxRetries?: number;
  token?: string;
}

export class WSClient<T = unknown> {
  private ws: WebSocket | null = null;
  private readonly path: string;
  private readonly onMessage?: (data: WSMessage<T>) => void;
  private readonly onOpen?: (ws: WebSocket) => void;
  private readonly onClose?: () => void;
  private readonly onError?: (err: Event) => void;
  private readonly reconnect: boolean;
  private readonly reconnectDelay: number;
  private readonly maxRetries: number;
  private readonly token?: string;
  private retryCount = 0;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(options: WSOptions<T>) {
    this.path = options.path;
    this.onMessage = options.onMessage;
    this.onOpen = options.onOpen;
    this.onClose = options.onClose;
    this.onError = options.onError;
    this.reconnect = options.reconnect ?? true;
    this.reconnectDelay = options.reconnectDelay ?? 3000;
    this.maxRetries = options.maxRetries ?? 5;
    this.token = options.token;
  }

  connect(): void {
    const token = this.token || localStorage.getItem("access_token");
    const url = token
      ? `${WS_BASE_URL}${this.path}?token=${encodeURIComponent(token)}`
      : `${WS_BASE_URL}${this.path}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      if (!this.ws) return;
      this.retryCount = 0;
      this.startHeartbeat();
      this.onOpen?.(this.ws);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as WSMessage<T>;
        this.onMessage?.(parsed);
      } catch {
      }
    };

    this.ws.onerror = (err: Event) => {
      this.onError?.(err);
    };

    this.ws.onclose = (ev: CloseEvent) => {
      this.stopHeartbeat();
      this.onClose?.();

      switch (ev.code) {
        case 4401:
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", {
            position: "bottom-left",
          });
          break;
        case 4403:
          toast.error("Kết nối bị từ chối (Origin không hợp lệ).", {
            position: "bottom-left",
          });
          break;
        default:
          if (this.reconnect && this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => this.connect(), this.reconnectDelay);
            toast.warning(
              `Mất kết nối... đang thử lại (${this.retryCount}/${this.maxRetries})`,
              { position: "bottom-left", duration: 1500 }
            );
          } else if (this.retryCount >= this.maxRetries) {
            toast.error("Không thể kết nối tới máy chủ realtime.", {
              position: "bottom-left",
            });
          }
          break;
      }
    };
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  send(data: WSMessage<T>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      toast.error("Không thể gửi dữ liệu — WS chưa kết nối.", {
        position: "bottom-left",
      });
      return;
    }
    this.ws.send(JSON.stringify(data));
  }

  close(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
