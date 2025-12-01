import { WebSocket } from "ws";

type UserId = string
type RoomId = string


// we wont be able to know which user disconencted so we attached userId to websocket too
declare module "ws" {
    interface WebSocket {
        userId: string
    }
}
class ChatState {
    //static belongs to class and not to objects
    // _ internal use
    private static _instance: ChatState

    private users: Map<UserId, WebSocket> = new Map()
    private rooms: Map<RoomId, Set<UserId>> = new Map()

    //so only we can create one instance
    private constructor() { }
    //public getter to expose 
    public static get instance(): ChatState {
        if (!this._instance) {
            this._instance = new ChatState()
        }
        return this._instance
    }


    registerConnection(userId: UserId, socket: WebSocket) {
        socket.userId = userId
        this.users.set(userId, socket)
    }

    unregisterConneection(socket: WebSocket) {
        const userId = socket.userId
        if (!userId) return;

        for (const [roomId, members] of this.rooms.entries()) {
            members.delete(userId)
            if (members.size == 0) {
                this.rooms.delete(roomId)
            }
        }
        this.users.delete(userId)


    }

    joinRoom(userId: UserId, roomId: RoomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set())
        }
        this.rooms.get(roomId)?.add(userId)
    }

    getRoomMembers(roomId: RoomId) {
        return this.rooms.get(roomId) || new Set()
    }
    sendToUser(userId: UserId, payload: any) {
        const socket = this.users.get(userId)
        socket?.send(JSON.stringify(payload))
    }
    broadcast(roomId: RoomId, payload: any) {
        for (const userId of
            this.getRoomMembers(roomId)) {
            this.sendToUser(userId, payload);
        }
    }
}

export const chatState=ChatState.instance