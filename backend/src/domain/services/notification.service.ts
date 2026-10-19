// ==============================================================================
// Aroom: In-app Notification Service (Team Leader bell, agent status updates)
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/store.js';
import { AppNotification } from '../entities/types.js';

export class NotificationService {
  public notify(
    recipientUserId: string,
    type: string,
    title: string,
    body?: string,
    payload?: Record<string, any>
  ): AppNotification {
    const n: AppNotification = {
      id: uuidv4(),
      recipientUserId,
      type,
      title,
      body,
      payload,
      createdAt: new Date(),
    };
    db.notifications.set(n.id, n);
    return n;
  }

  /** Notify every Team Leader (admin). */
  public notifyAdmins(type: string, title: string, body?: string, payload?: Record<string, any>) {
    for (const u of db.users.values()) {
      if (u.userType === 'admin' && u.accountStatus === 'active') {
        this.notify(u.id, type, title, body, payload);
      }
    }
  }

  public list(userId: string, limit = 50) {
    const items = Array.from(db.notifications.values())
      .filter((n) => n.recipientUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return {
      unreadCount: items.filter((n) => !n.readAt).length,
      items,
    };
  }

  public markRead(userId: string, notificationId: string) {
    const n = db.notifications.get(notificationId);
    if (!n || n.recipientUserId !== userId) {
      throw new Error('Notification not found.');
    }
    n.readAt = n.readAt ?? new Date();
    return n;
  }

  public markAllRead(userId: string) {
    for (const n of db.notifications.values()) {
      if (n.recipientUserId === userId && !n.readAt) n.readAt = new Date();
    }
  }
}

