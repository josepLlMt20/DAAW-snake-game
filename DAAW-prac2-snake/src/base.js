// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    databaseURL: "https://snake-game-7754a-default-rtdb.europe-west1.firebasedatabase.app/",
};

console.log('Database URL:', import.meta.env.VITE_DB_URL);

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 