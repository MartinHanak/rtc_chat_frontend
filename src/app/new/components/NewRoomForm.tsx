"use client"
import { RoomType } from "@/app/components/RoomCatalog";
import { FormEvent } from "react";

interface NewRoomForm {
    initialType: RoomType
}

export function NewRoomForm({ initialType }: NewRoomForm) {

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log('Submitting a new room');
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" />

            <label htmlFor="type">Type</label>
            <select name="type" id="type">
                {Object.values(RoomType).map((type) => {
                    return (
                        <option key={type} value={type}>{type}</option>
                    )
                })}
            </select>

            <button type="submit"> Confirm </button>
        </form>
    )
}