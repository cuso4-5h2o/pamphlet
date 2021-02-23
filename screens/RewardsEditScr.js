import React from 'react';
import {
  AsyncStorage,
  Button,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  SectionList,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { ScreenOrientation } from 'expo';
import { I18n } from '../langs/I18n';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { Appearance } from 'react-native-appearance';
import Touchable from 'react-native-platform-touchable';
import * as Icon from '@expo/vector-icons';

export default class RewardsAddScr extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('mode', 'new') == 'new' ? I18n.t('newReward') : I18n.t('editReward'),
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
      price: '',
      interval: null,
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
  }

  componentDidMount = async () => {
    this.props.navigation.setParams({ saveTask: this._saveTask });
    this.setState({
      strictMode: (await AsyncStorage.getItem('strictMode') == '1'),
    });
    if (this.props.navigation.getParam('mode', 'new') == 'new') {
      unsavedReward = await AsyncStorage.getItem('unsavedReward');
      if (unsavedReward != null) {
        this.setState(JSON.parse(unsavedReward));
        this._checkData(JSON.parse(unsavedReward));
      }
      interval = setInterval(async () => {
        if (this.state.changed) {
          if (this.state.name != '' || this.state.description != '') {
            await AsyncStorage.setItem('unsavedReward', JSON.stringify(this.state));
          }
          else {
            if (await AsyncStorage.getItem('unsavedReward') != null) {
              await AsyncStorage.removeItem('unsavedReward');
            }
          }
          this.state.changed = false;
        }
      }, 1000);
      this.setState({ interval });
    }
    if (this.props.navigation.getParam('mode', 'new') == 'edit') {
      unsavedReward = this.props.navigation.getParam('item', {});
      if ('rewardName' in unsavedReward)
        unsavedReward.name = unsavedReward.rewardName;
      if ('description' in unsavedReward)
        if (unsavedReward.description == null)
          unsavedReward.description = '';
      if ('price' in unsavedReward)
        unsavedReward.price = unsavedReward.price.toString();
      if ('iconName' in unsavedReward) {
        unsavedReward.icon = {
          name: unsavedReward.iconName,
          color: unsavedReward.iconColor,
        };
      }
      if (unsavedReward != null) {
        this.setState(unsavedReward);
        this._checkData(unsavedReward);
      }
    }
  }

  componentWillUnmount() {
    if (this.state.interval != null) {
      clearInterval(this.state.interval)
      this.setState({ interval: null });
    }
    this.props.navigation.getParam('onReturn')();
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  };

  render() {
    const sections = [
      {
        data: [{
          type: 'input',
          value: this.state.name,
          placeholder: I18n.t('rewardName'),
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
        }],
      }, {
        data: [{
          type: 'shortInput',
          editable: !(this.state.strictMode && this.props.navigation.getParam('mode', 'new') == 'edit'),
          value: this.state.price,
          text: I18n.t('price'),
          placeholder: '0~100',
          maxLength: 3,
          keyboardType: 'number-pad',
          onChangeText: (text) => {
            checkState = this.state;
            price = '';
            if (text != '') {
              num = parseInt(text)
              price = num <= 100 ? (num >= 0 ? num.toString() : '0') : '100'
            }
            this.setState({ price });
            checkState = this.state;
            checkState.price = price;
            this._checkData(checkState);
          }
        }]
      }, {
        data: [],
        title: I18n.t('priceMark') + (this.state.strictMode ? '\n' + (this.props.navigation.getParam('mode', 'new') == 'edit' ? I18n.t('strictModeLockedMark') : I18n.t('strictModeUnlockedMark')) : '')
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
      case 'mark':
        return <SectionHeader title={section.text} darkMode={this.state.darkMode} />;
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
          <SectionContent darkMode={this.state.darkMode}>
            <Touchable
              style={styles.option}
              background={Touchable.Ripple('#ccc', false)}
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
                    color={this.state.icon.color}
                  />
                </View>
              </View>
            </Touchable>
          </SectionContent>
        )
      case 'shortInput':
        return (
          <SectionContent darkMode={this.state.darkMode}>
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
    }
  };

  _checkData = (state) => {
    this.setState({ changed: true });
    if ((state.name != '') && (state.price != ''))
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
      tx.executeSql(`select rewardId from rewards order by rewardId desc;`, [], (tx, result) => {
        rows = result.rows._array;
        if (this.props.navigation.getParam('mode', 'new') == 'new') {
          id = (rows.length == 0) ? 0 : (rows[0].rewardId + 1);
          tx.executeSql('INSERT INTO rewards VALUES (?, ?, ?, ?, ?, ?, ?);'
            , [id, this.state.name.trim(),
              (this.state.description.trim() != '') ? this.state.description.trim() : null,
              this.state.icon.name, this.state.icon.color, this.state.price,
              Math.round(new Date().getTime() / 1000)
            ], async (tx, result) => {
              await AsyncStorage.removeItem('unsavedReward');
              this.props.navigation.goBack();
            }
          );
        }
        else if (this.props.navigation.getParam('mode', 'new') == 'edit') {
          id = (this.props.navigation.getParam('item', {}).rewardId);
          tx.executeSql('UPDATE rewards SET rewardName = ?, description = ?, iconName = ?, iconColor = ?, price = ?, changeTime = ? WHERE rewardId = ?;'
            , [this.state.name.trim(),
            (this.state.description.trim() != '') ? this.state.description.trim() : null,
            this.state.icon.name, this.state.icon.color, this.state.price,
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
    right: 0
  },
  multiline: {
    height: 120,
  }
});
