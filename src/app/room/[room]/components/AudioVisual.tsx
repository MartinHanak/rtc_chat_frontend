import { useEffect, useState } from "react";

// types do not work with normal imports, have to use require
// https://stackoverflow.com/questions/41292559/could-not-find-a-declaration-file-for-module-module-name-path-to-module-nam
//const moduleTest = require('react-audio-visualize');
//const { LiveAudioVisualizer } = moduleTest;
// @ts-ignore
import { LiveAudioVisualizer } from 'react-audio-visualize';


interface AudioVisual {
    stream: MediaStream;
}

export function AudioVisual({ stream }: AudioVisual) {

    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

    useEffect(() => {
        const recorderFromMedia = new MediaRecorder(stream);
        recorderFromMedia.start();
        setMediaRecorder(recorderFromMedia);
    }, [stream]);


    // settings: https://www.npmjs.com/package/react-audio-visualize
    return (
        <div>

            {mediaRecorder && <LiveAudioVisualizer
                mediaRecorder={mediaRecorder}
                width={200}
                height={75}
                fftSize={512}
                maxDecibels={-40}
                minDecibels={-120}
            />}
        </div>
    );

}


