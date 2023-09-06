import { createContext, useContext, useState } from "react";
import { UsernameInput } from "./UsernameInput";


interface LocalSettingsContextValue {
    username: string;
}

const LocalSettingsContext = createContext<LocalSettingsContextValue>({ username: '' });

export const useLocalSettingsContext = () => useContext(LocalSettingsContext);

interface LocalSettingsContext {
    children: React.ReactNode;
}

export function LocalSettingsProvider({ children }: LocalSettingsContext) {

    const [username, setUsername] = useState(() => getStorageUsername());


    function getStorageUsername() {
        const storedUsername = localStorage.getItem('username');

        if (!storedUsername) {
            return "";
        } else {
            return storedUsername;
        }
    }

    function setAndStoreUsername(input: string) {
        localStorage.setItem('username', input);
        setUsername(input);
    }

    return (
        <LocalSettingsContext.Provider value={{ username }}>
            {
                username === "" ?
                    <UsernameInput setUsername={setAndStoreUsername} />
                    :
                    children
            }
        </LocalSettingsContext.Provider>
    );
}