"use client";

import Link from "next/link";
import { useState } from "react";
import { RoomList } from "./RoomList";
import { useAvailableRoomsContext } from "./AvailableRoomsContext";

export enum RoomType {
    video = 'video',
    audio = 'audio',
    text = 'text'
}

export interface Room {
    name: string,
    type: RoomType,
    createdAt: number;
}

export function RoomCatalog() {

    const { rooms } = useAvailableRoomsContext();
    const [selectedRoomType, setSelectedRoomType] = useState<RoomType>(RoomType.video);

    return (
        <div>

            <div>
                <button onClick={() => setSelectedRoomType(RoomType.video)}>
                    video
                </button>
                <button onClick={() => setSelectedRoomType(RoomType.audio)}>
                    audio
                </button>
                <button onClick={() => setSelectedRoomType(RoomType.text)}>
                    text
                </button>
            </div>

            <Link href="/room">Create a new room +</Link>

            <RoomList rooms={rooms.filter((room) => room.type === selectedRoomType)} />


        </div>
    );
}