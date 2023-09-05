import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSocketContext } from "./SocketContext";
import { ICE_SERVERS } from "@/app/util/config";
import { useLocalStreamContext } from "./LocalStreamContext";

const WebRTCContext = createContext({});

export const useWebRTCContext = () => useContext(WebRTCContext);

interface WebRTCContextProvider {
    children: React.ReactNode,
    video: boolean,
    audio: boolean
}

export function WebRTCContextProvider({ children, video, audio }: WebRTCContextProvider) {

    const peerConnectionRef = useRef<Record<string, RTCPeerConnection>>({});
    const peerStreamRef = useRef<Record<string, MediaStream>>({});
    const dataChannelRef = useRef<Record<string, RTCDataChannel>>({});

    const [peerStreamReady, setPeerStreamReady] = useState<string[]>([]);
    const [dataChannelReady, setDataChannelReady] = useState<string[]>([]);

    const { socketRef, userIds, offers, answers, iceCandidates } = useSocketContext();

    const { streamRef: localStreamRef } = useLocalStreamContext();


    // connection is limited to 1-to-1 connection
    const createPeerConnection = useCallback((toSocketId: string) => {
        const connection = new RTCPeerConnection(ICE_SERVERS);

        peerConnectionRef.current[toSocketId] = connection;

        // data channels have to be created BEFORE answer/offer
        // https://stackoverflow.com/questions/43788872/how-are-data-channels-negotiated-between-two-peers-with-webrtc/43788873#43788873

        const dataChannel = connection.createDataChannel(toSocketId, { negotiated: true, id: 0, ordered: false });

        dataChannelRef.current[toSocketId] = dataChannel;

        // default is Blob
        // dataChannel.binaryType = 'arraybuffer';

        // data channel events 

        dataChannel.addEventListener('open', (event) => {
            console.log(`Data channel opened`);
            setDataChannelReady((previous) => [...previous, toSocketId]);
        });

        dataChannel.addEventListener('close', (event) => {
            console.log(`Data channel closed`);
        });

        dataChannel.addEventListener('message', (event) => {
            console.log(`Data channel message received`);
            console.log(event.data);
        });

        // connection events

        connection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {

            if (event.candidate) {

                if (socketRef && socketRef.current) {
                    socketRef.current.emit("ice-candidate", socketRef.current.id, toSocketId, event.candidate);
                } else {
                    console.log(`Socket not ready when ice-candidate event triggered.`)
                }

            }
        }

        connection.ontrack = (event: RTCTrackEvent) => {

            // only add if it does not exist yet
            if (!(toSocketId in peerStreamRef.current)) {
                console.log(`Adding a peer stream`);

                peerStreamRef.current[toSocketId] = event.streams[0];

                setPeerStreamReady((previous) => [...previous, toSocketId]);
            }

        }

        return connection;
    }, [socketRef]);


    // creating a WebRTC offer = calling
    useEffect(() => {
        // only one side calls, other side sends an answer
        const handleCall = (toSocketId: string) => {
            console.log(`Initializing WebRTC call to the socket ${toSocketId}.`);

            const connection = createPeerConnection(toSocketId);

            if (localStreamRef && localStreamRef.current) {

                if (audio) {
                    connection.addTrack(
                        localStreamRef.current.getAudioTracks()[0],
                        localStreamRef.current
                    );
                }

                if (video) {
                    connection.addTrack(
                        localStreamRef.current.getVideoTracks()[0],
                        localStreamRef.current
                    );
                }
            } else {
                console.log(`Local stream not ready while initiating WebRTC call.`)
                return;
            }

            // send WebRTC connection offer
            (async () => {
                try {
                    const offer = await connection.createOffer();

                    connection.setLocalDescription(offer);

                    if (socketRef && socketRef.current) {
                        console.log('Sending WebRTC offer')
                        socketRef.current.emit('offer', socketRef.current.id, toSocketId, offer)
                    } else {
                        throw new Error(`Socket not ready while emitting offer.`)
                    }

                } catch (error) {
                    console.log(error);
                }
            })();
        }

        // handle call when new user connects
        // userIds given in insertion order (guaranteed by the server)
        // only create offers for ids from 'current id' up to the end of the array
        let startMakingOffers = false;
        for (const userId of userIds) {
            // caller cannot call himself
            if (userId === socketRef?.current?.id) {
                startMakingOffers = true;
                continue;
            }

            // do not send offers to ids joined before you, only ids joined after you
            if (!startMakingOffers) {
                continue;
            }

            // new call only if connection not already created
            if (!(userId in peerConnectionRef.current)) {
                console.log(`Making WebRTC call from ${socketRef?.current?.id} to ${userId}.`)
                handleCall(userId);
            }
        }

    }, [userIds, audio, video, createPeerConnection, localStreamRef, socketRef]);


    // handle received offers by sending an answer
    useEffect(() => {
        const handleOffer = (fromSocketId: string, offer: RTCSessionDescriptionInit) => {
            const connection = createPeerConnection(fromSocketId);

            if (localStreamRef && localStreamRef.current) {

                if (audio) {
                    connection.addTrack(
                        localStreamRef.current.getAudioTracks()[0],
                        localStreamRef.current
                    );
                }

                if (video) {
                    connection.addTrack(
                        localStreamRef.current.getVideoTracks()[0],
                        localStreamRef.current
                    );
                }
            } else {
                console.log(`Local stream not ready while initiating WebRTC call.`)
                return;
            }

            connection.setRemoteDescription(offer);

            // send an answer
            (async () => {
                try {
                    const answer = await connection.createAnswer();
                    connection.setLocalDescription(answer);

                    if (socketRef && socketRef.current) {
                        console.log(`Sending WebRTC answer`)
                        socketRef.current.emit("answer", socketRef.current.id, fromSocketId, answer)
                    } else {
                        throw new Error(`Socket not ready when sending WebRTC answer`)
                    }
                } catch (error) {
                    console.log(error)
                }
            })();
        }

        // react to new offers
        for (const offerUserId in offers) {

            if (!(offerUserId in peerConnectionRef.current)) {
                console.log(`Reacting to an offer by creating an answer.`);
                handleOffer(offerUserId, offers[offerUserId]);
            }
        }

    }, [offers, audio, video, createPeerConnection, localStreamRef, socketRef]);


    // handle received answers
    useEffect(() => {

        for (const answerUserId in answers) {

            if (!(answerUserId in peerConnectionRef.current)) {
                console.log(`No connection with socketId: ${answerUserId} found when answer received`);
                continue;
            }

            const existingConnection = peerConnectionRef.current[answerUserId];

            if (!existingConnection.remoteDescription) {
                existingConnection.setRemoteDescription(answers[answerUserId])
                    .then(() => console.log(`Answer successfully set as remote description.`))
                    .catch((err) => console.log(err))
            }
        }

    }, [answers]);

    // handle incoming ICE candidates
    useEffect(() => {

        for (const iceCandidateUserId in iceCandidates) {

            if (!(iceCandidateUserId in peerConnectionRef.current)) {
                console.log(`No connection with socketId: ${iceCandidateUserId} found when ice-candidate received.`)
                continue;
            }

            const existingConnection = peerConnectionRef.current[iceCandidateUserId];

            for (const candidate of iceCandidates[iceCandidateUserId]) {
                const newIceCandidate = new RTCIceCandidate(candidate);

                existingConnection.addIceCandidate(newIceCandidate)
                    .then(() => console.log(`ICE candidate added successfully`))
                    .catch((err) => console.log(err))
            }
        }
    }, [iceCandidates])

    // combined WebRTC context cleanup
    useEffect(() => {
        const oldStreamRef = peerStreamRef;
        const oldConnectionRef = peerConnectionRef;
        return () => {
            console.log('WebRTC context cleanup');

            for (const streamUserId in oldStreamRef.current) {
                oldStreamRef.current[streamUserId]
                    .getTracks()
                    .forEach((track) => track.stop())
            }

            for (const connectionUserId in oldConnectionRef.current) {
                let connection = oldConnectionRef.current[connectionUserId]
                connection.ontrack = null;
                connection.onicecandidate = null;
                connection.close()
            }
            oldConnectionRef.current = {};
        }
    }, []);

    return (
        <WebRTCContext.Provider value={{}}>
            {children}
        </WebRTCContext.Provider>
    )
}