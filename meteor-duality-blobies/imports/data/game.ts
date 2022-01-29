import {Mongo} from "meteor/mongo";

export interface Game {
    name: string
}

export const GameCollection = new Mongo.Collection<Game>('games');