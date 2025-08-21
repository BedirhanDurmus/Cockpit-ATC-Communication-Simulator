import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { 
  Line, Path, Text as SvgText, G, Rect, Circle, Polygon, 
  Defs, LinearGradient, Stop, ClipPath, RadialGradient
} from "react-native-svg";

interface NavigationDisplayProps {
  heading: number;
  speed: number;
  altitude: number;
}

export default function NavigationDisplay({
  heading,
  speed,
  altitude,
}: NavigationDisplayProps) {
  const [range, setRange] = useState(40); // NM
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [tcasEnabled, setTcasEnabled] = useState(true);

  // Aircraft position (center of screen)
  const aircraftX = 600;
  const aircraftY = 350;

  // Sample waypoints and airports
  const waypoints = [
    { name: "LTBA", type: "airport", x: 450, y: 200, distance: 25 },
    { name: "LTBJ", type: "airport", x: 750, y: 400, distance: 18 },
    { name: "LTFM", type: "airport", x: 400, y: 500, distance: 35 },
    { name: "WPT01", type: "waypoint", x: 520, y: 280, distance: 12 },
    { name: "WPT02", type: "waypoint", x: 680, y: 320, distance: 15 },
    { name: "VOR1", type: "vor", x: 350, y: 350, distance: 28 },
  ];

  // Sample traffic
  const traffic = [
    { callsign: "THY123", x: 480, y: 250, altitude: 37000, threat: "none" },
    { callsign: "BAW456", x: 720, y: 380, altitude: 36000, threat: "traffic" },
    { callsign: "DLH789", x: 550, y: 450, altitude: 38000, threat: "none" },
  ];

  // Flight plan route
  const flightPlan = [
    { x: aircraftX, y: aircraftY },
    { x: 520, y: 280 },
    { x: 680, y: 320 },
    { x: 750, y: 400 },
  ];
  
  // Precomputed top chip set (left-aligned, evenly spaced)
  const topChips = [
    { label: 'NAV', width: 70, fill: '#012a2a', stroke: '#00FFFF', color: '#00FFFF' },
    { label: `RNG ${range}NM`, width: 120, fill: '#062406', stroke: '#00FF00', color: '#00FF00' },
    { label: `HDG ${Math.round(heading).toString().padStart(3,'0')}°`, width: 140, fill: '#062406', stroke: '#00FF00', color: '#00FF00' },
    { label: weatherEnabled ? 'WXR ON' : 'WXR OFF', width: 120, fill: '#2a2400', stroke: '#FFFF00', color: '#FFFF00' },
    { label: tcasEnabled ? 'TCAS ON' : 'TCAS OFF', width: 140, fill: '#012a2a', stroke: '#00FFFF', color: '#00FFFF' },
  ];
  
  return (
    <View style={styles.container}>
      {/* Professional Navigation Display */}
      <Svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
        <Defs>
          {/* Screen gradient */}
          <RadialGradient id="screenGradient" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor="#1a1a2e" />
            <Stop offset="100%" stopColor="#0f0f23" />
          </RadialGradient>
          
          {/* Range rings gradient */}
          <RadialGradient id="rangeGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(0,255,0,0.1)" />
            <Stop offset="100%" stopColor="rgba(0,255,0,0.05)" />
          </RadialGradient>
        </Defs>

        {/* Background */}
        <Rect x="0" y="0" width="1200" height="700" fill="#000" />
        <Rect x="5" y="5" width="1190" height="690" fill="url(#screenGradient)" stroke="#333" strokeWidth="2" rx="25" />

        {/* Range Rings */}
        <G>
          {[1, 2, 3, 4].map((ring) => {
            const radius = (ring * 70);
            return (
              <Circle
                key={ring}
                cx={aircraftX}
                cy={aircraftY}
                r={radius}
                fill="none"
                stroke="rgba(0,255,0,0.3)"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            );
          })}
        </G>

        {/* Compass Rose - slightly smaller so labels fit */
        }
        <G transform={`translate(${aircraftX}, ${aircraftY})`}>
        {/* Outer compass ring */}
          <Circle cx="0" cy="0" r="300" fill="none" stroke="#00FF00" strokeWidth="2" />
          
          {/* Compass markings */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = i * 10;
            const radian = ((angle - 90) * Math.PI) / 180;
            const isMajor = angle % 30 === 0;
            const x1 = Math.cos(radian) * 290;
            const y1 = Math.sin(radian) * 290;
            const x2 = Math.cos(radian) * (isMajor ? 305 : 300);
            const y2 = Math.sin(radian) * (isMajor ? 305 : 300);
          
          return (
              <G key={angle}>
                <Line 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke="#00FF00" 
                  strokeWidth={isMajor ? "3" : "1"} 
                />
                {isMajor && (
            <SvgText
                    x={Math.cos(radian) * 315} 
                    y={Math.sin(radian) * 315 + 6} 
                    fill="#00FF00" 
                    fontSize="16" 
                    fontFamily="monospace"
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

        {/* Flight Plan Route */}
        <Path 
          d={`M ${flightPlan.map(p => `${p.x},${p.y}`).join(' L ')}`}
          fill="none" 
          stroke="#FF00FF" 
          strokeWidth="3"
          strokeDasharray="10,5"
        />

        {/* Waypoints */}
        {waypoints.map((wp, index) => (
          <G key={index}>
            {wp.type === "airport" && (
              <>
                <Polygon 
                  points={`${wp.x},${wp.y-12} ${wp.x+10},${wp.y+8} ${wp.x-10},${wp.y+8}`}
                  fill="#00FFFF" 
                  stroke="#000" 
              strokeWidth="2" 
            />
            <SvgText
              x={wp.x}
                  y={wp.y + 25} 
              fill="#00FFFF"
                  fontSize="12" 
                  fontFamily="monospace"
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
                  points={`${wp.x},${wp.y-8} ${wp.x+8},${wp.y} ${wp.x},${wp.y+8} ${wp.x-8},${wp.y}`}
                  fill="#FF00FF" 
                  stroke="#000" 
                  strokeWidth="2"
                />
                <SvgText 
                  x={wp.x} 
                  y={wp.y + 20} 
                  fill="#FF00FF" 
                  fontSize="10" 
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {wp.name}
                </SvgText>
              </>
            )}
            
            {wp.type === "vor" && (
              <>
                <Circle cx={wp.x} cy={wp.y} r="8" fill="none" stroke="#00FF00" strokeWidth="3" />
                <Line x1={wp.x-8} y1={wp.y} x2={wp.x+8} y2={wp.y} stroke="#00FF00" strokeWidth="2" />
                <Line x1={wp.x} y1={wp.y-8} x2={wp.x} y2={wp.y+8} stroke="#00FF00" strokeWidth="2" />
                <SvgText 
                  x={wp.x} 
                  y={wp.y + 22} 
                  fill="#00FF00" 
              fontSize="10"
                  fontFamily="monospace"
              textAnchor="middle"
                  fontWeight="bold"
            >
              {wp.name}
            </SvgText>
              </>
            )}
          </G>
        ))}
        
        {/* Traffic (TCAS) */}
        {tcasEnabled && traffic.map((t, index) => {
          const altDiff = Math.abs(t.altitude - altitude);
          const threatColor = t.threat === "traffic" ? "#FFFF00" : altDiff < 1000 ? "#FF0000" : "#00FF00";
          
          return (
            <G key={index}>
              <Polygon 
                points={`${t.x},${t.y-6} ${t.x+6},${t.y+6} ${t.x-6},${t.y+6}`}
                fill={threatColor} 
                stroke="#000" 
                strokeWidth="1"
              />
              <SvgText 
                x={t.x + 15} 
                y={t.y - 5} 
                fill={threatColor} 
                fontSize="9" 
                fontFamily="monospace"
                fontWeight="bold"
              >
                {t.callsign}
              </SvgText>
              <SvgText 
                x={t.x + 15} 
                y={t.y + 8} 
                fill={threatColor} 
                fontSize="8" 
                fontFamily="monospace"
              >
                FL{Math.floor(t.altitude / 100)}
              </SvgText>
            </G>
          );
        })}

        {/* Weather Radar */}
        {weatherEnabled && (
          <G>
            <Circle cx="480" cy="200" r="25" fill="rgba(255,255,0,0.3)" stroke="#FFFF00" strokeWidth="2" />
            <Circle cx="720" cy="450" r="35" fill="rgba(255,0,0,0.4)" stroke="#FF0000" strokeWidth="2" />
            <Circle cx="350" cy="400" r="15" fill="rgba(0,255,0,0.2)" stroke="#00FF00" strokeWidth="1" />
          </G>
        )}

        {/* Aircraft Symbol (Center) */}
        <G transform={`translate(${aircraftX}, ${aircraftY})`}>
          {/* Aircraft outline */}
          <Polygon 
            points="0,-15 8,10 4,10 4,15 -4,15 -4,10 -8,10"
            fill="#FFFFFF" 
            stroke="#000" 
            strokeWidth="2"
          />
          <Circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </G>

        {/* Top Information Bar - modern bezel with chips */}
        <Rect x="0" y="0" width="1200" height="50" fill="#111" stroke="#2a2a2a" strokeWidth="2" />
        {/* chips aligned from left */}
        {(() => {
          let x = 16;
          const y = 6;
          const gap = 10;
          // Compute dynamic layout bounds
          const leftEnd = 16 + topChips.reduce((sum, c) => sum + c.width, 0) + (topChips.length - 1) * gap;
          const rightChipWidth = 150;
          const rightChipX = 1200 - 20 - rightChipWidth; // keep 20px right margin like left
          const centerChipWidth = 300;
          // Center the middle chip between leftEnd and rightChipX
          const centerChipX = leftEnd + ((rightChipX - leftEnd) - centerChipWidth) / 2;

          return (
            <G>
              {topChips.map((c, i) => {
                const cx = x + c.width / 2;
                const node = (
                  <G key={i}>
                    <Rect x={x} y={y} rx={10} ry={10} width={c.width} height={30} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
                    <SvgText x={cx} y={y + 20} fill={c.color} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{c.label}</SvgText>
                  </G>
                );
                x += c.width + gap;
                return node;
              })}
              {/* center top message chip to fill empty bar symmetrically */}
              <G>
                <Rect x={centerChipX} y={y} rx={10} ry={10} width={centerChipWidth} height={30} fill="#0b0b0b" stroke="#444" strokeWidth={2} />
                <SvgText x={centerChipX + centerChipWidth / 2} y={y + 20} fill="#AAAAAA" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ATC COMM ACTIVE</SvgText>
              </G>
              {/* right-aligned FL chip */}
              <G>
                <Rect x={rightChipX} y={y} rx={10} ry={10} width={rightChipWidth} height={30} fill="#062406" stroke="#00FF00" strokeWidth={2} />
                <SvgText x={rightChipX + rightChipWidth / 2} y={y + 20} fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="middle">FL{Math.floor(altitude / 100)}</SvgText>
              </G>
            </G>
          );
        })()}

        {/* Bottom Information Panel - modern bezel with chips */}
        <Rect x="0" y="650" width="1200" height="50" fill="#111" stroke="#2a2a2a" strokeWidth="2" />
        <G>
          <G>
            <Rect x="16" y="664" rx="10" ry="10" width="140" height="30" fill="#062406" stroke="#00FF00" strokeWidth="2" />
            <SvgText x="86" y="684" fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="middle">GS {Math.round(speed)} KT</SvgText>
          </G>
          <G>
            <Rect x="170" y="664" rx="10" ry="10" width="150" height="30" fill="#012a2a" stroke="#00FFFF" strokeWidth="2" />
            <SvgText x="245" y="684" fill="#00FFFF" fontSize="12" fontFamily="monospace" textAnchor="middle">TRK {heading.toString().padStart(3,'0')}°</SvgText>
          </G>
          <G>
            <Rect x="330" y="664" rx="10" ry="10" width="220" height="30" fill="#240024" stroke="#FF00FF" strokeWidth="2" />
            <SvgText x="440" y="684" fill="#FF00FF" fontSize="12" fontFamily="monospace" textAnchor="middle">NEXT WPT02 15NM</SvgText>
          </G>
          <G>
            <Rect x="560" y="664" rx="10" ry="10" width="160" height="30" fill="#2a2400" stroke="#FFFF00" strokeWidth="2" />
            <SvgText x="640" y="684" fill="#FFFF00" fontSize="12" fontFamily="monospace" textAnchor="middle">ETA 14:25Z</SvgText>
          </G>
          {/* center bottom communication/status chip */}
          <G>
            <Rect x="740" y="664" rx="10" ry="10" width="220" height="30" fill="#0b0b0b" stroke="#444" strokeWidth="2" />
            <SvgText x="850" y="684" fill="#AAAAAA" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">COM1 118.10  STBY 121.80</SvgText>
          </G>
          <G>
            <Rect x="980" y="664" rx="10" ry="10" width="200" height="30" fill="#062406" stroke="#00FF00" strokeWidth="2" />
            <SvgText x="1080" y="684" fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="middle">LNAV  VNAV</SvgText>
          </G>
        </G>

        {/* Range Scale */}
        <G transform="translate(50, 350)">
          <Rect x="0" y="-40" width="80" height="80" fill="rgba(0,0,0,0.7)" stroke="#666" strokeWidth="2" rx="8" />
          <SvgText x="40" y="-20" fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            RANGE
          </SvgText>
          <SvgText x="40" y="0" fill="#FFFFFF" fontSize="20" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            {range}
          </SvgText>
          <SvgText x="40" y="20" fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="middle">
            NM
          </SvgText>
        </G>

        {/* Mode Selector */}
        <G transform="translate(1050, 350)">
          {(() => {
            const panelWidth = 120;
            const panelHeight = 130;
            const panelX = 0;
            const panelY = -panelHeight / 2; // center vertically around transform origin
            const padding = 12;
            const buttonWidth = panelWidth - padding * 2;
            const buttonHeight = 24;
            const buttonRadius = 6;
            const gap = 10;
            const titleY = panelY + 20;
            const firstButtonY = panelY + 34;
            const centerX = panelX + panelWidth / 2;
            const buttonX = panelX + padding;

            return (
              <G>
                <Rect x={panelX} y={panelY} width={panelWidth} height={panelHeight} fill="rgba(0,0,0,0.7)" stroke="#888" strokeWidth="2" rx="10" />
                <SvgText x={centerX} y={titleY} fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MODE</SvgText>

                {/* PLAN (active) */}
                <Rect x={buttonX} y={firstButtonY} width={buttonWidth} height={buttonHeight} fill="#FF00FF" stroke="#FF00FF" strokeWidth="1.5" rx={buttonRadius} />
                <SvgText x={centerX} y={firstButtonY + 16} fill="#000" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PLAN</SvgText>

                {/* MAP */}
                <Rect x={buttonX} y={firstButtonY + buttonHeight + gap} width={buttonWidth} height={buttonHeight} fill="#1a1a1a" stroke="#666" strokeWidth="1.5" rx={buttonRadius} />
                <SvgText x={centerX} y={firstButtonY + buttonHeight + gap + 16} fill="#FFFFFF" fontSize="12" fontFamily="monospace" textAnchor="middle">MAP</SvgText>

                {/* ROSE */}
                <Rect x={buttonX} y={firstButtonY + (buttonHeight + gap) * 2} width={buttonWidth} height={buttonHeight} fill="#1a1a1a" stroke="#666" strokeWidth="1.5" rx={buttonRadius} />
                <SvgText x={centerX} y={firstButtonY + (buttonHeight + gap) * 2 + 16} fill="#FFFFFF" fontSize="12" fontFamily="monospace" textAnchor="middle">ROSE</SvgText>
              </G>
            );
          })()}
        </G>
      </Svg>
      
      {/* Professional Data Display */}
      <View style={styles.dataPanel}>
        <View style={styles.dataGroup}>
          <Text style={styles.dataLabel}>WPT</Text>
          <Text style={styles.dataValue}>WPT02</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={styles.dataLabel}>DTK</Text>
          <Text style={styles.dataValue}>085°</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={styles.dataLabel}>DIS</Text>
          <Text style={styles.dataValue}>15.2</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={styles.dataLabel}>ETE</Text>
          <Text style={styles.dataValue}>00:12</Text>
        </View>
        <View style={styles.dataGroup}>
          <Text style={styles.dataLabel}>XTK</Text>
          <Text style={styles.dataValue}>0.1L</Text>
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
  dataPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 3,
    borderTopColor: '#444',
  },
  dataGroup: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  dataValue: {
    color: '#00FF00',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});