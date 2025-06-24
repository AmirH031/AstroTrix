import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface IntroPageProps {
  onStart: () => void;
  isDark: boolean;
}

export default function IntroPage({ onStart, isDark }: IntroPageProps) {
  const features = [
    {
      emoji: "✅",
      title: "Plan Your Day Easily",
      description: "Add daily tasks in just a few taps — simple and fast."
    },
    {
      emoji: "⏰",
      title: "Get Reminders That Feel Alive",
      description: "Cool Ben 10–style sounds remind you exactly when it’s time."
    },
    {
      emoji: "👽",
      title: "See Your Progress Like a Hero",
      description: "As you complete tasks, your level upgrades to powerful alien forms."
    },
    {
      emoji: "🔁",
      title: "Syncs Smoothly, Works Anytime",
      description: "Whether you’re online or not, your tasks stay updated and reliable."
    },
    {
      emoji: "🚀",
      title: "Designed to Feel Like an Adventure",
      description: "With animations, alien energy, and a cosmic interface — every task feels like a mission."
    }
  ];

  // Enable scroll only on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "hidden";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-transparent" : "bg-transparent"} text-white relative`}
    >
      <div className="absolute inset-0 z-0 bg-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Title */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 drop-shadow-[0_0_15px_rgba(0,255,0,0.6)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">
              AstroTrix
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl font-semibold text-green-400 mb-10 sm:mb-12 drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]"
            animate={{
              textShadow: [
                "0 0 5px rgba(0, 255, 0, 0.5)",
                "0 0 15px rgba(0, 255, 0, 0.9)",
                "0 0 5px rgba(0, 255, 0, 0.5)"
              ]
            }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
          >
            Smarter Tasks. Stronger You.
          </motion.p>

          {/* Divider */}
          <div className="w-1/2 mx-auto border-t border-green-500/30 mb-6 sm:mb-10" />

          {/* Feature Cards */}
          <motion.div
            className="grid gap-4 sm:gap-6 w-full max-w-4xl mx-auto grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {features.map((feature, index) => {
              const isLast = index === features.length - 1;
              const isOddLast = isLast && features.length % 3 === 1;

              return (
                <motion.div
                  key={index}
                  className={`relative group ${
                    isOddLast ? "lg:col-span-3 flex justify-center" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                >
                  <div className="relative bg-gray-900/50 border border-green-400/40 p-5 sm:p-6 rounded-full clip-path-omnitrix shadow-lg group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-300 backdrop-blur-sm">
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-green-400/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{feature.emoji}</div>
                    <h3 className="text-base sm:text-lg font-bold text-green-400 mb-1 sm:mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Start Button */}
          <motion.div
            className="mt-10 sm:mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 2.2 }}
          >
            <Button
              onClick={onStart}
              className="relative bg-green-500 hover:bg-green-600 text-black font-extrabold text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-110"
              style={{ boxShadow: "0 0 25px rgba(0, 255, 0, 0.7)" }}
            >
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 10px #000000",
                    "0 0 20px #00ff00",
                    "0 0 10px #000000"
                  ],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              >
                LAUNCH MISSION
              </motion.span>
              <div className="absolute inset-0 rounded-full bg-green-500/40 animate-pulse-omnitrix" />
              <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#00ff00" strokeWidth="1" />
                <path d="M50% 20% L50% 10% M50% 80% L50% 90% M20% 50% L10% 50% M80% 50% L90% 50%" stroke="#00ff00" strokeWidth="1" />
              </svg>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Extra CSS */}
      <style>{`
        .clip-path-omnitrix {
          clip-path: circle(50% at 50% 50%);
          background: radial-gradient(circle, rgba(0, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%);
        }
        .animate-pulse-omnitrix {
          animation: pulseOmnitrix 1.8s infinite;
        }
        @keyframes pulseOmnitrix {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
          100% { opacity: 0.3; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
