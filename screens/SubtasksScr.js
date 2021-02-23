import React from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from 'react-native';
import { ScreenOrientation } from 'expo';
import { I18n } from '../langs/I18n';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { Appearance } from 'react-native-appearance';

export default class SubtasksScr extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('subtasks'),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      subtasks: '',
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
    subtasks = this.props.navigation.getParam('subtasks', []);
    subtasksText = '';
    for (i in subtasks) {
      subtasksText += subtasks[i];
      if (subtasks.length > (i - 1))
        subtasksText += '\n';
    }
    this.setState({ subtasks: subtasksText });
  }

  componentWillUnmount() {
    this._saveData();
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  }

  render() {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <SectionHeader title='' darkMode={this.state.darkMode} />
        <SectionContent darkMode={this.state.darkMode}>
          <TextInput
            style={[styles.option, styles.optionText, styles.multiline, (this.state.darkMode ? darkStyles.text : null)]}
            placeholder={I18n.t('subtasksHolder')}
            onChangeText={(text) => { this.setState({ subtasks: text }) }}
            maxLength={32768}
            multiline={true}
            value={this.state.subtasks}
          />
        </SectionContent>
        <SectionHeader title={I18n.t('subtasksMark')} darkMode={this.state.darkMode} />
      </SafeAreaView>
    )
  }

  _saveData = () => {
    var subtasks = [], subtasksTmp = this.state.subtasks.split('\n');
    for (i in subtasksTmp) {
      if (subtasksTmp[i].trim() != '')
        subtasks.push(subtasksTmp[i].trim());
    }
    onChange = this.props.navigation.getParam('onChange', null);
    onChange(subtasks);
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

const SectionContent = props => {
  return (
    <View style={[styles.sectionContentContainer, (props.darkMode?darkStyles.block:null)]}>
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
  },
  optionText: {
    fontSize: 16,
    marginTop: 1,
  },
  multiline: {
    height: 320,
  },
  show: {
    display: 'flex',
  },
  hide: {
    display: 'none',
  }
});
