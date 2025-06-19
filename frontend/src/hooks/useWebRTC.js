// hooks/useWebRTC.js
import { useCallback, useRef, useEffect } from 'react';
import { useCallStore } from '../store/useCallStore';
import { useAuthStore } from '../store/useAuthStore';
import { getAudioConstraints } from '../utils/audioUtils';
import { AudioProcessor } from '../utils/audioProcessor';
import toast from 'react-hot-toast';

// WebRTC Configuration
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10,
  // Add debug logging
  iceTransportPolicy: 'all' // Allow both STUN and TURN
};

console.log('📞 🧊 Using ICE servers:', rtcConfiguration.iceServers);

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
  const audioProcessorRef = useRef(null);

  const { socket, authUser } = useAuthStore();
  const iceCandidatesQueue = useRef([]);
  
  // Create peer connection
// In useWebRTC.js - UPDATE the createPeerConnection function:

// In useWebRTC.js - UPDATE the createPeerConnection function:

// In useWebRTC.js - UPDATE the createPeerConnection function:

const createPeerConnection = useCallback(() => {
  try {
    console.log('📞 🧊 Creating peer connection with config:', rtcConfiguration);
    const pc = new RTCPeerConnection(rtcConfiguration);
    
    // 🔥 FIX: Handle ICE candidates with detailed debugging
    pc.onicecandidate = (event) => {
      console.log('📞 🧊 ICE candidate event fired:', !!event.candidate);
      
      if (event.candidate) {
        console.log('📞 🧊 Sending ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address || 'hidden',
          port: event.candidate.port,
          foundation: event.candidate.foundation,
          component: event.candidate.component,
          priority: event.candidate.priority
        });
        
        // 🔥 CRITICAL: Check if we have currentCall and socket
        const { currentCall } = useCallStore.getState();
        console.log('📞 🧊 Current call available:', !!currentCall);
        console.log('📞 🧊 Socket available:', !!socket);
        
        if (currentCall && socket) {
          console.log('📞 🧊 Emitting ICE candidate to:', currentCall.otherUserId);
          socket.emit('call:ice-candidate', {
            to: currentCall.otherUserId,
            candidate: event.candidate,
            callId: currentCall.callId
          });
          console.log('📞 ✅ ICE candidate emitted successfully');
        } else {
          console.error('📞 ❌ Cannot send ICE candidate - missing currentCall or socket');
        }
      } else {
        console.log('📞 🧊 ICE gathering completed');
      }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📞 Received remote stream:', event.streams.length, 'streams');
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      console.log('📞 Remote stream received, waiting for ICE connection...');
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('📞 🔗 Connection state changed to:', pc.connectionState);
      
      switch (pc.connectionState) {
        case 'connecting':
          console.log('📞 🔗 WebRTC connecting...');
          break;
        case 'connected':
          console.log('📞 ✅ WebRTC connection established successfully!');
          setCallStatus('connected');
          toast.success('Call connected!');
          break;
        case 'disconnected':
          console.log('📞 ⚠️ WebRTC disconnected');
          break;
        case 'failed':
          console.log('📞 ❌ WebRTC connection failed');
          setCallStatus('ended');
          toast.error('Call connection failed');
          break;
        case 'closed':
          console.log('📞 📪 WebRTC connection closed');
          break;
      }
    };
    
    // 🔥 CRITICAL: Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('📞 🧊 ICE connection state changed to:', pc.iceConnectionState);
      
      switch (pc.iceConnectionState) {
        case 'new':
          console.log('📞 🧊 ICE connection: new');
          break;
        case 'gathering':
          console.log('📞 🧊 ICE gathering candidates...');
          break;
        case 'checking':
          console.log('📞 🧊 ICE checking connectivity...');
          break;
        case 'connected':
          console.log('📞 ✅ ICE connection successful! Audio should now flow.');
          const currentStatus = useCallStore.getState().callStatus;
          if (currentStatus === 'connecting') {
            setCallStatus('connected');
            toast.success('Call connected - audio flowing!');
          }
          break;
        case 'completed':
          console.log('📞 ✅ ICE connection completed!');
          const currentStatus2 = useCallStore.getState().callStatus;
          if (currentStatus2 === 'connecting') {
            setCallStatus('connected');
            toast.success('Call connected - audio flowing!');
          }
          break;
        case 'disconnected':
          console.log('📞 ⚠️ ICE disconnected');
          break;
        case 'failed':
          console.log('📞 ❌ ICE connection failed');
          setCallStatus('ended');
          toast.error('Call connection failed');
          break;
        case 'closed':
          console.log('📞 📪 ICE connection closed');
          break;
      }
    };
    
    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log('📞 🧊 ICE gathering state changed to:', pc.iceGatheringState);
    };
    
    // Signaling state changes
    pc.onsignalingstatechange = () => {
      console.log('📞 📋 Signaling state changed to:', pc.signalingState);
    };
    
    setPeerConnection(pc);
    return pc;
  } catch (error) {
    console.error('📞 Error creating peer connection:', error);
    toast.error('Failed to initialize call');
    return null;
  }
}, [setPeerConnection, setRemoteStream, setCallStatus, socket]); // 🔥 ADD socket to dependencies
  
  // Get local media stream
