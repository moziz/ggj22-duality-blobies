import {Card, startDeck, Side} from "/imports/data/card-data";
import {cloneDeep, concat} from "lodash";
import {Game} from "/imports/data/game";
import {PlayerID} from "/imports/data/player";


export const startNewGame: () => Game = () => {
    const newGame: Game = {
        name: "new game",
        players: [{name: "1"}, {name: "2"}],
        player1Hand: [],
        player2Hand: [],
        player1Deck: [],
        player2Deck: [],
        player1Discard: cloneDeep(startDeck),
        player2Discard: cloneDeep(startDeck),
        shop: [],
        player1Score: 0,
        player2Score: 0,
        roundNumber: 1,
        roundScore: 1,
        roundStarter: Math.random() > 0.5 ? "p1" : "p2",
        roundCards: [],
    }
    return newGame;
}

const reShuffleDeck = (game: Game, player: PlayerID) => {
    if (player === "p1") {
        if (game.player1Deck.length > 0) {
            game.player1Discard = concat(game.player1Deck, game.player1Discard);
            game.player1Deck = [];
        }
        let new_deck = cloneDeep(game.player1Discard);
        new_deck = shuffle(new_deck);
        game.player1Deck = new_deck;
    }
    if (player === "p2") {
        if (game.player2Deck.length > 0) {
            game.player2Discard = concat(game.player2Deck, game.player2Discard);
            game.player2Deck = [];
        }
        let new_deck = cloneDeep(game.player2Discard);
        new_deck = shuffle(new_deck);
        game.player2Deck = new_deck;
    }
}

const drawCard: (game: Game, player: PlayerID) => Card | undefined = (game: Game, player: PlayerID) => {
    if (player === "p1") {
        if (game.player1Deck.length === 0) {
            reShuffleDeck(game, player);
        }
        return game.player1Deck.pop();
    }
    if (player === "p2") {
        if (game.player2Deck.length === 0) {
            reShuffleDeck(game, player);
        }
        return game.player2Deck.pop();
    }
}

export const drawPhase = (game: Game) => {
    // player 1
    while (game.player1Hand.length < 5) {
        const c = drawCard(game, "p1");
        if (!c) {
            // empty deck and discard
            break;
        }
        game.player1Hand.push(c);
    }
    // player 2
    while (game.player2Hand.length < 5) {
        const c = drawCard(game, "p2");
        if (!c) {
            // empty deck and discard
            break;
        }
        game.player2Hand.push(c);
    }
}

const activePlayer = (game: Game) => {
    if (game.roundCards.length === 0 || game.roundCards.length === 3) {
        game.roundStarter
    } else {
        return game.roundStarter === "p1" ? "p2" : "p1";
    }
}

const getPlayedColors: (game: Game) => Record<Side, number> = (game: Game) => {
    const result = {"Dino": 0, "Cat": 0};
    for (const c of game.roundCards) {
        result[c.side] = result[c.side] ? result[c.side] + 1 : 1;
    }
    return result;
}

export const canPlayCard = (game: Game, card: Card, player: PlayerID) => {
    const whosTurn = activePlayer(game);
    if (whosTurn === player) {
        const playedColors = getPlayedColors(game);
        if(playedColors[card.side] > 1 ){
            return false;
        }
    }
    return false;

}

function shuffle(array: Array<any>) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}
