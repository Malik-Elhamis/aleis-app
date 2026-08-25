import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeAboutUsSettings } from '../services/firestoreService';

export const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [programmerName, setProgrammerName] = useState('جاري التحميل...');
  const [programmerImage, setProgrammerImage] = useState('');
  const [programmerText, setProgrammerText] = useState('جاري التحميل...');
  
  const [managementName, setManagementName] = useState('جاري التحميل...');
  const [managementImage, setManagementImage] = useState('');
  const [managementText, setManagementText] = useState('جاري التحميل...');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAboutUsSettings((data) => {
      setProgrammerName(data?.programmerName || 'المبرمج والمطور');
      setProgrammerImage(data?.programmerImage || '');
      setProgrammerText(data?.programmerText || 'لم تتم إضافة معلومات المبرمج بعد.');
      
      setManagementName(data?.managementName || 'إدارة التطبيق');
      setManagementImage(data?.managementImage || '');
      setManagementText(data?.managementText || 'لم تتم إضافة معلومات إدارة التطبيق بعد.');
      
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1542104470-36a536b04a08?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.headerImage} 
          />
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Ionicons name="information-circle" size={48} color="#FFF" />
            <Text style={styles.headerTitle}>عن بلدية العيس</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.section, SHADOWS.small]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="code-slash" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>المبرمج والمطور</Text>
            </View>
            <View style={styles.profileContainer}>
              {programmerImage ? (
                <Image source={{ uri: programmerImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.surface} />
                </View>
              )}
              <Text style={styles.profileName}>{programmerName}</Text>
            </View>
            <Text style={styles.sectionText}>
              {programmerText}
            </Text>
          </View>

          <View style={[styles.section, SHADOWS.small]}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onLongPress={() => navigation.navigate('AdminLogin' as never)}
              delayLongPress={2000}
              style={styles.sectionHeader}
            >
              <Ionicons name="settings" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>إدارة التطبيق</Text>
            </TouchableOpacity>
            <View style={styles.profileContainer}>
              {managementImage ? (
                <Image source={{ uri: managementImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="business" size={40} color={COLORS.surface} />
                </View>
              )}
              <Text style={styles.profileName}>{managementName}</Text>
            </View>
            <Text style={styles.sectionText}>
              {managementText}
            </Text>
          </View>
          
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>© 2026 جميع الحقوق محفوظة لبلدية العيس</Text>
            <Text style={styles.footerSubText}>تطبيق العيس الذكي - الإصدار 1.0</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  
  headerImageContainer: { height: 250, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  headerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31, 41, 55, 0.7)' },
  headerContent: { alignItems: 'center', zIndex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginTop: 8 },

  body: { padding: SPACING.lg, marginTop: -20 },
  
  section: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, textAlign: 'left' },
  sectionText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 24 },

  profileContainer: { alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  profileImage: { width: 260, height: 260, borderRadius: 130, borderWidth: 5, borderColor: COLORS.primaryLight, marginBottom: 12 },
  profilePlaceholder: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  profileName: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center' },

  bulletPoint: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  bulletText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, textAlign: 'left', lineHeight: 22 },
  
  footerInfo: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  footerSubText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 }
});
