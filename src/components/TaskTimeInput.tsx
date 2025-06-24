import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TaskTimeInputProps {
  time: string;
  repeat: "once" | "custom" | "weekly";
  customDays: string[];
  weeklyEnabled?: boolean;
  onTimeChange: (time: string) => void;
  onRepeatChange: (repeat: "once" | "custom" | "weekly") => void;
  onCustomDaysChange: (days: string[]) => void;
}

// Convert 24-hour to 12-hour format with AM/PM

export default function TaskTimeInput({
  time,
  repeat,
  customDays,
  weeklyEnabled = true,
  onTimeChange,
  onRepeatChange,
  onCustomDaysChange
}: TaskTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const weekdays = [
    { label: "S", value: "sun", name: "Sunday" },
    { label: "M", value: "mon", name: "Monday" },
    { label: "T", value: "tue", name: "Tuesday" },
    { label: "W", value: "wed", name: "Wednesday" },
    { label: "T", value: "thu", name: "Thursday" },
    { label: "F", value: "fri", name: "Friday" },
    { label: "S", value: "sat", name: "Saturday" }
  ];

  const toggleDay = (day: string) => {
    if (customDays.includes(day)) {
      onCustomDaysChange(customDays.filter(d => d !== day));
    } else {
      onCustomDaysChange([...customDays, day]);
    }
  };

  const setWeeklyDefaults = () => {
    onCustomDaysChange(['mon', 'tue', 'wed', 'thu', 'fri']);
  };

  const handleRepeatChange = (newRepeat: "once" | "custom" | "weekly") => {
    onRepeatChange(newRepeat);
    if (newRepeat === "weekly") {
      setWeeklyDefaults();
    } else if (newRepeat === "once") {
      onCustomDaysChange([]);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 p-0 text-green-400 hover:text-green-300 ${time ? 'bg-green-400/10' : ''}`}
        >
          <Clock className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-gray-800 border-green-400/30 text-white"
        style={{
          boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)"
        }}
      >
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-green-400">
            Set Time & Schedule
          </h4>
          
          <div className="flex space-x-2">
            <Input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="bg-gray-700/50 border-green-400/30 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-400">
              Repeat Schedule
            </h4>
            
            <RadioGroup 
              value={repeat} 
              onValueChange={handleRepeatChange}
              className="space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="once" 
                  id="once"
                  className="border-green-400 text-green-400"
                />
                <Label htmlFor="once" className="text-gray-300">
                  One-time only
                </Label>
              </div>
              
              {weeklyEnabled && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="weekly" 
                    id="weekly"
                    className="border-green-400 text-green-400"
                  />
                  <Label htmlFor="weekly" className="text-gray-300">
                    Weekly (Workdays)
                  </Label>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="custom" 
                  id="custom"
                  className="border-green-400 text-green-400"
                />
                <Label htmlFor="custom" className="text-gray-300">
                  Custom days
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {(repeat === "custom" || repeat === "weekly") && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-400">
                Select Days
              </h4>
              
              <div className="flex justify-between">
                {weekdays.map((day) => (
                  <motion.button
                    key={day.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDay(day.value)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      customDays.includes(day.value)
                        ? 'bg-green-400 text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={day.name}
                  >
                    {day.label}
                  </motion.button>
                ))}
              </div>
              
              {repeat === "weekly" && (
                <div className="text-xs text-center">
                  <span className="text-gray-400">
                    Weekly tasks repeat every week on selected days
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}