import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ScoreScreen from './screens/ScoreScreen';
import EndScreen from './screens/EndScreen';
import LoadingGScreen from './screens/LoadingGScreen';
import LevelLoadingScreen from './screens/LevelLoadingScreen';
import ControleScreen from './screens/ControleScreen';  
import { initializeDatabase } from './Outils/DataBase.js';

const Stack = createStackNavigator();

function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRight, 
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LoadingG" component={LoadingGScreen} /> 
        <Stack.Screen name="LevelLoading" component={LevelLoadingScreen} />
        <Stack.Screen name="Controle" component={ControleScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Score" component={ScoreScreen} />
        <Stack.Screen name="End" component={EndScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
