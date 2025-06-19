// components/CallWindow.jsx - FIXED VERSION
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Minimize2, Maximize2, User 
} from 'lucide-react';
import { useCallStore } from '../store/useCallStore';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { useEffect, useRef, useState } from 'react';

const AudioDebugger = () => {
  const [audioInfo, setAudioInfo] = useState({});
  
  useEffect(() => {
    const updateAudioInfo = () => {
      const info = {
        localStream: {
          exists: !!localStream,
          active: localStream?.active,
          audioTracks: localStream?.getAudioTracks().length || 0,
          trackEnabled: localStream?.getAudioTracks()[0]?.enabled,
          trackMuted: localStream?.getAudioTracks()[0]?.muted,
          trackReadyState: localStream?.getAudioTracks()[0]?.readyState,
        },
        remoteStream: {
          exists: !!remoteStream,
          active: remoteStream?.active,
          audioTracks: remoteStream?.getAudioTracks().length || 0,
          trackEnabled: remoteStream?.getAudioTracks()[0]?.enabled,
          trackMuted: remoteStream?.getAudioTracks()[0]?.muted,
          trackReadyState: remoteStream?.getAudioTracks()[0]?.readyState,
        },
        audioElements: {
          localAudioSrc: !!localAudioRef.current?.srcObject,
          remoteAudioSrc: !!remoteAudioRef.current?.srcObject,
          localMuted: localAudioRef.current?.muted,
          remoteMuted: remoteAudioRef.current?.muted,
          remoteVolume: remoteAudioRef.current?.volume,
          remoteAutoplay: remoteAudioRef.current?.autoplay,
        }
      };
      setAudioInfo(info);
    };
    
    // Update every second
    const interval = setInterval(updateAudioInfo, 1000);
    updateAudioInfo(); // Initial update
    
    return () => clearInterval(interval);
  }, [localStream, remoteStream]);
  
  return (
    <div className="fixed top-4 left-4 z-[10000] bg-black text-white p-3 text-xs max-w-sm max-h-96 overflow-y-auto">
      <h3 className="text-yellow-400 font-bold mb-2">🎤 Audio Debug</h3>
      
      <div className="mb-2">
        <h4 className="text-green-400">Local Stream:</h4>
        <div>Exists: {audioInfo.localStream?.exists ? '✅' : '❌'}</div>
        <div>Active: {audioInfo.localStream?.active ? '✅' : '❌'}</div>
        <div>Tracks: {audioInfo.localStream?.audioTracks}</div>
        <div>Enabled: {audioInfo.localStream?.trackEnabled ? '✅' : '❌'}</div>
        <div>State: {audioInfo.localStream?.trackReadyState}</div>
      </div>
      
      <div className="mb-2">
        <h4 className="text-blue-400">Remote Stream:</h4>
        <div>Exists: {audioInfo.remoteStream?.exists ? '✅' : '❌'}</div>
        <div>Active: {audioInfo.remoteStream?.active ? '✅' : '❌'}</div>
        <div>Tracks: {audioInfo.remoteStream?.audioTracks}</div>
        <div>Enabled: {audioInfo.remoteStream?.trackEnabled ? '✅' : '❌'}</div>
        <div>State: {audioInfo.remoteStream?.trackReadyState}</div>
      </div>
      
      <div className="mb-2">
        <h4 className="text-purple-400">Audio Elements:</h4>
        <div>Local Src: {audioInfo.audioElements?.localAudioSrc ? '✅' : '❌'}</div>
        <div>Remote Src: {audioInfo.audioElements?.remoteAudioSrc ? '✅' : '❌'}</div>
        <div>Local Muted: {audioInfo.audioElements?.localMuted ? '🔇' : '🔊'}</div>
        <div>Remote Muted: {audioInfo.audioElements?.remoteMuted ? '🔇' : '🔊'}</div>
        <div>Volume: {audioInfo.audioElements?.remoteVolume}</div>
      </div>
      
      <div className="space-y-1">
        <button 
          onClick={() => {
            if (remoteAudioRef.current) {
              remoteAudioRef.current.play().then(() => {
                console.log('✅ Remote audio play successful');
              }).catch(error => {
                console.error('❌ Remote audio play failed:', error);
              });
            }
          }}
          className="w-full bg-green-600 px-2 py-1 rounded"
        >
          Force Play Remote
        </button>
        
        <button 
          onClick={() => {
            // Test local microphone
            if (localStream) {
              const audioContext = new AudioContext();
              const source = audioContext.createMediaStreamSource(localStream);
              const analyser = audioContext.createAnalyser();
              source.connect(analyser);
              
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const checkLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const level = dataArray.reduce((a, b) => a + b) / dataArray.length;
                console.log('🎤 Mic level:', level);
              };
              
              setInterval(checkLevel, 100);
              setTimeout(() => console.log('🎤 Mic test complete'), 3000);
            }
          }}
          className="w-full bg-blue-600 px-2 py-1 rounded"
        >
          Test Microphone
        </button>
        
        <button 
          onClick={() => {
            // Generate test tone
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 1000);
            
            console.log('🔊 Test tone played');
          }}
          className="w-full bg-yellow-600 px-2 py-1 rounded"
        >
          Test Speakers
        </button>
        
