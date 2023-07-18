import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, TextInput, Alert, ImageBackground } from "react-native";
import { fetchScores } from "../Outils/DataBase.js";
import { loadAudio, unloadAudio, playAudio, stopAudio } from "../Outils/serviceAudio";
import { Audio } from 'expo-av';
import * as Animatable from "react-native-animatable";
import LoadingGScreen from "../screens/LoadingGScreen";
import dia1 from "../assets/dia1.png";
import dia2 from "../assets/dia2.png";
import dia3 from "../assets/dia3.png";
import dia4 from "../assets/dia4.png";
import dia5 from "../assets/dia5.png";

// Define the custom animation outside the component class
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

class HomeScreen extends React.Component {
   constructor(props) {
    super(props);
    this.state = {
        username: "",
        buttonBorderColor: "#000",
    };
    this.interval = null;
    this.audioObjects = {}; 
}


   async componentDidFocus() {
    if (this.audioObjects["background"]) {
        const status = await this.audioObjects["background"].getStatusAsync();
        if (!status.isPlaying) {
            playAudio("background", true);
        }
    }
}


    async componentDidMount() {
    this.interval = setInterval(() => {
        this.setState((prevState) => ({
            buttonBorderColor: prevState.buttonBorderColor === "#000" ? "#FF0" : "#000",
        }));
    }, 1000);

    this.didFocusSubscription = this.props.navigation.addListener("didFocus", (payload) => {
        this.componentDidFocus();
    });

    try {
        const audio = await loadAudio("background");
        this.audioObjects = { background: audio }; // Here you set the instance
        await playAudio("background", true);
    } catch (error) {
        console.error(error);
    }
    this.loadButtonSound();
}

    async loadButtonSound() {
    const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/click.wav") 
    );

        this.buttonSound = sound;
    }

    async componentWillUnmount() {
    this.didFocusSubscription.remove();
    if (this.audioObjects["background"]) {
        try {
            await this.audioObjects["background"].stopAsync();
            await this.audioObjects["background"].unloadAsync();
            this.audioObjects["background"] = null; // Set the instance to null after unloading
        } catch (error) {
            console.log(error);
        }
    }
    if(this.buttonSound) {
        await this.buttonSound.unloadAsync();
        this.buttonSound = null;
    }
}


    startGame = async () => {
        if (this.state.username === "") {
            Alert.alert("Erreur", "Entrez un pseudo avant de commencer une partie");
            return;
        }

        await this.buttonSound.playAsync();

        // Stop the sound before navigating to the game screen
        await this.stopHomeScreenAudio();

        this.props.navigation.navigate("LoadingG", { username: this.state.username });
    };

    stopHomeScreenAudio = async () => {
        await stopAudio("background");
    };

    handleStartGamePress = async () => {
        await this.buttonSound.playAsync();
        const { username } = this.state;
        this.props.navigation.navigate("Game", { username });
    };

    handleTopScoresPress = async () => {
        await this.buttonSound.playAsync();
        this.props.navigation.navigate("Score");
    };

    handleReglagesPress = async () => {
        await this.buttonSound.playAsync();
        this.props.navigation.navigate("Controle");
    };


    render() {
        const { buttonBorderColor } = this.state;

        return (
            <ImageBackground source={require("../assets/home.jpg")} style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Text style={styles.title}></Text>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.input} value={this.state.username} onChangeText={(text) => this.setState({ username: text })} placeholder="Entrez votre pseudo..." placeholderTextColor="#fff" />
                    </View>
                    <Animatable.View animation="fadeIn" style={styles.diamondContainer}>
                        <Animatable.View animation="makeItRain" style={styles.makeItRainContainer}>
                            <Animatable.Image source={dia1} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={500} duration={1500} />
                            <Animatable.Image source={dia2} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={1000} duration={1500} />
                            <Animatable.Image source={dia3} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={1500} duration={1500} />
                            <Animatable.Image source={dia4} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={2000} duration={1500} />
                            <Animatable.Image source={dia5} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={2500} duration={1500} />
                            <Animatable.Image source={dia1} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={3000} duration={1500} />
                            <Animatable.Image source={dia2} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={3500} duration={1500} />
                            <Animatable.Image source={dia3} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={4000} duration={1500} />
                            <Animatable.Image source={dia4} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={3500} duration={1500} />
                            <Animatable.Image source={dia5} style={styles.diamond} animation="fadeInDown" iterationCount="infinite" delay={4000} duration={1500} />
                        </Animatable.View>
                    </Animatable.View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, { borderColor: buttonBorderColor }]} onPress={this.startGame}>
                            <Text style={styles.buttonText}>Play!</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { borderColor: buttonBorderColor }]} onPress={this.handleTopScoresPress}>
                            <Text style={styles.buttonText}>Classement</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { borderColor: buttonBorderColor }]} onPress={this.handleReglagesPress}>
                            <Text style={styles.buttonText}>Settings</Text>
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
        resizeMode: "cover", // or 'stretch'
        marginTop: 35,
    },
    container: {
        flex: 1,
        backgroundColor: "rgba(245, 252, 255, 0)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginBottom: -350,
    },
    inputContainer: {
        position: "relative",
        zIndex: 1, // Augmentez la valeur du z-index
    },
    TextInput: {
        color: "#fff",
    },
    input: {
        height: 40,
        borderColor: "yellow",
        color: "#fff",
        borderWidth: 2,
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 0,
        width: "100%",
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 0,
    },
    button: {
    padding: 5,
    marginVertical: 10, // Ajoute un espace vertical entre les boutons
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "#841584",
    width: '50%',
    alignSelf: 'center', // Ajoutez ceci si vos boutons ne sont pas encore centrés
    textAlign: 'center', // Centre le texte à l'intérieur du bouton
    },

    buttonText: {
        color: "#FFF",
        textAlign: "center",
    },
    diamondContainer: {
        position: "absolute",
        top: -150,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    makeItRainContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        width: 300,
        height: 300,
    },
    diamond: {
        width: 40,
        height: 40,
        margin: 5,
    },
});

export default HomeScreen;
