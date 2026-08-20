import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MunicipalProject } from '../../types';

type ParamList = {
  AdminSuggestionDetails: { suggestionId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminSuggestionDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'AdminSuggestionDetails'>>();
  const navigation = useNavigation<NavigationProp>();
  const { suggestionId } = route.params;

  const [suggestion, setSuggestion] = useState<MunicipalProject | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSuggestion = async () => {
    try {
      const docRef = doc(db, 'projects', suggestionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSuggestion({ id: docSnap.id, ...docSnap.data() } as MunicipalProject);
      }
    } catch (error) {
      console.error("Error fetching suggestion details: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, [suggestionId]);

  const handleUpdateStatus = async (approve: boolean) => {
    if (!suggestion) return;
    Alert.alert(
      'تأكيد الإجراء',
      approve ? 'هل أنت متأكد من نشر هذا المقترح للعامة؟' : 'هل أنت متأكد من تعليق (إخفاء) هذا المقترح؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'نعم', 
          onPress: async () => {
            try {
              const docRef = doc(db, 'projects', suggestion.id);
              await updateDoc(docRef, { isApproved: approve });
              // Re-fetch to update UI locally
              fetchSuggestion();
              Alert.alert('نجاح', approve ? 'تم النشر بنجاح.' : 'تم التعليق بنجاح.');
            } catch (error) {
              Alert.alert('خطأ', 'حدثت مشكلة أثناء تحديث حالة المقترح.');
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    if (!suggestion) return;
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا المقترح نهائياً؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'projects', suggestion.id));
              Alert.alert('نجاح', 'تم حذف المقترح.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('خطأ', 'حدثت مشكلة أثناء الحذف.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!suggestion) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.errorText}>لم يتم العثور على المقترح.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerArea}>
          <Ionicons name="bulb" size={64} color="#9333EA" style={styles.headerIcon} />
          <View style={[styles.statusBadge, { backgroundColor: suggestion.isApproved ? '#D1FAE5' : '#FEF3C7' }]}>
            <Text style={[styles.statusText, { color: suggestion.isApproved ? '#059669' : '#D97706' }]}>
              الحالة: {suggestion.isApproved ? 'منشور للعامة (معتمد)' : 'جديد (معلق)'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, SHADOWS.medium]}>
          <Text style={styles.title}>{suggestion.title}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>نص المقترح:</Text>
          <Text style={styles.description}>{suggestion.description}</Text>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              المقدم: {suggestion.authorName ? suggestion.authorName : 'فاعل خير (مجهول)'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              التاريخ: {typeof suggestion.createdAt === 'string' ? new Date(suggestion.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.actionsContainer, SHADOWS.medium]}>
        {suggestion.isApproved ? (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.suspendBtn]} 
            onPress={() => handleUpdateStatus(false)}
          >
            <Ionicons name="pause" size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>تعليق المقترح وإخفاؤه</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]} 
            onPress={() => handleUpdateStatus(true)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>اعتماد ونشر المقترح</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]} 
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>رفض وحذف المقترح</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12, fontWeight: '600' },
  
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 },
  
  headerArea: { alignItems: 'center', marginBottom: 20 },
  headerIcon: { marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '800' },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 10, lineHeight: 28 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#9333EA', textAlign: 'right', marginBottom: 8 },
  description: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 26 },
  
  infoRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 12, gap: 10 },
  infoText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },

  actionsContainer: { 
    position: 'absolute', 
    bottom: 0, left: 0, right: 0, 
    backgroundColor: '#FFF', 
    padding: SPACING.lg, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    gap: 12
  },
  actionBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  approveBtn: { backgroundColor: '#10B981' },
  suspendBtn: { backgroundColor: '#F59E0B' },
  deleteBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' }
});
