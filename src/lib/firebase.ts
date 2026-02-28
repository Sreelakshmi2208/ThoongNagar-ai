import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyD3ksfWYMfthCV6JOZY9CFnSFPDmQBS1BQ",
    authDomain: "studio-5460571595-a9f98.firebaseapp.com",
    projectId: "studio-5460571595-a9f98",
    storageBucket: "studio-5460571595-a9f98.firebasestorage.app",
    messagingSenderId: "379723886042",
    appId: "1:379723886042:web:6a9a2231c78fee0ab0e4e3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, storage, db };
