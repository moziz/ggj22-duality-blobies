import {Mongo} from "meteor/mongo";
import {Chat} from "/imports/ui/Chat";
import {PlayerID} from "/imports/data/player";
import {Meteor} from "meteor/meteor";

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
    Meteor.call("upsertChatMessage", gameId, message, playerId)
}

export const AddGameMessage = (gameId: string, message: string) => {
    Meteor.call("upsertGameMessage", gameId, message)
}

export const ChatCollection = new Mongo.Collection<Chat>('chat');