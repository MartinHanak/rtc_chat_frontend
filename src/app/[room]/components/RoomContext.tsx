import { SocketContextProvider } from "./SocketContext"

interface RoomContext {
    children: React.ReactNode,
    roomId: string
}


export function RoomContext({ children, roomId }: RoomContext) {

    return (
        <SocketContextProvider roomId={roomId}>
            {children}
        </SocketContextProvider>
    )
}