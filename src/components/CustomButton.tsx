import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  iconName,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = { ...styles.container };
    
    switch (variant) {
      case 'primary':
        base.backgroundColor = COLORS.primary;
        break;
      case 'secondary':
        base.backgroundColor = COLORS.primaryLight;
        break;
      case 'accent':
        base.backgroundColor = COLORS.accent;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = COLORS.primary;
        break;
      case 'danger':
        base.backgroundColor = COLORS.danger;
        break;
    }

    if (size === 'small') {
      base.paddingVertical = 8;
      base.paddingHorizontal = 12;
    } else if (size === 'large') {
      base.paddingVertical = 16;
      base.paddingHorizontal = 24;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'secondary') return COLORS.primary;
    if (variant === 'accent') return COLORS.primaryDark;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), SHADOWS.small, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <React.Fragment>
          {iconName && (
            <Ionicons
              name={iconName}
              size={size === 'small' ? 18 : 22}
              color={getTextColor()}
              style={{ marginLeft: 8 }}
            />
          )}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse', // RTL alignment
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
