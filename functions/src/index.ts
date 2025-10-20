import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Optional: set limits, region, etc.
setGlobalOptions({ region: "asia-southeast1", maxInstances: 10 });

/**
 * Cloud Function: generatePracticePrompt
 * This is called from your Angular app (AiPromptService)
 */
export const generatePracticePrompt = onCall(async (request) => {
  try {
    const { userInput } = request.data;

    if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
      throw new HttpsError("invalid-argument", "Please provide a valid topic.");
    }

    // Example logic: generate a basic prompt
    const prompt = `Here's a speaking practice prompt for "${userInput}":
Talk for 2 minutes about why this topic matters to you, giving one personal example.`;

    logger.info(`Generated prompt for topic: ${userInput}`);

    // The return value MUST be an object — your Angular service expects { prompt }
    return { prompt };
  } catch (error: any) {
    logger.error("Error generating prompt", error);
    throw new HttpsError("internal", "Failed to generate practice prompt");
  }
});
