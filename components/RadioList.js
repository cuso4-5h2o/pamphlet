import React, {
    Component,
    PropTypes,
} from 'react';

import {
    FlatList,
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native';

import Colors from '../constants/Colors';
import darkStyles from '../constants/DarkStyles';
import Touchable from 'react-native-platform-touchable';
import { Ionicons } from '@expo/vector-icons';

class RadioList extends Component {
    static defaultProps = {
        title: 'RadioList',
        data: [],
        value: 0,
        onChange: (value)={},
        darkMode: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: 0,
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
            <FlatList
                data={this.props.data}
                extraData={this.state}
                ItemSeparatorComponent={() => (
                  <View style={[{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBlock : Colors.block) }]}>
                    <View style={[{ flex: 1, marginHorizontal: 15, height: StyleSheet.hairlineWidth, backgroundColor: (this.state.darkMode ? Colors.darkBorder : Colors.border) }]} />
                  </View>
                )}
                renderItem={({item}) =>{
                    return(
                        <Touchable onPress={()=>{
                            this.props.onChange(this.props.data.indexOf(item));
                            this.setState({value: this.props.data.indexOf(item)});
                        }}>
                            <View style={[styles.option, (this.state.darkMode ? darkStyles.block : null)]}>
                                <View style={[styles.optionIconContainer]}>
                                    <Ionicons style={{display: this.props.data[this.state.value]==item?'flex':'none'}} size={32} color={Colors.tintColor}
                                        name={Platform.OS === 'ios' ? 'ios-checkmark' : 'md-checkmark'} />
                                </View>
                                <View>
                                    <Text style={[styles.optionText, (this.state.darkMode ? darkStyles.text : null)]}>{item}</Text>
                                </View>
                            </View>
                        </Touchable>
                    )
                }}
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }
}

const styles = StyleSheet.create({
    option: {
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

module.exports = RadioList;