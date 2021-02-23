import React, {
    Component,
    PropTypes,
} from 'react';

import {
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native';

import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import Touchable from 'react-native-platform-touchable';
import { Ionicons } from '@expo/vector-icons';

class Checkbox extends Component {
    static defaultProps = {
        title: 'Checkbox',
        value: false,
        onChange: (value) = {},
        darkMode: false,
        children: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            value: false,
            darkMode: false,
        };
    }

    componentDidMount() {
        if ('value' in this.props) this.setState({ value: this.props.value });
        if ('darkMode' in this.props) this.setState({ darkMode: this.props.darkMode });
    }

    UNSAFE_componentWillReceiveProps(nprops) {
        if ('value' in nprops) this.setState({ value: nprops.value });
        if ('darkMode' in nprops) this.setState({ darkMode: nprops.darkMode });
    }

    render() {
        return (
            <Touchable onPress={() => {
                this.props.onChange(!this.state.value);
            }}>
                <View style={[styles.option, (this.state.darkMode ? darkStyles.block : null)]}>
                    <View style={[styles.optionIconContainer]}>
                        <Ionicons style={{ display: this.state.value ? 'flex' : 'none' }} size={32} color={Colors.tintColor}
                            name={Platform.OS === 'ios' ? 'ios-checkmark' : 'md-checkmark'} />
                    </View>
                    <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>{this.props.title}</Text>
                </View>
            </Touchable>
        );
    }
}

const styles = StyleSheet.create({
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
});

module.exports = Checkbox;