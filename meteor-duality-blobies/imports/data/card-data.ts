import {Mongo} from "meteor/mongo";
import * as module from "module";

export type Side = "Dino" | "Cat" | "Both"

type EffectTriggerPhase = "PlayFirst" | "Play" | "Resolve" | "Discard"

type EffectType = "None" | "Draw" | "AddPower"

export interface ComboEffect {
    name: string
    trigger: EffectTriggerPhase,
    activeInHand?: boolean,
    effectType: EffectType,
    effectArgs: { [key: string]: any },
    comboNeed?: "NoNeed" | "OtherSame" | "OtherDifferent",
    text?: string,
}

export interface Card {
    name: string,
    power: number,
    side: Side,
    effects: ComboEffect[],
    visuals: number,
}

export const startDeck: Card[] = [
    {name: "Dino 1", power: 1, side: "Dino", effects: [], visuals: 1},
    {name: "Dino 2", power: 2, side: "Dino", effects: [], visuals: 2},
    {name: "Dino 3", power: 3, side: "Dino", effects: [], visuals: 3},
    {name: "Dino 4", power: 4, side: "Dino", effects: [], visuals: 4},
    {name: "Dino 5", power: 5, side: "Dino", effects: [], visuals: 5},

    {name: "Cat 1", power: 1, side: "Cat", effects: [], visuals: 1},
    {name: "Cat 2", power: 2, side: "Cat", effects: [], visuals: 2},
    {name: "Cat 3", power: 3, side: "Cat", effects: [], visuals: 3},
    {name: "Cat 4", power: 4, side: "Cat", effects: [], visuals: 4},
    {name: "Cat 5", power: 5, side: "Cat", effects: [], visuals: 5},
]

export const effects: ComboEffect[] = [
    {name: "Draw 1", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 1}},
    {name: "Draw 2", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 2}},
    {name: "Draw 3", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 3}},
]

const getRandomCard: () => Card = () => {
    const power: number = Math.ceil(Math.random() * 5)
    const side: Side = Math.random() > 0.5 ? "Dino" : "Cat"
    const effect = effects[Math.floor(Math.random() * (effects.length - 0.01))]
    const visuals = 5 + Math.floor(Math.random() * (9 - 0.01))
    return {
        name: effect.name,
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

