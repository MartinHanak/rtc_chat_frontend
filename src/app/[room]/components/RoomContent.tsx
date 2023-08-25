import { useSocketContext } from "./SocketContext"


export function RoomContent() {
    const { userIds } = useSocketContext();

    return (
        <div>
            Connected users:

            <ul>
                {userIds.map((id) => <li key={id}>{id}</li>)}
            </ul>
        </div>
    )
}