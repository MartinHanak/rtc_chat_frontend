export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface RTCPeerConnectionConfig {
    iceServers: RTCIceServer[]
}

export const ICE_SERVERS: RTCPeerConnectionConfig = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                //'stun:stun3.l.google.com:19302',
                //'stun:stun4.l.google.com:19302'
            ]
        }
    ],
};
