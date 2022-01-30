import React, {useState} from 'react';
import {Game} from "/imports/data/game";
import {useTracker} from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import {AddChatMessage, ChatCollection} from "/imports/data/chat";
import {PlayerID} from "/imports/data/player";
import {Button, InputGroup} from "react-bootstrap";
import {Variant} from "/imports/data/utils";

interface ChatProps {
    game: Game,
    clientPlayer?: PlayerID
}

const useChat = (gameId: string = "", playerId?: PlayerID) => useTracker(() => {
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

    const {isLoading, chatObject} = useChat(game.name, clientPlayer);
    const [chatMessage, setChatMessage] = useState("")

    const addMessage = React.useCallback((playerId, message) => {
        if (playerId && message) {
            AddChatMessage(game.name, message, playerId)
        }
        setChatMessage("")
    }, [game, clientPlayer])

    if (!isLoading) {
        return (
            <div className={"row p-2"}>
                <h2>Messages</h2>
                <form className={"d-flex"}
                      onSubmit={(e) => {
                          e.preventDefault();
                          addMessage(clientPlayer, chatMessage)
                      }}
                >
                    <InputGroup>
                        <Button variant={Variant.success} disabled={!clientPlayer} onClick={(e) => {
                            e.preventDefault();
                            addMessage(clientPlayer, chatMessage)
                        }}>
                            Send
                        </Button>
                        <input
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)} type="text"
                            className="form-control"
                        />
                    </InputGroup>
                </form>
                {[...(chatObject?.messages ?? [])].reverse().map((message, idx) =>
                    <div key={idx} style={!message.playerId ? {fontWeight: 'bold'} : undefined}>
                        {message.timestamp ? message.timestamp.toLocaleString() : "unknown time"} : {message.playerId ? message.playerId : "GAME"} : {message.message}
                    </div>,
                )}
            </div>
        );
    } else {
        return <div>loading</div>
    }
};
