import { useEffect, useRef } from "react";

interface AudioTimeVisual {
    stream: MediaStream;
}

export function AudioTimeVisual({ stream }: AudioTimeVisual) {

    const averageAmplitudeRef = useRef<number[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
            return;
        }
        // setup audio analyser
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 1024;
        const bufferLength = analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);

        // start requestAnimationFrame loop
        const canvasCtx = canvasRef.current.getContext("2d");
        const WIDTH = canvasRef.current.width;
        const HEIGHT = canvasRef.current.height;
        if (!canvasCtx) {
            throw new Error(`2D canvas context could not be created`);
        }

        let requestFrameId = 0;
        let frameSamples: number[] = [];
        function draw() {
            requestFrameId = requestAnimationFrame(draw);

            // sample one frame
            const currentFrameValue = sampleCurrentFrame();
            frameSamples.push(currentFrameValue);

            // if enough one-frame samples: update averageAmplitudeRef
            updateAverage();

            // render
            drawAverageAmplitudes();
        };

        function sampleCurrentFrame() {
            analyser.getFloatTimeDomainData(dataArray);
            let sumOfSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const amplitude = dataArray[i];
                sumOfSquares += amplitude * amplitude;
            }

            const meanOfSquares = sumOfSquares / dataArray.length;
            const rms = Math.sqrt(meanOfSquares);
            const scaledRMS = rms * Math.sqrt(analyser.fftSize);

            return scaledRMS;
        }

        function updateAverage() {
            const numberOfSamples = 60;
            if (frameSamples.length > numberOfSamples) {
                let average = frameSamples.reduce((acc, curr) => acc + curr, 0);
                average = average / frameSamples.length;
                averageAmplitudeRef.current.push(average);
                frameSamples = [];
            }
        }

        function drawAverageAmplitudes() {
            console.log(averageAmplitudeRef.current);
        }

        draw();

        return () => {
            window.cancelAnimationFrame(requestFrameId);
        };

    }, [stream]);



    return (
        <div>
            <canvas ref={canvasRef} width={500} height={200} />
        </div>
    );
}