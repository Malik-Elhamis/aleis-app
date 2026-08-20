import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { Complaint, Violation } from '../../types';
import { subscribeAdminComplaints, subscribeAdminViolations } from '../../services/firestoreService';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminUnifiedReportsScreen: React.FC<any> = ({ navigation }) => {
  const [reports, setReports] = useState<(Complaint | Violation)[]>([]);

  useEffect(() => {
    let unsubs: Function[] = [];
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

    const unsubC = subscribeAdminComplaints((items) => {
      currentComplaints = items;
      updateList();
    });

    const unsubV = subscribeAdminViolations((items) => {
      currentViolations = items;
      updateList();
    });

    unsubs.push(unsubC, unsubV);

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  const openReport = (item: Complaint | Violation, isViolation: boolean) => {
    if (isViolation) {
      navigation.navigate('AdminViolationDetails', { violationId: item.id });
    } else {
      navigation.navigate('AdminComplaintDetails', { complaintId: item.id });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id || String(Math.random())}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد بلاغات مسجلة حالياً</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isViolation = item.id?.startsWith('vio_') || 
            ['illegal_building', 'public_property', 'littering', 'vandalism', 'water_network'].includes(item.category);

          return (
            <TouchableOpacity 
              style={[styles.card, SHADOWS.small, isViolation && { borderRightColor: '#E11D48' }]}
              onPress={() => openReport(item, isViolation)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <StatusBadge type={isViolation ? "violation" : "complaint"} status={item.status} customText={item.customStatusText} />
                <Text style={styles.dateText}>{typeof item.createdAt === 'string' ? new Date(item.createdAt).toLocaleDateString('ar-EG') : 'حديث'}</Text>
              </View>
              
              <View style={styles.categoryTag}>
                <Ionicons name={isViolation ? "warning" : "pricetag-outline"} size={14} color={isViolation ? '#E11D48' : COLORS.primary} style={{ marginLeft: 4 }} />
                <Text style={[styles.categoryTagText, isViolation && { color: '#E11D48' }]}>{item.categoryLabel}</Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.citizenName}>👤 {item.citizenName}</Text>
                {item.showOnHome && (
                  <View style={styles.publicTag}>
                    <Ionicons name="eye-outline" size={14} color="#059669" />
                    <Text style={styles.publicTagText}>عام</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listPadding: { padding: SPACING.md, paddingBottom: 40 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderRightWidth: 4, borderRightColor: COLORS.primary },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 11, color: COLORS.textMuted },
  categoryTag: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-end', marginBottom: 8 },
  categoryTagText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 20 },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  citizenName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  publicTag: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, gap: 4 },
  publicTagText: { fontSize: 11, color: '#059669', fontWeight: '700' },
  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' }
});
