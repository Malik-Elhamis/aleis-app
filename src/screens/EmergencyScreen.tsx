import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Linking,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeEmergencyContacts } from '../services/firestoreService';
import { EmergencyContact } from '../types';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const EmergencyScreen: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeEmergencyContacts((data) => {
      setContacts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCallPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.danger} style={{ marginLeft: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>دليل الطوارئ المباشر 📞</Text>
          <Text style={styles.headerSub}>اتصال بنقرة واحدة بالجهات الأمنية والطبية وفرق الإنقاذ</Text>
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: EmergencyContact }) => (
          <TouchableOpacity
            style={[styles.emergencyCard, SHADOWS.medium]}
            onPress={() => handleCallPhone(item.phoneNumber)}
            activeOpacity={0.85}
          >
            {item.image ? (
              <View style={styles.logoWrapper}>
                <Image source={{ uri: item.image }} style={styles.logoImage} />
              </View>
            ) : (
              <View style={[styles.badgeIcon, { backgroundColor: item.badgeColor }]}>
                <Ionicons name={item.icon as any} size={28} color="#FFFFFF" />
              </View>
            )}

            <View style={styles.detailsBox}>
              <Text style={styles.contactTitle}>{item.title}</Text>
              <Text style={styles.contactSub}>{item.subtitle}</Text>
              <Text style={styles.phoneNum}>رقم الهاتف: {item.phoneNumber}</Text>
            </View>

            <View style={styles.dialBtn}>
              <Ionicons name="call" size={20} color="#FFFFFF" style={{ marginLeft: 4 }} />
              <Text style={styles.dialText}>اتصال</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  listPadding: {
    padding: SPACING.md,
  },
  emergencyCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginLeft: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  detailsBox: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  contactSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  phoneNum: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 4,
  },
  dialBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dialText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
