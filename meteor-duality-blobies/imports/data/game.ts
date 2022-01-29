import {Mongo} from "meteor/mongo";
import {Player} from "/imports/data/player";
import {ChatMessage} from "/imports/data/chat-message";

export interface Game {
    name: string,
    players: Player[],
    chatlog: ChatMessage[]
}

export const GameCollection = new Mongo.Collection<Game>('games');