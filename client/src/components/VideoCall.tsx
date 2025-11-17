import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  userName: string;
}

export default function VideoCall({ isOpen, onClose, roomUrl, userName }: VideoCallProps) {
  const { toast } = useToast();
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '8px',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    });

    callFrameRef.current = callFrame;

    callFrame.on('joined-meeting', () => {
      console.log('Joined video call');
      setIsJoined(true);
    });

    callFrame.on('left-meeting', () => {
      console.log('Left video call');
      setIsJoined(false);
      onClose();
    });

    callFrame.on('error', (error) => {
      console.error('Daily.co error:', error);
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
      toast({
        title: 'Connection Failed',
        description: 'Could not join the video call. Please check your connection.',
        variant: 'destructive',
      });
    });

    return () => {
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
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && leaveCall()}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Video Call</DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative" ref={containerRef} />
        
        {isJoined && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-sm p-3 rounded-full">
            <Button
              variant={isVideoOn ? 'default' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isAudioOn ? 'default' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleAudio}
            >
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={leaveCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
