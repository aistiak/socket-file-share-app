const express = require("express") ;
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io") ;
const {randomId} = require("./utils")
const PORT = 3006 ;

const app = express() ;
app.use(express.static('public'))
app.use(cors())
app.get('/health',(req,res)=> {
    return res.sendStatus(200) ;
});

const server = http.createServer(app)
const io = socketIO(server) ;

const RoomData = new Map() ;


app.get('/',(req,res)=> {
    return res.sendStatus(200) ;
});

io.on('connection',(socket)=>{
    console.log(` -- new connection -- `);

    socket.on('share',(data)=>{
        console.log({data})
        const fileId = randomId() ;
        socket.join(fileId) ;
        RoomData.set(fileId,data)
        socket.emit('file-id',{fileId})
        
    })

    socket.on("show-file",(data)=>{
        console.log({data})
        const {fileId} = data
        const roomExists = io.sockets.adapter.rooms.has(fileId);
        console.log({roomExists})
        if(!roomExists) return 
        socket.join(fileId)
        // console.log(RoomData.get(fileId))
        socket.emit("file-found",RoomData.get(fileId))
    })

    socket.on("start-download",(data)=>{
        console.log(` --- download request on server --- `)
        console.log({data})
        const { fileId} = data ;
        io.to(fileId).emit("start-download")
    })

    socket.on('file-chunk',(data)=>{
       const {fileId ,chunk} = data ;
    //    console.dir({fileId,chunk})
       io.to(fileId).emit("file-chunk",data)
    })

    socket.on('disconnect',()=>{
        console.log(` -- user disconnected --`)
    });


});

server.listen(PORT,()=>{
    console.log(` -- server started on port ${PORT} --`)
});