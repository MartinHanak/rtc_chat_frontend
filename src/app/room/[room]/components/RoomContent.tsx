import { userInfo } from "@/app/types/socketTypes";
import { useSocketContext } from "./SocketContext";


export function RoomContent() {
    const { users } = useSocketContext();

    return (
        <div>
            Connected users:

            <ul>
                {users.map((user: userInfo) => <li key={user.socketId}>{user.username}</li>)}
            </ul>
        </div>
    );
}