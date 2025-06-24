import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import '../styles/AnalyticsPage.css';

interface AnalyticsPageProps {
  totalTasks: number;
  completedTasks: number;
  archivedCompletedTasks: number;
  onBack: () => void;
}

const ALIEN_LEVELS = [
  {
    name: 'Ben (Human)',
    level: 0,
    range: [0, 0.1],
    color: '#D1D5DB',
    description: 'Starting the mission... ⏰',
    theme: {
      background: 'bg-gray-800/50',
      graphAnimation: 'transition-normal',
      energyEffect: 'pulse-omnitrix',
      transition: 'scale-up',
    },
    icon: '👤',
  },
  {
    name: 'XLR8',
    level: 1,
    range: [0.1, 0.2],
    color: '#38BDF8',
    description: 'Speeding through tasks... 💨',
    theme: {
      background: 'bg-blue-900/50',
      graphAnimation: 'transition-fast',
      energyEffect: 'speed-trails',
      transition: 'scale-up-fast',
    },
    icon: '🏃‍♂️',
  },
  {
    name: 'Heatblast',
    level: 2,
    range: [0.2, 0.3],
    color: '#F97316',
    description: 'Blazing productivity... 🔥',
    theme: {
      background: 'bg-orange-900/50',
      graphAnimation: 'transition-heat',
      energyEffect: 'flame-flickers',
      transition: 'scale-up-glow',
    },
    icon: '🌋',
  },
  {
    name: 'Four Arms',
    level: 3,
    range: [0.3, 0.4],
    color: '#991B1B',
    description: 'Smashing goals... 💪',
    theme: {
      background: 'bg-red-900/50',
      graphAnimation: 'transition-seismic',
      energyEffect: 'seismic-pulse',
      transition: 'scale-up-pulse',
    },
    icon: '💥',
  },
  {
    name: 'Diamondhead',
    level: 4,
    range: [0.4, 0.5],
    color: '#34D399',
    description: 'Crystallizing success... 💎',
    theme: {
      background: 'bg-green-900/50',
      graphAnimation: 'transition-refraction',
      energyEffect: 'crystal-glow',
      transition: 'scale-up-glow',
    },
    icon: '🔷',
  },
  {
    name: 'Big Chill',
    level: 5,
    range: [0.5, 0.6],
    color: '#22D3EE',
    description: 'Chilling at the top... ❄️',
    theme: {
      background: 'bg-teal-900/50',
      graphAnimation: 'transition-fade',
      energyEffect: 'mist-effect',
      transition: 'scale-up-fade',
    },
    icon: '🌬️',
  },
  {
    name: 'Humungousaur',
    level: 6,
    range: [0.6, 0.7],
    color: '#A16207',
    description: 'Growing stronger... 🦖',
    theme: {
      background: 'bg-amber-900/50',
      graphAnimation: 'transition-thump',
      energyEffect: 'ground-cracks',
      transition: 'scale-up-pulse',
    },
    icon: '🦕',
  },
  {
    name: 'Jetray',
    level: 7,
    range: [0.7, 0.8],
    color: '#F87171',
    description: 'Soaring to new heights... 🚀',
    theme: {
      background: 'bg-red-900/50',
      graphAnimation: 'transition-wave',
      energyEffect: 'wave-motion',
      transition: 'scale-up-fast',
    },
    icon: '🪐',
  },
  {
    name: 'Wildvine',
    level: 8,
    range: [0.8, 0.9],
    color: '#65A30D',
    description: 'Thriving with nature... 🌱',
    theme: {
      background: 'bg-green-900/50',
      graphAnimation: 'transition-bloom',
      energyEffect: 'vine-growth',
      transition: 'scale-up-glow',
    },
    icon: '🍃',
  },
  {
    name: 'Alien X',
    level: 9,
    range: [0.9, 1.0],
    color: '#A855F7',
    description: 'Ruling the cosmos... 🌌',
    theme: {
      background: 'bg-gradient-to-br from-black/70 via-purple-900/50 to-black/50',
      graphAnimation: 'transition-glitch',
      energyEffect: 'cosmic-pulse',
      transition: 'scale-up-glitch',
    },
    icon: '👾',
  },
];

const getAlienLevel = (completionRate: number) =>
  ALIEN_LEVELS.find((level) => completionRate >= level.range[0] && completionRate <= level.range[1]) || ALIEN_LEVELS[0];

