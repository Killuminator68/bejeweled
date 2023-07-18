import { Audio } from "expo-av";

const audioFiles = {
    click: require("../assets/sounds/click.wav"),
    background: require("../assets/sounds/background.wav"),
    charge: require("../assets/sounds/charge.mp3"),
    music: require("../assets/sounds/music.wav"),
    level: require("../assets/sounds/level.wav"),
    ligne: require("../assets/sounds/ligne.wav"),
    move: require("../assets/sounds/move.wav"),
    "game-over": require("../assets/sounds/game-over.wav"),
};

const audioObjects = {};

export const loadAudio = async (audioKey) => {
    if (!audioFiles[audioKey]) {
        return;
    }

    const audioObject = new Audio.Sound();
    try {
        await audioObject.loadAsync(audioFiles[audioKey]);
        audioObjects[audioKey] = audioObject;
    } catch (error) {
    }
};

export const unloadAudio = async (audioKey) => {
    if (audioObjects[audioKey]) {
        await audioObjects[audioKey].unloadAsync();
        delete audioObjects[audioKey];
    }
};

export const playAudio = async (audioKey, shouldLoop = false) => {
    if (audioObjects[audioKey]) {
        try {
            await audioObjects[audioKey].setIsLoopingAsync(shouldLoop);
            await audioObjects[audioKey].playAsync();
        } catch (error) {
        }
    }
};

export const stopAudio = async (audioKey) => {
    if (audioObjects[audioKey]) {
        try {
            await audioObjects[audioKey].stopAsync();
        } catch (error) {
        }
    }
};
