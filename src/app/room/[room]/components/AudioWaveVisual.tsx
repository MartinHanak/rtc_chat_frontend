"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalStreamContext } from "./LocalStreamContext";

type visualType = 'wave' | 'frequency';

export function AudioWaveVisual() {

    const { streamRef } = useLocalStreamContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [state, setState] = useState<visualType>('wave');

    useEffect(() => {
        if (!streamRef || !streamRef.current || !canvasRef || !canvasRef.current) {
            return;
        }

        // follow: https://mdn.github.io/voice-change-o-matic-float-data/
        // app.js file
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();

        const source = audioCtx.createMediaStreamSource(streamRef.current);
        source.connect(analyser);

        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;

        const distortion = audioCtx.createWaveShaper();
        const gainNode = audioCtx.createGain();
        const biquadFilter = audioCtx.createBiquadFilter();
        const convolver = audioCtx.createConvolver();

        analyser.connect(distortion);
        distortion.connect(biquadFilter);
        biquadFilter.connect(convolver);
        convolver.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // wave specific
        // distortion curve for the waveshaper, thanks to Kevin Ennis
        // http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

        function makeDistortionCurve(amount: any) {
            var k = typeof amount === "number" ? amount : 50,
                n_samples = 44100,
                curve = new Float32Array(n_samples),
                deg = Math.PI / 180,
                i = 0,
                x;
            for (; i < n_samples; ++i) {
                x = (i * 2) / n_samples - 1;
                curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }

        let requestFrameId = 0;
        if (state === 'frequency') {
            // frequency bar specific
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);


            // draw
            const canvasCtx = canvasRef.current.getContext("2d");
            const WIDTH = canvasRef.current.width;
            const HEIGHT = canvasRef.current.height;

            if (!canvasCtx) {
                throw new Error(`2D canvas context could not be created`);
            }
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            const draw = () => {
                if (!canvasCtx) {
                    throw new Error(`2D canvas context could not be created`);
                }
                requestFrameId = requestAnimationFrame(draw);
                analyser.getFloatFrequencyData(dataArray);
                canvasCtx.fillStyle = "rgb(255, 255, 255)";
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                const barWidth = (WIDTH / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] + 140) * 2;

                    canvasCtx.fillStyle =
                        "rgb(" + Math.floor(barHeight + 100) + ",50,50)";
                    canvasCtx.fillRect(
                        x,
                        HEIGHT - barHeight / 2,
                        barWidth,
                        barHeight / 2
                    );

                    x += barWidth + 1;
                }
            };

            // start animation
            draw();
        } else if (state === 'wave') {
            // draw
            const canvasCtx = canvasRef.current.getContext("2d");
            const WIDTH = canvasRef.current.width;
            const HEIGHT = canvasRef.current.height;

            // wave specific
            analyser.fftSize = 1024;
            const bufferLength = analyser.fftSize;
            const dataArray = new Float32Array(bufferLength);

            if (!canvasCtx) {
                throw new Error(`2D canvas context could not be created`);
            }
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            const draw = () => {
                requestFrameId = requestAnimationFrame(draw);

                analyser.getFloatTimeDomainData(dataArray);

                canvasCtx.fillStyle = "rgb(200, 200, 200)";
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = "rgb(0, 0, 0)";

                canvasCtx.beginPath();

                var sliceWidth = (WIDTH * 1.0) / bufferLength;
                var x = 0;

                for (var i = 0; i < bufferLength; i++) {
                    var v = dataArray[i] * 200.0;
                    var y = HEIGHT / 2 + v;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasCtx.lineTo(WIDTH, HEIGHT / 2);
                canvasCtx.stroke();
            };

            // start animation
            draw();
        }

        return () => {
            window.cancelAnimationFrame(requestFrameId);
        };

    }, [streamRef, state]);

    return (
        <div>
            <canvas ref={canvasRef} width={500} height={200} />
        </div>
    );
}