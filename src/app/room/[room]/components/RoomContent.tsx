import { userInfo } from "@/app/types/socketTypes";
import { useSocketContext } from "./SocketContext";
import { useLocalStreamContext } from "./LocalStreamContext";
import { Video } from "./Video";
import { PeerStreams } from "./PeerStreams";
import { AudioVisual } from "./AudioVisual";
import { TextChat } from "./TextChat";


export function RoomContent() {

    const { users } = useSocketContext();

    const { streamRef } = useLocalStreamContext();

    return (
        <div>
            Connected users:

            <ul>
                {users.map((user: userInfo) => <li key={user.socketId}>{user.username}</li>)}
            </ul>

            <TextChat />

            {/* Local Stream */}
            {streamRef && streamRef.current && <>
                <AudioVisual stream={streamRef.current} />
                <Video stream={streamRef.current} />
            </>}

            {/* Peer Streams */}
            <PeerStreams />
        </div>
    );
}