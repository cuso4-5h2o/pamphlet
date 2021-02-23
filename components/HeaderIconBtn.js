import React, {
    Component,
} from 'react';

import {
    StyleSheet,
    View,
    Text,
    Platform,
} from 'react-native';

import Touchable from 'react-native-platform-touchable';

import * as Icon from '@expo/vector-icons';

class HeaderIconBtn extends Component {
    render() {
        return (
            <Touchable onPress={this.props.onPress}>
                <View style={{ flexDirection: 'row', height: 32, marginTop: 3, marginHorizontal: 8}}>
                    <Icon.Ionicons
                        name={Platform.OS === 'ios' ? 'ios-'+this.props.ion : 'md-'+this.props.ion}
                        size={26}
                        style={{ marginBottom: -3 }}
                        color={this.props.color}
                    />
                </View>
            </Touchable>
        );
    }
}

module.exports = HeaderIconBtn;