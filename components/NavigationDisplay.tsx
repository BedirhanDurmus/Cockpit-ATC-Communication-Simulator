import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, useWindowDimensions, Platform } from "react-native";
import Svg, { 
  Line, Path, Text as SvgText, G, Rect, Circle, Polygon, 
  Defs, LinearGradient, Stop, ClipPath, RadialGradient
} from "react-native-svg";
import { AVIATION_COLORS, AVIATION_DIMENSIONS, AVIATION_FONTS, AVIATION_OPACITIES } from '../constants/aviation';

interface NavigationDisplayProps {
  heading: number;
  speed: number;
  altitude: number;
}

interface Waypoint {
  name: string;
  type: 'airport' | 'waypoint' | 'vor';
  x: number;
  y: number;
  distance: number;
}

interface Traffic {
  callsign: string;
  x: number;
  y: number;
  altitude: number;
  threat: 'none' | 'traffic' | 'warning';
}

export default function NavigationDisplay({
  heading,
  speed,
  altitude,
}: NavigationDisplayProps) {
  const [range, setRange] = useState(40); // NM
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [tcasEnabled, setTcasEnabled] = useState(true);

  // Responsive dimensions - useWindowDimensions for web responsiveness
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  const isWeb = Platform.OS === 'web';
  
  // Responsive display dimensions
  const displayWidth = useMemo(() => {
    if (isWeb) {
      // Web'de container genişliğine göre ayarla
      return Math.min(screenWidth * 0.95, 1200);
    }
    return isMobile ? 600 : 1200;
  }, [screenWidth, isMobile, isWeb]);
  
  const displayHeight = useMemo(() => {
    if (isWeb) {
      // Web'de aspect ratio koru
      return (displayWidth * 700) / 1200;
    }
    return isMobile ? 350 : 700;
  }, [displayWidth, isMobile, isWeb]);

  // Aircraft position - responsive and centered
  const aircraftX = useMemo(() => displayWidth / 2, [displayWidth]);
  const aircraftY = useMemo(() => displayHeight / 2, [displayHeight]);

  // Responsive scaling factors
  const scaleFactor = useMemo(() => {
    if (isWeb) {
      return displayWidth / 1200; // Web'de 1200px'e göre scale
    }
    return isMobile ? 0.5 : 1; // Mobile'da 0.5x scale
  }, [displayWidth, isMobile, isWeb]);

  // Sample waypoints and airports - responsive positioning
  const waypoints = useMemo(() => [
    { name: "LTBA", type: "airport", x: aircraftX * 0.75, y: aircraftY * 0.57, distance: 25 },
    { name: "LTBJ", type: "airport", x: aircraftX * 1.25, y: aircraftY * 1.14, distance: 18 },
    { name: "LTFM", type: "airport", x: aircraftX * 0.67, y: aircraftY * 1.43, distance: 35 },
    { name: "WPT01", type: "waypoint", x: aircraftX * 0.87, y: aircraftY * 0.8, distance: 12 },
    { name: "WPT02", type: "waypoint", x: aircraftX * 1.13, y: aircraftY * 0.91, distance: 15 },
    { name: "VOR1", type: "vor", x: aircraftX * 0.58, y: aircraftY * 1.0, distance: 28 },
  ], [aircraftX, aircraftY]);

  // Sample traffic - responsive positioning
  const traffic = useMemo(() => [
    { callsign: "THY123", x: aircraftX * 0.8, y: aircraftY * 0.71, altitude: 37000, threat: "none" },
    { callsign: "BAW456", x: aircraftX * 1.2, y: aircraftY * 1.09, altitude: 36000, threat: "traffic" },
    { callsign: "DLH789", x: aircraftX * 0.92, y: aircraftY * 1.29, altitude: 38000, threat: "none" },
  ], [aircraftX, aircraftY]);

  // Flight plan route - responsive
  const flightPlan = useMemo(() => [
    { x: aircraftX, y: aircraftY },
    { x: aircraftX * 0.87, y: aircraftY * 0.8 },
    { x: aircraftX * 1.13, y: aircraftY * 0.91 },
    { x: aircraftX * 1.25, y: aircraftY * 1.14 },
  ], [aircraftX, aircraftY]);

  // Precomputed top chip set - responsive sizing
  const topChips = useMemo(() => [
    { label: 'NAV', width: Math.max(35, 70 * scaleFactor), fill: AVIATION_COLORS.DARK_BG, stroke: AVIATION_COLORS.BLUE, color: AVIATION_COLORS.BLUE },
    { label: `RNG ${range}NM`, width: Math.max(60, 120 * scaleFactor), fill: AVIATION_COLORS.SECONDARY_BG, stroke: AVIATION_COLORS.GREEN, color: AVIATION_COLORS.GREEN },
    { label: `HDG ${Math.round(heading).toString().padStart(3,'0')}°`, width: Math.max(70, 140 * scaleFactor), fill: AVIATION_COLORS.SECONDARY_BG, stroke: AVIATION_COLORS.GREEN, color: AVIATION_COLORS.GREEN },
    { label: weatherEnabled ? 'WXR ON' : 'WXR OFF', width: Math.max(60, 120 * scaleFactor), fill: AVIATION_COLORS.SECONDARY_BG, stroke: AVIATION_COLORS.YELLOW, color: AVIATION_COLORS.YELLOW },
    { label: tcasEnabled ? 'TCAS ON' : 'TCAS OFF', width: Math.max(70, 140 * scaleFactor), fill: AVIATION_COLORS.DARK_BG, stroke: AVIATION_COLORS.BLUE, color: AVIATION_COLORS.BLUE },
  ], [range, heading, weatherEnabled, tcasEnabled, scaleFactor]);

  // Responsive viewBox - web'de container boyutuna göre
  const viewBox = useMemo(() => {
    if (isWeb) {
      return `0 0 ${displayWidth} ${displayHeight}`;
    }
    return isMobile ? "0 0 600 350" : "0 0 1200 700";
  }, [displayWidth, displayHeight, isMobile, isWeb]);

  // Range rings calculation - responsive radius
  const renderRangeRings = useCallback(() => {
    const baseRadius = isWeb ? displayWidth * 0.058 : (isMobile ? 35 : 70);
    
    return [1, 2, 3, 4].map((ring) => {
      const radius = ring * baseRadius;
            return (
              <Circle
                key={ring}
                cx={aircraftX}
                cy={aircraftY}
                r={radius}
                fill="none"
          stroke={`rgba(0,255,0,${AVIATION_OPACITIES.MEDIUM})`}
          strokeWidth={Math.max(1, 2 * scaleFactor)}
                strokeDasharray="5,5"
              />
            );
    });
  }, [aircraftX, aircraftY, isMobile, isWeb, displayWidth, scaleFactor]);

  // Compass rose rendering - responsive
  const renderCompassRose = useCallback(() => {
    const compassRadius = isWeb ? displayWidth * 0.25 : (isMobile ? 150 : 300);
    const labelRadius = compassRadius * 1.05;
    
    return (
        <G transform={`translate(${aircraftX}, ${aircraftY})`}>
        {/* Outer compass ring */}
        <Circle 
          cx="0" 
          cy="0" 
          r={compassRadius} 
          fill="none" 
          stroke={AVIATION_COLORS.GREEN} 
          strokeWidth={Math.max(1, 2 * scaleFactor)} 
        />
          
          {/* Compass markings */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = i * 10;
            const radian = ((angle - 90) * Math.PI) / 180;
            const isMajor = angle % 30 === 0;
          const x1 = Math.cos(radian) * (compassRadius - 10);
          const y1 = Math.sin(radian) * (compassRadius - 10);
          const x2 = Math.cos(radian) * (isMajor ? compassRadius + 5 : compassRadius);
          const y2 = Math.sin(radian) * (isMajor ? compassRadius + 5 : compassRadius);
          
          return (
              <G key={angle}>
                <Line 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke={AVIATION_COLORS.GREEN} 
                strokeWidth={isMajor ? Math.max(2, 3 * scaleFactor) : Math.max(1, 2 * scaleFactor)} 
                />
                {isMajor && (
            <SvgText
                  x={Math.cos(radian) * labelRadius} 
                  y={Math.sin(radian) * labelRadius + 6} 
                  fill={AVIATION_COLORS.GREEN} 
                  fontSize={Math.max(10, 16 * scaleFactor)} 
                  fontFamily={AVIATION_FONTS.PRIMARY}
                    textAnchor="middle"
              fontWeight="bold"
            >
                    {angle.toString().padStart(3, '0')}
            </SvgText>
                )}
              </G>
          );
        })}
        </G>
    );
  }, [aircraftX, aircraftY, isMobile, isWeb, displayWidth, scaleFactor]);

  // Waypoint rendering - responsive
  const renderWaypoints = useCallback(() => {
    return waypoints.map((wp, index) => (
      <G key={`${wp.name}-${index}`}>
            {wp.type === "airport" && (
              <>
                <Polygon 
              points={`${wp.x},${wp.y-12*scaleFactor} ${wp.x+10*scaleFactor},${wp.y+8*scaleFactor} ${wp.x-10*scaleFactor},${wp.y+8*scaleFactor}`}
              fill={AVIATION_COLORS.BLUE} 
              stroke={AVIATION_COLORS.BLACK} 
              strokeWidth={Math.max(1, 2 * scaleFactor)} 
            />
            <SvgText
              x={wp.x}
              y={wp.y + 25 * scaleFactor} 
              fill={AVIATION_COLORS.BLUE}
              fontSize={Math.max(8, 12 * scaleFactor)} 
              fontFamily={AVIATION_FONTS.PRIMARY}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {wp.name}
                </SvgText>
              </>
            )}
            
            {wp.type === "waypoint" && (
              <>
                <Polygon 
              points={`${wp.x},${wp.y-8*scaleFactor} ${wp.x+8*scaleFactor},${wp.y} ${wp.x},${wp.y+8*scaleFactor} ${wp.x-8*scaleFactor},${wp.y}`}
              fill={AVIATION_COLORS.MAGENTA} 
              stroke={AVIATION_COLORS.BLACK} 
              strokeWidth={Math.max(1, 2 * scaleFactor)}
                />
                <SvgText 
                  x={wp.x} 
              y={wp.y + 20 * scaleFactor} 
              fill={AVIATION_COLORS.MAGENTA} 
              fontSize={Math.max(6, 10 * scaleFactor)} 
              fontFamily={AVIATION_FONTS.PRIMARY}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {wp.name}
                </SvgText>
              </>
            )}
            
            {wp.type === "vor" && (
              <>
            <Circle cx={wp.x} cy={wp.y} r={8 * scaleFactor} fill="none" stroke={AVIATION_COLORS.GREEN} strokeWidth={3 * scaleFactor} />
            <Line x1={wp.x-8*scaleFactor} y1={wp.y} x2={wp.x+8*scaleFactor} y2={wp.y} stroke={AVIATION_COLORS.GREEN} strokeWidth={2 * scaleFactor} />
            <Line x1={wp.x} y1={wp.y-8*scaleFactor} x2={wp.x} y2={wp.y+8*scaleFactor} stroke={AVIATION_COLORS.GREEN} strokeWidth={2 * scaleFactor} />
                <SvgText 
                  x={wp.x} 
              y={wp.y + 22 * scaleFactor} 
              fill={AVIATION_COLORS.GREEN} 
              fontSize={Math.max(6, 10 * scaleFactor)}
              fontFamily={AVIATION_FONTS.PRIMARY}
              textAnchor="middle"
                  fontWeight="bold"
            >
              {wp.name}
            </SvgText>
              </>
            )}
          </G>
    ));
  }, [waypoints, scaleFactor]);

  // Traffic rendering - responsive
  const renderTraffic = useCallback(() => {
    if (!tcasEnabled) return null;
    
    return traffic.map((t, index) => {
          const altDiff = Math.abs(t.altitude - altitude);
      const threatColor = t.threat === "traffic" ? AVIATION_COLORS.YELLOW : 
                         altDiff < 1000 ? AVIATION_COLORS.RED : AVIATION_COLORS.GREEN;
          
          return (
        <G key={`${t.callsign}-${index}`}>
              <Polygon 
            points={`${t.x},${t.y-6*scaleFactor} ${t.x+6*scaleFactor},${t.y+6*scaleFactor} ${t.x-6*scaleFactor},${t.y+6*scaleFactor}`}
                fill={threatColor} 
            stroke={AVIATION_COLORS.BLACK} 
            strokeWidth={1 * scaleFactor}
              />
              <SvgText 
            x={t.x + 15 * scaleFactor} 
            y={t.y - 5 * scaleFactor} 
                fill={threatColor} 
            fontSize={Math.max(5, 9 * scaleFactor)} 
            fontFamily={AVIATION_FONTS.PRIMARY}
                fontWeight="bold"
              >
                {t.callsign}
              </SvgText>
              <SvgText 
            x={t.x + 15 * scaleFactor} 
            y={t.y + 8 * scaleFactor} 
                fill={threatColor} 
            fontSize={Math.max(4, 8 * scaleFactor)} 
            fontFamily={AVIATION_FONTS.PRIMARY}
          >
            FL{Math.floor(t.altitude / 100)}
          </SvgText>
        </G>
      );
    });
  }, [traffic, altitude, tcasEnabled, scaleFactor]);

  // Weather radar rendering - responsive
  const renderWeatherRadar = useCallback(() => {
    if (!weatherEnabled) return null;
    
    const weatherData = [
      { x: aircraftX * 0.8, y: aircraftY * 0.57, r: 25 * scaleFactor, intensity: 'light' },
      { x: aircraftX * 1.2, y: aircraftY * 1.29, r: 35 * scaleFactor, intensity: 'heavy' },
      { x: aircraftX * 0.58, y: aircraftY * 1.14, r: 15 * scaleFactor, intensity: 'moderate' },
    ];
    
    return weatherData.map((weather, index) => {
      const color = weather.intensity === 'heavy' ? AVIATION_COLORS.RED : 
                   weather.intensity === 'moderate' ? AVIATION_COLORS.YELLOW : 
                   AVIATION_COLORS.GREEN;
      const opacity = weather.intensity === 'heavy' ? 0.4 : 
                     weather.intensity === 'moderate' ? 0.2 : 0.3;
      
      return (
        <Circle 
          key={`weather-${index}`}
          cx={weather.x} 
          cy={weather.y} 
          r={weather.r} 
          fill={`${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`} 
          stroke={color} 
          strokeWidth={2 * scaleFactor} 
        />
      );
    });
  }, [weatherEnabled, aircraftX, aircraftY, scaleFactor]);

  // Top information bar rendering - responsive
  const renderTopInfoBar = useCallback(() => {
    const barHeight = Math.max(25, 50 * scaleFactor);
    const chipHeight = Math.max(15, 30 * scaleFactor);
    const fontSize = Math.max(8, 12 * scaleFactor);
    
    let x = 16 * scaleFactor;
    const y = 3 * scaleFactor;
    const gap = 5 * scaleFactor;
    
    // Compute dynamic layout bounds
    const leftEnd = 16 * scaleFactor + topChips.reduce((sum, c) => sum + c.width, 0) + (topChips.length - 1) * gap;
    const rightChipWidth = Math.max(75, 150 * scaleFactor);
    const rightChipX = displayWidth - 20 * scaleFactor - rightChipWidth;
    const centerChipWidth = Math.max(150, 300 * scaleFactor);
    const centerChipX = leftEnd + ((rightChipX - leftEnd) - centerChipWidth) / 2;

    return (
      <G>
        {/* Background bar */}
        <Rect 
          x="0" 
          y="0" 
          width={displayWidth} 
          height={barHeight} 
          fill={AVIATION_COLORS.DARK_BG} 
          stroke={AVIATION_COLORS.BORDER_SECONDARY} 
          strokeWidth={2 * scaleFactor} 
        />
        
        {/* Left chips */}
        {topChips.map((c, i) => {
          const cx = x + c.width / 2;
          const node = (
            <G key={i}>
              <Rect 
                x={x} 
                y={y} 
                rx={AVIATION_DIMENSIONS.BORDER_RADIUS * scaleFactor} 
                ry={AVIATION_DIMENSIONS.BORDER_RADIUS * scaleFactor} 
                width={c.width} 
                height={chipHeight} 
                fill={c.fill} 
                stroke={c.stroke} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={cx} 
                y={y + (isMobile ? 12 : 20) * scaleFactor} 
                fill={c.color} 
                fontSize={fontSize} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle" 
                fontWeight="bold"
              >
                {c.label}
              </SvgText>
            </G>
          );
          x += c.width + gap;
          return node;
        })}
        
        {/* Center chip */}
        <G>
          <Rect 
            x={centerChipX} 
            y={y} 
            rx={AVIATION_DIMENSIONS.BORDER_RADIUS * scaleFactor} 
            ry={AVIATION_DIMENSIONS.BORDER_RADIUS * scaleFactor} 
            width={centerChipWidth} 
            height={chipHeight} 
            fill={AVIATION_COLORS.DARK_BG} 
            stroke={AVIATION_COLORS.BORDER_ACCENT} 
            strokeWidth={2 * scaleFactor} 
          />
          <SvgText 
            x={centerChipX + centerChipWidth / 2} 
            y={y + (isMobile ? 12 : 20) * scaleFactor} 
            fill={AVIATION_COLORS.WHITE} 
            fontSize={fontSize} 
            fontFamily={AVIATION_FONTS.PRIMARY} 
            textAnchor="middle" 
            fontWeight="bold"
          >
            ATC COMM ACTIVE
          </SvgText>
        </G>
        
        {/* Right chip */}
        <G>
          <Rect 
            x={rightChipX} 
            y={y} 
            rx={AVIATION_DIMENSIONS.BORDER_RADIUS * scaleFactor} 
            ry={AVIATION_DIMENSIONS.BORDER_RADIUS * scaleFactor} 
            width={rightChipWidth} 
            height={chipHeight} 
            fill={AVIATION_COLORS.SECONDARY_BG} 
            stroke={AVIATION_COLORS.GREEN} 
            strokeWidth={2 * scaleFactor} 
          />
          <SvgText 
            x={rightChipX + rightChipWidth / 2} 
            y={y + (isMobile ? 12 : 20) * scaleFactor} 
            fill={AVIATION_COLORS.GREEN} 
            fontSize={fontSize} 
            fontFamily={AVIATION_FONTS.PRIMARY} 
            textAnchor="middle"
          >
            FL{Math.floor(altitude / 100)}
          </SvgText>
        </G>
      </G>
    );
  }, [topChips, altitude, isMobile, scaleFactor, displayWidth]);

  return (
    <View style={[styles.container, { 
      minHeight: isMobile ? 200 : 400,
      width: '100%',
      aspectRatio: isWeb ? 1200/700 : undefined // Web'de aspect ratio koru
    }]}>
      {/* Professional Navigation Display */}
      <Svg 
        width="100%" 
        height="100%" 
        viewBox={viewBox} 
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        <Defs>
          {/* Screen gradient */}
          <RadialGradient id="screenGradient" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor={AVIATION_COLORS.DARK_BG} />
            <Stop offset="100%" stopColor={AVIATION_COLORS.BLACK} />
          </RadialGradient>
          
          {/* Range rings gradient */}
          <RadialGradient id="rangeGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={`rgba(0,255,0,${AVIATION_OPACITIES.LOW})`} />
            <Stop offset="100%" stopColor={`rgba(0,255,0,${AVIATION_OPACITIES.LOW / 2})`} />
          </RadialGradient>
        </Defs>

        {/* Background */}
        <Rect x="0" y="0" width={displayWidth} height={displayHeight} fill={AVIATION_COLORS.BLACK} />
        <Rect 
          x="5 * scaleFactor" 
          y="5 * scaleFactor" 
          width={displayWidth - 10 * scaleFactor} 
          height={displayHeight - 10 * scaleFactor} 
          fill="url(#screenGradient)" 
          stroke={AVIATION_COLORS.BORDER_PRIMARY} 
          strokeWidth={2 * scaleFactor} 
          rx="25 * scaleFactor" 
        />

        {/* Range Rings */}
        {renderRangeRings()}

        {/* Compass Rose */}
        {renderCompassRose()}

        {/* Flight Plan Route */}
        <Path 
          d={`M ${flightPlan.map(p => `${p.x},${p.y}`).join(' L ')}`}
          fill="none" 
          stroke={AVIATION_COLORS.MAGENTA} 
          strokeWidth={3 * scaleFactor}
          strokeDasharray="10,5"
        />

        {/* Waypoints */}
        {renderWaypoints()}
        
        {/* Traffic (TCAS) */}
        {renderTraffic()}

        {/* Weather Radar */}
        {renderWeatherRadar()}

        {/* Aircraft Symbol (Center) */}
        <G transform={`translate(${aircraftX}, ${aircraftY})`}>
          {/* Aircraft outline */}
          <Polygon 
            points={`0,${-15*scaleFactor} ${8*scaleFactor},${10*scaleFactor} ${4*scaleFactor},${10*scaleFactor} ${4*scaleFactor},${15*scaleFactor} ${-4*scaleFactor},${15*scaleFactor} ${-4*scaleFactor},${10*scaleFactor} ${-8*scaleFactor},${10*scaleFactor}`}
            fill={AVIATION_COLORS.WHITE} 
            stroke={AVIATION_COLORS.BLACK} 
            strokeWidth={2 * scaleFactor}
          />
          <Circle cx="0" cy="0" r={3 * scaleFactor} fill={AVIATION_COLORS.WHITE} />
        </G>

        {/* Top Information Bar */}
        {renderTopInfoBar()}

        {/* Bottom Information Panel */}
        <Rect 
          x="0" 
          y={displayHeight - Math.max(25, 50 * scaleFactor)} 
          width={displayWidth} 
          height={Math.max(25, 50 * scaleFactor)} 
          fill={AVIATION_COLORS.DARK_BG} 
          stroke={AVIATION_COLORS.BORDER_SECONDARY} 
          strokeWidth={2 * scaleFactor} 
        />
        
        {/* Bottom chips - responsive */}
        {!isMobile && (
          <G>
            {/* GS Chip */}
            <G>
              <Rect 
                x={16 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 4 * scaleFactor} 
                rx={10 * scaleFactor} 
                ry={10 * scaleFactor} 
                width={140 * scaleFactor} 
                height={30 * scaleFactor} 
                fill={AVIATION_COLORS.SECONDARY_BG} 
                stroke={AVIATION_COLORS.GREEN} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={86 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 20 * scaleFactor} 
                fill={AVIATION_COLORS.GREEN} 
                fontSize={12 * scaleFactor} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle"
              >
                GS {Math.round(speed)} KT
              </SvgText>
            </G>
            
            {/* TRK Chip */}
            <G>
              <Rect 
                x={170 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 4 * scaleFactor} 
                rx={10 * scaleFactor} 
                ry={10 * scaleFactor} 
                width={150 * scaleFactor} 
                height={30 * scaleFactor} 
                fill={AVIATION_COLORS.DARK_BG} 
                stroke={AVIATION_COLORS.BLUE} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={245 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 20 * scaleFactor} 
                fill={AVIATION_COLORS.BLUE} 
                fontSize={12 * scaleFactor} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle"
              >
                TRK {heading.toString().padStart(3,'0')}°
              </SvgText>
            </G>
            
            {/* NEXT WPT Chip */}
            <G>
              <Rect 
                x={330 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 4 * scaleFactor} 
                rx={10 * scaleFactor} 
                ry={10 * scaleFactor} 
                width={220 * scaleFactor} 
                height={30 * scaleFactor} 
                fill={AVIATION_COLORS.SECONDARY_BG} 
                stroke={AVIATION_COLORS.MAGENTA} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={440 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 20 * scaleFactor} 
                fill={AVIATION_COLORS.MAGENTA} 
                fontSize={12 * scaleFactor} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle"
              >
                NEXT WPT02 15NM
              </SvgText>
            </G>
            
            {/* ETA Chip */}
            <G>
              <Rect 
                x={560 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 4 * scaleFactor} 
                rx={10 * scaleFactor} 
                ry={10 * scaleFactor} 
                width={160 * scaleFactor} 
                height={30 * scaleFactor} 
                fill={AVIATION_COLORS.SECONDARY_BG} 
                stroke={AVIATION_COLORS.YELLOW} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={640 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 20 * scaleFactor} 
                fill={AVIATION_COLORS.YELLOW} 
                fontSize={12 * scaleFactor} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle"
              >
                ETA 14:25Z
              </SvgText>
            </G>
            
            {/* COM Chip */}
            <G>
              <Rect 
                x={740 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 4 * scaleFactor} 
                rx={10 * scaleFactor} 
                ry={10 * scaleFactor} 
                width={220 * scaleFactor} 
                height={30 * scaleFactor} 
                fill={AVIATION_COLORS.DARK_BG} 
                stroke={AVIATION_COLORS.BORDER_ACCENT} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={850 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 20 * scaleFactor} 
                fill={AVIATION_COLORS.WHITE} 
                fontSize={12 * scaleFactor} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle" 
                fontWeight="bold"
              >
                COM1 118.10  STBY 121.80
              </SvgText>
            </G>
            
            {/* LNAV VNAV Chip */}
            <G>
              <Rect 
                x={980 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 4 * scaleFactor} 
                rx={10 * scaleFactor} 
                ry={10 * scaleFactor} 
                width={200 * scaleFactor} 
                height={30 * scaleFactor} 
                fill={AVIATION_COLORS.SECONDARY_BG} 
                stroke={AVIATION_COLORS.GREEN} 
                strokeWidth={2 * scaleFactor} 
              />
              <SvgText 
                x={1080 * scaleFactor} 
                y={displayHeight - Math.max(25, 50 * scaleFactor) + 20 * scaleFactor} 
                fill={AVIATION_COLORS.GREEN} 
                fontSize={12 * scaleFactor} 
                fontFamily={AVIATION_FONTS.PRIMARY} 
                textAnchor="middle"
              >
                LNAV  VNAV
              </SvgText>
            </G>
          </G>
        )}

        {/* Range Scale */}
        <G transform={`translate(${25 * scaleFactor}, ${displayHeight / 2})`}>
          <Rect 
            x="0" 
            y={-40 * scaleFactor} 
            width={40 * scaleFactor} 
            height={80 * scaleFactor} 
            fill="rgba(0,0,0,0.7)" 
            stroke={AVIATION_COLORS.BORDER_SECONDARY} 
            strokeWidth={2 * scaleFactor} 
            rx={8 * scaleFactor} 
          />
          <SvgText 
            x={20 * scaleFactor} 
            y={-20 * scaleFactor} 
            fill={AVIATION_COLORS.GREEN} 
            fontSize={8 * scaleFactor} 
            fontFamily={AVIATION_FONTS.PRIMARY} 
            textAnchor="middle" 
            fontWeight="bold"
          >
            RANGE
          </SvgText>
          <SvgText 
            x={20 * scaleFactor} 
            y={0} 
            fill={AVIATION_COLORS.WHITE} 
            fontSize={16 * scaleFactor} 
            fontFamily={AVIATION_FONTS.PRIMARY} 
            textAnchor="middle" 
            fontWeight="bold"
          >
            {range}
          </SvgText>
          <SvgText 
            x={20 * scaleFactor} 
            y={20 * scaleFactor} 
            fill={AVIATION_COLORS.GREEN} 
            fontSize={8 * scaleFactor} 
            fontFamily={AVIATION_FONTS.PRIMARY} 
            textAnchor="middle"
          >
            NM
          </SvgText>
        </G>

        {/* Mode Selector */}
        <G transform={`translate(${displayWidth - 75 * scaleFactor}, ${displayHeight / 2})`}>
          {(() => {
            const panelWidth = 60 * scaleFactor;
            const panelHeight = 65 * scaleFactor;
            const panelX = 0;
            const panelY = -panelHeight / 2;
            const padding = 6 * scaleFactor;
            const buttonWidth = panelWidth - padding * 2;
            const buttonHeight = 12 * scaleFactor;
            const buttonRadius = 3 * scaleFactor;
            const gap = 5 * scaleFactor;
            const titleY = panelY + 10 * scaleFactor;
            const firstButtonY = panelY + 17 * scaleFactor;
            const centerX = panelX + panelWidth / 2;
            const buttonX = panelX + padding;

            return (
              <G>
                <Rect 
                  x={panelX} 
                  y={panelY} 
                  width={panelWidth} 
                  height={panelHeight} 
                  fill="rgba(0,0,0,0.7)" 
                  stroke={AVIATION_COLORS.BORDER_ACCENT} 
                  strokeWidth={2 * scaleFactor} 
                  rx={10 * scaleFactor} 
                />
                <SvgText 
                  x={centerX} 
                  y={titleY} 
                  fill={AVIATION_COLORS.GREEN} 
                  fontSize={8 * scaleFactor} 
                  fontFamily={AVIATION_FONTS.PRIMARY} 
                  textAnchor="middle" 
                  fontWeight="bold"
                >
                  MODE
                </SvgText>

                {/* PLAN (active) */}
                <Rect 
                  x={buttonX} 
                  y={firstButtonY} 
                  width={buttonWidth} 
                  height={buttonHeight} 
                  fill={AVIATION_COLORS.MAGENTA} 
                  stroke={AVIATION_COLORS.MAGENTA} 
                  strokeWidth={1.5 * scaleFactor} 
                  rx={buttonRadius} 
                />
                <SvgText 
                  x={centerX} 
                  y={firstButtonY + 8 * scaleFactor} 
                  fill={AVIATION_COLORS.BLACK} 
                  fontSize={8 * scaleFactor} 
                  fontFamily={AVIATION_FONTS.PRIMARY} 
                  textAnchor="middle" 
                  fontWeight="bold"
                >
                  PLAN
                </SvgText>

                {/* MAP */}
                <Rect 
                  x={buttonX} 
                  y={firstButtonY + buttonHeight + gap} 
                  width={buttonWidth} 
                  height={buttonHeight} 
                  fill={AVIATION_COLORS.DARK_BG} 
                  stroke={AVIATION_COLORS.BORDER_SECONDARY} 
                  strokeWidth={1.5 * scaleFactor} 
                  rx={buttonRadius} 
                />
                <SvgText 
                  x={centerX} 
                  y={firstButtonY + buttonHeight + gap + 8 * scaleFactor} 
                  fill={AVIATION_COLORS.WHITE} 
                  fontSize={8 * scaleFactor} 
                  fontFamily={AVIATION_FONTS.PRIMARY} 
                  textAnchor="middle"
                >
                  MAP
                </SvgText>

                {/* ROSE */}
                <Rect 
                  x={buttonX} 
                  y={firstButtonY + (buttonHeight + gap) * 2} 
                  width={buttonWidth} 
                  height={buttonHeight} 
                  fill={AVIATION_COLORS.DARK_BG} 
                  stroke={AVIATION_COLORS.BORDER_SECONDARY} 
                  strokeWidth={1.5 * scaleFactor} 
                  rx={buttonRadius} 
                />
                <SvgText 
                  x={centerX} 
                  y={firstButtonY + (buttonHeight + gap) * 2 + 8 * scaleFactor} 
                  fill={AVIATION_COLORS.WHITE} 
                  fontSize={8 * scaleFactor} 
                  fontFamily={AVIATION_FONTS.PRIMARY} 
                  textAnchor="middle"
                >
                  ROSE
                </SvgText>
              </G>
            );
          })()}
        </G>
      </Svg>
      
      {/* Professional Data Display */}
      <View style={[styles.dataPanel, { 
        paddingVertical: isMobile ? 4 : 8,
        paddingHorizontal: isMobile ? 4 : 8
      }]}>
        <View style={styles.dataGroup}>
          <Text style={[styles.dataLabel, { fontSize: isMobile ? 7 : 9 }]}>WPT</Text>
          <Text style={[styles.dataValue, { fontSize: isMobile ? 9 : 11 }]}>WPT02</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={[styles.dataLabel, { fontSize: isMobile ? 7 : 9 }]}>DTK</Text>
          <Text style={[styles.dataValue, { fontSize: isMobile ? 9 : 11 }]}>085°</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={[styles.dataLabel, { fontSize: isMobile ? 7 : 9 }]}>DIS</Text>
          <Text style={[styles.dataValue, { fontSize: isMobile ? 9 : 11 }]}>15.2</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={[styles.dataLabel, { fontSize: isMobile ? 7 : 9 }]}>ETE</Text>
          <Text style={[styles.dataValue, { fontSize: isMobile ? 9 : 11 }]}>00:12</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={[styles.dataLabel, { fontSize: isMobile ? 7 : 9 }]}>XTK</Text>
          <Text style={[styles.dataValue, { fontSize: isMobile ? 9 : 11 }]}>0.1L</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AVIATION_COLORS.DARK_BG,
    margin: 0,
    marginVertical: 8,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: AVIATION_COLORS.BORDER_PRIMARY,
    shadowColor: AVIATION_COLORS.BLACK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    minHeight: 400,
    width: '100%',
  },
  dataPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: AVIATION_COLORS.SECONDARY_BG,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 3,
    borderTopColor: AVIATION_COLORS.BORDER_ACCENT,
  },
  dataGroup: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    color: AVIATION_COLORS.BORDER_ACCENT,
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: AVIATION_FONTS.PRIMARY,
  },
  dataValue: {
    color: AVIATION_COLORS.GREEN,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: AVIATION_FONTS.PRIMARY,
  },
});