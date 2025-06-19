// hooks/useVoiceCall.js
import { useCallback, useEffect } from 'react';
import { useCallStore } from '../store/useCallStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWebRTC } from './useWebRTC';
import toast from 'react-hot-toast';

export const useVoiceCall = () => {
  const {
    currentCall,
    callStatus,
    incomingCall,
    setCurrentCall,
    setCallStatus,
    setIncomingCall,
    resetCallState
  } = useCallStore();
  
  const { socket, authUser } = useAuthStore();
  const {
    createPeerConnection,
    getLocalStream,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    endCall,
    isWebRTCSupported
  } = useWebRTC();

    // 🔥 FIX: Define declineCall FIRST before acceptCall
  const declineCall = useCallback((reason = 'Call declined') => {
    if (!incomingCall) return;
    
    console.log('📞 Declining incoming call');
    
    // Send decline to caller
    socket?.emit('call:decline', {
      to: incomingCall.from,
      callId: incomingCall.callId,
      reason
    });
    
    // Clear incoming call
    setIncomingCall(null);
    resetCallState();
    
    toast.success('Call declined');
  }, [incomingCall, socket, setIncomingCall, resetCallState]);
  

  
  // Accept incoming call
// In useVoiceCall.js - COMPLETELY REWRITE the acceptCall function:

const acceptCall = useCallback(async () => {
  if (!incomingCall) {
    console.log('❌ No incoming call to accept');
    return;
  }
  
  try {
    console.log('📞 RECEIVER: Accepting incoming call:', {
      callId: incomingCall.callId,
      from: incomingCall.from,
      fromUser: incomingCall.fromUserInfo?.fullName
    });
    
    // 🔥 STEP 1: Create call object first
    const call = {
      callId: incomingCall.callId,
      otherUserId: incomingCall.from,
      otherUserInfo: incomingCall.fromUserInfo,
      type: 'incoming',
      callType: 'voice'
    };
    
    console.log('📞 RECEIVER: Created call object:', call);
    
    // 🔥 STEP 2: Force update all state at once
    const callStore = useCallStore.getState();
    callStore.setCurrentCall(call);
    callStore.setCallStatus('connecting');
    callStore.setIncomingCall(null);
    
    // 🔥 STEP 3: Force UI update with direct state mutation
    useCallStore.setState({ 
      currentCall: call,
      callStatus: 'connecting',
      showCallWindow: true,
      showIncomingCall: false,
      incomingCall: null
    });
    
    console.log('📞 RECEIVER: State updated, current state:', {
      currentCall: useCallStore.getState().currentCall?.type,
      callStatus: useCallStore.getState().callStatus,
      showCallWindow: useCallStore.getState().showCallWindow
    });
    
    // 🔥 STEP 4: Get media and create connection
    console.log('📞 RECEIVER: Getting media stream...');
    const stream = await getLocalStream();
    console.log('📞 RECEIVER: Got local stream');
    
    console.log('📞 RECEIVER: Creating peer connection...');
    const pc = createPeerConnection();
    if (!pc) {
      throw new Error('Failed to create peer connection');
    }
    console.log('📞 RECEIVER: Created peer connection');
    
    // 🔥 STEP 5: Create answer
    console.log('📞 RECEIVER: Creating answer...');
    const answer = await createAnswer(pc, stream, incomingCall.offer);
    console.log('📞 RECEIVER: Created answer');
    
    // 🔥 STEP 6: Send answer
    console.log('📞 RECEIVER: Sending answer to caller');
    socket.emit('call:accept', {
      to: incomingCall.from,
      answer,
      callId: incomingCall.callId
    });
    
    toast.success('Call accepted - connecting...');
    
    // 🔥 STEP 7: Verify state is correct
    setTimeout(() => {
      const finalState = useCallStore.getState();
      console.log('📞 RECEIVER: Final state check:', {
        currentCall: finalState.currentCall?.type,
        callStatus: finalState.callStatus,
        showCallWindow: finalState.showCallWindow
      });
    }, 500);
    
  } catch (error) {
    console.error('📞 RECEIVER: Error accepting call:', error);
    toast.error('Failed to accept call');
    declineCall('Failed to connect');
  }
}, [
  incomingCall,
  getLocalStream,
  createPeerConnection,
  createAnswer,
  socket,
  declineCall
]);

  const forceConnectionCheck = useCallback(() => {
  const { callStatus, localStream, remoteStream, peerConnection } = useCallStore.getState();
  
  console.log('📞 Force connection check:', {
    callStatus,
    hasLocalStream: !!localStream,
    hasRemoteStream: !!remoteStream,
    hasPeerConnection: !!peerConnection
  });
  
  if (callStatus === 'connecting' && localStream && remoteStream && peerConnection) {
    console.log('📞 FORCING CONNECTION - all conditions met!');
    setCallStatus('connected');
    toast.success('Call connected!');
    return true;
  }
  
  return false;
}, [setCallStatus]);

  const checkConnectionStatus = useCallback(() => {
  const { peerConnection, callStatus, localStream, remoteStream } = useCallStore.getState();
  
  if (callStatus === 'connecting' && peerConnection && localStream && remoteStream) {
    console.log('📞 Manual connection check:', {
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
      hasLocalStream: !!localStream,
      hasRemoteStream: !!remoteStream
    });
    
    // If we have both streams and ICE is connected, mark as connected
    if (peerConnection.iceConnectionState === 'connected' || 
        peerConnection.iceConnectionState === 'completed' ||
        peerConnection.connectionState === 'connected') {
      console.log('📞 Manual check: Connection is ready!');
      setCallStatus('connected');
    }
  }
}, [setCallStatus]);

  // Initiate a call
const initiateCall = useCallback(async (userId, userInfo) => {
  console.log('🔥 DEBUG: initiateCall called with:', { userId, userInfo });
  
  if (!isWebRTCSupported) {
    console.log('❌ WebRTC not supported');
    toast.error('Voice calls are not supported in this browser');
    return;
  }
  
  if (!socket) {
    console.log('❌ No socket connection');
    toast.error('Connection not available');
    return;
  }
  
  try {
    console.log('📞 Initiating call to:', userId);
    setCallStatus('initiating');
    
    // Create call object
    const call = {
      callId: `${authUser._id}-${userId}-${Date.now()}`,
      otherUserId: userId,
      otherUserInfo: userInfo,
      type: 'outgoing',
      callType: 'voice'
    };
    
    console.log('🔥 DEBUG: Created call object:', call);
    setCurrentCall(call);
    
    // 🔥 DEBUG: Check if call state is set
    setTimeout(() => {
      const currentState = useCallStore.getState();
      console.log('🔥 DEBUG: Call store state after setCurrentCall:', {
        currentCall: currentState.currentCall,
        callStatus: currentState.callStatus,
        showCallWindow: currentState.showCallWindow
      });
    }, 100);
    
    // Get local media stream
    console.log('🎤 Getting local media stream...');
    const stream = await getLocalStream();
    console.log('✅ Got local stream:', stream);
    
    // Create peer connection
    console.log('🔗 Creating peer connection...');
    const pc = createPeerConnection();
    if (!pc) {
      throw new Error('Failed to create peer connection');
    }
    console.log('✅ Created peer connection:', pc);
    
    // Create offer
    console.log('📤 Creating offer...');
    const offer = await createOffer(pc, stream);
    console.log('✅ Created offer:', offer);
    
    // Send call initiation to other user
    console.log('📡 Sending call initiation to:', userId);
    socket.emit('call:initiate', {
      to: userId,
      offer,
      callType: 'voice'
    });
    
    setCallStatus('ringing');
    console.log('🔥 DEBUG: Set status to ringing, should show call window now');
    
    toast.success(`Calling ${userInfo.fullName}...`);
    
  } catch (error) {
    console.error('📞 Error initiating call:', error);
    toast.error('Failed to start call');
    resetCallState();
  }
},  [
    isWebRTCSupported,
    socket,
    authUser,
    setCallStatus,
    setCurrentCall,
    getLocalStream,
    createPeerConnection,
    createOffer,
    resetCallState
  ]);
  
  // Setup socket event listeners
useEffect(() => {
  if (!socket) {
    console.log('❌ No socket for call events');
    return;
  }
  
  
  console.log('🔌 Setting up call socket events');
  
  // 🔥 FIX: Remove all existing listeners first to prevent duplicates
  const cleanup = () => {
    socket.off('call:incoming');
    socket.off('call:accepted');
    socket.off('call:declined');
    socket.off('call:ended');
    socket.off('call:failed');
    socket.off('call:ice-candidate');
    socket.off('call:status-update');
  };
  
  // Clean up any existing listeners
  cleanup();
  
  // Handle incoming call
  socket.on('call:incoming', (data) => {
    console.log('📞 Incoming call received:', data);
    
    // 🔥 FIX: Get current state properly
    const { callStatus } = useCallStore.getState();
    console.log('📞 Current call status when receiving call:', callStatus);
    
    if (callStatus !== 'idle') {
      console.log('📞 User busy, auto-declining call');
      socket.emit('call:decline', {
        to: data.from,
        callId: data.callId,
        reason: 'User is busy'
      });
      return;
    }
    
    setIncomingCall(data);
    toast.success(`Incoming call from ${data.fromUserInfo?.fullName || 'Unknown'}`);
  });
  
  // Handle call accepted
  socket.on('call:accepted', async (data) => {
    console.log('📞 Call accepted:', data);
    
    try {
      setCallStatus('connecting');
      
      // 🔥 FIX: Directly update store to force UI update
      useCallStore.setState({ 
        showCallWindow: true,
        showIncomingCall: false 
      });
      
      await handleAnswer(data.answer);
      console.log('✅ Successfully handled answer');
      
      toast.success('Call connecting...');
    } catch (error) {
      console.error('📞 Error handling call acceptance:', error);
      toast.error('Failed to connect call');
      endCall();
    }
  });
  
  // Handle call declined
  socket.on('call:declined', (data) => {
    console.log('📞 Call declined:', data);
    toast.error(data.reason || 'Call declined');
    resetCallState();
  });
  
  // Handle call ended
  socket.on('call:ended', (data) => {
    console.log('📞 Call ended:', data);
    toast.success(data.reason || 'Call ended');
    resetCallState();
  });
  
  // Handle call failed
  socket.on('call:failed', (data) => {
    console.log('📞 Call failed:', data);
    toast.error(data.reason || 'Call failed');
    resetCallState();
  });
  
  // Handle ICE candidates
  socket.on('call:ice-candidate', (data) => {
    console.log('📞 Received ICE candidate');
    handleIceCandidate(data.candidate);
  });
  
  // Handle call status updates
  socket.on('call:status-update', (data) => {
    console.log('📞 Call status update:', data);
    
    if (data.status.type === 'mute') {
      toast.success(`${data.fromUserInfo?.fullName || 'User'} ${data.status.isMuted ? 'muted' : 'unmuted'}`);
    }
  });
  
  // 🔥 FIX: Return cleanup function
  return cleanup;
}, [
  socket, // 🔥 IMPORTANT: Only depend on socket, not other changing values
  setIncomingCall,
  setCallStatus,
  handleAnswer,
  handleIceCandidate,
  endCall,
  resetCallState
]);

  
  // Auto-cleanup on unmount or when auth changes
  useEffect(() => {
    if (!authUser) {
      resetCallState();
    }
  }, [authUser, resetCallState]);

  useEffect(() => {
  const { callStatus, localStream, remoteStream } = useCallStore.getState();
  
  if (callStatus === 'connecting' && localStream && remoteStream) {
    console.log('📞 Both streams available - setting up force connection timer');
    
    // Force connection after 2 seconds if still connecting
    const forceTimer = setTimeout(() => {
      const currentStatus = useCallStore.getState().callStatus;
      if (currentStatus === 'connecting') {
        console.log('📞 Auto-forcing connection after timeout');
        forceConnectionCheck();
      }
    }, 2000);
    
    return () => clearTimeout(forceTimer);
  }
}, [forceConnectionCheck]);

  useEffect(() => {
  let checkInterval;
  
  const { callStatus } = useCallStore.getState();
  if (callStatus === 'connecting') {
    console.log('📞 Starting connection status checks');
    checkInterval = setInterval(checkConnectionStatus, 2000);
    
    // Also check once immediately after 3 seconds
    setTimeout(checkConnectionStatus, 3000);
  }

  
  
  return () => {
    if (checkInterval) {
      console.log('📞 Stopping connection status checks');
      clearInterval(checkInterval);
    }
  };
}, [checkConnectionStatus]);
  
  return {
    // State
    currentCall,
    callStatus,
    incomingCall,
    isWebRTCSupported,
    
    // Actions
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    
    // Helper functions
    isCallActive: callStatus !== 'idle' && callStatus !== 'ended',
    canInitiateCall: callStatus === 'idle' && isWebRTCSupported,
    isRinging: callStatus === 'ringing',
    isConnected: callStatus === 'connected',
    hasIncomingCall: !!incomingCall
  };
};