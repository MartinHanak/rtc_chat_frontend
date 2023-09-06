import { Socket } from "socket.io-client";
import { useEffect, useRef, useState, useContext, createContext } from "react";
import { MutableRefObject } from "react";
import { initializeSocket } from "@/app/util/initializeSocket";
import { ServerToClientEvents, ClientToServerEvents, userInfo } from "@/app/types/socketTypes";
import { useLocalSettingsContext } from "./LocalSettingsContext";

interface SocketContextProvider {
    children: React.ReactNode,
    roomId: string;
}

type messageWithSocketId = {
    fromSocketId: string,
    message: string,
    time: number;
};

interface SocketContextValue {
    roomId: string,
    socketRef: MutableRefObject<Socket<ServerToClientEvents, ClientToServerEvents> | null> | null,
    users: userInfo[],
    offers: Record<string, RTCSessionDescriptionInit>,
    answers: Record<string, RTCSessionDescriptionInit>,
    iceCandidates: Record<string, RTCIceCandidate[]>,
    messages: messageWithSocketId[];
}

const SocketContext = createContext<SocketContextValue>({ roomId: '', socketRef: null, users: [], offers: {}, answers: {}, iceCandidates: {}, messages: [] });

export const useSocketContext = () => useContext(SocketContext);

export function SocketContextProvider({ children, roomId }: SocketContextProvider) {

    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    // websocket state
    const [connectedUsers, setConnectedUsers] = useState<userInfo[]>([]);

    // state for WebRTC offers, answers, ICE-candidates
    const [offers, setOffers] = useState<Record<string, RTCSessionDescriptionInit>>({});
    const [answers, setAnswers] = useState<Record<string, RTCSessionDescriptionInit>>({});
    const [iceCandidates, setIceCandidates] = useState<Record<string, RTCIceCandidate[]>>({});

    // chat
    const [messages, setMessages] = useState<messageWithSocketId[]>([]);

    // username
    const { username } = useLocalSettingsContext();


    // only one socket is active for one room
    useEffect(() => {

        socketRef.current = initializeSocket(roomId, username);

        // room events
        socketRef.current.on("room-users", (users: userInfo[]) => {
            setConnectedUsers(users);
        });

        // webRTC events
        socketRef.current.on("offer", (fromSocketId: string, toSocketId: string, offer) => {

            console.log(`Received WebRTC offer`);

            setOffers((oldOffers) => {
                return {
                    ...oldOffers,
                    [fromSocketId]: offer
                };
            });

        });

        socketRef.current.on("answer", (fromSocketId: string, toSocketId: string, answer) => {

            console.log(`Received WebRTC answer`);
            setAnswers((oldAnswers) => {
                return {
                    ...oldAnswers,
                    [fromSocketId]: answer
                };
            });

        });

        socketRef.current.on("ice-candidate", (fromSocketId: string, toSocketId: string, candidate) => {

            console.log(`Received WebRTC ICE candidate`);
            setIceCandidates((oldCandidates) => {
                if (!oldCandidates[fromSocketId]) {
                    return {
                        ...oldCandidates,
                        [fromSocketId]: [candidate]
                    };
                } else {
                    return {
                        ...oldCandidates,
                        [fromSocketId]: [...oldCandidates[fromSocketId], candidate]
                    };
                }
            });

        });

        // chat events
        socketRef.current.on("message", (fromSocketId: string, message: string, time) => {

            setMessages((previous) => {
                return [...previous, { fromSocketId, message, time }];
            });

        });


        // socket cleanup
        return () => {
            console.log(`SOCKET DISCONNECTING`);

            socketRef.current?.disconnect();
        };


    }, [roomId]);

    return (
        <>{connectedUsers.length > 0 ?
            <SocketContext.Provider value={{ roomId, socketRef, users: connectedUsers, offers, answers, iceCandidates, messages }}>
                {children}
            </SocketContext.Provider>

            :
            <div>
                Socket connecting ....
            </div>
        }</>
    );

}
