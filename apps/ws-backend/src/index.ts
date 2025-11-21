import { WebSocketServer } from "ws";
const wss=new WebSocketServer({port:8080});
import JWT_SECRET from "@repo/config/secrets";
import jwt ,{JwtPayload} from "jsonwebtoken";
wss.on('connection',(ws,request)=>{
    const url=request.url
    // ws://localhost:8080/?token=32
    if(!url){
        ws.close();
        return;
    }
    const queryParams=new URLSearchParams(url.split('?')[1]);
    const token=queryParams.get('token');
    if(!token){
        ws.close();
        return;
    }
    const decoded=jwt.verify(token,JWT_SECRET) as JwtPayload;
    if(!decoded){
        ws.close();
        return;
    }
    console.log('New client connected');
    ws.on('message',(data)=>{
        console.log(`Received message: ${data}`);
    });
    ws.on('close',()=>{
        console.log('Client disconnected');
    });
})
console.log('WebSocket server is running on ws://localhost:8080');