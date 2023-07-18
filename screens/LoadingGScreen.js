import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground, Animated } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { loadAudio, unloadAudio, playAudio, stopAudio } from "../Outils/serviceAudio";

const LoadingGScreen = ({ route }) => {
    const [progress, setProgress] = useState(0);
    const navigation = useNavigation();
    const { username } = route.params;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress < 1) {
                    return prevProgress + 0.1;
                }
                return prevProgress;
            });
        }, 200);

        const loadAndPlayAudio = async () => {
            await loadAudio("background");
            await playAudio("background", true);
        };
        loadAndPlayAudio();

        return () => {
            clearInterval(interval);
            const stopAndUnloadAudio = async () => {
                await stopAudio("background");
                await unloadAudio("background");
            };
            stopAndUnloadAudio();
        };
    }, []);

    useEffect(() => {
        if (progress >= 1) {
            stopAudio("background");
            navigation.navigate("Game", { username });
        }
    }, [progress, navigation, username]);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeAnim]);

    return (
        <ImageBackground source={require("../assets/home.jpg")} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Bienvenue à Bejeweled !</Animated.Text>
                <Text style={styles.text}>Chargement... {Math.round(progress * 100)}%</Text>
                <Progress.Bar progress={progress} color={"yellow"} width={200} />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
        marginTop: 35,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    title: {
        fontSize: 30,
        color: "yellow",
        marginBottom: 20,
    },
    text: {
        marginBottom: 20,
        color: "white",
    },
});

export default LoadingGScreen;
