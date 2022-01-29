import {Card, startDeck, Side} from "/imports/data/card-data";
import {cloneDeep, concat, findIndex} from "lodash";
import {Game, GamePlayerData} from "/imports/data/game";
import {PlayerID} from "/imports/data/player";

const getDefaultPlayer: (player: PlayerID) => GamePlayerData = (player) => {
    return {
        name: player,
        deck: [],
        id: player,
        discard: cloneDeep(startDeck),
        hand: [],
        score: 0,
    }
}

const getOtherPlayer = (p: PlayerID) => p === "p1" ? "p2" : "p1";

export const startNewGame: () => Game = () => {
    const newGame: Game = {
        name: "new game",
        players: {
            p1: getDefaultPlayer("p1"),
            p2: getDefaultPlayer("p2"),
        },
        shop: [],
        roundNumber: 1,
        roundScore: 1,
        roundStarter: Math.random() > 0.5 ? "p1" : "p2",
        roundCards: [],
    }
    return newGame;
}


const reShuffleDeck = (game: Game, player: PlayerID) => {

    if (game.players[player].deck.length > 0) {
        game.players[player].discard = concat(game.players[player].deck, game.players[player].discard);
        game.players[player].deck = [];
    }
    let new_deck = cloneDeep(game.players[player].discard);
    new_deck = shuffle(new_deck);
    game.players[player].deck = new_deck;
    game.players[player].discard = [];
}


const drawCard: (game: Game, player: PlayerID) => Card | undefined = (game: Game, player: PlayerID) => {
    if (game.players[player].deck.length === 0) {
        reShuffleDeck(game, player);
    }
    return game.players[player].deck.pop();
}

export const drawPhase = (game: Game) => {
    for(let player of ["p1", "p2"] as PlayerID[]) {
        while (game.players[player].hand.length < 5) {
            const c = drawCard(game, player);
            if (!c) {
                // empty deck and discard
                break;
            }
            game.players[player].hand.push(c);
        }
    }
}

const getActivePlayer = (game: Game) => {
    if (game.roundCards.length === 0 || game.roundCards.length === 3) {
        return game.roundStarter;
    } else {
        return getOtherPlayer(game.roundStarter);
    }
}

const getPlayedColors: (game: Game) => Record<Side, number> = (game: Game) => {
    const result = {"Dino": 0, "Cat": 0};
    for (const c of game.roundCards) {
        result[c.side] = result[c.side] ? result[c.side] + 1 : 1;
    }
    return result;
}

export const canPlayCard: (game: Game, card: Card, player: PlayerID) => boolean = (game: Game, card: Card, player: PlayerID) => {
    if (getActivePlayer(game) === player) {
        const playedColors = getPlayedColors(game);
        return playedColors[card.side] <= 1;
    }
    return false;
}
export const playCardInGame: (game: Game, card: Card, player: PlayerID) => boolean = (game, card, player) => {
    if (!canPlayCard(game, card, player)) {
        return false;
    }

    const i = findIndex(game.players[player].hand, c => c.name === card.name);
    game.players[player].hand.splice(i, 1);
    game.roundCards.push(card);

    // start new round?
    if (game.roundCards.length > 3) {

    }
    return true;
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
