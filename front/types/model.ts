export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  isTwoFactorEnabled?: boolean;
  blockedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  documents: Document[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  collaborators: User[];
  updatedBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  type: 'TEXT' | 'PDF' | 'IMAGE';
}

export interface Permission {
  id: string;
  userId: string;
  documentId: string;
  canEdit: boolean;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  documentId: string;
  invitedById: string;
  invitedToId: string;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export type Notification = {
  id: string
  type: "INVITATION" | "DOCUMENT_UPDATE" | "COLLABORATOR_JOIN" | "COLLABORATOR_LEAVE"
  title: string
  message: string
  read: boolean
  timestamp: Date
  documentId?: string
  documentTitle?: string
  senderId: string
  senderName: string
  senderAvatar?: string
  userId: string
  token?: string
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}