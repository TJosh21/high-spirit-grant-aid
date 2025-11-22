import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const OnboardingTour = () => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (user) {
      checkTourStatus();
    }
  }, [user]);

  const checkTourStatus = async () => {
    const tourCompleted = localStorage.getItem(`tour_completed_${user?.id}`);
    
    if (!tourCompleted) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => setRun(true), 1000);
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold font-display">Welcome to High Spirit! 🎉</h3>
          <p className="text-sm">Let's take a quick tour to help you get started with finding and applying for grants.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="home"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-bold">Your Home Dashboard</h4>
          <p className="text-sm">Here you'll see your personalized recommendations and application stats.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="grants"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-bold">Browse Grants</h4>
          <p className="text-sm">Explore all available funding opportunities with powerful filters and search.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="applications"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-bold">Track Applications</h4>
          <p className="text-sm">Monitor your progress on all grant applications in one place.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="notifications"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-bold">Stay Updated</h4>
          <p className="text-sm">Get real-time notifications about deadlines, new grants, and application updates.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="theme-toggle"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-bold">Customize Your Experience</h4>
          <p className="text-sm">Toggle between light and dark mode for your preferred viewing experience.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold font-display">You're All Set! 🚀</h3>
          <p className="text-sm">Start exploring grants and let our AI assistant help you secure funding for your business.</p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem(`tour_completed_${user?.id}`, 'true');
    }

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      stepIndex={stepIndex}
      steps={steps}
      showProgress
      showSkipButton
      disableOverlayClose
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          padding: '20px',
        },
        buttonNext: {
          borderRadius: '8px',
          padding: '8px 16px',
          backgroundColor: 'hsl(var(--primary))',
        },
        buttonBack: {
          borderRadius: '8px',
          padding: '8px 16px',
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        last: 'Finish',
        skip: 'Skip Tour',
        next: 'Next',
        back: 'Back',
      }}
    />
  );
};
