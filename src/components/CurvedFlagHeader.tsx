import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, useWindowDimensions, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SHADOWS } from '../config/theme';
import { useNavigation } from '@react-navigation/native';

import { CurvedFlagRibbon } from './CurvedFlagRibbon';

interface CurvedFlagHeaderProps {
  heroImages: string[];
  logoUrl: string | null;
  heroHeight: number;
}

const LOGO_SIZE = 100;

export const CurvedFlagHeader: React.FC<CurvedFlagHeaderProps> = ({ heroImages, logoUrl, heroHeight }) => {
  const { width } = useWindowDimensions();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sliderRef = useRef<ScrollView>(null);
  const navigation = useNavigation<any>();
  const lastTapRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  
  const handleLogoPress = () => {
    const now = Date.now();
    const timePassed = now - lastTapRef.current;
    
    if (timePassed < 800) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    
    lastTapRef.current = now;

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      navigation.navigate('AdminLogin');
    }
  };
  
  useEffect(() => {
    if (!heroImages || heroImages.length <= 1) return;
    const interval = setInterval(() => {
      let nextIndex = currentSlideIndex + 1;
      if (nextIndex >= heroImages.length) nextIndex = 0;
      setCurrentSlideIndex(nextIndex);
      sliderRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 4000); 
    return () => clearInterval(interval);
  }, [currentSlideIndex, heroImages, width]);

  // Dynamic Date logic
  const today = new Date();
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  const dayName = days[today.getDay()];
  const dateString = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  // Simulated Weather logic based on hour
  const hour = today.getHours();
  let weatherIcon = 'sunny-outline';
  let weatherText = 'مشمس';
  let weatherTemp = '28°';
  
  if (hour >= 18 || hour < 5) {
    weatherIcon = 'moon-outline';
    weatherText = 'صافي';
    weatherTemp = '18°';
  } else if (hour >= 5 && hour < 9) {
    weatherIcon = 'partly-sunny-outline';
    weatherText = 'معتدل';
    weatherTemp = '22°';
  }

  // The CurvedFlagRibbon SVG has height 100 and is positioned at bottom: 0.
  // We want the top of the SVG to align with the top of the logo,
  // so the ribbon at Y=60 passes exactly at 60% of the logo's height.
  // We added +40 to push the logo and info cards down without changing the hero image size.
  const logoTopPosition = heroHeight - 60;

  return (
    <View style={[styles.headerContainer, { height: heroHeight, width }]}>
      
      {/* Hero Image Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <ScrollView 
          ref={sliderRef}
          horizontal 
          pagingEnabled 
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={StyleSheet.absoluteFillObject}
        >
          {heroImages && heroImages.length > 0 ? heroImages.map((img, index) => (
            <View key={index} style={{ width: width, height: '100%' }}>
              <Image 
                source={{ uri: img }} 
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            </View>
          )) : (
            <View style={{ width: width, height: '100%' }}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1542104470-36a536b04a08?q=80&w=600&auto=format&fit=crop' }} 
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* SVG Flag Ribbon Swoosh */}
      <CurvedFlagRibbon />

      {/* Floating Info Cards Container */}
      <View style={[styles.infoOverlayContainer, { 
        top: logoTopPosition + 50, // Lowered slightly to avoid flag
        width: width,
      }]}>
        
        {/* Left Side - Weather Card */}
        <View style={{ alignItems: 'flex-start' }}>
          <View style={[styles.infoCard, { backgroundColor: '#FCFCFA' }]}>
            <Ionicons name={weatherIcon as any} size={12} color="#D4A93A" />
            <View style={styles.infoTextWrapWeather}>
              <Text style={styles.infoCardVal}>{weatherTemp}</Text>
              <Text style={styles.infoCardDesc}> {weatherText}</Text>
            </View>
          </View>
        </View>

        {/* Center - Empty spacer for Logo area */}
        <View style={{ flex: 1 }} />

        {/* Right Side - Date Card */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[styles.infoCard, { backgroundColor: '#FCFCFA' }]}>
            <View style={styles.infoTextWrapDate}>
              <Text style={styles.infoCardVal}>{dayName}</Text>
              <Text style={styles.infoCardDesc}> {dateString}</Text>
            </View>
          </View>
        </View>

      </View>

      {/* Centered Logo over the curve */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={handleLogoPress}
        style={[styles.logoContainer, { top: logoTopPosition }]}
      >
        <Image 
          source={logoUrl ? { uri: logoUrl } : require('../../assets/logo.jpg')} 
          style={[styles.logoImage, { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }]}
          resizeMode="cover"
        />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoImage: {
    backgroundColor: '#FFFFFF',
  },
  infoOverlayContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4, // Pushed further outwards
    zIndex: 5,
    elevation: 5,
  },
  infoCard: {
    backgroundColor: '#FCFCFA',
    borderRadius: 10,
    paddingVertical: 1,
    paddingHorizontal: 4, // Reduced width so it doesn't touch the flag
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3, // Reduced gap
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    height: 18, // Extra slim height
  },
  infoTextWrapWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoTextWrapDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoCardVal: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 10,
  },
  infoCardDesc: {
    fontSize: 6,
    color: '#7B8794',
    lineHeight: 8,
  }
});
