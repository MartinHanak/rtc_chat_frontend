import { useState, useEffect } from "react";
import { useWebRTCContext } from "./WebRTCContext";
import { Video } from "./Video";
import { useSocketContext } from "./SocketContext";

interface PeerStreamData {
    stream: MediaStream;
    socketId: string;
    username: string;
}

export function PeerStreams() {

    const [displayedStreams, setDisplayedStreams] = useState<PeerStreamData[]>([]);

    const { users } = useSocketContext();
    const { streams, peerStreamReady } = useWebRTCContext();

    useEffect(() => {
        if (!streams) {
            console.log(`Streams not ready`);
            return;
        }

        let newStreams: PeerStreamData[] = [];

        for (const peerStreamIdReady of peerStreamReady) {

            const readyStream = streams.current[peerStreamIdReady];
            const userInfo = users.filter((user) => user.socketId === peerStreamIdReady);

            if (userInfo.length === 1 && readyStream && readyStream instanceof MediaStream) {
                newStreams.push({
                    stream: readyStream,
                    username: userInfo[0].username,
                    socketId: peerStreamIdReady
                });
            }
        }

        console.log(`Displaying stream`);
        setDisplayedStreams(newStreams);

        return () => {
            setDisplayedStreams([]);
        };
    }, [peerStreamReady, streams, users]);

    return (
        <>{

            displayedStreams.map((streamData, index) => {
                return (

                    <Video key={index} stream={streamData.stream} />

                );
            })

        } </>
    );
}