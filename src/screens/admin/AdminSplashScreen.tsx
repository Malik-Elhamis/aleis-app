import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { subscribeAppSettings, updateSplashScreenUrl } from '../../services/firestoreService';
import { uploadComplaintImages } from '../../services/storageService';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';

const { width } = Dimensions.get('window');

export const AdminSplashScreen: React.FC<any> = ({ navigation }) => {
  const [splashUrl, setSplashUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeAppSettings((data) => {
      if (data.splashScreenUrl) {
        setSplashUrl(data.splashScreenUrl);
      }
    });
    return () => unsub();
  }, []);

  const handleChangeImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('تنبيه', 'التطبيق يحتاج إلى صلاحية الوصول للصور.');
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // We want the checkmark and crop
      aspect: [9, 16], // Splash is usually vertical
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const uri = pickerResult.assets[0].uri;
      
      setIsUploading(true);
      try {
        const uploadedUrls = await uploadComplaintImages([uri], 'splash_' + Date.now());
        if (uploadedUrls.length > 0) {
          const newUrl = uploadedUrls[0];
          setSplashUrl(newUrl);
          await updateSplashScreenUrl(newUrl);
          Alert.alert('نجاح', 'تم تحديث صورة البداية بنجاح!');
        }
      } catch (err) {
        Alert.alert('خطأ', 'تعذر رفع الصورة.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleResetToDefault = async () => {
    Alert.alert(
      'تأكيد الإلغاء',
      'هل أنت متأكد أنك تريد إلغاء شاشة البداية؟ لن يظهر أي شيء عند فتح التطبيق.',
      [
        { text: 'تراجع', style: 'cancel' },
        { 
          text: 'إلغاء', 
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await updateSplashScreenUrl('');
              setSplashUrl(null);
              Alert.alert('نجاح', 'تم إلغاء شاشة البداية.');
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
        <Text style={styles.headerTitle}>تغيير شاشة البداية</Text>
        <Text style={styles.headerSub}>قم باختيار صورة ترحيبية تظهر لثوانٍ معدودة قبل دخول المستخدم للتطبيق.</Text>
      </View>

      <View style={styles.previewContainer}>
        <View style={styles.imageWrapper}>
          {splashUrl ? (
            <Image 
              source={{ uri: splashUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: COLORS.textMuted, textAlign: 'center', padding: 20 }}>لا يوجد صورة (تم الإلغاء)</Text>
          )}
        </View>
        <Text style={styles.previewText}>معاينة الشاشة الحالية</Text>
      </View>

      <TouchableOpacity 
        style={styles.changeBtn} 
        onPress={handleChangeImage}
        disabled={isUploading || isSaving}
      >
        {isUploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Ionicons name="image-outline" size={24} color="#FFF" />
        )}
        <Text style={styles.changeBtnText}>اختيار صورة جديدة</Text>
      </TouchableOpacity>

      {splashUrl && (
        <TouchableOpacity 
          style={styles.resetBtn} 
          onPress={handleResetToDefault}
          disabled={isUploading || isSaving}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          <Text style={styles.resetBtnText}>إلغاء شاشة البداية</Text>
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
    marginBottom: 20,
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
  previewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageWrapper: {
    width: width * 0.45,
    height: width * 0.8, // 9:16 aspect ratio
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  image: {
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
    backgroundColor: '#FEE2E2', 
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
