import {startDeck} from "/imports/data/card-data";
import {cloneDeep} from "lodash";
import {Game} from "/imports/data/game";


export const startNewGame: () => Game = () => {
    const newGame: Game = {
        name: "new game",
        players: [{name: "1"}, {name: "2"}],
        player1Hand: [],
        player2Hand: [],
        player1Deck: cloneDeep(startDeck),
        player2Deck: cloneDeep(startDeck),
        player1Discard: [],
        player2Discard: [],
        shop: [],
        player1Score: 0,
        player2Score: 0,
        roundNumber: 1,
        roundScore: 1,
        roundStarter: Math.random() > 0.5 ? "player1" : "player2",
    }
    return newGame;
}
