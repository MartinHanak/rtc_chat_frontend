import { Socket } from "socket.io-client";
import { useEffect, useRef, useState, useContext, createContext } from "react";
import { MutableRefObject } from "react";
import { initializeSocket } from "@/app/util/initializeSocket";
import { ServerToClientEvents, ClientToServerEvents } from "@/app/types/socketTypes";

interface SocketContextProvider {
    children: React.ReactNode,
    roomId: string
}

type messageWithSocketId = {
    fromSocketId: string,
    message: string,
    time: number
}

interface SocketContextValue {
    roomId: string,
    socketRef: MutableRefObject<Socket<ServerToClientEvents, ClientToServerEvents> | null> | null,
    userIds: string[]
}

const SocketContext = createContext<SocketContextValue>({ roomId: '', socketRef: null, userIds: [] });

export const useSocketContext = () => useContext(SocketContext);

export function SocketContextProvider({ children, roomId }: SocketContextProvider) {

    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    // websocket state
    const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);

    // state for WebRTC offers, answers, ICE-candidates
    const [offers, setOffers] = useState<Record<string, RTCSessionDescriptionInit>>({});
    const [answers, setAnswers] = useState<Record<string, RTCSessionDescriptionInit>>({});
    const [iceCandidates, setIceCandidates] = useState<Record<string, RTCIceCandidate[]>>({});

    // chat
    const [messages, setMessages] = useState<messageWithSocketId[]>([]);


    // only one socket is active for one room
    useEffect(() => {

        socketRef.current = initializeSocket(roomId);

        // room events
        socketRef.current.on("room-users", (userIds) => {
            setConnectedUserIds((previous) => userIds)
        })

        // webRTC events
        socketRef.current.on("offer", (fromSocketId: string, toSocketId: string, offer) => {

            console.log(`Received WebRTC offer`);

            setOffers((oldOffers) => {
                return {
                    ...oldOffers,
                    [fromSocketId]: offer
                };
            })

        });

        socketRef.current.on("answer", (fromSocketId: string, toSocketId: string, answer) => {

            console.log(`Received WebRTC answer`);
            setAnswers((oldAnswers) => {
                return {
                    ...oldAnswers,
                    [fromSocketId]: answer
                }
            });

        });

        socketRef.current.on("ice-candidate", (fromSocketId: string, toSocketId: string, candidate) => {

            console.log(`Received WebRTC ICE candidate`);
            setIceCandidates((oldCandidates) => {
                if (!oldCandidates[fromSocketId]) {
                    return {
                        ...oldCandidates,
                        [fromSocketId]: [candidate]
                    }
                } else {
                    return {
                        ...oldCandidates,
                        [fromSocketId]: [...oldCandidates[fromSocketId], candidate]
                    }
                }
            });

        })

        // chat events
        socketRef.current.on("message", (fromSocketId: string, message: string, time) => {

            setMessages((previous) => {
                return [...previous, { fromSocketId, message, time }]
            });

        })


        // socket cleanup
        return () => {
            console.log(`SOCKET DISCONNECTING`);

            socketRef.current?.disconnect();
        }


    }, [roomId]);

    return (
        <>{connectedUserIds.length > 0 ?
            <SocketContext.Provider value={{ roomId, socketRef, userIds: connectedUserIds }}>
                {children}
            </SocketContext.Provider>

            :
            <div>
                Socket connecting ....
            </div>
        }</>
    )

}
