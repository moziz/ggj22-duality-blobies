// Korttipeli data

type Side = "Dino"|"Cat"

type EffectTriggerPhase = "PlayFirst" | "Play" | "Resolve" | "Discard"

type EffectType = "None" | "Draw" | "AddPower" 
 

export interface ComboEffect{
	trigger: EffectTriggerPhase,
	activeInHand: boolean,
	effectType: EffectType,
	effectArgs: {[key:string]:any},
	comboNeed: "NoNeed" | "OtherSame" | "OtherDifferent",
}

export interface Card{
	name:string,
	power:number,
	side:Side,
	effects:ComboEffect[],
}
