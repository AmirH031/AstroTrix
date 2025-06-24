import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PWAInstallPromptProps {
  isDark: boolean;
}

export default function PWAInstallPrompt({ isDark }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 10000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
    } else {
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const getDeviceIcon = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-6 md:max-w-sm"
      >
        <Card className={`backdrop-blur-md ${
          isDark 
            ? 'bg-gray-800/90 border-green-400/30' 
            : 'bg-white/90 border-green-500/30'
        } shadow-2xl`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                isDark ? 'bg-green-400/20' : 'bg-green-500/20'
              }`}>
                {getDeviceIcon()}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  Install AstroTrix
                </h3>
                <p className={`text-sm mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Get the full alien-powered experience! Install AstroTrix for offline access and native performance.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    className={`flex-1 ${
                      isDark 
                        ? 'bg-green-500 hover:bg-green-600 text-black' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                  
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}