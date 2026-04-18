import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCZzHtuCfSK7UQ13mUJ-ts5oP0dwVXY5D8",
  authDomain: "vendor-management-c2f5a.firebaseapp.com",
  projectId: "vendor-management-c2f5a",
  storageBucket: "vendor-management-c2f5a.firebasestorage.app",
  messagingSenderId: "379897856784",
  appId: "1:379897856784:web:5bdfa24376d55c84e8db95",
  measurementId: "G-F65HECSQZY"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, "test.txt");

uploadBytes(storageRef, new Uint8Array([1, 2, 3])).then(() => {
  console.log("Success");
  process.exit(0);
}).catch(e => {
  console.log("Upload Error:", e.message);
  process.exit(1);
});
