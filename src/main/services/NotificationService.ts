import type { INotification } from '@shared/config/notification';
import type { BrowserWindow } from 'electron';
import { Notification as ElectronNotification } from 'electron';

class NotificationService {
  private window: BrowserWindow;

  constructor(window: BrowserWindow) {
    // Initialize the service
    this.window = window;
  }

  public async sendNotification(notification: INotification) {
    console.log('Sending notification:', notification);
    // Electron Notification API
    const electronNotification = new ElectronNotification({
      title: notification.title,
      body: notification.message,
    });

    electronNotification.on('click', () => {
      this.window.show();
      this.window.webContents.send('notification-click', notification);
    });

    electronNotification.show();
  }
}

export default NotificationService;
