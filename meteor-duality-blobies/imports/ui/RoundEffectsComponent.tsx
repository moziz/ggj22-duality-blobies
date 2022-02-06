import React from "react";
import {RoundEffect} from "/imports/data/game";

export function RoundEffectsComponent(props: { effects: RoundEffect[] }) {
    if(!props.effects.length)
    {
        return <div>No on going round effects</div>
    }
    return (
    <div>
        {props.effects.map((value, index) => (<div key={value.effect + index}>{value.effect}: {value.duration} rounds</div>))}
    </div>
    );
}
