// components/MainLayout.tsx

import { useRouter } from 'expo-router';
import React from 'react';
import {
    ImageBackground,
    ImageSourcePropType,
    SafeAreaView,
    StyleSheet,
    View,
} from 'react-native';
import BleStatusIcon from './ble/BleStatusIcon';
import BottomNavBar from './BottomNavBar';
import CharacterProfile from './CharacterProfile';
import CustomButton from './CustomButton';

const defaultBackground = require('@/assets/images/background/home_background_1.png');
const defaultSettingsIcon = require('@/assets/images/icon/setting_icon.png');

// characterDataの型定義
interface CharacterData {
    status: string;
    name: string;
    nameSuffix: string;
    level: number;
    nextExp: number;
}

interface MainLayoutProps {
    children: React.ReactNode;
    showCharacterProfile?: boolean;
    characterData?: CharacterData;
    backgroundImageSource?: ImageSourcePropType;
    settingsIconSource?: ImageSourcePropType;
    settingsIconText?: string;
}

const MainLayout = ({
    children,
    showCharacterProfile = false,
    characterData,
    backgroundImageSource = defaultBackground,
    settingsIconSource = defaultSettingsIcon,
    settingsIconText = '',
}: MainLayoutProps) => {
    const router = useRouter();

    const handleSettingsPress = () => {
        router.push('/settings');
    };

    // propsで渡されたcharacterDataがあればそれを使う
    const defaultCharacterData = {
        status: 'うまれたて',
        name: 'ジゴキシン 神',
        nameSuffix: 'がみ',
        level: 3,
        nextExp: 50,
    };
    const finalCharacterData = characterData || defaultCharacterData;


    return (
        <SafeAreaView style={styles.root}>
            <ImageBackground
                style={styles.backgroundImage}
                source={backgroundImageSource}
                resizeMode="stretch">

                <View style={[styles.topSection, !showCharacterProfile && styles.topSectionNoProfile]}>
                    {showCharacterProfile && <CharacterProfile {...finalCharacterData} />}

                    <View style={styles.topRightIcons}>
                        <BleStatusIcon />
                        <CustomButton
                            onPress={handleSettingsPress}
                            iconSource={settingsIconSource}
                            text={settingsIconText}
                            style={styles.settingsButton}
                            iconStyle={styles.settingsIcon}
                            textStyle={styles.settingsText}
                        />
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {children}
                </View>

                <BottomNavBar />

            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'white',
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    topSectionNoProfile: {
        justifyContent: 'flex-end',
    },
    topRightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButton: {
        marginTop: 30,
        padding: 10,
    },
    settingsIcon: {
        width: 45,
        height: 50,
    },
    settingsText: {
        fontFamily: 'A_P-OTF_PuhuPicnic_Min2-H',
        color: '#7b99cc',
        fontSize: 12,
        marginTop: 2,
    }
});

export default MainLayout;