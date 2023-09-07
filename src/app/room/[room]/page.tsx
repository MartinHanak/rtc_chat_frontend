"use client";
import { useAvailableRoomsContext } from "@/app/components/AvailableRoomsContext";
import Room from "./components/Room";

export default function Page({ params }: { params: { room: string; }; }) {

    const decodedName = decodeURIComponent(params.room);

    const { rooms, status } = useAvailableRoomsContext();

    if (status === 'loading') {
        return (<div>Loading available rooms.</div>);
    }

    return (
        rooms.filter((room) => (room.name === decodedName)).length > 0 ?
            <div>
                Welcome to room {decodedName}
                <Room roomId={decodedName} />
            </div>
            :
            <div>Room {decodedName} does not exist.</div>
    );
}