type RoomId=string
type UserId=string;
declare global{
    interface WebSocket{
        userId?:string
    }
}
class ChatState{
    private static _instance :ChatState;
    
    private users:Map<UserId,WebSocket>=new Map()
    private rooms:Map<RoomId,Set<UserId>>=new Map()
    
    public static get instance():ChatState{
        if(!this._instance){
                this._instance=new ChatState()
        }
        return this._instance
    }
    registerConnection(userId:UserId,ws:WebSocket){
        ws.userId=userId
        this.users.set(userId,ws)
    }
    unregisterConnection(ws:WebSocket){
        let userId=ws.userId;
        if(!userId) return;
        
        for (const [roomId,members ] of this.rooms.entries()){
            members.delete(userId)
            if(members.size===0){
                this.rooms.delete(roomId)
            }
        }
        this.users.delete(userId)
    }
    joinRoom(userId:UserId,roomId:RoomId){
        if(!this.rooms.has(roomId)){
            this.rooms.set(roomId,new Set())
        }
        this.rooms.get(roomId)?.add(userId)
        
    }
    leaveRoom(userId:UserId,roomId:RoomId){
        if(!this.rooms.has(roomId) || (!this.users.has(userId)) || (!this.rooms.get(roomId)?.has(userId))) return;
        this.rooms.get(roomId)?.delete(userId)
    }
    getRoomMembers(roomId:RoomId){
        return this.rooms.get(roomId) || new Set()
    }
    sendToUser(userId:UserId,payload:any){
        const socket=this.users.get(userId)
        socket?.send(JSON.stringify(payload))
    }
    broadcast(roomId:RoomId,payload:any){
        for ( let userId of this.getRoomMembers(roomId)){
            this.sendToUser(userId,payload)
        }
    }
}
export const chatState=ChatState.instance