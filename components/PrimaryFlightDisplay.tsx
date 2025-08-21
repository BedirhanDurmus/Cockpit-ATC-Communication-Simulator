import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { 
  Line, Path, Text as SvgText, G, Rect, Circle, Polygon, 
  Defs, LinearGradient, Stop, ClipPath, RadialGradient, Filter, 
  Ellipse
} from "react-native-svg";

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

  // Enhanced realistic flight simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPitch(prev => Math.max(-8, Math.min(8, prev + (Math.random() - 0.5) * 0.6)));
      setRoll(prev => Math.max(-12, Math.min(12, prev + (Math.random() - 0.5) * 0.8)));
      setGlideslope(prev => Math.max(-2, Math.min(2, prev + (Math.random() - 0.5) * 0.3)));
      setLocalizer(prev => Math.max(-2, Math.min(2, prev + (Math.random() - 0.5) * 0.2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const flightLevel = Math.floor(altitude / 100);
  const machNumber = (speed * 0.00147).toFixed(3);
  const baroSetting = 29.92;
  const radioAlt = Math.max(0, altitude - 1500); // Decision Height simulation

  return (
    <View style={styles.container}>
      {/* Ultra-Premium PFD Display */}
      <Svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
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
            <Rect x="200" y="120" width="800" height="380" rx="20" />
          </ClipPath>

          {/* Speed Tape Clip */}
          <ClipPath id="speedClip">
            <Rect x="15" y="120" width="150" height="380" />
          </ClipPath>

          {/* Altitude Tape Clip */}
          <ClipPath id="altitudeClip">
            <Rect x="1035" y="120" width="150" height="380" />
          </ClipPath>
        </Defs>

        {/* Background with Bezel Effect */}
        <Rect x="0" y="0" width="1200" height="700" fill="#000" />
        <Rect x="5" y="5" width="1190" height="690" fill="#0a0a0a" stroke="#333" strokeWidth="2" rx="25" />

        {/* === ENHANCED SPEED TAPE === */}
        <G clipPath="url(#speedClip)">
          <Rect x="15" y="120" width="150" height="380" fill="#0d1117" stroke="#30363d" strokeWidth="2" rx="10" />
          
          {/* Speed Scale with Enhanced Graphics */}
          {Array.from({ length: 20 }, (_, i) => {
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
                  stroke={isCurrent ? "#00FF00" : "#FFFFFF"} 
                  strokeWidth={isMainTick ? "3" : "2"} 
                />
                
                {/* Speed values */}
                {isMainTick && (
                  <SvgText 
                    x="75" 
                    y={y + 6} 
                    fill={isCurrent ? "#00FF00" : "#FFFFFF"} 
                    fontSize="16" 
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="start"
                  >
                  {speedValue}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* V-Speed Bugs */}
          {/* V1 Speed */}
          <Polygon points="165,280 175,285 175,275" fill="#FF00FF" stroke="#000" strokeWidth="1" />
          <SvgText x="180" y="285" fill="#FF00FF" fontSize="12" fontWeight="bold">V1</SvgText>
          
          {/* VR Speed */}
          <Polygon points="165,300 175,305 175,295" fill="#00FFFF" stroke="#000" strokeWidth="1" />
          <SvgText x="180" y="305" fill="#00FFFF" fontSize="12" fontWeight="bold">VR</SvgText>
        </G>

        {/* Current Speed Digital Readout - Enhanced */}
        <Rect x="12" y="292" width="155" height="45" fill="#333" rx="8" opacity="0.3" />
        <Rect x="10" y="290" width="155" height="45" fill="#000" stroke="#00FF00" strokeWidth="3" rx="8" />
        <Rect x="15" y="295" width="145" height="35" fill="url(#instrumentGlow)" rx="5" />
        <SvgText x="87" y="320" fill="#00FF00" fontSize="28" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {Math.round(speed)}
        </SvgText>

        {/* Mach Number Display - Enhanced */}
        <Rect x="15" y="60" width="150" height="40" fill="#000" stroke="#30363d" strokeWidth="2" rx="8" />
        <SvgText x="90" y="85" fill="#00FFFF" fontSize="18" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          M{machNumber.slice(2)}
        </SvgText>

        {/* === ENHANCED ALTITUDE TAPE === */}
        <G clipPath="url(#altitudeClip)">
          <Rect x="1035" y="120" width="150" height="380" fill="#0d1117" stroke="#30363d" strokeWidth="2" rx="10" />
          
          {/* Altitude Scale */}
          {Array.from({ length: 20 }, (_, i) => {
            const altValue = Math.round((altitude - 950) + (i * 100));
            const y = 140 + (i * 19);
            const isMainTick = altValue % 200 === 0;
            const isCurrent = Math.abs(altValue - altitude) < 120;
            
            return (
              <G key={i}>
                {/* Background for current altitude area */}
                {isCurrent && (
                  <Rect 
                    x="1035" 
                    y={y - 10} 
                    width="150" 
                    height="20" 
                    fill="rgba(0,255,0,0.1)" 
                  />
                )}
                
                {/* Tick marks */}
                <Line 
                  x1="1120" 
                  y1={y} 
                  x2={isMainTick ? "1180" : "1170"} 
                  y2={y} 
                  stroke={isCurrent ? "#00FF00" : "#FFFFFF"} 
                  strokeWidth={isMainTick ? "3" : "2"} 
                />
                
                {/* Altitude values */}
                {isMainTick && (
                  <SvgText 
                    x="1110" 
                    y={y + 6} 
                    fill={isCurrent ? "#00FF00" : "#FFFFFF"} 
                    fontSize="16" 
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {altValue}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* Target Altitude Bug - Enhanced */}
          <Polygon 
            points={`1030,${290 + (targetAltitude - altitude) * 0.019} 1020,${295 + (targetAltitude - altitude) * 0.019} 1020,${285 + (targetAltitude - altitude) * 0.019}`}
            fill="#FF00FF" 
            stroke="#000"
            strokeWidth="2"
          />
        </G>

        {/* Current Altitude Digital Readout - Enhanced */}
        <Rect x="1037" y="292" width="155" height="45" fill="#333" rx="8" opacity="0.3" />
        <Rect x="1035" y="290" width="155" height="45" fill="#000" stroke="#00FF00" strokeWidth="3" rx="8" />
        <Rect x="1040" y="295" width="145" height="35" fill="url(#instrumentGlow)" rx="5" />
        <SvgText x="1112" y="320" fill="#00FF00" fontSize="28" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {Math.round(altitude)}
        </SvgText>

        {/* Barometric Setting */}
        <Rect x="1035" y="350" width="150" height="30" fill="#000" stroke="#30363d" strokeWidth="2" rx="5" />
        <SvgText x="1110" y="370" fill="#00FFFF" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {baroSetting.toFixed(2)}
        </SvgText>

        {/* Radio Altitude */}
        <Rect x="1035" y="385" width="150" height="30" fill="#000" stroke="#30363d" strokeWidth="2" rx="5" />
        <SvgText x="1110" y="405" fill="#FFFF00" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          RA {Math.round(radioAlt)}
        </SvgText>

        {/* Flight Level Display - Enhanced */}
        <Rect x="1035" y="60" width="150" height="40" fill="#000" stroke="#30363d" strokeWidth="2" rx="8" />
        <SvgText x="1110" y="85" fill="#00FFFF" fontSize="18" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          FL{flightLevel}
        </SvgText>

        {/* === ULTRA-ENHANCED ATTITUDE INDICATOR === */}
        <G clipPath="url(#attitudeClip)">
          <G transform={`translate(600, 310) rotate(${roll}) translate(-600, -310)`}>
            {/* Sky with Enhanced Gradient */}
            <Rect 
              x="200" 
              y={120 - pitch * 12} 
              width="800" 
              height={190 + pitch * 12} 
              fill="url(#skyGradient)" 
            />
            
            {/* Ground with Enhanced Gradient */}
            <Rect 
              x="200" 
              y={310 - pitch * 12} 
              width="800" 
              height={190 + pitch * 12} 
              fill="url(#groundGradient)" 
            />

            {/* Enhanced Horizon Line with Shadow Effect */}
            <Line 
              x1="200" 
              y1={310 - pitch * 12 + 2} 
              x2="1000" 
              y2={310 - pitch * 12 + 2} 
              stroke="#B8860B" 
              strokeWidth="6" 
              opacity="0.4"
            />
            <Line 
              x1="200" 
              y1={310 - pitch * 12} 
              x2="1000" 
              y2={310 - pitch * 12} 
              stroke="#FFD700" 
              strokeWidth="6"
            />

            {/* Ultra-Enhanced Pitch Scale */}
            {[-30, -20, -10, -5, 5, 10, 20, 30].map((pitchValue) => {
              const y = 310 - pitchValue * 12 - pitch * 12;
              const lineLength = Math.abs(pitchValue) === 10 || Math.abs(pitchValue) === 20 ? 300 : 180;
              const startX = 600 - lineLength / 2;
              const endX = 600 + lineLength / 2;
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
                      stroke="#000" 
                      strokeWidth="4" 
                      opacity="0.3"
                    />
                  )}
                  <Line 
                    x1={startX} 
                    y1={y} 
                    x2={endX} 
                    y2={y} 
                    stroke="#FFFFFF" 
                    strokeWidth={isMinor ? "2" : "4"}
                  />
                  
                  {/* Pitch value labels */}
                  {!isMinor && (
                    <>
                                            {/* Shadow for text */}
                      <SvgText 
                        x={startX - 29} 
                        y={y + 8} 
                        fill="#000" 
                        fontSize="20" 
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity="0.4"
                      >
                        {Math.abs(pitchValue)}
                      </SvgText>
                      <SvgText 
                        x={startX - 30} 
                        y={y + 7} 
                        fill="#FFFFFF" 
                        fontSize="20" 
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {Math.abs(pitchValue)}
                      </SvgText>
                      {/* Shadow for right text */}
                      <SvgText 
                        x={endX + 16} 
                        y={y + 8} 
                        fill="#000" 
                        fontSize="20" 
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity="0.4"
                      >
                    {Math.abs(pitchValue)}
                  </SvgText>
                      <SvgText 
                        x={endX + 15} 
                        y={y + 7} 
                        fill="#FFFFFF" 
                        fontSize="20" 
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                    {Math.abs(pitchValue)}
                  </SvgText>
                    </>
                  )}
                </G>
              );
            })}
          </G>
        </G>

        {/* Attitude Indicator Frame with Bezel */}
        <Rect x="200" y="120" width="800" height="380" fill="none" stroke="#666" strokeWidth="4" rx="20" />
        <Rect x="205" y="125" width="790" height="370" fill="none" stroke="#999" strokeWidth="2" rx="15" />

        {/* === ULTRA-ENHANCED AIRCRAFT SYMBOL === */}
        <G>
          {/* Main wings - Ultra thick and prominent */}
          <Line x1="420" y1="310" x2="780" y2="310" stroke="#FFD700" strokeWidth="12" />
          <Line x1="420" y1="310" x2="780" y2="310" stroke="#FFA500" strokeWidth="8" />
          
          {/* Center fuselage */}
          <Ellipse cx="600" cy="310" rx="12" ry="8" fill="#FFD700" stroke="#000" strokeWidth="3" />
          
          {/* Nose pointer - Larger and more visible */}
          <Polygon points="600,285 615,305 585,305" fill="#FFD700" stroke="#000" strokeWidth="2" />
          
          {/* Wing ends - More prominent */}
          <Rect x="400" y="305" width="25" height="10" fill="#FFD700" stroke="#000" strokeWidth="2" />
          <Rect x="775" y="305" width="25" height="10" fill="#FFD700" stroke="#000" strokeWidth="2" />
          
          {/* Center reference dot */}
          <Circle cx="600" cy="310" r="8" fill="#000" stroke="#FFD700" strokeWidth="3" />
          <Circle cx="600" cy="310" r="4" fill="#FFD700" />
        </G>

        {/* === ULTRA-ENHANCED BANK ANGLE SCALE === */}
        <G transform="translate(600, 140)">
          {/* Bank angle arc */}
          <Path 
            d="M -80 0 A 80 80 0 0 1 80 0" 
            fill="none" 
            stroke="#FFFFFF" 
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
                stroke="#000" 
                strokeWidth={Math.abs(angle) % 30 === 0 ? "5" : "3"} 
                opacity="0.3"
              />
              <Line 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="#FFFFFF" 
                strokeWidth={Math.abs(angle) % 30 === 0 ? "5" : "3"}
              />
                {Math.abs(angle) % 30 === 0 && angle !== 0 && (
                  <SvgText 
                    x={Math.sin(radian) * 110} 
                    y={-Math.cos(radian) * 110 + 6} 
                    fill="#FFFFFF" 
                    fontSize="16" 
                    fontFamily="monospace"
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
            fill="#000" 
            opacity="0.3"
          />
          <Polygon 
            points={`${Math.sin((roll * Math.PI) / 180) * 75}, ${-Math.cos((roll * Math.PI) / 180) * 75} ${Math.sin((roll * Math.PI) / 180) * 95}, ${-Math.cos((roll * Math.PI) / 180) * 95} ${Math.sin((roll * Math.PI) / 180) * 75 + 12}, ${-Math.cos((roll * Math.PI) / 180) * 75}`}
            fill="#FFD700" 
            stroke="#000"
            strokeWidth="3"
          />
        </G>

        {/* === ILS/LOC DEVIATION INDICATORS === */}
        {/* Localizer Scale */}
        <G transform="translate(600, 480)">
          <Rect x="-150" y="-5" width="300" height="10" fill="#1a1a1a" stroke="#666" strokeWidth="2" rx="5" />
          {[-2, -1, 0, 1, 2].map((dot) => (
            <Circle 
              key={dot}
              cx={dot * 35} 
              cy="0" 
              r="6" 
              fill={Math.abs(dot - localizer) < 0.3 ? "#FF00FF" : "#333"} 
              stroke="#666" 
              strokeWidth="2"
            />
          ))}
          <SvgText x="0" y="25" fill="#FFFFFF" fontSize="12" textAnchor="middle" fontWeight="bold">LOC</SvgText>
        </G>

        {/* Glideslope Scale */}
        <G transform="translate(980, 310)">
          <Rect x="-5" y="-100" width="10" height="200" fill="#1a1a1a" stroke="#666" strokeWidth="2" rx="5" />
          {[-2, -1, 0, 1, 2].map((dot) => (
            <Circle 
              key={dot}
              cx="0" 
              cy={dot * 25} 
              r="6" 
              fill={Math.abs(dot - glideslope) < 0.3 ? "#FF00FF" : "#333"} 
              stroke="#666" 
              strokeWidth="2"
            />
          ))}
          <SvgText x="25" y="5" fill="#FFFFFF" fontSize="12" textAnchor="middle" fontWeight="bold">G/S</SvgText>
        </G>

        {/* === ENHANCED VERTICAL SPEED INDICATOR === */}
        <Rect x="1050" y="520" width="100" height="120" fill="#0d1117" stroke="#30363d" strokeWidth="2" rx="8" />
        <SvgText x="1100" y="540" fill="#FFFFFF" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VS</SvgText>
        
        {/* VS Scale - Enhanced */}
        {[-2000, -1000, -500, 0, 500, 1000, 2000].map((vs, i) => {
          const y = 550 + (i * 12);
          const isZero = vs === 0;
                      return (
              <G key={vs}>
                <Line 
                  x1={isZero ? "1060" : "1070"} 
                  y1={y} 
                  x2={isZero ? "1140" : "1080"} 
                  y2={y} 
                  stroke="#FFFFFF" 
                  strokeWidth={isZero ? "4" : "2"} 
                />
                <SvgText x="1085" y={y + 4} fill="#FFFFFF" fontSize="11" fontFamily="monospace" textAnchor="start">
                  {Math.abs(vs / 1000)}
                </SvgText>
              </G>
            );
          })}

        {/* Current VS Digital Display */}
        <Rect x="1055" y="575" width="90" height="25" fill="#000" stroke="#666" strokeWidth="2" rx="3" />
        <SvgText x="1100" y="592" fill={verticalSpeed > 0 ? "#00FF00" : verticalSpeed < 0 ? "#FF0000" : "#FFFFFF"} 
                 fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {verticalSpeed > 0 ? "+" : ""}{Math.round(verticalSpeed)}
        </SvgText>

        {/* === ENHANCED HEADING INDICATOR === */}
        <Rect x="350" y="520" width="500" height="60" fill="#0d1117" stroke="#30363d" strokeWidth="2" rx="10" />
        
        {/* Heading Scale - Ultra Enhanced */}
        {Array.from({ length: 17 }, (_, i) => {
          const hdgValue = ((heading - 80) + (i * 10)) % 360;
          const x = 370 + (i * 29);
          const isMajor = hdgValue % 30 === 0;
            return (
            <G key={i}>
              <Line 
                x1={x} 
                y1="525" 
                x2={x} 
                y2={isMajor ? "540" : "532"} 
                stroke="#FFFFFF" 
                strokeWidth={isMajor ? "3" : "2"} 
              />
              {isMajor && (
                <SvgText x={x} y="555" fill="#FFFFFF" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {Math.round(hdgValue).toString().padStart(3, '0')}
                </SvgText>
              )}
            </G>
            );
          })}

        {/* Current Heading Digital Display - Enhanced */}
        <Rect x="552" y="592" width="100" height="40" fill="#333" rx="8" opacity="0.3" />
        <Rect x="550" y="590" width="100" height="40" fill="#000" stroke="#00FF00" strokeWidth="3" rx="8" />
        <SvgText x="600" y="615" fill="#00FF00" fontSize="24" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {heading.toString().padStart(3, '0')}°
        </SvgText>

        {/* === ENHANCED FLIGHT MODE ANNUNCIATORS === */}
        <G transform="translate(350, 25)">
          {/* Autopilot Modes */}
          <Rect x="0" y="0" width="80" height="30" fill="#00FF00" rx="5" stroke="#000" strokeWidth="2" />
          <SvgText x="40" y="20" fill="#000" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            A/P
          </SvgText>
          
          <Rect x="90" y="0" width="80" height="30" fill="#00FF00" rx="5" stroke="#000" strokeWidth="2" />
          <SvgText x="130" y="20" fill="#000" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            LNAV
          </SvgText>
          
          <Rect x="180" y="0" width="80" height="30" fill="#00FF00" rx="5" stroke="#000" strokeWidth="2" />
          <SvgText x="220" y="20" fill="#000" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            VNAV
          </SvgText>

          <Rect x="270" y="0" width="80" height="30" fill="#FFFF00" rx="5" stroke="#000" strokeWidth="2" />
          <SvgText x="310" y="20" fill="#000" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            APP
          </SvgText>
        </G>

        {/* === DECISION HEIGHT WARNING === */}
        {radioAlt < 1000 && (
          <G transform="translate(550, 100)">
            <Rect x="0" y="0" width="100" height="25" fill="#FF0000" rx="3" stroke="#FFF" strokeWidth="2" />
            <SvgText x="50" y="18" fill="#FFF" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              MINIMUMS
            </SvgText>
          </G>
        )}
      </Svg>

      {/* Enhanced Bottom Information Bar with More Data */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    margin: 0,
    marginVertical: 8,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    minHeight: 400,
    width: '100%',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 3,
    borderTopColor: '#444',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  infoValue: {
    color: '#00FF00',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});