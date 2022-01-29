// Korttipeli data

type Side = "Dino"|"Cat"

type EffectTriggerPhase = "PlayFirst" | "Play" | "Resolve" | "Discard"

type EffectType = "None" | "Draw" | "AddPower" 
 

export interface ComboEffect{
	name:string
	trigger: EffectTriggerPhase,
	activeInHand?: boolean,
	effectType: EffectType,
	effectArgs: {[key:string]:any},
	comboNeed?: "NoNeed" | "OtherSame" | "OtherDifferent",
}

export interface Card {
	name:string,
	power:number,
	side:Side,
	effects:ComboEffect[],
}

export const StartDeck: Card[] = [
	{name:"Dino 1", power:1, side:"Dino", effects: []},
	{name:"Dino 2", power:2, side:"Dino", effects: []},
	{name:"Dino 3", power:3, side:"Dino", effects: []},
	{name:"Dino 4", power:4, side:"Dino", effects: []},
	{name:"Dino 5", power:5, side:"Dino", effects: []},

	{name:"Cat 1", power:1, side:"Cat", effects: []},
	{name:"Cat 2", power:2, side:"Cat", effects: []},
	{name:"Cat 3", power:3, side:"Cat", effects: []},
	{name:"Cat 4", power:4, side:"Cat", effects: []},
	{name:"Cat 5", power:5, side:"Cat", effects: []},
]

export const effects: ComboEffect[] = [
	{trigger:"Play", effectType:"Draw", effectArgs}
]

const getRandomCard = () => {
	const power: number = Math.ceil(Math.random() * 5)
	const side: Side = Math.random() > 0.5 ? "Dino" : "Cat"
	const effect = effects[Math.floor(Math.random() * (effects.length-0.01))]
	return {
		name: side + " " + power + " - " + effect.name,
		side,
		power,
		effects: [effect]
	}
}

export const getShopPool(amount: number) {
	const deck = []
	for(let i=0; i < amount; ++i){
		deck.push(getRandomCard());
	}
	return deck;
}

