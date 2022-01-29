import {Player} from "/imports/data/player";

export interface ChatMessage {
    player: Player,
    message: string,
    timestamp: Date
}