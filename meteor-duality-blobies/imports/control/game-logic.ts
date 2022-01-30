import {Card, startDeck, Side, getShopPool} from "/imports/data/card-data";
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
        shop: {
            offers: cloneDeep(getShopPool(3)),
            active: false,
            firstGotOne: false,
            secondGotOne: false,
        },
        roundNumber: 1,
        roundScore: 1,
        roundStarter: Math.random() > 0.5 ? "p1" : "p2",
        roundCards: [],
        message: "",
        latestWinner: Math.random() > 0.5 ? "p1" : "p2",
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
    for (let player of ["p1", "p2"] as PlayerID[]) {
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


export const handlePurchase = (game: Game, card: Card, player: PlayerID) => {
    // remove from shop
    const i = findIndex(game.shop.offers, c => c.name === card.name);
    game.shop.offers.splice(i, 1);
    game.players[player].discard.push(card);

    game.shop.firstGotOne = game.shop.offers.length < 3;
    game.shop.secondGotOne = game.shop.offers.length < 2;

    // if both purchased, then next round
    if (game.shop.firstGotOne && game.shop.secondGotOne) {
        game.shop.active = false;
        nextRound(game);
    }
}


export const getPlayersPower = (game: Game) => {
    if (game.roundCards.length < 4) {
        throw new Error("Dont end round if less than 4 cards!");
    }
    const startPlayerPower = game.roundCards[0].power + game.roundCards[3].power;
    const secondPlayerPower = game.roundCards[1].power + game.roundCards[2].power;
    return game.roundStarter === "p1" ? {
        "p1": startPlayerPower,
        "p2": secondPlayerPower,
    } : {
        "p1": secondPlayerPower,
        "p2": startPlayerPower,
    };
}


export const getShopTurn = (game: Game) => {
    if (!game.shop.firstGotOne) {
        return getOtherPlayer(game.latestWinner);
    }
    return game.latestWinner;
}

const nextRound = (game: Game) => {
    game.shop.offers = cloneDeep(getShopPool(3));
    game.shop.firstGotOne = false;
    game.shop.secondGotOne = false;
    game.roundNumber += 1;
    // put round cards back to hands:
    game.players[game.roundStarter].discard.push(game.roundCards[0]);
    game.players[game.roundStarter].discard.push(game.roundCards[3]);
    game.players[getOtherPlayer(game.roundStarter)].discard.push(game.roundCards[1]);
    game.players[getOtherPlayer(game.roundStarter)].discard.push(game.roundCards[2]);

    game.roundCards = [];
    game.roundStarter = game.latestWinner;
    drawPhase(game);
}

export const roundScore = (game: Game) => {
    const powers = getPlayersPower(game);
    if (powers.p1 === powers.p2) {
        game.roundScore += 1;
        // skip shop phase
        game.message = "Equal power. No winner this round!";
        return nextRound(game);
    }
    const winner: PlayerID = powers.p1 > powers.p2 ? "p1" : "p2";
    game.latestWinner = winner;
    game.message = "Player " + winner + " is winner! Score " + game.roundScore;
    game.players[winner].score += game.roundScore;
    game.roundScore = 1;
    toShopPhase(game);
}


export const toShopPhase = (game: Game) => {
    game.shop.active = true;
}

const getActivePlayer = (game: Game) => {
    if (game.roundCards.length === 0 || game.roundCards.length === 3) {
        return game.roundStarter;
    } else {
        return getOtherPlayer(game.roundStarter);
    }
}

export const getPlayedColors: (cards: Card[]) => Record<Side, number> = (cards) => {
    const result = {"Dino": 0, "Cat": 0, "Both": 0};
    for (const c of cards) {
        result[c.side] = result[c.side] ? result[c.side] + 1 : 1;
    }
    return result;
}

export const canPlayCard: (game: Game, card: Card, player: PlayerID) => boolean = (game: Game, card: Card, player: PlayerID) => {
    if (getActivePlayer(game) === player) {
        const playedColors = getPlayedColors(game.roundCards);
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
        roundScore(game);
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
