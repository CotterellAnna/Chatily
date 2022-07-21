let getusermedia = require('getusermedia')
let Peer = require("simple-peer")

//targeting DOM elements
// const localVideo = document.getElementById("local-video")
const userId = document.getElementById("user-Id")
const addParticipant = document.getElementById("add-participant-btn")
const otherId = document.getElementById("other-Id")
const connectForm = document.getElementById("connect-form")
let copyBtn = document.getElementById("copy-btn")
let modal = document.getElementById("modal")
let closeModalBtn = document.getElementById("close-modal-btn")
let join = document.getElementById("join")
const messagesDiv = document.getElementById("messages-div")
const messageEl = document.getElementById("message-el")
const messageForm = document.getElementById("message-form")
let typingEl = document.getElementById("typing-el")
const micBtn = document.getElementById("mic-btn")
const videoBtn = document.getElementById("video-btn")
const endCallBtn = document.getElementById("end-call-btn")
const reactionBtn = document.getElementById("reaction-btn")
const frameBtn = document.getElementById("frame-btn")
const videoCallEl = document.getElementById("video-call-div")
const welcomeMsg = document.getElementById("vcName")
let remoteVideo

//create html video element to hold the local video
let localVideo = document.createElement("video")
// mute the local video
localVideo.muted = true
//append the local video to DOM
videoCallEl.appendChild(localVideo)

//go back on click of back btn
const backBtn = document.getElementById("back-btn")
backBtn.addEventListener("click", () => {
    window.history.back()
})

//get username form session storage
let userData = JSON.parse(sessionStorage.getItem("data"))

//set welcome message with username
welcomeMsg.textContent = `Welcome, ${userData.username}`

//adding the copy function to the copyBtn
copyBtn.addEventListener("click", ()=>{
    copy(userId.value)
})

//display modal to add other Id (offer/answer)
addParticipant.addEventListener("click", function(){
    modal.style.display = "block"
    modalAnimation("slideIn")
})

//function to close modal
function closeModal(){
    modalAnimation("slideOut")

    setTimeout(function(){
    modal.style.display = "none"
    }, 500)
}

//adding close function to the close modal button
closeModalBtn.addEventListener("click", closeModal)


//adding close funtion to the window on click on anywhere that's not the modal
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal()
    }
  }

//function for the animation modal
function modalAnimation(x){
    join.style.animationName = x
    join.style.animationDuration = "0.5s"
}

//checking if the window opened is the initializerr of the call
if(!(window.location.href .includes("#init"))){
    modal.style.display = "block"
    modalAnimation("slideIn")
}


