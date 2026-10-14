import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Aapke activeforeverindia project ki settings
const firebaseConfig = {
  apiKey: "AIzaSyAcm6BSVzzLh8ObwoBXXnMmpMI-w-0qVq4",
  authDomain: "activeforeverindia-87d4f.firebaseapp.com",
  projectId: "activeforeverindia-87d4f",
  storageBucket: "activeforeverindia-87d4f.firebasestorage.app",
  messagingSenderId: "23851682477",
  appId: "1:23851682477:web:ec7efd5295035360a49424",
  measurementId: "G-H52XPD71QL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);