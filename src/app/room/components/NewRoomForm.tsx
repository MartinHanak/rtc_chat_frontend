"use client";
import { RoomType } from "@/app/components/RoomCatalog";
import { BACKEND_URL } from "@/app/util/config";
import { FormEvent, useState } from "react";

interface NewRoomForm {
    initialType: RoomType;
}

export function NewRoomForm({ initialType }: NewRoomForm) {

    const [name, setName] = useState<string>('');
    const [type, setType] = useState<RoomType>(initialType);


    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        fetch(`${BACKEND_URL}/api/room`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                type
            })
        }).then((res) => {
            if (res.ok) {
                console.log(`Room ${name} created.`);
            } else {
                throw new Error(`Room with the name ${name} already exists.`);
            }
        }).catch((err) => console.log(err));

    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} />

            <label htmlFor="type">Type</label>
            <select name="type" id="type" value={type} onChange={(e) => setType(e.target.value as RoomType)}>
                {Object.values(RoomType).map((type) => {
                    return (
                        <option key={type} value={type}>{type}</option>
                    );
                })}
            </select>

            <button type="submit"> Confirm </button>
        </form>
    );
}