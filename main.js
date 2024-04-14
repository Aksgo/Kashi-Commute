import {initializeApp} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js"
import {getDatabase, ref, onValue, push, remove} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js"
import {getAuth, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const appSetting= {
    apiKey: "AIzaSyCFxYip3i1JpPCOcIWA8s_QVUYbudPBzNg",
    authDomain: "iit-varanasi-travel.firebaseapp.com",
    databaseURL: "https://iit-varanasi-travel-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "iit-varanasi-travel",
    storageBucket: "iit-varanasi-travel.appspot.com",
    messagingSenderId: "731458065165",
    appId: "1:731458065165:web:9f718150559eaa3a899644"
};

//function to fetch the data
async function fetchData(url, options) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        //console.log(data);
        return data; // Return the JSON data
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error if needed
    }
}


function afterApiCall(response){
    /*just demo of the response.json recieved from .then*/
    console.log(response);
    //currently the json response is the sample one
    //response is the json object returned from the api call, now we can apply any function call to
}

//===================end of API call======================
//firebase initialization
const app = initializeApp(appSetting); 
const database = getDatabase(app);
const auth = getAuth(app);
//reference for common events database
const refEvent = ref(database, "event");
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
        let currentUID = user.uid;
        let userImg = user.photoURL;
        let currentUserName = user.displayName;
        console.log("signed in");
        let displayNameEl = document.createElement("b");
        let displayImg = document.getElementById("user-img");
        displayImg.src=userImg;
        displayNameEl.textContent="Hello "+currentUserName+",";
        let userName = document.getElementById("userName");
        userName.append(displayNameEl);
        let searchButton = document.getElementById("search-train-btn");
        searchButton.addEventListener("click",(eve)=>displayInfo(currentUID));
        let signOutbtn = document.getElementById("signout-btn");
        signOutbtn.addEventListener("click",(eve)=>signOutUser(eve, auth));
        let addEventbtn = document.getElementById("add-user-event-btn");
        addEventbtn.addEventListener("click",(eve)=>{
            window.location.href="userEvent.html";
        });

    }else{
        window.location.href="unauth.html";
    }
})

function displayInfo(curid){
        console.log("button clicked");
        let currentEventResult = document.getElementById("event-result");
        let currentUserEventResult = document.getElementById("user-event-result");
        const userRef = ref(database, curid);
        let departure = document.getElementById("departure");
        let destination = document.getElementById("destination");
        let travelDate = document.getElementById("date-travel");
        let date = new Date(travelDate.value);
        let curDate = new Date();
        console.log(curDate.getTime()<=date.getTime());
        console.log(curDate.getTime());
        console.log(curDate.getTime());
        if((departure.value.length>0 && destination.value.length>0) && date.getTime()>=curDate.getTime()){
            let key = prompt("Due to limited API Calls we need the key :");
            let refConfig = ref(database, "configuration");
            var passKey="4324872634"
            onValue(refConfig,(snapshot)=>{
                let snap = snapshot.val();
                passKey = snap["passkey"];
                if(key==passKey){
                    currentEventResult.innerHTML="";
                    currentUserEventResult.innerHTML="";
                    console.log("check 1 passed");
                    let eventResult = document.getElementById("event-result");
                    let userEventResult = document.getElementById("user-event-result");
                    onValue(refEvent, (snapshot)=>matchEvent(snapshot,travelDate,eventResult));
                    onValue(userRef, (snapshot)=>{displayPersonalEvent(snapshot, travelDate,userEventResult)});
                    displayTrain(departure, destination, travelDate);
                }else{
                    window.alert("Unauthorized!");
                    return;
            }
        });
    }
}
const priorityTag={
    "high":"🔴",
    "medium":"🟡",
    "low":"🟢"
  }
