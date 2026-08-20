import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const ELECTRIC_COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  accent: '#F59E0B',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  statusWorking: '#F59E0B',
  statusResolved: '#10B981',
  statusInvestigating: '#EF4444'
};

export const ElectricityAlertDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { alert } = route.params;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'working': return { label: 'جاري العمل عليها', color: ELECTRIC_COLORS.statusWorking, icon: 'construct' };
      case 'resolved': return { label: 'تم الإصلاح', color: ELECTRIC_COLORS.statusResolved, icon: 'checkmark-circle' };
      case 'investigating': return { label: 'جاري الفحص', color: ELECTRIC_COLORS.statusInvestigating, icon: 'search' };
      default: return { label: 'تنبيه عام', color: ELECTRIC_COLORS.accent, icon: 'information-circle' };
    }
  };

  const statusInfo = getStatusInfo(alert.status);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <View style={styles.areaContainer}>
            <Ionicons name="location" size={24} color={ELECTRIC_COLORS.primary} />
            <Text style={styles.areaText}>{alert.area}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>حالة العطل:</Text>
            <View style={[styles.badge, { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} style={{ marginLeft: 4 }} />
              <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>

          {alert.estimatedTime ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>المدة المتوقعة:</Text>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={18} color={ELECTRIC_COLORS.primary} />
                <Text style={styles.timeText}>{alert.estimatedTime}</Text>
              </View>
            </View>
          ) : null}

          {alert.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>ملاحظات إضافية:</Text>
              <Text style={styles.notesText}>{alert.notes}</Text>
            </View>
          ) : null}
          
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>عودة للقائمة</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ELECTRIC_COLORS.background },
  content: { padding: SPACING.lg },
  
  card: {
    backgroundColor: ELECTRIC_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium
  },
  
  areaContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16
  },
  areaText: {
    fontSize: 22,
    fontWeight: '800',
    color: ELECTRIC_COLORS.textPrimary,
    marginRight: 8,
    flex: 1,
    textAlign: 'right'
  },
  
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16
  },
  
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: ELECTRIC_COLORS.textSecondary
  },
  
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6
  },
  
  timeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: ELECTRIC_COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: ELECTRIC_COLORS.primary
  },
  
  notesContainer: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  notesLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: ELECTRIC_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'right'
  },
  notesText: {
    fontSize: 15,
    color: ELECTRIC_COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 24
  },
  
  backBtn: {
    marginTop: 24,
    backgroundColor: ELECTRIC_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
