import { toast } from "sonner";

const SSE_URL = "http://127.0.0.1:8000/api/sse/stream";

export interface NotifyMessage {
  message: string;
  post_id?: string;
  author?: string;
}

export interface SSEData {
  user: string;
  timestamp: string;
  message: string | NotifyMessage;
}

export class SSEClient {
  private source: EventSource | null = null;
  private listeners: ((data: SSEData) => void)[] = [];
  private reconnectInterval = 5000;
  private connected = false;

  connect() {
    if (typeof window === "undefined") return;
    if (this.source) this.source.close();
    this.source = new EventSource(SSE_URL, { withCredentials: true });

    this.source.onopen = () => {
      this.connected = true;
      // toast.success("Đã kết nối SSE", { duration: 1000, position: "top-center" });
    };

    this.source.onmessage = (event: MessageEvent<string>) => {
      try {
        const data: SSEData = JSON.parse(event.data);
        this.listeners.forEach((cb) => cb(data));
      } catch {}
    };

    this.source.onerror = async () => {
      this.connected = false;
      try {
        await fetch("http://127.0.0.1:8000/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.", {
          position: "top-center",
          duration: 1500,
        });
        return;
      }
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
  }

  onMessage(callback: (data: SSEData) => void) {
    this.listeners.push(callback);
  }

  close() {
    if (this.source) {
      console.log("🔌 Closing SSE connection...");
      this.source.onopen = null;
      this.source.onmessage = null;
      this.source.onerror = null;
      this.source.close();
      this.source = null;
      this.connected = false;
    }
    this.listeners = [];
  }


  isConnected() {
    return this.connected;
  }
}
