import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from "lucide-react";

interface VideoGalleryProps {
  videos: string[];
  title: string;
}

export default function VideoGallery({ videos, title }: VideoGalleryProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock video data if no videos provided
  const mockVideos = [
    "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
  ];

  const displayVideos = videos.length > 0 ? videos : mockVideos;

  const handleVideoSelect = (index: number) => {
    setSelectedVideoIndex(index);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (displayVideos.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground" data-testid="text-video-gallery-title">
          Video Tour
        </h2>
        <span className="text-sm text-muted-foreground" data-testid="text-video-count">
          {displayVideos.length} videos
        </span>
      </div>

      <div className="space-y-4">
        {/* Main Video Player */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
          <video
            key={selectedVideoIndex}
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675"
            muted={isMuted}
            autoPlay={isPlaying}
            data-testid="video-player"
          >
            <source src={displayVideos[selectedVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="icon"
                onClick={togglePlayPause}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleMute}
                data-testid="button-mute"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    data-testid="button-fullscreen"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
                  <div className="relative w-full h-full bg-black">
                    <video
                      key={`fullscreen-${selectedVideoIndex}`}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay={isPlaying}
                      muted={isMuted}
                      data-testid="video-player-fullscreen"
                    >
                      <source src={displayVideos[selectedVideoIndex]} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Video Info Overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="font-semibold" data-testid="text-video-title">
              {title} - Video {selectedVideoIndex + 1}
            </h3>
            <p className="text-sm opacity-80" data-testid="text-video-description">
              {selectedVideoIndex === 0 && "Property Overview & Exterior"}
              {selectedVideoIndex === 1 && "Interior Rooms & Amenities"}
              {selectedVideoIndex === 2 && "Surrounding Area & Activities"}
            </p>
          </div>
        </div>

        {/* Video Thumbnails */}
        {displayVideos.length > 1 && (
          <div className="grid grid-cols-3 gap-3">
            {displayVideos.map((video, index) => (
              <div
                key={index}
                className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedVideoIndex === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                }`}
                onClick={() => handleVideoSelect(index)}
                data-testid={`video-thumbnail-${index}`}
              >
                <video
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                >
                  <source src={video} type="video/mp4" />
                </video>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-black ml-0.5" />
                  </div>
                </div>

                {/* Video Number */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Descriptions */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground" data-testid="text-current-video-title">
            Video {selectedVideoIndex + 1}: {
              selectedVideoIndex === 0 ? "Property Overview & Exterior" :
              selectedVideoIndex === 1 ? "Interior Rooms & Amenities" :
              "Surrounding Area & Activities"
            }
          </h4>
          <p className="text-sm text-muted-foreground" data-testid="text-current-video-description">
            {selectedVideoIndex === 0 && "Get a comprehensive view of the property's exterior, landscaping, and architectural features."}
            {selectedVideoIndex === 1 && "Explore the beautifully designed interior spaces, premium furnishings, and luxury amenities."}
            {selectedVideoIndex === 2 && "Discover the local area, nearby attractions, and available activities for guests."}
          </p>
        </div>
      </div>
    </Card>
  );
}
