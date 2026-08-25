import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeObituaries } from '../services/firestoreService';
import { Obituary } from '../types';

export const ObituariesScreen: React.FC<any> = ({ navigation }) => {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);

  useEffect(() => {
    const unsub = subscribeObituaries((items) => {
      setObituaries(items);
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="moon" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</Text>
        <Text style={styles.headerSub}>نسأل الله لهم الرحمة والمغفرة</Text>
      </View>

      <FlatList
        data={obituaries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد إعلانات وفيات حالياً</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, SHADOWS.medium]} 
            onPress={() => navigation.navigate('ObituaryDetails', { obituary: item })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.personImage} />
              ) : (
                <View style={styles.iconCircle}>
                  <Ionicons name="person" size={20} color={COLORS.surface} />
                </View>
              )}
              <View style={styles.nameContainer}>
                <Text style={styles.nameLabel}>{item.gender === 'female' ? 'انتقلت إلى رحمة الله تعالى:' : 'انتقل إلى رحمة الله تعالى:'}</Text>
                <Text style={styles.deceasedName}>{item.name}</Text>
              </View>
            </View>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}><Text style={styles.boldLabel}>تاريخ الوفاة:</Text> {item.date}</Text>
              </View>
              {item.details ? (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>الصلاة والدفن:</Text> {item.details}</Text>
                </View>
              ) : null}
              {item.condolencesDetails ? (
                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>مكان العزاء:</Text> {item.condolencesDetails}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#1F2937', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 8, textAlign: 'center', letterSpacing: 1 },
  headerSub: { fontSize: 14, color: '#9CA3AF' },
  
  listPadding: { padding: SPACING.lg, paddingBottom: 100 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderTopWidth: 4, borderTopColor: '#1F2937' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  personImage: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D1D5DB' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  nameContainer: { flex: 1, alignItems: 'flex-start' },
  nameLabel: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'left', marginBottom: 4 },
  deceasedName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left' },
  
  detailsBox: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailText: { fontSize: 14, color: COLORS.textPrimary, textAlign: 'left', flex: 1, lineHeight: 22 },
  boldLabel: { fontWeight: '700', color: COLORS.textPrimary },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