// UPDATE the getLocalStream function:
const getLocalStream = useCallback(async () => {
  try {
    const constraints = getAudioConstraints();
    const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // 🔥 Apply audio processing for noise reduction
    audioProcessorRef.current = new AudioProcessor();
    const processedStream = await audioProcessorRef.current.setupAudioProcessing(rawStream);
    
    console.log('🎤 Audio stream processed for noise reduction');
    setLocalStream(processedStream);
    return processedStream;
    
  } catch (error) {
    console.error('📞 Error getting local stream:', error);
    // ... existing error handling
    throw error;
  }
}, [setLocalStream]);
  
  // Create offer (caller)
const createOffer = useCallback(async (pc, stream) => {
  try {
    console.log('📤 Adding local stream tracks to peer connection');
    
    // Add local stream to peer connection
    stream.getTracks().forEach(track => {
      console.log('📤 Adding track:', track.kind, track.enabled, track.readyState);
      pc.addTrack(track, stream);
    });
    
    // Verify tracks were added
    const senders = pc.getSenders();
    console.log('📤 Peer connection senders:', senders.length);
    senders.forEach((sender, index) => {
      console.log(`📤 Sender ${index}:`, sender.track?.kind, sender.track?.enabled);
    });
    
    // Create and set local description
    const offer = await pc.createOffer({
      offerToReceiveAudio: true, // 🔥 IMPORTANT: Explicitly request audio
      offerToReceiveVideo: false
    });
    
    await pc.setLocalDescription(offer);
    console.log('📤 Offer created and local description set');
    
    return offer;
  } catch (error) {
    console.error('📞 Error creating offer:', error);
    throw error;
  }
}, []);

  
  // Create answer (callee)
const createAnswer = useCallback(async (pc, stream, offer) => {
  try {
    console.log('📥 Adding local stream tracks to peer connection (answer)');
    
    // Add local stream to peer connection
    stream.getTracks().forEach(track => {
      console.log('📥 Adding track:', track.kind, track.enabled, track.readyState);
      pc.addTrack(track, stream);
    });
    
    // Set remote description first
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('📥 Remote description set');
    
    // Process queued ICE candidates
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    
    // Create and set local description
    const answer = await pc.createAnswer({
      offerToReceiveAudio: true, // 🔥 IMPORTANT: Explicitly request audio
      offerToReceiveVideo: false
    });
    
    await pc.setLocalDescription(answer);
    console.log('📥 Answer created and local description set');
    
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

// In useWebRTC.js - UPDATE the handleIceCandidate function:

const handleIceCandidate = useCallback(async (candidate) => {
  try {
    console.log('📞 🧊 Processing received ICE candidate:', {
      type: candidate.type,
      protocol: candidate.protocol,
      address: candidate.address,
      port: candidate.port
    });
    
    if (peerConnection) {
      if (peerConnection.remoteDescription) {
        console.log('📞 🧊 Adding ICE candidate to peer connection');
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('📞 ✅ ICE candidate added successfully');
      } else {
        console.log('📞 🧊 Queueing ICE candidate (no remote description yet)');
        iceCandidatesQueue.current.push(candidate);
        console.log('📞 🧊 ICE candidates in queue:', iceCandidatesQueue.current.length);
      }
    } else {
      console.log('📞 ❌ No peer connection available for ICE candidate');
    }
  } catch (error) {
    console.error('📞 ❌ Error handling ICE candidate:', error);
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
  // Add cleanup in the hook:
useEffect(() => {
  return () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.cleanup();
    }
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