<button 
  onClick={() => {
    console.log('🔧 Manual ICE restart triggered');
    const pc = useCallStore.getState().peerConnection;
    if (pc) {
      console.log('🔧 Current ICE connection state:', pc.iceConnectionState);
      console.log('🔧 Current ICE gathering state:', pc.iceGatheringState);
      
      try {
        pc.restartIce();
        console.log('🔧 ICE restart initiated');
      } catch (error) {
        console.error('🔧 ICE restart failed:', error);
      }
    }
  }}
  className="w-full bg-orange-600 px-2 py-1 rounded"
>
  🔧 Restart ICE
</button>
      </div>
    </div>
  );
};

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
  const [audioDebugInfo, setAudioDebugInfo] = useState({}); 
  // 🔥 FIX: All useEffect hooks at the top
  // Setup audio elements
// Setup local audio (keep muted to prevent feedback)
useEffect(() => {
  if (localAudioRef.current && localStream) {
    console.log('🎤 Setting up local audio element');
    localAudioRef.current.srcObject = localStream;
    localAudioRef.current.muted = true; // Always muted to prevent echo
    
    // But ensure the stream itself is not muted
    localStream.getAudioTracks().forEach(track => {
      track.enabled = true;
      console.log('🎤 Local track enabled:', track.enabled, track.readyState);
    });
  }
}, [localStream]);
  
// Setup remote audio (this is what you should hear)
// In CallWindow.jsx - UPDATE the remote audio useEffect:

