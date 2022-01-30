import React from "react";

export const useAudio: (url: string, volume:number) => [boolean, () => void] = (url, volume) => {
    const [audio] = React.useState<HTMLAudioElement>(new Audio(url));
    const [playing, setPlaying] = React.useState<boolean>(false);

    audio.volume = volume;

    const toggle = () => setPlaying(!playing);

    React.useEffect(() => {
            playing ? audio.play() : audio.pause();
        },
        [playing],
    );

    React.useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }, []);

    return [playing, toggle];
};
