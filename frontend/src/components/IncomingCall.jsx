// components/IncomingCall.jsx
import { Phone, PhoneOff, User } from 'lucide-react';
import { useCallStore } from '../store/useCallStore';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { useEffect, useState } from 'react';

const IncomingCall = () => {
  const { incomingCall, showIncomingCall } = useCallStore();
  const { acceptCall, declineCall } = useVoiceCall();
  const [ringTone, setRingTone] = useState(null);
  
  // Handle ringtone
  useEffect(() => {
    if (showIncomingCall && incomingCall) {
      // Create a simple ringtone using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const playRingtone = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
      };
      
      // Play ringtone every 2 seconds
      const interval = setInterval(playRingtone, 2000);
      playRingtone(); // Play immediately
      
      setRingTone(interval);
      
      return () => {
        clearInterval(interval);
        audioContext.close();
      };
    }
  }, [showIncomingCall, incomingCall]);
  
  // Auto-decline after 30 seconds
  useEffect(() => {
    if (showIncomingCall && incomingCall) {
      const timeout = setTimeout(() => {
        declineCall('Call timeout');
      }, 30000);
      
      return () => clearTimeout(timeout);
    }
  }, [showIncomingCall, incomingCall, declineCall]);
  
  if (!showIncomingCall || !incomingCall) return null;
  
  const callerName = incomingCall.fromUserInfo?.fullName || 'Unknown Caller';
  const callerAvatar = incomingCall.fromUserInfo?.profilePic;
  
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl p-8 w-full max-w-md mx-auto shadow-2xl border border-base-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-base-content/70 text-sm font-medium mb-2">
            Incoming Voice Call
          </p>
          <div className="relative inline-block mb-4">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-success/30 animate-ping animation-delay-150"></div>
            
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-success shadow-lg">
              {callerAvatar ? (
                <img 
                  src={callerAvatar} 
                  alt={callerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                  <User className="w-10 h-10 text-base-content/50" />
                </div>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-base-content mb-1">
            {callerName}
          </h2>
          <p className="text-base-content/70 text-sm">
            Voice Call
          </p>
        </div>
        
        {/* Call Duration (placeholder for ringing) */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-base-content/70">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Ringing...</span>
          </div>
        </div>
        
        {/* Action Buttons */}
<div className="flex items-center justify-center gap-8">
  
  {/* Decline Button */}
  <button
    onClick={() => declineCall()}
    className="relative group"
  >
    <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group-hover:bg-error/90 group-active:scale-95">
      <PhoneOff className="w-8 h-8 text-white" />
    </div>
    <p className="text-xs text-base-content/70 mt-2 text-center">Decline</p>
  </button>
  
  {/* Accept Button */}
  <button
    onClick={acceptCall}
    className="relative group"
  >
    <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group-hover:bg-success/90 group-active:scale-95">
      <Phone className="w-8 h-8 text-white" />
    </div>
    <p className="text-xs text-base-content/70 mt-2 text-center">Accept</p>
  </button>
</div>

        
        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => declineCall('Busy')}
            className="text-xs text-base-content/50 hover:text-base-content/70 transition-colors"
          >
            I'm busy right now
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default IncomingCall;