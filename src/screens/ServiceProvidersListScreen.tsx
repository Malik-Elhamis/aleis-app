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
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeServiceProvidersByCategory } from '../services/firestoreService';
import { ServiceProvider } from '../types';

export const ServiceProvidersListScreen: React.FC<any> = ({ route, navigation }) => {
  const { categoryTitle } = route.params;
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: categoryTitle });
    const unsub = subscribeServiceProvidersByCategory(categoryTitle, (items) => {
      setProviders(items);
      setLoading(false);
    });
    return () => unsub();
  }, [categoryTitle]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-circle" size={56} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <Text style={styles.headerSub}>مقدمي الخدمات المعتمدين والمتاحين</Text>
      </View>

      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>لم يتم تسجيل مقدمي خدمات في هذا القسم بعد.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.descText} numberOfLines={3}>{item.description}</Text>
                ) : null}
              </View>
              <View style={styles.iconWrapper}>
                <Ionicons name="person" size={32} color={COLORS.primary} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.phoneDisplay}>
                <Ionicons name="call" size={20} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
                <Text style={styles.phoneDisplayNum} selectable>{item.phone}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#EA580C', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' }, 
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 14, color: '#FFEDD5' },
  
  listPadding: { padding: SPACING.lg, paddingBottom: 100 },
  
  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },

  card: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row-reverse', padding: 20 },
  cardInfo: { flex: 1, marginRight: 16, alignItems: 'flex-end', justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6, textAlign: 'right' },
  descText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22 },
  
  iconWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },

  cardFooter: { flexDirection: 'row-reverse', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16, backgroundColor: '#F8FAFC' },
  phoneDisplay: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center' },
  phoneDisplayNum: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 1 },
});
