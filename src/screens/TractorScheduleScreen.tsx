import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { TractorScheduleItem, TractorScheduleNote } from '../types';
import { subscribeTractorSchedule, subscribeTractorNotes } from '../services/firestoreService';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const INITIAL_TRACTOR_SCHEDULE: TractorScheduleItem[] = [
  { id: '1', day: 'السبت', location: 'الحارة الغربية مع طريق بانص حتى مفرق برنة', order: 1 },
  { id: '2', day: 'الأحد', location: 'الحارة الشرقية الشمالية شمال المدارس حتى الجبل', order: 2 },
  { id: '3', day: 'الاثنين', location: 'الحارة الشرقية الجنوبية جنوب المدارس الكوع حتى السور الشرقي', order: 3 },
  { id: '4', day: 'الثلاثاء', location: 'الحارة الغربية مع طريق بانص حتى مفرق برنة', order: 4 },
  { id: '5', day: 'الأربعاء', location: 'الحارة الشرقية الشمالية شمال المدارس حتى الجبل', order: 5 },
  { id: '6', day: 'الخميس', location: 'الحارة الشرقية الجنوبية جنوب المدارس الكوع حتى السور الشرقي', order: 6 }
];

export const TractorScheduleScreen: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<TractorScheduleItem[]>(INITIAL_TRACTOR_SCHEDULE);
  const [notes, setNotes] = useState<TractorScheduleNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    
    const unsubSchedule = subscribeTractorSchedule((items) => {
      if (!unmounted) {
        if (items.length > 0) {
          setScheduleItems(items);
        }
        setLoading(false);
      }
    });

    const unsubNotes = subscribeTractorNotes((fetchedNotes) => {
      if (!unmounted) {
        setNotes(fetchedNotes);
      }
    });

    return () => {
      unmounted = true;
      unsubSchedule();
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="tractor" size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>خطة تشغيل جرار البلدية</Text>
        <Text style={styles.headerSubtitle}>(نظافة)</Text>
      </View>

      <FlatList
        data={[{ key: 'table' }]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <View style={[styles.mainBoard, SHADOWS.medium]}>
            
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderCellLoc}>المسار المستهدف</Text>
              <Text style={styles.tableHeaderCellDay}>اليوم</Text>
            </View>

            {/* Table Rows */}
            {scheduleItems.map((item, index) => (
              <View key={item.id} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                <Text style={styles.tableCellLoc}>{item.location}</Text>
                <View style={styles.tableCellDayContainer}>
                  <Text style={styles.tableCellDay}>{item.day}</Text>
                </View>
              </View>
            ))}

            {/* Notes Section */}
            {notes.length > 0 && (
              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.notesTitle}>ملاحظات هامة</Text>
                </View>
                {notes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={styles.noteIcon} />
                    <Text style={styles.noteText}>{note.text}</Text>
                  </View>
                ))}
              </View>
            )}

          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: SPACING.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F97316', // Orange for tractor
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  mainBoard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCellLoc: {
    flex: 2,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'right',
  },
  tableHeaderCellDay: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#FAFAFA',
  },
  tableCellLoc: {
    flex: 2,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
    paddingLeft: 8,
  },
  tableCellDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  tableCellDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316', // Match tractor color
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  notesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 6,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteIcon: {
    marginTop: 2,
    marginHorizontal: 6,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'left', // Flips to right in native RTL
    lineHeight: 22,
  },
});
