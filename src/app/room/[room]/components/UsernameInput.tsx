import { useState } from "react";

interface UsernameInput {
    setUsername: (input: string) => void
}

export function UsernameInput({ setUsername }: UsernameInput) {

    const [inputUsername, setInputUsername] = useState('')

    return (
        <div>
            <label htmlFor="username">Select Username</label>
            <input type="text" name="username" id="username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
            ></input>
            <button onClick={() => setUsername(inputUsername)}>Confirm</button>
        </div>
    )
}