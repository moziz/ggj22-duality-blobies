import {Mongo} from "meteor/mongo";
import {Player, PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";


// round states:
// Draw to 5 cards
// Get 3 cards to shop

export interface Game {
    name: string,
    players: Player[],
    player1Hand: Card[],
    player2Hand: Card[],
    player1Deck: Card[],
    player2Deck: Card[],
    player1Discard: Card[],
    player2Discard: Card[],
    shop: Card[],
    player1Score: number,
    player2Score: number,
    roundNumber: number,
    roundScore: number,
    roundStarter: PlayerID,
    roundCards: Card[],
}

export const GameCollection = new Mongo.Collection<Game>('games');
