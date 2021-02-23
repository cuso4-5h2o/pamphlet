import React from 'react';
import Moment from 'moment';
import { I18n } from './langs/I18n';
import { AsyncStorage, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import { AppLoading, Icon, Notifications, Updates } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  UNSAFE_componentWillMount() {
    // this._resetApp();
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppearanceProvider>
          <AppLoading
            startAsync={this._loadResourcesAsync}
            onError={this._handleLoadingError}
            onFinish={this._handleFinishLoading}
          />
        </AppearanceProvider>
      );
    } else {
      return (
        <AppearanceProvider>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
          </View>
        </AppearanceProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    Notifications.createCategoryAsync('taskDeadlineReminders', [{ actionId: 'complete', buttonTitle: I18n.t('complete') }]);
    Notifications.createCategoryAsync('taskStartingTimeReminders', [{ actionId: 'start', buttonTitle: I18n.t('start') }]);
    Moment.locale(I18n.t('locale'));
    AsyncStorage.getItem('coin', (error, coin) => {
      if (coin == null)
        AsyncStorage.setItem('coin', '0');
    })
    AsyncStorage.getItem('showRemainingTimeRatio', (error, data) => {
      if (data == null)
        AsyncStorage.setItem('showRemainingTimeRatio', '1');
    })
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`select name from sqlite_master where type='table' order by name;`, [], (tx, result) => {
        rows = result.rows._array;
        if (rows.length == 0) {
          tx.executeSql(
            `CREATE TABLE tasks(
              taskId         INT PRIMARY KEY     NOT NULL,
              taskName       VARCHAR(255)        NOT NULL,
              description    TEXT,
              iconName       VARCHAR(255)        NOT NULL,
              iconColor      VARCHAR(255)        NOT NULL,
              status         TEXT                NOT NULL,
              subTasks       TEXT                NOT NULL,
              options        TEXT                NOT NULL,
              bonusCoins     INT                 NOT NULL,
              topTask        INT                 NOT NULL,
              changeTime     INT                 NOT NULL
              );`
            , [], (tx, result) => { }
          );
          tx.executeSql(
            `CREATE TABLE rewards(
              rewardId       INT PRIMARY KEY     NOT NULL,
              rewardName     VARCHAR(255)        NOT NULL,
              description    TEXT,
              iconName       VARCHAR(255)        NOT NULL,
              iconColor      VARCHAR(255)        NOT NULL,
              price          INT                 NOT NULL,
              changeTime     INT                 NOT NULL
              );`
            , [], (tx, result) => { }
          );
          tx.executeSql(
            `CREATE TABLE records(
              recordId       INT PRIMARY KEY     NOT NULL,
              recordName     VARCHAR(255)        NOT NULL,
              recordTime     INT                 NOT NULL,
              price          TEXT                NOT NULL
              );`
            , [], (tx, result) => { }
          );
        }
      })
    });
    setTimeout(async () => {
      if (!__DEV__) {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      }
    }, 30000);
    return Promise.all([
      Asset.loadAsync([
      ]),
      Font.loadAsync({
        ...Ionicons.font,
      })
    ]);
  };

  _handleLoadingError = error => {

  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  _resetApp() {
    AsyncStorage.clear();
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`select name from sqlite_master where type='table' order by name;`, [], (tx, result) => {
        rows = result.rows._array;
        for (i in rows) {
          tx.executeSql('DROP TABLE ' + rows[i].name + ';', []);
        }
      })
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
