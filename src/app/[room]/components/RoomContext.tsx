import { LocalSettingsProvider } from "./LocalSettingsContext"
import { LocalStreamProvider } from "./LocalStreamContext"
import { SocketContextProvider } from "./SocketContext"
import { WebRTCContextProvider } from "./WebRTCContext"

interface RoomContext {
    children: React.ReactNode,
    roomId: string
}


export function RoomContext({ children, roomId }: RoomContext) {

    return (
        <LocalSettingsProvider>
            <SocketContextProvider roomId={roomId}>
                <LocalStreamProvider video audio>
                    <WebRTCContextProvider video audio>
                        {children}
                    </WebRTCContextProvider>
                </LocalStreamProvider>
            </SocketContextProvider>
        </LocalSettingsProvider>
    )
}