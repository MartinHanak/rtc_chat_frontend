import { RoomType } from "../components/RoomCatalog";
import { NewRoomForm } from "./components/NewRoomForm";


export default function Page({ params }: { params: { initialRoomType: RoomType } }) {


    return (
        <div>
            <h2>Create a new room</h2>
            <NewRoomForm initialType={params.initialRoomType} />
        </div>
    )
}