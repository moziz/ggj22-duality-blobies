
import {Mongo} from "meteor/mongo";

export interface Chat {
    messages: [],
}

export const ChatCollection = new Mongo.Collection<Chat>('chat');