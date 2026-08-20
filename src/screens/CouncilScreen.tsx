import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeCouncil } from '../services/firestoreService';
import { CouncilMember } from '../types';

export const CouncilScreen: React.FC<any> = ({ navigation }) => {
  const [members, setMembers] = useState<CouncilMember[]>([]);

  useEffect(() => {
    const unsub = subscribeCouncil((items) => {
      setMembers(items);
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={48} color="#FFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>أعضاء مجلس البلدية</Text>
        <Text style={styles.headerSub}>في خدمة المواطن والمجتمع</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>جاري تحديث قائمة الأعضاء...</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, SHADOWS.medium]}
            onPress={() => navigation.navigate('CouncilMemberDetails', { member: item })}
            activeOpacity={0.9}
          >
            {/* Image on the Left (1st) */}
            <Image 
              source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
              style={styles.memberImage} 
            />

            {/* Text on the Right (2nd) */}
            <View style={styles.cardContent}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.roleTag}>{item.role}</Text>
              {item.bio ? <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#047857', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' }, // Dark Green for Council
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  headerSub: { fontSize: 14, color: '#D1FAE5' },
  
  listPadding: { padding: SPACING.lg, paddingBottom: 100 },
  
  card: { 
    backgroundColor: COLORS.surface, 
    borderRadius: 16, 
    marginBottom: 16, 
    flexDirection: 'row', // Native RTL handles the flip automatically
    alignItems: 'center',
    padding: 12,
  },
  cardContent: { flex: 1, paddingRight: 16, justifyContent: 'center', alignItems: 'flex-end' },
  memberImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#047857' },
  
  roleTag: { alignSelf: 'flex-end', backgroundColor: '#D1FAE5', color: '#047857', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  memberName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 6 },
  bioText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 20 },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
