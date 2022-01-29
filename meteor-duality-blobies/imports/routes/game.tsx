import { useParams } from "react-router-dom";
export default function Game() {
    let params = useParams();
    return <h2>game {params.gameId}</h2>
}