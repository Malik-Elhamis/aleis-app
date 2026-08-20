import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { Violation } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBadge } from '../components/StatusBadge';

export const ViolationDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { violationId } = route.params;
  const [violation, setViolation] = useState<Violation | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'violations', violationId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setViolation({ id: snap.id, ...snap.data() } as Violation);
      } else {
        navigation.goBack();
      }
    });
    return () => unsub();
  }, [violationId]);

  const openLocation = () => {
    if (violation?.location?.latitude && violation?.location?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${violation.location.latitude},${violation.location.longitude}`;
      import('react-native').then(({ Linking }) => Linking.openURL(url));
    }
  };

  if (!violation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.danger} />
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={[styles.mainCard, SHADOWS.small]}>
        <View style={styles.cardHeaderRow}>
          <StatusBadge type="complaint" status={violation.status} customText={violation.customStatusText} />
          <View style={styles.categoryTag}>
            <Ionicons name="warning-outline" size={14} color={COLORS.danger} style={{ marginLeft: 4 }} />
            <Text style={styles.categoryTagText}>{violation.categoryLabel}</Text>
          </View>
        </View>

        <Text style={styles.title}>{violation.title}</Text>
        <Text style={styles.description}>{violation.description}</Text>

        <TouchableOpacity
          style={styles.locationRow}
          onPress={openLocation}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />
          <Text style={[styles.locationText, violation.location?.latitude ? { color: COLORS.danger, textDecorationLine: 'underline' } : {}]}>
            {violation.location.address || 'موقع غير محدد'}
          </Text>
        </TouchableOpacity>
      </View>

      {violation.images && violation.images.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>الصور المرفقة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {violation.images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedImage(img)} activeOpacity={0.9}>
                <Image source={{ uri: img }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {(violation.municipalityReply || violation.adminNote) ? (
        <View style={[styles.replyCard, SHADOWS.small]}>
          <View style={styles.replyHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color="#991B1B" />
            <Text style={styles.replyTitle}>رد البلدية والرقابة</Text>
          </View>
          <Text style={styles.replyText}>{violation.municipalityReply || violation.adminNote}</Text>
        </View>
      ) : null}

      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          تاريخ الإبلاغ: {typeof violation.createdAt === 'string' ? new Date(violation.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
        </Text>
      </View>

    </ScrollView>

    <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
      <SafeAreaView style={styles.fullScreenModal}>
        <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedImage(null)}>
          <Ionicons name="close" size={32} color="#FFF" />
        </TouchableOpacity>
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
        )}
      </SafeAreaView>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: SPACING.md, paddingBottom: 40 },

  mainCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  cardHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryTag: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#FFE4E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryTagText: { fontSize: 12, color: COLORS.danger, fontWeight: '700' },

  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 16 },

  locationRow: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  locationText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, textAlign: 'right' },

  imagesSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12, marginRight: 4 },
  image: { width: 280, height: 200, borderRadius: 16, marginLeft: 12, backgroundColor: COLORS.border },

  replyCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FEE2E2' },
  replyHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8, gap: 8 },
  replyTitle: { fontSize: 16, fontWeight: '800', color: '#991B1B' },
  replyText: { fontSize: 14, color: '#7F1D1D', textAlign: 'right', lineHeight: 22 },

  footerInfo: { alignItems: 'center', marginTop: 10 },
  footerText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },

  fullScreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeModalBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  fullScreenImage: { width: '100%', height: '80%' }
});
