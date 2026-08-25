import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, ActivityIndicator, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DonationMethodDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { method } = route.params;
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('تم النسخ', 'تم نسخ النص إلى الحافظة');
  };

  const saveImageToGallery = async (uri: string) => {
    try {
      setIsSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'نحتاج إلى صلاحية الوصول للصور لحفظ الصورة.');
        setIsSaving(false);
        return;
      }

      let fileUri = uri;
      if (uri.startsWith('http')) {
        const fileExt = uri.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `donation_method_${Date.now()}.${fileExt}`;
        const downloadDest = `${(FileSystem as any).documentDirectory}${fileName}`;
        
        const { uri: localUri } = await FileSystem.downloadAsync(uri, downloadDest);
        fileUri = localUri;
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('نجاح', 'تم حفظ الصورة في الاستوديو بنجاح!');
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل حفظ الصورة.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{method.title}</Text>
          {method.description ? (
            <Text style={styles.cardDesc}>{method.description}</Text>
          ) : null}

          {method.bankAccountDetails ? (
            <View style={styles.accountBox}>
              <Text style={styles.bankName}>رقم الحساب / الآيبان:</Text>
              <TouchableOpacity onPress={() => handleCopy(method.bankAccountDetails!)} style={styles.copyRow}>
                <Text style={styles.iban}>{method.bankAccountDetails}</Text>
                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {method.phoneNumber ? (
            <View style={styles.accountBox}>
              <Text style={styles.bankName}>رقم التواصل:</Text>
              <TouchableOpacity onPress={() => handleCopy(method.phoneNumber!)} style={styles.copyRow}>
                <Text style={styles.iban}>{method.phoneNumber}</Text>
                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {method.contactPerson ? (
            <Text style={styles.contactName}>للتواصل: <Text style={{fontWeight: '800'}}>{method.contactPerson}</Text></Text>
          ) : null}

          {method.images && method.images.length > 0 ? (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.subLabel}>صور طريقة الدفع:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
                {method.images.map((uri: string, idx: number) => (
                  <TouchableOpacity key={idx} onPress={() => setFullScreenImage(uri)} style={styles.sliderImageWrapper}>
                    <Image source={{ uri }} style={styles.donationImage} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {method.images.length > 1 && (
                <Text style={styles.sliderHint}>اسحب لرؤية المزيد ({method.images.length} صور)</Text>
              )}
            </View>
          ) : null}
        </View>
        
      </ScrollView>

      {/* Full Screen Modal */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.fullScreenModalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.saveModalBtn} onPress={() => fullScreenImage && saveImageToGallery(fullScreenImage)} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={24} color="#FFF" />
                  <Text style={styles.saveModalBtnText}>حفظ الصورة</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFullScreenImage(null)}>
              <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
          </View>
          {fullScreenImage && (
            <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImg} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, ...SHADOWS.medium },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 16 },
  cardDesc: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'left', lineHeight: 26, marginBottom: 24 },
  
  accountBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, alignItems: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  bankName: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '700' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  iban: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 1 },
  contactName: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'left', marginTop: 12, marginBottom: 12 },
  
  subLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 16 },
  sliderImageWrapper: { width: SCREEN_WIDTH - (SPACING.md * 2) - 40, height: 300, justifyContent: 'center', alignItems: 'center' }, // card padding is 20 each side
  donationImage: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#000' },
  sliderHint: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, marginTop: 12, fontWeight: '700' },

  fullScreenModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  saveModalBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveModalBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  fullScreenImg: { width: '100%', height: '80%' }
});
