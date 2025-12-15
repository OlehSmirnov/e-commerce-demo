import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

// ---------------------------
//  INIT APP
// ---------------------------
const app = initializeApp({
  apiKey: "AIzaSyAUFISPevQnKOdy9ziYywDPi3HkKQVPqs8",
  authDomain: "oleh-e-commerce.firebaseapp.com",
  databaseURL: "https://oleh-e-commerce-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "oleh-e-commerce",
  storageBucket: "oleh-e-commerce.firebasestorage.app",
  messagingSenderId: "190973193889",
  appId: "1:190973193889:web:6433827a6124fa96edcae0"
});

const database = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Отримати всі payment methods
const getPaymentMethods = async () => {
  const colRef = collection(firestore, "payment_methods");
  const snapshot = await getDocs(colRef);

  let methods = {};
  snapshot.forEach((d) => {
    methods[d.id] = d.data();
  });

  return methods;
};

// Увімкнення/вимкнення обраного методу оплати
const setPaymentMethod = async (name, enabled) => {
  const docRef = doc(firestore, "payment_methods", name);
  await updateDoc(docRef, { enabled });
};

// ---------------------------
//  AUTH HELPERS
// ---------------------------
const signUpUser = (userData) => {
  return createUserWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => userCredential.user)
    .catch((error) => {
      const message = error.message;
      const formattedMessage = message.substring(
        message.indexOf("/") + 1,
        message.length - 2
      ).replaceAll("-", " ");

      return "Error: " + formattedMessage;
    });
};

const loginUser = (userData) => {
  return signInWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => userCredential.user)
    .catch((error) => {
      const message = error.message;
      const formattedMessage = message.substring(
        message.indexOf("/") + 1,
        message.length - 2
      ).replaceAll("-", " ");

      return "Error: " + formattedMessage;
    });
};

const signOutUser = () => signOut(auth);

// ---------------------------
//  FAVORITES
// ---------------------------
const updateFavorites = (favorites) => {
  const data = {
    email: auth.currentUser.email,
    favorites
  };

  const updates = {};
  updates["users/" + auth.currentUser.uid] = data;

  return update(ref(database), updates);
};

// ---------------------------
//  EXPORTS
// ---------------------------
export default auth;

export {
  loginUser,
  signUpUser,
  signOutUser,
  updateFavorites,
  database,         
  firestore,
  getPaymentMethods,
  setPaymentMethod
};
