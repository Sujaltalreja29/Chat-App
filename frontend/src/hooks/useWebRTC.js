// hooks/useWebRTC.js
import { useCallback, useRef, useEffect } from 'react';
import { useCallStore } from '../store/useCallStore';
import { useAuthStore } from '../store/useAuthStore';
import { getAudioConstraints } from '../utils/audioUtils';
import toast from 'react-hot-toast';

// WebRTC Configuration
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

export const useWebRTC = () => {
  const {
    peerConnection,
    setPeerConnection,
    setLocalStream,
    setRemoteStream,
    setCallStatus,
    currentCall,
    resetCallState
  } = useCallStore();
  
  const { socket, authUser } = useAuthStore();
  const iceCandidatesQueue = useRef([]);
  
  // Create peer connection
const createPeerConnection = useCallback(() => {
  try {
    const pc = new RTCPeerConnection(rtcConfiguration);
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && currentCall) {
        console.log('📞 Sending ICE candidate:', event.candidate.type);
        socket?.emit('call:ice-candidate', {
          to: currentCall.otherUserId,
          candidate: event.candidate,
          callId: currentCall.callId
        });
      } else if (!event.candidate) {
        console.log('📞 ICE gathering completed');
      }
    };
    
    // Handle remote stream
pc.ontrack = (event) => {
  console.log('📞 Received remote stream:', event.streams.length, 'streams');
  const [remoteStream] = event.streams;
  setRemoteStream(remoteStream);
  
  // 🔥 FIX: Check connection state after receiving stream
  console.log('📞 Checking connection state after receiving remote stream...');
  
  const checkConnection = () => {
    const currentState = useCallStore.getState();
    console.log('📞 Current peer connection states:', {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
      callStatus: currentState.callStatus,
      hasCurrentCall: !!currentState.currentCall
    });
    
    // 🔥 FIX: Mark as connected for BOTH incoming and outgoing calls
    if (currentState.callStatus === 'connecting' && currentState.currentCall) {
      const callType = currentState.currentCall.type;
      console.log(`📞 Have remote stream and connecting (${callType} call) - marking as connected!`);
      setCallStatus('connected');
      toast.success('Call connected!');
      return true;
    }
    return false;
  };
  
  // Check immediately
  if (!checkConnection()) {
    // Check again after 1 second
    setTimeout(() => {
      if (!checkConnection()) {
        // Check again after 3 seconds
        setTimeout(checkConnection, 3000);
      }
    }, 1000);
  }
};
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('📞 Connection state changed to:', pc.connectionState);
      console.log('📞 ICE connection state:', pc.iceConnectionState);
      console.log('📞 ICE gathering state:', pc.iceGatheringState);
      
      switch (pc.connectionState) {
        case 'connecting':
          console.log('📞 WebRTC connecting...');
          // Keep current status
          break;
        case 'connected':
          console.log('📞 WebRTC connection established successfully!');
          setCallStatus('connected');
          break;
        case 'disconnected':
          console.log('📞 WebRTC disconnected - might reconnect');
          break;
        case 'failed':
          console.log('📞 WebRTC connection failed');
          if (useCallStore.getState().callStatus !== 'ended') {
            setCallStatus('ended');
            toast.error('Call connection failed');
          }
          break;
        case 'closed':
          console.log('📞 WebRTC connection closed');
          break;
      }
    };
    
    // Handle ICE connection state (more reliable than connection state sometimes)
    pc.oniceconnectionstatechange = () => {
      console.log('📞 ICE connection state changed to:', pc.iceConnectionState);
      
      switch (pc.iceConnectionState) {
        case 'checking':
          console.log('📞 ICE checking connectivity...');
          break;
        case 'connected':
        case 'completed':
          console.log('📞 ICE connection successful!');
          // 🔥 FIX: Use ICE state as backup for connection detection
          const currentStatus = useCallStore.getState().callStatus;
          if (currentStatus === 'connecting') {
            console.log('📞 ICE connected - setting call status to connected');
            setCallStatus('connected');
          }
          break;
        case 'disconnected':
          console.log('📞 ICE disconnected - might reconnect');
          break;
        case 'failed':
          console.log('📞 ICE connection failed, attempting restart');
          try {
            pc.restartIce();
          } catch (error) {
            console.error('Failed to restart ICE:', error);
          }
          break;
        case 'closed':
          console.log('📞 ICE connection closed');
          break;
      }
    };
    
    // 🔥 NEW: Additional state monitoring
    pc.onsignalingstatechange = () => {
      console.log('📞 Signaling state changed to:', pc.signalingState);
    };
    
    setPeerConnection(pc);
    return pc;
  } catch (error) {
    console.error('📞 Error creating peer connection:', error);
    toast.error('Failed to initialize call');
    return null;
  }
}, [setPeerConnection, setRemoteStream, setCallStatus, currentCall, socket]);
  
  // Get local media stream
  const getLocalStream = useCallback(async () => {
    try {
      const constraints = getAudioConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('📞 Error getting local stream:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please check your audio devices.');
      } else {
        toast.error('Failed to access microphone');
      }
      
      throw error;
    }
  }, [setLocalStream]);
  
  // Create offer (caller)
  const createOffer = useCallback(async (pc, stream) => {
    try {
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      return offer;
    } catch (error) {
      console.error('📞 Error creating offer:', error);
      throw error;
    }
  }, []);
  
  // Create answer (callee)
  const createAnswer = useCallback(async (pc, stream, offer) => {
    try {
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process queued ICE candidates
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      
      // Create and set local description
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      return answer;
    } catch (error) {
      console.error('📞 Error creating answer:', error);
      throw error;
    }
  }, []);
  
  // Handle received answer (caller)
  const handleAnswer = useCallback(async (answer) => {
    try {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Process queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    } catch (error) {
      console.error('📞 Error handling answer:', error);
      toast.error('Failed to establish call connection');
    }
  }, [peerConnection]);
  
  // Handle ICE candidate
// In useWebRTC.js - UPDATE the handleIceCandidate function:

const handleIceCandidate = useCallback(async (candidate) => {
  try {
    console.log('📞 Processing ICE candidate:', candidate.type, candidate);
    
    if (peerConnection) {
      if (peerConnection.remoteDescription) {
        console.log('📞 Adding ICE candidate to peer connection');
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ ICE candidate added successfully');
      } else {
        console.log('📞 Queueing ICE candidate (no remote description yet)');
        iceCandidatesQueue.current.push(candidate);
      }
    } else {
      console.log('❌ No peer connection available for ICE candidate');
    }
  } catch (error) {
    console.error('📞 Error handling ICE candidate:', error);
  }
}, [peerConnection]);
  
  // End call
  const endCall = useCallback(() => {
    console.log('📞 Ending call');
    
    // Notify other participant
    if (currentCall && socket) {
      socket.emit('call:end', {
        to: currentCall.otherUserId,
        callId: currentCall.callId,
        reason: 'Call ended by user'
      });
    }
    
    // Clean up
    resetCallState();
  }, [currentCall, socket, resetCallState]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear ICE candidates queue
      iceCandidatesQueue.current = [];
    };
  }, []);
  
  return {
    createPeerConnection,
    getLocalStream,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    endCall,
    isWebRTCSupported: !!(window.RTCPeerConnection && navigator.mediaDevices?.getUserMedia)
  };
};