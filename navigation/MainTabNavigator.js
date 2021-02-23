import React from 'react';
import {
  Dimensions,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';

import * as Icon from '@expo/vector-icons';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { I18n } from '../langs/I18n';

import TasksScreen from '../screens/TasksScreen';
import TasksEditScr from '../screens/TasksEditScr';
import IconSelScr from '../screens/IconSelScr';
import SubtasksScr from '../screens/SubtasksScr';
import RemindersScr from '../screens/RemindersScr';
import RepeatsScr from '../screens/RepeatsScr';

import RewardsScreen from '../screens/RewardsScreen';
import RewardsEditScr from '../screens/RewardsEditScr';

const TasksStack = createStackNavigator({
  Tasks: TasksScreen,
  TasksEdit: TasksEditScr,
  IconSelector: IconSelScr,
  SubtasksEditor: SubtasksScr,
  RemindersSelector: RemindersScr,
  RepeatsSelector: RepeatsScr,
},
  {
    initialRouteName: 'Tasks',
  });

TasksStack.navigationOptions = {
  tabBarLabel: I18n.t('tasks'),
  tabBarIcon: ({ focused }) => (
    <Icon.Ionicons
        name={Platform.OS === 'ios' ? 'ios-list-box' : 'md-list-box'}
        size={26}
        style={{ marginBottom: (Dimensions.get('window').width<1000?-5:0) }}
        color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
  ),
};

const RewardsStack = createStackNavigator({
  Rewards: RewardsScreen,
  RewardsEdit: RewardsEditScr,
  IconSelector: IconSelScr,
},
  {
    initialRouteName: 'Rewards',
  });

RewardsStack.navigationOptions = {
  tabBarLabel: I18n.t('rewards')
  ,
  tabBarIcon: ({ focused }) => (
    <Icon.Ionicons
        name={Platform.OS === 'ios' ? 'ios-gift' : 'md-gift'}
        size={26}
        style={{ marginBottom: (Dimensions.get('window').width<1000?-5:0) }}
        color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
  ),
};

export default createBottomTabNavigator({
  TasksStack,
  RewardsStack,
},
  {
    tabBarOptions: {
      labelStyle: { fontSize: 12, lineHeight: 20, fontWeight: "600" },
      activeTintColor: Colors.tabIconSelected,
      inactiveTintColor: Colors.tabIconDefault,
      labelPosition: (Dimensions.get('window').width<1000?'below-icon':'beside-icon')
    }
  });
