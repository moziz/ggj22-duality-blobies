import {Mongo} from "meteor/mongo";
import {Chat} from "/imports/ui/Chat";

export interface Chat {
    messages: [],
}

export const AddChatMessage = (gameId: string, message: string, playerId: string) => {
    ChatCollection.upsert({_id: gameId}, {
        $push: {
            messages: {
                message: message,
                playerId: playerId ? playerId : undefined,
                timestamp: new Date()
            }
        }
    })
}

export const AddGameMessage = (gameId: string, message: string) => {
    ChatCollection.upsert({_id: gameId}, {
        $push: {
            messages: {
                message: message,
                timestamp: new Date()
            }
        }
    })
}

export const ChatCollection = new Mongo.Collection<Chat>('chat');