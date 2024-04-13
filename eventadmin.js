import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {getAuth, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {getDatabase, ref, push, onValue} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
//import {adminuid} from "./config.js";
// import {signUser} from "./login.js";
const firebaseConfig = {
    apiKey: "AIzaSyCFxYip3i1JpPCOcIWA8s_QVUYbudPBzNg",
    authDomain: "iit-varanasi-travel.firebaseapp.com",
    databaseURL: "https://iit-varanasi-travel-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "iit-varanasi-travel",
    storageBucket: "iit-varanasi-travel.appspot.com",
    messagingSenderId: "731458065165",
    appId: "1:731458065165:web:9f718150559eaa3a899644"
};

//INITIALIZING FIREBASE
const app = initializeApp(firebaseConfig);
//initilizing database
const database = getDatabase(app);
const refDb = ref(database, "event");
//initializing auth
const auth = getAuth(app);
//storing authentication state in session storage
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Persistence set successfully
    console.log("admin working");
  })
  .catch((error) => {
    // Error setting persistence
    console.error("Error setting persistence:", error);
  });

auth.onAuthStateChanged((user)=>{ 
  if(user){
    let refConfig = ref(database, "configuration");
    onValue(refConfig,(snapshot)=>{
      let snap = snapshot.val();
      const UID = snap["owuid"];
      let currentUID = user.uid;
      if(currentUID==UID){
        console.log("admin signed in");
        let submitEvent = document.getElementById("event-submit");
        submitEvent.addEventListener("click",pushEventToDatabase);
      }
      else{
        console.log("unauthorized");
        window.location.href="unauth.html";
      }
    })
    
  }else{
    console.log("unauthorized");
    window.location.href="unauth.html";
  }
})

function pushEventToDatabase(){
  const eventName = document.getElementById("eventName");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  let date1=new Date(startDate.value);
  let date2 = new Date(endDate.value);
  if((eventName.value.length>0 && startDate.value.length>0 && endDate.value.length>0) && (date1.getTime()<=date2.getTime())){
    push(refDb,{
      "startDate":startDate.value,
      "eventValue":eventName.value,
      "endDate":endDate.value
    });
  }
  eventName.value="";
  startDate.value="";
  endDate.value="";
}
