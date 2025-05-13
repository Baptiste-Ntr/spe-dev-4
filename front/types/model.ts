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
}

export interface Folder {
    id: string;
    name: string;
    parentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Document {
    id: string;
    title: string;
    content?: string;
    filePath?: string;
    mimeType?: string;
    folderId?: string;
    updatedById?: string;
    updatedAt: Date;
    createdAt: Date;
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