import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeHumanitarian } from '../services/firestoreService';
import { HumanitarianCase } from '../types';
import { CustomButton } from '../components/CustomButton';

export const HumanitarianListScreen: React.FC<any> = ({ route, navigation }) => {
  const [cases, setCases] = useState<HumanitarianCase[]>([]);
  const { status } = route.params || { status: 'active' };

  useEffect(() => {
    const unsub = subscribeHumanitarian((items) => {
      setCases(items);
    });
    return () => unsub();
  }, []);

  const handleCardPress = (item: HumanitarianCase) => {
    navigation.navigate('HumanitarianDetails', { caseItem: item });
  };

  const filteredCases = cases.filter(c => c.status === status);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-half-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد حالات مسجلة حالياً</Text>
          </View>
        }
        renderItem={({ item }) => {
          const target = parseFloat(item.targetAmount || '0');
          const collected = parseFloat(item.collectedAmount || '0');
          const progress = target > 0 ? (collected / target) * 100 : 0;
          
          const getCurrencyLabel = (cur?: string) => {
            switch(cur) {
              case 'USD': return '$';
              case 'TRY': return 'ل.ت';
              case 'SYP':
              default: return 'ل.س';
            }
          };
          const currencyLabel = getCurrencyLabel(item.currency);

          return (
            <TouchableOpacity 
              style={[styles.card, SHADOWS.medium]}
              activeOpacity={0.8}
              onPress={() => handleCardPress(item)}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200?text=حالة+إنسانية' }} 
                  style={styles.cardImg} 
                  resizeMode="contain"
                />
                {item.isUrgent && item.status !== 'completed' && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>عاجل</Text>
                  </View>
                )}
              </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  
                  {item.status === 'completed' ? (
                    <View style={styles.completedCardSection}>
                      <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
                      <Text style={styles.completedCardText}>اكتملت ولله الحمد</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                      {/* Only show target stats and progress if targetAmount is provided */}
                      {item.targetAmount ? (
                        <>
                          <View style={styles.statsContainer}>
                            <View style={styles.statBox}>
                              <Text style={styles.statLabel}>المطلوب</Text>
                              <Text style={styles.statValue}>{item.targetAmount} <Text style={{fontSize: 12}}>{currencyLabel}</Text></Text>
                            </View>
                            <View style={styles.statBox}>
                              <Text style={styles.statLabel}>تم جمعه</Text>
                              <Text style={[styles.statValue, { color: COLORS.primary }]}>{item.collectedAmount || '0'} <Text style={{fontSize: 12}}>{currencyLabel}</Text></Text>
                            </View>
                          </View>

                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
                          </View>
                          <Text style={styles.progressText}>{Math.round(progress)}% اكتمل</Text>
                        </>
                      ) : null}

                      <View style={styles.detailsBtn}>
                        <Text style={styles.detailsBtnText}>عرض التفاصيل والتبرع</Text>
                        <Ionicons name="chevron-back" size={16} color={COLORS.primary} />
                      </View>
                    </>
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
  header: { backgroundColor: '#DB2777', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20, alignItems: 'center' }, // Pink
  headerIcon: { marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4, textAlign: 'center' },
  headerSub: { fontSize: 14, color: '#FCE7F3', textAlign: 'center' },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', padding: 8, marginHorizontal: 16, marginTop: 16, borderRadius: 12, ...SHADOWS.small },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#DB2777' },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },

  listPadding: { padding: SPACING.md, paddingBottom: 100 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  imageContainer: { position: 'relative', backgroundColor: '#000' },
  cardImg: { width: '100%', height: 180 },
  urgentBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.danger, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  urgentText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  completedBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  completedText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 16 },
  
  statsContainer: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 12 },
  
  detailsBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  detailsBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
  
  completedCardSection: { alignItems: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  completedCardText: { fontSize: 18, fontWeight: '800', color: '#065F46', marginTop: 8 },
  
  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' }
});
