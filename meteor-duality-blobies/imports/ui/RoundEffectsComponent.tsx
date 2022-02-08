import React from "react";
import {RoundEffect} from "/imports/data/game";

export function RoundEffectsComponent(props: { effects: RoundEffect[] }) {
    if(!props.effects.length)
    {
        return <div className={"ps-4"}>No on going round effects</div>
    }
    return (
    <div className={"ps-4"}>
        {props.effects.map((value, index) => (<div key={value.effect + index}>{value.effect}: {value.duration} rounds</div>))}
    </div>
    );
}
