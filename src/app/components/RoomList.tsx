import { Room } from "./RoomCatalog"

interface RoomList {
    rooms: Room[]
}

export function RoomList({ rooms }: RoomList) {
    return (
        <>
            {rooms.map((room, index) => {
                return (
                    <div key={index}>
                        {room.name}
                    </div>
                )
            })}
        </>
    )
}