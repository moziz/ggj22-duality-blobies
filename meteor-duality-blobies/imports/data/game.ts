import {Mongo} from "meteor/mongo";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";

export type RoundEffectName = "None" | "Mute";

export interface RoundEffect {
    effect: RoundEffectName,
    duration: number,
}

export interface Game {
    _id?: string,
    name: string,
    shop: {
        offers: Card[],
        active: boolean,
        firstGotOne: boolean,
        secondGotOne: boolean,
    },
    roundNumber: number,
    roundScore: number,
    roundStarter: PlayerID,
    roundEffects: RoundEffect[],
    roundCards: (Card | undefined)[],
    players: Record<PlayerID, GamePlayerData>,
    message: string,
    latestWinner: PlayerID,
    version: number,
    roundsToWin: number,
}

export interface GamePlayerData {
    id: PlayerID,
    name: string,
    hand: Card[],
    deck: Card[],
    discard: Card[],
    score: number,
}

export interface GameOptions{
    p1Name:string,
    p2Name:string,
    alternativeDeck:boolean,
    rounds:number,
}

export const GameCollection = new Mongo.Collection<Game>('games');
