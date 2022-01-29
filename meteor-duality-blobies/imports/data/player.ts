import {Mongo} from "meteor/mongo";

export type PlayerID = "p1" | "p2"

export interface Player {
    name: string,
}

export const PlayerCollection = new Mongo.Collection<Player>('players');
