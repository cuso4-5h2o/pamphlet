import React from 'react';
import {
  Alert,
  AlertIOS,
  AsyncStorage,
  DeviceEventEmitter,
  Platform,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import * as Icon from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Appearance } from 'react-native-appearance';

import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import RadiusBtn from '../components/RadiusBtn';
import HeaderIconBtn from '../components/HeaderIconBtn';

import { Notifications, ScreenOrientation } from 'expo';
import * as SQLite from 'expo-sqlite';
import Moment from 'moment';
import DatePicker from 'react-native-datepicker';
import { I18n } from '../langs/I18n';

export default class TasksScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: '',
      queryDay: Moment().format('MM-DD-YYYY'),
      showSeconds: false,
      showCompletedTasks: false,
      showUsedTimeRatio: false,
      showRemainingTimeRatio: false,
      taskSummary: false,
      interval: null,
      notiListener: null,
      loading: true,
      showStatusBar: true,
      darkMode: (Appearance.getColorScheme() == 'dark'),
    };
    this._initListener = () => {
      _refreshStatusBar = (orientationInfo) => {
        this.setState({ showStatusBar: (orientationInfo.orientation == ScreenOrientation.Orientation.LANDSCAPE || orientationInfo.orientation == ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientationInfo.orientation == ScreenOrientation.Orientation.LANDSCAPE_RIGHT) ? false : true })
      }
      ScreenOrientation.addOrientationChangeListener((ori) => {
        _refreshStatusBar(ori.orientationInfo);
      });
      setTimeout(() => {
        _refreshStatusBar(ScreenOrientation.getOrientationAsync());
      }, 1);
      _refreshColor = (colorScheme) => {
        this.props.navigation.setParams({
          darkMode: colorScheme == 'dark'
        });
        this.setState({ darkMode: colorScheme == 'dark' });
      }
      Appearance.addChangeListener(({ colorScheme }) => {
        _refreshColor(colorScheme);
      });
      setTimeout(() => {
        _refreshColor(Appearance.getColorScheme());
      }, 1);
    }
    this.subscription = DeviceEventEmitter.addListener("refresh", () => { setTimeout(() => {this._initListener()}, 5 )});
    this._initListener();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('tasks'),
      headerLeft: (
        <HeaderIconBtn
          ion="cog"
          color={Colors.tintColor}
          onPress={() => { navigation.navigate('Settings', { onReturn: () => { navigation.getParam('reloadList', null)(true) } }); }}
        />
      ),
      headerRight: (
        <Touchable onPress={() => { navigation.navigate('Records'); }} onLongPress={() => { navigation.getParam('toggleShowCompletedTasks', null)(); }}>
          <View style={{ flexDirection: 'row', height: 32, marginTop: 3, marginRight: 8 }}>
            <Icon.Ionicons
              name={Platform.OS === 'ios' ? 'ios-sunny' : 'md-sunny'}
              size={26}
              style={{ marginBottom: -3 }}
              color={Colors.tintColor}
            />
            <Text style={[{ flexDirection: 'row', marginTop: 4.5, marginLeft: 4 }, navigation.getParam('darkMode', false) ? darkStyles.text : null]}>{navigation.getParam('coin', '')}</Text>
          </View>
        </Touchable>
      ),
    }
  };

  componentDidMount() {
    this._initListener = () => {
      _refreshStatusBar = (orientationInfo) => {
        this.setState({ showStatusBar: (orientationInfo.orientation == ScreenOrientation.Orientation.LANDSCAPE || orientationInfo.orientation == ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientationInfo.orientation == ScreenOrientation.Orientation.LANDSCAPE_RIGHT) ? false : true })
      }
      ScreenOrientation.addOrientationChangeListener((ori) => {
        _refreshStatusBar(ori.orientationInfo);
      });
      setTimeout(() => {
        _refreshStatusBar(ScreenOrientation.getOrientationAsync());
      }, 1);
      _refreshColor = (colorScheme) => {
        this.props.navigation.setParams({
          darkMode: colorScheme == 'dark'
        });
        this.setState({ darkMode: colorScheme == 'dark' });
      }
      Appearance.addChangeListener(({ colorScheme }) => {
        _refreshColor(colorScheme);
      });
      setTimeout(() => {
        _refreshColor(Appearance.getColorScheme());
      }, 1);
    }
    this.subscription = DeviceEventEmitter.addListener("refresh", () => { setTimeout(() => {this._initListener()}, 5 )});
    this._initListener();
    this.props.navigation.setParams({
      reloadList: (reInit) => { this._reloadList(reInit) },
      toggleShowCompletedTasks: async () => {
        await AsyncStorage.setItem('showCompletedTasks', (await AsyncStorage.getItem('showCompletedTasks') == '1' ? '0' : '1'));
        this.setState({
          showCompletedTasks: !this.state.showCompletedTasks,
        });
      }
    });
    this._reloadList(true);
    notiListener = Notifications.addListener((notification) => {
      let _deal = () => {
        if (this.state.loading) {
          setTimeout(_deal, 400);
        }
        else {
          if (notification.origin == 'selected') {
            switch (notification.actionId) {
              case 'start':
                for (let i in this.state.tasks) {
                  if (this.state.tasks[i].taskId == notification.data.taskId) {
                    let queryDay = notification.data.queryDay;
                    let status = JSON.parse(this.state.tasks[i].status);
                    let options = JSON.parse(this.state.tasks[i].options);
                    let startingTime = options.startingTime;
                    let deadline = options.deadline;
                    if ((deadline != 0 && startingTime != 0) ? Moment(startingTime, 'X').format('MM-DD-YYYY') != Moment(deadline, 'X').format('MM-DD-YYYY') : false)
                      querySDay = 'diff';
                    else
                      querySDay = queryDay;
                    let iii = this._findStatus(status, querySDay, true, (statusMod) => { status = statusMod }, notification.data.taskId);
                    if (status[iii].status == 0) {
                      this._complete(this.state.tasks[i], queryDay);
                    }
                  }
                }
                break;
              case 'complete':
                for (let i in this.state.tasks) {
                  if (this.state.tasks[i].taskId == notification.data.taskId) {
                    let queryDay = notification.data.queryDay;
                    let status = JSON.parse(this.state.tasks[i].status);
                    let options = JSON.parse(this.state.tasks[i].options);
                    let startingTime = options.startingTime;
                    let deadline = options.deadline;
                    if ((deadline != 0 && startingTime != 0) ? Moment(startingTime, 'X').format('MM-DD-YYYY') != Moment(deadline, 'X').format('MM-DD-YYYY') : false)
                      querySDay = 'diff';
                    else
                      querySDay = queryDay;
                    let iii = this._findStatus(status, querySDay, true, (statusMod) => { status = statusMod }, notification.data.taskId);
                    if (status[iii].status == 0 || status[iii].status == 1) {
                      this._complete(this.state.tasks[i], queryDay);
                    }
                  }
                }
                break;
            }
          }
        }
      }
      _deal();
    });
    interval = setInterval(() => {
      this._refreshTime();
    }, 1000);
    this.setState({
      notiListener,
      interval
    });
    this._checkAndWelcome();
  }

  componentWillUnmount() {
    if (this.state.notiListener != null) {
      this.state.notiListener.remove();
      this.setState({ notiListener: null });
    }
    if (this.state.interval != null) {
      clearInterval(this.state.interval)
      this.setState({ interval: null });
    }
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  };

  render() {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <StatusBar hidden={!this.state.showStatusBar} />
        <View style={styles.container}>
          <SwipeListView
            ListHeaderComponent={() => {
              return (
                <View style={[styles.datePickBar, (this.state.darkMode ? darkStyles.border : null)]}>
                  <HeaderIconBtn
                    ion="arrow-back"
                    color={Colors.tintColor}
                    onPress={() => {
                      this.setState({ queryDay: Moment(this.state.queryDay, 'MM-DD-YYYY').subtract(1, 'd').format('MM-DD-YYYY') });
                      this._reloadList();
                    }}
                  />
                  <Touchable delayLongPress={200} onPress={() => {
                    this.datePickerRef.onPressDate();
                  }} onLongPress={async () => {
                    this.setState({ queryDay: Moment().format('MM-DD-YYYY') });
                    this._reloadList();
                  }}>
                    <View class={styles.datePicker}>
                      <Text style={[{ fontSize: 16 }, (this.state.darkMode ? darkStyles.text : null)]}>{Moment(this.state.queryDay, 'MM-DD-YYYY').format('l')}</Text>
                    </View>
                  </Touchable>
                  <HeaderIconBtn
                    ion="arrow-forward"
                    color={Colors.tintColor}
                    onPress={() => {
                      this.setState({ queryDay: Moment(this.state.queryDay, 'MM-DD-YYYY').add(1, 'd').format('MM-DD-YYYY') });
                      this._reloadList();
                    }}
                  />
                </View>
              )
            }}
            data={this.state.tasks}
            renderItem={({ index, item }) => {
              let queryDay = this.state.queryDay;
              let options = JSON.parse(item.options);
              let status = JSON.parse(item.status);
              let startingTime = options.startingTime;
              let deadline = options.deadline;
              let subTasks = JSON.parse(item.subTasks);
              if ((deadline != 0 && startingTime != 0) ? Moment(startingTime, 'X').format('MM-DD-YYYY') != Moment(deadline, 'X').format('MM-DD-YYYY') : false)
                queryDay = 'diff';
              let ii = this._findStatus(status, queryDay, true, (statusMod) => { status = statusMod }, item.taskId);
              let tdStatus = status[ii].status;
              let tdSummary = status[ii].summary;
              return (
                <View style={[styles.item, (this.state.darkMode ? darkStyles.view : null), { display: ((!this.state.showCompletedTasks) && tdStatus == 2) ? 'none' : 'flex' }]}>
                  <View style={styles.optionIconContainer}>
                    <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-' + item.iconName : 'md-' + item.iconName} size={32} color={(item.iconColor == 'black' && this.state.darkMode) ? 'white' : item.iconColor} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <View style={{ flexDirection: 'row', marginRight: item.time.btn == '' ? (item.topTask == -1 ? 52 : 28) : (item.topTask == -1 ? 112 : 88) }}>
                      <Text style={[styles.itemText, { color: (this.state.darkMode ? (item.time.color == 'black' ? 'white' : item.time.color) : item.time.color) }]}>{item.taskName}</Text>
                      <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-flag' : 'md-flag'} size={16} color='gray' style={{ marginLeft: 4, marginTop: -2, display: item.topTask == -1 ? 'flex' : 'none' }} />
                    </View>
                    <View style={[styles.optionTimeContainer, { marginRight: (item.time.btn == '' ? 4 : 100) }]}>
                      <Icon.Ionicons
                        name={Platform.OS === 'ios' ? 'ios-' + item.time.icon : 'md-' + item.time.icon}
                        size={16}
                        style={{ marginRight: 4 }}
                        color={(this.state.darkMode ? (item.time.color == 'black' ? 'white' : item.time.color) : item.time.color)}
                      />
                      <Text style={[{ color: (this.state.darkMode ? (item.time.color == 'black' ? 'white' : item.time.color) : item.time.color) }]}>{item.time.text}</Text>
                    </View>
                    <Text style={[styles.itemDescription, { display: (item.description == null) ? 'none' : 'flex' }, { color: (this.state.darkMode ? 'white' : 'black') }]}>{item.description}</Text>
                    <View style={[styles.subtasksContainer, { display: (subTasks.length == 0) ? 'none' : 'flex' }]}>
                      <FlatList data={subTasks} renderItem={(subItems) => {
                        return (
                          <Touchable onPress={() => {
                            tasks = this.state.tasks;
                            if (status[ii].subTasks.indexOf(subItems.index) != -1) {
                              status[ii].subTasks.splice(status[ii].subTasks.indexOf(subItems.index), 1);
                            }
                            else {
                              if (status[ii].status == 0 && startingTime > 0) {
                                Alert.alert(I18n.t('taskNotStarted'), I18n.t('taskNotStartedDetail'));
                                return;
                              }
                              status[ii].subTasks.push(subItems.index);
                              if (tdStatus != 2 && tdStatus != 3 && tdStatus != 4) {
                                if (status[ii].subTasks.length == subTasks.length) {
                                  tdStatus = 2;
                                  this._complete(item);
                                  return;
                                }
                              }
                            }
                            this._updateStatus(status, item.taskId);
                            tasks[index].status = JSON.stringify(status);
                            this.setState({
                              tasks
                            });
                          }}>
                            <View style={styles.subtaskContainer}>
                              <Icon.Ionicons
                                name={(Platform.OS === 'ios' ? 'ios-radio-button-' : 'md-radio-button-') + ((status[ii].subTasks.indexOf(subItems.index) != -1) ? 'on' : 'off')}
                                size={22}
                                style={{ marginRight: 4 }}
                                color={(this.state.darkMode ? (item.time.color == 'black' ? 'white' : item.time.color) : item.time.color)}
                              />
                              <Text style={{marginTop:-1, color: (this.state.darkMode ? (item.time.color == 'black' ? 'white' : item.time.color) : item.time.color)}}>{subItems.item}</Text>
                            </View>
                          </Touchable>
                        );
                      }}
                        keyExtractor={(subItem, index) => index.toString()} />
                    </View>
                    <Text style={[styles.itemDescription, { display: (tdSummary == '') ? 'none' : 'flex' }]}>{((item.description == null) ? '' : '') + I18n.t('summary') + tdSummary}</Text>
                  </View>
                  <View style={[styles.optionRight, styles.optionBtnContainer]}>
                    <RadiusBtn onPress={() => {
                      if (tdStatus == 2)
                        this._undo(item);
                      else
                        this._complete(item);
                    }} btnName={item.time.btn} underlayColor={Colors.tintColor} btnStyle={{ width: 80, height: 24, borderRadius: 24, display: item.time.btn == '' ? 'none' : 'flex' }} />
                    <Text style={{ color: (this.state.darkMode ? 'white' : 'black') }}>+{item.bonusCoins}{JSON.parse(item.options).deductingCoins > 0 ? ('/-' + JSON.parse(item.options).deductingCoins) : ''}</Text>
                  </View>
                </View>
              )
            }}
            bounceFirstRowOnMount={false}
            keyExtractor={(item, index) => item.taskId.toString()}
            ItemSeparatorComponent={() => (
              <View style={[{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
                <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
              </View>
            )}
            renderHiddenItem={({ item }) => {
              return (
                <View style={styles.actionsContainer}>
                  <Touchable
                    style={[styles.actionButton]}
                    onPress={() => {
                      this.props.navigation.navigate('TasksEdit', {
                        mode: 'edit', item, onReturn: () => {
                          this._reloadList(true);
                        }
                      });
                    }}>
                    <Text style={styles.actionButtonText}>{I18n.t('edit')}</Text>
                  </Touchable>
                  <Touchable
                    style={[styles.actionButton, styles.actionDangerousButton]}
                    onPress={() => {
                      if (JSON.parse(item.options).repeats.type == 0) {
                        Alert.alert(
                          I18n.t('taskDeleteTitle'),
                          I18n.t('taskDeleteText'),
                          [
                            {
                              text: I18n.t('cancel'),
                              style: 'cancel',
                            },
                            {
                              text: I18n.t('yes'),
                              style: 'destructive',
                              onPress: () => {
                                const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
                                db.transaction((tx) => {
                                  tx.executeSql(`delete from tasks where taskId = ?;`, [item.taskId], (tx, result) => {
                                    this._reloadList(true);
                                  })
                                });
                              }
                            },
                          ]
                        );
                      }
                      else {
                        Alert.alert(
                          I18n.t('taskDeleteTitle'),
                          I18n.t('taskDeleteRepeatsText'),
                          [
                            {
                              text: I18n.t('no'),
                              style: 'cancel',
                            },
                            {
                              text: I18n.t('deleteForThisDay'),
                              onPress: () => {
                                queryDay = this.state.queryDay;
                                status = JSON.parse(item.status);
                                xi = this._findStatus(status, queryDay);
                                status[xi].status = -1;
                                this._updateStatus(status, item.taskId, true, true);
                                const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
                                db.transaction((tx) => {
                                  tx.executeSql(`UPDATE tasks SET status = ? WHERE taskId = ?;`, [JSON.stringify(status), item.taskId], (tx, result) => {
                                    this._reloadList(true);
                                  });
                                });
                              }
                            },
                            {
                              text: I18n.t('deleteForAllDays'),
                              style: 'destructive',
                              onPress: () => {
                                const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
                                db.transaction((tx) => {
                                  tx.executeSql(`delete from tasks where taskId = ?;`, [item.taskId], (tx, result) => {
                                    this._reloadList(true);
                                  })
                                });
                              }
                            },
                          ]
                        );
                      }
                    }}>
                    <Text style={styles.actionButtonText}>{I18n.t('delete')}</Text>
                  </Touchable>
                </View>
              )
            }}
            rightOpenValue={-160}
          />
          <DatePicker
            style={{ width: 0, height: 0 }}
            date={this.state.queryDay}
            mode="date"
            format="MM-DD-YYYY"
            showIcon={false}
            hideText={true}
            locale={I18n.t('locale')}
            confirmBtnText={I18n.t('done')}
            cancelBtnText={I18n.t('close')}
            customStyles={{
              datePicker: {
                backgroundColor: this.state.darkMode ? Colors.darkView : Colors.view,
                borderTopColor: this.state.darkMode ? Colors.darkBorder : Colors.border,
              },
              datePickerCon: {
                backgroundColor: this.state.darkMode ? Colors.darkBlock : Colors.background,
              },
              btnTextConfirm: {
                color: Colors.tintColor,
              },
            }}
            ref={(ref) => this.datePickerRef = ref}
            onDateChange={(datetime) => {
              this.setState({ queryDay: datetime });
              this._reloadList();
            }}
          />
          <Touchable
            style={styles.option}
            onPress={this._newTask}
            onLongPress={this._clearTask.bind(this)}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.optionIconContainer}>
                <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-add-circle' : 'md-add-circle'} size={28} color={Colors.tintColor} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>{I18n.t('newTask') + (this.state.saved == '1' ? '' : ' (' + I18n.t('unsaved') + ')')}</Text>
              </View>
            </View>
          </Touchable>
        </View>
      </SafeAreaView>
    );
  }

  _complete = async (item, queryDay = this.state.queryDay, time = Moment().format('X'), force = false) => {
    let options = JSON.parse(item.options);
    let status = JSON.parse(item.status);
    let startingTime = options.startingTime;
    let deadline = options.deadline;
    if ((deadline != 0 && startingTime != 0) ? (Moment(startingTime, 'X').format('MM-DD-YYYY') == Moment(deadline, 'X').format('MM-DD-YYYY')) : true) {
      if (startingTime != 0)
        startingTime = Moment(queryDay + ' ' + (Moment(startingTime, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
      if (deadline != 0)
        deadline = Moment(queryDay + ' ' + (Moment(deadline, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
      querySDay = queryDay;
    }
    else
      querySDay = 'diff';
    let xi = this._findStatus(status, querySDay);
    if (xi == -1) {
      if (this._isThisDayTask(queryDay, deadline, startingTime, options.repeats, status)) {
        xi = this._findStatus(status, querySDay, true, (statusMod) => { status = statusMod }, item.taskId);
      }
      else return;
    }
    if (status[xi].status >= 3 || status[xi].status == -1) return;
    if (status[xi].status == 2 && !force) return;
    if (status[xi].status == 0 && startingTime > 0) {
      status[xi].startingTime = time;
      status[xi].completeTime = time;
      status[xi].status = 1;
      this._updateStatus(status, item.taskId, true, true);
    }
    else {
      if (this.state.taskSummary) {
        AlertIOS.prompt(
          item.taskName,
          I18n.t('enterTaskSummary'),
          [
            {
              text: I18n.t('cancel'),
              style: 'cancel',
            },
            {
              text: I18n.t('complete'),
              onPress: (summary) => {
                status[xi].completeTime = time;
                status[xi].status = 2;
                status[xi].summary = summary.trim();
                status[xi].subTasks = [];
                let subTasksNum = JSON.parse(item.subTasks).length;
                for (let t = 0; t < subTasksNum; t++)
                  status[xi].subTasks.push(t);
                this._editCoin(item.bonusCoins, '+', I18n.t('complete'), item.taskName, time);
                this._updateStatus(status, item.taskId, true, true);
              },
            },
          ]
        );
      }
      else {
        status[xi].completeTime = time;
        status[xi].status = 2;
        status[xi].subTasks = [];
        let subTasksNum = JSON.parse(item.subTasks).length;
        for (let t = 0; t < subTasksNum; t++)
          status[xi].subTasks.push(t);
        this._editCoin(item.bonusCoins, '+', I18n.t('complete'), item.taskName, time);
        this._updateStatus(status, item.taskId, true, true);
        if (await AsyncStorage.getItem('firstCompleted') == null) {
          await AsyncStorage.setItem('firstCompleted', '1');
          Alert.alert(I18n.t('completeFirstTitle'), I18n.t('completeFirstText'))
        }
      }
    }
  }

  _undo = async (item, queryDay = this.state.queryDay, time = Moment().format('X')) => {
    let options = JSON.parse(item.options);
    let status = JSON.parse(item.status);
    let startingTime = options.startingTime;
    let deadline = options.deadline;
    if ((deadline != 0 && startingTime != 0) ? (Moment(startingTime, 'X').format('MM-DD-YYYY') == Moment(deadline, 'X').format('MM-DD-YYYY')) : true) {
      if (startingTime != 0)
        startingTime = Moment(queryDay + ' ' + (Moment(startingTime, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
      if (deadline != 0)
        deadline = Moment(queryDay + ' ' + (Moment(deadline, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
      querySDay = queryDay;
    }
    else
      querySDay = 'diff';
    let xi = this._findStatus(status, querySDay);
    if (xi == -1) return;
    if (status[xi].status != 2) return;
    status[xi].status = (((startingTime > 0) && (startingTime <= Moment().format('X'))) ? 1 : 0);
    if (status[xi].status == 0 && startingTime > 0)
      status[xi].subTasks = [];
    status[xi].summary = '';
    this._editCoin(item.bonusCoins, '-', I18n.t('undo') + ' ' + I18n.t('complete'), item.taskName, time);
    this._updateStatus(status, item.taskId, true, true);
  }

  _newTask = async () => {
    this.props.navigation.navigate('TasksEdit', {
      mode: 'new', onReturn: () => {
        this._reloadList(true);
      }
    });
  };

  _clearTask() {
    if (this.state.saved != '1') {
      Alert.alert(I18n.t('clearContentTitle'), I18n.t('clearContentText'), [
        {
          text: I18n.t('no'),
          style: 'cancel',
        },
        {
          text: I18n.t('yes'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('unsavedTask');
            this.setState({
              saved: '1',
            });
          }
        }
      ]);
    }
  };

  _reloadList(reInit = false) {
    this.setState({ loading: true });
    AsyncStorage.getItem('coin', (error, coin) => {
      if (coin != null)
        this.props.navigation.setParams({ coin });
    })
    AsyncStorage.getItem('showSeconds', (error, data) => {
      this.setState({ showSeconds: (data == '1') });
    });
    AsyncStorage.getItem('showCompletedTasks', (error, data) => {
      this.setState({ showCompletedTasks: (data == '1') });
    });
    AsyncStorage.getItem('showUsedTimeRatio', (error, data) => {
      this.setState({ showUsedTimeRatio: (data == '1') });
    });
    AsyncStorage.getItem('showRemainingTimeRatio', (error, data) => {
      this.setState({ showRemainingTimeRatio: (data == '1') });
    });
    AsyncStorage.getItem('taskSummary', (error, data) => {
      this.setState({ taskSummary: (data == '1') });
    });
    AsyncStorage.getItem('unsavedTask', (error, data) => {
      this.setState({ saved: (data == null) ? '1' : '0' });
    })
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`select * from tasks order by topTask,taskId asc;`, [], async (tx, result) => {
        let taskList = [];
        let rawTasks = result.rows._array;
        if (reInit) {
          rawTasks = await this._initList(rawTasks);
        }
        for (index in rawTasks) {
          options = JSON.parse(rawTasks[index].options);
          if (this._isThisDayTask(this.state.queryDay, options.deadline, options.startingTime, options.repeats, JSON.parse(rawTasks[index].status))) {
            taskList.push(rawTasks[index]);
          }
        }
        this.setState({ loading: false });
        this._refreshTime(taskList, true);
      })
    });
  }

  _refreshTime(tasks = this.state.tasks, force = false) {
    if (this.state.loading && !force) return;
    AsyncStorage.getItem('coin', (error, coin) => {
      if (coin != null)
        this.props.navigation.setParams({ coin });
    })
    let queryDay = this.state.queryDay;
    for (x in tasks) {
      let options = JSON.parse(tasks[x].options);
      let status = JSON.parse(tasks[x].status);
      let startingTime = options.startingTime;
      let deadline = options.deadline;
      if ((deadline != 0 && startingTime != 0) ? (Moment(startingTime, 'X').format('MM-DD-YYYY') == Moment(deadline, 'X').format('MM-DD-YYYY')) : true) {
        if (startingTime != 0)
          startingTime = Moment(queryDay + ' ' + (Moment(startingTime, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
        if (deadline != 0)
          deadline = Moment(queryDay + ' ' + (Moment(deadline, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
        querySDay = queryDay;
      }
      else
        querySDay = 'diff';
      let xi = this._findStatus(status, querySDay, true, (statusMod) => { status = statusMod; tasks[x].status = JSON.stringify(status) }, tasks[x].taskId);
      tdStatus = status[xi].status;
      switch (tdStatus) {
        case 0:
          if (deadline != 0 && ((deadline != 0 && startingTime != 0) ? (Moment(startingTime, 'X').format('MM-DD-YYYY') == Moment(deadline, 'X').format('MM-DD-YYYY')) : true)) {
            let dur = Moment.duration(Moment().diff(Moment(deadline, 'X')));
            text = I18n.t('leftToDeadline').replace('!leftTime!', this._formatLeftTime(dur));
            if (Moment().format('X') >= deadline) this._reloadList(true);
            btn = I18n.t('complete');
          }
          if (startingTime != 0) {
            let dur = Moment.duration(Moment().diff(Moment(startingTime, 'X')));
            if (Moment().format('X') >= startingTime) this._reloadList(true);
            text = I18n.t('leftToStart').replace('!leftTime!', this._formatLeftTime(dur));
            btn = I18n.t('start');
          }
          tasks[x].time = {
            icon: 'time',
            color: 'black',
            text,
            btn
          }
          break;
        case 1:
          dur = Moment.duration(Moment().diff(Moment(deadline, 'X')));
          if (Moment().format('X') >= deadline) this._reloadList(true);
          text = I18n.t('leftToDeadline').replace('!leftTime!', this._formatLeftTime(dur)) + ((this.state.showUsedTimeRatio || this.state.showRemainingTimeRatio) ? ', ' + 
            (this.state.showUsedTimeRatio ? 
              ((((Moment().format('X') - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime)) / (deadline - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime))) * 100).toFixed(4) > 0 ? (((Moment().format('X') - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime)) / (deadline - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime))) * 100).toFixed(4) : '0.0000') : 
              (100 - ((((Moment().format('X') - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime)) / (deadline - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime))) * 100).toFixed(4) > 0 ? (((Moment().format('X') - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime)) / (deadline - ((status[xi].startingTime > 0) ? status[xi].startingTime : startingTime))) * 100) : 0)).toFixed(4)) 
              + '%' : '');
          tasks[x].time = {
            icon: 'time',
            color: 'black',
            text,
            btn: I18n.t('complete')
          }
          break;
        case 2:
          tasks[x].time = {
            icon: 'checkmark-circle',
            color: 'green',
            text: I18n.t(deadline == 0 ? 'startedAt' : 'completedAt') + ' ' + Moment((deadline == 0 && status[xi].startingTime > 0) ? status[xi].startingTime : status[xi].completeTime, 'X').format('l LT'),
            btn: (deadline > 0 ? (deadline > Moment().format('X') ? I18n.t('undo') : '') : (startingTime > Moment().format('X') ? (options.comfirmStart ? I18n.t('undo') : '') : ''))
          }
          break;
        case 3:
          tasks[x].time = {
            icon: 'alert',
            color: 'red',
            text: (startingTime > 0) ? I18n.t('exceedAt').replace('!type!', I18n.t('startingTime')) + ' ' + Moment(startingTime, 'X').format('LT') : I18n.t('exceed').replace('!type!', I18n.t('startingTime')),
            btn: '',
          }
          break;
        case 4:
          tasks[x].time = {
            icon: 'alert',
            color: 'red',
            text: (deadline > 0) ? I18n.t('exceedAt').replace('!type!', I18n.t('deadline')) + ' ' + Moment(deadline, 'X').format('LT') : I18n.t('exceed').replace('!type!', I18n.t('deadline')),
            btn: ''
          }
          break;
      };
    }
    this.setState({ tasks });
  }

  async _initList(list) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    (Platform.OS === 'ios') ? (await Notifications.setBadgeNumberAsync(0)) : (await Notifications.dismissAllNotificationsAsync());
    let notis = [];
    lastInit = parseInt(await AsyncStorage.getItem('lastInit'));
    if (lastInit == null) {
      lastInit = Moment().format('X');
    }
    if (Moment().format('X') < lastInit) {
      lastInit = Moment().format('X');
    }
    toLastInit = Math.ceil(Moment.duration(Moment().diff(Moment(lastInit == null ? new Date() : new Date(lastInit * 1000)))).asDays());
    for (let i in list) {
      let options = JSON.parse(list[i].options);
      let plandNoti = false;
      for (let ii = toLastInit; ii >= -8; ii--) {
        let queryDay = Moment().subtract(ii, 'd').format('MM-DD-YYYY');
        let deadline = options.deadline;
        let startingTime = options.startingTime;
        let repeats = options.repeats;
        let reminders = options.reminders;
        let status = JSON.parse(list[i].status);
        if (this._isThisDayTask(Moment().subtract(ii, 'd').format('MM-DD-YYYY'), deadline, startingTime, repeats, status)) {
          let tdStatus = 0;
          let expireST = false;
          let expireDDL = false;
          if ((deadline != 0 && startingTime != 0) ? Moment(startingTime, 'X').format('MM-DD-YYYY') != Moment(deadline, 'X').format('MM-DD-YYYY') : false)
            querySDay = 'diff';
          else
            querySDay = queryDay;
          for (let iii in status) {
            if (status[iii].day == querySDay) {
              tdStatus = status[iii].status;
            }
          }
          let statusIndex = this._findStatus(status, querySDay, true, (statusMod) => { status = statusMod }, list[i].taskId);
          tdStatus = status[statusIndex].status;
          if (tdStatus == 2) continue;
          if (deadline != 0 && startingTime != 0 && Moment(deadline, 'X').format('MM-DD-YYYY') != Moment(startingTime, 'X').format('MM-DD-YYYY')) {
            if (startingTime <= Moment().format('X')) {
              if (tdStatus == 0) {
                if (options.comfirmStart) {
                  expireST = true;
                  tdStatus = 3;
                }
                else {
                  if (deadline == 0)
                    this._complete(list[i]);
                  else {
                    status[statusIndex].startingTime = startingTime;
                    tdStatus = 1;
                  }
                }
              }
            }
            if (deadline <= Moment().format('X')) {
              if (tdStatus == 0 || tdStatus == 1) {
                expireDDL = true;
                tdStatus = 4;
              }
            }
            if (startingTime > 0) {
              if (startingTime > Moment().format('X') && (tdStatus == 0 || tdStatus == 1)) {
                if (notis.indexOf(list[i].taskId) == -1) {
                  for (iiii in reminders) {
                    this._planReminder(true, startingTime, reminders[iiii], repeats, null, list[i].taskName, list[i].taskId, queryDay);
                    plandNoti = true;
                  }
                  if (await AsyncStorage.getItem('taskFailureReminder') == '1' && options.comfirmStart) {
                    this._planReminder(true, startingTime, 0, repeats, null, list[i].taskName, -1, '', true);
                    plandNoti = true;
                  }
                }
              }
            }
            if (deadline > 0) {
              if (deadline > Moment().format('X') && (tdStatus == 0 || tdStatus == 1)) {
                if (notis.indexOf(list[i].taskId) == -1 && tdStatus != -3 && (!(tdStatus == 0 && startingTime > 0))) {
                  for (iiii in reminders) {
                    this._planReminder(false, deadline, reminders[iiii], repeats, null, list[i].taskName, list[i].taskId, queryDay);
                    plandNoti = true;
                  }
                  if (await AsyncStorage.getItem('taskFailureReminder') == '1') {
                    this._planReminder(false, deadline, 0, repeats, null, list[i].taskName, -1, '', true);
                    plandNoti = true;
                  }
                }
              }
            }
          }
          else {
            if (startingTime > 0) {
              startingTime = Moment(queryDay + ' ' + (Moment(startingTime, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
              if (startingTime <= Moment().format('X')) {
                if (tdStatus == 0) {
                  if (options.comfirmStart) {
                    expireST = true;
                    tdStatus = 3;
                  }
                  else {
                    tdStatus = (deadline == 0) ? 2 : 1;
                    if (deadline == 0) this._complete(list[i], querySDay, startingTime, true);
                  }
                }
              }
            }
            if (deadline > 0) {
              deadline = Moment(queryDay + ' ' + (Moment(deadline, 'X').format('LT')), 'MM-DD-YYYY LT').format('X');
              if (deadline <= Moment().format('X')) {
                if (tdStatus == 0 || tdStatus == 1 || tdStatus == 3) {
                  expireDDL = true;
                  tdStatus = 4;
                }
              }
            }
            if (startingTime > 0) {
              if (startingTime > Moment().format('X') && (tdStatus == 0 || tdStatus == 1)) {
                if (notis.indexOf(list[i].taskId) == -1) {
                  if (repeats.end != 0 && Moment(queryDay, 'MM-DD-YYYY').isSame(new Date(repeats.end * 1000), 'day')) {
                    repeats.type = 0;
                  }
                  switch (repeats.type) {
                    case 0:
                      for (iiii in reminders) {
                        this._planReminder(true, startingTime, reminders[iiii], repeats, null, list[i].taskName, list[i].taskId, queryDay);
                        plandNoti = true;
                      }
                      if (await AsyncStorage.getItem('taskFailureReminder') == '1' && options.comfirmStart) {
                        this._planReminder(true, startingTime, 0, repeats, null, list[i].taskName, -1, '', true);
                        plandNoti = true;
                      }
                      break;
                    case 1:
                      repeatsT = 'day';
                    case 2:
                      repeatsT = 'week';
                      for (iiii in reminders) {
                        this._planReminder(true, startingTime, reminders[iiii], repeats, repeatsT, list[i].taskName, list[i].taskId, queryDay);
                        plandNoti = true;
                      }
                      if (await AsyncStorage.getItem('taskFailureReminder') == '1' && options.comfirmStart) {
                        this._planReminder(true, startingTime, 0, repeats, repeatsT, list[i].taskName, -1, '', true);
                        plandNoti = true;
                      }
                      break;
                    case 3:
                      weekdays = [1, 2, 3, 4, 5];
                      weekends = [0, 6];
                      tWeek = (weekdays.indexOf(Moment(startingTime, 'X').day()) != -1 ? weekdays : weekends);
                      for (iiiii in tWeek) {
                        twStartingTime = Moment(startingTime, 'X').day(tWeek[iiiii]).format('X');
                        twQueryDay = Moment(twStartingTime, 'X').format('MM-DD-YYYY');
                        for (iiii in reminders) {
                          this._planReminder(true, twStartingTime, reminders[iiii], repeats, 'week', list[i].taskName, list[i].taskId, twQueryDay);
                          plandNoti = true;
                        }
                        if (await AsyncStorage.getItem('taskFailureReminder') == '1' && options.comfirmStart) {
                          this._planReminder(true, twStartingTime, 0, repeats, 'week', list[i].taskName, -1, '', true);
                          plandNoti = true;
                        }
                      }
                      break;
                    case 4:
                      repeatsT = 'month';
                    case 5:
                      repeatsT = 'year';
                      for (iiii in reminders) {
                        this._planReminder(true, startingTime, reminders[iiii], repeats, repeatsT, list[i].taskName, list[i].taskId, queryDay);
                        plandNoti = true;
                      }
                      if (await AsyncStorage.getItem('taskFailureReminder') == '1' && options.comfirmStart) {
                        this._planReminder(true, startingTime, 0, repeats, repeatsT, list[i].taskName, -1, '', true);
                        plandNoti = true;
                      }
                      break;
                  }
                }
              }
            }
            if (deadline > 0) {
              if (deadline > Moment().format('X') && (tdStatus == 0 || tdStatus == 1)) {
                if (notis.indexOf(list[i].taskId) == -1 && tdStatus != -3 && (!(tdStatus == 0 && startingTime > 0))) {
                  if (repeats.end != 0 && Moment(queryDay, 'MM-DD-YYYY').isSame(new Date(repeats.end * 1000), 'day')) {
                    repeats.type = 0;
                  }
                  switch (repeats.type) {
                    case 0:
                      for (iiii in reminders) {
                        this._planReminder(false, deadline, reminders[iiii], repeats, null, list[i].taskName, list[i].taskId, queryDay);
                        plandNoti = true;
                      }
                      if (await AsyncStorage.getItem('taskFailureReminder') == '1') {
                        this._planReminder(false, deadline, 0, repeats, null, list[i].taskName, -1, '', true);
                        plandNoti = true;
                      }
                      break;
                    case 1:
                      repeatsT = 'day';
                    case 2:
                      repeatsT = 'week';
                      for (iiii in reminders) {
                        this._planReminder(false, deadline, reminders[iiii], repeats, repeatsT, list[i].taskName, list[i].taskId, queryDay);
                        plandNoti = true;
                      }
                      if (await AsyncStorage.getItem('taskFailureReminder') == '1') {
                        this._planReminder(false, deadline, 0, repeats, repeatsT, list[i].taskName, -1, '', true);
                        plandNoti = true;
                      }
                      break;
                    case 3:
                      weekdays = [1, 2, 3, 4, 5];
                      weekends = [0, 6];
                      tWeek = (weekdays.indexOf(Moment(deadline, 'X').day()) != -1 ? weekdays : weekends);
                      for (iiiii in tWeek) {
                        twDeadline = Moment(deadline, 'X').day(tWeek[iiiii]).format('X');
                        twQueryDay = Moment(twDeadline, 'X').format('MM-DD-YYYY');
                        for (iiii in reminders) {
                          this._planReminder(false, twDeadline, reminders[iiii], repeats, 'week', list[i].taskName, list[i].taskId, twQueryDay);
                          plandNoti = true;
                        }
                        if (await AsyncStorage.getItem('taskFailureReminder') == '1') {
                          this._planReminder(false, twDeadline, 0, repeats, 'week', list[i].taskName, -1, '', true);
                          plandNoti = true;
                        }
                      }
                      break;
                    case 4:
                      repeatsT = 'month';
                    case 5:
                      repeatsT = 'year';
                      for (iiii in reminders) {
                        this._planReminder(false, deadline, reminders[iiii], repeats, repeatsT, list[i].taskName, list[i].taskId, queryDay);
                        plandNoti = true;
                      }
                      if (await AsyncStorage.getItem('taskFailureReminder') == '1') {
                        this._planReminder(false, deadline, 0, repeats, repeatsT, list[i].taskName, -1, '', true);
                        plandNoti = true;
                      }
                      break;
                  }
                }
              }
            }
          }
          for (iii in status) {
            if (status[iii].day == querySDay) {
              status[iii].status = tdStatus;
            }
          }
          if (expireST && options.deductingCoins > 0) {
            await this._editCoin(options.deductingCoins, '-', I18n.t('exceed').replace('!type!', I18n.t('startingTime')), list[i].taskName, startingTime)
          }
          if (expireDDL && options.deductingCoins > 0) {
            await this._editCoin(options.deductingCoins, '-', I18n.t('exceed').replace('!type!', I18n.t('deadline')), list[i].taskName, deadline)
          }
          if (expireST || expireDDL) {
            this._updateStatus(status, list[i].taskId);
          }
          list[i].status = JSON.stringify(status);
          if (plandNoti)
            notis.push(list[i].taskId);
        }
      }
    }
    await AsyncStorage.setItem('lastInit', Moment().format('X').toString());
    return list;
  }

  _isThisDayTask(queryDay, deadline, startingTime, repeats, status) {
    taskTime = (startingTime == 0 ? deadline : startingTime);
    for (i in status) {
      if (status[i].day == queryDay) {
        if (status[i].status == -1) {
          return false;
        }
      }
    }
    if (deadline != 0 && Moment(queryDay, 'MM-DD-YYYY').isSame(Moment(deadline, 'X'), 'day')) {
      return true;
    }
    if (startingTime != 0 && Moment(queryDay, 'MM-DD-YYYY').isSame(Moment(startingTime, 'X'), 'day')) {
      return true;
    }
    if (deadline != 0 && startingTime != 0 && Moment(queryDay, 'MM-DD-YYYY').isBetween(Moment(startingTime, 'X').subtract(1, 'd'), Moment(deadline, 'X'))) {
      return true;
    }
    if (repeats.type != 0 && Moment(queryDay, 'MM-DD-YYYY').isBefore(Moment(taskTime, 'X'), 'day')) {
      return false;
    }
    if (repeats.end != 0 && Moment(queryDay, 'MM-DD-YYYY').isAfter(Moment(repeats.end, 'X'), 'day')) {
      return false;
    }
    switch (repeats.type) {
      case 0:
        return false;
      case 1:
        return true;
      case 2:
        return (Moment(queryDay, 'MM-DD-YYYY').day()) == (Moment(taskTime, 'X').day());
      case 3:
        if ((Moment(queryDay, 'MM-DD-YYYY').day() >= 1) && (Moment(queryDay, 'MM-DD-YYYY').day() <= 5)) {
          return ((Moment(taskTime, 'X').day() >= 1) && (Moment(taskTime, 'X').day() <= 5));
        }
        else {
          return ((Moment(taskTime, 'X').day() == 0) || (Moment(taskTime, 'X').day() == 6));
        }
      case 4:
        return (Moment(queryDay, 'MM-DD-YYYY').date()) == (Moment(taskTime, 'X').date());
      case 5:
        if ((Moment(queryDay, 'MM-DD-YYYY').month()) == (Moment(taskTime, 'X').month()))
          return ((Moment(queryDay, 'MM-DD-YYYY').date()) == (Moment(taskTime, 'X').date()))
        else
          return false;
    }
  }

  _formatLeftTime(dur) {
    let formated = '';
    let showZero = false;
    if (dur.years() != 0 || showZero) {
      formated += Math.abs(dur.years()) + I18n.t('ayear') + ' ';
      showZero = true;
    }
    if (dur.months() != 0 || showZero) {
      formated += Math.abs(dur.months()) + I18n.t('amonth') + ' ';
      showZero = true;
    }
    if (dur.days() != 0 || showZero) {
      formated += Math.abs(dur.days()) + I18n.t('aday') + ' ';
      showZero = true;
    }
    if (dur.hours() != 0 || showZero) {
      formated += Math.abs(dur.hours()) + I18n.t('ahour') + ' ';
      showZero = true;
    }
    if (dur.minutes() != 0 || showZero) {
      formated += Math.abs(dur.minutes()) + I18n.t('amin') + ' ';
      showZero = true;
    }
    if (this.state.showSeconds) {
      if (formated == '' || showZero) {
        formated += Math.abs(dur.seconds()) + I18n.t('asec') + ' ';
        showZero = true;
      }
    }
    else {
      if (formated == '') formated = I18n.t('lessThanAMin');
    }
    return formated.trim();
  }

  _planReminder(basedST, basedTime, offsetTime, repeats, repeatsT, taskName, taskId, queryDay, failureReminder = false) {
    let isBasedST = (offsetTime >= 0);
    if (basedST != isBasedST && !failureReminder) return;
    let leftTime = Math.abs(offsetTime * 60);
    let sendTime = basedTime - leftTime;
    let nowLeft = sendTime - Moment().format('X');
    if (repeats.end != 0 && Moment(basedTime, 'X').isAfter(Moment(repeats.end, 'X'), 'day')) {
      return false;
    }
    if (nowLeft < 5 && repeats.type != 0) {
      for (let i = 1; i <= 30; i++) {
        queryDay = Moment().add(i, 'd').format('MM-DD-YYYY');
        if (repeats.end != 0 && Moment(queryDay, 'MM-DD-YYYY').isAfter(Moment(repeats.end, 'X'), 'day')) {
          return false;
        }
        let taskTime = basedTime;
        switch (repeats.type) {
          case 0:
            continue;
          case 1:
            break;
          case 2:
          case 3:
            if ((Moment(queryDay, 'MM-DD-YYYY').day()) == (Moment(taskTime, 'X').day()))
              break;
            else
              continue;
          case 4:
            if ((Moment(queryDay, 'MM-DD-YYYY').date()) == (Moment(taskTime, 'X').date()))
              break;
            else
              continue;
          case 5:
            if ((Moment(queryDay, 'MM-DD-YYYY').month()) == (Moment(taskTime, 'X').month()))
              if ((Moment(queryDay, 'MM-DD-YYYY').date()) == (Moment(taskTime, 'X').date()))
                break;
              else
                continue;
            else
              continue;
        }
        basedTime = Moment(queryDay + ' ' + Moment(taskTime, 'X').format('LT'), 'MM-DD-YYYY LT').format('X');
        sendTime = basedTime - leftTime;
        nowLeft = sendTime - Moment().format('X');
        break;
      }
    }
    if (nowLeft > 5) {
      if (failureReminder) {
        if (repeatsT == null) {
          Notifications.scheduleLocalNotificationAsync({
            title: I18n.t('taskFailed').replace('!taskName!', taskName),
            body: I18n.t(isBasedST ? 'taskFailedStartingTime' : 'taskFailedDeadline'),
            ios: {
              sound: true,
            }
          }, {
            time: new Date(sendTime * 1000)
          });
        }
        else {
          Notifications.scheduleLocalNotificationAsync({
            title: I18n.t('taskFailed').replace('!taskName!', taskName),
            body: I18n.t(isBasedST ? 'taskFailedStartingTime' : 'taskFailedDeadline'),
            ios: {
              sound: true,
            }
          }, {
            time: new Date(sendTime * 1000),
            repeats: repeatsT
          });
        }
      }
      else {
        if (repeatsT == null) {
          Notifications.scheduleLocalNotificationAsync({
            title: I18n.t((isBasedST ? ((offsetTime == 0) ? 'taskStarted' : 'closeToStartingTime') : 'closeToDeadline')).replace('!taskName!', taskName),
            body: I18n.t((isBasedST ? ((offsetTime == 0) ? 'taskStarted' : 'closeToStartingTime') : 'closeToDeadline') + 'Detail').replace((leftTime == 0) ? '!startingTime!' : '!leftTime!', (leftTime == 0) ? Moment(basedTime, 'X').format('LT') : this._formatLeftTime(Moment.duration(leftTime, 's'))),
            data: {
              taskId,
              queryDay,
            },
            categoryId: (isBasedST ? 'taskStartingTimeReminders' : 'taskDeadlineReminders'),
            ios: {
              sound: true,
            }
          }, {
            time: new Date(sendTime * 1000)
          });
        }
        else {
          Notifications.scheduleLocalNotificationAsync({
            title: I18n.t((isBasedST ? ((offsetTime == 0) ? 'taskStarted' : 'closeToStartingTime') : 'closeToDeadline')).replace('!taskName!', taskName),
            body: I18n.t((isBasedST ? ((offsetTime == 0) ? 'taskStarted' : 'closeToStartingTime') : 'closeToDeadline') + 'Detail').replace((leftTime == 0) ? '!startingTime!' : '!leftTime!', (leftTime == 0) ? Moment(basedTime, 'X').format('LT') : this._formatLeftTime(Moment.duration(leftTime, 's'))),
            data: {
              taskId,
              queryDay,
            },
            categoryId: (isBasedST ? 'taskStartingTimeReminders' : 'taskDeadlineReminders'),
            ios: {
              sound: true,
            }
          }, {
            time: new Date(sendTime * 1000),
            repeats: repeatsT
          });
        }
      }
    }
  }

  _checkAndWelcome = async () => {
    if (await AsyncStorage.getItem('dontShowWelcome') == null) {
      this.props.navigation.navigate('Welcome');
    }
  }

  _updateStatus(status, taskId, reload = false, reInit = false) {
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`UPDATE tasks SET status = ? WHERE taskId = ?;`, [JSON.stringify(status), taskId], (tx, result) => {
        if (reload) this._reloadList(reInit);
      });
    });
  }

  async _editCoin(changeCoin, changeType, opType, opName, opTime = Moment().format('X')) {
    coin = parseInt(await AsyncStorage.getItem('coin'));
    changeCoin = parseInt(changeCoin);
    await AsyncStorage.setItem('coin', (coin + (changeType == '+' ? changeCoin : (-changeCoin))).toString());
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`select recordId from records order by recordId desc;`, [], (tx, result) => {
        rows = result.rows._array;
        id = (rows.length == 0) ? 0 : (rows[0].recordId + 1);
        tx.executeSql('INSERT INTO records VALUES (?, ?, ?, ?);'
          , [id, '(' + opType + ') ' + opName, opTime,
            changeType + changeCoin.toString()
          ]
        );
      })
    });
    this._reloadList();
  }

  _findStatus(status, queryDay, autoCreate = false, autoUpdate = null, updateTaskId = 0) {
    let index = status.findIndex((element) => {
      return element.day == queryDay;
    });
    if (index == -1 & autoCreate) {
      index = status.length;
      status.push({
        day: queryDay,
        status: 0,
        subTasks: [],
        summary: '',
        startingTime: 0,
        completeTime: 0,
      });
      if (autoUpdate != null) {
        autoUpdate(status);
        this._updateStatus(status, updateTaskId);
      }
    }
    return index;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  datePickBar: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionsTitleText: {
    fontSize: 16,
    marginLeft: 15,
    marginBottom: 12,
  },
  optionTimeContainer: {
    flexDirection: 'row',
  },
  optionIconContainer: {
    marginRight: 12,
    width: 32,
  },
  optionBtnContainer: {
    top: 10,
    alignItems: 'center',
  },
  option: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: Colors.tintColor,
    fontWeight: 'bold',
    marginTop: 4.5,
  },
  optionTextContainer: {
    marginRight: 40,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtasksContainer: {
    marginTop: 8,
    marginRight: 40,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },
  itemDescription: {
    marginTop: 8,
    marginRight: 40,
  },
  item: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  optionRight: {
    position: "absolute",
    right: 8,
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 22,
    width: 80,
    backgroundColor: 'dimgray',
  },
  actionDangerousButton: {
    backgroundColor: 'red',
  },
  actionButtonText: {
    textAlign: 'center',
    color: 'white',
  },
});
