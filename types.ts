
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  encryptedContent: string; // Base64
  iv: string; // Initialization Vector (Base64)
  timestamp: number;
}

export interface User {
  username: string;
  id: string; // Unique hex string identity
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
