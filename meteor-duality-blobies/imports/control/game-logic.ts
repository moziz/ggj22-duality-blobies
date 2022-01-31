import {Card, startDeck, Side, getShopPool, getBadCard} from "/imports/data/card-data";
import {cloneDeep, concat, findIndex} from "lodash";
import {Game, GamePlayerData} from "/imports/data/game";
import {PlayerID} from "/imports/data/player";
import {AddGameMessage} from "/imports/data/chat";


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
        // check draw phase effects
        for(const c of game.players[player].hand){
            for (const effect of c.effects) {
                if(effect.trigger==="StartOfDrawPhase"){
                    if(effect.effectType === "Grow"){
                        c.power += effect.effectArgs["amount"];
                    }
                }
            }
        }

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
    const i = findIndex(game.shop.offers, c => c.name === card.name && c.power === card.power && c.side === card.side);
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
    const startPlayerPower = (game.roundCards[0]?.power ?? 0) + (game.roundCards[3]?.power ?? 0)
    const secondPlayerPower = (game.roundCards[1]?.power ?? 0) + (game.roundCards[2]?.power ?? 0)
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
    // put round cards back to discard
    if (game.roundCards[0]) game.players[game.roundStarter].discard.push(game.roundCards[0]);
    if (game.roundCards[3]) game.players[game.roundStarter].discard.push(game.roundCards[3]);
    if (game.roundCards[1]) game.players[getOtherPlayer(game.roundStarter)].discard.push(game.roundCards[1]);
    if (game.roundCards[2]) game.players[getOtherPlayer(game.roundStarter)].discard.push(game.roundCards[2]);

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
        AddGameMessage(game.name, game.message);
        return nextRound(game);
    }
    const winner: PlayerID = powers.p1 > powers.p2 ? "p1" : "p2";
    game.latestWinner = winner;
    game.message = "Player " + winner + " is winner of the round! Score +" + game.roundScore + ".";
    game.players[winner].score += game.roundScore;
    game.roundScore = 1;
    toShopPhase(game);

    AddGameMessage(game.name, game.message);
}


export const toShopPhase = (game: Game) => {
    game.shop.active = true;
}


const getActivePlayer = (game: Game) => {
    let active = 0;
    while (game.roundCards[active]) {
        active++;
    }
    if (active === 0 || active === 3) {
        return game.roundStarter;
    } else {
        return getOtherPlayer(game.roundStarter);
    }
}


export const getPlayedColors: (cards: (Card | undefined)[]) => Record<Side, number> = (cards) => {
    const result = {"Dino": 0, "Cat": 0, "Both": 0};
    for (const c of cards) {
        if (!c) {
            continue;
        }
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

export const getCannotReason: (game: Game, card: Card, player: PlayerID) => string | undefined = (game: Game, card: Card, player: PlayerID) => {
    if (getActivePlayer(game) !== player) {
        return "Not Your Turn";
    }
    const playedColors = getPlayedColors(game.roundCards);
    if (playedColors[card.side] >= 2) {
        return "Balance!";
    }
    return undefined;
}


export const playCardInGame: (game: Game, card: Card, player: PlayerID) => boolean = (game, card, player) => {
    if (!canPlayCard(game, card, player)) {
        return false;
    }

    const i = findIndex(game.players[player].hand, c => c.name === card.name && c.power === card.power && c.side === card.side);
    game.players[player].hand.splice(i, 1);
    for (let i = 0; i < 4; ++i) {
        if (!game.roundCards[i]) {
            game.roundCards[i] = card;
            break;
        }
    }

    // special effects
    for (const effect of card.effects) {
        if (effect.trigger !== "Play") {
            continue;
        }
        if (effect.effectType === "Draw") {
            for (let i = 0; i < effect.effectArgs["amount"]; ++i) {
                const c = drawCard(game, player);
                if (!c) {
                    break;
                }
                game.players[player].hand.push(c);
            }
            AddGameMessage(game.name, "" + player + " draws " + effect.effectArgs["amount"] + " cards!");
        }
        if (effect.effectType === "Swap") {
            const counts = getPlayedColors(game.roundCards);
            const target = effect.effectArgs["target"];
            if ((target === "Cat" && counts.Cat === 2) || (target === "Dino" && counts.Dino === 2)) {
                const indexA = findIndex(game.roundCards, (c) => c?.side === target);
                const indexB = findIndex(game.roundCards, (c) => c?.side === target, indexA + 1);
                const tmpCard = game.roundCards[indexA];
                game.roundCards[indexA] = game.roundCards[indexB]
                game.roundCards[indexB] = tmpCard;
                AddGameMessage(game.name, "Swap: " + game.roundCards[indexA]?.name + " " + game.roundCards[indexB]?.name + ".");
            }
        }
        if (effect.effectType === "Destroy") {
            const target = effect.effectArgs["target"];
            const power = card.power;
            if (target === "all") {
                AddGameMessage(game.name, "" + player + " destroys them all!");
                game.roundCards = [];
            }
            if (target === "smaller") {
                for (let i = 0; i < game.roundCards.length; ++i) {
                    if ((game.roundCards[i]?.power ?? 0) < power) {
                        AddGameMessage(game.name, "" + player + " destroys " + game.roundCards[i]?.name + "!");
                        game.roundCards[i] = undefined;
                    }
                }
            }
            if (target === "bigger") {
                for (let i = 0; i < game.roundCards.length; ++i) {
                    if ((game.roundCards[i]?.power ?? 0) > power) {
                        AddGameMessage(game.name, "" + player + " destroys " + game.roundCards[i]?.name + "!");
                        game.roundCards[i] = undefined;
                    }
                }
            }
        }
        if(effect.effectType === "Grow"){
            card.power += effect.effectArgs["amount"];
        }
    }

    // start new round?
    let active = 0;
    while (game.roundCards[active]) {
        active++;
    }
    if (active > 3) {
        roundScore(game);
    } else {
        // check that user has the card needed, if not add 0-power card
        const activeP = getActivePlayer(game);
        const cards = getPlayedColors(game.roundCards);
        const cardsInHand = getPlayedColors(game.players[activeP].hand);
        if (cards.Cat > 1 && cardsInHand.Dino === 0) {
            game.players[activeP].hand.push(getBadCard("Dino"));
        }
        if (cards.Dino > 1 && cardsInHand.Cat === 0) {
            game.players[activeP].hand.push(getBadCard("Cat"));
        }
        if (game.players[activeP].hand.length === 0) {
            game.players[activeP].hand.push(getBadCard(Math.random() > 0.5 ? "Cat" : "Dino"));
        }
    }
    return true;
}


export function shuffle(array: Array<any>) {
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
