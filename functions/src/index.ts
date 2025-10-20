import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const generatePracticePrompt = functions.https.onCall(
  async (request, context) => {
    const { userInput } = request.data;

    if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide a valid topic."
      );
    }

    // Basic offline logic — no paid API calls
    const prompt = `Here's a speaking practice prompt for "${userInput}":
Talk for 2 minutes about why this topic matters to you.`;

    return { prompt };
  }
);
