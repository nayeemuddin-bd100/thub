import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Ringing sound effect (using a simple oscillator-based tone)
const createRingingSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 440; // A4 note
  gainNode.gain.value = 0.3; // Volume
  
  return { oscillator, audioContext, gainNode };
};

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  userName: string;
  isRecipientOnline?: boolean;
  recipientName?: string;
}

export default function VideoCall({ isOpen, onClose, roomUrl, userName, isRecipientOnline = false, recipientName = 'User' }: VideoCallProps) {
  const { toast } = useToast();
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const ringingRef = useRef<{ oscillator: OscillatorNode; audioContext: AudioContext; gainNode: GainNode } | null>(null);
  const ringingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current || !roomUrl) return;

    console.log('Initializing video call with room:', roomUrl);
    setIsConnecting(true);

    // Start ringing sound with pattern: ring for 2s, pause 1s, repeat
    const playRingingPattern = () => {
      try {
        const sound = createRingingSound();
        ringingRef.current = sound;
        
        // Ring pattern: beep-beep-pause
        const playBeep = () => {
          if (sound.oscillator && sound.audioContext.state === 'running') {
            sound.gainNode.gain.setValueAtTime(0.3, sound.audioContext.currentTime);
            sound.gainNode.gain.setValueAtTime(0, sound.audioContext.currentTime + 0.3);
          }
        };

        sound.oscillator.start();
        playBeep();
        
        // Play beep-beep pattern every 2 seconds
        ringingIntervalRef.current = setInterval(() => {
          playBeep();
          setTimeout(() => playBeep(), 400);
        }, 2000);
      } catch (error) {
        console.error('Failed to play ringing sound:', error);
      }
    };

    playRingingPattern();

    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    });

    callFrameRef.current = callFrame;

    callFrame.on('joined-meeting', () => {
      console.log('Joined video call successfully');
      setIsJoined(true);
      setIsConnecting(false);
      
      // Stop ringing sound when call connects
      if (ringingRef.current) {
        ringingRef.current.oscillator.stop();
        ringingRef.current.audioContext.close();
        ringingRef.current = null;
      }
      if (ringingIntervalRef.current) {
        clearInterval(ringingIntervalRef.current);
        ringingIntervalRef.current = null;
      }
    });

    callFrame.on('left-meeting', () => {
      console.log('Left video call');
      setIsJoined(false);
      onClose();
    });

    callFrame.on('error', (error: any) => {
      console.error('Daily.co error:', error);
      setIsConnecting(false);
      
      // Stop ringing on error
      if (ringingRef.current) {
        ringingRef.current.oscillator.stop();
        ringingRef.current.audioContext.close();
        ringingRef.current = null;
      }
      if (ringingIntervalRef.current) {
        clearInterval(ringingIntervalRef.current);
        ringingIntervalRef.current = null;
      }
      
      toast({
        title: 'Video Call Error',
        description: 'Failed to connect to video call. Please try again.',
        variant: 'destructive',
      });
    });

    callFrame.join({ 
      url: roomUrl,
      userName: userName,
    }).catch((error: Error) => {
      console.error('Failed to join call:', error);
      setIsConnecting(false);
      toast({
        title: 'Connection Failed',
        description: 'Could not join the video call. Please check your connection.',
        variant: 'destructive',
      });
    });

    return () => {
      // Cleanup: stop ringing sound
      if (ringingRef.current) {
        try {
          ringingRef.current.oscillator.stop();
          ringingRef.current.audioContext.close();
        } catch (error) {
          console.error('Error stopping ringing:', error);
        }
        ringingRef.current = null;
      }
      if (ringingIntervalRef.current) {
        clearInterval(ringingIntervalRef.current);
        ringingIntervalRef.current = null;
      }
      
      if (callFrame) {
        callFrame.destroy();
        callFrameRef.current = null;
      }
    };
  }, [isOpen, roomUrl, userName, onClose, toast]);

  const toggleVideo = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.setLocalAudio(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  const leaveCall = async () => {
    // Stop ringing sound when leaving
    if (ringingRef.current) {
      try {
        ringingRef.current.oscillator.stop();
        ringingRef.current.audioContext.close();
      } catch (error) {
        console.error('Error stopping ringing:', error);
      }
      ringingRef.current = null;
    }
    if (ringingIntervalRef.current) {
      clearInterval(ringingIntervalRef.current);
      ringingIntervalRef.current = null;
    }
    
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && leaveCall()}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20">
        {/* Video Container */}
        <div className="w-full h-full relative">
          <div 
            ref={containerRef} 
            className="w-full h-full"
          />
          
          {/* Calling/Ringing Overlay */}
          {isConnecting && !isJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                    <Phone className="w-16 h-16 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-white/30 animate-ping" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">
                    {isRecipientOnline ? 'Calling...' : 'Calling'}
                  </h2>
                  <p className="text-white/80 text-lg">{recipientName}</p>
                  {!isRecipientOnline && (
                    <p className="text-white/60 text-sm mt-2">User appears offline</p>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full h-16 w-16"
                    onClick={leaveCall}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Controls - Only show when joined */}
          {isJoined && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/70 backdrop-blur-md p-4 rounded-full shadow-lg">
              <Button
                variant={isVideoOn ? 'default' : 'destructive'}
                size="icon"
                className="rounded-full h-14 w-14"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant={isAudioOn ? 'default' : 'destructive'}
                size="icon"
                className="rounded-full h-14 w-14"
                onClick={toggleAudio}
              >
                {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-14 w-14"
                onClick={leaveCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
