import { LocalStreamProvider } from "./LocalStreamContext"
import { SocketContextProvider } from "./SocketContext"

interface RoomContext {
    children: React.ReactNode,
    roomId: string
}


export function RoomContext({ children, roomId }: RoomContext) {

    return (
        <SocketContextProvider roomId={roomId}>
            <LocalStreamProvider video audio>
                {children}
            </LocalStreamProvider>
        </SocketContextProvider>
    )
}