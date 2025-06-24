import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Archive, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SettingsData {
  defaultNoteType: "once" | "weekly";
  timeGap: number;
  autoCheckOnTimerEnd: boolean;
  weeklyRepeatEnabled: boolean;
  autoArchiveCompleted: boolean;
  archiveDelayHours: number;
}

const TIME_GAP_OPTIONS = [
  { value: 0, label: "No Gap" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: -1, label: "Custom" },
];

const ARCHIVE_DELAY_OPTIONS = [
  { value: 0, label: "Instant" },
  { value: 1, label: "1 hour" },
  { value: 6, label: "6 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "1 day" },
  { value: 48, label: "2 days" },
  { value: 168, label: "1 week" },
];

const SettingSection = ({ title, icon, children }: any) => (
  <Card className=" border border-green-400/30 backdrop-blur-md shadow-md">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-green-400">{icon}{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export default function SettingsPage({
  settings,
  onSettingsChange,
  onBack,
}: {
  settings: SettingsData;
  onSettingsChange: (s: SettingsData) => void;
  onBack: () => void;
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showCustomGap, setShowCustomGap] = useState(false);
  const [customGapValue, setCustomGapValue] = useState("");

  useEffect(() => {
    const custom = !TIME_GAP_OPTIONS.find(opt => opt.value === settings.timeGap);
    if (custom) {
      setShowCustomGap(true);
      setCustomGapValue(settings.timeGap.toString());
    }
  }, [settings]);

  const handleUpdate = (key: keyof SettingsData, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const renderSetting = (label: string, desc: string, control: React.ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-700 rounded-lg p-4 ">
      <div>
        <Label className="text-white">{label}</Label>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
      {control}
    </div>
  );

  return (
    <div className="min-h-screen overflow-y-auto text-white bg-transparent relative">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-40 z-[-2]"
        onError={(e) => console.error("Video load error:", e)}
      >
        <source src="/AstroTrix/Background.webm" type="video/webm" />
        <img src="/AstroTrix/sidebar.svg" alt="Sidebar Icon" className="h-6 w-6" />
      </video>
      <div className="fixed inset-0 bg-transparent z-[-1]" />

      <motion.header
        className="fixed top-0 left-0 right-0 z-30 p-4 flex items-center gap-4 bg-black/30 backdrop-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="ghost" size="icon" onClick={onBack} className="text-green-400 hover:text-green-300">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-green-400">Settings</h1>
      </motion.header>

      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-6">
        <SettingSection title="Default Note Configuration" icon={<Plus className="h-5 w-5" />}>
          {renderSetting("Default Note Type", "Choose how new notes behave", (
            <Select
              value={localSettings.defaultNoteType}
              onValueChange={(val) => handleUpdate("defaultNoteType", val)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 z-[100]">
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          ))}

          {renderSetting("Time Gap", "Gap between tasks", (
            <div className="flex flex-col gap-2">
              <Select
                value={showCustomGap ? "-1" : localSettings.timeGap.toString()}
                onValueChange={(val) => {
                  if (val === "-1") {
                    setShowCustomGap(true);
                    handleUpdate("timeGap", 0);
                  } else {
                    setShowCustomGap(false);
                    handleUpdate("timeGap", parseInt(val));
                  }
                }}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 z-[100]">
                  {TIME_GAP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomGap && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-24 bg-gray-700 border-gray-600 text-white"
                    value={customGapValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomGapValue(v);
                      const num = parseInt(v);
                      if (!isNaN(num)) handleUpdate("timeGap", num);
                    }}
                  />
                  <span className="text-sm text-gray-300">minutes</span>
                </div>
              )}
            </div>
          ))}
        </SettingSection>

        <SettingSection title="Automation Features" icon={<CheckCircle className="h-5 w-5" />}>
          {renderSetting("Auto-check on Timer End", "Mark tasks as done when timer ends", (
            <Switch
              checked={localSettings.autoCheckOnTimerEnd}
              onCheckedChange={(val) => handleUpdate("autoCheckOnTimerEnd", val)}
              className="data-[state=checked]:bg-green-500 h-5 w-10"
            />
          ))}

          {renderSetting("Weekly Repeat", "Allow tasks to repeat weekly", (
            <Switch
              checked={localSettings.weeklyRepeatEnabled}
              onCheckedChange={(val) => handleUpdate("weeklyRepeatEnabled", val)}
              className="data-[state=checked]:bg-green-500 h-5 w-10"
            />
          ))}
        </SettingSection>

        <SettingSection title="Task Management" icon={<Archive className="h-5 w-5" />}>
          {renderSetting("Auto-archive Completed", "Move tasks to archive after delay", (
            <Switch
              checked={localSettings.autoArchiveCompleted}
              onCheckedChange={(val) => handleUpdate("autoArchiveCompleted", val)}
              className="data-[state=checked]:bg-green-500 h-5 w-10"
            />
          ))}

          {localSettings.autoArchiveCompleted &&
            renderSetting("Archive Delay", "How long to wait before archiving", (
              <Select
                value={localSettings.archiveDelayHours.toString()}
                onValueChange={(val) =>
                  handleUpdate("archiveDelayHours", parseInt(val))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 z-[100]">
                  {ARCHIVE_DELAY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
        </SettingSection>

        <SettingSection title="Current Configuration" icon={<Clock className="h-5 w-5" />}>
          <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li>Note Type: <span className="text-green-400">{localSettings.defaultNoteType}</span></li>
            <li>Time Gap: <span className="text-green-400">{localSettings.timeGap} mins</span></li>
            <li>Auto-check: <span className="text-green-400">{localSettings.autoCheckOnTimerEnd ? "On" : "Off"}</span></li>
            <li>Auto-archive: <span className="text-green-400">{localSettings.autoArchiveCompleted ? `After ${localSettings.archiveDelayHours} hrs` : "Off"}</span></li>
          </ul>
        </SettingSection>
      </main>
    </div>
  );
}