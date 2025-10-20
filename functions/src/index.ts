import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Example HTTP function (without CORS handling)
exports.yourFunction = functions.https.onRequest((req, res): void => {
  // Direct response without CORS headers
  res.send("Hello from Firebase Functions!");
});

// Example Callable function to generate a practice prompt

