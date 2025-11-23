import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceDictationProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceDictation({ onTranscript, className }: VoiceDictationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Voice recognition started');
          setIsListening(true);
        };

        recognition.onend = () => {
          console.log('Voice recognition ended');
          setIsListening(false);
          setInterimTranscript('');
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setInterimTranscript('');
          
          let errorMessage = 'An error occurred with voice recognition.';
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          } else if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try again.';
          } else if (event.error === 'network') {
            errorMessage = 'Network error. Please check your connection.';
          }
          
          toast({
            title: 'Voice Recognition Error',
            description: errorMessage,
            variant: 'destructive',
          });
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          if (interim) {
            setInterimTranscript(interim);
          }

          if (final) {
            onTranscript(final.trim());
            setInterimTranscript('');
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        toast({
          title: 'Voice Dictation Active',
          description: 'Speak now to add to your answer.',
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: 'Error',
          description: 'Could not start voice recognition.',
          variant: 'destructive',
        });
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MicOff className="h-5 w-5" />
          <p className="text-sm">
            Voice dictation is not supported in your browser. Try Chrome or Edge.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          onClick={toggleListening}
          className="flex-1"
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-5 w-5 animate-pulse" />
              Stop Dictating
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Start Dictating
            </>
          )}
        </Button>
      </div>

      {isListening && (
        <Card className="p-4 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-primary mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary mb-1">Listening...</p>
              {interimTranscript && (
                <p className="text-sm text-muted-foreground italic">
                  {interimTranscript}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {!isListening && (
        <p className="text-xs text-muted-foreground text-center">
          Click the microphone button to start speaking your response
        </p>
      )}
    </div>
  );
}