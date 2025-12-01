import { WebSocketServer ,type WebSocket} from "ws";
const wss=new WebSocketServer({port:8080});
import JWT_SECRET from "@repo/config/secrets";
import jwt ,{JwtPayload} from "jsonwebtoken";
import { chatState } from "./ChatState";
type WebSocketUser=WebSocket & {
    userId:string
}
interface Data{
    type:string
    roomId:string
}
function checkUser(token:string):string | null {
    console.log('token',token)
    try {
        const decoded=jwt.verify(token,JWT_SECRET) as JwtPayload;
        if (typeof decoded == "string") {
            return null;
          }
        if(!decoded || !decoded.userId){
            return null
        }
        return decoded.userId
        
    } catch (error) {
        console.log('error while checking user in websocket')
        return null
    }
}
wss.on('connection',(ws,request)=>{
    // console.log('inside')
    // console.log('ws',ws)
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
   const userId=checkUser(token)
   if(!userId){
    ws.close()
    return
   }
   chatState.registerConnection(userId,ws as WebSocketUser);
    console.log('New client connected');
    ws.on('message', (data) => {
        const payload = JSON.parse(data.toString()) as Data;
        console.log(`Received message: ${data}`);
        if (payload.type === "JOIN_ROOM") {
            chatState.joinRoom((ws as WebSocketUser).userId!, payload.roomId);
        }
        if (payload.type === 'CHAT') {
            chatState.broadcast(payload.roomId, payload);
        }
        if (payload.type === 'LEAVE_ROOM') {
            chatState.unregisterConneection(ws as WebSocketUser);
        }
    });
    ws.on('close',()=>{
        chatState.unregisterConneection(ws as WebSocketUser)
        console.log('Client disconnected');
    });
})
console.log('WebSocket server is running on ws://localhost:8080');