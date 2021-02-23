import React from 'react';
import {
  Alert,
  AsyncStorage,
  Button,
  DeviceEventEmitter,
  StyleSheet,
  Switch,
  Text,
  SectionList,
  Linking,
  View,
  SafeAreaView,
  ActionSheetIOS,
} from 'react-native';
import { ScreenOrientation, StoreReview, Updates } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as SQLite from 'expo-sqlite';
import { I18n } from '../langs/I18n';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { Appearance } from 'react-native-appearance';
import Touchable from 'react-native-platform-touchable';
import * as MailComposer from 'expo-mail-composer';
import * as WebBrowser from 'expo-web-browser';

export default class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSeconds: false,
      taskSummary: false,
      strictMode: false,
      showCompletedTasks: false,
      showUsedTimeRatio: false,
      showRemainingTimeRatio: false,
      taskFailureReminder: false,
      followSystemSwitch: false,
      negativeUser: false,
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
    this.subscription = DeviceEventEmitter.addListener("refresh", () => { setTimeout(() => { this._initListener() }, 5) });
    this._initListener();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('settings'),
      headerRight: (
        <Button color={Colors.tintColor} title={I18n.t('done')} onPress={() => { navigation.navigate('Main'); }} />
      ),
    }
  };

  async componentDidMount() {
    this.setState({
      showCompletedTasks: (await AsyncStorage.getItem('showCompletedTasks') == '1'),
      showSeconds: (await AsyncStorage.getItem('showSeconds') == '1'),
      showUsedTimeRatio: (await AsyncStorage.getItem('showUsedTimeRatio') == '1'),
      showRemainingTimeRatio: (await AsyncStorage.getItem('showRemainingTimeRatio') == '1'),
      taskSummary: (await AsyncStorage.getItem('taskSummary') == '1'),
      strictMode: (await AsyncStorage.getItem('strictMode') == '1'),
      taskFailureReminder: (await AsyncStorage.getItem('taskFailureReminder') == '1'),
      negativeUser: (await AsyncStorage.getItem('negativeUser') == '1'),
    });
  };

  componentWillUnmount() {
    onReturn = this.props.navigation.getParam('onReturn', null);
    if (onReturn != null) onReturn();
    this.subscription.remove();
    setTimeout(() => { DeviceEventEmitter.emit("refresh"); }, 50);
  }

  render() {
    const sections = [
      {
        title: I18n.t('taskRelated'),
        data: [
          {
            type: 'switch',
            title: I18n.t('showCompletedTasks'),
            value: this.state.showCompletedTasks,
            onChange: async (value) => {
              await AsyncStorage.setItem('showCompletedTasks', value ? '1' : '0');
              this.setState({ showCompletedTasks: value });
            }
          },
          {
            type: 'switch',
            title: I18n.t('showSeconds'),
            value: this.state.showSeconds,
            onChange: async (value) => {
              await AsyncStorage.setItem('showSeconds', value ? '1' : '0');
              this.setState({ showSeconds: value });
            }
          },
          {
            type: 'switch',
            title: I18n.t('showUsedTimeRatio'),
            value: this.state.showUsedTimeRatio,
            onChange: async (value) => {
              if (value) {
                await AsyncStorage.setItem('showRemainingTimeRatio', '0');
                this.setState({ showRemainingTimeRatio: false });
              }
              await AsyncStorage.setItem('showUsedTimeRatio', value ? '1' : '0');
              this.setState({ showUsedTimeRatio: value });
            }
          },
          {
            type: 'switch',
            title: I18n.t('showRemainingTimeRatio'),
            value: this.state.showRemainingTimeRatio,
            onChange: async (value) => {
              if (value) {
                await AsyncStorage.setItem('showUsedTimeRatio', '0');
                this.setState({ showUsedTimeRatio: false });
              }
              await AsyncStorage.setItem('showRemainingTimeRatio', value ? '1' : '0');
              this.setState({ showRemainingTimeRatio: value });
            }
          },
          {
            type: 'switch',
            title: I18n.t('taskSummary'),
            value: this.state.taskSummary,
            onChange: async (value) => {
              await AsyncStorage.setItem('taskSummary', value ? '1' : '0');
              this.setState({ taskSummary: value });
            }
          },
          {
            type: 'switch',
            title: I18n.t('taskFailureReminder'),
            value: this.state.taskFailureReminder,
            onChange: async (value) => {
              if (value) {
                const { status } = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
                if (status != 'granted') {
                  Alert.alert(
                    I18n.t('noNotiPermission'),
                    I18n.t('noNotiPermissionDetail'),
                    [
                      {
                        text: I18n.t('cancel'),
                        style: 'cancel',
                      },
                      {
                        text: I18n.t('gotoSettings'),
                        onPress: () => {
                          Linking.openURL('app-settings:');
                        },
                      }
                    ]
                  );
                  return;
                }
              }
              await AsyncStorage.setItem('taskFailureReminder', value ? '1' : '0');
              this.setState({ taskFailureReminder: value });
            }
          },
        ],
      },
      {
        title: I18n.t('taskRelatedMark') + '\n\n' + I18n.t('appRelated'),
        data: [
          {
            type: 'switch',
            title: I18n.t('strictMode'),
            value: this.state.strictMode,
            onChange: async (value) => {
              await AsyncStorage.setItem('strictMode', value ? '1' : '0');
              this.setState({ strictMode: value });
            }
          },
        ]
      },
      {
        title: I18n.t('appRelatedMark') + (__DEV__ ? '\n\n' + I18n.t('auxiliaryTools') : ''),
        style: { borderBottomWidth: __DEV__ ? StyleSheet.hairlineWidth : 0 },
        data: [{
          type: 'button',
          title: I18n.t('resetApp'),
          color: 'red',
          hide: !__DEV__,
          onPress: () => {
            ActionSheetIOS.showActionSheetWithOptions({
              title: I18n.t('sureToReset'),
              message: I18n.t('sureToResetMessage'),
              options: [I18n.t('cancel'), I18n.t('reset')],
              destructiveButtonIndex: 1,
              cancelButtonIndex: 0,
            },
              (buttonIndex) => {
                if (buttonIndex === 1) {
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
                  Updates.reload();
                }
              });
          }
        }],
      },
    ];
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <SectionList
          style={styles.container}
          renderItem={({ item }) => { return this._renderItem(item, this.state.darkMode); }}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeaderContainer, (this.state.darkMode ? [darkStyles.view, darkStyles.border] : null), ('style' in section ? section.style : null)]}>
              <Text style={[styles.sectionHeaderText, (this.state.darkMode ? darkStyles.altText : null)]}>
                {section.title}
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          keyExtractor={(item, index) => index}
          ItemSeparatorComponent={() => (
            <View style={[{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
              <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
            </View>
          )}
          ListFooterComponent={() => (
            <View style={[styles.sectionHeaderContainer, (this.state.darkMode ? darkStyles.view : null), { borderTopWidth: 0 }]}>
              <Text style={[styles.sectionHeaderText, { textAlign: 'center' }, (this.state.darkMode ? darkStyles.altText : null)]}>{'\n'}Pamphlet by CuSO₄·5H₂O</Text>
              <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                <Text style={[styles.sectionHeaderText, (this.state.darkMode ? darkStyles.altText : null)]}>Version {Constants.manifest.version}</Text>
                <Text style={[styles.sectionHeaderText, { display: (this.state.negativeUser ? 'none' : 'flex') }, (this.state.darkMode ? darkStyles.altText : null)]}> · </Text>
                <Touchable onPress={() => {
                  Alert.alert(
                    I18n.t('rateTitle'),
                    I18n.t('rateText'),
                    [
                      {
                        text: I18n.t('rateNeutral'),
                        onPress: async () => { await AsyncStorage.setItem('askedRate', '1') },
                        style: 'cancel',
                      },
                      {
                        text: I18n.t('rateNegative'),
                        onPress: async () => {
                          await AsyncStorage.setItem('askedRate', '1');
                          await AsyncStorage.setItem('negativeUser', '1');
                          this.setState({ negativeUser: (await AsyncStorage.getItem('negativeUser') == '1') });
                          _sendFeedback();
                        }
                      },
                      {
                        text: I18n.t('ratePositive'),
                        onPress: async () => {
                          await AsyncStorage.setItem('askedRate', '1');
                          StoreReview.requestReview();
                        },
                      },
                    ],
                    { cancelable: false },
                  );
                }}>
                  <Text style={[styles.sectionHeaderText, { color: Colors.tintColor, textAlign: 'center', display: (this.state.negativeUser ? 'none' : 'flex') }]}>
                    {I18n.t('rate')}
                  </Text>
                </Touchable>
                <Text style={[styles.sectionHeaderText, (this.state.darkMode ? darkStyles.altText : null)]}> · </Text>
                <Touchable onPress={() => { _sendFeedback() }}>
                  <Text style={[styles.sectionHeaderText, { color: Colors.tintColor, textAlign: 'center' }]}>
                    {I18n.t('feedback')}
                  </Text>
                </Touchable>
              </View>
              <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                <Touchable onPress={() => {
                  WebBrowser.openBrowserAsync('https://cuso4.tech/privacy');
                }}>
                  <Text style={[styles.sectionHeaderText, { color: Colors.tintColor, textAlign: 'center' }]}>
                    {I18n.t('viewPrivatePolicy')}
                  </Text>
                </Touchable>
                <Text style={[styles.sectionHeaderText, (this.state.darkMode ? darkStyles.altText : null)]}> · </Text>
                <Touchable onPress={() => {
                  WebBrowser.openBrowserAsync('https://cuso4.tech/Pamphlet/3rd');
                }}>
                  <Text style={[styles.sectionHeaderText, { color: Colors.tintColor, textAlign: 'center' }]}>
                    {I18n.t('notices3rd')}
                  </Text>
                </Touchable>
              </View>
            </View>
          )}
          sections={sections}
        />
      </SafeAreaView>
    );
  }

  _renderItem = (item, darkMode) => {
    switch (item.type) {
      case 'page':
        if (!('color' in item)) item.color = Colors.tintColor;
        if (item.hide)
          return null;
        return (
          <SectionContent darkMode={darkMode}>
            <Touchable
              style={[styles.option]}
              onPress={() => { this.props.navigation.navigate(item.page); }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>
                  {item.title}
                </Text>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'button':
        if (!('color' in item)) item.color = Colors.tintColor;
        if (item.hide)
          return null;
        else
          return (
            <SectionContent darkMode={darkMode}>
              <Touchable
                style={[styles.option]}
                onPress={item.onPress}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null), { color: item.color }]}>
                    {item.title}
                  </Text>
                </View>
              </Touchable>
            </SectionContent>
          )
      case 'switch':
        return (
          <SectionContent darkMode={darkMode}>
            <View style={[styles.option, (this.state.darkMode ? darkStyles.block : null)]}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>
                  {item.title}
                </Text>
                <Switch style={[styles.optionSwitch]} onValueChange={item.onChange} value={item.value} />
              </View>
            </View>
          </SectionContent>
        )
    }
  };
}

const SectionContent = props => {
  return (
    <View style={[styles.sectionContentContainer, (props.darkMode ? darkStyles.block : null)]}>
      {props.children}
    </View>
  );
};

const _sendFeedback = () => {
  setTimeout(() => {
    MailComposer.composeAsync({
      recipients: ['contact@cuso4.tech'],
      subject: I18n.t('feedbackSubject').replace('!version!', Constants.manifest.version).replace('!locale!', I18n.locale),
      body: I18n.t('feedbackBody'),
      isHtml: true
    });
  }, 100);
}

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
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 12,
  },
  optionText: {
    fontSize: 16,
    marginTop: 1,
  },
  optionSwitch: {
    position: "absolute",
    top: -5,
    right: 0,
  },
});
