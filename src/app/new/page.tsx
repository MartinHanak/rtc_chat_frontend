import { RoomType } from "../components/RoomCatalog";


export default function Page({ params }: { params: { initialRoomType: RoomType } }) {
    return (
        <div>
            <h2>Create a new room</h2>
        </div>
    )
}