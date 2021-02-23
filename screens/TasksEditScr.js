import React from 'react';
import {
  Alert,
  AsyncStorage,
  Button,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  SectionList,
  Switch,
  View,
} from 'react-native';
import { ScreenOrientation } from 'expo';
import * as SQLite from 'expo-sqlite';
import Moment from 'moment';
import { I18n } from '../langs/I18n';
import { Appearance } from 'react-native-appearance';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import * as Permissions from 'expo-permissions';
import Touchable from 'react-native-platform-touchable';
import DatePicker from 'react-native-datepicker';
import * as Icon from '@expo/vector-icons';

export default class TasksAddScr extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('mode', 'new') == 'new' ? I18n.t('newTask') : I18n.t('editTask'),
      headerRight: (
        <Button
          color={Colors.tintColor}
          disabled={navigation.getParam('canSave', '0') == '0'}
          title={navigation.getParam('mode', 'new') == 'new' ? I18n.t('add') : I18n.t('save')}
          onPress={navigation.getParam('saveTask')} />
      ),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      icon: {
        name: 'locate',
        color: Colors.tintColor
      },
      subtasks: [],
      setDeadline: true,
      deadline: Moment().add(2, 'h').format('X'),
      setStartingTime: false,
      startingTime: Moment().add(1, 'h').format('X'),
      comfirmStart: false,
      reminders: [],
      repeats: {
        type: 0,
        end: 0,
      },
      bonusCoins: '',
      enableDeduct: false,
      deductingCoins: '',
      toptask: false,
      interval: null,
      lockd: false,
      strictMode: false,
      changed: false,
      darkMode: (Appearance.getColorScheme() == 'dark'),
    }
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
  };

  componentDidMount = async () => {
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
    this.props.navigation.setParams({ saveTask: this._saveTask });
    this.setState({
      strictMode: (await AsyncStorage.getItem('strictMode') == '1'),
    });
    if (this.props.navigation.getParam('mode', 'new') == 'new') {
      unsavedTask = await AsyncStorage.getItem('unsavedTask');
      if (unsavedTask != null) {
        this.setState(JSON.parse(unsavedTask));
        this._checkData(JSON.parse(unsavedTask));
      }
      interval = setInterval(async () => {
        if (this.state.changed) {
          if (this.state.name != '' || this.state.description != '' || this.state.subtasks != '') {
            await AsyncStorage.setItem('unsavedTask', JSON.stringify(this.state));
          }
          else {
            if (await AsyncStorage.getItem('unsavedTask') != null) {
              await AsyncStorage.removeItem('unsavedTask');
            }
          }
          this.state.changed = false;
        }
      }, 1000);
      this.setState({ interval });
    }
    if (this.props.navigation.getParam('mode', 'new') == 'edit') {
      this.setState({
        lockd: (await AsyncStorage.getItem('strictMode') == '1'),
      });
      let unsavedTask = this.props.navigation.getParam('item', {});
      if ('taskName' in unsavedTask)
        unsavedTask.name = unsavedTask.taskName;
      if ('description' in unsavedTask)
        if (unsavedTask.description == null)
          unsavedTask.description = '';
      if ('iconName' in unsavedTask) {
        unsavedTask.icon = {
          name: unsavedTask.iconName,
          color: unsavedTask.iconColor,
        };
      }
      if ('subTasks' in unsavedTask)
        unsavedTask.subtasks = JSON.parse(unsavedTask.subTasks);
      if ('topTask' in unsavedTask)
        unsavedTask.toptask = (unsavedTask.topTask == -1);
      let options = JSON.parse(unsavedTask.options);
      if (options.deadline > 0) {
        unsavedTask.setDeadline = true;
        unsavedTask.deadline = options.deadline;
      }
      if (options.startingTime > 0) {
        unsavedTask.setStartingTime = true;
        unsavedTask.startingTime = options.startingTime;
      }
      unsavedTask.comfirmStart = options.comfirmStart;
      unsavedTask.reminders = options.reminders;
      unsavedTask.repeats = options.repeats;
      if ('bonusCoins' in unsavedTask)
        unsavedTask.bonusCoins = unsavedTask.bonusCoins.toString();
      if (options.deductingCoins > 0) {
        unsavedTask.enableDeduct = true;
        unsavedTask.deductingCoins = options.deductingCoins.toString();
      }
      if (unsavedTask != null) {
        this.setState(unsavedTask);
        this._checkData(unsavedTask);
      }
    }
  }

  componentWillUnmount() {
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
    if (this.state.interval != null) {
      clearInterval(this.state.interval)
      this.setState({ interval: null });
    }
    this.props.navigation.getParam('onReturn')();
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  }

  render() {
    const sections = [
      {
        data: [{
          type: 'input',
          value: this.state.name,
          placeholder: I18n.t('taskName'),
          maxLength: 32,
          onChangeText: (text) => {
            this.setState({ name: text });
            checkState = this.state;
            checkState.name = text;
            this._checkData(checkState);
          }
        }, {
          type: 'input',
          value: this.state.description,
          placeholder: I18n.t('description') + " (" + I18n.t('optional') + ")",
          maxLength: 5000,
          multiline: true,
          onChangeText: (text) => {
            this.setState({ description: text });
            checkState = this.state;
            checkState.description = text;
            this._checkData(checkState);
          },
        }, {
          type: 'icon',
          text: I18n.t('icon'),
          name: this.state.icon.name,
          color: this.state.icon.color,
          onChangeIcon: (name, color) => {
            this.setState({ icon: { name, color } });
            checkState = this.state;
            checkState.icon = { name, color };
            this._checkData(checkState);
          },
        }, {
          type: 'subtasks',
          text: I18n.t('subtasks'),
          subtasks: this.state.subtasks,
          onChange: (subtasks) => {
            this.setState({ subtasks });
            checkState = this.state;
            checkState.subtasks = subtasks;
            this._checkData(checkState);
          }
        }],
      }, {
        data: [{
          type: 'switch',
          title: I18n.t('setDeadline'),
          value: this.state.setDeadline,
          lockd: this.state.lockd,
          onChange: (value) => {
            if (!value) {
              if (!this.state.setStartingTime) {
                Alert.alert(I18n.t('invalidProperty'), I18n.t('neitherDeadlineNorStartingTime'));
                return;
              }
              reminders = this.state.reminders;
              remindersp = [];
              for (i in reminders) {
                if (reminders[i] >= 0) {
                  remindersp.push(reminders[i]);
                }
              }
              this.setState({
                reminders: remindersp,
              })
            }
            this.setState({ setDeadline: value });
            checkState = this.state;
            checkState.setDeadline = value;
            this._checkData(checkState);
          }
        }, {
          type: 'timePicker',
          text: I18n.t('deadline'),
          hide: !this.state.setDeadline,
          time: this.state.deadline,
          lockd: this.state.lockd,
          onChangeTime: (time) => {
            if (time <= (new Date().getTime() / 1000)) {
              time = Moment().add(2, 'h').format('X');
              setTimeout(() => {
                Alert.alert(I18n.t('invalidProperty'), I18n.t('deadlineEarly'));
              }, 500);
            }
            if (this.state.startingTime > time) {
              this.setState({
                startingTime: time - 3600
              });
            }
            this.setState({ deadline: time });
            checkState = this.state;
            checkState.deadline = time;
            this._checkData(checkState);
          }
        }, {
          type: 'switch',
          title: I18n.t('setStartingTime'),
          value: this.state.setStartingTime,
          lockd: this.state.lockd,
          onChange: (value) => {
            if (!value) {
              if (!this.state.setDeadline) {
                Alert.alert(I18n.t('invalidProperty'), I18n.t('neitherDeadlineNorStartingTime'));
                return;
              }
              if (this.state.startingTime > this.state.deadline) {
                this.setState({
                  startingTime: this.state.deadline - 3600,
                });
              }
              reminders = this.state.reminders;
              remindersp = [];
              for (i in reminders) {
                if (reminders[i] < 0) {
                  remindersp.push(reminders[i]);
                }
              }
              this.setState({
                reminders: remindersp,
              })
            }
            this.setState({ setStartingTime: value });
            checkState = this.state;
            checkState.setStartingTime = value;
            this._checkData(checkState);
          }
        }, {
          type: 'timePicker',
          text: I18n.t('startingTime'),
          hide: !this.state.setStartingTime,
          time: this.state.startingTime,
          lockd: this.state.lockd,
          onChangeTime: (time) => {
            if (this.state.deadline < time) {
              if (this.state.setDeadline) {
                time = this.state.deadline - 3600;
                setTimeout(() => {
                  Alert.alert(I18n.t('invalidProperty'), I18n.t('startingTimeLate'));
                }, 500);
              }
              else {
                this.setState({ deadline: time + 3600 });
              }
            }
            this.setState({ startingTime: time });
            checkState = this.state;
            checkState.startingTime = time;
            this._checkData(checkState);
          }
        }, {
          type: 'switch',
          title: I18n.t('comfirmStart'),
          hide: !this.state.setStartingTime || this.state.startingTime < (new Date().getTime() / 1000),
          value: this.state.comfirmStart,
          lockd: this.state.lockd,
          onChange: (value) => {
            this.setState({ comfirmStart: value });
            checkState = this.state;
            checkState.comfirmStart = value;
            this._checkData(checkState);
            if (value) {
              Alert.alert(I18n.t('comfirmStart'), I18n.t('comfirmStartAlert'));
            }
          }
        }, {
          type: 'reminders',
          text: I18n.t('reminders'),
          value: this.state.reminders,
          onChange: (value) => {
            this.setState({ reminders: value });
            checkState = this.state;
            checkState.reminders = value;
            this._checkData(checkState);
          }
        }, {
          type: 'repeats',
          text: I18n.t('repeats'),
          hide: (!this.state.setDeadline && !this.state.setStartingTime) || ((this.state.setDeadline && this.state.setStartingTime) ? Moment(new Date(this.state.deadline * 1000)).format('YYYY-MM-DD') != Moment(new Date(this.state.startingTime * 1000)).format('YYYY-MM-DD') : false),
          value: this.state.repeats,
          onChange: (value) => {
            this.setState({ repeats: value });
            checkState = this.state;
            checkState.repeats = value;
            this._checkData(checkState);
          }
        },]
      }, {
        title: I18n.t('timeMark') + (this.state.strictMode ? '\n' + (this.props.navigation.getParam('mode', 'new') == 'edit' ? I18n.t('strictModeLockedMark') : I18n.t('strictModeUnlockedMark')) : '') + '\n',
        data: [{
          type: 'shortInput',
          value: this.state.bonusCoins,
          text: I18n.t('bonusCoins'),
          placeholder: '0~100',
          maxLength: 3,
          keyboardType: 'number-pad',
          lockd: this.state.lockd,
          onChangeText: (text) => {
            checkState = this.state;
            bonusCoins = '';
            if (text != '') {
              num = parseInt(text)
              bonusCoins = num <= 100 ? (num >= 0 ? num.toString() : '0') : '100'
            }
            this.setState({ bonusCoins });
            checkState = this.state;
            checkState.bonusCoins = bonusCoins;
            this._checkData(checkState);
          }
        },
        {
          type: 'switch',
          title: I18n.t('enableDeduct'),
          value: this.state.enableDeduct,
          lockd: this.state.lockd,
          onChange: (value) => {
            this.setState({ enableDeduct: value });
            checkState = this.state;
            checkState.enableDeduct = value;
            this._checkData(checkState);
          }
        },
        {
          type: 'shortInput',
          value: this.state.deductingCoins,
          text: I18n.t('deductingCoins'),
          hide: !this.state.enableDeduct,
          placeholder: '0~100',
          maxLength: 3,
          keyboardType: 'number-pad',
          lockd: this.state.lockd,
          onChangeText: (text) => {
            checkState = this.state;
            deductingCoins = '';
            if (text != '') {
              num = parseInt(text)
              deductingCoins = num <= 100 ? (num >= 0 ? num.toString() : '0') : '100'
            }
            this.setState({ deductingCoins });
            checkState = this.state;
            checkState.deductingCoins = deductingCoins;
            this._checkData(checkState);
          }
        }]
      }, {
        title: I18n.t('coinsMark') + (this.state.strictMode ? '\n' + (this.props.navigation.getParam('mode', 'new') == 'edit' ? I18n.t('strictModeLockedMark') : I18n.t('strictModeUnlockedMark')) : '') + '\n',
        data: [
          {
            type: 'switch',
            title: I18n.t('topTask'),
            value: this.state.toptask,
            onChange: (value) => {
              this.setState({ toptask: value });
              checkState = this.state;
              checkState.toptask = value;
              this._checkData(checkState);
            }
          },
        ]
      },
      {
        title: I18n.t('topTaskMark') + (this.props.navigation.getParam('mode', 'new') == 'edit' ? '\n' + I18n.t('editTaskMark') : ''),
        data: [
          {
            type: 'blank',
          }
        ]
      }
    ];
    return <SectionList
      style={styles.container}
      renderItem={this._renderItem}
      renderSectionHeader={this._renderSectionHeader}
      stickySectionHeadersEnabled={false}
      keyExtractor={(item, index) => index}
      ItemSeparatorComponent={() => (
        <View style={[{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
          <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
        </View>
      )}
      sections={sections}
    />;
  }

  _renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} darkMode={this.state.darkMode} />;
  };

  _renderItem = ({ item }) => {
    switch (item.type) {
      case 'input':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <TextInput
              style={[styles.option, styles.optionText, (item.multiline ? styles.multiline : null), (this.state.darkMode?darkStyles.text:null)]}
              editable={!item.lockd}
              placeholder={item.placeholder}
              placeholderTextColor={this.state.darkMode?'#5A5A5F':'#C4C4C6'}
              onChangeText={item.onChangeText}
              maxLength={item.maxLength}
              multiline={item.multiline}
              value={item.value}
            />
          </SectionContent>
        )
      case 'icon':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <Touchable
              disabled={item.lockd}
              style={styles.option}
              onPress={() => {
                this.props.navigation.navigate('IconSelector', {
                  name: item.name,
                  color: item.color,
                  onChangeIcon: item.onChangeIcon
                });
              }}>
              <View style={{ flexDirection: 'row', height: 36 }}>
                <Text style={[styles.optionText, { marginTop: 8 }, (this.state.darkMode?darkStyles.text:null)]}>
                  {item.text}
                </Text>
                <View style={styles.optionRight}>
                  <Icon.Ionicons
                    name={Platform.OS === 'ios' ? 'ios-' + this.state.icon.name : 'md-' + this.state.icon.name}
                    size={32}
                    color={(item.color == 'black' && this.state.darkMode) ? 'white' : item.color}
                  />
                </View>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'subtasks':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <Touchable
              disabled={item.lockd}
              style={styles.option}
              onPress={() => {
                this.props.navigation.navigate('SubtasksEditor', {
                  subtasks: item.subtasks,
                  onChange: item.onChange
                });
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                  {item.text}
                </Text>
                <View style={styles.optionRight}>
                  <Text style={[styles.optionText, { marginTop: 1 }, (this.state.darkMode?darkStyles.text:null)]}>
                    {item.subtasks.length}
                  </Text>
                </View>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'repeats':
        repeatWays = [I18n.t('none'), I18n.t('daily'), I18n.t('weekly'), (new Date((this.state.setDeadline ? this.state.deadline : this.state.startingTime) * 1000).getDay() >= 1 && new Date((this.state.setDeadline ? this.state.deadline : this.state.startingTime) * 1000).getDay() <= 5) ? I18n.t('weekdays') : I18n.t('weekends'), I18n.t('monthly'), I18n.t('yearly')];
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <Touchable
              style={styles.option}
              disabled={item.lockd}
              onPress={() => {
                this.props.navigation.navigate('RepeatsSelector', {
                  repeats: item.value,
                  time: (this.state.setDeadline ? this.state.deadline : this.state.startingTime),
                  onChange: item.onChange
                });
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                  {item.text}
                </Text>
                <View style={styles.optionRight}>
                  <Text style={[styles.optionText, { marginTop: 1 }, (this.state.darkMode?darkStyles.text:null)]}>
                    {repeatWays[item.value.type]}{item.value.end != 0 ? ', ' + I18n.t('until') + ' ' + Moment(new Date(item.value.end * 1000)).format('l') : ''}
                  </Text>
                </View>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'reminders':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <Touchable
              style={styles.option}
              disabled={item.lockd}
              onPress={() => {
                this.props.navigation.navigate('RemindersSelector', {
                  reminders: item.value,
                  deadline: (this.state.setDeadline ? this.state.deadline : 0),
                  startingTime: (this.state.setStartingTime && (!(Moment(this.state.startingTime, 'X').format('MM-DD-YYYY') != Moment(this.state.deadline, 'X').format('MM-DD-YYYY') && this.state.startingTime < Moment().format('X'))) ? this.state.startingTime : 0),
                  onChange: item.onChange
                });
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                  {item.text}
                </Text>
                <View style={styles.optionRight}>
                  <Text style={[styles.optionText, { marginTop: 1 }, (this.state.darkMode?darkStyles.text:null)]}>
                    {item.value.length}
                  </Text>
                </View>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'shortInput':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <View style={[styles.option, { flexDirection: 'row' }]}>
              <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                {item.text}
              </Text>
              <TextInput
                style={[styles.optionText, styles.optionRight, { marginTop: 4 }, (this.state.darkMode?darkStyles.text:null)]}
                editable={!item.lockd}
                placeholder={item.placeholder}
                placeholderTextColor={this.state.darkMode?'#5A5A5F':'#C4C4C6'}
                onChangeText={item.onChangeText}
                maxLength={item.maxLength}
                keyboardType={item.keyboardType}
                value={item.value}
              />
            </View>
          </SectionContent>
        )
      case 'switch':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <View style={styles.option}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                  {item.title}
                </Text>
                <Switch style={[styles.optionSwitch]}
                  disabled={item.lockd}
                  onValueChange={item.onChange} value={item.value} />
              </View>
            </View>
          </SectionContent>
        )
      case 'timePicker':
        return (
          <SectionContent darkMode={this.state.darkMode} hide={item.hide}>
            <Touchable
              disabled={item.lockd}
              style={styles.option}
              onPress={() => {
                item.datePickerRef.onPressDate()
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                  {item.text}
                </Text>
                <View style={styles.optionRight}>
                  <Text style={[styles.optionText, (this.state.darkMode?darkStyles.text:null)]}>
                    {Moment(new Date(item.time * 1000)).format('l LT')}
                  </Text>
                </View>
                <View>
                  <DatePicker
                    style={{ width: 0, height: 0 }}
                    date={Moment(new Date(item.time * 1000)).format("YYYY-MM-DD HH:mm")}
                    mode="datetime"
                    format="YYYY-MM-DD HH:mm"
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
                    minuteInterval={1}
                    ref={(ref) => item.datePickerRef = ref}
                    onDateChange={(datetime) => {
                      item.onChangeTime(Moment(datetime).format('X'))
                    }}
                  />
                </View>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'blank':
        return (<View style={{ height: 240 }} />);
    }
  };

  _checkData = (state) => {
    this.setState({ changed: true });
    if ((state.name != '') && (state.bonusCoins != '') && (state.enableDeduct ? state.deductingCoins != '' : true))
      this.props.navigation.setParams({ canSave: '1' });
    else
      this.props.navigation.setParams({ canSave: '0' });
  };

  _saveTask = () => {
    if (this.state.interval != null) {
      clearInterval(this.state.interval)
      this.setState({ interval: null });
    }
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`select taskId from tasks order by taskId desc;`, [], (tx, result) => {
        rows = result.rows._array;
        if (this.props.navigation.getParam('mode', 'new') == 'new') {
          id = (rows.length == 0) ? 0 : (rows[0].taskId + 1);
          tx.executeSql('INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
            , [id, this.state.name.trim(),
              (this.state.description.trim() != '') ? this.state.description.trim() : null,
              this.state.icon.name, this.state.icon.color, '[]', JSON.stringify(this.state.subtasks),
              JSON.stringify({
                deadline: this.state.setDeadline ? this.state.deadline : 0,
                startingTime: this.state.setStartingTime ? this.state.startingTime : 0,
                comfirmStart: (!this.state.setStartingTime || this.state.startingTime < (new Date().getTime() / 1000)) ? false : this.state.comfirmStart,
                reminders: this.state.reminders,
                repeats: this.state.repeats,
                deductingCoins: this.state.enableDeduct ? this.state.deductingCoins : 0,
              }), this.state.bonusCoins, (this.state.toptask ? -1 : 0),
              Math.round(new Date().getTime() / 1000)
            ], async (tx, result) => {
              await AsyncStorage.removeItem('unsavedTask');
              this.props.navigation.goBack();
              const { status } = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
              if (status == 'granted') {
                (await AsyncStorage.getItem('taskFailureReminder') == null) ? (await AsyncStorage.setItem('taskFailureReminder', '1')) : null;
              } else {
                (await AsyncStorage.getItem('taskFailureReminder') == null) ? (await AsyncStorage.setItem('taskFailureReminder', '0')) : null;
              }
            }
          );
        }
        else if (this.props.navigation.getParam('mode', 'new') == 'edit') {
          id = (this.props.navigation.getParam('item', {}).taskId);
          deadline = this.state.setDeadline ? this.state.deadline : 0;
          startingTime = this.state.setStartingTime ? this.state.startingTime : 0;
          /*
            unsavedTaskOpt = JSON.parse(this.props.navigation.getParam('item', {}).options);
            status = JSON.parse(this.props.navigation.getParam('item', {}).status);
            if(unsavedTaskOpt.startingTime!=startingTime || unsavedTaskOpt.deadline!=deadline){}
          */
          tx.executeSql('UPDATE tasks SET taskName = ?, description = ?, iconName = ?, iconColor = ?, subTasks = ?, options = ?, bonusCoins = ?, topTask = ?, changeTime = ? WHERE taskId = ?;'
            , [this.state.name,
            (this.state.description.trim() != '') ? this.state.description.trim() : null,
            this.state.icon.name, this.state.icon.color, JSON.stringify(this.state.subtasks),
            JSON.stringify({
              deadline, startingTime,
              comfirmStart: (!this.state.setStartingTime || this.state.startingTime < (new Date().getTime() / 1000)) ? false : this.state.comfirmStart,
              reminders: this.state.reminders,
              repeats: this.state.repeats,
              deductingCoins: this.state.enableDeduct ? this.state.deductingCoins : 0,
            }), this.state.bonusCoins, (this.state.toptask ? -1 : 0),
            Math.round(new Date().getTime() / 1000), id
            ], async (tx, result) => {
              this.props.navigation.goBack();
            }
          );
        }
      })
    });
  }
}

const SectionHeader = ({ title, darkMode }) => {
  if (title)
    textCom = <Text style={[styles.sectionHeaderText, (darkMode?darkStyles.altText:null)]}>{title}</Text>;
  else
    textCom = null;
  return (
    <View style={[styles.sectionHeaderContainer, (darkMode ? [darkStyles.view, darkStyles.border] : null)]}>
      {textCom}
    </View>
  );
};

const SectionContent = props => {
  return (
    <View style={[styles.sectionContentContainer, { display: (props.hide ? 'none' : 'flex') }, (props.darkMode?darkStyles.block:null)]}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  sectionHeaderContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sectionHeaderText: {
    fontSize: 14,
    color: Colors.sectionHeaderText,
  },
  sectionContentContainer: {
    paddingTop: 8,
    paddingHorizontal: 15,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  option: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  optionText: {
    fontSize: 16,
    marginTop: 1,
  },
  optionRight: {
    position: "absolute",
    right: 0,
  },
  optionSwitch: {
    position: "absolute",
    top: -5,
    right: 0,
  },
  multiline: {
    height: 120,
  }
});