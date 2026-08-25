import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MunicipalProject } from '../types';

type ParamList = {
  SuggestionDetails: { suggestionId: string };
};

export const SuggestionDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'SuggestionDetails'>>();
  const { suggestionId } = route.params;

  const [suggestion, setSuggestion] = useState<MunicipalProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSuggestion();
  }, [suggestionId]);

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
              المقدم: {suggestion.authorName ? suggestion.authorName : 'فاعل خير'}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12, fontWeight: '600' },
  
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  
  headerArea: { alignItems: 'center', marginBottom: 20 },
  headerIcon: { marginBottom: 12 },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 10, lineHeight: 28 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#9333EA', textAlign: 'left', marginBottom: 8 },
  description: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 26 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  infoText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
});
