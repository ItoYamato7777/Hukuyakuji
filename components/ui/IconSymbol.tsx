// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home', // 既存
  // 'paperplane.fill': 'send', // 元のサンプルで使用。不要なら削除可
  // 'chevron.left.forwardslash.chevron.right': 'code', // 元のサンプルで使用。不要なら削除可
  // 'chevron.right': 'chevron-right', // 元のサンプルで使用。不要なら削除可
  'gearshape.fill': 'settings', // 設定アイコン用 (HeaderRight.tsx で使用)
  'square.and.pencil': 'edit', // 登録タブアイコン用 (例: Material Icons の 'edit')
  'book.fill': 'menu-book', // 図鑑タブアイコン用 (例: Material Icons の 'menu-book')
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
