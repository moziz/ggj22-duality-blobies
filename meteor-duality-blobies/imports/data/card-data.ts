import {Mongo} from "meteor/mongo";
import {cloneDeep} from "lodash";

export type Side = "Dino" | "Cat" | "Both";

type EffectTriggerPhase = "None" | "PlayFirst" | "Play" | "Resolve" | "Discard" | "StartOfDrawPhase";

type EffectType = "None" | "Draw" | "Swap" | "Destroy" | "Grow";

type EffectArgKey = string;

export interface ComboEffect {
    trigger: EffectTriggerPhase;
    activeInHand?: boolean;
    effectType: EffectType;
    effectArgs: Record<EffectArgKey, any>;
    comboNeed?: "NoNeed" | "OtherSame" | "OtherDifferent";
    text: string;
}

export interface ComboEffectCardFactoryData extends ComboEffect {
    minPower?: number;
    maxPower?: number;
    cardName: string;
}

export interface Card {
    name: string;
    power: number;
    side: Side;
    effects: ComboEffect[];
    visuals: number;
}

export const getBadCard: (side: Side) => Card = (side) => {
    const effect: ComboEffect = {
        effectType: "None",
        text: "For the balance",
        effectArgs: {},
        trigger: "None",
    };

    return {
        name: "Bad " + side,
        side,
        power: 0,
        effects: [effect],
        visuals: 0,
    }
}

export const startDeck: Card[] = [
    {name: "Dino", power: 1, side: "Dino", effects: [], visuals: 1},
    {name: "Dino", power: 2, side: "Dino", effects: [], visuals: 2},
    {name: "Dino", power: 3, side: "Dino", effects: [], visuals: 3},
    {name: "Dino", power: 2, side: "Dino", effects: [], visuals: 4},
    {name: "Dino", power: 1, side: "Dino", effects: [], visuals: 5},

    {name: "Cat", power: 1, side: "Cat", effects: [], visuals: 1},
    {name: "Cat", power: 2, side: "Cat", effects: [], visuals: 2},
    {name: "Cat", power: 3, side: "Cat", effects: [], visuals: 3},
    {name: "Cat", power: 2, side: "Cat", effects: [], visuals: 4},
    {name: "Cat", power: 1, side: "Cat", effects: [], visuals: 5},
]

export const startDeckSplitDino: Card[] = [
    {name: "Dino", power: 1, side: "Dino", effects: [], visuals: 1},
    {name: "Dino", power: 2, side: "Dino", effects: [], visuals: 2},
    {name: "Dino", power: 3, side: "Dino", effects: [], visuals: 3},
    {name: "Dino", power: 2, side: "Dino", effects: [], visuals: 4},
    {name: "Dino", power: 1, side: "Dino", effects: [], visuals: 5},
    {name: "Dino", power: 3, side: "Dino", effects: [], visuals: 3},
    {name: "Dino", power: 2, side: "Dino", effects: [], visuals: 4},
    {name: "Dino", power: 1, side: "Dino", effects: [], visuals: 5},
]

export const startDeckSplitCat: Card[] = [
    {name: "Cat", power: 1, side: "Cat", effects: [], visuals: 1},
    {name: "Cat", power: 2, side: "Cat", effects: [], visuals: 2},
    {name: "Cat", power: 3, side: "Cat", effects: [], visuals: 3},
    {name: "Cat", power: 2, side: "Cat", effects: [], visuals: 4},
    {name: "Cat", power: 1, side: "Cat", effects: [], visuals: 5},
    {name: "Cat", power: 3, side: "Cat", effects: [], visuals: 3},
    {name: "Cat", power: 2, side: "Cat", effects: [], visuals: 4},
    {name: "Cat", power: 1, side: "Cat", effects: [], visuals: 5},
]

export const effects: ComboEffectCardFactoryData[] = [
    {cardName: "Draw 3", text: "Play: Draw 3", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 3}},
    {cardName: "Draw 4", text: "Play: Draw 4", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 4}, minPower:2, maxPower:4},
    {cardName: "Draw 5", text: "Play: Draw 5", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 5}, minPower:0, maxPower:2},
    {cardName: "Swap C", text: "Play: Swap Cats", trigger: "Play", effectType: "Swap", effectArgs: {"target": "Cat"}},
    {cardName: "Swap D", text: "Play: Swap Dinos", trigger: "Play", effectType: "Swap", effectArgs: {"target": "Dino"}},
    {cardName: "Grow fast", text: "In hand: +2 power", trigger: "StartOfDrawPhase", effectType: "Grow", effectArgs: {"amount": 2}, minPower:1, maxPower:2},
    {cardName: "Grow", text: "In hand: +1 power", trigger: "StartOfDrawPhase", effectType: "Grow", effectArgs: {"amount": 1}},
    {cardName: "Huge", text: "Play: lose 4 power", trigger: "Play", effectType: "Grow", effectArgs: {"amount": -4}, minPower: 15, maxPower: 20},
    {cardName: "Eat", text: "Play: Eat all", trigger: "Play", effectType: "Destroy", effectArgs: {"target": "all"}, minPower:0, maxPower:0},
    {
        cardName: "Eat",
        text: "Play: Eat Smaller",
        trigger: "Play",
        effectType: "Destroy",
        effectArgs: {"target": "smaller"},
    },
    {
        cardName: "Eat",
        text: "Play: Eat Stronger",
        trigger: "Play",
        effectType: "Destroy",
        effectArgs: {"target": "bigger"},
        minPower:1,
        maxPower:1,
    },
];


const getRandomCard: () => Card = () => {
    const side: Side = Math.random() > 0.5 ? "Dino" : "Cat";
    const effect = cloneDeep(effects[Math.floor(Math.random() * effects.length)]);
    const power: number = (effect.minPower ?? 3) + Math.floor(Math.random() * ((effect.maxPower ?? 8) - (effect.minPower ?? 3)));
    delete effect.maxPower;
    delete effect.minPower;
    const visuals = 5 + Math.floor(Math.random() * (9 - 0.01));
    return {
        name: effect.cardName,
        side,
        power,
        effects: [effect],
        visuals,
    }
}

export const getShopPool = (amount: number) => {
    const deck = []
    for (let i = 0; i < amount; ++i) {
        deck.push(getRandomCard());
    }
    return deck;
}

export const getImage = (side: Side, power: number) => {
    if (side === "Cat") {
        return imageNames.cats[power];
    }
    return imageNames.dinos[power];
}

export const imageNames = {
    cats: [
        "cat1.png",
        "cat3.png",
        "cat2.png",
        "cat6.jpg",
        "cat4.png",
        "cat5.jpg",
        "cat9.jpg",
        "cat14.png",
        "cat13.jpg",
        "cat12.jpg",
        "cat15.jpg",
        "cat8.jpg",
        "cat7.jpg",
        "cat11.jpg",
        "cat10.jpg",
    ],
    dinos: [
        "dino6.jpg",
        "dino9.jpg",
        "dino7.jpg",
        "dino2.jpg",
        "dino1.jpg",
        "dino11.jpg",
        "dino3.jpg",
        "dino14.jpg",
        "dino15.jpg",
        "dino8.jpg",
        "dino5.jpg",
        "dino10.jpg",
        "dino12.jpg",
        "dino4.jpg",
        "dino13.jpg",
    ],
}

export const CardsCollection = new Mongo.Collection<Card>('cards');

