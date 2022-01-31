import React from "react";

export const useAudio: (url: string, volume: number) => [boolean, () => void] = (url, volume) => {
  return useMultiAudio([url], volume);
};

export const useMultiAudio: (url: string[], volume: number) => [boolean, () => void] = (url, volume) => {
    const [audio] = React.useState<HTMLAudioElement>(new Audio());
    const [playing, setPlaying] = React.useState<boolean>(false);
    const [clip, setClip] = React.useState(0);

    audio.volume = volume;
    const toggle = () => {
        if(!playing){
            const clipNum = clip + 1;
            audio.src = url[clipNum % url.length];
            setClip(clipNum);
        }
        // random version audio.src = url[Math.floor(Math.random() * url.length)];
        setPlaying(!playing);
    }

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
