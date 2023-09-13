import { useEffect, useRef } from "react";

interface AudioTimeVisual {
    stream: MediaStream;
}


type AudioAmplitude = {
    time: number,
    amplitude: number;
};

export function AudioTimeVisual({ stream }: AudioTimeVisual) {

    const averageAmplitudeRef = useRef<AudioAmplitude[]>([]);
    const maximumAmplitude = useRef(1);
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

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        const bufferLength = analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);

        // start requestAnimationFrame loop
        const canvasCtx = canvasRef.current.getContext("2d");
        const WIDTH = canvasRef.current.width;
        const HEIGHT = canvasRef.current.height;

        let requestFrameId = 0;
        let frameSamples: AudioAmplitude[] = [];
        let simulationTime = 0;
        function draw(renderTimeStart: number) {
            if (!canvasCtx) {
                throw new Error(`2D canvas context could not be created`);
            }

            const delta = renderTimeStart - simulationTime;

            simulationTime += delta;

            requestFrameId = requestAnimationFrame(draw);

            // reset previous frame 
            canvasCtx.fillStyle = "rgb(255, 255, 255)";
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            // sample one frame
            const currentFrameValue = sampleCurrentFrame();
            frameSamples.push({
                time: simulationTime,
                amplitude: currentFrameValue
            });

            // if enough one-frame samples: update averageAmplitudeRef
            updateAverage();

            // render
            drawAverageAmplitudes(canvasCtx, simulationTime);

            // remove values that are too old
            resetOldData();
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
            // 1 sample = 1 frame = approx 16 ms
            const numberOfSamples = 1;
            if (frameSamples.length >= numberOfSamples) {
                let sum = frameSamples.reduce((acc, curr) => acc + curr.amplitude, 0);
                let average = sum / frameSamples.length;

                let timeSum = frameSamples.reduce((acc, curr) => acc + curr.time, 0);
                let timeAverage = timeSum / frameSamples.length;

                averageAmplitudeRef.current.push({ time: timeAverage, amplitude: average });

                if (average > maximumAmplitude.current) {
                    maximumAmplitude.current = average;
                }
                frameSamples = [];
            }
        }

        function drawAverageAmplitudes(context: CanvasRenderingContext2D, simulationTime: number) {
            console.log(averageAmplitudeRef.current);

            const maxAmplitudesDisplayed = 60;

            const totalScreenTimePerAmplitude = 1000; // in ms

            const startIndex = Math.max(0, (averageAmplitudeRef.current.length - 1) - maxAmplitudesDisplayed);
            const endIndex = Math.min(startIndex + maxAmplitudesDisplayed, averageAmplitudeRef.current.length - 1);

            const barWidth = averageAmplitudeRef.current.length > 2 ?
                (averageAmplitudeRef.current[averageAmplitudeRef.current.length - 1].time -
                    averageAmplitudeRef.current[averageAmplitudeRef.current.length - 2].time) / totalScreenTimePerAmplitude * WIDTH
                : 1;


            for (let i = startIndex; i <= endIndex; i++) {

                const timeDifference = simulationTime - averageAmplitudeRef.current[i].time;
                if (timeDifference > totalScreenTimePerAmplitude) {
                    //console.log('Too long ago');
                    continue;
                }

                const amplitude = averageAmplitudeRef.current[i].amplitude / maximumAmplitude.current * HEIGHT / 2;

                const xPosition = (1 - (timeDifference) / totalScreenTimePerAmplitude) * WIDTH;
                const yPosition = HEIGHT / 2;
                context.fillStyle =
                    "rgb(" + Math.floor(amplitude + 100) + ",50,50)";
                context.fillRect(xPosition, yPosition, barWidth, amplitude);
            }
        }

        function resetOldData() {
            let dataLength = averageAmplitudeRef.current.length;
            if (dataLength > 1000) {
                averageAmplitudeRef.current = averageAmplitudeRef.current.slice(dataLength - 100, dataLength);
            }

            let maximum = 0;
            for (const amplitudeData of averageAmplitudeRef.current) {
                if (amplitudeData.amplitude > maximum) {
                    maximum = amplitudeData.amplitude;
                }
            }
            maximumAmplitude.current = Math.max(maximum, 1);
        }

        window.requestAnimationFrame(draw);

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