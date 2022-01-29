import {Mongo} from "meteor/mongo";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";


// round states:
// Draw to 5 cards
// Get 3 cards to shop

export interface Game {
    name: string,
    shop: Card[],
    roundNumber: number,
    roundScore: number,
    roundStarter: PlayerID,
    roundCards: Card[],
    players: {
        "p1": GamePlayerData,
        "p2": GamePlayerData,
    },
}

export interface GamePlayerData {
    id: PlayerID,
    name: string,
    hand: Card[],
    deck: Card[],
    discard: Card[],
    score: number,
}

export const GameCollection = new Mongo.Collection<Game>('games');
