import {initializeApp} from "firebase/app"
import {getDatabase, ref, update} from "firebase/database"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
})

const database = getDatabase()
const auth = getAuth(app)

const signUpUser = (userData) => {
  return createUserWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
      return userCredential.user
    })
    .catch((error) => {
      const message = error.message
      const formattedMessage =
        message.substring(message.indexOf("/") + 1, message.length - 2)
          .replaceAll("-", " ")
      return "Error: " + formattedMessage
    })
}

const loginUser = (userData) => {
  return signInWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
      return userCredential.user
    })
    .catch((error) => {
      const message = error.message
      const formattedMessage =
        message.substring(message.indexOf("/") + 1, message.length - 2)
          .replaceAll("-", " ")
      return "Error: " + formattedMessage
    })
}

const signOutUser = () => {
  return signOut(auth)
}

const updateFavorites = (favorites) => {
  const data = {
    email: auth.currentUser.email,
    favorites
  }
  const updates = {}
  updates["users/" + auth.currentUser.uid] = data
  return update(ref(database), updates)
}

export default auth
export {loginUser, signUpUser, signOutUser, updateFavorites, database}
