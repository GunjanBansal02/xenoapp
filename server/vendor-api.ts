// Dummy vendor API simulation

interface MessageRequest {
  to: string;
  message: string;
  logId: number;
}

interface VendorResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendMessage(request: MessageRequest): Promise<VendorResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate 90% success rate, 10% failure rate
  const isSuccess = Math.random() > 0.1;
  
  const response: VendorResponse = {
    success: isSuccess,
    messageId: isSuccess ? `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined,
    error: isSuccess ? undefined : "Delivery failed - recipient unreachable",
  };
  
  // Update the communication log via delivery receipt API
  try {
    const receiptResponse = await fetch(`http://localhost:5000/api/delivery-receipt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        logId: request.logId,
        status: isSuccess ? "delivered" : "failed",
        timestamp: new Date().toISOString(),
        vendorResponse: response,
      }),
    });
    
    if (!receiptResponse.ok) {
      console.error("Failed to send delivery receipt");
    }
  } catch (error) {
    console.error("Error sending delivery receipt:", error);
  }
  
  console.log(`Message ${isSuccess ? 'delivered' : 'failed'} to ${request.to}`);
  return response;
}
