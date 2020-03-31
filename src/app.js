const path =require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const PORT = process.env.PORT || 3000
const publicPath = path.join(__dirname,'../public')
const {generateMessage, generateLocation} = require('./utils/message')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
let count = 0
app.use(express.static(publicPath))

io.on('connection',(socket)=>{
    
    socket.on('join',({username,room},callback)=>{
        
        
        const {error,user} = addUser({id:socket.id, username:username[0], room:username[1]})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('welcome',`welcome to ${user.room}`)
        socket.broadcast.to(user.room).emit('messageBc',generateMessage(user.username,`${user.username} has connected`))
        io.to(user.room).emit('roomdata',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendmessage',(message)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('messageBc',generateMessage(user.username,message))
        console.log(message)
    })

    socket.on('location',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationsent',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        

        if (user){
            io.to(user.room).emit('messageBc',generateMessage('System',`${user.username} has disconnected`))
            io.to(user.room).emit('roomdata',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })
})



server.listen(PORT,()=>{
    console.log("server is up")
})