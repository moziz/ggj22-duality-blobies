import {cloneDeep} from "lodash";
import {RoundEffectName} from "/imports/data/game";

export type Side = "Dino" | "Cat" | "Both";

type EffectTriggerPhase = "None" | "PlayFirst" | "Play" | "Resolve" | "Discard" | "StartOfDrawPhase";

type EffectType = "None" | "Draw" | "Swap" | "Destroy" | "Grow" | "Eat" | "AddRoundEffect";

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
    id: number;
    name: string;
    power: number;
    side: Side;
    effects: ComboEffect[];
    visuals: number;
}

export const getBadCard: (side: Side, id: number) => Card = (side, id) => {
    const effect: ComboEffect = {
        effectType: "None",
        text: "For the balance",
        effectArgs: {},
        trigger: "None",
    };

    return {
        id,
        name: "Bad " + side,
        side,
        power: 0,
        effects: [effect],
        visuals: 0,
    }
}
export const getErrorCard: (props?: Partial<Card>) => Card = (props = {}) => {
    const effect: ComboEffect = {
        effectType: "None",
        text: "For the balance",
        effectArgs: {},
        trigger: "None",
    };
    const errorCard: Card = {
        id: -1,
        name: "ERROR CAT",
        side: "Cat",
        power: -99,
        effects: [effect],
        visuals: 0,
    }
    return {...errorCard, ...props}
}

export const startDeck: (idBase: number) => Card[] = (idBase) => [
    {id: idBase + 1, name: "Dino", power: 1, side: "Dino", effects: [], visuals: 1},
    {id: idBase + 2, name: "Dino", power: 2, side: "Dino", effects: [], visuals: 2},
    {id: idBase + 3, name: "Dino", power: 3, side: "Dino", effects: [], visuals: 3},
    {id: idBase + 4, name: "Dino", power: 2, side: "Dino", effects: [], visuals: 4},
    {id: idBase + 5, name: "Dino", power: 1, side: "Dino", effects: [], visuals: 5},

    {id: idBase + 11, name: "Cat", power: 1, side: "Cat", effects: [], visuals: 1},
    {id: idBase + 12, name: "Cat", power: 2, side: "Cat", effects: [], visuals: 2},
    {id: idBase + 13, name: "Cat", power: 3, side: "Cat", effects: [], visuals: 3},
    {id: idBase + 14, name: "Cat", power: 2, side: "Cat", effects: [], visuals: 4},
    {id: idBase + 15, name: "Cat", power: 1, side: "Cat", effects: [], visuals: 5},
]

export const startDeckSplitDino: Card[] = [
    {id: 1, name: "Dino", power: 1, side: "Dino", effects: [], visuals: 1},
    {id: 2, name: "Dino", power: 2, side: "Dino", effects: [], visuals: 2},
    {id: 3, name: "Dino", power: 3, side: "Dino", effects: [], visuals: 3},
    {id: 4, name: "Dino", power: 1, side: "Dino", effects: [], visuals: 4},
    {id: 5, name: "Dino", power: 2, side: "Dino", effects: [], visuals: 5},
    {id: 6, name: "Dino", power: 3, side: "Dino", effects: [], visuals: 6},
]

export const startDeckSplitCat: Card[] = [
    {id: 11, name: "Cat", power: 1, side: "Cat", effects: [], visuals: 1},
    {id: 12, name: "Cat", power: 2, side: "Cat", effects: [], visuals: 2},
    {id: 13, name: "Cat", power: 3, side: "Cat", effects: [], visuals: 3},
    {id: 14, name: "Cat", power: 1, side: "Cat", effects: [], visuals: 4},
    {id: 15, name: "Cat", power: 2, side: "Cat", effects: [], visuals: 5},
    {id: 16, name: "Cat", power: 3, side: "Cat", effects: [], visuals: 6},
]

const triggerHelpText: Record<EffectTriggerPhase, string> = {
    Discard: "When the card is discarded",
    Play: "When the card is played",
    StartOfDrawPhase: "At the start of round",
    None: "Never",
    PlayFirst: "If played as first card of the round",
    Resolve: "When power is counted",
}

const roundEffectHelpText: Record<RoundEffectName, string> = {
    None: "Nothing happens",
    Mute: "Disable cards' special effects",
}

const effectTypeHelpText: Record<EffectType, (effect: ComboEffect) => string> = {
    None: () => "Does nothing",
    Draw: () => "Draw new cards to hand",
    AddRoundEffect: (effect => "Add " + effect.effectArgs["effectName"] + ":" + roundEffectHelpText[effect.effectArgs["effectName"] as RoundEffectName]),
    Destroy: () => "Destroy: remove cards from the game",
    Eat: () => "Eat: discards some cards, +1 power each",
    Grow: () => "Change card's power",
    Swap: () => "Change positions of played cards",
}

