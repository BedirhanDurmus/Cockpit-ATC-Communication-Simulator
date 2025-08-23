import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, useColorScheme, Platform, TouchableOpacity } from "react-native";
import Svg, { 
  Line, Path, Text as SvgText, G, Rect, Circle, Polygon, 
  Defs, LinearGradient, Stop, ClipPath, RadialGradient, Filter, 
  Ellipse
} from "react-native-svg";
import { AVIATION_COLORS, AVIATION_DIMENSIONS, AVIATION_FONTS, AVIATION_OPACITIES } from '../constants/aviation';

interface PrimaryFlightDisplayProps {
  altitude: number;
  heading: number;
  speed: number;
  verticalSpeed: number;
}

export default function PrimaryFlightDisplay({
  altitude,
  heading,
  speed,
  verticalSpeed,
}: PrimaryFlightDisplayProps) {
  const [pitch, setPitch] = useState(2);
  const [roll, setRoll] = useState(-1);
  const [targetAltitude, setTargetAltitude] = useState(18000);
  const [targetSpeed, setTargetSpeed] = useState(250);
  const [glideslope, setGlideslope] = useState(0);
  const [localizer, setLocalizer] = useState(0.5);
  const [selectedSpeed, setSelectedSpeed] = useState(250);
  const [selectedHeading, setSelectedHeading] = useState(270);

  // Smooth animation targets for more professional motion
  const [targetPitch, setTargetPitch] = useState(2);
  const [targetRoll, setTargetRoll] = useState(-1);
  const [targetGlideslope, setTargetGlideslope] = useState(0);
  const [targetLocalizer, setTargetLocalizer] = useState(0.5);

  const targetsRef = useRef({
    pitch: 2,
    roll: -1,
    glideslope: 0,
    localizer: 0.5,
  });

  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  // Responsive dimensions
  const { width: screenWidth } = Dimensions.get('window');
  const isMobile = screenWidth < 768;
  
  const displayWidth = useMemo(() => isMobile ? 400 : 800, [isMobile]);
  const displayHeight = useMemo(() => isMobile ? 350 : 700, [isMobile]);

  useEffect(() => {
    targetsRef.current = {
      pitch: targetPitch,
      roll: targetRoll,
      glideslope: targetGlideslope,
      localizer: targetLocalizer,
    };
  }, [targetPitch, targetRoll, targetGlideslope, targetLocalizer]);

  // Simulated input updates for targets (slowly varying) - optimized
  useEffect(() => {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const interval = setInterval(() => {
      setTargetPitch(prev => clamp(prev + (Math.random() - 0.5) * 1.6, -8, 8));
      setTargetRoll(prev => clamp(prev + (Math.random() - 0.5) * 2.0, -12, 12));
      setTargetGlideslope(prev => clamp(prev + (Math.random() - 0.5) * 0.5, -2, 2));
      setTargetLocalizer(prev => clamp(prev + (Math.random() - 0.5) * 0.4, -2, 2));
      // Simulate pilot selections slightly drifting
      setSelectedSpeed(prev => clamp(prev + (Math.random() - 0.5) * 4, 120, 480));
      setSelectedHeading(prev => (prev + (Math.random() - 0.5) * 4 + 360) % 360);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Smoothly interpolate current values toward targets every frame - optimized with throttling
  useEffect(() => {
    const animate = (timestamp: number) => {
      // Throttle to 30 FPS for better performance
      if (timestamp - lastUpdateRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastUpdateRef.current = timestamp;
      
      const t = targetsRef.current;
      setPitch(p => p + (t.pitch - p) * 0.12);
      setRoll(r => r + (t.roll - r) * 0.14);
      setGlideslope(g => g + (t.glideslope - g) * 0.12);
      setLocalizer(l => l + (t.localizer - l) * 0.12);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const colorScheme = useColorScheme();
  const [manualDim, setManualDim] = useState<null | boolean>(null);
  const dimMode = (manualDim === null) ? (colorScheme === 'dark') : manualDim;
  const uiFont = Platform.select({ ios: 'System', android: 'sans-serif' }) || 'System';
  
  // Constants
  const stallSpeed = 120;
  const overspeed = 460;
  const flightLevel = Math.floor(altitude / 100);
  const machNumber = (speed * 0.00147).toFixed(3);
  const baroSetting = 29.92;
  const radioAlt = Math.max(0, altitude - 1500); // Decision Height simulation
  const decisionAltitude = 200;

  // Memoized calculations
  const speedScaleData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const speedValue = Math.round((speed - 95) + (i * 10));
      const y = 140 + (i * 19);
      const isMainTick = speedValue % 20 === 0;
      const isCurrent = Math.abs(speedValue - speed) < 12;
      
      if (speedValue < 0) return null;
      
      return (
        <G key={i}>
          {/* Background for current speed area */}
          {isCurrent && (
            <Rect 
              x="15" 
              y={y - 10} 
              width="150" 
              height="20" 
              fill="rgba(0,255,0,0.1)" 
            />
          )}
          
          {/* Tick marks */}
          <Line 
            x1={isMainTick ? "20" : "30"} 
            y1={y} 
            x2="65" 
            y2={y} 
            stroke={isCurrent ? AVIATION_COLORS.GREEN : AVIATION_COLORS.WHITE} 
            strokeWidth={isMainTick ? "3" : "2"} 
          />
          
          {/* Speed values */}
          {isMainTick && (
            <SvgText 
              x="75" 
              y={y + 6} 
              fill={isCurrent ? AVIATION_COLORS.GREEN : AVIATION_COLORS.WHITE} 
              fontSize="16" 
              fontFamily={AVIATION_FONTS.PRIMARY}
              fontWeight="bold"
              textAnchor="start"
            >
            {speedValue}
            </SvgText>
          )}
        </G>
      );
    });
  }, [speed]);

  const overspeedBand = useMemo(() => {
    const mapYFromSpeed = (S: number) => 140 + ((S - (speed - 95)) / 10) * 19;
    const top = 120;
    const bottom = 500;
    const yStall = mapYFromSpeed(stallSpeed);
    const yOver = mapYFromSpeed(overspeed);
    return (
      <>
        {/* Stall (low speed zone) */}
        {yStall < bottom && (
          <Rect x="15" y={Math.max(top, yStall)} width="150" height={Math.max(0, bottom - Math.max(top, yStall))} fill="rgba(255,0,0,0.12)" />
        )}
        {/* Overspeed (high speed zone) */}
        {yOver > top && (
          <Rect x="15" y={top} width="150" height={Math.max(0, Math.min(bottom, yOver) - top)} fill="rgba(255,165,0,0.12)" />
        )}
      </>
    );
  }, [speed, stallSpeed, overspeed]);

  const vSpeedBugs = useMemo(() => {
    // V1 Speed
    const v1Y = 305 + (selectedSpeed - speed) * 1.9;
    return (
      <>
        <Polygon points="165,280 175,285 175,275" fill={AVIATION_COLORS.MAGENTA} stroke={AVIATION_COLORS.BLACK} strokeWidth="1" />
        <SvgText x="180" y="285" fill={AVIATION_COLORS.MAGENTA} fontSize="12" fontWeight="bold">V1</SvgText>
        
        {/* VR Speed */}
        <Polygon points="165,300 175,305 175,295" fill={AVIATION_COLORS.BLUE} stroke={AVIATION_COLORS.BLACK} strokeWidth="1" />
        <SvgText x="180" y="305" fill={AVIATION_COLORS.BLUE} fontSize="12" fontWeight="bold">VR</SvgText>
      </>
    );
  }, [selectedSpeed, speed]);

  const machNumberDisplay = useMemo(() => (
    <G>
      <Rect x="15" y="60" width="150" height="40" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="8" />
      <SvgText x="90" y="85" fill={AVIATION_COLORS.BLUE} fontSize="18" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        M{machNumber.slice(2)}
      </SvgText>
    </G>
  ), [machNumber]);

  const altitudeScaleData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const altValue = Math.round((altitude - 950) + (i * 100));
      const y = 140 + (i * 19);
      const isMainTick = altValue % 200 === 0;
      const isCurrent = Math.abs(altValue - altitude) < 120;
      
      return (
        <G key={i}>
          {/* Background for current altitude area */}
          {isCurrent && (
            <Rect 
              x="635" 
              y={y - 10} 
              width="150" 
              height="20" 
              fill="rgba(0,255,0,0.1)" 
            />
          )}
          
          {/* Tick marks */}
          <Line 
            x1="720" 
            y1={y} 
            x2={isMainTick ? "780" : "770"} 
            y2={y} 
            stroke={isCurrent ? AVIATION_COLORS.GREEN : AVIATION_COLORS.WHITE} 
            strokeWidth={isMainTick ? "3" : "2"} 
          />
          
          {/* Altitude values */}
          {isMainTick && (
            <SvgText 
              x="710" 
              y={y + 6} 
              fill={isCurrent ? AVIATION_COLORS.GREEN : AVIATION_COLORS.WHITE} 
              fontSize="16" 
              fontFamily={AVIATION_FONTS.PRIMARY}
              fontWeight="bold"
              textAnchor="end"
            >
              {altValue}
            </SvgText>
          )}
        </G>
      );
    });
  }, [altitude]);

  const targetAltitudeBug = useMemo(() => (
    <Polygon 
      points={`630,${290 + (targetAltitude - altitude) * 0.019} 620,${295 + (targetAltitude - altitude) * 0.019} 620,${285 + (targetAltitude - altitude) * 0.019}`}
      fill={AVIATION_COLORS.MAGENTA} 
      stroke={AVIATION_COLORS.BLACK}
      strokeWidth="2"
    />
  ), [targetAltitude, altitude]);

  const currentAltitudeDigitalReadout = useMemo(() => (
    <G>
      <Rect x="637" y="292" width="155" height="45" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.GREEN} strokeWidth="3" rx="8" />
      <Rect x="640" y="295" width="145" height="35" fill="url(#instrumentGlow)" rx="5" />
      <SvgText x="712" y="320" fill={AVIATION_COLORS.GREEN} fontSize="28" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        {Math.round(altitude)}
      </SvgText>
    </G>
  ), [altitude]);

  const barometricSetting = useMemo(() => (
    <G>
      <Rect x="635" y="350" width="150" height="30" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="5" />
      <SvgText x="710" y="370" fill={AVIATION_COLORS.BLUE} fontSize="14" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        {baroSetting.toFixed(2)}
      </SvgText>
    </G>
  ), [baroSetting]);

  const radioAltitude = useMemo(() => (
    <G>
      <Rect x="635" y="385" width="150" height="30" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="5" />
      <SvgText x="710" y="405" fill={AVIATION_COLORS.YELLOW} fontSize="14" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        RA {Math.round(radioAlt)}
      </SvgText>
    </G>
  ), [radioAlt]);

  const flightLevelDisplay = useMemo(() => (
    <G>
      <Rect x="635" y="60" width="150" height="40" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="8" />
      <SvgText x="710" y="85" fill={AVIATION_COLORS.BLUE} fontSize="18" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        FL{flightLevel}
      </SvgText>
    </G>
  ), [flightLevel]);

  const attitudeIndicator = useMemo(() => {
    return (
      <G clipPath="url(#attitudeClip)">
        <G transform={`translate(400, 310) rotate(${roll}) translate(-400, -310)`}>
          {/* Sky with Enhanced Gradient - expanded slightly to avoid seams when rotating */}
          <Rect 
            x="170" 
            y={100 - pitch * 12} 
            width="460" 
            height={230 + pitch * 12} 
            fill="url(#skyGradient)" 
          />
          
          {/* Ground with Enhanced Gradient */}
          <Rect 
            x="170" 
            y={300 - pitch * 12} 
            width="460" 
            height={230 + pitch * 12} 
            fill="url(#groundGradient)" 
          />

          {/* Enhanced Horizon Line with Shadow Effect */}
          <Line 
            x1="180" 
            y1={310 - pitch * 12 + 2} 
            x2="620" 
            y2={310 - pitch * 12 + 2} 
            stroke={AVIATION_COLORS.BROWN} 
            strokeWidth="7" 
            opacity="0.4"
          />
          <Line 
            x1="180" 
            y1={310 - pitch * 12} 
            x2="620" 
            y2={310 - pitch * 12} 
            stroke={AVIATION_COLORS.GOLD} 
            strokeWidth="7"
          />

          {/* Ultra-Enhanced Pitch Scale */}
          {[-30, -20, -10, -5, 5, 10, 20, 30].map((pitchValue) => {
            const y = 310 - pitchValue * 12 - pitch * 12;
            const lineLength = Math.abs(pitchValue) === 10 || Math.abs(pitchValue) === 20 ? 100 : 70;
            const startX = 400 - lineLength / 2;
            const endX = 400 + lineLength / 2;
            const isMinor = Math.abs(pitchValue) === 5;
            
            return (
              <G key={pitchValue}>
                {/* Pitch line */}
                {/* Shadow for major pitch lines */}
                {!isMinor && (
                  <Line 
                    x1={startX} 
                    y1={y + 1} 
                    x2={endX} 
                    y2={y + 1} 
                    stroke={AVIATION_COLORS.BLACK} 
                    strokeWidth="4" 
                    opacity="0.3"
                  />
                )}
                <Line 
                  x1={startX} 
                  y1={y} 
                  x2={endX} 
                  y2={y} 
                  stroke={AVIATION_COLORS.WHITE} 
                  strokeWidth={isMinor ? "3" : "5"}
                />
                
                {/* Pitch value labels */}
                {!isMinor && (
                  <>
                    {/* Shadow for text */}
                    <SvgText 
                      x={startX - 29} 
                      y={y + 8} 
                      fill={AVIATION_COLORS.BLACK} 
                      fontSize="22" 
                      fontFamily={AVIATION_FONTS.PRIMARY}
                      fontWeight="bold"
                      opacity="0.4"
                    >
                      {Math.abs(pitchValue)}
                    </SvgText>
                    <SvgText 
                      x={startX - 30} 
                      y={y + 7} 
                      fill={AVIATION_COLORS.WHITE} 
                      fontSize="22" 
                      fontFamily={AVIATION_FONTS.PRIMARY}
                      fontWeight="bold"
                    >
                      {Math.abs(pitchValue)}
                    </SvgText>
                    {/* Shadow for right text */}
                    <SvgText 
                      x={endX + 16} 
                      y={y + 8} 
                      fill={AVIATION_COLORS.BLACK} 
                      fontSize="22" 
                      fontFamily={AVIATION_FONTS.PRIMARY}
                      fontWeight="bold"
                      opacity="0.4"
                    >
                  {Math.abs(pitchValue)}
                </SvgText>
                    <SvgText 
                      x={endX + 15} 
                      y={y + 7} 
                      fill={AVIATION_COLORS.WHITE} 
                      fontSize="22" 
                      fontFamily={AVIATION_FONTS.PRIMARY}
                      fontWeight="bold"
                    >
                  {Math.abs(pitchValue)}
                </SvgText>
                  </>
                )}
              </G>
            );
          })}

          {/* Flight Path Vector (FPV) */}
          {(() => {
            const ktsToFtPerSec = 1.68781;
            const vsFtPerSec = verticalSpeed / 60;
            const tasFtPerSec = Math.max(1, speed * ktsToFtPerSec);
            const fpaDeg = Math.atan2(vsFtPerSec, tasFtPerSec) * (180 / Math.PI);
            const y = 310 - fpaDeg * 12; // 1 deg ~ 12px
            const x = 400; // no lateral drift modeled
            return (
              <G>
                <Circle cx={x} cy={y} r="6" fill={AVIATION_COLORS.GREEN} opacity="0.2" />
                <Circle cx={x} cy={y} r="2" fill={AVIATION_COLORS.GREEN} />
                <Line x1={x - 14} y1={y} x2={x - 2} y2={y} stroke={AVIATION_COLORS.GREEN} strokeWidth="2" />
                <Line x1={x + 2} y1={y} x2={x + 14} y2={y} stroke={AVIATION_COLORS.GREEN} strokeWidth="2" />
                <Line x1={x} y1={y + 10} x2={x} y2={y + 18} stroke={AVIATION_COLORS.GREEN} strokeWidth="2" />
              </G>
            );
          })()}
        </G>
      </G>
    );
  }, [pitch, roll, verticalSpeed, speed]);

  const attitudeIndicatorFrame = useMemo(() => (
    <G>
      <Rect x="180" y="120" width="440" height="380" fill="none" stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="4" rx="20" />
      <Rect x="185" y="125" width="430" height="370" fill="none" stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="15" />
    </G>
  ), []);

  const aircraftSymbol = useMemo(() => (
    <G>
      {/* Main wings - Ultra thick and prominent */}
      <Line x1="300" y1="310" x2="500" y2="310" stroke={AVIATION_COLORS.GOLD} strokeWidth="12" />
      <Line x1="300" y1="310" x2="500" y2="310" stroke={AVIATION_COLORS.ORANGE} strokeWidth="8" />
      
      {/* Center fuselage */}
      <Ellipse cx="400" cy="310" rx="12" ry="8" fill={AVIATION_COLORS.GOLD} stroke={AVIATION_COLORS.BLACK} strokeWidth="3" />
      
      {/* Nose pointer - Larger and more visible */}
      <Polygon points="400,285 415,305 385,305" fill={AVIATION_COLORS.GOLD} stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      
      {/* Wing ends - More prominent */}
      <Rect x="285" y="305" width="20" height="10" fill={AVIATION_COLORS.GOLD} stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      <Rect x="495" y="305" width="20" height="10" fill={AVIATION_COLORS.GOLD} stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      
      {/* Center reference dot */}
      <Circle cx="400" cy="310" r="8" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.GOLD} strokeWidth="3" />
      <Circle cx="400" cy="310" r="4" fill={AVIATION_COLORS.GOLD} />
    </G>
  ), []);

  const bankAngleScale = useMemo(() => (
    <G transform="translate(400, 220)">
      {/* Bank angle arc */}
      <Path 
        d="M -80 0 A 80 80 0 0 1 80 0" 
        fill="none" 
        stroke={AVIATION_COLORS.WHITE} 
        strokeWidth="3"
      />
      
      {/* Bank angle markers */}
      {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map((angle) => {
        const radian = (angle * Math.PI) / 180;
        const x1 = Math.sin(radian) * 75;
        const y1 = -Math.cos(radian) * 75;
        const x2 = Math.sin(radian) * (Math.abs(angle) % 30 === 0 ? 95 : 85);
        const y2 = -Math.cos(radian) * (Math.abs(angle) % 30 === 0 ? 95 : 85);
        
        return (
          <G key={angle}>
            {/* Shadow for bank markers */}
            <Line 
              x1={x1 + 1} 
              y1={y1 + 1} 
              x2={x2 + 1} 
              y2={y2 + 1} 
              stroke={AVIATION_COLORS.BLACK} 
              strokeWidth={Math.abs(angle) % 30 === 0 ? "5" : "3"} 
              opacity="0.3"
            />
            <Line 
              x1={x1} 
              y1={y1} 
              x2={x2} 
              y2={y2} 
              stroke={AVIATION_COLORS.WHITE} 
              strokeWidth={Math.abs(angle) % 30 === 0 ? "5" : "3"}
            />
              {Math.abs(angle) % 30 === 0 && angle !== 0 && (
                <SvgText 
                  x={Math.sin(radian) * 110} 
                  y={-Math.cos(radian) * 110 + 6} 
                  fill={AVIATION_COLORS.WHITE} 
                  fontSize="16" 
                  fontFamily={AVIATION_FONTS.PRIMARY}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {Math.abs(angle)}
                </SvgText>
              )}
              </G>
            );
          })}
          
        {/* Bank angle indicator - Enhanced */}
        {/* Shadow for bank indicator */}
        <Polygon 
          points={`${Math.sin((roll * Math.PI) / 180) * 75 + 1}, ${-Math.cos((roll * Math.PI) / 180) * 75 + 1} ${Math.sin((roll * Math.PI) / 180) * 95 + 1}, ${-Math.cos((roll * Math.PI) / 180) * 95 + 1} ${Math.sin((roll * Math.PI) / 180) * 75 + 13}, ${-Math.cos((roll * Math.PI) / 180) * 75 + 1}`}
          fill={AVIATION_COLORS.BLACK} 
          opacity="0.3"
        />
        <Polygon 
          points={`${Math.sin((roll * Math.PI) / 180) * 75}, ${-Math.cos((roll * Math.PI) / 180) * 75} ${Math.sin((roll * Math.PI) / 180) * 95}, ${-Math.cos((roll * Math.PI) / 180) * 95} ${Math.sin((roll * Math.PI) / 180) * 75 + 12}, ${-Math.cos((roll * Math.PI) / 180) * 75}`}
          fill={AVIATION_COLORS.GOLD} 
          stroke={AVIATION_COLORS.BLACK}
          strokeWidth="3"
        />
      </G>
    ), [roll]);

  const ilsLocalizerScale = useMemo(() => (
    <G transform="translate(400, 480)">
      <Rect x="-80" y="-5" width="160" height="10" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="5" />
      {[-2, -1, 0, 1, 2].map((dot) => (
        <Circle 
          key={dot}
          cx={dot * 20} 
          cy="0" 
          r="5" 
          fill={Math.abs(dot - localizer) < 0.3 ? AVIATION_COLORS.MAGENTA : AVIATION_COLORS.BORDER_SECONDARY} 
          stroke={AVIATION_COLORS.BORDER_SECONDARY} 
          strokeWidth="2"
        />
      ))}
      <SvgText x="0" y="20" fill={AVIATION_COLORS.WHITE} fontSize="11" textAnchor="middle" fontWeight="bold">LOC</SvgText>
    </G>
  ), [localizer]);

  const ilsGlideslopeScale = useMemo(() => (
    <G transform="translate(580, 310)">
      <Rect x="-5" y="-80" width="10" height="160" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="5" />
      {[-2, -1, 0, 1, 2].map((dot) => (
        <Circle 
          key={dot}
          cx="0" 
          cy={dot * 20} 
          r="5" 
          fill={Math.abs(dot - glideslope) < 0.3 ? AVIATION_COLORS.MAGENTA : AVIATION_COLORS.BORDER_SECONDARY} 
          stroke={AVIATION_COLORS.BORDER_SECONDARY} 
          strokeWidth="2"
        />
      ))}
      <SvgText x="20" y="5" fill={AVIATION_COLORS.WHITE} fontSize="11" textAnchor="middle" fontWeight="bold">G/S</SvgText>
    </G>
  ), [glideslope]);

  const vsIndicator = useMemo(() => (
    <G>
      <Rect x="635" y="510" width="150" height="150" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="8" />
      <SvgText x="710" y="530" fill={AVIATION_COLORS.WHITE} fontSize="14" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">VS</SvgText>
      
      {/* VS Scale - Enhanced */}
      {[-2000, -1000, -500, 0, 500, 1000, 2000].map((vs, i) => {
        const y = 535 + (i * 15);
        const isZero = vs === 0;
        return (
          <G key={vs}>
            <Line 
              x1={isZero ? "640" : "650"} 
              y1={y} 
              x2={isZero ? "780" : "770"} 
              y2={y} 
              stroke={AVIATION_COLORS.WHITE} 
              strokeWidth={isZero ? "3" : "1"} 
            />
            <SvgText x="705" y={y + 3} fill={AVIATION_COLORS.WHITE} fontSize="9" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="start">
              {Math.abs(vs / 1000)}
            </SvgText>
          </G>
        );
      })}

      {/* Current VS Digital Display */}
      <Rect x="665" y="625" width="90" height="26" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="3" />
      <SvgText x="710" y="642" fill={verticalSpeed > 0 ? AVIATION_COLORS.GREEN : verticalSpeed < 0 ? AVIATION_COLORS.RED : AVIATION_COLORS.WHITE} 
               fontSize="12" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        {verticalSpeed > 0 ? "+" : ""}{Math.round(verticalSpeed)}
      </SvgText>
    </G>
  ), [verticalSpeed]);

  const headingIndicator = useMemo(() => (
    <G>
      <Rect x="250" y="520" width="300" height="50" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="10" />
      
      {/* Heading Scale - Ultra Enhanced */}
      {Array.from({ length: 11 }, (_, i) => {
        const hdgValue = ((heading - 50) + (i * 10)) % 360;
        const x = 270 + (i * 26);
        const isMajor = hdgValue % 30 === 0;
          return (
          <G key={i}>
            <Line 
              x1={x} 
              y1="525" 
              x2={x} 
              y2={isMajor ? "540" : "532"} 
              stroke={AVIATION_COLORS.WHITE} 
              strokeWidth={isMajor ? "3" : "2"} 
            />
            {isMajor && (
              <SvgText x={x} y="555" fill={AVIATION_COLORS.WHITE} fontSize="16" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
                {Math.round(hdgValue).toString().padStart(3, '0')}
              </SvgText>
            )}
          </G>
          );
        })}

      {/* Selected Heading Bug */}
      {(() => {
        const delta = (((selectedHeading - heading) + 540) % 360) - 180; // [-180,180]
        const pxPerDeg = 26 / 10; // 10 deg ~ 26 px
        if (Math.abs(delta) > 50) return null;
        const x = 400 + delta * pxPerDeg;
        const yTop = 570;
        return (
          <Polygon points={`${x},${yTop + 10} ${x - 8},${yTop} ${x + 8},${yTop}`} fill={AVIATION_COLORS.YELLOW} stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
        );
      })()}

      {/* Current Heading Digital Display - Enhanced */}
      <Rect x="352" y="582" width="96" height="35" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.GREEN} strokeWidth="3" rx="8" />
      <SvgText x="398" y="602" fill={AVIATION_COLORS.GREEN} fontSize="20" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        {Math.round(heading).toString().padStart(3, '0')}°
      </SvgText>
    </G>
  ), [heading, selectedHeading]);

  const flightModeAnnunciators = useMemo(() => (
    <G transform="translate(90, 25)">
      {/* Autopilot Modes */}
      <Rect x="0" y="0" width="80" height="22" fill={AVIATION_COLORS.GREEN} rx="4" stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      <SvgText x="40" y="16" fill={AVIATION_COLORS.BLACK} fontSize="11" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        A/P
      </SvgText>
      
      <Rect x="200" y="0" width="80" height="22" fill={AVIATION_COLORS.GREEN} rx="4" stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      <SvgText x="240" y="16" fill={AVIATION_COLORS.BLACK} fontSize="11" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        LNAV
      </SvgText>
      
      <Rect x="400" y="0" width="80" height="22" fill={AVIATION_COLORS.GREEN} rx="4" stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      <SvgText x="440" y="16" fill={AVIATION_COLORS.BLACK} fontSize="11" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        VNAV
      </SvgText>

      <Rect x="600" y="0" width="80" height="22" fill={AVIATION_COLORS.YELLOW} rx="4" stroke={AVIATION_COLORS.BLACK} strokeWidth="2" />
      <SvgText x="640" y="16" fill={AVIATION_COLORS.BLACK} fontSize="11" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        APP
      </SvgText>
    </G>
  ), []);

  const decisionHeightWarning = useMemo(() => (
    <G transform="translate(350, 100)">
      <Rect x="0" y="0" width="100" height="25" fill={AVIATION_COLORS.RED} rx="3" stroke={AVIATION_COLORS.WHITE} strokeWidth="2" />
      <SvgText x="50" y="18" fill={AVIATION_COLORS.WHITE} fontSize="14" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
        CMD
      </SvgText>
    </G>
  ), [radioAlt, decisionAltitude]);

  const bottomInfoBar = useMemo(() => (
    <View style={styles.infoBar}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>TAS</Text>
        <Text style={styles.infoValue}>{Math.round(speed + 15)} KT</Text>
        </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>GS</Text>
        <Text style={styles.infoValue}>{Math.round(speed - 5)} KT</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>SAT</Text>
        <Text style={styles.infoValue}>-45°C</Text>
    </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>WIND</Text>
        <Text style={styles.infoValue}>270/15</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>TAT</Text>
        <Text style={styles.infoValue}>-32°C</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>UTC</Text>
        <Text style={styles.infoValue}>{new Date().toUTCString().slice(17, 22)}</Text>
      </View>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      {/* Ultra-Premium PFD Display */}
      <Svg width="100%" height="100%" viewBox="0 0 800 700" preserveAspectRatio="xMidYMid meet">
        <Defs>
          {/* Enhanced Sky Gradient with Realistic Colors */}
          <LinearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#87CEEB" />
            <Stop offset="25%" stopColor="#6BB6FF" />
            <Stop offset="50%" stopColor="#4A90E2" />
            <Stop offset="75%" stopColor="#357ABD" />
            <Stop offset="100%" stopColor="#2C5282" />
          </LinearGradient>
          
          {/* Realistic Ground Gradient */}
          <LinearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#CD853F" />
            <Stop offset="25%" stopColor="#A0522D" />
            <Stop offset="50%" stopColor="#8B4513" />
            <Stop offset="75%" stopColor="#654321" />
            <Stop offset="100%" stopColor="#4A2C17" />
          </LinearGradient>

          {/* Instrument Glow Effects */}
          <RadialGradient id="instrumentGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(0,255,0,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,255,0,0)" />
          </RadialGradient>

          {/* Shadow effect simulation with multiple layers */}

          {/* Attitude Indicator Clip */}
          <ClipPath id="attitudeClip">
            <Rect x="180" y="120" width="440" height="380" rx="20" />
          </ClipPath>

          {/* Speed Tape Clip */}
          <ClipPath id="speedClip">
            <Rect x="15" y="120" width="150" height="380" />
          </ClipPath>

          {/* Altitude Tape Clip */}
          <ClipPath id="altitudeClip">
            <Rect x="635" y="120" width="150" height="380" />
          </ClipPath>
        </Defs>

        {/* Background with Bezel Effect */}
        <Rect x="0" y="0" width="800" height="700" fill={AVIATION_COLORS.BLACK} />
        <Rect x="5" y="5" width="790" height="690" fill="url(#screenGradient)" stroke={AVIATION_COLORS.BORDER_PRIMARY} strokeWidth="2" rx="25" />

        {/* === ENHANCED SPEED TAPE === */}
        <G clipPath="url(#speedClip)">
          <Rect x="15" y="120" width="150" height="380" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="10" />
          
          {/* Speed Scale with Enhanced Graphics */}
          {speedScaleData}

          {/* Stall / Overspeed bands */}
          {overspeedBand}

          {/* V-Speed Bugs */}
          {vSpeedBugs}
        </G>

        {/* Current Speed Digital Readout - Enhanced */}
        <Rect x="12" y="292" width="155" height="45" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.GREEN} strokeWidth="3" rx="8" opacity="0.3" />
        <Rect x="10" y="290" width="155" height="45" fill={AVIATION_COLORS.BLACK} stroke={AVIATION_COLORS.GREEN} strokeWidth="3" rx="8" />
        <Rect x="15" y="295" width="145" height="35" fill="url(#instrumentGlow)" rx="5" />
        <SvgText x="87" y="320" fill={AVIATION_COLORS.GREEN} fontSize="28" fontFamily={AVIATION_FONTS.PRIMARY} textAnchor="middle" fontWeight="bold">
          {Math.round(speed)}
        </SvgText>
        {/* Selected Speed Bug */}
        {(() => {
          const pxPerKt = 1.9; // 10 kt ~ 19 px
          const bugY = 305 + (selectedSpeed - speed) * pxPerKt;
          return (
            <>
              <Polygon points={`165,${bugY} 175,${bugY + 6} 175,${bugY - 6}`} fill={AVIATION_COLORS.YELLOW} stroke={AVIATION_COLORS.BLACK} strokeWidth="1" />
              <SvgText x="185" y={bugY + 4} fill={AVIATION_COLORS.YELLOW} fontSize="11" fontFamily={AVIATION_FONTS.PRIMARY} fontWeight="bold">SPD</SvgText>
            </>
          );
        })()}

        {/* Mach Number Display - Enhanced */}
        {machNumberDisplay}

        {/* === ENHANCED ALTITUDE TAPE === */}
        <G clipPath="url(#altitudeClip)">
          <Rect x="635" y="120" width="150" height="380" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="10" />
          
          {/* Altitude Scale */}
          {altitudeScaleData}

          {/* Target Altitude Bug - Enhanced */}
          {targetAltitudeBug}
        </G>

        {/* Current Altitude Digital Readout - Enhanced */}
        {currentAltitudeDigitalReadout}

        {/* Barometric Setting */}
        {barometricSetting}

        {/* Radio Altitude */}
        {radioAltitude}

        {/* Flight Level Display - Enhanced */}
        {flightLevelDisplay}

        {/* === ULTRA-ENHANCED ATTITUDE INDICATOR === */}
        <G clipPath="url(#attitudeClip)">
          <G transform={`translate(400, 310) rotate(${roll}) translate(-400, -310)`}>
            {/* Sky with Enhanced Gradient - expanded slightly to avoid seams when rotating */}
            <Rect 
              x="170" 
              y={100 - pitch * 12} 
              width="460" 
              height={230 + pitch * 12} 
              fill="url(#skyGradient)" 
            />
            
            {/* Ground with Enhanced Gradient */}
            <Rect 
              x="170" 
              y={300 - pitch * 12} 
              width="460" 
              height={230 + pitch * 12} 
              fill="url(#groundGradient)" 
            />

            {/* Enhanced Horizon Line with Shadow Effect */}
            <Line 
              x1="180" 
              y1={310 - pitch * 12 + 2} 
              x2="620" 
              y2={310 - pitch * 12 + 2} 
              stroke={AVIATION_COLORS.BROWN} 
              strokeWidth="7" 
              opacity="0.4"
            />
            <Line 
              x1="180" 
              y1={310 - pitch * 12} 
              x2="620" 
              y2={310 - pitch * 12} 
              stroke={AVIATION_COLORS.GOLD} 
              strokeWidth="7"
            />

            {/* Ultra-Enhanced Pitch Scale */}
            {[-30, -20, -10, -5, 5, 10, 20, 30].map((pitchValue) => {
              const y = 310 - pitchValue * 12 - pitch * 12;
              const lineLength = Math.abs(pitchValue) === 10 || Math.abs(pitchValue) === 20 ? 100 : 70;
              const startX = 400 - lineLength / 2;
              const endX = 400 + lineLength / 2;
              const isMinor = Math.abs(pitchValue) === 5;
              
              return (
                <G key={pitchValue}>
                  {/* Pitch line */}
                  {/* Shadow for major pitch lines */}
                  {!isMinor && (
                    <Line 
                      x1={startX} 
                      y1={y + 1} 
                      x2={endX} 
                      y2={y + 1} 
                      stroke={AVIATION_COLORS.BLACK} 
                      strokeWidth="4" 
                      opacity="0.3"
                    />
                  )}
                  <Line 
                    x1={startX} 
                    y1={y} 
                    x2={endX} 
                    y2={y} 
                    stroke={AVIATION_COLORS.WHITE} 
                    strokeWidth={isMinor ? "3" : "5"}
                  />
                  
                  {/* Pitch value labels */}
                  {!isMinor && (
                    <>
                      {/* Shadow for text */}
                      <SvgText 
                        x={startX - 29} 
                        y={y + 8} 
                        fill={AVIATION_COLORS.BLACK} 
                        fontSize="22" 
                        fontFamily={AVIATION_FONTS.PRIMARY}
                        fontWeight="bold"
                        opacity="0.4"
                      >
                        {Math.abs(pitchValue)}
                      </SvgText>
                      <SvgText 
                        x={startX - 30} 
                        y={y + 7} 
                        fill={AVIATION_COLORS.WHITE} 
                        fontSize="22" 
                        fontFamily={AVIATION_FONTS.PRIMARY}
                        fontWeight="bold"
                      >
                        {Math.abs(pitchValue)}
                      </SvgText>
                      {/* Shadow for right text */}
                      <SvgText 
                        x={endX + 16} 
                        y={y + 8} 
                        fill={AVIATION_COLORS.BLACK} 
                        fontSize="22" 
                        fontFamily={AVIATION_FONTS.PRIMARY}
                        fontWeight="bold"
                        opacity="0.4"
                      >
                    {Math.abs(pitchValue)}
                  </SvgText>
                      <SvgText 
                        x={endX + 15} 
                        y={y + 7} 
                        fill={AVIATION_COLORS.WHITE} 
                        fontSize="22" 
                        fontFamily={AVIATION_FONTS.PRIMARY}
                        fontWeight="bold"
                      >
                    {Math.abs(pitchValue)}
                  </SvgText>
                    </>
                  )}
                </G>
              );
            })}

            {/* Flight Path Vector (FPV) */}
            {(() => {
              const ktsToFtPerSec = 1.68781;
              const vsFtPerSec = verticalSpeed / 60;
              const tasFtPerSec = Math.max(1, speed * ktsToFtPerSec);
              const fpaDeg = Math.atan2(vsFtPerSec, tasFtPerSec) * (180 / Math.PI);
              const y = 310 - fpaDeg * 12; // 1 deg ~ 12px
              const x = 400; // no lateral drift modeled
              return (
                <G>
                  <Circle cx={x} cy={y} r="6" fill={AVIATION_COLORS.GREEN} opacity="0.2" />
                  <Circle cx={x} cy={y} r="2" fill={AVIATION_COLORS.GREEN} />
                  <Line x1={x - 14} y1={y} x2={x - 2} y2={y} stroke={AVIATION_COLORS.GREEN} strokeWidth="2" />
                  <Line x1={x + 2} y1={y} x2={x + 14} y2={y} stroke={AVIATION_COLORS.GREEN} strokeWidth="2" />
                  <Line x1={x} y1={y + 10} x2={x} y2={y + 18} stroke={AVIATION_COLORS.GREEN} strokeWidth="2" />
                </G>
              );
            })()}
          </G>
        </G>

        {/* Attitude Indicator Frame with Bezel */}
        {attitudeIndicatorFrame}

        {/* === ULTRA-ENHANCED AIRCRAFT SYMBOL === */}
        {aircraftSymbol}

        {/* === ULTRA-ENHANCED BANK ANGLE SCALE === */}
        {bankAngleScale}

        {/* === ILS/LOC DEVIATION INDICATORS === */}
        {/* Localizer Scale */}
        {ilsLocalizerScale}

        {/* Glideslope Scale */}
        {ilsGlideslopeScale}

        {/* === ENHANCED VERTICAL SPEED INDICATOR (Bottom-right panel space) === */}
        {vsIndicator}

        {/* === ENHANCED HEADING INDICATOR === */}
        <Rect x="250" y="520" width="300" height="50" fill={AVIATION_COLORS.SECONDARY_BG} stroke={AVIATION_COLORS.BORDER_SECONDARY} strokeWidth="2" rx="10" />
        
        {/* Heading Scale - Ultra Enhanced */}
        {headingIndicator}

        {/* === ENHANCED FLIGHT MODE ANNUNCIATORS === */}
        {flightModeAnnunciators}

        {/* === DECISION HEIGHT WARNING === */}
        {decisionHeightWarning}
      </Svg>

      {/* Bright / Dim toggle */}
      <TouchableOpacity style={styles.dimToggle} onPress={() => setManualDim(prev => prev === null ? true : !prev)}>
        <Text style={styles.dimToggleText}>{dimMode ? "DIM" : "BRIGHT"}</Text>
      </TouchableOpacity>

      {/* Enhanced Bottom Information Bar with More Data */}
      {bottomInfoBar}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AVIATION_COLORS.PANEL_BG,
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
  dimToggle: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: AVIATION_COLORS.SECONDARY_BG,
    borderWidth: 2,
    borderColor: AVIATION_COLORS.BORDER_ACCENT,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dimToggleText: {
    color: AVIATION_COLORS.GREEN,
    fontFamily: AVIATION_FONTS.PRIMARY,
    fontWeight: '700',
    fontSize: 12,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: AVIATION_COLORS.SECONDARY_BG,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 3,
    borderTopColor: AVIATION_COLORS.BORDER_ACCENT,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: AVIATION_COLORS.BORDER_ACCENT,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    fontFamily: AVIATION_FONTS.PRIMARY,
  },
  infoValue: {
    color: AVIATION_COLORS.GREEN,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: AVIATION_FONTS.PRIMARY,
  },
});