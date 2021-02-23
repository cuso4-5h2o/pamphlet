import React from 'react';
import {
  Alert,
  AsyncStorage,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import * as Icon from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Appearance } from 'react-native-appearance';
import Touchable from 'react-native-platform-touchable';

import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import RadiusBtn from '../components/RadiusBtn';
import HeaderIconBtn from '../components/HeaderIconBtn';

import { StoreReview, ScreenOrientation } from 'expo';
import * as SQLite from 'expo-sqlite';
import { I18n } from '../langs/I18n';
import * as MailComposer from 'expo-mail-composer';

export default class RewardsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      rewards: '', 
      saved: '1', 
      interval, 
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

  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('rewards'),
      headerLeft: (
        <HeaderIconBtn
          ion="cog"
          color={Colors.tintColor}
          onPress={() => { navigation.navigate('Settings'); }}
        />
      ),
      headerRight: (
        <Touchable onPress={() => { navigation.navigate('Records'); }}>
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
  }

  componentDidMount() {
    interval = setInterval(() => {
      this._refreshCoin();
    }, 1000);
    this.setState({
      interval
    });
    this._reloadList();
  }

  _refreshCoin() {
    AsyncStorage.getItem('coin', (error, coin) => {
      if (coin != null)
        this.props.navigation.setParams({ coin });
    })
  }

  componentWillUnmount() {
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
        <View style={styles.container}>
          <SwipeListView
            data={this.state.rewards}
            renderItem={({ item }) => {
              return (
                <View style={[styles.item, (this.state.darkMode ? darkStyles.view : null)]}>
                  <View style={styles.optionIconContainer}>
                    <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-' + item.iconName : 'md-' + item.iconName} size={32} color={item.iconColor} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.itemText, { marginTop: (item.description == null) ? 8 : 8 }, (this.state.darkMode?darkStyles.text:null)]}>{item.rewardName}</Text>
                    <Text style={[styles.itemDescription, { display: (item.description == null) ? 'none' : 'flex' }, (this.state.darkMode?darkStyles.text:null)]}>{item.description}</Text>
                  </View>
                  <View style={[styles.optionRight, styles.optionBtnContainer]}>
                    <RadiusBtn onPress={this._redeem.bind(this, item)} btnName={item.price} underlayColor={Colors.tintColor} btnStyle={{ width: 80, height: 24, borderRadius: 24 }} />
                  </View>
                </View>
              )
            }}
            bounceFirstRowOnMount={false}
            keyExtractor={(item, index) => item.rewardId.toString()}
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
                      this.props.navigation.navigate('RewardsEdit', {
                        mode: 'edit', item, onReturn: () => {
                          this._reloadList();
                        }
                      });
                    }}>
                    <Text style={styles.actionButtonText}>{I18n.t('edit')}</Text>
                  </Touchable>
                  <Touchable
                    style={[styles.actionButton, styles.actionDangerousButton]}
                    onPress={() => {
                      Alert.alert(
                        I18n.t('rewardDeleteTitle'),
                        I18n.t('rewardDeleteText'),
                        [
                          {
                            text: I18n.t('no'),
                            style: 'cancel',
                          },
                          {
                            text: I18n.t('yes'),
                            style: 'destructive',
                            onPress: () => {
                              const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
                              db.transaction((tx) => {
                                tx.executeSql(`delete from rewards where rewardId = ?;`, [item.rewardId], (tx, result) => {
                                  this._reloadList();
                                })
                              });
                            }
                          },
                        ]
                      );
                    }}>
                    <Text style={styles.actionButtonText}>{I18n.t('delete')}</Text>
                  </Touchable>
                </View>
              )
            }}
            rightOpenValue={-160}
          />
          <Touchable
            style={styles.option}
            onPress={this._newReward}
            onLongPress={this._clearReward.bind(this)}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.optionIconContainer}>
                <Icon.Ionicons name={Platform.OS === 'ios' ? 'ios-add-circle' : 'md-add-circle'} size={28} color={Colors.tintColor} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>{I18n.t('newReward') + (this.state.saved == '1' ? '' : ' (' + I18n.t('unsaved') + ')')}</Text>
              </View>
            </View>
          </Touchable>
        </View>
      </SafeAreaView>
    );
  }

  _redeem = async (item) => {
    coinTmp = await AsyncStorage.getItem('coin');
    coin = (coinTmp != null) ? parseInt(coinTmp) : 0;
    if (coin >= item.price) {
      Alert.alert(I18n.t('redeemTitle') + ' ' + item.rewardName, I18n.t('redeemText').replace('!price!', item.price).replace('!coin!', coin.toString()),
        [
          {
            text: I18n.t('no'),
            style: 'cancel',
          },
          {
            text: I18n.t('yes'),
            onPress: async () => {
              await AsyncStorage.setItem('coin', (coin - item.price).toString());
              const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
              db.transaction((tx) => {
                tx.executeSql(`select recordId from records order by recordId desc;`, [], (tx, result) => {
                  rows = result.rows._array;
                  id = (rows.length == 0) ? 0 : (rows[0].recordId + 1);
                  tx.executeSql('INSERT INTO records VALUES (?, ?, ?, ?);'
                    , [id, '(' + I18n.t('redeem') + ') ' + item.rewardName,
                      Math.round(new Date().getTime() / 1000),
                      '-' + item.price.toString()
                    ], async (tx, result) => {
                      this._reloadList();
                      if (await AsyncStorage.getItem('firstRedeemed') == null) {
                        await AsyncStorage.setItem('firstRedeemed', '1');
                        Alert.alert(I18n.t('redeemFirstTitle'), I18n.t('redeemFirstText'))
                      }
                      else if (await AsyncStorage.getItem('askedRate') == null) {
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
                      }
                    }
                  );
                })
              });
            }
          },
        ]
      );
    }
    else {
      Alert.alert(I18n.t('redeemTitle') + ' ' + item.rewardName, I18n.t('redeemNoEnoughCoin').replace('!price!', item.price).replace('!coin!', coin.toString()));
    }
  };

  _newReward = async () => {
    this.props.navigation.navigate('RewardsEdit', {
      mode: 'new', onReturn: () => {
        this._reloadList();
      }
    });
  };

  _clearReward() {
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
            await AsyncStorage.removeItem('unsavedReward');
            this.setState({
              saved: '1',
            });
          },
        }
      ]);
    }
  };

  _reloadList() {
    AsyncStorage.getItem('coin', (error, coin) => {
      if (coin != null)
        this.props.navigation.setParams({ coin });
    })
    AsyncStorage.getItem('unsavedReward', (error, data) => {
      this.setState({ saved: (data == null) ? '1' : '0' });
    })
    const db = SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx) => {
      tx.executeSql(`select * from rewards order by rewardId;`, [], (tx, result) => {
        this.setState({ rewards: result.rows._array });
      })
    });
  }
}

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
  optionsTitleText: {
    fontSize: 16,
    marginLeft: 15,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 12,
    width: 32,
  },
  optionBtnContainer: {
    top: 18,
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
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4.5,
    marginRight: 80,
  },
  itemDescription: {
    marginTop: 12,
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
