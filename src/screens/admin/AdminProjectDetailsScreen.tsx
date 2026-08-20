import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, SHADOWS } from '../../config/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MunicipalProject } from '../../types';

type ParamList = {
  AdminProjectDetails: { projectId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export const AdminProjectDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'AdminProjectDetails'>>();
  const navigation = useNavigation<NavigationProp>();
  const { projectId } = route.params;

  const [project, setProject] = useState<MunicipalProject | null>(null);
  const [loading, setLoading] = useState(true);
  
  const formattedImages = useMemo(() => project?.images?.map(uri => ({ uri })) || [], [project?.images]);
  
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject(docSnap.data() as MunicipalProject);
        }
      } catch (error) {
        console.error("Error fetching project details: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.errorText}>لم يتم العثور على تفاصيل المشروع.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Images Carousel */}
        {project.images && project.images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carouselContainer}>
            {project.images.map((imgUrl, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.imageWrapper}
                activeOpacity={0.9}
                onPress={() => {
                  setCurrentImageIndex(index);
                  setIsImageViewerVisible(true);
                }}
              >
                <Image source={{ uri: imgUrl }} style={[styles.projectImage, { position: 'absolute', opacity: 0.8 }]} blurRadius={15} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
                <Image source={{ uri: imgUrl }} style={[styles.projectImage, { resizeMode: 'contain' }]} />
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>{index + 1} / {project.images.length}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.noImageText}>لا يوجد صور مرفقة</Text>
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Header Info */}
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{project.statusText || project.status}</Text>
            </View>
            <Text style={styles.categoryText}>{project.category}</Text>
          </View>

          <Text style={styles.title}>{project.title}</Text>
          
          <Text style={styles.sectionTitle}>تفاصيل المشروع:</Text>
          <Text style={styles.description}>{project.description}</Text>

          {/* Progress */}
          {project.status !== 'suggested' && (
            <View style={[styles.progressCard, SHADOWS.small]}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>نسبة الإنجاز: {project.progressPercentage || 0}%</Text>
                <View style={styles.datesBox}>
                  <Text style={styles.dateText}>البدء: {project.startDate}</Text>
                  {!!project.endDate && <Text style={styles.dateText}>الانتهاء: {project.endDate}</Text>}
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${project.progressPercentage || 0}%` }]} />
              </View>
            </View>
          )}

          {/* Financials / Budget */}
          {!!project.budget && (
            <View style={[styles.budgetCard, SHADOWS.small]}>
              <Ionicons name="cash-outline" size={24} color="#059669" />
              <Text style={styles.budgetLabel}>الميزانية المقدرة:</Text>
              <Text style={styles.budgetValue}>{project.budget}</Text>
            </View>
          )}

          {/* Notes */}
          {!!project.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>ملاحظات الإدارة:</Text>
              <Text style={styles.notesText}>{project.notes}</Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Floating Action Button for Editing */}
      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]} 
        onPress={() => navigation.navigate('AdminProjectForm', { projectId: project.id })}
      >
        <Ionicons name="create" size={28} color="#FFF" />
      </TouchableOpacity>
      
      {/* Full-screen Image Viewer Modal */}
      <Modal visible={isImageViewerVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 }}
              onPress={() => setIsImageViewerVisible(false)}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: currentImageIndex * width, y: 0 }}
            >
              {formattedImages.map((img, idx) => (
                <View key={idx} style={{ width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Image 
                    source={{ uri: img.uri }} 
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
                    resizeMethod="resize" 
                  />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12, fontWeight: '600' },
  
  scrollContent: { paddingBottom: 100 },
  
  carouselContainer: { width, height: 280 },
  imageWrapper: { width, height: 280, position: 'relative', overflow: 'hidden' },
  projectImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageCounter: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  imageCounterText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  
  noImageContainer: { width: '100%', height: 200, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  noImageText: { marginTop: 8, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  
  contentContainer: { padding: SPACING.lg },
  
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusBadgeText: { color: '#0284C7', fontWeight: '800', fontSize: 12 },
  categoryText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  
  title: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'right', marginBottom: 20 },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'right', marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 24, marginBottom: 24 },
  
  progressCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  progressHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  datesBox: { alignItems: 'flex-end' },
  dateText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  
  budgetCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#D1FAE5', padding: 16, borderRadius: 12, gap: 10, marginBottom: 20 },
  budgetLabel: { fontSize: 15, fontWeight: '700', color: '#065F46' },
  budgetValue: { fontSize: 16, fontWeight: '900', color: '#047857' },
  
  notesContainer: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, borderRightWidth: 4, borderRightColor: '#D97706' },
  notesTitle: { fontSize: 14, fontWeight: '800', color: '#B45309', textAlign: 'right', marginBottom: 6 },
  notesText: { fontSize: 14, color: '#92400E', textAlign: 'right', lineHeight: 22 },
  
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
