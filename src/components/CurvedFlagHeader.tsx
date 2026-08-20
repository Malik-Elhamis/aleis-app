import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { SHADOWS } from '../config/theme';

interface CurvedFlagHeaderProps {
  heroImages: string[];
  logoUrl: string | null;
  heroHeight: number;
}

const FLAG_GREEN = '#007A3D';
const FLAG_RED = '#EF4444';
const FLAG_BLACK = '#000000';

export const CurvedFlagHeader: React.FC<CurvedFlagHeaderProps> = ({ heroImages, logoUrl, heroHeight }) => {
  const { width } = useWindowDimensions();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sliderRef = useRef<ScrollView>(null);
  
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
  
  // Dimensions for a much thinner, deeper flag ribbon
  const FLAG_DEPTH = 40; // Medium shallow concave curve (reduced by ~40%)
  const BAND_THICKNESS = 6; // 6px per stripe -> Total 18px (50% thinner than before)
  const TOTAL_RIBBON_HEIGHT = BAND_THICKNESS * 3;
  const SVG_HEIGHT = FLAG_DEPTH + TOTAL_RIBBON_HEIGHT + 20; 
  const controlY = FLAG_DEPTH * 2;
  const LOGO_SIZE = 100; // Slightly smaller to fit gracefully

  // Parabola: Y(x) = depth * (1 - (2*x/width - 1)^2)
  const getYOnCurve = (x: number) => {
    const normalized = (2 * x / width) - 1;
    return FLAG_DEPTH * (1 - normalized * normalized);
  };

  // Center Y of the White band is base curve + Green(6) + HalfWhite(3)
  const getWhiteCenterY = (x: number) => {
    return getYOnCurve(x) + BAND_THICKNESS + (BAND_THICKNESS / 2);
  };

  // 6 Stars: pushed further from the center logo
  // Left: 10%, 20%, 30%. Right: 70%, 80%, 90%
  const positionsX = [
    width * 0.10, width * 0.20, width * 0.30, 
    width * 0.70, width * 0.80, width * 0.90  
  ];

  // Standard 5-point star path (centered at 0,0)
  const starPath = "M 0,-12 L 3,-4 L 11,-4 L 4,2 L 7,10 L 0,5 L -7,10 L -4,2 L -11,-4 L -3,-4 Z";

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
      <View style={[styles.svgContainer, { height: SVG_HEIGHT, width }]}>
        <Svg width={width} height={SVG_HEIGHT}>
          {/* Green Stripe */}
          <Path 
            d={`M 0 0 Q ${width/2} ${controlY} ${width} 0 L ${width} ${SVG_HEIGHT} L 0 ${SVG_HEIGHT} Z`} 
            fill={FLAG_GREEN} 
          />
          {/* White Stripe */}
          <Path 
            d={`M 0 ${BAND_THICKNESS} Q ${width/2} ${controlY + BAND_THICKNESS} ${width} ${BAND_THICKNESS} L ${width} ${SVG_HEIGHT} L 0 ${SVG_HEIGHT} Z`} 
            fill="#FFFFFF" 
          />
          {/* Black Stripe */}
          <Path 
            d={`M 0 ${BAND_THICKNESS * 2} Q ${width/2} ${controlY + BAND_THICKNESS * 2} ${width} ${BAND_THICKNESS * 2} L ${width} ${SVG_HEIGHT} L 0 ${SVG_HEIGHT} Z`} 
            fill={FLAG_BLACK} 
          />
          {/* White Page Background (Starts after Black) */}
          <Path 
            d={`M 0 ${TOTAL_RIBBON_HEIGHT} Q ${width/2} ${controlY + TOTAL_RIBBON_HEIGHT} ${width} ${TOTAL_RIBBON_HEIGHT} L ${width} ${SVG_HEIGHT} L 0 ${SVG_HEIGHT} Z`} 
            fill="#FAFAFA" 
          />

          {/* 6 Red Stars */}
          {positionsX.map((x, index) => (
            <G key={index} transform={`translate(${x}, ${getWhiteCenterY(x)}) scale(0.25)`}>
              <Path d={starPath} fill={FLAG_RED} />
            </G>
          ))}
        </Svg>
      </View>

      {/* Centered Logo over the curve */}
      <View style={[styles.logoContainer, { 
        top: heroHeight - SVG_HEIGHT + FLAG_DEPTH + (TOTAL_RIBBON_HEIGHT / 2) - (LOGO_SIZE / 2),
      }]}>
        <Image 
          source={logoUrl ? { uri: logoUrl } : require('../../assets/logo.jpg')} 
          style={[styles.logoImage, { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }]}
          resizeMode="cover"
        />
      </View>

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
});
