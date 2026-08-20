import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../config/theme';
import { ElectricityFault } from '../../types';
import { updateElectricityFaultStatus } from '../../services/firestoreService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const AdminElectricityFaultDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { faultId } = route.params;
  const [fault, setFault] = useState<ElectricityFault | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'electricity_faults', faultId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as ElectricityFault;
        setFault(data);
        setStatus(data.status);
      } else {
        Alert.alert('خطأ', 'هذا البلاغ لم يعد موجوداً');
        navigation.goBack();
      }
    });
    return () => unsub();
  }, [faultId]);

  const handleSave = async () => {
    if (!fault?.id) return;
    setSaving(true);
    try {
      await updateElectricityFaultStatus(fault.id, status);
      Alert.alert('نجاح', 'تم تحديث حالة العطل بنجاح');
      navigation.goBack();
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    if (type.startsWith('أخرى:')) return type;
    switch(type) {
      case 'outage': return 'انقطاع تيار';
      case 'street_light': return 'إنارة شوارع';
      case 'theft': return 'سرقة كهرباء';
      case 'other': return 'أخرى';
      default: return type || 'عطل كهربائي';
    }
  };

  const StatusOption = ({ value, label }: { value: string, label: string }) => (
    <TouchableOpacity 
      style={[styles.statusOption, status === value && styles.statusOptionActive]}
      onPress={() => setStatus(value)}
    >
      <Text style={[styles.statusOptionText, status === value && styles.statusOptionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  if (!fault) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{getTypeLabel(fault.type)}</Text>
          <Text style={styles.infoDesc}>{fault.description}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>العنوان:</Text>
            <Text style={styles.infoValue}>{fault.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>المرسل:</Text>
            <Text style={styles.infoValue}>{fault.userId === 'anonymous' ? 'مجهول' : 'مستخدم مسجل'}</Text>
          </View>
        </View>

        {fault.images && fault.images.length > 0 && (
          <View style={styles.imagesScroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {fault.images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedImage(img)} activeOpacity={0.9}>
                  <Image source={{ uri: img }} style={styles.complaintImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>تحديث الحالة</Text>
        <View style={styles.statusGrid}>
          <StatusOption value="pending" label="قيد الانتظار" />
          <StatusOption value="in_progress" label="جاري العمل" />
          <StatusOption value="completed" label="تم الإصلاح" />
          <StatusOption value="unrepairable" label="لا يمكن الإصلاح" />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
    
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
  content: { padding: SPACING.lg, paddingBottom: 60 },
  
  infoBox: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, marginBottom: 20 },
  infoTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  infoDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 16 },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'flex-start', marginBottom: 6 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 8, width: 60, textAlign: 'right' },
  infoValue: { fontSize: 13, color: COLORS.textSecondary, flex: 1, textAlign: 'right' },
  
  imagesScroll: { marginBottom: 20, flexDirection: 'row-reverse' },
  complaintImage: { width: 280, height: 200, borderRadius: 12, marginLeft: 12, backgroundColor: COLORS.border },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12, marginTop: 16 },
  statusGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  statusOption: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF' },
  statusOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusOptionText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  statusOptionTextActive: { color: '#FFF' },
  
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  fullScreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeModalBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  fullScreenImage: { width: '100%', height: '80%' }
});
