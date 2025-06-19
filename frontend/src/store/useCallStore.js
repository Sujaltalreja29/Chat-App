// store/useCallStore.js
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useCallStore = create((set, get) => ({
  // Call state
  currentCall: null,
  callStatus: 'idle', // 'idle', 'initiating', 'ringing', 'connecting', 'connected', 'ended'
  incomingCall: null,
  callType: 'voice', // 'voice', 'video' (for future)
  
  // Call participants
  localStream: null,
  remoteStream: null,
  
  // Call controls
  isMuted: false,
  isSpeakerOn: false,
  
  // Call metrics
  callDuration: 0,
  callStartTime: null,
  
  // UI state
  showIncomingCall: false,
  showCallWindow: false,
  isMinimized: false,
  
  // WebRTC connection
  peerConnection: null,
  
  // Actions
setCurrentCall: (call) => {
  console.log('📞 STORE: setCurrentCall called with:', call ? {
    callId: call.callId,
    type: call.type,
    otherUser: call.otherUserInfo?.fullName
  } : null);
  
  set({ currentCall: call });
  
  // 🔥 FIX: Force a state update to trigger re-renders
  setTimeout(() => {
    const currentState = get();
    console.log('📞 STORE: Current state after setCurrentCall:', {
      hasCurrentCall: !!currentState.currentCall,
      callStatus: currentState.callStatus,
      showCallWindow: currentState.showCallWindow
    });
  }, 100);
},
  
setCallStatus: (status) => {
  console.log(`📞 Call status changed to: ${status}`);
  
  const currentState = get();
  console.log('📞 Current state before update:', {
    currentCallStatus: currentState.callStatus,
    showCallWindow: currentState.showCallWindow,
    currentCall: !!currentState.currentCall,
    callType: currentState.currentCall?.type
  });
  
  set({ callStatus: status });
  
  // Handle status-specific logic
  if (status === 'ringing') {
    const { currentCall } = get();
    if (currentCall && currentCall.type === 'outgoing') {
      console.log('🔥 DEBUG: Showing call window for outgoing call');
      set({ 
        showCallWindow: true,
        showIncomingCall: false 
      });
    }
  } else if (status === 'connecting') {
    console.log('🔥 DEBUG: Showing call window for connecting call');
    set({ 
      showCallWindow: true,
      showIncomingCall: false 
    });
  } else if (status === 'connected') {
    // 🔥 FIX: Start timer for BOTH incoming and outgoing calls
    const { currentCall } = get();
    console.log('🔥 DEBUG: Call connected - starting timer for', currentCall?.type, 'call');
    
    set({ 
      callStartTime: Date.now(),
      showCallWindow: true,
      showIncomingCall: false
    });
    get().startCallTimer();
  } else if (status === 'ended') {
    get().resetCallState();
  }
  
  const newState = get();
  console.log('📞 State after update:', {
    callStatus: newState.callStatus,
    showCallWindow: newState.showCallWindow,
    currentCall: !!newState.currentCall
  });
},

  
  setIncomingCall: (call) => {
    console.log('📞 Incoming call received:', call);
    set({ 
      incomingCall: call,
      showIncomingCall: !!call,
      callStatus: call ? 'ringing' : 'idle'
    });
  },
  
  setLocalStream: (stream) => {
    set({ localStream: stream });
  },
  
  setRemoteStream: (stream) => {
    set({ remoteStream: stream });
  },
  
  setPeerConnection: (pc) => {
    set({ peerConnection: pc });
  },
  
  // Call controls
  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted; // Toggle
        set({ isMuted: !isMuted });
        
        // Emit status to other participant
        const { currentCall } = get();
        const { socket } = useAuthStore.getState();
        if (socket && currentCall) {
          socket.emit('call:status-update', {
            to: currentCall.otherUserId,
            callId: currentCall.callId,
            status: { type: 'mute', isMuted: !isMuted }
          });
        }
      }
    }
  },
  
  toggleSpeaker: () => {
    set({ isSpeakerOn: !get().isSpeakerOn });
    // Note: Speaker toggle is handled in the UI component
  },
  
  minimizeCall: () => {
    set({ isMinimized: true });
  },
  
  maximizeCall: () => {
    set({ isMinimized: false });
  },
  
  // Call timer
  startCallTimer: () => {
    const timer = setInterval(() => {
      const { callStartTime, callStatus } = get();
      if (callStatus === 'connected' && callStartTime) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        set({ callDuration: duration });
      } else {
        clearInterval(timer);
      }
    }, 1000);
    
    set({ callTimer: timer });
  },
  
  // Reset call state
  resetCallState: () => {
    const { callTimer, localStream, remoteStream, peerConnection } = get();
    
    // Clear timer
    if (callTimer) {
      clearInterval(callTimer);
    }
    
    // Stop media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }
    
    // Reset state
    set({
      currentCall: null,
      callStatus: 'idle',
      incomingCall: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isMuted: false,
      isSpeakerOn: false,
      callDuration: 0,
      callStartTime: null,
      showIncomingCall: false,
      showCallWindow: false,
      isMinimized: false,
      callTimer: null
    });
    
    console.log('📞 Call state reset');
  },
  
  // Format call duration
  getFormattedDuration: () => {
    const { callDuration } = get();
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}));