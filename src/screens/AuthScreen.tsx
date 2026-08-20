import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Modal, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

export const AuthScreen: React.FC = () => {
  const { loginWithPhone, continueAsGuest } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      Alert.alert('خطأ', 'يرجى أدخال رقم هاتف صحيح لطلب رمز التفعيل (OTP)');
      return;
    }
    setOtpModalVisible(true);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      Alert.alert('خطأ في الرمز', 'يرجى إدخال الرمز المكون من 4 أرقام (رمز تجريبي: 1234)');
      return;
    }

    setLoading(true);
    const success = await loginWithPhone(phoneNumber, fullName);
    setLoading(false);

    if (success) {
      setOtpModalVisible(false);
    } else {
      Alert.alert('خطأ', 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.flexContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Branding */}
        <View style={styles.brandingHeader}>
          <View style={[styles.logoContainer, SHADOWS.large]}>
            <Ionicons name="shield-checkmark" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.appTitle}>مجلس بلدية العيس</Text>
          <Text style={styles.appSubtitle}>البوابة الإلكترونية الرسمية لخدمات المواطنين</Text>
        </View>

        {/* Feature Badges */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="water" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
            <Text style={styles.featureText}>جدول المياه المباشر</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="construct" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
            <Text style={styles.featureText}>تقديم ومتابعة الشكاوى</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="document-text" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
            <Text style={styles.featureText}>المعاملات والإفادات</Text>
          </View>
        </View>

        {/* Onboarding Choices Box */}
        <View style={[styles.authCard, SHADOWS.medium]}>
          <Text style={styles.cardHeader}>اختر طريقة الدخول للبرنامج</Text>
          
          <CustomInput
            label="الاسم الكامل (اختياري)"
            placeholder="أدخل اسمك الكريم"
            value={fullName}
            onChangeText={setFullName}
            iconName="person-outline"
          />

          <CustomInput
            label="رقم الهاتف المحمول"
            placeholder="70 123 456"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            iconName="call-outline"
          />

          <CustomButton
            title="تسجيل الدخول برقم الهاتف 📱"
            onPress={handleSendOtp}
            variant="primary"
            size="large"
            style={{ marginBottom: SPACING.md }}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="الدخول كزائر 👤"
            onPress={continueAsGuest}
            variant="outline"
            size="large"
          />
          <Text style={styles.guestHint}>
            * الدخول كزائر يتيح التصفح الشامل وإمكانية إرسال الشكاوى بعد إدخال الاسم ورقم التواصل يدويًا.
          </Text>
        </View>

        <Text style={styles.footerNote}>© 2026 مجلس بلدية العيس - جميع الحقوق محفوظة</Text>
      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={otpModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, SHADOWS.large]}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setOtpModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Ionicons name="lock-closed-outline" size={48} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.modalTitle}>رمز التحقق من الهاتف (OTP)</Text>
            <Text style={styles.modalSub}>
              تم إرسال رمز التفعيل إلى رقم الهاتف: {phoneNumber}
            </Text>

            <CustomInput
              placeholder="أدخل الرمز (مثال: 1234)"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
              style={{ textAlign: 'center', fontSize: 20, letterSpacing: 4 }}
            />

            <CustomButton
              title="تأكيد ومتابعة الدخول ✨"
              onPress={handleVerifyOtp}
              loading={loading}
              variant="primary"
              size="large"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xxl + 20,
    paddingBottom: SPACING.xl,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  featuresContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  authCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderTopWidth: 4,
    borderTopColor: COLORS.primary,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  dividerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  guestHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
