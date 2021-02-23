import React from 'react';
import {
  Alert,
  Button,
  DeviceEventEmitter,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import { ScreenOrientation } from 'expo';
import Moment from 'moment';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Appearance } from 'react-native-appearance';
import Touchable from 'react-native-platform-touchable';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import * as SQLite from 'expo-sqlite';
import { I18n } from '../langs/I18n';

export default class RecordsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state={ 
      records : '',
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
  }

  static navigationOptions = ({ navigation }) => { return{
    title: I18n.t('records'),
    headerRight: (
      <Button color={Colors.tintColor} title={I18n.t('done')} onPress={() => { navigation.navigate('Main'); }} />
    ),
  }}

  componentDidMount() {
    this._reloadList();
  }

  componentWillUnmount() {
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  }

  render() {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <View style={styles.container}>
          <SwipeListView
            data={this.state.records}
            renderItem={({item}) =>{
              return(
                <View style={[styles.item, (this.state.darkMode ? [darkStyles.view] : null)]}>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.itemText, (this.state.darkMode ? darkStyles.text : null)]}>{item.recordName}</Text>
                    <Text style={[styles.itemDescription, (this.state.darkMode ? darkStyles.text : null)]}>{Moment(new Date(item.recordTime) * 1000).format('l LTS')}</Text>
                  </View>
                  <View style={[styles.optionRight, styles.optionPriceContainer, (this.state.darkMode ? darkStyles.text : null)]}>
                    <Text style={[styles.itemPrice, (this.state.darkMode ? darkStyles.text : null)]}>{item.price}</Text>
                  </View>
                </View>
              )
            }}
            bounceFirstRowOnMount={false}
            keyExtractor={(item, index) => item.recordId.toString()}
            ItemSeparatorComponent={() => (
              <View style={[{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
                <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
              </View>
            )}
            renderHiddenItem={({item}) => {
              return (
                <View style={styles.actionsContainer}>
                  <Touchable
                    style={[styles.actionButton]}
                    onPress={() => {
                      Alert.alert(
                        I18n.t('recordDeleteTitle'),
                        I18n.t('recordDeleteText'),
                        [
                          {
                            text: I18n.t('no'), 
                            style: 'cancel',
                          },
                          {
                            text: I18n.t('yes'), 
                            onPress: () => {
                              const db=SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
                              db.transaction((tx)=>{
                                tx.executeSql(`delete from records where recordId = ?;`, [item.recordId], (tx, result)=>{
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
            rightOpenValue={-80}
          />
        </View>
      </SafeAreaView>
    );
  }

  _reloadList() {
    const db=SQLite.openDatabase('Donelet', '0.0.0.0', 'Donelet', 100000);
    db.transaction((tx)=>{
      tx.executeSql(`select * from records order by recordTime desc;`, [], (tx, result)=>{
        this.setState({records: result.rows._array});
      })
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsTitleText: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  optionPriceContainer: {
    top: 22,
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
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4.5,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
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
    paddingVertical: 24,
    width: 80,
    backgroundColor: 'red',
  },
  actionButtonText: {
    textAlign: 'center',
    color: 'white',
  },
});