//using the getuser media dependency
getusermedia(
    //setting the constraints of what media to get
    {
        video:true,
        audio:true
    },
    function(err, stream){
        if(err){
            console.log(err)
        }

        //displaying web cam of local video
        localVideo.classList.add("bigVideo")
        showWebcam(localVideo, stream)

        const oAudioTrack = stream.getAudioTracks()
        const oVideoTrack = stream.getVideoTracks()
        
        //creating a new instance of the peer instance
        let peer = new Peer({
            initiator: location.hash === "#init",
            trickle: false,
            stream: stream
        })

        //generating offer/answer and displaying it into the user-Id element
        peer.on('signal', function(data){
            userId.value = JSON.stringify(data)
        })

        //taking the value offer/answer from peer
        connectForm.addEventListener("submit", function(e){
            e.preventDefault()
            peer.signal(JSON.parse(otherId.value))
            //close modal on submit
            closeModal()
        })

        //function to send data 
        function sendData(data){
            peer.send(JSON.stringify(data))
        }

        //function for sending a new message to peer
        function sendMessage(){

            // getting the username of the user
            let username = userData.username

            //setting up the html structure for the message
            let message = `
            <div class="new-message-div">
                <div class="profile-img">
                    ${(username.split("")[0]).toUpperCase()}
                </div>
                <div class="name-message-el">
                    <div class="name-el">
                        ${username}
                    </div>
                    <div class="message-el">
                        ${messageEl.value}
                    </div>
                </div>
                <div class="time-el">
                    ${getTime()}
                </div>
            </div>
            `

            // sending the message using the sendData function
            sendData({
                username: userData.username,
                type: "message",
                message: message
            })

            //adding sent message to messages container
            messagesDiv.innerHTML += message
            messageEl.value = ""
            messagesDiv.scrollTo(0, messagesDiv.scrollHeight)
        }


        //on successful connection
        peer.on("connect", ()=>{
            swal({
                text: "Connection opened!",
                icon: "success"
            })

            //setting remote video to be large and local video to be small
            // videoSize(localVideo, remoteVideo)

            //adding the frame swap function to frame button
            frameBtn.addEventListener("click", frame)
            //removing the readonly attribute on the message input element to enable typing
            messageEl.removeAttribute("readonly")
            messageForm.addEventListener("submit", (e) => {
                e.preventDefault()
                if(messageEl.value != ""){
                    sendMessage()
                }
                typingEl.textContent = ""
            })

        })

        //when peer receives a message
        peer.on("data", (data)=>{
            data = JSON.parse(data)

            //if the data received is a message
            if(data.type == "message"){
                messagesDiv.innerHTML += data.message
            }else if (data.type == "typing"){
                typingEl.textContent = data.content
            }
        })

        //when a peer receives a stream
        peer.on("stream", (stream) => {

            //creating and styling a video element that'll hold the stream (remote video)
            remoteVideo = document.createElement("video")
            videoCallEl.appendChild(remoteVideo)

            // display the stream received
            showWebcam(remoteVideo, stream)

            videoSize(localVideo, remoteVideo)

        })

        //mic button
        let micCount = 0
        micBtn.addEventListener("click", ()=> {
            if(micCount == 0){
                //mute the stream's audio track
                oAudioTrack.forEach(track => {
                    track.enabled = false
                });
                //change the icon
                micBtn.src = "../images/mic-off.svg"
                micCount = 1
            }else if(micCount == 1){
                //unmute the stream's audio trac
                oAudioTrack.forEach(track => {
                    track.enabled = true
                });
                //change the icon
                micBtn.src = "../images/volume-icon.svg"
                micCount = 0
            }
        })

        //video button
        let VideoCount = 0
        videoBtn.addEventListener("click", ()=> {
            if(VideoCount == 0){
                //disable the stream's video track
                oVideoTrack[0].enabled = false
                //change the icon
                videoBtn.src = "../images/video-off.svg"
                VideoCount = 1
            }else if(VideoCount == 1){
                //enable the stream's video track
                oVideoTrack[0].enabled = true
                //change the icon
                videoBtn.src = "../images/video-icon.svg"
                VideoCount = 0
            }
        })

        endCallBtn.addEventListener("click", () => {
            //destroy the peer
            peer.destroy()
        })

        //to swap the video call frames
        let frameCount = 0
        function frame(){
            if (frameCount == 0){
                videoSize(remoteVideo, localVideo)
                frameCount = 1
            }else if(frameCount == 1){
                videoSize(localVideo, remoteVideo)
                frameCount = 0
            }
        }

        let timer
        //function for typing 
        function typing(){
            clearTimeout(timer)
            let content = `${userData.username} is typing...`
            sendData({
                type: "typing",
                content: content
            })
        }

        function notTyping(){
            clearTimeout(timer)
            timer = setTimeout(()=> {
                let content = ""
                sendData({
                    type: "typing",
                    content: content
                })
            }, 5000)
        }

        messageEl.addEventListener("keyup", notTyping)
        messageEl.addEventListener("input", typing)

        //when the peer connection closes
        peer.on("close", () => {
            videoSize(remoteVideo, localVideo)
            remoteVideo.remove()
            swal({
                text: "Connection closed!",
                icon: "info"
            })
            messageEl.setAttribute("readonly", false)
        })

    }
)


//function to display webcam and assign stream 
function showWebcam(videoEL, stream){
    videoEL.srcObject = stream
    videoEL.play()
}

//function to copy the content of an element
function copy(x){
    navigator.clipboard.writeText(x)
        .then(res => {
            swal({
                text: "Copied to clipboard successfully",
                icon: "success"
            })
        })
}


//function to get time 
function getTime(){
    let currentDate = new Date()
    let hours = currentDate.getHours()
    let minute = currentDate.getMinutes()
    let time
    if(hours > 12){
        hours = hours - 12
        time = `${hours}:${minute}PM`
    }else{
        time = `${hours}:${minute}AM`
    }
    return time
}



function videoSize(smallVideo, bigVideo){

    if(bigVideo.classList.contains("smallVideo")){
        bigVideo.classList.replace("smallVideo", "bigVideo")
    }else{
        bigVideo.classList.add("bigVideo")
    }

    if(smallVideo.classList.contains("bigVideo")){
        smallVideo.classList.replace("bigVideo", "smallVideo")
    }else{
        bigVideo.classList.add("smallVideo")
    }

    bigVideo.style.transform = "rotateY(180deg)"
    smallVideo.style.transform = "rotateY(180deg)"

}