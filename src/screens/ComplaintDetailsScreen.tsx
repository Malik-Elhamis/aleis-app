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
import { Complaint } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBadge } from '../components/StatusBadge';

export const ComplaintDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'complaints', complaintId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setComplaint({ id: snap.id, ...snap.data() } as Complaint);
      } else {
        navigation.goBack();
      }
    });
    return () => unsub();
  }, [complaintId]);

  const openLocation = () => {
    if (complaint?.location?.latitude && complaint?.location?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${complaint.location.latitude},${complaint.location.longitude}`;
      import('react-native').then(({ Linking }) => Linking.openURL(url));
    }
  };

  if (!complaint) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <View style={[styles.mainCard, SHADOWS.small]}>
        <View style={styles.cardHeaderRow}>
          <StatusBadge type="complaint" status={complaint.status} customText={complaint.customStatusText} />
          <View style={styles.categoryTag}>
            <Ionicons name="pricetag-outline" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
            <Text style={styles.categoryTagText}>{complaint.categoryLabel}</Text>
          </View>
        </View>

        <Text style={styles.title}>{complaint.title}</Text>
        <Text style={styles.description}>{complaint.description}</Text>

        <TouchableOpacity 
          style={styles.locationRow}
          onPress={openLocation}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />
          <Text style={[styles.locationText, complaint.location?.latitude ? { color: COLORS.primary, textDecorationLine: 'underline' } : {}]}>
            {complaint.location.address || 'موقع غير محدد'}
          </Text>
        </TouchableOpacity>
      </View>

      {complaint.images && complaint.images.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>الصور المرفقة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {complaint.images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedImage(img)} activeOpacity={0.9}>
                <Image source={{ uri: img }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {(complaint.municipalityReply || complaint.adminNote) ? (
        <View style={[styles.replyCard, SHADOWS.small]}>
          <View style={styles.replyHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color="#059669" />
            <Text style={styles.replyTitle}>رد البلدية وقسم الصيانة</Text>
          </View>
          <Text style={styles.replyText}>{complaint.municipalityReply || complaint.adminNote}</Text>
        </View>
      ) : null}

      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          تاريخ البلاغ: {typeof complaint.createdAt === 'string' ? new Date(complaint.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
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
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryTagText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 22, marginBottom: 16 },
  
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  locationText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, textAlign: 'left' },
  
  imagesSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 12, marginRight: 4 },
  image: { width: 280, height: 200, borderRadius: 16, marginLeft: 12, backgroundColor: COLORS.border },
  
  replyCard: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  replyTitle: { fontSize: 16, fontWeight: '800', color: '#059669' },
  replyText: { fontSize: 14, color: '#065F46', textAlign: 'left', lineHeight: 22 },
  
  footerInfo: { alignItems: 'center', marginTop: 10 },
  footerText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  
  fullScreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeModalBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  fullScreenImage: { width: '100%', height: '80%' }
});
