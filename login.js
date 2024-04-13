import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { GoogleAuthProvider , getAuth, signInWithPopup, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {getDatabase, ref} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFxYip3i1JpPCOcIWA8s_QVUYbudPBzNg",
    authDomain: "iit-varanasi-travel.firebaseapp.com",
    databaseURL: "https://iit-varanasi-travel-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "iit-varanasi-travel",
    storageBucket: "iit-varanasi-travel.appspot.com",
    messagingSenderId: "731458065165",
    appId: "1:731458065165:web:9f718150559eaa3a899644"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);
//initializing database
const database = getDatabase(app);
const usersRef = ref(database, "users");
//storing authentication state in session storage
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Persistence set successfully
    console.log("working");
  })
  .catch((error) => {
    // Error setting persistence
    console.error("Error setting persistence:", error);
  });

let googleLoginBtn = document.getElementById("google-btn");

//signing in button
googleLoginBtn.addEventListener("click",signUser);

function signUser(){
    if(!auth.currentUser){
        console.log("singing the user");
        signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            const curid = user.uid;
            /*extras*/
            // IdP data available using getAdditionalUserInfo(result)
            // ...
            /*====*/
            // Redirect to train.html page
            window.location.href = "train.html";
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...

        });
    }else{
        console.log("logged in");
        window.location.href="train.html";
        }   
}


