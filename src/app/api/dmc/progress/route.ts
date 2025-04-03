import { NextRequest, NextResponse } from 'next/server';   
import { progressState } from '@/lib/progress-state';

export function GET(req: NextRequest) {   
  // Create a Server-Sent Events response   
  const encoder = new TextEncoder();
  
  // Use a response-specific state to track connection
  let isConnectionClosed = false;
  
  const stream = new ReadableStream({     
    start(controller) {       
      // Send initial progress       
      const initialData = `data: ${JSON.stringify(progressState)}\n\nevent: progress\n`;       
      controller.enqueue(encoder.encode(initialData));       
      
      // Define a safer method to send updates
      const safelySendUpdate = () => {
        if (isConnectionClosed) return false;
        
        try {
          const data = `data: ${JSON.stringify(progressState)}\n\nevent: progress\n`;           
          controller.enqueue(encoder.encode(data));
          return true;
        } catch (error) {
          console.log("Error sending progress update - connection may be closed");
          isConnectionClosed = true;
          return false;
        }
      };
      
      // Keep the connection alive with a controlled interval
      const interval = setInterval(() => {         
        // If connection is already known to be closed, stop interval
        if (isConnectionClosed) {
          clearInterval(interval);
          return;
        }
        
        // Check if we should close the controller
        if (progressState.completed >= progressState.total && progressState.total > 0) {           
          // Try to send final update
          safelySendUpdate();
          
          // Mark as closed and clean up
          isConnectionClosed = true;
          clearInterval(interval);
          
          try {
            controller.close();
          } catch (error) {
            console.log("Error closing controller - may already be closed");
          }
        } else {           
          // Just try to send an update - safelySendUpdate handles errors
          safelySendUpdate();
        }         
      }, 1000);
      
      // Handle client disconnect by adding event listeners to the request
      const abortController = new AbortController();
      req.signal.addEventListener('abort', () => {
        console.log("Client disconnected");
        isConnectionClosed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch (error) {
          // Controller may already be closed, ignore
        }
      }, { signal: abortController.signal });
      
      // Cleanup function
      return () => {
        clearInterval(interval);
        isConnectionClosed = true;
        abortController.abort();
      };
    }   
  });    
  
  return new Response(stream, {     
    headers: {       
      'Content-Type': 'text/event-stream',       
      'Connection': 'keep-alive',       
      'Cache-Control': 'no-cache',     
    }   
  }); 
}   

