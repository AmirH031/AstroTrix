import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import notificationService from '@/services/notificationService';

export default function NotificationSettings({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState(notificationService.getSettings());
  const [permission, setPermission] = useState(notificationService.permission);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const updateSettings = () => setSettings(notificationService.getSettings());
    updateSettings();
    const interval = setInterval(updateSettings, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPermission(notificationService.permission);
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const updateNestedSetting = (category: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: { ...settings[category], [key]: value },
    };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const handlePermissionRequest = async () => {
    setIsRequesting(true);
    try {
      const granted = await notificationService.requestPermission();
      setPermission(granted ? 'granted' : 'denied');
    } catch (error) {
    } finally {
      setIsRequesting(false);
    }
  };

  const reminderOptions = [
    { value: 1, label: '1 minute' },
    { value: 2, label: '2 minutes' },
    { value: 3, label: '3 minutes' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
  ];

  return (
    <div className="notification-card relative text-white bg-transparent transition-all duration-500">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="fixed inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/AstroTrix/Background.webm" type="video/webm" />
      </video>

      <div className="fixed inset-0 bg-black/60 -z-10" />

      <motion.header
        className="fixed top-0 left-0 right-0 z-30 p-6 flex items-center gap-4 backdrop-blur-md bg-black/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-green-400 hover:text-green-300"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold text-green-400">Notifications</h1>
        </div>
      </motion.header>

      <main className="relative z-20 pt-24 pb-24 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="backdrop-blur-md bg-gray-800/50 border border-green-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-400">
                {permission === 'granted' ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
                Permission Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permission === 'granted' ? (
                <div className="p-4 rounded-lg bg-green-900/30 text-green-300">
                  ✅ Notifications are enabled! You'll receive task reminders and
                  completion alerts.
                </div>
              ) : permission === 'denied' ? (
                <div className="p-4 rounded-lg bg-red-900/30 text-red-300">
                  ❌ Notifications are blocked. Please enable them in your browser
                  settings.
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-900/30 text-yellow-300">
                  🔔 Enable notifications to receive task reminders and completion
                  alerts.
                  <Button
                    onClick={handlePermissionRequest}
                    disabled={isRequesting}
                    className="mt-3 bg-green-500 hover:bg-green-600 text-black"
                  >
                    {isRequesting ? 'Requesting...' : 'Enable Notifications'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gray-800/50 border border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400">Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-base font-medium text-gray-200">
                    Enable All Notifications
                  </Label>
                  <p className="text-sm text-gray-400">
                    Master switch for all notification types
                  </p>
                </div>
                <Switch
                  checked={settings.globalEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting('globalEnabled', checked)
                  }
                  className="data-[state=checked]:bg-green-500 h-4 w-8"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <Label className="text-base font-medium text-gray-200">
                      Sound Effects
                    </Label>
                    <p className="text-sm text-gray-400">Play notification sounds</p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting('soundEnabled', checked)
                  }
                  className="data-[state=checked]:bg-green-500 h-4 w-8"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gray-800/50 border border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400">⏰ Task Timeout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-gray-200">Enable Timeouts</Label>
                <Switch
                  checked={settings.taskReminder.enabled}
                  onCheckedChange={(checked) =>
                    updateNestedSetting('taskReminder', 'enabled', checked)
                  }
                  className="data-[state=checked]:bg-green-500 h-4 w-8"
                />
              </div>

              {settings.taskReminder.enabled && (
                <div className="space-y-2">
                  <Select
                    value={settings.taskReminder.minutesBefore.toString()}
                    onValueChange={(value) =>
                      updateNestedSetting(
                        'taskReminder',
                        'minutesBefore',
                        parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-gray-800 border-gray-600 z-[100] max-h-60 overflow-y-auto"
                      position="popper"
                    >
                      {reminderOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gray-800/50 border border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400">✅ Task Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-gray-200">Enable Completion Alerts</Label>
                <Switch
                  checked={settings.taskCompletion.enabled}
                  onCheckedChange={(checked) =>
                    updateNestedSetting('taskCompletion', 'enabled', checked)
                  }
                  className="data-[state=checked]:bg-green-500 h-4 w-8"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gray-800/50 border border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400">📦 Task Archive</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-gray-200">Enable Archive Alerts</Label>
                <Switch
                  checked={settings.taskArchive.enabled}
                  onCheckedChange={(checked) =>
                    updateNestedSetting('taskArchive', 'enabled', checked)
                  }
                  className="data-[state=checked]:bg-green-500 h-4 w-8"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}