import { useRef, useState, useContext, createContext, useEffect } from "react";
import { MutableRefObject } from "react";

interface LocalStreamContextValue {
    streamRef: MutableRefObject<MediaStream | null> | null
}

const LocalStreamContext = createContext<LocalStreamContextValue>({ streamRef: null });

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
                if (streamRef && streamRef.current) {
                    console.log(`Local stream already set`);
                } else {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: audio, video: video });
                    streamRef.current = stream;
                    setStreamReady(true);
                }

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


    // WebRTC context needs data from the local stream
    return (
        <LocalStreamContext.Provider value={{ streamRef }}>
            {streamReady ? children : <div> Loading stream...</div>}
        </LocalStreamContext.Provider>
    )
}