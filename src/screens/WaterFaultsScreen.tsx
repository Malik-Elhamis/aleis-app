import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WaterFault } from '../types';
import { subscribeWaterFaults } from '../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const WaterFaultsScreen: React.FC = () => {
  const [faults, setFaults] = useState<WaterFault[]>([]);

  useEffect(() => {
    const unsubFaults = subscribeWaterFaults((items) => {
      setFaults(items);
    });
    return () => unsubFaults();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'resolved': return { text: 'تم الإصلاح', bg: '#D1FAE5', color: '#059669' };
      case 'unresolved': return { text: 'لم يتم الإصلاح', bg: '#FEE2E2', color: '#991B1B' };
      case 'difficulty': return { text: 'صعوبة في الإصلاح', bg: '#FFEDD5', color: '#C2410C' };
      default: return { text: 'جاري الإصلاح', bg: '#FEF08A', color: '#854D0E' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>إعلانات الأعطال ⚠️</Text>
        <Text style={styles.headerSub}>متابعة حالة إصلاح طوارئ شبكة المياه</Text>
      </View>

      <FlatList
        data={faults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusDisplay = getStatusDisplay(item.status);
          return (
            <View style={[styles.faultCard, SHADOWS.medium, { borderRightColor: statusDisplay.color }]}>
              <View style={styles.faultHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                  <Ionicons name="warning-outline" size={18} color="#E11D48" style={{ marginLeft: 6 }} />
                  <Text style={styles.faultTitle} numberOfLines={2}>{item.title}</Text>
                </View>
                <View style={[styles.faultStatus, { backgroundColor: statusDisplay.bg }]}>
                  <Text style={[styles.faultStatusText, { color: statusDisplay.color }]}>
                    {statusDisplay.text}
                  </Text>
                </View>
              </View>

              <Text style={styles.faultDesc}>{item.description}</Text>
              
              <View style={styles.reasonBox}>
                <View style={styles.faultDetailRow}>
                  <Text style={styles.reasonLabel}>مكان العطل:</Text>
                  <Text style={styles.reasonText}>{item.location}</Text>
                </View>
                <View style={styles.faultDetailRow}>
                  <Text style={styles.reasonLabel}>تاريخ العطل:</Text>
                  <Text style={styles.reasonText}>{item.date}</Text>
                </View>
                <View style={styles.faultDetailRow}>
                  <Text style={styles.reasonLabel}>سبب العطل:</Text>
                  <Text style={styles.reasonText}>{item.reason}</Text>
                </View>
                {item.notes ? (
                  <View style={styles.faultDetailRow}>
                    <Text style={styles.reasonLabel}>ملاحظات:</Text>
                    <Text style={styles.reasonText}>{item.notes}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E11D48',
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listPadding: {
    padding: SPACING.md,
  },
  faultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: '#E11D48',
  },
  faultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'left',
    flex: 1,
  },
  faultStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  faultStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  faultDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: 18,
  },
  reasonBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  faultDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'left',
    marginLeft: 6,
    width: 75,
  },
  reasonText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'left',
    flex: 1,
  },
});
