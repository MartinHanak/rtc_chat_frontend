import { AvailableRoomsContextProvider } from "./AvailableRoomsContext";
import { RoomCatalog } from "./RoomCatalog";

export function HomePageContent() {

    return (
        <AvailableRoomsContextProvider>
            <h2>Home page</h2>
            < RoomCatalog />
        </AvailableRoomsContextProvider>
    )
}