useEffect(() => {
  if (remoteAudioRef.current && remoteStream) {
    console.log('🔊 Setting up remote audio element:', {
      streamId: remoteStream.id,
      streamActive: remoteStream.active,
      trackCount: remoteStream.getAudioTracks().length
    });
    
    remoteAudioRef.current.srcObject = remoteStream;
    remoteAudioRef.current.muted = false;
    remoteAudioRef.current.volume = 1.0;
    remoteAudioRef.current.autoplay = true;
    
    // 🔥 FIX: Add event listeners to the audio element
    const audioElement = remoteAudioRef.current;
    
    const onCanPlay = () => {
      console.log('🔊 Remote audio can play');
      audioElement.play().catch(error => {
        console.error('❌ Remote audio play failed:', error);
      });
    };
    
    const onPlay = () => {
      console.log('✅ Remote audio started playing');
    };
    
    const onError = (error) => {
      console.error('❌ Remote audio error:', error);
    };
    
    audioElement.addEventListener('canplay', onCanPlay);
    audioElement.addEventListener('play', onPlay);
    audioElement.addEventListener('error', onError);
    
    // Force play attempt
    audioElement.play().catch(error => {
      console.error('❌ Initial remote audio play failed:', error);
    });
    
    return () => {
      audioElement.removeEventListener('canplay', onCanPlay);
      audioElement.removeEventListener('play', onPlay);
      audioElement.removeEventListener('error', onError);
    };
  }
}, [remoteStream]);
  
  // Handle speaker toggle
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.8;
    }
  }, [isSpeakerOn]);

   useEffect(() => {
  const updateAudioDebugInfo = () => {
    const info = {
      localStream: {
        exists: !!localStream,
        active: localStream?.active,
        audioTracks: localStream?.getAudioTracks().length || 0,
        trackEnabled: localStream?.getAudioTracks()[0]?.enabled,
        trackMuted: localStream?.getAudioTracks()[0]?.muted,
        trackReadyState: localStream?.getAudioTracks()[0]?.readyState,
        trackId: localStream?.getAudioTracks()[0]?.id,
      },
      remoteStream: {
        exists: !!remoteStream,
        active: remoteStream?.active,
        audioTracks: remoteStream?.getAudioTracks().length || 0,
        trackEnabled: remoteStream?.getAudioTracks()[0]?.enabled,
        trackMuted: remoteStream?.getAudioTracks()[0]?.muted,
        trackReadyState: remoteStream?.getAudioTracks()[0]?.readyState,
        trackId: remoteStream?.getAudioTracks()[0]?.id,
      },
      audioElements: {
        localAudioSrc: !!localAudioRef.current?.srcObject,
        remoteAudioSrc: !!remoteAudioRef.current?.srcObject,
        localMuted: localAudioRef.current?.muted,
        remoteMuted: remoteAudioRef.current?.muted,
        remoteVolume: remoteAudioRef.current?.volume,
        remoteAutoplay: remoteAudioRef.current?.autoplay,
        remotePaused: remoteAudioRef.current?.paused,
      },
      peerConnection: {
        state: useCallStore.getState().peerConnection?.connectionState,
        iceState: useCallStore.getState().peerConnection?.iceConnectionState,
        signalingState: useCallStore.getState().peerConnection?.signalingState,
      }
    };
    setAudioDebugInfo(info);
  };
  
  if (callStatus === 'connected') {
    const interval = setInterval(updateAudioDebugInfo, 1000);
    updateAudioDebugInfo(); // Initial update
    return () => clearInterval(interval);
  }
}, [localStream, remoteStream, callStatus]);
  
  // 🔥 FIX: Debug logging (optional - can remove later)
// console.log('🔥 CallWindow render:', { 
//   showCallWindow, 
//   currentCall: currentCall ? {
//     callId: currentCall.callId,
//     type: currentCall.type,
//     otherUserInfo: currentCall.otherUserInfo?.fullName
//   } : null,
//   callStatus 
// });
  
  // 🔥 FIX: Early returns AFTER all hooks
