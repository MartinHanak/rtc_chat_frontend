"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Room } from "./RoomCatalog";
import { BACKEND_URL } from "../util/config";
import { validateRoom } from "../util/validateRoom";

type AvailableRoomsContextStatus = 'loading' | 'listening' | 'error';

interface AvailableRoomsContextValue {
    rooms: Room[];
    status: AvailableRoomsContextStatus;
}

const AvailableRoomsContext = createContext<AvailableRoomsContextValue>({ rooms: [], status: 'loading' });

export const useAvailableRoomsContext = () => useContext(AvailableRoomsContext);

interface AvailableRoomsContextProvider {
    children: React.ReactNode,
}

export function AvailableRoomsContextProvider({ children }: AvailableRoomsContextProvider) {

    const EventSourceRef = useRef<EventSource | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [status, setStatus] = useState<AvailableRoomsContextStatus>('loading');

    useEffect(() => {

        EventSourceRef.current = new EventSource(`${BACKEND_URL}/api/roomSSE`);

        EventSourceRef.current.onopen = (e) => {
            console.log(`EventSource opened`);
            setStatus('listening');
        };

        EventSourceRef.current.onmessage = (e) => {
            const jsonData = JSON.parse(e.data);

            if (!Array.isArray(jsonData)) {
                console.log(`Incoming EventSource data is not an array`);
                return;
            }

            let rooms: Room[] = [];

            for (const roomData of jsonData) {
                if (validateRoom(roomData)) {
                    rooms.push(roomData);
                } else {
                    console.log('Incoming data are not a valid room', roomData);
                }
            }

            console.log(rooms);
            setRooms(rooms);
        };

        EventSourceRef.current.onerror = (e) => {
            console.log(`Error occurred while attempting to connect the EventSource.`);
            setStatus('error');
        };

        return () => {
            EventSourceRef.current?.close();
            EventSourceRef.current = null;
        };

    }, []);

    return (
        <AvailableRoomsContext.Provider value={{ rooms, status }}>
            {children}
        </AvailableRoomsContext.Provider>
    );
}