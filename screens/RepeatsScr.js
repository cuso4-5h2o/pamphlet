import React from 'react';
import {
  DeviceEventEmitter,
  Switch,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import Moment from 'moment';
import { I18n } from '../langs/I18n';
import { ScreenOrientation } from 'expo';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { Appearance } from 'react-native-appearance';
import Touchable from 'react-native-platform-touchable';
import DatePicker from 'react-native-datepicker';
import * as Icon from '@expo/vector-icons';
import RadioList from '../components/RadioList';

export default class SubtasksScr extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('repeats'),
    }
  };

  constructor(props) {
    super(props);
    this.state = { 
      repeats: 0, 
      repeatsData: [], 
      setEnd: false, 
      repeatUntil: Moment().add(1, 'M').format('X'), 
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

  componentDidMount() {
    repeats=this.props.navigation.getParam('repeats', {});
    repeatsData=[I18n.t('none'), I18n.t('daily')];
    time=this.props.navigation.getParam('time', 0);
    date=new Date(time*1000);
    repeatsData.push(I18n.t('weekly')+I18n.t('weeklyMark').replace('!day!', I18n.t('wDay'+date.getDay())));
    repeatsData.push((date.getDay()>=1 && date.getDay()<=5)?I18n.t('weekdays')+I18n.t('weekdaysMark'):I18n.t('weekends')+I18n.t('weekendsMark'))
    repeatsData.push(I18n.t('monthly')+I18n.t('monthlyMark').replace('!date!', date.getDate()));
    repeatsData.push(I18n.t('yearly')+I18n.t('yearlyMark').replace('!date!', (date.getMonth()+1)+'/'+date.getDate()));
    this.setState({
      repeats: repeats.type,
      setEnd: repeats.end!=0,
      repeatsData
    });
    if(repeats.end!=0){
      this.setState({
        repeatUntil: repeats.end,
      })
    }
  }
  
  componentWillUnmount() {
    this._saveData();
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  }

  render() {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <SectionHeader title={I18n.t('repeatTypes')} darkMode={this.state.darkMode} />
        <SectionContent darkMode={this.state.darkMode}>
          <RadioList
            data={this.state.repeatsData}
            value={this.state.repeats}
            darkMode={this.state.darkMode}
            onChange={(repeats)=>{this.setState({repeats})}}
          />
        </SectionContent>
        <SectionHeader title={I18n.t('repeatEnd')} darkMode={this.state.darkMode} hide={this.state.repeats==0}/>
        <SectionContent darkMode={this.state.darkMode} hide={this.state.repeats==0}>
          <View style={styles.option}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>
                {I18n.t('setEndOfRepeats')}
              </Text>
              <Switch style={[styles.optionSwitch]}
                onValueChange={(value)=>{
                  this.setState({setEnd: value});
                }} value={this.state.setEnd} />
            </View>
          </View>
        </SectionContent>
        <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
          <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
        </View>
        <SectionContent darkMode={this.state.darkMode} hide={!this.state.setEnd || this.state.repeats==0}>
          <Touchable
            style={styles.option}
            onPress={() => {
              this.datePickerRef.onPressDate()
            }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>
                {I18n.t('repeatUntil')}
              </Text>
              <View style={styles.optionRight}>
                <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>
                  {Moment(new Date(this.state.repeatUntil * 1000)).format('l')}
                </Text>
              </View>
              <View>
                <DatePicker
                  style={{ width: 0, height: 0 }}
                  date={Moment(new Date(this.state.repeatUntil * 1000)).format("YYYY-MM-DD")}
                  minDate={new Date()}
                  mode="date"
                  format="YYYY-MM-DD"
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
                    this.setState({repeatUntil: Moment(datetime).format('X')})
                  }}
                />
              </View>
            </View>
          </Touchable>
        </SectionContent>
      </SafeAreaView>
    )
  }

  _saveData = () => {
    onChange=this.props.navigation.getParam('onChange', null);
    onChange({
      type: this.state.repeats,
      end: (this.state.setEnd && (this.state.repeats!=0))?this.state.repeatUntil:0,
    });
    this.props.navigation.goBack();
  }
}

const SectionHeader = ({ title, darkMode, hide }) => {
  if (title)
    textCom = <Text style={[styles.sectionHeaderText, (darkMode?darkStyles.altText:null)]}>{title}</Text>;
  else
    textCom = null;
  return (
    <View style={[styles.sectionHeaderContainer, (darkMode ? [darkStyles.view, darkStyles.border] : null), { display: (hide ? 'none' : 'flex') }]}>
      {textCom}
    </View>
  );
};

const SectionContent = props => {
  return (
    <View style={[styles.sectionContentContainer, (props.darkMode?darkStyles.block:null), { display: (props.hide ? 'none' : 'flex') }]}>
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
    paddingVertical: 12,
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
  show: {
    display: 'flex',
  },
  hide: {
    display: 'none',
  }
});
