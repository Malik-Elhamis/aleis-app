import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeCleaningFees, subscribeCleaningFeesNotes } from '../services/firestoreService';
import { CleaningFee } from '../types';

export const CleaningFeesScreen: React.FC<any> = ({ navigation }) => {
  const [fees, setFees] = useState<CleaningFee[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    const unsubFees = subscribeCleaningFees((data) => {
      if (!unmounted) setFees(data);
      if (!unmounted && notes) setLoading(false);
    });
    const unsubNotes = subscribeCleaningFeesNotes((data) => {
      if (!unmounted) setNotes(data);
      if (!unmounted && fees) setLoading(false);
    });
    return () => {
      unmounted = true;
      unsubFees();
      unsubNotes();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>رسم النظافة الشهرية</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.brandingSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>خدمات بلدة العيس</Text>
          </View>
          <Text style={styles.slogan}>لبيئة نظيفة .. مجتمع صحي .. عيسنا أجمل</Text>
        </View>

        {/* The Table */}
        <View style={[styles.tableContainer, SHADOWS.medium]}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.th, { flex: 2 }]}><Text style={styles.thText}>نوع النشاط</Text></View>
            <View style={[styles.th, { flex: 1.2 }]}><Text style={styles.thText}>دولار ($)</Text></View>
            <View style={[styles.th, { flex: 1.2 }]}><Text style={styles.thText}>ل.س (SYP)</Text></View>
            <View style={[styles.th, { flex: 1.2 }]}><Text style={styles.thText}>ل.ت (TRY)</Text></View>
          </View>

          {/* Table Rows */}
          {fees.map((fee, index) => (
            <View key={fee.id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <View style={[styles.td, { flex: 2, alignItems: 'center', paddingRight: 12, backgroundColor: index % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }]}>
                <Text style={styles.tdTextActivity}>{fee.activityType}</Text>
              </View>
              <View style={[styles.td, { flex: 1.2, backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.tdTextAmount, { color: '#059669' }]}>{fee.usdAmount}</Text>
              </View>
              <View style={[styles.td, { flex: 1.2, backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.tdTextAmount, { color: '#2563EB' }]}>{fee.sypAmount}</Text>
              </View>
              <View style={[styles.td, { flex: 1.2, backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.tdTextAmount, { color: '#D97706' }]}>{fee.tryAmount}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notes Footer */}
        {notes.length > 0 && (
          <View style={styles.notesContainer}>
            {notes.map((note, idx) => (
              <View key={idx} style={styles.noteRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  backBtn: { padding: 4 },
  
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  
  brandingSection: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  badge: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 12 },
  badgeText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  slogan: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '700', textAlign: 'center' },

  tableContainer: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, ...SHADOWS.medium },
  tableHeaderRow: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', backgroundColor: '#1E293B' }, // Premium Dark Header
  th: { paddingVertical: 16, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  thText: { color: '#F8FAFC', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  
  tableRow: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  td: { paddingVertical: 18, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: COLORS.border },
  tdTextActivity: { fontSize: 13, fontWeight: '900', color: '#334155', textAlign: 'center' },
  tdTextAmount: { fontSize: 18, fontWeight: '900' },

  notesContainer: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  noteRow: { flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  noteText: { flex: 1, fontSize: 13, color: '#166534', fontWeight: '700', textAlign: 'right', lineHeight: 20 }
});
