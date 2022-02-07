const socket=io()

//Elements
const $messageForm= document.querySelector('#message-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton= $messageForm.querySelector('button')
const $shareLocationButton= document.querySelector('#share-location')
const $messages= document.querySelector('#messages')


//Templates
const messageTemplate= document.querySelector('#message-template').innerHTML
const locationMessageTemplate= document.querySelector('#location-message-template').innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

//Options
// ignoreQueryPreix:true --> removes the question-mark(?) from the query
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll= ()=>{
    //new message element
    const $newMessage= $messages.lastElementChild //grabing last element

    //height of the new message
    const newMessageStyles= getComputedStyle($newMessage) //getting all the css applied on msg element
    const newMessageMargin= parseInt(newMessageStyles.marginBottom) //it will convert the sting value to number
    const newMessageHeight= $newMessage.offsetHeight +newMessageMargin //getting the height of msg

    //visible height
    const visibleHeight= $messages.offsetHeight

    //height of messages container
    const containerHeight= $messages.scrollHeight //it gives the total height we are able to scroll through

    //how far i have scroll?
    const scrollOffset= $messages.scrollTop  + visibleHeight 
    //scrollTop gives the amount of distance we have scrolled from the top


    if(Math.round(containerHeight - newMessageHeight -1) <= Math.round(scrollOffset)){
        $messages.scrollTop = $messages.scrollHeight;
    }
}


//receiving data from server
socket.on('message',(message)=>{
    console.log(message);
    const html= Mustache.render(messageTemplate,{
        username:message.username,
        message :message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    
    $messages.insertAdjacentHTML('beforeend',html)
    //this allows us to insert other HTML adjacent to the element we've selected in this case that messages div
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const html= Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render(sidebarTemplate,{
        room,   //room:room
        users  //users:users
    })

    document.querySelector('#sidebar').innerHTML=html

})

// const inputData= document.querySelector('form')
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable
    $messageFormButton.setAttribute('disabled','disabled') //disabling the button 
    const message= e.target.elements.message.value

    //sending data to server
    socket.emit('sendMessage',message,(error)=>{

        //enable
        $messageFormButton.removeAttribute('disabled') //enabling the button again
        $messageFormInput.value='' //clearing the input after sending
        $messageFormInput.focus() // focusing again in input box

        if(error){
            return console.log(error);
        }
        console.log('Message delivered'); //For acknowledgement
    })
})

$shareLocationButton.addEventListener('click',()=>{
    //navigator.gelocation --> everything we need for geolocation leaves on navigator
    if(!navigator.geolocation){
        return alert('Your browser does not support Geolocation!!')
    }

    // disabling share location button
    $shareLocationButton.setAttribute('disabled','disabled')

    //the location can be fetched using navigator
    navigator.geolocation.getCurrentPosition((position)=>{
        const location ={
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        //sending location to server
        socket.emit('sendLocation',location,()=>{
            
            // enabling share location button
            $shareLocationButton.removeAttribute('disabled')

            console.log('Location Shared!');
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/' //if user can't join ther will be redirected to the home page
    }


})