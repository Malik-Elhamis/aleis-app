import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { subscribeAppSettings, updateLogoUrl } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

export const AdminLogoScreen: React.FC<any> = ({ navigation }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeAppSettings((data) => {
      if (data.logoUrl) {
        setLogoUrl(data.logoUrl);
      }
    });
    return () => unsub();
  }, []);

  const handleChangeLogo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // We want the checkmark and square crop
      aspect: [1, 1], // Logo must be a square
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const uri = pickerResult.assets[0].uri;
      
      setIsUploading(true);
      try {
        const uploadedUrls = await uploadComplaintImages([uri], 'app_logo_' + Date.now());
        if (uploadedUrls.length > 0) {
          const newUrl = uploadedUrls[0];
          setLogoUrl(newUrl);
          // Automatically save
          await updateLogoUrl(newUrl);
          Alert.alert('نجاح', 'تم تحديث الشعار بنجاح!');
        }
      } catch (err) {
        Alert.alert('خطأ', 'تعذر رفع الشعار.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleResetToDefault = async () => {
    Alert.alert(
      'تأكيد الإزالة',
      'هل أنت متأكد أنك تريد استعادة الشعار الافتراضي؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'استعادة', 
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await updateLogoUrl('');
              setLogoUrl(null);
              Alert.alert('نجاح', 'تم استعادة الشعار الافتراضي.');
            } catch (err) {
              Alert.alert('خطأ', 'تعذر حفظ التغييرات.');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>تغيير شعار التطبيق (اللوغو)</Text>
        <Text style={styles.headerSub}>قم باختيار صورة جديدة لتكون الشعار الرسمي للتطبيق الذي يظهر في الرئيسية.</Text>
      </View>

      <View style={styles.logoPreviewContainer}>
        <View style={styles.logoWrapper}>
          <Image 
            source={logoUrl ? { uri: logoUrl } : require('../../../assets/logo.jpg')} 
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.previewText}>معاينة الشعار الحالي</Text>
      </View>

      <TouchableOpacity 
        style={styles.changeBtn} 
        onPress={handleChangeLogo}
        disabled={isUploading || isSaving}
      >
        {isUploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Ionicons name="camera-outline" size={24} color="#FFF" />
        )}
        <Text style={styles.changeBtnText}>اختيار شعار جديد</Text>
      </TouchableOpacity>

      {logoUrl && (
        <TouchableOpacity 
          style={styles.resetBtn} 
          onPress={handleResetToDefault}
          disabled={isUploading || isSaving}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.danger} />
          <Text style={styles.resetBtnText}>استعادة الشعار الافتراضي</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  header: { 
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: COLORS.textPrimary, 
    textAlign: 'right', 
    marginBottom: 8 
  },
  headerSub: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    textAlign: 'right', 
    lineHeight: 22 
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#D4AF37', // Golden border like home
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  previewText: {
    marginTop: 16,
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  changeBtn: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderRadius: 12, 
    gap: 12, 
    marginBottom: 16,
    ...SHADOWS.small
  },
  changeBtnText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 16 
  },
  resetBtn: {
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FEE2E2', // Light red
    padding: 16, 
    borderRadius: 12, 
    gap: 12, 
  },
  resetBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 16
  }
});
