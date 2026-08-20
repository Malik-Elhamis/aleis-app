import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WaterPumpingStatus, ComplaintStatus } from '../types';
import { COLORS } from '../config/theme';

interface StatusBadgeProps {
  type: 'water' | 'complaint' | 'violation';
  status: WaterPumpingStatus | ComplaintStatus;
  customText?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, customText }) => {
  const getBadgeStyle = () => {
    if (type === 'water') {
      switch (status) {
        case 'active':
          return { bg: COLORS.successLight, text: COLORS.success, label: customText || 'ضخ جاري' };
        case 'scheduled':
          return { bg: COLORS.infoLight, text: COLORS.info, label: customText || 'مجدول اليوم' };
        case 'delayed':
          return { bg: COLORS.warningLight, text: COLORS.warning, label: customText || 'تأخير متوقع' };
        case 'stopped':
          return { bg: COLORS.dangerLight, text: COLORS.danger, label: customText || 'متوقف للصيانة' };
      }
    } else {
      switch (status as ComplaintStatus) {
        case 'pending':
          return { bg: COLORS.warningLight, text: COLORS.warning, label: customText || 'قيد الدراسة' };
        case 'under_review':
          return { bg: '#E0E7FF', text: '#4338CA', label: customText || 'قيد المراجعة' };
        case 'in_progress':
          return { bg: COLORS.infoLight, text: COLORS.info, label: customText || 'قيد التنفيذ' };
        case 'resolved':
          return { bg: COLORS.successLight, text: COLORS.success, label: customText || 'تم الحل' };
        case 'rejected':
          return { bg: COLORS.dangerLight, text: COLORS.danger, label: customText || 'مرفوض' };
        case 'other':
          return { bg: '#F3F4F6', text: '#4B5563', label: customText || 'أخرى' };
      }
    }
    return { bg: '#E2E8F0', text: '#475569', label: customText || String(status) };
  };

  const badgeConfig = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: badgeConfig.bg }]}>
      <Text style={[styles.badgeText, { color: badgeConfig.text }]}>
        {badgeConfig.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
