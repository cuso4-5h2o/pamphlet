import React from 'react';
import { createAppContainer } from 'react-navigation';
import { useColorScheme } from 'react-native-appearance';
import { createStackNavigator } from 'react-navigation-stack';
import MainTabNavigator from './MainTabNavigator';
import WelcomeScreen from '../screens/WelcomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const WelcomeStack = createStackNavigator({
  Welcome: {screen: WelcomeScreen},
});

const RecordsStack = createStackNavigator({
  Records: {screen: RecordsScreen},
});

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

let Navigation = createAppContainer(createStackNavigator({
    Main: MainTabNavigator,
    Welcome: WelcomeStack,
    Records: RecordsStack,
    Settings: SettingsStack,
  },
  { 
    mode: 'modal',
    headerMode: 'none',
  }
));

export default () => {
  let colorScheme = useColorScheme();
  return (
      <Navigation theme={colorScheme}/>
  )
}