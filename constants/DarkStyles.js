import { StyleSheet } from 'react-native';
import Colors from './Colors';
  
export default StyleSheet.create({
    view: {
        backgroundColor: Colors.darkView,
    },
    text: {
        color: Colors.darkText,
    },
    block: {
        backgroundColor: Colors.darkBlock,
    },
    altText: {
        color: Colors.darkAltText,
    },
    border: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.darkBorder,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.darkBorder,
    }
});
