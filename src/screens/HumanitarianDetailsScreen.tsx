import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert, ActivityIndicator, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { HumanitarianCase } from '../types';
import { CustomButton } from '../components/CustomButton';

export const HumanitarianDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { caseItem } = route.params;
  const item = caseItem as any;

  const getCurrencyLabel = (cur?: string) => {
    switch(cur) {
      case 'USD': return '$';
      case 'TRY': return '₺';
      case 'SYP': return 'ل.س';
      default: return '$';
    }
  };

  const renderOngoingDonationStats = () => {
    if (!item.displayCurrencies || !Array.isArray(item.displayCurrencies) || item.displayCurrencies.length === 0) {
      return null;
    }

    return (
      <View style={{ marginTop: 8 }}>
        {item.status === 'completed' && (
          <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 16 }}>المبالغ التي تم جمعها</Text>
        )}
        {item.displayCurrencies.map((cur: string) => {
          let target = 0;
          let collected = 0;
          if (cur === 'USD') {
            target = parseFloat(item.targetUSD || '0');
            collected = parseFloat(item.collectedUSD || '0');
          } else if (cur === 'TRY') {
            target = parseFloat(item.targetTRY || '0');
            collected = parseFloat(item.collectedTRY || '0');
          } else if (cur === 'SYP') {
            target = parseFloat(item.targetSYP || '0');
            collected = parseFloat(item.collectedSYP || '0');
          }

          const progress = target > 0 ? (collected / target) * 100 : 0;
          const curLabel = getCurrencyLabel(cur);
          
          if (item.status === 'completed') {
            return (
              <View key={cur} style={[styles.statsCard, { paddingVertical: 12, alignItems: 'center' }]}>
                <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '600' }}>
                  {cur === 'USD' ? 'بالدولار' : cur === 'TRY' ? 'بالليرة التركية' : 'بالليرة السورية'}
                </Text>
                <Text style={[styles.statValue, { color: COLORS.primary, fontSize: 22 }]}>
                  {collected} <Text style={{fontSize: 16}}>{curLabel}</Text>
                </Text>
              </View>
            );
          }

          return (
            <View key={cur} style={styles.statsCard}>
              <Text style={styles.currencyHeaderTitle}>إحصائيات {cur === 'USD' ? 'الدولار' : cur === 'TRY' ? 'الليرة التركية' : 'الليرة السورية'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>المبلغ المطلوب</Text>
                  <Text style={styles.statValue}>{target} <Text style={{fontSize: 14}}>{curLabel}</Text></Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>تم جمعه</Text>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>{collected} <Text style={{fontSize: 14}}>{curLabel}</Text></Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% اكتمل</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderHumanitarianCaseStats = () => {
    if (!item.targetAmount) return null;
    
    const target = parseFloat(item.targetAmount || '0');
    const targetCurLabel = getCurrencyLabel(item.currency || 'USD'); // Assuming old currency was item.currency
    
    const collectedForProgress = parseFloat(item.collectedAmount || '0');
    const progress = target > 0 ? (collectedForProgress / target) * 100 : 0;
    
    return (
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>المبلغ المطلوب</Text>
            <Text style={styles.statValue}>{target} <Text style={{fontSize: 14}}>{targetCurLabel}</Text></Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>تم جمعه</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{collectedForProgress} <Text style={{fontSize: 14}}>{targetCurLabel}</Text></Text>
          </View>
        </View>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% اكتمل</Text>
      </View>
    );
  };

  const handleDonateMunicipality = () => {
    navigation.navigate('Donations');
  };

  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      // If it's a remote URL, download it first
      if (uri.startsWith('http')) {
        const fileExt = uri.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `donation_${Date.now()}.${fileExt}`;
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
        
        {/* Header Images Slider */}
        <View style={styles.imageContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
            {item.images && item.images.length > 0 ? (
              item.images.map((uri: string, idx: number) => (
                <View key={idx} style={styles.sliderImageWrapper}>
                  <Image source={{ uri }} style={styles.mainImage} resizeMode="contain" />
                </View>
              ))
            ) : (
              <View style={styles.sliderImageWrapper}>
                <Image source={{ uri: 'https://via.placeholder.com/800x400?text=لا+توجد+صورة' }} style={styles.mainImage} resizeMode="contain" />
              </View>
            )}
          </ScrollView>
          {item.images && item.images.length > 1 && (
            <View style={styles.sliderIndicator}>
              <Text style={styles.sliderIndicatorText}>اسحب لرؤية المزيد ({item.images.length})</Text>
            </View>
          )}
        </View>

        {/* Title and Urgent Badge */}
        <View style={styles.headerRow}>
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>عاجل</Text>
            </View>
          )}
          <Text style={styles.title}>{item.title}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        {item.status === 'completed' ? (
          <>
            <View style={styles.completedSection}>
              <Ionicons name="checkmark-done-circle" size={80} color="#10B981" />
              <Text style={styles.completedTitle}>اكتملت ولله الحمد</Text>
              <Text style={styles.completedPrayer}>
                {item.completedMessage || 'جزاكم الله خيراً وتقبل منكم، وجعل ما قدمتموه في ميزان حسناتكم. شكراً لكل من ساهم في تفريج كربة هذه الحالة.'}
              </Text>
              
              {item.completedNote ? (
                <View style={styles.completedNoteContainer}>
                  <Text style={styles.completedNoteText}>{item.completedNote}</Text>
                </View>
              ) : null}

              {item.completedImage ? (
                <TouchableOpacity onPress={() => setFullScreenImage(item.completedImage!)}>
                  <Image 
                    source={{ uri: item.completedImage }} 
                    style={styles.completedImage} 
                    resizeMode="cover" 
                  />
                </TouchableOpacity>
              ) : null}
            </View>
            {item.displayCurrencies ? renderOngoingDonationStats() : renderHumanitarianCaseStats()}
          </>
        ) : (
          <>
            {/* Stats */}
            {item.displayCurrencies ? renderOngoingDonationStats() : renderHumanitarianCaseStats()}

            {/* Donation Methods */}
            {(item.donationMethods?.bankAccountDetails || item.donationMethods?.donationImages?.length || item.donationMethods?.viaMunicipality || item.donationMethods?.donationExplanation) ? (
              <View style={styles.donationSection}>
                <Text style={styles.sectionTitle}>طرق التبرع</Text>
                
                {/* 1. Explanation */}
                {item.donationMethods.donationExplanation ? (
                  <View style={styles.explanationBox}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={{marginLeft: 8}} />
                    <Text style={styles.explanationText}>{item.donationMethods.donationExplanation}</Text>
                  </View>
                ) : null}

                {/* 2. Images */}
                {item.donationMethods.donationImages && item.donationMethods.donationImages.length > 0 ? (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.subLabel}>صور طرق الدفع:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                      {item.donationMethods.donationImages.map((uri: string, idx: number) => (
                        <TouchableOpacity key={idx} onPress={() => setFullScreenImage(uri)}>
                          <Image source={{ uri }} style={styles.donationImage} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                {/* 3. Bank Details */}
                {item.donationMethods.bankAccountDetails ? (
                  <View style={styles.bankAccountBox}>
                    <Ionicons name="card-outline" size={24} color={COLORS.primary} style={{marginLeft: 12}} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bankAccountLabel}>تفاصيل الحساب البنكي / المستفيد:</Text>
                      <Text style={styles.bankAccountValue}>{item.donationMethods.bankAccountDetails}</Text>
                    </View>
                  </View>
                ) : null}

                {item.donationMethods.viaMunicipality ? (
                  <CustomButton
                    title="التبرع عبر صندوق البلدية 🏛️"
                    onPress={handleDonateMunicipality}
                    variant="primary"
                    style={{ marginTop: 20 }}
                  />
                ) : null}

              </View>
            ) : null}
          </>
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
  content: { paddingBottom: 60 },
  
  imageContainer: { width: '100%', height: 220, backgroundColor: '#000', position: 'relative' },
  sliderImageWrapper: { width: SCREEN_WIDTH, height: 220, justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '100%', height: '100%' },
  sliderIndicator: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  sliderIndicatorText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingBottom: 0 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, flex: 1, textAlign: 'left' },
  urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginRight: 12 },
  urgentText: { color: COLORS.danger, fontWeight: '900', fontSize: 18 },
  
  description: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'left', padding: SPACING.md, lineHeight: 24 },
  
  completedSection: { alignItems: 'center', padding: 24, backgroundColor: '#ECFDF5', margin: SPACING.md, borderRadius: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  completedTitle: { fontSize: 24, fontWeight: '900', color: '#065F46', marginTop: 16, marginBottom: 12 },
  completedPrayer: { fontSize: 16, color: '#047857', textAlign: 'center', lineHeight: 26, fontWeight: '600' },
  completedNoteContainer: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8, width: '100%' },
  completedNoteText: { fontSize: 14, color: '#065F46', textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  completedImage: { width: 250, height: 200, borderRadius: 12, marginTop: 20, borderWidth: 2, borderColor: '#A7F3D0' },
  
  statsCard: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: 20, borderRadius: 16, ...SHADOWS.small },
  currencyHeaderTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 16, backgroundColor: '#F1F5F9', paddingVertical: 8, borderRadius: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border, marginHorizontal: 16 },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  
  progressBarBg: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, marginBottom: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  progressText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '700' },
  
  secondaryStatsContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: COLORS.border },
  secondaryStatsTitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 8 },
  secondaryStatsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16 },
  secondaryStatText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  
  donationSection: { margin: SPACING.md, padding: 20, backgroundColor: COLORS.surface, borderRadius: 16, ...SHADOWS.small },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 16 },
  
  explanationBox: { flexDirection: 'row', backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  explanationText: { flex: 1, fontSize: 15, color: '#0369A1', textAlign: 'left', lineHeight: 22, fontWeight: '600' },
  
  bankAccountBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  bankAccountLabel: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'left', marginBottom: 4 },
  bankAccountValue: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'left' },
  
  subLabel: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'left', marginBottom: 12 },
  imagesScroll: { flexDirection: 'row' },
  donationImage: { width: 150, height: 150, borderRadius: 12, marginLeft: 12, borderWidth: 1, borderColor: COLORS.border },

  fullScreenModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  closeModalBtn: {},
  saveModalBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveModalBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  fullScreenImg: { width: '100%', height: '80%' }
});
