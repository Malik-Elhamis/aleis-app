import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

const FLAG_GREEN = '#0B8A43';
const FLAG_WHITE = '#FFFFFF';
const FLAG_BLACK = '#161616'; // Updated black color
const FLAG_RED = '#D62828';

export const CurvedFlagRibbon: React.FC = () => {
  const { width } = useWindowDimensions();

  // We increased the SVG height to 120 to allow for a deeper curve without clipping at the top.
  // With SVG_HEIGHT=120 and bottom=-1, the top of the logo aligns exactly with Y=20 inside this SVG.
  const SVG_HEIGHT = 120;
  // Adjusted thickness to perfectly match a standard flag proportion
  const STRIPE_GREEN = 10;
  const STRIPE_WHITE = 10; 
  const STRIPE_BLACK = 10;
  const STAR_SIZE = 8;
  
  // Base Y offsets for a deeper, flowing parabola (Q curve)
  // To LOWER the flag slightly (from the previous raised position):
  // Top of logo is at Y=20.
  // We want the White stripe center to be around Y=66 (which is 46px down the logo,
  // a perfect middle-ground between the fully centered 50px and the previously raised 40px).
  // So Green top center must be 66 - 15 = 51.
  // We use START_Y = 21, CONTROL_Y = 81 to get a center of 51 and maintain the deep 30px curve drop!
  const START_Y = 21; 
  const CONTROL_Y = 81; 

  // Generate the path for a stripe at a given Y offset and thickness
  const getStripePath = (yOffsetTop: number, thickness: number) => {
    const yTop = START_Y + yOffsetTop;
    const yControlTop = CONTROL_Y + yOffsetTop;
    const yBottom = yTop + thickness;
    const yControlBottom = yControlTop + thickness;
    
    // Draw from -20 to width+20 so the edges aren't cut off sharply
    return `M -20 ${yTop} 
            Q ${width / 2} ${yControlTop} ${width + 20} ${yTop}
            L ${width + 20} ${yBottom}
            Q ${width / 2} ${yControlBottom} -20 ${yBottom}
            Z`;
  };

  // Helper to get exact Y on the curve for perfectly placing stars
  const getYOnCurve = (x: number) => {
    // The curve spans from -20 to width + 20 (total span = width + 40)
    const t = (x + 20) / (width + 40);
    return Math.pow(1 - t, 2) * START_Y + 2 * (1 - t) * t * CONTROL_Y + Math.pow(t, 2) * START_Y;
  };

  // The center Y of the white stripe at any given X
  const getWhiteCenterY = (x: number) => {
    return getYOnCurve(x) + STRIPE_GREEN + (STRIPE_WHITE / 2);
  };

  // We want the ribbon to tuck deep behind the logo so no inner edge is visible.
  // Logo is 100px. Ribbon enters 20px on each side. Empty area = 60px.
  const emptyAreaWidth = 60;
  const clipWidth = (width - emptyAreaWidth) / 2;

  // Star positions: The user requested placing the 3 stars perfectly in the center 
  // of the visible left and right sections of the ribbon.
  // The left visible ribbon spans from 0 to clipWidth. Its center is clipWidth / 2.
  const leftVisibleCenter = clipWidth / 2;
  const rightVisibleCenter = width - leftVisibleCenter;
  const starSpacing = 32; // Consistent 32px spacing between stars

  const leftStarsX = [leftVisibleCenter - starSpacing, leftVisibleCenter, leftVisibleCenter + starSpacing];
  const rightStarsX = [rightVisibleCenter - starSpacing, rightVisibleCenter, rightVisibleCenter + starSpacing];
  const positionsX = [...leftStarsX, ...rightStarsX];

  // Standard 5-point star path (centered at 0,0), size approx 24x24
  const starPath = "M 0,-12 L 3,-4 L 11,-4 L 4,2 L 7,10 L 0,5 L -7,10 L -4,2 L -11,-4 L -3,-4 Z";
  const starScale = STAR_SIZE / 22;



  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={SVG_HEIGHT}>
        <Defs>
          <ClipPath id="ribbonClip">
            <Rect x="0" y="0" width={clipWidth} height={SVG_HEIGHT} />
            <Rect x={clipWidth + emptyAreaWidth} y="0" width={clipWidth} height={SVG_HEIGHT} />
          </ClipPath>
        </Defs>

        <G clipPath="url(#ribbonClip)">
          {/* Green Stripe */}
          <Path 
            d={getStripePath(0, STRIPE_GREEN)} 
            fill={FLAG_GREEN} 
          />
          
          {/* White Stripe */}
          <Path 
            d={getStripePath(STRIPE_GREEN, STRIPE_WHITE)} 
            fill={FLAG_WHITE} 
          />
          
          {/* Black Stripe */}
          <Path 
            d={getStripePath(STRIPE_GREEN + STRIPE_WHITE, STRIPE_BLACK)} 
            fill={FLAG_BLACK} 
          />

          {/* 6 Red Stars */}
          {positionsX.map((x, index) => (
            <G key={index} transform={`translate(${x}, ${getWhiteCenterY(x)}) scale(${starScale})`}>
              <Path d={starPath} fill={FLAG_RED} />
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -40, 
    left: 0,
    right: 0,
  }
});
