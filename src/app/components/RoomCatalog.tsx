"use client"

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../util/config";
import { isArrayTypeNode } from "typescript";
import { validateRoom } from "../util/validateRoom";
import { RoomList } from "./RoomList";

export enum RoomType {
    video = 'video',
    audio = 'audio',
    text = 'text'
}

export interface Room {
    name: string,
    type: RoomType,
    createdAt: number
}

export function RoomCatalog() {

    const [rooms, setRooms] = useState<Room[]>([]);

    const [selectedRoomType, setSelectedRoomType] = useState<RoomType>(RoomType.video);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let controller = new AbortController();
        const signal = controller.signal;
        setLoading(true);

        fetch(`http://${BACKEND_URL}/api/room`, { signal })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Response was not ok when fetching the rooms.`)
                }

                return res.json()
            })
            .then((jsonData) => {

                if (!Array.isArray(jsonData)) {
                    throw new Error(`Rooms response is not an array`)
                }

                let rooms: Room[] = [];

                for (const roomData of jsonData) {
                    if (!validateRoom(roomData)) {
                        continue;
                    } else {
                        rooms.push(roomData);
                    }
                }

                setRooms(rooms);
            })
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));

        return () => {
            controller.abort();
        }

    }, [])


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

            <button>Create a new room +</button>

            {loading ?
                <div>Loading Rooms</div>
                :
                <RoomList rooms={rooms.filter((room) => room.type === selectedRoomType)} />
            }

        </div>
    )
}