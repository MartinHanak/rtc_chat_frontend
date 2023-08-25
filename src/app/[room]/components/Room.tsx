'use client'



interface Room {
    roomId: string
}


export default function Room({ roomId }: Room) {
    // RoomContent has to wait for RoomContext to load
    return (
        <div>
            {roomId}
        </div>
    )
}