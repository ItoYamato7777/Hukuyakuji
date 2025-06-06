import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

// ボタンの見た目や動作をpropsとして受け取る
const CustomButton = ({ onPress, iconSource, text, style, iconStyle, textStyle }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            {/* iconSourceがあればImageを表示 */}
            {iconSource && <Image source={iconSource} style={[styles.icon, iconStyle]} />}
            {/* textがあればTextを表示 */}
            {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
    text: {
        // このフォントは別途プロジェクトに追加する必要があります
        fontFamily: 'A_P-OTF_PuhuPicnic_Min2-H',
        color: '#7b99cc',
        fontSize: 16,
        marginTop: 4,
    },
});

export default CustomButton;