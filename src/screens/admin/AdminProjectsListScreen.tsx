import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { MunicipalProject } from '../../types';
import { subscribeProjects } from '../../services/firestoreService';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

type ParamList = {
  AdminProjectsList: {
    status: 'completed' | 'in_progress' | 'planned';
    title: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminProjectsListScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'AdminProjectsList'>>();
  const navigation = useNavigation<NavigationProp>();
  const { status, title } = route.params;

  const [projects, setProjects] = useState<MunicipalProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeProjects((items) => {
      const filtered = items.filter(p => p.status === status);
      setProjects(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [status]);

  const handleDelete = (item: MunicipalProject) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا المشروع نهائياً؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'projects', item.id));
            } catch (error) {
              Alert.alert('خطأ', 'حدثت مشكلة أثناء الحذف.');
            }
          }
        }
      ]
    );
  };

  const openDetails = (item: MunicipalProject) => {
    navigation.navigate('AdminProjectDetails', { projectId: item.id });
  };

  const openEdit = (item: MunicipalProject) => {
    navigation.navigate('AdminProjectForm', { projectId: item.id });
  };

  const openNew = () => {
    navigation.navigate('AdminProjectForm', {});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا يوجد مشاريع مسجلة في هذا القسم حالياً</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <TouchableOpacity 
              onPress={() => openDetails(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>

            {item.status === 'in_progress' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>نسبة الإنجاز</Text>
                  <Text style={styles.progressValue}>{item.progressPercentage}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.progressPercentage}%` }]} />
                </View>
              </View>
            )}
            </TouchableOpacity>

            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>📅 {item.startDate}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                  <Text style={styles.deleteText}>حذف <Ionicons name="trash-outline" size={14} /></Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Text style={styles.editText}>تعديل <Ionicons name="create-outline" size={14} /></Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]} 
        onPress={openNew}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8 },
  categoryText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12 },
  
  progressContainer: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary },
  progressValue: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },

  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8 },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  actionRow: { flexDirection: 'row-reverse', gap: 16 },
  actionBtn: { paddingVertical: 4 },
  editText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  deleteText: { fontSize: 13, color: '#DC2626', fontWeight: '700' },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },

  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
