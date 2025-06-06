import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomButton from './CustomButton';

// アイコンの情報を一元管理
const NAV_ICONS = {
    register: require('@/assets/images/icon/register_icon.png'),
    pokedex: require('@/assets/images/icon/pokedex_icon.png'),
    quiz: require('@/assets/images/icon/quiz_icon.png'),
    // 「戻る」アイコンを定義（既存のアイコンを仮で使用）
    // 適切な戻る矢印などのアイコンがあれば、パスを差し替えてください。
    back: require('@/assets/images/icon/back_icon.png'),
    // 現在の画面が見つからなかった場合のデフォルトアイコン
    default: require('@/assets/images/icon/setting_icon.png'),
};

const BottomNavBar = () => {
    const router = useRouter();
    const pathname = usePathname(); // 現在のURLパスを取得

    // ホーム画面で表示するナビゲーションアイテム
    const homeNavItems = [
        { path: '/register', icon: NAV_ICONS.register },
        { path: '/pokedex', icon: NAV_ICONS.pokedex },
        { path: '/quiz', icon: NAV_ICONS.quiz },
    ];

    // サブ画面で、中央に表示する現在の画面のアイコンを取得する関数
    const getCurrentScreenIcon = () => {
        switch (pathname) {
            case '/register':
                return NAV_ICONS.register;
            case '/pokedex':
                return NAV_ICONS.pokedex;
            case '/quiz':
                return NAV_ICONS.quiz;
            default:
                // settings画面なども考慮
                return NAV_ICONS.default;
        }
    };

    // ホーム画面かどうかで表示を切り替える
    const renderNavBar = () => {
        if (pathname === '/') {
            // --- ホーム画面用のナビゲーションバー ---
            return (
                <View style={styles.homeNavContainer}>
                    {homeNavItems.map((item, index) => (
                        <CustomButton
                            key={index}
                            onPress={() => router.push(item.path)}
                            iconSource={item.icon}
                        />
                    ))}
                </View>
            );
        } else {
            // --- サブ画面用のナビゲーションバー ---
            return (
                <View style={styles.subNavContainer}>
                    {/* 左：戻るボタン */}
                    <CustomButton
                        onPress={() => router.push('/')}
                        iconSource={NAV_ICONS.back}
                    />
                    {/* 中央：現在の画面のアイコン */}
                    <CustomButton
                        onPress={() => { }} // 中央のアイコンは押しても何も起きないようにする
                        iconSource={getCurrentScreenIcon()}
                    />
                    {/* 右：空の要素（中央揃えを維持するため） */}
                    <View style={styles.placeholder} />
                </View>
            );
        }
    };

    return <View style={styles.bottomNav}>{renderNavBar()}</View>;
};

const styles = StyleSheet.create({
    bottomNav: {
        width: '100%',
        paddingBottom: 20,
    },
    homeNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // 3つのアイコンを等間隔に配置
        alignItems: 'center',
    },
    subNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 3つの要素を両端と中央に配置
        alignItems: 'center',
        paddingHorizontal: 20, // 左右に余白を追加
    },
    placeholder: {
        // CustomButton内のアイコンと同じ幅を持たせることで、中央のアイコンが真ん中に来るように調整
        width: 45,
        height: 45,
    },
});

export default BottomNavBar;