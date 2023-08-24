import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

const ControleScreen = () => {
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [clickSound, setClickSound] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadSounds();
    return unloadSounds;
  }, []);

  const loadSounds = async () => {
    try {
      const clickSoundObject = new Audio.Sound();
      const backgroundMusicObject = new Audio.Sound();
      await clickSoundObject.loadAsync(require('../assets/sounds/click.wav'));
      await backgroundMusicObject.loadAsync(require('../assets/sounds/background.wav'));
      setClickSound(clickSoundObject);
      setBackgroundMusic(backgroundMusicObject);
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  };

  const unloadSounds = async () => {
    if (clickSound) {
      await clickSound.unloadAsync();
    }
    if (backgroundMusic) {
      await backgroundMusic.unloadAsync();
    }
  };

  const handleSoundVolumeChange = (volume) => {
    setSoundVolume(volume);
    // Adjust the volume of sound effects
    if (clickSound) {
      clickSound.setVolumeAsync(volume);
    }
  };

  const handleMusicVolumeChange = (volume) => {
    setMusicVolume(volume);
    // Adjust the volume of background music
    if (backgroundMusic) {
      backgroundMusic.setVolumeAsync(volume);
    }
  };

  const handlePlayClickSound = async () => {
    if (clickSound) {
      try {
        await clickSound.replayAsync();
      } catch (error) {
        console.log('Error playing click sound:', error);
      }
    }
  };

  const handlePlayBackgroundMusic = async () => {
    if (backgroundMusic) {
      try {
        await backgroundMusic.setIsLoopingAsync(true);
        await backgroundMusic.playAsync();
      } catch (error) {
        console.log('Error playing background music:', error);
      }
    }
  };

  const handleStopBackgroundMusic = async () => {
    if (backgroundMusic) {
      try {
        await backgroundMusic.stopAsync();
      } catch (error) {
        console.log('Error stopping background music:', error);
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen (in this case, the home screen)
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/game.jpg')} style={styles.backgroundImage} resizeMode="cover">
        <Text style={styles.title}>Contrôles du volume</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Effets sonores</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={soundVolume}
            onValueChange={handleSoundVolumeChange}
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Musique d'arrière-plan</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={musicVolume}
            onValueChange={handleMusicVolumeChange}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePlayClickSound}>
            <Text style={styles.buttonText}>Jouer le clic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handlePlayBackgroundMusic}>
            <Text style={styles.buttonText}>Jouer la musique</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleStopBackgroundMusic}>
            <Text style={styles.buttonText}>Arrêter la musique</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    marginTop: 35,
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 70,
    marginTop: 50,
    color: 'yellow',
  },
  sliderContainer: {
    width: '80%',
    marginBottom: 50,
    marginLeft: 100,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FFF',
  },
  slider: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    width: '60%',
    padding: 50,
    marginLeft: 70,
    marginTop: 50,
  },
  button: {
    backgroundColor: '#841584',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ControleScreen;
