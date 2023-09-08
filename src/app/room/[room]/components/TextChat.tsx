"use client";
import { FormEvent, useState } from "react";
import { useSocketContext } from "./SocketContext";

export function TextChat() {

    const { messages, socketRef } = useSocketContext();

    const [input, setInput] = useState('');

    function handleSendMessage(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (socketRef && socketRef.current) {
            socketRef.current.emit('message', socketRef.current.id, input, Date.now());
            setInput('');
        } else {
            console.log(`Websocket not connected`);
        }

    }

    return (
        <div>
            {messages.map((messageInfo, index) => {

                return (
                    <div key={`${messageInfo.fromSocketId}_${messageInfo.time}`}>
                        <span>{messageInfo.username}</span>
                        <span>{messageInfo.message}</span>
                    </div>
                );
            })}
            <form onSubmit={handleSendMessage}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}