let priorityType=["high","medium","low"];
function matchEvent(snapshot,travelDate,elementid){
    console.log("check 2 passed - onValue passd a snapshot");
    if(snapshot.exists==false){elementid.innerHTML="Hooray! You are free to go! <b>No Clash in events found</b>"}
    else{
        let myTravelDate = new Date(travelDate.value);
        console.log("check 3 : "+myTravelDate);
        let count=0;
        try{
            const eventsArray = Object.values(snapshot.val());
            console.log("check 4:");
            for(let i=0; i<eventsArray.length; i++){
                let eventStartDate = new Date(eventsArray[i].startDate);
                let eventEndDate = new Date(eventsArray[i].endDate);
                console.log("check 5:");
                //eventsArray[i].eventValue
                if(myTravelDate.getTime()>=eventStartDate.getTime() && myTravelDate.getTime()<=eventEndDate.getTime()){
                    count++;
                    let newEl = document.createElement("li");
                    newEl.textContent= eventsArray[i].eventValue;
                    elementid.append(newEl);
                }
            }
            if(count==0){elementid.innerHTML="No task/event scheduled"}
        }catch(error){
            elementid.innerHTML="No task/event scheduled"
        }
    }
}
function displayPersonalEvent(snapshot,travelDate,elementid){
    if(snapshot.exists==false){elementid.innerHTML="Hooray! You are free to go! <b>No Clash in events found</b>"}
    else{
        let myTravelDate = new Date(travelDate.value);
        let count=0;
        try{
            const eventsArray = Object.values(snapshot.val());
            let personalResultId=document.getElementById("personal-result-id");
            let ind1=0;
            let ind2=2;
            count = priorityPrint(elementid, eventsArray, myTravelDate, ind1, 1, ind2);
            personalResultId.addEventListener("click",()=>{
                elementid.innerHTML="";
                priorityPrint(elementid, eventsArray, myTravelDate, ind2, 1, ind1);
                let temp = ind1;
                ind1=ind2;
                ind2=temp;
            });
            if(count==0){elementid.innerHTML="No task/event scheduled"}
        }catch(error){
            elementid.innerHTML="No task/event scheduled"
        }
    }
}

function priorityPrint(elementid, eventsArray, myTravelDate, ind1, ind2, ind3){
    let count=0;
    count+=loopToPrint(elementid, eventsArray, myTravelDate, ind1);
    count+=loopToPrint(elementid, eventsArray, myTravelDate, ind2);
    count+=loopToPrint(elementid, eventsArray, myTravelDate, ind3);
    return count;
}
function loopToPrint(elementid, eventsArray, myTravelDate, index){
    let count=0;
    for(let i=0; i<eventsArray.length; i++){
        let eventStartDate = new Date(eventsArray[i].startDate);
        let eventEndDate = new Date(eventsArray[i].endDate);
        if(eventsArray[i].priority==priorityType[index] && myTravelDate.getTime()>=eventStartDate.getTime() && myTravelDate.getTime()<=eventEndDate.getTime()){
            count++;
            //console.log("clash in date: "+eventsArray[i].eventValue);
            let newEl = document.createElement("li");
            newEl.textContent= eventsArray[i].eventValue+" "+priorityTag[eventsArray[i].priority];
            elementid.append(newEl);
        }
    }
    return count;
}

function getURL(fromStationCode,toStationCode,onDate){
    const URL =  `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${fromStationCode}&toStationCode=${toStationCode}&dateOfJourney=${onDate}`;
    return URL;
}

function displayTrain(departure, destination, travelDate){
    /*function to display the trains after fetching from api*/
    const url = getURL(departure.value, destination.value, travelDate.value);
    const refOption = ref(database, "configuration");
    let optionApi;
    onValue(refOption, (snapshot)=>{
        //console.log("running configuration fetching keys");
        let snap = snapshot.val();
        optionApi = snap["options"];
        //!!!!!!!!!!!!!!!!!!!!!!!!!enable this before submitting !!!!!!!!!!!!!!!!!!!
        //let res = fetchData(url,optionApi);
        let res = fetchData("sampleResponse.json");
        res.then((response)=>{
            const tableBody = document.getElementById("individualTrain");
            const trainDisplay = document.getElementById("schedule-train-un");
            trainDisplay.id="schedule-train";
            tableBody.innerHTML="";
            let dataArray = response.data;
            for(let i=0; i<dataArray.length; i++){
                const newRow = document.createElement("tr");
                let train = dataArray[i];
                newRow.innerHTML=`
                    <td>${train.train_name}(${train.train_number})</td>
                    <td>${train.from_std}</td>
                    <td>${train.to_std}</td>
                    <td>${train.from_station_name}</td>
                    <td>${train.to_station_name}</td>
                    <td>${train.duration}</td>
                `;
                tableBody.appendChild(newRow);
            }
        }).catch(error=>console.log(error));
    });
}

function signOutUser(eve, auth) {
    signOut(auth).then(() => {
        // Sign-out successful.
        window.location.href = "index.html"
        console.log("User signed out successfully");
    }).catch((error) => {
        // An error happened.
        console.error("Error signing out:", error);
    });
}


