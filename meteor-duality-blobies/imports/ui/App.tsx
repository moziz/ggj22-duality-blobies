import React from 'react';


const randomString = (len: number) => {
    const letters = "ABCDEFHJKMPRSTU2345789";
    let result = ""
    while (result.length < len) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}

export const App = () => {

    const [code] = React.useState(randomString(6));


    return (
        <div className={"container-fluid"}>
            <h1>Start new game</h1>
            <a className={"btn btn-primary"} href={"/game/"+ code} role={"button"}>Start game {code}</a>
        </div>
    );
};
