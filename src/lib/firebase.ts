import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMG89gmZuHzJoKczuRsAeUP1aoeBgCkHo",
  authDomain: "first-ai-dd7fc.firebaseapp.com",
  databaseURL: "https://first-ai-dd7fc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "first-ai-dd7fc",
  storageBucket: "first-ai-dd7fc.firebasestorage.app",
  messagingSenderId: "568685002004",
  appId: "1:568685002004:web:93a17a91648e9a0da49601",
};

export const firebaseConfigured = true;
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
