import { useRef, useState, useContext, createContext, useEffect } from "react";
import { useSocketContext } from "./SocketContext";

const LocalStreamContext = createContext({});

export const useLocalStreamContext = () => useContext(LocalStreamContext);

interface LocalStreamContext {
    children: React.ReactNode,
    video: boolean,
    audio: boolean
}

export function LocalStreamProvider({ children, video, audio }: LocalStreamContext) {

    const streamRef = useRef<MediaStream | null>(null);
    const [streamReady, setStreamReady] = useState(false);


    useEffect(() => {
        console.log('Preparing local stream');

        (async () => {
            try {
                console.log(`Setting local stream`);

                // check if stream already set
                // otherwise issues with double-render react strict mode
                // because one stream is not cleaned-up and camera does not shut off
                if (streamRef && streamRef.current) {
                    console.log(`Local stream already set`);
                } else {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: audio, video: video });
                    streamRef.current = stream;
                }
                setStreamReady(true);

            } catch (error) {
                console.log(error)
            }
        })();

        const oldStream = streamRef;
        return () => {
            console.log(`Local stream cleanup.`);
            if (oldStream && oldStream.current) {
                oldStream.current.getTracks().forEach((track) => track.stop());
            } else {
                console.log(`No stream or stream.current when local stream cleanup happened.`)
            }

            oldStream.current = null;
        }

    }, [audio, video]);

    return (
        <LocalStreamContext.Provider value={{}}>
            {children}
        </LocalStreamContext.Provider>
    )
}