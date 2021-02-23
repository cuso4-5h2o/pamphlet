import React from 'react';
import {
  AsyncStorage,
  DeviceEventEmitter,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import { ScreenOrientation } from 'expo';
import { I18n } from '../langs/I18n';
import { Appearance } from 'react-native-appearance';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import RadiusBtn from '../components/RadiusBtn';
import Touchable from 'react-native-platform-touchable';

export default class WelcomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  async componentDidMount() {

  };

  async componentWillUnmount() {
    await AsyncStorage.setItem('dontShowWelcome', 'y');
    setTimeout(()=>{DeviceEventEmitter.emit("refresh");},50);
    this.subscription.remove();
  };

  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.view }, (this.state.darkMode ? darkStyles.view : null)]}>
        <ScrollView style={[styles.container, (this.state.darkMode ? darkStyles.view : null)]}>
          <View style={{ marginTop: 48, height: 36 }}>
            <Text style={{ fontSize: 32, lineHeight: 36, textAlign: 'center', fontWeight: 'bold', color: this.state.darkMode ? 'white' : 'black' }}>{I18n.t('welcome')}</Text>
          </View>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.itemIcon}>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-timer' : 'md-timer'} size={48} color={Colors.tintColor} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle,this.state.darkMode ? darkStyles.text :null]}>{I18n.t('feature1Title')}</Text>
                <Text style={[styles.itemText,this.state.darkMode ? darkStyles.altText :null]}>{I18n.t('feature1Text')}</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.itemIcon}>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-gift' : 'md-gift'} size={48} color={Colors.tintColor} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle,this.state.darkMode ? darkStyles.text :null]}>{I18n.t('feature2Title')}</Text>
                <Text style={[styles.itemText,this.state.darkMode ? darkStyles.altText :null]}>{I18n.t('feature2Text')}</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.itemIcon}>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-hourglass' : 'md-hourglass'} size={48} color={Colors.tintColor} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle,this.state.darkMode ? darkStyles.text :null]}>{I18n.t('feature3Title')}</Text>
                <Text style={[styles.itemText,this.state.darkMode ? darkStyles.altText :null]}>{I18n.t('feature3Text')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <View>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name={Platform.OS === 'ios' ? 'ios-pulse' : 'md-pulse'} size={32} color={Colors.tintColor} />
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.sectionHeaderText]}>{I18n.t('privatePolicy')}</Text>
              <Touchable onPress={() => {
                WebBrowser.openBrowserAsync('https://cuso4.tech/privacy.html');
              }}>
                <Text style={[styles.sectionHeaderText, { color: Colors.tintColor, textAlign: 'center' }]}>
                  {I18n.t('viewPrivatePolicy')}
                </Text>
              </Touchable>
            </View>
          </View>
          <RadiusBtn onPress={this.continueBtnPressed} btnName={I18n.t('continue')} underlayColor={Colors.tintColor} btnStyle={{ flex: 1, height: 48, marginHorizontal: 16, marginBottom: 12 }} />
        </View>
      </SafeAreaView>
    );
  };

  continueBtnPressed = async () => {
    this.props.navigation.navigate('Main');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  featureList: {
    flex: 1,
    marginTop: 20,
    marginBottom: 64,
  },
  featureItem: {
    flexDirection: 'row',
    height: 64,
    marginVertical: 24,
    marginHorizontal: 24,
  },
  itemTextContainer: {
    marginLeft: 12,
    marginRight: 32,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -4,
    color: 'black'
  },
  itemText: {
    marginTop: 3,
    lineHeight: 16,
    color: 'gray'
  },
  itemIcon: {
    marginTop: 4,
    width: 48,
    height: 48,
  },
  sectionHeaderText: {
    fontSize: 14,
    color: 'gray',
  },
});
