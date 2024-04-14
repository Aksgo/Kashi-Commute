import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { GoogleAuthProvider , getAuth, signInWithPopup, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {getDatabase, ref, push, onValue, remove} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFxYip3i1JpPCOcIWA8s_QVUYbudPBzNg",
    authDomain: "iit-varanasi-travel.firebaseapp.com",
    databaseURL: "https://iit-varanasi-travel-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "iit-varanasi-travel",
    storageBucket: "iit-varanasi-travel.appspot.com",
    messagingSenderId: "731458065165",
    appId: "1:731458065165:web:9f718150559eaa3a899644"
};

const app = initializeApp(firebaseConfig);
//initilizing database
const database = getDatabase(app);
//initializing auth
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

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

auth.onAuthStateChanged((user)=>{ 
  if(user){
    const currentUID = user.uid;
    console.log("signed in to events addition");
    let submitbtn = document.getElementById("submitEvent");
    let heading = document.getElementById("heading");
    let ind1=0;
    let ind2=2;
    const refDb = ref(database, currentUID);
    submitbtn.addEventListener("click", (event)=>pushEventToDatabase(event,refDb));
    onValue(refDb, (snapshot)=>{displayAllUserEvent(snapshot,currentUID, ind1, 1, ind2)});
    heading.addEventListener("click",()=>{
      onValue(refDb, (snapshot)=>{displayAllUserEvent(snapshot,currentUID, ind2, 1, ind1)});
      let temp=ind1;
      ind1=ind2;
      ind2=temp;
  });
    let backbtn =document.getElementById("back-btn");
    backbtn.addEventListener("click",()=>{
        window.location.href="train.html";
    });
  }else{
    console.log("unauthorized");
    window.location.href="unauth.html";
  }
})

function pushEventToDatabase(event,refDb){
    const eventName = document.getElementById("eventName");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const eventPriority = document.getElementById("priority");
    let date1=new Date(startDate.value);
    let date2 = new Date(endDate.value);
    date1.setHours(0, 0, 0, 0); // Set time components to 0 for comparison
    date2.setHours(0, 0, 0, 0); // Set time components to 0 for comparison
    if((eventName.value.length>0 && startDate.value.length>0 && endDate.value.length>0 && eventPriority.value.length>0) && (date1.getTime()<=date2.getTime())){
      push(refDb,{
        "startDate":startDate.value,
        "eventValue":eventName.value,
        "endDate":endDate.value,
        "priority":eventPriority.value
      });
      eventName.value="";
      startDate.value="";
      endDate.value="";
      eventPriority.value="";
    }
    else if(eventName.value.length>0 && startDate.value.length>0 && endDate.value.length>0 && eventPriority.value.length>0){window.alert("Oops! Start Date After End Date");
      startDate.value="";
      endDate.value="";
    }
    else if(eventPriority.value.length<=0){
      window.alert("Please specify the priority");
    }
    else if(startDate.value.length<=0 || endDate.value.length<=0){window.alert("Please specify the date range");}
    

  }
let priorityType=["high","medium","low"];
function displayAllUserEvent(snapshot,curid, ind1, ind2, ind3){
    let eventList = document.getElementById("event-list-all");
    eventList.innerHTML="";
    if(snapshot.exists()==false){eventList.innerHTML="<li><b>Great!</b> No plans as of now</li>";}
    const eventArray = Object.entries(snapshot.val());
    //console.log(eventArray);
    priorityPrint(eventList, curid, eventArray, ind1, ind2, ind3);
}
const priorityTag={
  "high":"🔴",
  "medium":"🟡",
  "low":"🟢"
}
function priorityPrint(eventList, curid, eventArray, ind1, ind2, ind3){
  for(let i=0; i<eventArray.length; i++){
      let data = eventArray[i];
      if(data[1].priority==priorityType[ind1]){
        addToEvent(data,curid, eventList);
      }
  }
  for(let i=0; i<eventArray.length; i++){
    let data = eventArray[i];
    if(data[1].priority==priorityType[ind2]){
      addToEvent(data,curid, eventList);
    }
  }
  for(let i=0; i<eventArray.length; i++){
    let data = eventArray[i];
    if(data[1].priority==priorityType[ind3]){
      addToEvent(data,curid, eventList);
    }
  }
}

function addToEvent(data, curid, eventList){
    let newEl = document.createElement("li");
    let currentData=data[1];
    newEl.textContent = currentData.eventValue+" "+priorityTag[currentData.priority];
    newEl.id="task-each";
    const eventid = data[0];
    let delb = document.createElement("li");
    delb.id="delete-btn";
    delb.textContent="❌";
    newEl.appendChild(delb);
    delb.addEventListener("click",()=>{
        let exactLocationInDB = ref(database, `${curid}/${eventid}`);
        //console.log("removed : "+data[1]);
        remove(exactLocationInDB);
    })
    eventList.append(newEl);
}

