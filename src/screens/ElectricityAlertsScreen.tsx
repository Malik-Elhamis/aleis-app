import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeElectricityAlerts } from '../services/firestoreService';
import { ElectricityAlert } from '../types';

// Modern Electric Palette (Light & Vibrant)
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

export const ElectricityAlertsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [alerts, setAlerts] = useState<ElectricityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeElectricityAlerts((data) => {
      setAlerts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'working': return { label: 'جاري العمل عليها', color: ELECTRIC_COLORS.statusWorking, icon: 'construct' };
      case 'resolved': return { label: 'تم الإصلاح', color: ELECTRIC_COLORS.statusResolved, icon: 'checkmark-circle' };
      case 'investigating': return { label: 'جاري الفحص', color: ELECTRIC_COLORS.statusInvestigating, icon: 'search' };
      default: return { label: 'تنبيه عام', color: ELECTRIC_COLORS.accent, icon: 'information-circle' };
    }
  };

  const renderAlertCard = ({ item }: { item: ElectricityAlert }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ElectricityAlertDetails', { alert: item })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
            <Ionicons name="location" size={16} color={ELECTRIC_COLORS.primary} />
            <Text style={styles.areaText} numberOfLines={2}>{item.area}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} style={{ marginLeft: 4 }} />
            <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        {item.notes ? (
          <Text style={styles.notesText}>{item.notes}</Text>
        ) : null}

        {item.estimatedTime ? (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={ELECTRIC_COLORS.primary} />
            <Text style={styles.timeText}>المدة المتوقعة: {item.estimatedTime}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={32} color={ELECTRIC_COLORS.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>تنبيهات الأعطال</Text>
        <Text style={styles.headerSub}>آخر التحديثات والإشعارات حول شبكة الكهرباء</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ELECTRIC_COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={renderAlertCard}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={60} color={ELECTRIC_COLORS.statusResolved} />
              <Text style={styles.emptyStateText}>لا توجد أعطال حالياً، الشبكة مستقرة.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ELECTRIC_COLORS.background },
  header: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, backgroundColor: ELECTRIC_COLORS.primary, borderBottomWidth: 0 },
  headerIcon: { marginBottom: 8, color: '#FFF' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#E0E7FF', textAlign: 'center' },
  
  listPadding: { padding: 16, paddingBottom: 60 },
  
  card: { backgroundColor: ELECTRIC_COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  areaText: { fontSize: 16, fontWeight: '700', color: ELECTRIC_COLORS.primary, textAlign: 'left', flex: 1, marginLeft: 4 },
  
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '700', marginRight: 4 },
  
  notesText: { fontSize: 14, color: ELECTRIC_COLORS.textSecondary, textAlign: 'left', lineHeight: 22, marginBottom: 12 },
  
  timeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: ELECTRIC_COLORS.primaryLight, padding: 8, borderRadius: 8, gap: 6 },
  timeText: { fontSize: 13, fontWeight: '700', color: ELECTRIC_COLORS.primary },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, color: ELECTRIC_COLORS.textSecondary, marginTop: 12, fontWeight: '700', textAlign: 'center' }
});
