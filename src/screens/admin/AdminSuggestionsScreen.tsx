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
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { MunicipalProject } from '../../types';
import { subscribeProjects } from '../../services/firestoreService';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const AdminSuggestionsScreen: React.FC<any> = ({ navigation }) => {
  const [suggestions, setSuggestions] = useState<MunicipalProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeProjects((items) => {
      // Filter ONLY suggestions
      const suggestedProjects = items.filter(p => p.status === 'suggested');
      setSuggestions(suggestedProjects);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openDetails = (item: MunicipalProject) => {
    navigation.navigate('AdminSuggestionDetails', { suggestionId: item.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد اقتراحات حالياً</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, SHADOWS.small]} 
            activeOpacity={0.8}
            onPress={() => openDetails(item)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: item.isApproved ? '#D1FAE5' : '#F3E8FF' }]}>
                <Text style={[styles.statusText, { color: item.isApproved ? '#059669' : '#9333EA' }]}>
                  {item.isApproved ? 'منشور (معتمد)' : 'مقترح جديد (معلق)'}
                </Text>
              </View>
              <Text style={styles.categoryText}>{item.category || 'اقتراح مواطن'}</Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>📅 {typeof item.createdAt === 'string' ? new Date(item.createdAt).toLocaleDateString('ar-EG') : 'حديث'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { padding: SPACING.md, paddingBottom: 40 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E9D5FF', borderRightWidth: 4, borderRightColor: '#9333EA' },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  categoryText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 16 },

  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  dateText: { fontSize: 12, color: COLORS.textMuted },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
