import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLiNUpm0KV1SShEEDdFSRyIDJhoPDZGCQ",
  authDomain: "sadamon-b3522.firebaseapp.com",
  projectId: "sadamon-b3522",
  storageBucket: "sadamon-b3522.firebasestorage.app",
  messagingSenderId: "69782452426",
  appId: "1:69782452426:web:adb613ded8d1acc5739c33",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export default app
