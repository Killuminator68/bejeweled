import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated, Linking, Image } from "react-native";
import { fetchScores } from "../Outils/DataBase";
import { loadAudio, unloadAudio, playAudio, stopAudio } from "../Outils/serviceAudio";

class EndScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scores: [],
            username: this.props.route.params.username,
            buttonAnimation: new Animated.Value(0),
        };
    }

    async componentDidMount() {
        this.getScores();
        this.startButtonAnimation();
        await loadAudio("click");
        await loadAudio("game-over");
        await playAudio("game-over", false); // Le deuxième argument indique que cela ne devrait pas se répéter
    }

    async componentWillUnmount() {
        try {
            await stopAudio("click");
            await unloadAudio("click");
            await stopAudio("game-over");
            await unloadAudio("game-over");
        } catch (error) {
            console.log(error);
        }
    }

    getScores() {
        fetchScores((scores) => {
            this.setState({ scores });
        });
    }

    startButtonAnimation() {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.buttonAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }

    render() {
        const { navigation, route } = this.props;
        const { finalScore } = route.params;

        const buttonBorderStyle = {
            borderColor: this.state.buttonAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["black", "yellow"],
            }),
            borderWidth: this.state.buttonAnimation.interpolate({
                inputRange: [0, 2],
                outputRange: [2, 2],
            }),
        };

        return (
            <ImageBackground source={require("../assets/end.jpg")} style={styles.backgroundImage} resizeMode="cover">
                <View style={styles.container}>
                    <Text style={styles.title}></Text>
                    <Text style={[styles.score, { color: "yellow", fontSize: 20 }]}>
                        Score: <Text>{finalScore}</Text>
                    </Text>
                    <Text style={[styles.score, { color: "yellow", fontSize: 18 }]}>Tu feras mieux la prochaine fois</Text>
                    <View style={styles.buttonContainer}></View>
                    <View style={styles.buttonContainer}>
                        <Animated.View style={[styles.button, buttonBorderStyle]}>
                            <TouchableOpacity onPress={async () => {
                                await playAudio("click", false); // Jouer le son
                                navigation.navigate("Home"); // Naviguer vers l'accueil
                            }}>
                                <Text style={styles.buttonText}>Home</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                    <View style={styles.shareContainer}>
                        <Text style={styles.shareText}>Partager Bejeweled à vos amis</Text>
                        <TouchableOpacity onPress={() => Linking.openURL("https://fr-fr.facebook.com/")}>
                            <Image source={require("../assets/facebook.png")} style={styles.shareIcon} />
                        </TouchableOpacity>
                        <Text style={styles.shareText}>Telecharger les dernières MAJ</Text>
                        <TouchableOpacity onPress={() => Linking.openURL("https://play.google.com/")}>
                            <Image source={require("../assets/google.png")} style={styles.shareIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 35,
    },
    container: {
        flex: 1,
        backgroundColor: "rgba(245, 252, 255, 0.0)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    buttonContainer: {
        width: "75%",
        marginBottom: 50,
    },
    button: {
        padding: 10,
        borderColor: "#000",
        borderRadius: 5,
        backgroundColor: "#841584",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 300,
        marginBottom: 150,
    },
    buttonText: {
        color: "#FFF",
        textAlign: "center",
        fontSize: 15,
    },
    shareContainer: {
        padding: 2,
        marginTop: -350,
        marginBottom: -50,
        width: "100%",
        alignItems: "center",
    },
    shareText: {
        color: "#FFF",
        marginBottom: 0,
        fontSize: 12,
    },
    shareIcon: {
        width: 30,
        height: 30,
        marginBottom: 10,
    },
});

export default EndScreen;
