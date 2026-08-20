import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeElectricityAlerts, deleteElectricityAlert } from '../../services/firestoreService';
import { ElectricityAlert } from '../../types';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminElectricityAlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<ElectricityAlert[]>([]);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsub = subscribeElectricityAlerts((data) => {
      setAlerts(data);
    });
    return () => unsub();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التنبيه؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteElectricityAlert(id) }
    ]);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working': return 'جاري العمل عليها';
      case 'resolved': return 'تم الإصلاح';
      case 'investigating': return 'جاري الفحص';
      default: return 'تنبيه';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AdminElectricityAlertForm' as any)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.fabText}>إضافة تنبيه جديد</Text>
      </TouchableOpacity>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.areaText}>{item.area}</Text>
            </View>
            
            <Text style={styles.notesText}>{item.notes}</Text>
            <Text style={styles.timeText}>الوقت المتوقع: {item.estimatedTime}</Text>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.editBtn}
                onPress={() => navigation.navigate('AdminElectricityAlertForm' as any, { alert: item })}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                <Text style={styles.editBtnText}>تعديل</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد تنبيهات حالياً</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  fab: { flexDirection: 'row-reverse', backgroundColor: COLORS.primary, margin: SPACING.md, padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#FFF', fontSize: 16, fontWeight: '800', marginRight: 8 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  areaText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  badge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '700' },
  
  notesText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  timeText: { fontSize: 13, color: '#F59E0B', textAlign: 'right', fontWeight: '600' },
  
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  editBtnText: { color: COLORS.primary, marginLeft: 4, fontWeight: '700' },
  deleteBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 }
});
