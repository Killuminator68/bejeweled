import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from "react-native";
import { loadAudio, unloadAudio, playAudio } from "../Outils/serviceAudio";
import { fetchScores } from "../Outils/DataBase.js";
import * as Animatable from "react-native-animatable";
import etoile1 from "../assets/etoile1.png";

Animatable.initializeRegistryWithDefinitions({
    makeItRain: {
        0: {
            translateY: -1000,
        },
        1: {
            translateY: 0,
        },
    },
});

class ScoreScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scores: [],
            buttonBorderWidth: 1,
            buttonBorderColor: "#FF0",
        };
        this.interval = null; // Ajouté pour stocker l'intervalle d'animation
    }

    async componentDidMount() {
        this.getScoresFromDatabase();
        this.startButtonAnimation();

        // On ajoute le chargement et la lecture de l'audio ici
        await loadAudio("background");
        await playAudio("background", true); // Le deuxième argument indique que cela devrait se répéter
    }

    async componentWillUnmount() {
        clearInterval(this.interval);

        // On ajoute le déchargement de l'audio ici
        await unloadAudio("background");
    }

    handleBackHomePress = () => {
        this.props.navigation.navigate("Home");
    };

    getScoresFromDatabase() {
        console.log("Fetching scores from database...");
        fetchScores((scores) => {
            console.log("Scores récupérés :", scores);
            this.setState({ scores: scores });
        });
    }

    startButtonAnimation() {
        this.interval = setInterval(() => {
            this.setState((prevState) => ({
                buttonBorderWidth: prevState.buttonBorderWidth === 2 ? 1 : 2, // This line was modified
                buttonBorderColor: prevState.buttonBorderColor === "black" ? "yellow" : "black",
            }));
        }, 1000);
    }

    render() {
        console.log("Rendering ScoreScreen...");
        console.log("Scores:", this.state.scores);

        return (
            <ImageBackground source={require("../assets/score.jpg")} style={styles.backgroundImage}>
                <View style={styles.container}>
                    {this.state.scores && (
                        <FlatList
                            data={this.state.scores}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.scoreRow}>
                                    <Text style={[styles.score, { color: "yellow", fontSize: 20 }]}>
                                        {item.utilisateur} (Niveau {item.level}): {item.score}
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                    <Animatable.View animation="fadeIn" style={styles.etoileContainer}>
                        <Animatable.Image source={etoile1} style={styles.etoile} animation="makeItRain" iterationCount="infinite" delay={500} duration={1500} />
                        <Animatable.Image source={etoile1} style={styles.etoile} animation="makeItRain" iterationCount="infinite" delay={1000} duration={1500} />
                        <Animatable.Image source={etoile1} style={styles.etoile} animation="makeItRain" iterationCount="infinite" delay={500} duration={1500} />
                        <Animatable.Image source={etoile1} style={styles.etoile} animation="makeItRain" iterationCount="infinite" delay={1000} duration={1500} />
                        <Animatable.Image source={etoile1} style={styles.etoile} animation="makeItRain" iterationCount="infinite" delay={500} duration={1500} />
                        <Animatable.Image source={etoile1} style={styles.etoile} animation="makeItRain" iterationCount="infinite" delay={1000} duration={1500} />
                    </Animatable.View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={this.handleBackHomePress}
                            style={[
                                styles.homeButton,
                                {
                                    borderColor: this.state.buttonBorderColor,
                                    borderWidth: this.state.buttonBorderWidth,
                                },
                            ]}
                        >
                            <Text style={styles.buttonText}>Accueil</Text>
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
        backgroundColor: "rgba(245, 252, 255, 0)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginTop: 250,
    },
    scoreRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 15,
        color: "#FFF",
    },
    buttonContainer: {
        width: "80%",
        marginTop: 50,
    },
    homeButton: {
        marginBottom: 80,
        padding: 10,
        borderWidth: 2,
        borderRadius: 5,
        backgroundColor: "#841584",
        justifyContent: "center",
    },
    buttonText: {
        color: "#FFF",
        textAlign: "center",
    },
    etoileContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    etoile: {
        width: 40,
        height: 40,
        margin: 5,
    },
});

export default ScoreScreen;
