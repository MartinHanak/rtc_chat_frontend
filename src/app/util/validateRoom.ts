import { Room, RoomType } from "../components/RoomCatalog";

export function validateRoom(roomData: any): roomData is Room {
    return (
        typeof roomData === 'object' &&
        'name' in roomData && typeof roomData.name === 'string' &&
        'createdAt' in roomData && typeof roomData.createdAt === 'number' &&
        'type' in roomData && Object.values(RoomType).includes(roomData.type)
    )

}