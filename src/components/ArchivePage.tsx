import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  Trash2,
  Search,
  Calendar,
  Clock,
  Archive as ArchiveIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface Task {
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

interface ArchivePageProps {
  archivedTasks: Task[];
  onBack: () => void;
  onRestoreTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function ArchivePage({
  archivedTasks,
  onBack,
  onRestoreTask,
  onDeleteTask,
}: ArchivePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, taskId: "" });
  const [clearAllDialog, setClearAllDialog] = useState(false);

  const filteredTasks = archivedTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTasks = filteredTasks.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString();

  const getRepeatText = (repeat: string, customDays: string[]) => {
    if (repeat === "once") return "One-time";
    if (repeat === "weekly") return "Weekly";
    if (repeat === "custom") return `Custom (${customDays.length} days)`;
    return repeat;
  };

  const handleClearAll = () => {
    setClearAllDialog(true);
  };

  const confirmClearAll = () => {
    archivedTasks.forEach(task => onDeleteTask(task.id));
    setClearAllDialog(false);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-transparent text-white relative">
      <video autoPlay muted loop className="fixed inset-0 w-full h-full object-cover -z-20">
        <source src="/AstroTrix/Background.webm" type="video/webm" />
      </video>
      <div className="fixed inset-0 bg-transparent -z-10" />

      <motion.header
        className="fixed top-0 left-0 right-0 z-30 p-4 flex items-center gap-4 bg-black/30 backdrop-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="ghost" size="icon" onClick={onBack} className="text-green-400 hover:text-green-300">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <ArchiveIcon className="h-6 w-6 text-green-400" />
          <h1 className="text-2xl font-bold text-green-400">Archive ({archivedTasks.length})</h1>
        </div>
        {archivedTasks.length > 0 && (
          <Button variant="ghost" size="icon" onClick={handleClearAll} className="ml-auto text-red-400 hover:text-red-300">
            <Trash2 className="h-6 w-6" />
          </Button>
        )}
      </motion.header>

      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-6">
        <Card className="bg-transparent border border-green-400/30 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search archived tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {sortedTasks.length === 0 ? (
          <div className="text-center mt-20 text-gray-400">
            <ArchiveIcon className="h-12 w-12 mx-auto mb-4" />
            <p>{searchQuery ? "No archived tasks match your search" : "No archived tasks yet."}</p>
            {searchQuery && (
              <Button variant="ghost" onClick={() => setSearchQuery("")} className="mt-2 text-green-400 hover:text-green-300">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-transparent border border-green-400/20 backdrop-blur-md transition hover:shadow-lg">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <div className="text-sm text-gray-400 flex flex-wrap gap-4">
                          <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-green-400" /> {task.time}</div>
                          <div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-green-400" /> {getRepeatText(task.repeat, task.customDays)}</div>
                        </div>
                        {task.completedAt && (
                          <div className="text-xs text-gray-500">Completed: {formatDate(task.completedAt)}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onRestoreTask({ ...task, time: "", timerEndTime: undefined })} className="text-green-400 hover:text-green-300">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ isOpen: true, taskId: task.id })} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="bg-gray-800 border border-green-400/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to permanently delete this task? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                onDeleteTask(deleteDialog.taskId);
                setDeleteDialog({ isOpen: false, taskId: "" });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllDialog} onOpenChange={setClearAllDialog}>
        <AlertDialogContent className="bg-gray-800 border border-green-400/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Clear All Archives
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to permanently delete all archived tasks? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmClearAll}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}