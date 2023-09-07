import { userInfo } from "@/app/types/socketTypes";
import { useSocketContext } from "./SocketContext";
import { useLocalStreamContext } from "./LocalStreamContext";
import { Video } from "./Video";


export function RoomContent() {

    const { users } = useSocketContext();

    const { streamRef } = useLocalStreamContext();

    return (
        <div>
            Connected users:

            <ul>
                {users.map((user: userInfo) => <li key={user.socketId}>{user.username}</li>)}
            </ul>

            {/* Local Stream */}
            {streamRef && streamRef.current && <Video stream={streamRef.current} />}
        </div>
    );
}