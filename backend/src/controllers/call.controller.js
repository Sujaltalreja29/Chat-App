// controllers/call.controller.js - UPDATED VERSION
// 🎯 Simple call state tracking (in-memory for now)
const activeCalls = new Map(); // callId -> call data

// Get active calls for user (optional endpoint)
export const getActiveCalls = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const userCalls = Array.from(activeCalls.values()).filter(call => 
      call.participants.includes(userId.toString())
    );
    
    res.status(200).json({
      success: true,
      activeCalls: userCalls
    });
  } catch (error) {
    console.error("Error getting active calls:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active calls"
    });
  }
};

// Create call record (optional - for call history)
export const createCallRecord = async (req, res) => {
  try {
    const { to, callType = 'voice' } = req.body;
    const from = req.user._id;
    
    const callId = `${from}-${to}-${Date.now()}`;
    
    // Store call data temporarily
    activeCalls.set(callId, {
      callId,
      participants: [from.toString(), to],
      initiator: from.toString(),
      callType,
      status: 'initiated',
      startTime: new Date(),
      endTime: null
    });
    
    res.status(200).json({
      success: true,
      callId,
      message: "Call initiated"
    });
  } catch (error) {
    console.error("Error creating call record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate call"
    });
  }
};

// End call record
export const endCallRecord = async (req, res) => {
  try {
    const { callId } = req.params;
    
    if (activeCalls.has(callId)) {
      const call = activeCalls.get(callId);
      call.endTime = new Date();
      call.status = 'ended';
      
      // Remove from active calls after a delay
      setTimeout(() => {
        activeCalls.delete(callId);
      }, 5000);
    }
    
    res.status(200).json({
      success: true,
      message: "Call ended"
    });
  } catch (error) {
    console.error("Error ending call record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end call"
    });
  }
};

// Check user availability for calls
export const checkUserAvailability = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is in any active calls
    const userInCall = Array.from(activeCalls.values()).some(call => 
      call.participants.includes(userId) && call.status === 'active'
    );
    
    res.status(200).json({
      success: true,
      available: !userInCall,
      inCall: userInCall
    });
  } catch (error) {
    console.error("Error checking user availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check availability"
    });
  }
};