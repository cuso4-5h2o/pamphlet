import React, {
    Component,
    PropTypes,
} from 'react';

import {
    StyleSheet,
    PixelRatio,
    Text,
    View,
    TouchableHighlight,
    Platform,
} from 'react-native';

import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';

class RadiusBtn extends Component {
    static defaultProps = {
        btnName: 'Button',
        underlayColor: Colors.radiusBtnPressed,
    };

    render() {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <TouchableHighlight
                    underlayColor={this.props.underlayColor}
                    activeOpacity={0.5}
                    style={[styles.center, styles.btnDefaultStyle, this.props.btnStyle]}
                    onPress={this.props.onPress}>
                    <Text style={[styles.textDefaultStyle, this.props.textStyle]}>{this.props.btnName}</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDefaultStyle: {
        width: 100,
        height: 20,
        backgroundColor: Colors.radiusBtn,
        borderRadius: 8,
    },
    textDefaultStyle: {
        fontSize: 16,
        color: '#ffffff',
    },
});

module.exports = RadiusBtn;