const shouldShow = showCallWindow && currentCall;
    
  
  if (!shouldShow) {
    // console.log('🔥 CallWindow not showing - returning audio only');
    return (
      <>
        <audio ref={localAudioRef} autoPlay muted playsInline style={{ display: 'none' }} />
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      </>
    );
  }

 


  <AudioDebugger />
  
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

        // Add this component INSIDE your main return, right after the header section:
{callStatus === 'connected' && (
  <div className="fixed top-4 left-4 z-[10000] bg-black text-white p-3 text-xs max-w-sm max-h-96 overflow-y-auto">
    <h3 className="text-yellow-400 font-bold mb-2">🎤 Audio Debug</h3>
    
    <div className="mb-2">
      <h4 className="text-green-400">Local Stream:</h4>
      <div>Exists: {audioDebugInfo.localStream?.exists ? '✅' : '❌'}</div>
      <div>Active: {audioDebugInfo.localStream?.active ? '✅' : '❌'}</div>
      <div>Tracks: {audioDebugInfo.localStream?.audioTracks}</div>
      <div>Enabled: {audioDebugInfo.localStream?.trackEnabled ? '✅' : '❌'}</div>
      <div>State: {audioDebugInfo.localStream?.trackReadyState}</div>
    </div>
    
    <div className="mb-2">
      <h4 className="text-blue-400">Remote Stream:</h4>
      <div>Exists: {audioDebugInfo.remoteStream?.exists ? '✅' : '❌'}</div>
      <div>Active: {audioDebugInfo.remoteStream?.active ? '✅' : '❌'}</div>
      <div>Tracks: {audioDebugInfo.remoteStream?.audioTracks}</div>
      <div>Enabled: {audioDebugInfo.remoteStream?.trackEnabled ? '✅' : '❌'}</div>
      <div>State: {audioDebugInfo.remoteStream?.trackReadyState}</div>
    </div>
    
    <div className="mb-2">
      <h4 className="text-purple-400">Audio Elements:</h4>
      <div>Remote Src: {audioDebugInfo.audioElements?.remoteAudioSrc ? '✅' : '❌'}</div>
      <div>Remote Muted: {audioDebugInfo.audioElements?.remoteMuted ? '🔇' : '🔊'}</div>
      <div>Remote Paused: {audioDebugInfo.audioElements?.remotePaused ? '⏸️' : '▶️'}</div>
      <div>Volume: {audioDebugInfo.audioElements?.remoteVolume}</div>
    </div>
    
    <div className="mb-2">
      <h4 className="text-orange-400">Connection:</h4>
      <div>State: {audioDebugInfo.peerConnection?.state}</div>
      <div>ICE: {audioDebugInfo.peerConnection?.iceState}</div>
    </div>
    
    <div className="space-y-1">
      <button 
        onClick={async () => {
          try {
            console.log('🔊 Forcing remote audio play...');
            if (remoteAudioRef.current) {
              remoteAudioRef.current.volume = 1.0;
              remoteAudioRef.current.muted = false;
              await remoteAudioRef.current.play();
              console.log('✅ Remote audio play successful');
            }
          } catch (error) {
            console.error('❌ Remote audio play failed:', error);
          }
        }}
        className="w-full bg-green-600 px-2 py-1 rounded"
      >
        🔊 Force Play Remote
      </button>
      
      <button 
        onClick={() => {
          console.log('🎤 Testing microphone input...');
          if (localStream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(localStream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.fftSize = 256;
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let checkCount = 0;
            
            const checkLevel = () => {
              if (checkCount < 30) { // Check for 3 seconds
                analyser.getByteFrequencyData(dataArray);
                const level = dataArray.reduce((a, b) => a + b) / dataArray.length;
                console.log(`🎤 Mic level ${checkCount}: ${level.toFixed(2)}`);
                checkCount++;
                setTimeout(checkLevel, 100);
              } else {
                console.log('🎤 Microphone test complete');
              }
            };
            checkLevel();
          }
        }}
        className="w-full bg-blue-600 px-2 py-1 rounded"
      >
        🎤 Test Microphone
      </button>
      
      <button 
        onClick={() => {
          console.log('🔊 Playing test tone...');
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          
          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            console.log('🔊 Test tone complete');
          }, 1000);
        }}
        className="w-full bg-yellow-600 px-2 py-1 rounded"
      >
        🔊 Test Speakers
      </button>
      
      <button 
        onClick={() => {
          console.log('🔍 Detailed audio analysis:');
          console.log('Local Stream:', localStream);
          console.log('Remote Stream:', remoteStream);
          console.log('Local Audio Element:', localAudioRef.current);
          console.log('Remote Audio Element:', remoteAudioRef.current);
          
          if (localStream) {
            localStream.getAudioTracks().forEach((track, i) => {
              console.log(`Local Track ${i}:`, {
                id: track.id,
                kind: track.kind,
                enabled: track.enabled,
                muted: track.muted,
                readyState: track.readyState,
                settings: track.getSettings()
              });
            });
          }
          
          if (remoteStream) {
            remoteStream.getAudioTracks().forEach((track, i) => {
              console.log(`Remote Track ${i}:`, {
                id: track.id,
                kind: track.kind,
                enabled: track.enabled,
                muted: track.muted,
                readyState: track.readyState,
                settings: track.getSettings()
              });
            });
          }
          
          const pc = useCallStore.getState().peerConnection;
          if (pc) {
            console.log('Peer Connection Stats:', {
              connectionState: pc.connectionState,
              iceConnectionState: pc.iceConnectionState,
              signalingState: pc.signalingState,
              senders: pc.getSenders().length,
              receivers: pc.getReceivers().length
            });
            
            pc.getSenders().forEach((sender, i) => {
              console.log(`Sender ${i}:`, sender.track?.kind, sender.track?.enabled);
            });
            
            pc.getReceivers().forEach((receiver, i) => {
              console.log(`Receiver ${i}:`, receiver.track?.kind, receiver.track?.enabled);
            });
          }
        }}
        className="w-full bg-red-600 px-2 py-1 rounded"
      >
        🔍 Full Debug
      </button>
    </div>
  </div>
)}

        
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