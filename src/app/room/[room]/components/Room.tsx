'use client'
import { RoomContent } from "./RoomContent"
import { RoomContext } from "./RoomContext"

interface Room {
    roomId: string
}


export default function Room({ roomId }: Room) {
    // RoomContent has to wait for RoomContext to load
    return (
        <RoomContext roomId={roomId}>
            <RoomContent />
        </RoomContext>
    )
}