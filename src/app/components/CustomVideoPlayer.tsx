"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface CustomVideoPlayerProps {
  url: string;
  onReady: () => void;
  onEnded: () => void;
  onPlay: () => void;
  style?: React.CSSProperties; 
  playing?: boolean;
  controls?: boolean;
  width?: string;
  height?: string;
  hideDownload?: boolean;
  poster?: string;
  resume?: boolean;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ 
  url, 
  onReady, 
  onEnded, 
  onPlay, 
  style, 
  playing = true,
  controls = true,
  hideDownload = true,
  poster,
  resume = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Reset states when URL changes
  useEffect(() => {
    setLoading(!!(url && url.trim()));
    setError(null);
    setHasPlayed(false);
  }, [url]);

  // Handle play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayPause = async () => {
      try {
        if (playing && video.paused) {
          await video.play();
        } else if (!playing && !video.paused) {
          video.pause();
        }
      } catch (error) {
        console.warn("Playback error:", error);
        setError("Playback failed. Please interact with the page first.");
      }
    };

    handlePlayPause();
  }, [playing, url]);

  // Event Handlers
  const handleCanPlay = () => {
    setLoading(false);
    setError(null);
    onReady();
  };

  const handlePlay = () => {
    setHasPlayed(true);
    setError(null);
    onPlay();
  };

  const handleEnded = () => {
    onEnded();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setLoading(false);
    const video = e.target as HTMLVideoElement;
    
    switch (video.error?.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        setError('Video playback was aborted.');
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        setError('Network error. Please check your connection.');
        break;
      case MediaError.MEDIA_ERR_DECODE:
        setError('Video format not supported.');
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        setError('Video format not supported or URL is incorrect.');
        break;
      default:
        setError('Failed to load video. Please check the URL.');
    }
    
    console.error('Video error:', video.error);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    return false;
  };

  // Retry loading the video
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div style={{ position: 'relative', paddingTop: '56.25%', ...style }}>
      {url && url.trim() ? (
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          controls={controls}
          controlsList={hideDownload ? "nodownload noremoteplayback noplaybackrate" : "noremoteplayback"}
          disablePictureInPicture={hideDownload}
          autoPlay={playing}
          muted={playing}
          playsInline
          onCanPlay={handleCanPlay}
          onPlay={handlePlay}
          onEnded={handleEnded}
          onError={handleError}
          onContextMenu={handleContextMenu}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            backgroundColor: '#000',
            display: error ? 'none' : 'block',
          }}
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      ) : null}

      {!error && !loading && !!(url && url.trim()) && !hasPlayed && !playing && poster && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9,
          }}
        >
          <button
            onClick={() => {
              setHasPlayed(true);
              setError(null);
              const v = videoRef.current;
              if (v) v.play().catch(() => {});
              onPlay();
            }}
            className="custom-btn d-flex align-items-center gap-2"
            style={{ padding: '10px 18px' }}
          >
            {resume ? <RotateCcw size={18} /> : <Play size={18} />}
            {resume ? 'Resume' : 'Play'}
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !error && !!(url && url.trim()) && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            backgroundColor: '#333',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            zIndex: 10,
          }}
        >
          <div className="text-center">
            <div className="spinner-border text-light mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading Video...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            backgroundColor: '#333',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            zIndex: 10,
          }}
        >
          <div className="text-center">
            <p className="text-warning mb-2">{error}</p>
            <button 
              onClick={handleRetry}
              className="custom-btn"
            >
              Retry
            </button>
            <p className="small mt-2 text-muted">
              If the problem persists, check:
              <br />
              • Video URL is correct and accessible
              <br />
              • CORS headers are properly set
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
