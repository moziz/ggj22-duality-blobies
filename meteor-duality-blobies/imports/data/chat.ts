import {Mongo} from "meteor/mongo";
import {Chat} from "/imports/ui/Chat";
import {PlayerID} from "/imports/data/player";

interface Message {
    message: string;
    playerId?: PlayerID;
    timestamp: Date;
}


export interface Chat {
    _id?: string,
    messages: Message[],
}


export const AddChatMessage = (gameId: string, message: string, playerId: PlayerID) => {
    ChatCollection.upsert({_id: gameId}, {
        $push: {
            messages: {
                message: message,
                playerId: playerId ? playerId : undefined,
                timestamp: new Date(),
            },
        },
    })
}

export const AddGameMessage = (gameId: string, message: string) => {
    ChatCollection.upsert({_id: gameId}, {
        $push: {
            messages: {
                message: message,
                timestamp: new Date(),
            },
        },
    })
}

export const ChatCollection = new Mongo.Collection<Chat>('chat');
