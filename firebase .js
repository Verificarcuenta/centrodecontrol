// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_APIKEY",
  authDomain: "TU_AUTH",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE",
  messagingSenderId: "TU_SENDER",
  appId: "TU_APPID"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
