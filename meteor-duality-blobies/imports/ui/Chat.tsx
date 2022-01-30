import React, {useState} from 'react';
import {Game} from "/imports/data/game";
import {useTracker} from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import {ChatCollection} from "/imports/data/chat";
import {PlayerID} from "/imports/data/player";

interface ChatProps {
    game: Game,
    clientPlayer: PlayerID
}

const useChat = (gameId: string = "", playerId: PlayerID) => useTracker(() => {
    const subscription = Meteor.subscribe('chat', gameId)
    let chatObject = ChatCollection.findOne({_id: gameId})
    if (chatObject === undefined && subscription.ready()) {
        chatObject = {_id: gameId, messages: []}
        ChatCollection.upsert({_id: gameId}, chatObject)
    }
    return {
        chatObject: chatObject,
        isLoading: !subscription.ready(),
    }
}, [gameId, playerId])

export const Chat: React.FC<ChatProps> = ({game, clientPlayer}) => {
    console.log(clientPlayer)

    const {isLoading, chatObject} = useChat(game.name, clientPlayer);
    const [chatMessage, setChatMessage] = useState("")

    const addMessage = React.useCallback((playerId, message) => {
        if(playerId && message) {
            ChatCollection.upsert({_id: game.name}, {
                $push: {
                    messages: {
                        message: message,
                        playerId: playerId,
                        timestamp: new Date()
                    }
                }
            })
        }
        setChatMessage("")
    }, [game, clientPlayer])

    if(!isLoading) {
        return (
            <div>
                {chatObject.messages.map((message, idx) =>
                    <div key={idx}>{message.timestamp ? message.timestamp.toLocaleString() : "unknown time"} : {message.playerId ? message.playerId : "unknown player"} : {message.message}</div>
                )}
                <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} type="text"
                       className="form-control"/>
                <button className="btn btn-success" disabled={!clientPlayer} onClick={(e) => {
                    e.preventDefault();
                    addMessage(clientPlayer, chatMessage)
                }}>Send
                </button>
            </div>
        );
    }
    else {
        return <div>loading</div>
    }
};
