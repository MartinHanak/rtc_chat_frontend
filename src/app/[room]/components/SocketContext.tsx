import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

interface SocketContextProvider {
    children: React.ReactNode,
    roomId: string
}

export function SocketContextProvider({ children, roomId }: SocketContextProvider) {

    const socketRef = useRef<Socket | null>(null);

    // websocket state
    const connectedUserIds = useState<string[]>([]);

    // state for WebRTC offers, answers, ICE-candidates
    const [offers, setOffers] = useState<offerWithSocketId[]>([]);
    const [answers, setAnswers] = useState<answerWithSocketId[]>([]);
    const [iceCandidates, setIceCandidates] = useState<iceCandidateWithSocketId[]>([]);

    // chat
    const [messages, setMessages] = useState<messageWithSocketId[]>([]);


    // only one socket is active for one room
    useEffect(() => {

    }, [roomId]);

}


type offerWithSocketId = {
    fromSocketId: string,
    offer: RTCSessionDescriptionInit
}

type answerWithSocketId = {
    fromSocketId: string,
    answer: RTCSessionDescriptionInit
}

type iceCandidateWithSocketId = {
    fromSocketId: string,
    candidate: RTCIceCandidate
}

type messageWithSocketId = {
    fromSocketId: string,
    message: string
}