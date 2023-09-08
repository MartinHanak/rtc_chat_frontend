import Link from "next/link";
import { Room } from "./RoomCatalog";

interface RoomList {
    rooms: Room[];
}

export function RoomList({ rooms }: RoomList) {
    return (
        <>
            {rooms.map((room, index) => {
                return (
                    <div key={index}>
                        <Link href={`/room/${encodeURIComponent(room.name)}`} >
                            {room.name}
                        </Link>
                    </div>
                );
            })}
        </>
    );
}