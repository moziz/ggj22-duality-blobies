import {Mongo} from "meteor/mongo";

export interface Player {
    name: string
}

export const PlayerCollection = new Mongo.Collection<Player>('players');