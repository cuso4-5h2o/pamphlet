import React from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { ScreenOrientation } from 'expo';
import { I18n } from '../langs/I18n';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import { Appearance } from 'react-native-appearance';
import Touchable from 'react-native-platform-touchable';
import * as Icon from '@expo/vector-icons';

export default class IconSelScr extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('icon'),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      name: props.navigation.getParam('name', 'locate'),
      color: props.navigation.getParam('color', Colors.tintColor),
      width: Dimensions.get('window').width,
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
    ScreenOrientation.addOrientationChangeListener(() => { this.setState({ width: Dimensions.get('window').width }) })
  }

  componentWillUnmount() {
    this._saveIcon();
    this.subscription.remove();
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
  }

  render() {
    const iconColors = [Colors.tintColor, '#0047AB', 'green', 'yellowgreen', 'darkorange', 'black'];
    const iconNames = ['locate', 'alarm', 'albums', 'alert', 'american-football', 'analytics',
      'aperture', 'apps', 'appstore', 'archive', 'attach', 'barcode', 'baseball', 'basket', 'basketball',
      'beaker', 'bed', 'beer', 'bicycle', 'boat', 'body', 'bonfire', 'book', 'bowtie', 'briefcase',
      'browsers', 'brush', 'bug', 'build', 'bulb', 'bus', 'business', 'cafe', 'calculator', 'call', 'camera',
      'car', 'card', 'cart', 'cash', 'chatbubbles', 'checkbox', 'clipboard', 'clock', 'color-filter',
      'color-palette', 'color-wand', 'compass', 'construct', 'contact', 'contacts', 'contract', 'contrast',
      'copy', 'create', 'crop', 'cube', 'cut', 'desktop', 'disc', 'easel', 'egg', 'exit', 'expand', 'eye',
      'eye-off', 'female', 'filing', 'film', 'finger-print', 'fitness', 'flag', 'flame', 'flash', 'flash-off',
      'flashlight', 'flask', 'flower', 'football', 'funnel', 'gift', 'glasses', 'hammer', 'hand', 'happy',
      'headset', 'heart', 'help-buoy', 'hourglass', 'ice-cream', 'images', 'infinite', 'jet', 'journal', 'key',
      'keypad', 'laptop', 'leaf', 'airplane', 'lock', 'magnet', 'mail', 'male', 'map', 'medal', 'medical',
      'medkit', 'megaphone', 'mic', 'moon', 'move', 'musical-note', 'musical-notes', 'navigate', 'notifications',
      'nuclear', 'nutrition', 'open', 'outlet', 'paper', 'paper-plane', 'partly-sunny', 'pause', 'paw',
      'phone-portrait', 'phone-landscape', 'photos', 'pie', 'pin', 'pint', 'pizza', 'planet', 'podium',
      'pulse', 'quote', 'radio', 'rainy', 'recording', 'refresh', 'restaurant', 'ribbon', 'rocket', 'rose',
      'sad', 'save', 'school', 'search', 'send', 'settings', 'share', 'share-alt', 'shirt', 'snow', 'speedometer'
      , 'star', 'stats', 'stopwatch', 'subway', 'sunny', 'swap', 'switch', 'sync', 'tablet-portrait',
      'tablet-landscape', 'tennisball', 'text', 'thermometer', 'thumbs-up', 'thumbs-down', 'thunderstorm',
      'time', 'timer', 'today', 'train', 'transgender', 'trash', 'trophy', 'tv', 'umbrella', 'unlock',
      'videocam', 'walk', 'wallet', 'warning', 'watch', 'water', 'wifi'];
    iconColorsObj = [];
    iconNamesObj = [];
    for (i in iconColors)
      iconColorsObj.push({ key: iconColors[i] });
    for (ii in iconNames)
      iconNamesObj.push({ key: iconNames[ii] });
    exStyle = StyleSheet.create({ cbg: { backgroundColor: Colors.tintColor } });
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <SectionHeader title={I18n.t('chooseColor')} darkMode={this.state.darkMode} />
        <SectionContent darkMode={this.state.darkMode}>
          <FlatList
            data={iconColorsObj}
            horizontal={false}
            numColumns={Math.floor(this.state.width / 56)}
            key={Math.floor(this.state.width / 56)}
            renderItem={({ item }) => <ColorOption color={item.key} nColor={this.state.color} darkMode={this.state.darkMode} onChange={() => { this.setState({ color: item.key }) }} />}
          />
        </SectionContent>
        <SectionHeader title={I18n.t('chooseIcon')} darkMode={this.state.darkMode} />
        <SectionContent darkMode={this.state.darkMode}>
          <View style={{ paddingBottom: 128 }}>
            <FlatList
              data={iconNamesObj}
              horizontal={false}
              numColumns={Math.floor(this.state.width / 56)}
              key={Math.floor(this.state.width / 56)}
              renderItem={({ item }) => <IconOption icon={item.key} nIcon={this.state.name} color={this.state.color} darkMode={this.state.darkMode} onChange={() => { this.setState({ name: item.key }) }} />}
            />
          </View>
        </SectionContent>
      </SafeAreaView>
    )
  }

  _saveIcon = () => {
    onChangeIcon = this.props.navigation.getParam('onChangeIcon', null);
    onChangeIcon(this.state.name, this.state.color);
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

const ColorOption = ({ color, nColor, darkMode, onChange }) => {
  exStyle = StyleSheet.create({ cbg: { backgroundColor: (color == 'black' && darkMode) ? 'white' : color } });
  return (
    <Touchable onPress={() => { if (color != nColor) onChange() }}>
      <View style={[styles.circle, exStyle.cbg]}>
        <Icon.Ionicons
          name={Platform.OS === 'ios' ? 'ios-checkmark-circle' : 'md-checkmark-circle'}
          size={20}
          color='red'
          style={[styles.colorCheckedSignal, (nColor == color ? styles.show : styles.hide)]}
        />
      </View>
    </Touchable>
  );
};

const IconOption = ({ icon, nIcon, color, darkMode, onChange }) => {
  return (
    <Touchable onPress={() => { if (icon != nIcon) onChange() }}>
      <View style={{ width: 48, height: 48, margin: 4 }}>
        <Icon.Ionicons
          name={Platform.OS === 'ios' ? 'ios-' + icon : 'md-' + icon}
          size={48}
          color={(color == 'black' && darkMode) ? 'white' : color}
          style={styles.iconOption}
        />
        <Icon.Ionicons
          name={Platform.OS === 'ios' ? 'ios-checkmark-circle' : 'md-checkmark-circle'}
          size={20}
          color='red'
          style={[styles.iconCheckedSignal, (nIcon == icon ? styles.show : styles.hide)]}
        />
      </View>
    </Touchable>
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
    paddingBottom: 12,
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
    fontSize: 12,
    marginTop: 1,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 30,
    marginRight: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    marginRight: 8,
    alignItems: 'center',
  },
  colorCheckedSignal: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  iconCheckedSignal: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  show: {
    display: 'flex',
  },
  hide: {
    display: 'none',
  }
});
