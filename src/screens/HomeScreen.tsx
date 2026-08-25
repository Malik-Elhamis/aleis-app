import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CurvedFlagHeader } from '../components/CurvedFlagHeader';
import { getUrgentAlerts } from '../services/firestoreService';
import { UrgentAlert } from '../types';

const { width, height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.32; 
const LOGO_SIZE = 100;

// Animated Section Title Component
const SectionTitle = ({ title }: { title: string }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.groupHeader}>
      <View style={styles.decorContainer}>
        <LinearGradient
          colors={['transparent', '#D4A93A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientLine}
        />
        <Animated.View style={[styles.diamond, { opacity: pulseAnim }]} />
        <View style={[styles.diamond, styles.diamondSmall]} />
      </View>
      
      <Text style={styles.groupTitle}>{title}</Text>
      
      <View style={styles.decorContainer}>
        <View style={[styles.diamond, styles.diamondSmall]} />
        <Animated.View style={[styles.diamond, { opacity: pulseAnim }]} />
        <LinearGradient
          colors={['#D4A93A', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientLine}
        />
      </View>
    </View>
  );
};

const ALL_SERVICES = [
  { id: '1', title: 'أخبار البلدية', subtitle: 'آخر الأخبار والفعاليات', icon: 'newspaper-outline', route: 'NewsHub', color: '#1E8E5A' },
  { id: '2', title: 'خدمات إلكترونية', subtitle: 'بوابة الخدمات', icon: 'desktop-outline', route: 'Services', color: '#3B82F6' },
  { id: '3', title: 'خدمات المياه', subtitle: 'الضخ والصيانة', icon: 'water-outline', route: 'WaterHub', color: '#2D9CDB' },
  { id: '4', title: 'الكهرباء', subtitle: 'الأعطال والتقنين', icon: 'flash-outline', route: 'ElectricityHub', color: '#F2B93B' },
  { id: '5', title: 'المشاريع', subtitle: 'مشاريع البلدية', icon: 'construct-outline', route: 'Projects', color: '#4CAF50' },
  { id: '6', title: 'النظافة', subtitle: 'إدارة النفايات', icon: 'leaf-outline', route: 'CleanlinessHub', color: '#38B48B' },
  { id: '7', title: 'شكاوى ومخالفات', subtitle: 'صوتك مسموع', icon: 'warning-outline', route: 'ComplaintsViolationsHub', color: '#E85D5D' },
  { id: '8', title: 'اقتراحات', subtitle: 'أفكار للتطوير', icon: 'bulb-outline', route: 'SuggestionsHub', color: '#8B6CEB' },
  { id: '14', title: 'اسأل البلدية', subtitle: 'استفسارات عامة', icon: 'chatbubbles-outline', route: 'AskMunicipalityHub', color: '#14B8A6' },
  { id: '10', title: 'حالات إنسانية', subtitle: 'دعم ومساندة', icon: 'people-outline', route: 'Humanitarian', color: '#E97AAE' },
  { id: 'dn', title: 'تبرعات', subtitle: 'مساهمة مجتمعية', icon: 'heart-outline', route: 'Donations', color: '#29B36B' },
  { id: '11', title: 'وفيات', subtitle: 'تعازي ومواساة', icon: 'moon-outline', route: 'Obituaries', color: '#6B7280' },
  { id: '12', title: 'مجلس البلدية', subtitle: 'أعضاء وقرارات', icon: 'business-outline', route: 'Council', color: '#F59E0B' },
  { id: '9', title: 'دليل العيس', subtitle: 'أماكن وأرقام', icon: 'location-outline', route: 'Aleis', color: '#4A90E2' },
  { id: '15', title: 'طوارئ', subtitle: 'أرقام هامة', icon: 'call-outline', route: 'Emergency', color: '#E53935' },
];

// Combine hex color with opacity correctly
const hexToRgba = (hex: string, opacity: number) => {
  let c = hex.substring(1).split('');
  if(c.length === 3){
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const colorCode = parseInt(c.join(''), 16);
  return `rgba(${(colorCode >> 16) & 255}, ${(colorCode >> 8) & 255}, ${colorCode & 255}, ${opacity})`;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ROW_COLORS = [
  '#DDF2EA', // الصف الأول
  '#DCEBFA', // الصف الثاني
  '#F3E1F2', // الصف الثالث
  '#E4EEE7', // الصف الرابع
  '#F5EAD6', // الصف الخامس
];

const ServiceCard = ({ item, index, onPress }: { item: typeof ALL_SERVICES[0], index: number, onPress: (route: string) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rowIndex = Math.floor(index / 3);
  const rowColor = ROW_COLORS[rowIndex % ROW_COLORS.length];

  const handlePressIn = () => {
    Animated.timing(scaleAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(item.route)}
      style={[styles.cardBase, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Soft colored curved top section based on Row Index */}
      <View style={[styles.topCurve, { backgroundColor: rowColor }]} />
      
      {/* Icon Circle overlapping the curve */}
      <View style={styles.iconCircleWrapper}>
        <LinearGradient 
          colors={[item.color, hexToRgba(item.color, 0.85)]} 
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
        </LinearGradient>
      </View>

      {/* Texts */}
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
      </View>

    </AnimatedTouchableOpacity>
  );
};

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let unsubs: Function[] = [];
    import('../services/firestoreService').then(({ subscribeHomeSliderSettings, subscribeAppSettings }) => {
      const unsubSlider = subscribeHomeSliderSettings((data) => {
        if (data.images && data.images.length > 0) {
          setSliderImages(data.images);
        } else {
          setSliderImages([
            'https://images.unsplash.com/photo-1542104470-36a536b04a08?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1610313010775-523e66bbd011?q=80&w=600&auto=format&fit=crop',
          ]);
        }
      });
      const unsubApp = subscribeAppSettings((data) => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      });
      unsubs.push(unsubSlider, unsubApp);
    });
    return () => unsubs.forEach(u => u());
  }, []);

  const handlePress = (route: string | null) => {
    if (route) navigation.navigate(route);
  };

  return (
    <View style={styles.mainWrapper}>
      <Animated.ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        bounces={true}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <CurvedFlagHeader 
          heroImages={sliderImages} 
          logoUrl={logoUrl} 
          heroHeight={HERO_HEIGHT} 
        />

        {/* Modern Civic Cards Grid Grouped */}
        <View style={[styles.sectionsContainer, { paddingBottom: Math.max(insets.bottom + 140, 160) }]}>
          
          {/* Decorative City Name */}
          <View style={styles.cityDecorationContainer}>
            <Text style={styles.cityDecorationText}>العيـــــــس</Text>
          </View>

          {[
            { title: 'الخدمات الأساسية', items: ALL_SERVICES.slice(0, 6), startIndex: 0 },
            { title: 'التفاعل مع البلدية', items: ALL_SERVICES.slice(6, 9), startIndex: 6 },
            { title: 'خدمات المجتمع', items: ALL_SERVICES.slice(9, 15), startIndex: 9 }
          ].map((group, groupIndex) => (
            <View key={groupIndex} style={styles.groupContainer}>
              <SectionTitle title={group.title} />
              <View style={styles.gridRow}>
                {group.items.map((item, localIndex) => {
                  const absoluteIndex = group.startIndex + localIndex;
                  return (
                    <ServiceCard key={item.id} item={item} index={absoluteIndex} onPress={handlePress} />
                  );
                })}
              </View>
            </View>
          ))}
        </View>

      </Animated.ScrollView>
    </View>
  );
};

// Layout calculations
const PAGE_PADDING = 20;
const HORIZONTAL_GAP = 12;
// 3-column grid calculation (subtracting 1px ensures floating point rounding doesn't push the 3rd item to the next row)
const CARD_WIDTH = Math.floor((width - (PAGE_PADDING * 2) - (HORIZONTAL_GAP * 2)) / 3) - 1;

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F5F8F6', // General soft background
  },
  container: {
    flex: 1,
  },
  sectionsContainer: {
    marginTop: 0, // Lifted slightly upwards as requested
    zIndex: -1, 
    paddingHorizontal: PAGE_PADDING,
    paddingTop: (LOGO_SIZE / 2) + 4,
  },
  cityDecorationContainer: {
    alignItems: 'center',
    marginBottom: -8, // Negative margin to bring it very close to the section title
    marginTop: 0,
  },
  cityDecorationText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000', // Black
    letterSpacing: 2,
    // Add Kashida effect with extra spacing to look decorative
  },
  cityDecorationUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#0F7456',
    marginTop: 6,
    borderRadius: 2,
    opacity: 0.8,
  },
  gridRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: HORIZONTAL_GAP,
    rowGap: 16,
  },
  groupContainer: {
    marginBottom: 32,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  decorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  gradientLine: {
    width: 30,
    height: 1.5,
    marginHorizontal: 6,
    borderRadius: 2,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: '#D4A93A', // Matches the gold theme
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 3,
  },
  diamondSmall: {
    width: 4,
    height: 4,
    backgroundColor: '#0F7456', // Accent dark green
    opacity: 0.6,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F7456',
    letterSpacing: 0.5,
  },
  
  // New Modern Card Styles (Scaled for 3 columns)
  cardBase: {
    width: CARD_WIDTH,
    height: 145,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
  },
  topCurve: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 55,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  iconCircleWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 31, // 55 (curve height) - 24 (half circle) = 31
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 2,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 9,
    color: '#7B8794',
    textAlign: 'center',
    lineHeight: 12,
  },
});