export const getEffectHelp = (effect: ComboEffect) => {
    return triggerHelpText[effect.trigger] + ": " + effectTypeHelpText[effect.effectType](effect);
}

export const effects: ComboEffectCardFactoryData[] = [
    {cardName: "Draw 2", text: "Play: Draw 2", trigger: "Play", effectType: "Draw", effectArgs: {"amount": 2}},
    {
        cardName: "Draw 4",
        text: "Play: Draw 4",
        trigger: "Play",
        effectType: "Draw",
        effectArgs: {"amount": 4},
        minPower: 0,
        maxPower: 0,
    },
    {cardName: "Swap C", text: "Play: Swap Cats", trigger: "Play", effectType: "Swap", effectArgs: {"target": "Cat"}},
    {cardName: "Swap D", text: "Play: Swap Dinos", trigger: "Play", effectType: "Swap", effectArgs: {"target": "Dino"}},
    {
        cardName: "Grow fast",
        text: "In hand: +2 power",
        trigger: "StartOfDrawPhase",
        effectType: "Grow",
        effectArgs: {"amount": 2},
        minPower: 1,
        maxPower: 2,
    },
    {
        cardName: "Grow",
        text: "In hand: +1 power",
        trigger: "StartOfDrawPhase",
        effectType: "Grow",
        effectArgs: {"amount": 1},
    },
    {
        cardName: "Huge",
        text: "Play: lose 4 power",
        trigger: "Play",
        effectType: "Grow",
        effectArgs: {"amount": -4},
        minPower: 15,
        maxPower: 20,
    },
    {
        cardName: "Eat",
        text: "Play: Eat all",
        trigger: "Play",
        effectType: "Eat",
        effectArgs: {"target": "all", "grow": true},
        minPower: 0,
        maxPower: 0,
    },
    {
        cardName: "Dino eater",
        text: "Play: Eat all dinos",
        trigger: "Play",
        effectType: "Eat",
        effectArgs: {"target": "Dino", "grow": true},
        minPower: 0,
        maxPower: 0,
    },
    {
        cardName: "Cat eater",
        text: "Play: Eat all cats",
        trigger: "Play",
        effectType: "Eat",
        effectArgs: {"target": "Cat", "grow": true},
        minPower: 0,
        maxPower: 0,
    },
    {
        cardName: "Eat",
        text: "Play: Eat Smaller",
        trigger: "Play",
        effectType: "Eat",
        effectArgs: {"target": "smaller", "grow": true},
    },
    {
        cardName: "Eat",
        text: "Play: Eat Stronger",
        trigger: "Play",
        effectType: "Eat",
        effectArgs: {"target": "bigger", "grow": true},
        minPower: 1,
        maxPower: 1,
    },
    {
        cardName: "Mute",
        text: "Play: Mute round",
        trigger: "Play",
        effectType: "AddRoundEffect",
        effectArgs: {"effectName": "Mute", "duration": 1},
    },
];

const randomPower = (min: number, max: number) => {
    const r = Math.random() * (max - min);
    return Math.floor(min + r);
}

const getRandomCard: (excludeEffectType: string[], excludeVisuals: number[], id: number) => Card = (excludeEffectType, excludeVisuals, id) => {
    const side: Side = Math.random() > 0.5 ? "Dino" : "Cat";
    let effect: ComboEffectCardFactoryData;
    let counter = 0;
    do {
        effect = cloneDeep(effects[Math.floor(Math.random() * effects.length)]);
    } while (excludeEffectType.includes(effect.effectType) && counter++ < 100);
    let visuals: number;
    counter = 0;
    do {
        visuals = 5 + Math.floor(Math.random() * (9 - 0.01));
    } while (excludeVisuals.includes(visuals) && counter++ < 100)

    const power: number = randomPower(effect.minPower ?? 3, effect.maxPower ?? 8);
    delete effect.maxPower;
    delete effect.minPower;
    return {
        id,
        name: effect.cardName,
        side,
        power,
        effects: [effect],
        visuals,
    }
}

export const getShopPool = (amount: number, baseId: number) => {
    const deck: Card[] = []
    for (let i = 0; i < amount; ++i) {
        deck.push(getRandomCard(deck.map(c => c.effects[0].effectType), deck.map(c => c.visuals), baseId + i));
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

