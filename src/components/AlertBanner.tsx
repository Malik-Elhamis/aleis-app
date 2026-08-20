import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UrgentAlert } from '../types';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

interface AlertBannerProps {
  alert: UrgentAlert;
  onPress?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onPress }) => {
  const getBannerColor = () => {
    switch (alert.priority) {
      case 'urgent':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: COLORS.danger };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warning, border: COLORS.warning };
      default:
        return { bg: COLORS.infoLight, text: COLORS.info, border: COLORS.info };
    }
  };

  const theme = getBannerColor();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: theme.bg, borderColor: theme.border },
        SHADOWS.small
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="alert-circle-sharp" size={22} color={theme.text} style={{ marginLeft: 6 }} />
          <Text style={[styles.title, { color: theme.text }]}>{alert.title}</Text>
        </View>
        <Text style={styles.badge}>{alert.date}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>{alert.message}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 5,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  badge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  message: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'right',
    lineHeight: 18,
  },
});
