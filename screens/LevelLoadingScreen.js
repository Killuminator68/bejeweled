import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground, Animated } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { loadAudio, unloadAudio, playAudio } from "../Outils/serviceAudio";

const LevelLoadingScreen = ({ route }) => {
    const [progress, setProgress] = useState(0);
    const navigation = useNavigation();
    const { level, username } = route.params;

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const isMounted = useRef(true);
    const intervalRef = useRef(null); // Declare the interval variable as a useRef

    const handleProgress = () => {
        setProgress((prevProgress) => {
            if (prevProgress >= 1) {
                clearInterval(intervalRef.current);
                return prevProgress;
            }
            return prevProgress + 0.1;
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                if (isMounted.current) {
                    handleProgress();
                }
            }, 200);
        }, 2000);

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

        return () => {
            isMounted.current = false;
            clearTimeout(timeout);
            clearInterval(intervalRef.current); // Clear the interval when the component unmounts
        };
    }, []);

    useEffect(() => {
        if (progress >= 1) {
            navigation.navigate("Game", { level, username });
        }
    }, [progress, navigation, level, username]);

    return (
        <ImageBackground source={require("../assets/home.jpg")} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Animated.Text style={[styles.title, { opacity: fadeAnim, color: "yellow" }]}>Reste Concentré !</Animated.Text>
                <Text style={styles.text}>Chargement du prochain niveau {level}...</Text>
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

export default LevelLoadingScreen;
