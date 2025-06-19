// components/CallWindow.jsx - FIXED VERSION
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Minimize2, Maximize2, User 
} from 'lucide-react';
import { useCallStore } from '../store/useCallStore';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { useEffect, useRef } from 'react';

const CallWindow = () => {
  // 🔥 FIX: Call ALL hooks at the top, before any conditional logic
  const {
    currentCall,
    callStatus,
    showCallWindow,
    isMinimized,
    isMuted,
    isSpeakerOn,
    localStream,
    remoteStream,
    toggleMute,
    toggleSpeaker,
    minimizeCall,
    maximizeCall,
    getFormattedDuration
  } = useCallStore();
  
  const { endCall } = useVoiceCall();
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  
  // 🔥 FIX: All useEffect hooks at the top
  // Setup audio elements
  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.muted = true; // Prevent echo
    }
  }, [localStream]);
  
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(console.error);
    }
  }, [remoteStream]);
  
  // Handle speaker toggle
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.8;
    }
  }, [isSpeakerOn]);
  
  // 🔥 FIX: Debug logging (optional - can remove later)
console.log('🔥 CallWindow render:', { 
  showCallWindow, 
  currentCall: currentCall ? {
    callId: currentCall.callId,
    type: currentCall.type,
    otherUserInfo: currentCall.otherUserInfo?.fullName
  } : null,
  callStatus 
});
  
  // 🔥 FIX: Early returns AFTER all hooks
const shouldShow = showCallWindow && currentCall;
console.log('🔥 Should show CallWindow?', {
  showCallWindow: showCallWindow,
  hasCurrentCall: !!currentCall,
  currentCallType: currentCall?.type,
  shouldShow: shouldShow
});
  
  if (!shouldShow) {
    console.log('🔥 CallWindow not showing - returning audio only');
    return (
      <>
        <audio ref={localAudioRef} autoPlay muted playsInline style={{ display: 'none' }} />
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      </>
    );
  }
  
  const otherUser = currentCall.otherUserInfo;
  const callDuration = getFormattedDuration();
  
  // Minimized view
  if (isMinimized) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-[9998] bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-4 min-w-[280px]">
          <div className="flex items-center gap-3">
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-success">
              {otherUser?.profilePic ? (
                <img 
                  src={otherUser.profilePic} 
                  alt={otherUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-base-content/50" />
                </div>
              )}
            </div>
            
            {/* Call Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-base-content truncate">
                {otherUser?.fullName || 'Unknown'}
              </p>
              <p className="text-xs text-success">
                {callStatus === 'connected' ? callDuration : 'Connecting...'}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`btn btn-circle btn-sm ${isMuted ? 'btn-error' : 'btn-ghost'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <button
                onClick={maximizeCall}
                className="btn btn-circle btn-sm btn-ghost"
                title="Maximize"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={endCall}
                className="btn btn-circle btn-sm btn-error"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Audio elements */}
        <audio ref={localAudioRef} autoPlay muted playsInline />
        <audio ref={remoteAudioRef} autoPlay playsInline />
      </>
    );
  }
  
  // Full call window
  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-base-200 to-base-300 flex flex-col">
        
        {/* Header */}
        <div className="flex-none bg-base-100/80 backdrop-blur-sm border-b border-base-300 p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-base-content">Voice Call</p>
                <p className="text-xs text-base-content/70">
                  {callStatus === 'connected' ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            
            <button
              onClick={minimizeCall}
              className="btn btn-circle btn-sm btn-ghost"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Main Call Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          
          {/* User Avatar */}
          <div className="relative mb-8">
            {/* Pulsing animation when connected */}
            {callStatus === 'connected' && (
              <>
                <div className="absolute inset-0 rounded-full bg-success/20 animate-ping scale-110"></div>
                <div className="absolute inset-0 rounded-full bg-success/10 animate-ping scale-125 animation-delay-300"></div>
              </>
            )}
            
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-success shadow-2xl">
              {otherUser?.profilePic ? (
                <img 
                  src={otherUser.profilePic} 
                  alt={otherUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                  <User className="w-16 h-16 text-base-content/50" />
                </div>
              )}
            </div>
          </div>
          
          {/* User Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">
              {otherUser?.fullName || 'Unknown User'}
            </h2>
            <p className="text-base-content/70 text-lg">
              {callStatus === 'connected' ? (
                <span className="text-success font-medium">{callDuration}</span>
              ) : callStatus === 'connecting' ? (
                'Connecting...'
              ) : callStatus === 'ringing' ? (
                'Ringing...'
              ) : (
                'Voice Call'
              )}
            </p>
          </div>
          
          {/* Connection Status */}
          {callStatus !== 'connected' && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                <span className="text-sm text-base-content/70">
                  {callStatus === 'connecting' ? 'Establishing connection...' : 'Calling...'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex-none bg-base-100/80 backdrop-blur-sm border-t border-base-300 p-6">
          <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
            
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 ${
                isMuted 
                  ? 'bg-error hover:bg-error/90 text-white' 
                  : 'bg-base-200 hover:bg-base-300 text-base-content'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-20 h-20 bg-error hover:bg-error/90 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-white"
              title="End Call"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            
            {/* Speaker Button */}
            <button
              onClick={toggleSpeaker}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 ${
                isSpeakerOn 
                  ? 'bg-success hover:bg-success/90 text-white' 
                  : 'bg-base-200 hover:bg-base-300 text-base-content'
              }`}
              title={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
            {/* 🔥 TEMPORARY: Force Connect Button for Testing */}
{callStatus === 'connecting' && (
  <button
    onClick={() => {
      console.log('📞 Manual force connect clicked');
      const { setCallStatus } = useCallStore.getState();
      setCallStatus('connected');
      toast.success('Manually connected!');
    }}
    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-warning hover:bg-warning/90 text-white"
    title="Force Connect (Test)"
  >
    ⚡
  </button>
)}

          </div>
          
          {/* Quick Info */}
          <div className="text-center mt-4">
            <p className="text-xs text-base-content/50">
              {isMuted && "You're muted"} 
              {isMuted && isSpeakerOn && " • "}
              {isSpeakerOn && "Speaker is on"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Audio elements */}
      <audio ref={localAudioRef} autoPlay muted playsInline />
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </>
  );
};

export default CallWindow;