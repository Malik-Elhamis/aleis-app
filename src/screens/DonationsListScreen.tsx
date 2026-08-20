import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { subscribeDonationMethods, subscribeOngoingDonations } from '../services/firestoreService';
import { DonationMethod, OngoingDonation } from '../types';

export const DonationsListScreen: React.FC<any> = ({ route, navigation }) => {
  const { type } = route.params;
  const [methods, setMethods] = useState<DonationMethod[]>([]);
  const [ongoing, setOngoing] = useState<OngoingDonation[]>([]);

  const activeOngoing = ongoing.filter(item => item.status !== 'completed');
  const completedOngoing = ongoing.filter(item => item.status === 'completed');
  
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubMethods = subscribeDonationMethods(setMethods);
    const unsubOngoing = subscribeOngoingDonations(setOngoing);
    return () => {
      unsubMethods();
      unsubOngoing();
    };
  }, []);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('تم النسخ', 'تم النسخ بنجاح.');
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
      <View style={styles.header}>
        <Ionicons name="gift" size={36} color="#FFF" style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {type === 'methods' ? (
          methods.length > 0 ? methods.map(method => (
            <TouchableOpacity 
              key={method.id} 
              style={[styles.ongoingCard, SHADOWS.medium]} 
              onPress={() => navigation.navigate('DonationMethodDetails', { method })}
            >
              <View style={styles.ongoingContent}>
                <Text style={styles.ongoingTitle}>{method.title}</Text>
                {method.description ? (
                  <Text style={styles.ongoingDesc} numberOfLines={2}>{method.description}</Text>
                ) : null}

                <View style={styles.detailsBtn}>
                  <Text style={styles.detailsBtnText}>عرض التفاصيل</Text>
                  <Ionicons name="chevron-back" size={16} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyText}>لا توجد طرق تبرع مضافة حالياً</Text>
          )
        ) : type === 'ongoing' ? (
          activeOngoing.length > 0 ? activeOngoing.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.ongoingCard, SHADOWS.medium]}
              onPress={() => navigation.navigate('HumanitarianDetails', { caseItem: item })}
            >
              <View style={styles.ongoingImageContainer}>
                <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }} style={styles.ongoingImg} resizeMode="contain" />
              </View>
              <View style={styles.ongoingContent}>
                <Text style={styles.ongoingTitle}>{item.title}</Text>
                <Text style={styles.ongoingDesc} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.detailsBtn}>
                  <Text style={styles.detailsBtnText}>التفاصيل والمساهمة</Text>
                  <Ionicons name="chevron-back" size={16} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyText}>لا توجد تبرعات جارية حالياً</Text>
          )
        ) : (
          completedOngoing.length > 0 ? completedOngoing.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.ongoingCard, SHADOWS.medium]}
              onPress={() => navigation.navigate('HumanitarianDetails', { caseItem: item })}
            >
              <View style={styles.ongoingImageContainer}>
                <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }} style={styles.ongoingImg} resizeMode="contain" />
                <View style={styles.completedOverlay}>
                  <Ionicons name="checkmark-done-circle" size={32} color="#FFF" />
                  <Text style={styles.completedOverlayText}>مكتملة</Text>
                </View>
              </View>
              <View style={styles.ongoingContent}>
                <Text style={styles.ongoingTitle}>{item.title}</Text>
                <Text style={styles.ongoingDesc} numberOfLines={2}>{item.description}</Text>
                
                <View style={[styles.detailsBtn, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={[styles.detailsBtnText, { color: '#15803D' }]}>عرض تفاصيل الحالة</Text>
                  <Ionicons name="chevron-back" size={16} color="#15803D" />
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyText}>لا توجد تبرعات مكتملة حالياً</Text>
          )
        )}
      </ScrollView>

      {/* Full Screen Image Modal */}
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
            
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setFullScreenImage(null)}>
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
  header: { backgroundColor: '#059669', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20, alignItems: 'center' }, 
  headerIcon: { marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#D1FAE5', textAlign: 'center' },
  
  tabsContainer: { flexDirection: 'column', backgroundColor: 'transparent', marginHorizontal: 16, marginTop: 16, gap: 10 },
  tabBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  tabBtnActive: { backgroundColor: '#059669', borderColor: '#059669', ...SHADOWS.medium },
  tabContent: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tabText: { fontSize: 16, fontWeight: '800', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },

  content: { padding: SPACING.md, paddingBottom: 100 },
  
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 16 },
  
  accountBox: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, alignItems: 'flex-end', marginBottom: 12 },
  bankName: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '700' },
  copyRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  iban: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 1 },
  
  contactName: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'right', marginTop: 8, marginBottom: 8 },

  subLabel: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 12 },
  imagesScroll: { flexDirection: 'row-reverse' },
  donationImage: { width: 120, height: 120, borderRadius: 12, marginLeft: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#000' },
  
  ongoingCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  ongoingImageContainer: { position: 'relative', backgroundColor: '#000' },
  ongoingImg: { width: '100%', height: 160 },
  completedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(16, 185, 129, 0.7)', justifyContent: 'center', alignItems: 'center' },
  completedOverlayText: { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 8 },
  ongoingContent: { padding: 16 },
  ongoingTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 8 },
  ongoingDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 12 },
  
  detailsBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  detailsBtnText: { fontSize: 14, fontWeight: '700', color: '#059669', marginLeft: 4 },

  emptyText: { marginTop: 40, fontSize: 16, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },

  fullScreenModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  closeModalBtn: {},
  saveModalBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveModalBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  fullScreenImg: { width: '100%', height: '80%' }
});
