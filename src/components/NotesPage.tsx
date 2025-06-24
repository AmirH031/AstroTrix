import { useState, useEffect, Suspense, lazy, memo, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  BarChart3,
  Trash2,
  AlertCircle,
  Clock,
  Archive,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

import TaskTimeInput from "./TaskTimeInput";
import { LoadingSpinner } from "./UIComponents";
import notificationService from "@/services/notificationService";

// Lazy load heavy components
const AnalyticsPage = lazy(() => import("./AnalyticsPage"));
const SettingsPage = lazy(() => import("./SettingsPage"));
const ArchivePage = lazy(() => import("./ArchivePage"));
const NotificationSettings = lazy(() => import("./NotificationSettings"));

interface Task {
  [x: string]: any;
  id: string;
  title: string;
  time: string;
  completed: boolean;
  repeat: "once" | "custom" | "weekly";
  customDays: string[];
  createdAt: number;
  completedAt?: number;
  timerEndTime?: number;
  archived?: boolean;
}

interface Note {
  id: string;
  tasks: Task[];
  isExpanded?: boolean;
}

interface SettingsData {
  defaultNoteType: "once" | "weekly";
  timeGap: number; // in minutes
  autoCheckOnTimerEnd: boolean;
  weeklyRepeatEnabled: boolean;
  autoArchiveCompleted: boolean;
  archiveDelayHours: number;
}

const STORAGE_KEY = "astrotrix_notes";
const SETTINGS_KEY = "astrotrix_settings";
const ARCHIVED_KEY = "astrotrix_archived";

const DEFAULT_SETTINGS: SettingsData = {
  defaultNoteType: "once",
  timeGap: 0, // 0 means no gap
  autoCheckOnTimerEnd: true,
  weeklyRepeatEnabled: true,
  autoArchiveCompleted: true,
  archiveDelayHours: 24,
};

// Memoized task card component for better performance
const TaskCard = memo(({ 
  note, 
  task, 
  isMobile, 
  expandedNoteId, 
  settings, 
  onUpdateTask, 
  onDeleteTask, 
  onToggleExpansion 
}: {
  note: Note;
  task: Task;
  isMobile: boolean;
  expandedNoteId: string | null;
  settings: SettingsData;
  onUpdateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (noteId: string, taskId: string) => void;
  onToggleExpansion: (noteId: string) => void;
}) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateTask(note.id, task.id, { title: e.target.value });
  }, [note.id, task.id, onUpdateTask]);

  const handleCompletedChange = useCallback((checked: boolean) => {
    onUpdateTask(note.id, task.id, { completed: checked });
  }, [note.id, task.id, onUpdateTask]);

  const handleTimeChange = useCallback((time: string) => {
    onUpdateTask(note.id, task.id, { time });
  }, [note.id, task.id, onUpdateTask]);

  const handleRepeatChange = useCallback((repeat: "once" | "custom" | "weekly") => {
    onUpdateTask(note.id, task.id, { repeat });
  }, [note.id, task.id, onUpdateTask]);

  const handleCustomDaysChange = useCallback((customDays: string[]) => {
    onUpdateTask(note.id, task.id, { customDays });
  }, [note.id, task.id, onUpdateTask]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(note.id, task.id);
  }, [note.id, task.id, onDeleteTask]);

  const formatTime12Hour = (time: string) => {
    if (!time) return "No time set";
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Card
      className={`card-enhanced transition-optimized overflow-hidden backdrop-blur-md
        ${isMobile && expandedNoteId === note.id ? "ring-2 ring-emerald-400" : ""}`}
      style={{ 
        boxShadow: "0 0 20px rgba(16, 185, 129, 0.1)"
      }}
      onClick={() => isMobile && onToggleExpansion(note.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Task input row */}
          <div className="flex items-center gap-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleCompletedChange}
              className="border-emerald-400/50 data-[state=checked]:bg-emerald-500"
            />
            <Input
              placeholder="Mission Name..."
              value={task.title}
              onChange={handleTitleChange}
              className="text-lg font-medium input-enhanced placeholder:text-gray-400"
            />
            <TaskTimeInput
              time={task.time}
              repeat={task.repeat}
              customDays={task.customDays}
              weeklyEnabled={settings.weeklyRepeatEnabled}
              onTimeChange={handleTimeChange}
              onRepeatChange={handleRepeatChange}
              onCustomDaysChange={handleCustomDaysChange}
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Time summary */}
          {(!isMobile || expandedNoteId === note.id) && (
            <div className="flex items-center gap-2 pt-2 text-sm">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className="text-medium-contrast">
                {formatTime12Hour(task.time)}
              </span>
              {task.repeat !== "once" && (
                <span className="text-muted-contrast">
                  • {task.repeat === "weekly" ? "Weekly" : "Custom schedule"}
                </span>
              )}
              {task.timerEndTime && !task.completed && (
                <span className="text-amber-500">
                  • Timer active
                </span>
              )}
              {settings.timeGap > 0 && (
                <span className="text-xs text-emerald-500">
                  • Gap: {settings.timeGap}min
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

TaskCard.displayName = 'TaskCard';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, noteId: "", taskId: undefined as string | undefined });
  const [isMobile, setIsMobile] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationService.setCallbacks({
      onTaskMarkDone: (taskId: string) => {
        setNotes(prevNotes =>
          prevNotes.map(note => ({
            ...note,
            tasks: note.tasks.map(task =>
              task.id === taskId ? { ...task, completed: true, completedAt: Date.now() } : task
            )
          }))
        );
      },
      onTaskSnooze: (taskId: string, minutes: number) => {
        setNotes(prevNotes =>
          prevNotes.map(note => ({
            ...note,
            tasks: note.tasks.map(task => {
              if (task.id === taskId && task.time) {
                const [hours, mins] = task.time.split(':').map(Number);
                const newTime = new Date();
                newTime.setHours(hours, mins + minutes);
                const newTimeString = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
                
                const updatedTask = { ...task, time: newTimeString };
                notificationService.scheduleTaskNotifications(updatedTask);
                
                return updatedTask;
              }
              return task;
            })
          }))
        );
      },
      onTaskExtend: (taskId: string, minutes: number) => {
        setNotes(prevNotes =>
          prevNotes.map(note => ({
            ...note,
            tasks: note.tasks.map(task => {
              if (task.id === taskId && task.timerEndTime) {
                const newEndTime = task.timerEndTime + (minutes * 60 * 1000);
                return { ...task, timerEndTime: newEndTime };
              }
              return task;
            })
          }))
        );
      },
      onShowToast: (title: string, message: string) => {
        toast(title, {
          description: message,
          duration: 5000,
        });
      }
    });

    const requestNotificationPermission = async () => {
      const permissionRequested = localStorage.getItem('astrotrix_permission_requested');
      
      if (!permissionRequested && !hasRequestedPermission) {
        setHasRequestedPermission(true);
        
        try {
          const granted = await notificationService.requestPermission();
          
          localStorage.setItem('astrotrix_permission_requested', 'true');
          
          if (granted) {
          } else {
          }
        } catch (error) {
        }
      }
    };

    const timer = setTimeout(requestNotificationPermission, 1000);
    
    return () => {
      clearTimeout(timer);
      notificationService.cleanup();
    };
  }, [hasRequestedPermission]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    const savedArchived = localStorage.getItem(ARCHIVED_KEY);
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
    }
    if (savedArchived) {
      setArchivedTasks(JSON.parse(savedArchived));
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  useEffect(() => {
    if (!settings.autoArchiveCompleted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const archiveThreshold = settings.archiveDelayHours * 60 * 60 * 1000;

      setNotes(prevNotes => {
        const updatedNotes = prevNotes.map(note => ({
          ...note,
          tasks: note.tasks.filter(task => {
            if (task.completed && task.completedAt && !task.archived) {
              if (settings.archiveDelayHours === 0) {
                setArchivedTasks(prev => [...prev, { ...task, archived: true }]);
                if (notificationService.isNotificationEnabled('task_archive')) {
                  notificationService.notifyTaskArchived(task);
                }
                notificationService.cancelTaskNotifications(task.id);
                return false;
              }
              
              const timeSinceCompletion = now - task.completedAt;
              if (timeSinceCompletion >= archiveThreshold) {
                setArchivedTasks(prev => [...prev, { ...task, archived: true }]);
                if (notificationService.isNotificationEnabled('task_archive')) {
                  notificationService.notifyTaskArchived(task);
                }
                notificationService.cancelTaskNotifications(task.id);
                return false;
              }
            }
            return true;
          })
        }));

        return updatedNotes.filter(note => note.tasks.length > 0);
      });
    }, settings.archiveDelayHours === 0 ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [settings.autoArchiveCompleted, settings.archiveDelayHours]);

  useEffect(() => {
    if (!settings.autoCheckOnTimerEnd) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setNotes(prevNotes =>
        prevNotes.map(note => ({
          ...note,
          tasks: note.tasks.map(task => {
            if (!task.completed && task.timerEndTime && now >= task.timerEndTime && !notificationService.scheduledTasks.has(task.id) && !task.completionScheduled) {
              notificationService.cancelTaskNotifications(task.id);
              return { ...task, completed: true, completedAt: now, completionScheduled: true };
            }
            return task;
          })
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.autoCheckOnTimerEnd]);

  const getMostRecentTaskTime = useCallback((): string => {
    if (settings.timeGap === 0) return '';
    
    let mostRecentTime = '';
    let mostRecentCreatedAt = 0;
    
    notes.forEach(note => {
      note.tasks.forEach(task => {
        if (task.time && task.createdAt > mostRecentCreatedAt) {
          mostRecentTime = task.time;
          mostRecentCreatedAt = task.createdAt;
        }
      });
    });
    
    return mostRecentTime;
  }, [notes, settings.timeGap]);

  const calculateNextTime = useCallback((): string => {
    if (settings.timeGap === 0) return '';
    
    const mostRecentTime = getMostRecentTaskTime();
    if (!mostRecentTime) return '';
    
    const [hours, minutes] = mostRecentTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
    
    const totalMinutes = hours * 60 + minutes + settings.timeGap;
    const nextHours = Math.floor(totalMinutes / 60) % 24;
    const nextMinutes = totalMinutes % 60;
    
    return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
  }, [getMostRecentTaskTime, settings.timeGap]);

  const addNote = useCallback(() => {
    const noteId = Date.now().toString();
    let nextTime = calculateNextTime();
    const taskId = `${Date.now().toString()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    let timeAdjustment = 0;
    const maxAttempts = 10;
    while (timeAdjustment < maxAttempts && notes.some(note => note.tasks.some(t => t.time === nextTime && !t.completed))) {
      timeAdjustment += 1;
      const [hours, minutes] = nextTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + timeAdjustment;
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;
      nextTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }

    if (timeAdjustment >= maxAttempts) {
      nextTime = `${new Date().getHours().toString().padStart(2, '0')}:${(new Date().getMinutes() + timeAdjustment).toString().padStart(2, '0')}`;
    }
    
    const newNote: Note = {
      id: noteId,
      tasks: [{
        id: taskId,
        title: '',
        time: nextTime,
        completed: false,
        repeat: settings.weeklyRepeatEnabled && settings.defaultNoteType === "weekly" ? "weekly" : "once",
        customDays: settings.defaultNoteType === "weekly" ? ['mon', 'tue', 'wed', 'thu', 'fri'] : [],
        createdAt: Date.now(),
      }],
      isExpanded: true,
    };
    setNotes(prev => [...prev, newNote]);
    if (isMobile) setExpandedNoteId(noteId);

    setTimeout(() => {
      const newTask = newNote.tasks[0];
      if (newTask.time && newTask.title && !newTask.completed) {
        notificationService.scheduleTaskNotifications(newTask);
      }
    }, 0);
  }, [settings, isMobile, calculateNextTime, notes]);

  const deleteNote = useCallback((noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    if (noteToDelete) {
      noteToDelete.tasks.forEach(task => {
        notificationService.cancelTaskNotifications(task.id);
      });
    }
    
    setNotes(prev => prev.filter(note => note.id !== noteId));
    setDeleteDialog({ isOpen: false, noteId: "", taskId: undefined });
  }, [notes]);

  const deleteTask = useCallback((noteId: string, taskId: string) => {
    notificationService.cancelTaskNotifications(taskId);
    
    setNotes(prev => {
      const updatedNotes = prev.map(note =>
        note.id === noteId
          ? { ...note, tasks: note.tasks.filter(t => t.id !== taskId) }
          : note
      );
      return updatedNotes.filter(note => note.tasks.length > 0);
    });
    setDeleteDialog({ isOpen: false, noteId: "", taskId: undefined });
  }, []);

  const updateTask = useCallback((noteId: string, taskId: string, updates: Partial<Task>) => {
    setNotes(prev =>
      prev.map(note => note.id === noteId
        ? {
            ...note,
            tasks: note.tasks.map(task => {
              if (task.id === taskId) {
                const updatedTask = { ...task, ...updates };
                
                if (updates.completed !== undefined) {
                  updatedTask.completedAt = updates.completed ? Date.now() : undefined;
                  notificationService.cancelTaskNotifications(task.id);
                  notificationService.updateTaskCompletion(task.id, updates.completed);
                  if (updates.completed && updatedTask.time && updatedTask.title) {
                    notificationService.scheduleTaskNotifications(updatedTask);
                  }
                }
                
                if (updates.time && updates.time !== task.time) {
                  notificationService.cancelTaskNotifications(task.id);
                  const [hours, minutes] = updates.time.split(':').map(Number);
                  if (!isNaN(hours) && !isNaN(minutes)) {
                    const now = new Date();
                    const timerEnd = new Date();
                    timerEnd.setHours(hours, minutes, 0, 0);
                    if (timerEnd <= now) timerEnd.setDate(timerEnd.getDate() + 1);
                    updatedTask.timerEndTime = timerEnd.getTime();
                    notificationService.registerTaskCompletionCallback(taskId, () => {
                      updateTask(noteId, taskId, { completed: true });
                    });
                  }
                  if (updatedTask.time && updatedTask.title && !updatedTask.completed) {
                    notificationService.scheduleTaskNotifications(updatedTask);
                  }
                } else if (updates.title && updates.title !== task.title && updatedTask.time && !updatedTask.completed) {
                  notificationService.scheduleTaskNotifications(updatedTask);
                }
                
                return updatedTask;
              }
              return task;
            })
          }
        : note
      )
    );
  }, []);

  const toggleNoteExpansion = useCallback((noteId: string) => {
    if (!isMobile) return;
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  }, [isMobile, expandedNoteId]);

  const handleShowAnalytics = useCallback(() => {
    setShowAnalytics(true);
  }, []);
  const handleShowSettings = useCallback(() => setShowSettings(true), []);
  const handleShowArchive = useCallback(() => setShowArchive(true), []);
  const handleShowNotificationSettings = useCallback(() => { setShowNotificationSettings(true); handleCloseMenu(); }, []);
  const handleCloseMenu = useCallback(() => setMenuOpen(false), []);

  const totalTasks = useMemo(() => 
    notes.reduce((sum, note) => sum + note.tasks.length, 0) + archivedTasks.length, 
    [notes, archivedTasks]
  );
  const completedTasks = useMemo(() => 
    notes.reduce((sum, note) => sum + note.tasks.filter(task => task.completed).length, 0) + 
    archivedTasks.filter(task => task.completed).length, 
    [notes, archivedTasks]
  );
  const archivedCompletedTasks = useMemo(() => 
    archivedTasks.filter(task => task.completed).length, 
    [archivedTasks]
  );

  if (showAnalytics) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <AnalyticsPage
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          archivedCompletedTasks={archivedCompletedTasks}
          onBack={() => setShowAnalytics(false)}
        />
      </Suspense>
    );
  }

  if (showSettings) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <SettingsPage
          onBack={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </Suspense>
    );
  }

  if (showArchive) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <ArchivePage
          archivedTasks={archivedTasks}
          onBack={() => setShowArchive(false)}
          onRestoreTask={(task) => {
            setArchivedTasks(prev => prev.filter(t => t.id !== task.id));
            const noteId = Date.now().toString();
            const restoredTask = { ...task, archived: false, completed: false, completedAt: undefined, time: "", timerEndTime: undefined };
            const newNote: Note = {
              id: noteId,
              tasks: [restoredTask],
              isExpanded: true,
            };
            setNotes(prev => [...prev, newNote]);
            if (restoredTask.time && restoredTask.title) {
              notificationService.scheduleTaskNotifications(restoredTask);
            }
          }}
          onDeleteTask={(taskId) => {
            setArchivedTasks(prev => prev.filter(t => t.id !== taskId));
          }}
        />
      </Suspense>
    );
  }

  if (showNotificationSettings) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <NotificationSettings onBack={() => setShowNotificationSettings(false)} />
      </Suspense>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen relative transition-all duration-300 text-slate-100 overflow-hidden">
        <motion.header
          className="fixed top-0 left-0 right-0 z-20 p-4 md:p-6 flex justify-between items-center backdrop-blur-md bg-black/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-500">AstroTrix</h1>
          </div>

          <div className="flex items-center space-x-4">
            {isMobile ? (
              <>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: menuOpen ? 360 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-emerald-400 hover:text-emerald-300 md:hidden"
                  >
                    <img src="/AstroTrix/sidebar.svg" alt="Sidebar Icon" className="h-6 w-6" />
                  </Button>
                </motion.div>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="fixed top-16 right-4 z-50 bg-black/90 backdrop-blur-md rounded-lg p-2 shadow-lg"
                    >
                      <div className="flex flex-col space-y-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShowNotificationSettings}
                              className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 justify-start"
                            >
                              <Bell className="h-5 w-5 mr-2" /> Notifications
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Notification Settings</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShowAnalytics}
                              className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 justify-start"
                            >
                              <BarChart3 className="h-5 w-5 mr-2" /> Analytics
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Analytics</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShowArchive}
                              className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 justify-start"
                            >
                              <Archive className="h-5 w-5 mr-2" /> Archive ({archivedTasks.length})
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Archive ({archivedTasks.length})</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShowSettings}
                              className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 justify-start"
                            >
                              <Settings className="h-5 w-5 mr-2" /> Settings
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Settings</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShowNotificationSettings}
                      className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Notification Settings</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShowAnalytics}
                      className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Analytics</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShowArchive}
                      className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Archive className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Archive ({archivedTasks.length})</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShowSettings}
                      className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Settings</p></TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </motion.header>

        <main className="relative z-10 pt-20 md:pt-24 pb-24 px-4 md:px-6 h-screen overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {notes.map((note, index) => (
                <motion.div key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {note.tasks.filter(task => !task.archived).map((task) => (
                    <TaskCard
                      key={task.id}
                      note={note}
                      task={task}
                      isMobile={isMobile}
                      expandedNoteId={expandedNoteId}
                      settings={settings}
                      onUpdateTask={updateTask}
                      onDeleteTask={(noteId, taskId) => setDeleteDialog({ isOpen: true, noteId, taskId })}
                      onToggleExpansion={toggleNoteExpansion}
                    />
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>

            {notes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🛸</div>
                <p className="text-lg text-medium-contrast">
                  No missions yet. Create your first alien-powered task!
                </p>
              </motion.div>
            )}
          </div>
        </main>

        <Button onClick={addNote}
          className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg z-50 glow-green
          bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold"
        >
          <Plus className="h-8 w-8" />
        </Button>

        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}>
          <AlertDialogContent className="card-enhanced">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" /> Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-medium-contrast">
                {deleteDialog.taskId
                  ? "Are you sure you want to delete this task?"
                  : "Are you sure you want to delete this note? This will also delete all tasks within it."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="btn-secondary bg-transparent hover:bg-current text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  if (deleteDialog.taskId) {
                    deleteTask(deleteDialog.noteId, deleteDialog.taskId);
                  } else {
                    deleteNote(deleteDialog.noteId);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}