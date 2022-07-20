let modalBtn = document.getElementById("modal-btn")
let modal = document.getElementById("modal")
let closeModalBtn = document.getElementById("close-modal-btn")
let join = document.getElementById("join")

modalBtn.addEventListener("click", function (){
    modal.style.display = "block"
    modalAnimation("slideIn")
})
function closeModal(){
    modalAnimation("slideOut")

    setTimeout(function(){
    modal.style.display = "none"
    }, 500)
}
closeModalBtn.addEventListener("click", closeModal)

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal()
    }
  }

function modalAnimation(x){
    join.style.animationName = x
    join.style.animationDuration = "0.5s"
}


let startConvo = document.getElementById("start-convo-form")
let meetingName = document.getElementById("meeting-name")

startConvo.addEventListener("submit", function(e){
    e.preventDefault()

    let current_href = window.location.href

   if(meetingName.value == ""){
       return
   }else{
       setData({
           username: meetingName.value
       })
        window.location.href = window.location.href.replace(current_href, 'videoChat.html#init')
   }

})

const joinForm = document.getElementById("join-convo-form")
const offerEl = document.getElementById("offer-el")
const remoteMeetingName = document.getElementById("remote-meeting-name")

joinForm.addEventListener("submit", function(e){
    e.preventDefault(e)

    let current_href = window.location.href

    if(remoteMeetingName.value == ""){
        return
    }else{
        setData({
            username: remoteMeetingName.value,
        })
        window.location.href = window.location.href.replace(current_href, 'videoChat.html')
    }
})

function setData(data){
    sessionStorage.clear()
    sessionStorage.setItem("data", JSON.stringify(data))
}