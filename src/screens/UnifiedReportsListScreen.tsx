import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Complaint, Violation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const UnifiedReportsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [reports, setReports] = useState<(Complaint | Violation)[]>([]);

  useEffect(() => {
    let unsubs: Function[] = [];
    
    import('../services/firestoreService').then(({ subscribePublicComplaints, subscribePublicViolations }) => {
      let currentComplaints: Complaint[] = [];
      let currentViolations: Violation[] = [];
      
      const updateList = () => {
        const merged = [...currentComplaints, ...currentViolations];
        merged.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setReports(merged);
      };

      const unsubC = subscribePublicComplaints((items) => {
        currentComplaints = items;
        updateList();
      });

      const unsubV = subscribePublicViolations((items) => {
        currentViolations = items;
        updateList();
      });

      unsubs.push(unsubC, unsubV);
    });

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>سجل البلاغات والشكاوى 📋</Text>
        <Text style={styles.headerSub}>تتبع حالة جميع الشكاوى والمخالفات المسجلة</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id || String(Math.random())}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>لا توجد بلاغات مسجلة حالياً</Text>
            <Text style={styles.emptySub}>سيتم عرض كافة البلاغات المقدمة هنا.</Text>
          </View>
        }
        renderItem={({ item }) => {
          // Identify if it's a violation based on its ID prefix or category
          const isViolation = item.id?.startsWith('vio_') || 
            ['illegal_building', 'public_property', 'littering', 'vandalism', 'water_network'].includes(item.category);
            
          return (
            <TouchableOpacity 
              style={[styles.complaintCard, SHADOWS.medium, isViolation && { borderRightColor: '#E11D48' }]}
              onPress={() => {
                if (isViolation) {
                  navigation.navigate('ViolationDetails', { violationId: item.id });
                } else {
                  navigation.navigate('ComplaintDetails', { complaintId: item.id });
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <StatusBadge type={isViolation ? "violation" : "complaint"} status={item.status} customText={item.customStatusText} />
                <View style={styles.categoryTag}>
                  <Ionicons name={isViolation ? "warning" : "pricetag-outline"} size={14} color={isViolation ? '#E11D48' : COLORS.primary} style={{ marginLeft: 4 }} />
                  <Text style={[styles.categoryTagText, isViolation && { color: '#E11D48' }]}>{item.categoryLabel}</Text>
                </View>
              </View>

              <Text style={styles.complaintTitle}>{item.title}</Text>
              
              <Text style={styles.complaintDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>{typeof item.createdAt === 'string' ? new Date(item.createdAt).toLocaleDateString('ar-EG') : 'حديث'}</Text>
              </View>
            </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'left',
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'left',
    marginTop: 2,
  },
  listPadding: {
    padding: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  complaintCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 4,
    borderRightColor: COLORS.primary,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'left',
    marginBottom: 8,
  },
  complaintDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
