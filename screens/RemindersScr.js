import React from 'react';
import {
  Alert,
  AsyncStorage,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  SectionList,
  Linking,
  View,
} from 'react-native';
import { I18n } from '../langs/I18n';
import { ScreenOrientation } from 'expo';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { Appearance } from 'react-native-appearance';
import * as Permissions from 'expo-permissions';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from '../components/Checkbox';

export default class RepeatsScr extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('reminders'),
    }
  };

  constructor(props) {
    super(props);
    this.state = { 
      reminders: [], 
      deadline: 0, 
      startingTime: 0,
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
      }, 100);
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
      }, 100);
    }
    this.subscription = DeviceEventEmitter.addListener("refresh", () => { setTimeout(() => {this._initListener()}, 100 )});
    this._initListener();
  }

  async componentDidMount() {
    const {status} = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
    if (status != 'granted') {
      this.props.navigation.goBack();
      setTimeout(() => {
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
              onPress: ()=>{
                Linking.openURL('app-settings:');
              },
            }
          ]
        );
      }, 500);
      return;
    }
    (await AsyncStorage.getItem('taskFailureReminder')==null)?(await AsyncStorage.setItem('taskFailureReminder','1')):null;
    this.setState({
      reminders: this.props.navigation.getParam('reminders', []), 
      deadline: this.props.navigation.getParam('deadline', 0), 
      startingTime: this.props.navigation.getParam('startingTime', 0),
    });
  }

  componentWillUnmount() {
    this._saveData();
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  }

  render() {
    bodCustom=0;
    bosCustom=0;
    for(i in this.state.reminders){
      if( this.state.reminders[i]<0 ){
        if( this.state.reminders[i] != -15 &&
            this.state.reminders[i] != -30 &&
            this.state.reminders[i] != -60 &&
            this.state.reminders[i] != -1440 )
          bodCustom=this.state.reminders[i];
      }
      else
      {
        if( this.state.reminders[i] != 0 &&
          this.state.reminders[i] != 15 &&
          this.state.reminders[i] != 30 &&
          this.state.reminders[i] != 60 &&
          this.state.reminders[i] != 1440 )
        bosCustom=this.state.reminders[i];
      }
    }
    const basedOnDeadline = {
      title: I18n.t('basedOnDeadline'),
      data: [{
        time: -15,
        title: I18n.t('beforeDeadline').replace('!time!', '15 '+I18n.t('minutes')),
      },{
        time: -30,
        title: I18n.t('beforeDeadline').replace('!time!', '30 '+I18n.t('minutes')),
      },{
        time: -60,
        title: I18n.t('beforeDeadline').replace('!time!', '1 '+I18n.t('hour')),
      },{
        time: -1440,
        title: I18n.t('beforeDeadline').replace('!time!', '1 '+I18n.t('day')),
      },{
        custom: 'deadline',
        time: bodCustom,
        title: I18n.t('beforeDeadline').replace('!time!', I18n.t('customTime')),
        placeholder: '1~9999',
      }]
    }
    const basedOnStartingTime = {
      title: I18n.t('basedOnStartingTime'),
      data: [{
        time: 0,
        title: I18n.t('atStartingTime'),
      },{
        time: 15,
        title: I18n.t('beforeStartingTime').replace('!time!', '15 '+I18n.t('minutes')),
      },{
        time: 30,
        title: I18n.t('beforeStartingTime').replace('!time!', '30 '+I18n.t('minutes')),
      },{
        time: 60,
        title: I18n.t('beforeStartingTime').replace('!time!', '1 '+I18n.t('hour')),
      },{
        time: 1440,
        title: I18n.t('beforeStartingTime').replace('!time!', '1 '+I18n.t('day')),
      },{
        custom: 'startingTime',
        time: bosCustom,
        title: I18n.t('beforeStartingTime').replace('!time!', I18n.t('customTime')),
        placeholder: '1~9999',
      }]
    }
    const mark={
      title: I18n.t('customTimeMark'),
      data:[
        {
          blank: 'blank',
        }
      ]
    }
    sections=[];
    if(this.state.deadline!=0){
      sections.push(basedOnDeadline);
    }
    if(this.state.startingTime!=0){
      sections.push(basedOnStartingTime);
    }
    sections.push(mark);
    return <SectionList
      style={styles.container}
      renderItem={this._renderItem}
      renderSectionHeader={this._renderSectionHeader}
      stickySectionHeadersEnabled={true}
      keyExtractor={(item, index) => index}
      ItemSeparatorComponent={() => (
        <View style={[{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
          <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
        </View>
      )}
      sections={sections}
      extraData={this.state}
    />;
  }

  _renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} darkMode={this.state.darkMode} />;
  };

  _renderItem = ({ item }) => {
    if('blank' in item)
      return(<View style={{height: 240}} />)
    if(!('custom' in item)){
      return(
        <Checkbox title={item.title} value={this.state.reminders.indexOf(item.time)!=-1} darkMode={this.state.darkMode} onChange={(value)=>{
          reminders=this.state.reminders;
          if(value){
            reminders.push(item.time);
          }
          else
          {
            reminders.splice(reminders.indexOf(item.time), 1);
          }
          this.setState({reminders});
        }} />
      )
    }
    else
    {
      return (
        <View style={[styles.option,{ flexDirection: 'row' }, (this.state.darkMode ? darkStyles.block : null)]}>
          <View style={[styles.optionIconContainer]}>
            <Ionicons style={{display: item.time!=0?'flex':'none'}} size={32} color={Colors.tintColor}
              name={Platform.OS === 'ios' ? 'ios-checkmark' : 'md-checkmark'} />
          </View>
          <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>{item.title}</Text>
          <TextInput
            style={[styles.optionText, styles.optionRight, { marginTop: 4 }, (this.state.darkMode ? darkStyles.text : null)]}
            placeholder={item.placeholder}
            onChangeText={(time)=>{
              reminders=this.state.reminders;
              ntime=(item.custom=='deadline')?parseInt(time)*-1:parseInt(time);
              if(parseInt(time)>=1&&parseInt(time)<=9999||time==''){
                if(reminders.indexOf(item.time)!=-1 && item.time!=0){
                  reminders.splice(reminders.indexOf(item.time), 1);
                }
                if(time!=''){
                  reminders.push(ntime);
                }
                this.setState({reminders});
              }
            }}
            maxLength={4}
            keyboardType='number-pad'
            value={item.time!=0?(item.custom=='deadline'?(item.time*-1).toString():item.time.toString()):''}
          />
        </View>
      )
    }
  };

  _saveData = () => {
    onChange=this.props.navigation.getParam('onChange', null);
    onChange(this.state.reminders);
    this.props.navigation.goBack();
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
  slugText: {
    color: '#6D6D72',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  option: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 24,
    height: 24,
    margin: 2,
  },
  optionText: {
    fontSize: 16,
    paddingTop: 10,
  },
  optionRight: {
    position: "absolute",
    top: 0,
    right: 8,
  },
  show: {
    display: 'flex',
  },
  hide: {
    display: 'none',
  }
});
