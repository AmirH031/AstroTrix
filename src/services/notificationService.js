// 🔔 offlineNotificationService.js or notificationService.js
class OfflineNotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.settings = this.loadSettings();
    this.scheduledTimeouts = new Map();
    this.taskCompletionCallbacks = new Map();
    this.scheduledTasks = new Set(); // Track scheduled task IDs
    this.registerServiceWorker();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 Service Worker registered successfully');
      } catch (error) {
        console.error('🔧 Service Worker registration failed:', error);
      }
    }
  }

  loadSettings() {
    const defaultSettings = {
      taskReminder: {
        enabled: true,
        minutesBefore: 5,
        sound: 'timeout'
      },
      taskCompletion: {
        enabled: true,
        sound: 'completed'
      },
      taskArchive: {
        enabled: true,
        sound: 'archive'
      },
      globalEnabled: true,
      soundEnabled: true,
      fallbackToast: true
    };

    try {
      const saved = localStorage.getItem('astrotrix_notification_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (error) {
      console.error('🔔 NotificationService: Error loading settings:', error);
      return defaultSettings;
    }
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('astrotrix_notification_settings', JSON.stringify(this.settings));
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported');
    }

    if (this.permission === 'granted') {
      return true;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  isNotificationEnabled(type) {
    if (!this.settings.globalEnabled) {
      return false;
    }

    switch (type) {
      case 'task_reminder':
        return this.settings.taskReminder.enabled;
      case 'task_completion':
        return this.settings.taskCompletion.enabled;
      case 'task_archive':
        return this.settings.taskArchive.enabled;
      default:
        return true;
    }
  }

  playNotificationSound(type) {
    if (!this.settings.soundEnabled) return;

    let soundFile;
    switch (type) {
      case 'task_reminder':
        soundFile = '/AstroTrix/sounds/timeout.wav';
        break;
      case 'task_completion':
        soundFile = '/AstroTrix/sounds/completed.wav';
        break;
      case 'task_archive':
        soundFile = '/AstroTrix/sounds/archive.wav';
        break;
      default:
        soundFile = '/AstroTrix/sounds/completed.wav';
    }

    const audio = new Audio(soundFile);
    audio.volume = 0.7;
    audio.play().catch(error => {
      console.error(`🔔 Error playing sound (${soundFile}):`, error.message);
    });
  }

  showLocalNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      if (this.settings.fallbackToast && this.onShowToast) {
        this.onShowToast(title, options.body);
      }
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/AstroTrix/favicon.ico',
        badge: '/AstroTrix/favicon.ico',
        requireInteraction: true,
        silent: true,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.data?.action) {
          this.handleNotificationAction(options.data.action, options.data.taskId);
        }
      };

      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('🔔 Error showing notification:', error);
      if (this.settings.fallbackToast && this.onShowToast) {
        this.onShowToast(title, options.body);
      }
      return null;
    }
  }

  handleNotificationAction(action, taskId) {
    switch (action) {
      case 'mark_done':
        this.onTaskMarkDone?.(taskId);
        break;
      case 'snooze':
        this.onTaskSnooze?.(taskId, 5);
        break;
      case 'extend':
        this.onTaskExtend?.(taskId, 15);
        break;
      default:
        console.log('🔔 Unknown notification action:', action);
    }
  }

  scheduleTaskNotifications(task) {
    if (!this.settings.globalEnabled || !task.time || task.completed || this.scheduledTasks.has(task.id)) {
      console.log(`🔔 Skipping schedule for task ${task.id}: global=${this.settings.globalEnabled}, time=${task.time}, completed=${task.completed}, alreadyScheduled=${this.scheduledTasks.has(task.id)}`);
      return;
    }

    console.log(`🔔 Scheduling notifications for task ${task.id}, title: "${task.title}", time: ${task.time}`);
    this.cancelTaskNotifications(task.id); // 🚫 prevent duplicates
    this.scheduledTasks.add(task.id);

    const now = new Date();
    const taskTimeObj = this.parseTaskTime(task.time);
    const timeDiff = (taskTimeObj.getTime() - now.getTime()) / (1000 * 60);

    // 🔔 Task Timeout
    if (this.settings.taskReminder.enabled && timeDiff > this.settings.taskReminder.minutesBefore) {
      const timeoutTime = new Date(taskTimeObj.getTime() - this.settings.taskReminder.minutesBefore * 60 * 1000);
      const timeoutDelay = timeoutTime.getTime() - now.getTime();

      if (timeoutDelay > 0) {
        const timeoutId = setTimeout(() => {
          console.log(`🔔 Triggering timeout for task ${task.id} at ${new Date().toISOString()}`);
          this.scheduledTasks.delete(task.id); // Remove after triggering
          this.cancelTaskNotifications(task.id); // ✅ Cancel both to prevent duplicate
          this.playNotificationSound('task_reminder');
          this.showLocalNotification('Mission Alert: Time to Transform!', {
            body: `Your mission "${task.title}" is about to begin—gear up!`,
            tag: `timeout_${task.id}`,
            data: { action: 'snooze', taskId: task.id, type: 'reminder' }
          });
        }, timeoutDelay);

        this.scheduledTimeouts.set(`timeout_${task.id}`, timeoutId);
        console.log(`🔔 Scheduled timeout for task ${task.id} in ${timeoutDelay / 1000} seconds`);
      }
    }

    // ✅ Completion
    if (this.settings.taskCompletion.enabled && timeDiff > 0) {
      const completionDelay = taskTimeObj.getTime() - now.getTime();

      if (completionDelay > 0) {
        const timeoutId = setTimeout(() => {
          console.log(`🔔 Triggering completion for task ${task.id} at ${new Date().toISOString()}`);
          this.scheduledTasks.delete(task.id); // Remove after triggering
          this.cancelTaskNotifications(task.id); // ✅ Cancel both to prevent duplicate
          this.playNotificationSound('task_completion');
          this.showLocalNotification('Mission Success: Heroic Victory!', {
            body: `Your mission "${task.title}" is complete—great work, hero!`,
            tag: `completion_${task.id}`,
            data: { action: 'mark_done', taskId: task.id, type: 'completion' }
          });

          const callback = this.taskCompletionCallbacks.get(task.id);
          if (callback) {
            callback();
          }
        }, completionDelay);

        this.scheduledTimeouts.set(`completion_${task.id}`, timeoutId);
        console.log(`🔔 Scheduled completion for task ${task.id} in ${completionDelay / 1000} seconds`);
      }
    }
  }

  parseTaskTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const taskDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    if (taskDate <= now) {
      taskDate.setDate(taskDate.getDate() + 1);
    }
    return taskDate;
  }

  cancelTaskNotifications(taskId) {
    console.log(`🔔 Canceling notifications for task ${taskId}`);
    ['timeout', 'completion'].forEach(type => {
      const key = `${type}_${taskId}`;
      const timeoutId = this.scheduledTimeouts.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.scheduledTimeouts.delete(key);
        console.log(`🔔 Canceled ${type} notification for task ${taskId}`);
      }
    });
    this.taskCompletionCallbacks.delete(taskId);
    this.scheduledTasks.delete(taskId); // Ensure task is unmarked as scheduled
  }

  registerTaskCompletionCallback(taskId, callback) {
    this.taskCompletionCallbacks.set(taskId, callback);
  }

  updateTaskCompletion(taskId, completed) {
    console.log(`🔔 Updating completion for task ${taskId} to ${completed}`);
    if (completed) {
      this.cancelTaskNotifications(taskId);
    }
  }

  setCallbacks({ onTaskMarkDone, onTaskSnooze, onTaskExtend, onShowToast }) {
    this.onTaskMarkDone = onTaskMarkDone;
    this.onTaskSnooze = onTaskSnooze;
    this.onTaskExtend = onTaskExtend;
    this.onShowToast = onShowToast;
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    this.saveSettings(newSettings);
  }

  async testNotification(type = 'default') {
    const titles = {
      task_reminder: 'Mission Alert: Time to Transform!',
      task_completion: 'Mission Success: Heroic Victory!',
      task_archive: 'Mission Log: Adventure Archived!',
      default: '🚀 Test Notification'
    };

    const bodies = {
      task_reminder: 'This is a test mission alert—get ready to act!',
      task_completion: 'This is a test mission success—well done, hero!',
      task_archive: 'This is a test mission log—adventure stored!',
      default: 'This is a test notification from AstroTrix'
    };

    console.log(`🔔 Testing notification of type ${type}`);
    this.playNotificationSound(type);
    this.showLocalNotification(titles[type], {
      body: bodies[type],
      tag: 'test_notification',
      data: { type: type }
    });
  }

  isAppInBackground() {
    return document.hidden || document.visibilityState === 'hidden';
  }

  notifyTaskArchived(task) {
    if (this.isNotificationEnabled('task_archive')) {
      this.playNotificationSound('task_archive');
      this.showLocalNotification('Mission Log: Adventure Archived!', {
        body: `Your mission "${task.title}" is now logged for history`,
        tag: `archive_${task.id}`,
        data: { type: 'archive' }
      });
    }
  }

  cleanup() {
    this.scheduledTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledTimeouts.clear();
    this.taskCompletionCallbacks.clear();
    this.scheduledTasks.clear();
  }
}

export default new OfflineNotificationService();