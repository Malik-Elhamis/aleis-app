import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Image,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { subscribeCleanlinessRequests, updateCleanlinessStatus, deleteCleanlinessRequest } from '../../services/firestoreService';

export const AdminCleanlinessScreen: React.FC<any> = ({ navigation }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCleanlinessRequests((items) => {
      setRequests(items);
    });
    return () => unsub();
  }, []);

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'container': return 'طلب حاوية';
      case 'hygiene': return 'تراكم نفايات';
      case 'pest_control': return 'مكافحة حشرات';
      default: return 'طلب نظافة';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.primary;
      default: return COLORS.warning;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      default: return 'قيد الانتظار';
    }
  };

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    Alert.alert('تحديث الحالة', 'اختر الحالة الجديدة:', [
      { text: 'قيد الانتظار', onPress: () => updateCleanlinessStatus(id, 'pending') },
      { text: 'قيد التنفيذ', onPress: () => updateCleanlinessStatus(id, 'in_progress') },
      { text: 'مكتمل', onPress: () => updateCleanlinessStatus(id, 'completed') },
      { text: 'إلغاء', style: 'cancel' }
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا الطلب؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteCleanlinessRequest(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerControls}>
        <TouchableOpacity 
          style={styles.feesBtn} 
          onPress={() => navigation.navigate('AdminCleaningFees')}
        >
          <Ionicons name="pricetags-outline" size={20} color="#FFF" />
          <Text style={styles.feesBtnText}>إدارة رسوم النظافة</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد طلبات نظافة حالياً</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
            </View>

            <Text style={styles.locationText}><Ionicons name="location" size={14} /> {item.location}</Text>
            <Text style={styles.descText}>{item.description}</Text>
            
            <Text style={styles.dateText}>التاريخ: {new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>

            {item.images && item.images.length > 0 && (
              <View style={styles.imageGallery}>
                {item.images.map((img: string, idx: number) => (
                  <TouchableOpacity key={idx} onPress={() => setSelectedImage(img)}>
                    <Image source={{ uri: img }} style={styles.thumbnail} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.statusBtn} onPress={() => handleUpdateStatus(item.id, item.status)}>
                <Text style={styles.statusBtnText}>تحديث الحالة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerControls: { padding: SPACING.md, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  feesBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12 },
  feesBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  listPadding: { padding: SPACING.md, paddingBottom: 40 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  locationText: { fontSize: 14, color: COLORS.primary, fontWeight: '700', marginBottom: 6, textAlign: 'right' },
  descText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8, lineHeight: 22 },
  dateText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginBottom: 12 },
  
  imageGallery: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  statusBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  statusBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 },
  deleteBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: '100%', height: '80%' },

  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
});
