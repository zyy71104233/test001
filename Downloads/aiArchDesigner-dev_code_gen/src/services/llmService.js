const API_BASE_URL = "https://api.deepseek.com";
const API_KEY = "sk-10a5247e4c944fdf94b08dfb9b98c511"; // 请注意：在生产环境中不应如此硬编码 API Key
const MODEL = "deepseek-chat";

export async function generateContent(prompt) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        stream: false // 设置为 false 以获取完整响应而非流式响应
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LLM API Error:', errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData.error ? errorData.error.message : 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else {
      console.error('LLM API Error: Invalid response structure', data);
      throw new Error('Invalid response structure from LLM API');
    }

  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function generateStreamContent(prompt, onChunk, onComplete, onError) {
  let connectionClosed = false; // Flag to ensure onComplete/onError are called once meaningfully
  let contentProcessed = false; // Flag to track if any actual content was sent via onChunk
  let reader; // Declare reader here to be accessible in cleanup/error handling

  const ensureCleanupAndComplete = (processedContent) => {
    if (!connectionClosed) {
      connectionClosed = true;
      if (reader && typeof reader.releaseLock === 'function') {
        try {
          reader.releaseLock();
        } catch (e) { /* console.warn("Error releasing reader lock:", e); */ }
      }
      if (onComplete) {
        onComplete(processedContent);
      }
    }
  };

  const handleError = (error) => {
    if (!connectionClosed) {
      connectionClosed = true;
      if (reader && typeof reader.releaseLock === 'function') {
        try {
          reader.releaseLock();
        } catch (e) { /* console.warn("Error releasing reader lock on error:", e); */ }
      }
      if (onError) {
        onError(error);
      } else {
        console.error("Unhandled stream error (no onError callback provided):", error);
      }
      // Also call onComplete to signal the end, indicating if any content was processed before error
      if (onComplete) {
        onComplete(contentProcessed); 
      }
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant that provides answers in Markdown format." },
          { role: "user", content: prompt }
        ],
        stream: true
      }),
    });

    if (!response.ok) {
      let errorBody = { message: `API request failed with status ${response.status}` };
      try {
        const errJson = await response.json();
        errorBody = { ...errorBody, ...errJson.error }; 
      } catch (e) {
        // If response body is not JSON or error structure is unexpected
        const textResponse = await response.text().catch(() => "");
        errorBody.message = `${errorBody.message}${textResponse ? ": " + textResponse.substring(0,100) : ""}`;
      }
      console.error('LLM API Error (before stream):', errorBody);
      // Critical error, call handleError and then return to stop further processing
      handleError(new Error(errorBody.message || "API request failed"));
      return;
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    function handleDataLine(line) {
      if (connectionClosed || !line) return; // Don't process if already cleaned up or line is empty

      if (line.startsWith("data: ")) {
        const jsonData = line.substring(5).trim();
        if (jsonData === "[DONE]") {
          ensureCleanupAndComplete(contentProcessed);
          return;
        }
        if (!jsonData) return; 
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed.choices && parsed.choices.length > 0) {
            const delta = parsed.choices[0].delta;
            if (delta && typeof delta.content === 'string') {
              if (onChunk) onChunk(delta.content);
              if (delta.content.length > 0) contentProcessed = true;
            }
            if (parsed.choices[0].finish_reason && parsed.choices[0].finish_reason !== null) {
              // This indicates the end of a choice. For a single completion, might be redundant if [DONE] is present.
              // console.log("Finish reason:", parsed.choices[0].finish_reason);
            }
          }
        } catch (e) {
          console.error("Error parsing stream JSON:", e, "Problematic JSON data:", jsonData);
          // Decide if a single JSON parse error should terminate the whole stream via handleError
          // For now, we log it and continue, hoping the stream recovers or [DONE] is still sent.
          // If this is a frequent issue, we might want to call handleError(e) here.
        }
      }
    }

    async function processStreamInternal() {
      while (!connectionClosed) {
        let readResult;
        try {
          readResult = await reader.read();
        } catch (streamReadError) {
          console.error("Error reading from stream:", streamReadError);
          handleError(streamReadError);
          return; // Exit processing loop
        }

        const { done, value } = readResult;

        if (done) {
          // Process any remaining buffer content when stream ends without explicit [DONE] on the very last line
          if (buffer.trim()) {
            const remainingLines = buffer.split('\n');
            for (const remLine of remainingLines) {
              handleDataLine(remLine.trim()); 
              if (connectionClosed) break; // Stop if [DONE] was in the buffer
            }
            buffer = ""; 
          }
          ensureCleanupAndComplete(contentProcessed);
          break; // Exit while loop
        }

        buffer += decoder.decode(value, { stream: true });
        let eolIndex;
        while ((eolIndex = buffer.indexOf('\n')) >= 0 && !connectionClosed) {
          const line = buffer.substring(0, eolIndex).trim();
          buffer = buffer.substring(eolIndex + 1);
          handleDataLine(line);
        }
        // If connection was closed by handleDataLine (e.g. [DONE]), and buffer still had content from the same chunk.
        if (connectionClosed && buffer.trim()){
            const remainingLinesAfterDone = buffer.split('\n');
            for (const remLine of remainingLinesAfterDone) {
                 // Typically, no actual data should follow [DONE] in the same payload line that gets processed here.
                 // But if it did, handleDataLine would ignore it due to connectionClosed flag.
                 if(remLine.trim() && !remLine.startsWith("data: [DONE]")) {
                    // console.warn("Data found in buffer after [DONE] was processed in the same chunk:", remLine);
                 }
            }
            buffer = "";
        }
      }
    }
    
    await processStreamInternal();

  } catch (error) { // Catches errors from initial fetch setup, response.ok check, or response.body.getReader()
    console.error('Error in generateStreamContent setup:', error);
    handleError(error);
  }
} 