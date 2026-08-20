import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  ActivityIndicator,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../config/theme';
import { Complaint, ComplaintStatus } from '../../types';
import { updateComplaintAdmin } from '../../services/firestoreService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const AdminComplaintDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Edit Form State
  const [status, setStatus] = useState<ComplaintStatus>('pending');
  const [customStatusText, setCustomStatusText] = useState('');
  const [municipalityReply, setMunicipalityReply] = useState('');
  const [showOnHome, setShowOnHome] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'complaints', complaintId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Complaint;
        setComplaint(data);
        setStatus(data.status);
        setCustomStatusText(data.customStatusText || '');
        setMunicipalityReply(data.municipalityReply || '');
        setShowOnHome(data.showOnHome || false);
      } else {
        Alert.alert('خطأ', 'هذا البلاغ لم يعد موجوداً');
        navigation.goBack();
      }
    });
    return () => unsub();
  }, [complaintId]);

  const handleSave = async () => {
    if (!complaint?.id) return;
    if (status === 'other' && !customStatusText.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة الحالة المخصصة');
      return;
    }
    setSaving(true);
    try {
      await updateComplaintAdmin(complaint.id, {
        status,
        customStatusText: status === 'other' ? customStatusText : '',
        municipalityReply,
        showOnHome
      });
      Alert.alert('نجاح', 'تم تحديث البلاغ بنجاح');
      navigation.goBack();
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const openLocation = () => {
    if (complaint?.location?.latitude && complaint?.location?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${complaint.location.latitude},${complaint.location.longitude}`;
      import('react-native').then(({ Linking }) => Linking.openURL(url));
    }
  };

  const StatusOption = ({ value, label }: { value: ComplaintStatus, label: string }) => (
    <TouchableOpacity 
      style={[styles.statusOption, status === value && styles.statusOptionActive]}
      onPress={() => setStatus(value)}
    >
      <Text style={[styles.statusOptionText, status === value && styles.statusOptionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  if (!complaint) {
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
          <Text style={styles.infoTitle}>{complaint.title}</Text>
          <Text style={styles.infoDesc}>{complaint.description}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>القسم:</Text>
            <Text style={styles.infoValue}>{complaint.categoryLabel}</Text>
          </View>
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={openLocation}
            activeOpacity={0.7}
          >
            <Text style={styles.infoLabel}>العنوان:</Text>
            <Text style={[styles.infoValue, complaint.location?.latitude ? { color: COLORS.primary, textDecorationLine: 'underline' } : {}]}>
              {complaint.location.address || 'غير محدد'}
            </Text>
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>المواطن:</Text>
            <Text style={styles.infoValue}>{complaint.citizenName} ({complaint.citizenPhone})</Text>
          </View>
        </View>

        {complaint.images && complaint.images.length > 0 && (
          <View style={styles.imagesScroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {complaint.images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedImage(img)} activeOpacity={0.9}>
                  <Image source={{ uri: img }} style={styles.complaintImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>تحديث الحالة</Text>
        <View style={styles.statusGrid}>
          <StatusOption value="pending" label="قيد الدراسة" />
          <StatusOption value="under_review" label="قيد المراجعة" />
          <StatusOption value="in_progress" label="قيد التنفيذ" />
          <StatusOption value="resolved" label="تم الحل" />
          <StatusOption value="rejected" label="مرفوض" />
          <StatusOption value="other" label="أخرى..." />
        </View>

        {status === 'other' && (
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            value={customStatusText}
            onChangeText={setCustomStatusText}
            placeholder="اكتب الحالة المخصصة هنا..."
            textAlign="right"
          />
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>رد البلدية / قسم الصيانة</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={municipalityReply}
          onChangeText={setMunicipalityReply}
          placeholder="اكتب رد البلدية الذي سيظهر للمواطن..."
          textAlign="right"
          multiline
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>عرض في الصفحة الرئيسية (للعامة)</Text>
            <Text style={styles.switchSub}>سيتمكن جميع المستخدمين من رؤية البلاغ والرد</Text>
          </View>
          <Switch
            value={showOnHome}
            onValueChange={setShowOnHome}
            trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
            thumbColor={showOnHome ? COLORS.primary : '#F8FAFC'}
          />
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
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12 },
  statusGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  statusOption: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF' },
  statusOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusOptionText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  statusOptionTextActive: { color: '#FFF' },
  
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, fontSize: 14, color: COLORS.textPrimary },
  textArea: { height: 120, textAlignVertical: 'top' },
  
  switchRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginTop: 24, marginBottom: 24 },
  switchTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right' },
  switchSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  fullScreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeModalBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  fullScreenImage: { width: '100%', height: '80%' }
});
