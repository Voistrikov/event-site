export interface MessageUser {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  email?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  sender?: MessageUser;
  recipient?: MessageUser;
}

