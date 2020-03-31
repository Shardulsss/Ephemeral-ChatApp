const socket = io()


const $messageform = document.querySelector('#messageform')
const $messageInput = $messageform.querySelector('input')
const $messageButton = $messageform.querySelector('button')
const $sendLocationButton = document.querySelector('#sendlocation') 
const $messages = document.querySelector('#messages')

//templates
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const messageTemplate = document.querySelector('#messagetemplate').innerHTML
const locationTemplate = document.querySelector('#locationtemplate').innerHTML

//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild
    const newMessageStyles =  getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('welcome',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username:"System",
        createdAt:moment(message.createdAt).format('hh:mm a'),
        message:message,

    })
    $messages.insertAdjacentHTML('beforeend',html)
    console.log("welcome")
})

socket.on('messageBc',(message)=>{

    console.log(message.text)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        createdAt:moment(message.createdAt).format('hh:mm a'),
        message:message.text,

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationsent',(locationUrl)=>{
    console.log(locationUrl)
    const html = Mustache.render(locationTemplate,{
        username:locationUrl.username,
        createdAt:moment(locationUrl.createdAt).format('hh:mm a'),
        locationUrl:locationUrl.url
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomdata',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageInput.focus()
$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageButton.setAttribute('disabled','disabled')

    let message = $messageInput.value
    socket.emit('sendmessage',message)
    $messageButton.removeAttribute('disabled')
    $messageInput.value=""
    $messageInput.focus()

    console.log("sent")
})
$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert("geolocation not supported")
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('location',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
            },()=>{
                $sendLocationButton.removeAttribute('disabled')
                console.log("location shared")
            }
        )
    })
    
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})