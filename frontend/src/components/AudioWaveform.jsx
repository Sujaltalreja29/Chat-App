import { useEffect, useRef } from 'react';

const AudioWaveform = ({ 
  data = [], 
  isRecording = false, 
  progress = 0, 
  height = 40, 
  className = "",
  color = "currentColor",
  activeColor = "#3b82f6"
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Draw waveform
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height: canvasHeight } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);
    
    if (data.length === 0) {
      // Draw empty state
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight / 2);
      ctx.lineTo(width, canvasHeight / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }
    
    const barWidth = width / data.length;
    const maxBarHeight = canvasHeight - 4;
    
    data.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = Math.max(2, amplitude * maxBarHeight);
      const y = (canvasHeight - barHeight) / 2;
      
      // Determine color based on progress
      const isActive = progress > 0 && (index / data.length) <= progress;
      ctx.fillStyle = isActive ? activeColor : color;
      
      // Draw bar with rounded edges
      ctx.beginPath();
      ctx.roundRect = ctx.roundRect || function(x, y, w, h, r = 1) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
      };
      
      ctx.roundRect(x + 1, y, Math.max(1, barWidth - 2), barHeight, 1);
      ctx.fill();
    });
  };
  
  // Animation for recording
  const animateRecording = () => {
    if (!isRecording) return;
    
    drawWaveform();
    animationRef.current = requestAnimationFrame(animateRecording);
  };
  
  // Update canvas size
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  };
  
  // Initialize canvas
  useEffect(() => {
    updateCanvasSize();
    
    const handleResize = () => {
      updateCanvasSize();
      drawWaveform();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update waveform when data changes
  useEffect(() => {
    if (isRecording) {
      animateRecording();
    } else {
      drawWaveform();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, isRecording, progress]);
  
  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
      
      {/* Progress indicator */}
      {!isRecording && progress > 0 && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 transition-all duration-100"
          style={{ left: `${progress * 100}%` }}
        />
      )}
    </div>
  );
};

export default AudioWaveform;