const AnalyticsPage = ({ totalTasks, completedTasks, archivedCompletedTasks, onBack }: AnalyticsPageProps) => {
  const [localCompletedTasks, setLocalCompletedTasks] = useState(completedTasks || 0);
  const [localTotalTasks, setLocalTotalTasks] = useState(totalTasks || 0);
  const [localArchivedCompletedTasks, setLocalArchivedCompletedTasks] = useState(archivedCompletedTasks || 0);
  const [currentLevel, setCurrentLevel] = useState(getAlienLevel(0));
  const [, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Keep raw props synced to local state
    setLocalCompletedTasks(completedTasks || 0);
    setLocalTotalTasks(totalTasks || 0);
    setLocalArchivedCompletedTasks(archivedCompletedTasks || 0);

    // Only count active + archived completed once
    const totalEffectiveCompleted = localCompletedTasks; // Already excludes archived
    const completionRate =
      localTotalTasks > 0 ? totalEffectiveCompleted / localTotalTasks : 0;

    const newLevel = getAlienLevel(completionRate);
    if (newLevel.level !== currentLevel.level) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentLevel(newLevel);
        setIsTransitioning(false);
      }, 1000);
    } else {
      setCurrentLevel(newLevel);
    }
  }, [completedTasks, totalTasks, archivedCompletedTasks, currentLevel.level]);

  const activeCompletedTasks = useMemo(
    () => Math.max(0, localCompletedTasks),
    [localCompletedTasks]
  );

  const pieData = [
    {
      name: 'Completed (Active)',
      value: activeCompletedTasks,
      color: '#4ADE80',
    },
    {
      name: 'Completed (Archived)',
      value: localArchivedCompletedTasks,
      color: '#A855F7',
    },
    {
      name: 'Remaining',
      value:
        localTotalTasks - activeCompletedTasks >= 0
          ? localTotalTasks - activeCompletedTasks
          : 0,
      color: '#951b05',
    },
  ];

  // Calculate percentages
  const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);
  const percentages = pieData.map(entry => ({
    name: entry.name,
    value: totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) + '%': '0%',
  }));

  return (
    <div
      className={`min-h-screen text-slate-100 relative overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/50 scrollbar-track-gray-800/50 ${currentLevel.theme.background} backdrop-blur-none ${currentLevel.theme.energyEffect}`}
      style={{
        scrollbarColor: `${currentLevel.color} #1F2937`,
        scrollbarWidth: 'thin',
        willChange: 'transform', // Improve animation performance
      }}
    >
      <motion.div
        className="fixed top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-green-400 hover:bg-green-400/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </motion.div>

      <main className="container mx-auto px-4 py-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <AnimatePresence>
          <motion.div
            key={currentLevel.name}
            className="max-w-4xl mx-auto space-y-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }} // Slightly reduced duration
          >
            <div className="text-center mb-12">
              <motion.h1
                className="text-4xl font-bold mb-4 text-green-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Alien Power Analytics
              </motion.h1>
              <motion.p
                className="text-lg text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {currentLevel.description}
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              <Card className="bg-gray-800/70 border border-green-400/30 backdrop-blur-none">
                <CardHeader>
                  <CardTitle className="text-green-400">Current Form</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                  <AlienBadge level={currentLevel} />

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-green-400 flex items-center justify-center gap-2">
                      {currentLevel.icon} {currentLevel.name} <span className="text-sm text-gray-400">(Level {currentLevel.level})</span>
                    </h3>
                    <p className="text-sm text-gray-400">
                      Completed: {localCompletedTasks} / {localTotalTasks} (
                      {(currentLevel.range[0] * 100).toFixed(0)}%-{(currentLevel.range[1] * 100).toFixed(0)}%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/70 border border-green-400/30 backdrop-blur-none">
                <CardHeader>
                  <CardTitle className="text-green-400">Power Metrics</CardTitle>
                </CardHeader>
                <CardContent className={`space-y-6 ${currentLevel.theme.graphAnimation}`}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50} // Slightly reduced to give more label space
                          outerRadius={80}
                          paddingAngle={5} // Increased padding to separate segments
                          dataKey="value"
                          labelLine={false} // Remove label lines
                          label={false} // Remove labels (name and percentage)
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="vertical" 
                          verticalAlign="bottom" 
                          align="center" 
                          wrapperStyle={{ color: '#D1D5DB', paddingTop: '1rem' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-700/50">
                      <div className="text-3xl font-bold text-green-400">
                        {activeCompletedTasks}
                      </div>
                      <div className="text-sm text-gray-400">Completed (Active) <span className="text-xs text-green-300">({percentages[0].value})</span></div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-700/50">
                      <div className="text-3xl font-bold text-purple-400">
                        {localArchivedCompletedTasks}
                      </div>
                      <div className="text-sm text-gray-400">Completed (Archived) <span className="text-xs text-purple-300">({percentages[1].value})</span></div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-700/50">
                      <div className="text-3xl font-bold text-gray-500">
                        {localTotalTasks - activeCompletedTasks}
                      </div>
                      <div className="text-md text-gray-400">Remaining <span className="text-xs text-red-600">({percentages[2].value})</span></div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-700/50">
                      <div className="text-3xl font-bold text-green-400">
                        {localTotalTasks}
                      </div>
                      <div className="text-sm text-gray-400">Total Missions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AlienBadge = ({ level }: { level: typeof ALIEN_LEVELS[0] }) => {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ willChange: 'transform, opacity' }} // Optimize for GPU
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            `0 0 15px ${level.color}30`, // Reduced intensity
            `0 0 25px ${level.color}50`,
            `0 0 15px ${level.color}30`,
          ],
        }}
        transition={{
          duration: level.theme.transition === 'scale-up-fast' ? 0.3 : 0.4,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-green-900/50`}
        style={{
          background: `radial-gradient(circle, ${level.color}, ${level.color}70, ${level.color}30)`,
          willChange: 'transform', // Optimize animation
        }}
        animate={{
          scale: [1, 1.03, 1],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: level.theme.transition === 'scale-up-fast' ? 0.3 : 0.4,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.6, 0.9, 0.6],
            scale: [0.9, 1.05, 0.9],
          }}
          transition={{
            duration: level.theme.transition === 'scale-up-fast' ? 0.3 : 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          {level.name === 'Alien X' ? (
            // Optimized Alien X effect with fewer elements
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  top: `${50 + Math.cos(i * 90 * (Math.PI / 180)) * 40}%`,
                  left: `${50 + Math.sin(i * 90 * (Math.PI / 180)) * 40}%`,
                  boxShadow: '0 0 5px #fff, 0 0 10px #A855F7',
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: level.color,
                  top: `${50 + Math.cos(i * 90 * (Math.PI / 180)) * 40}%`,
                  left: `${50 + Math.sin(i * 90 * (Math.PI / 180)) * 40}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: level.theme.transition === 'scale-up-fast' ? 0.3 : 0.4,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;