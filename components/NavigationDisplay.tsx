import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText, G, Rect } from "react-native-svg";

interface NavigationDisplayProps {
  heading: number;
  targetHeading: number;
}

export default function NavigationDisplay({
  heading,
  targetHeading,
}: NavigationDisplayProps) {
  // Generate waypoints and airports around the compass
  const waypoints = [
    { name: 'LIRQ', x: 180, y: 60, type: 'airport' },
    { name: 'LGKV', x: 220, y: 80, type: 'waypoint' },
    { name: 'LGSR', x: 160, y: 140, type: 'waypoint' },
    { name: 'LGPZ', x: 120, y: 120, type: 'waypoint' },
    { name: 'LOTS', x: 100, y: 180, type: 'waypoint' },
  ];
  
  const compassNumbers = [36, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33];
  
  return (
    <View style={styles.container}>
      {/* Top status bar */}
      <View style={styles.topBar}>
        <Text style={styles.callsign}>GS459 TAS467</Text>
        <Text style={styles.coordinates}>227°/66</Text>
        <Text style={styles.trackInfo}>TRK 138 MAG</Text>
        <Text style={styles.mesInfo}>MES 1552.92 124NM</Text>
      </View>
      
      <Svg width="100%" height="280" viewBox="0 0 300 280">
        {/* Outer compass ring */}
        <Circle cx="150" cy="140" r="120" fill="none" stroke="#00FFFF" strokeWidth="2" />
        <Circle cx="150" cy="140" r="100" fill="none" stroke="#00FFFF" strokeWidth="1" />
        <Circle cx="150" cy="140" r="80" fill="none" stroke="#00FFFF" strokeWidth="1" />
        <Circle cx="150" cy="140" r="60" fill="none" stroke="#00FFFF" strokeWidth="1" />
        <Circle cx="150" cy="140" r="40" fill="none" stroke="#00FFFF" strokeWidth="1" />
        <Circle cx="150" cy="140" r="20" fill="none" stroke="#00FFFF" strokeWidth="1" />
        
        {/* Compass numbers */}
        {compassNumbers.map((num, index) => {
          const angle = (num * 10) - 90; // Convert to degrees, offset by 90
          const rad = angle * Math.PI / 180;
          const x = 150 + 110 * Math.cos(rad);
          const y = 140 + 110 * Math.sin(rad);
          
          return (
            <SvgText
              key={num}
              x={x}
              y={y + 4}
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {num.toString()}
            </SvgText>
          );
        })}
        
        {/* Waypoints and airports */}
        {waypoints.map((wp, index) => (
          <G key={wp.name}>
            <Circle 
              cx={wp.x} 
              cy={wp.y} 
              r={wp.type === 'airport' ? 6 : 4} 
              fill="none" 
              stroke="#00FFFF" 
              strokeWidth="2" 
            />
            <SvgText
              x={wp.x}
              y={wp.y - 10}
              fill="#00FFFF"
              fontSize="10"
              textAnchor="middle"
            >
              {wp.name}
            </SvgText>
          </G>
        ))}
        
        {/* Track line */}
        <Line x1="150" y1="140" x2="200" y2="90" stroke="#00FF00" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Current heading indicator (top of compass) */}
        <G>
          <Path d="M 145 25 L 150 15 L 155 25 Z" fill="#FFFFFF" />
          <Rect x="145" y="25" width="10" height="15" fill="#FFFFFF" />
        </G>
        
        {/* Aircraft symbol (center) */}
        <G>
          <Path d="M 145 135 L 150 125 L 155 135 L 150 145 Z" fill="#FFFFFF" />
          <Line x1="140" y1="140" x2="160" y2="140" stroke="#FFFFFF" strokeWidth="2" />
        </G>
        
        {/* Heading bug */}
        <G transform={`rotate(${targetHeading - heading} 150 140)`}>
          <Path d="M 145 25 L 150 15 L 155 25 Z" fill="#FF00FF" />
        </G>
        
        {/* Range rings labels */}
        <SvgText x="170" y="145" fill="#00FFFF" fontSize="10">{'20'}</SvgText>
        <SvgText x="190" y="145" fill="#00FFFF" fontSize="10">{'40'}</SvgText>
        <SvgText x="210" y="145" fill="#00FFFF" fontSize="10">{'60'}</SvgText>
      </Svg>
      
      {/* Bottom status bar */}
      <View style={styles.bottomBar}>
        <View style={styles.leftInfo}>
          <Text style={styles.infoText}>ARPT</Text>
          <Text style={styles.infoText}>LTBA</Text>
        </View>
        <View style={styles.centerInfo}>
          <Text style={styles.infoText}>TFC</Text>
          <Text style={styles.infoText}>LBBG</Text>
        </View>
        <View style={styles.rightInfo}>
          <Text style={styles.infoText}>FMC L</Text>
          <Text style={styles.infoText}>WXR</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000033',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
    minHeight: 350,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000033',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  callsign: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  coordinates: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  trackInfo: {
    color: '#00FF00',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mesInfo: {
    color: '#FF00FF',
    fontSize: 11,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000033',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  leftInfo: {
    alignItems: 'flex-start',
  },
  centerInfo: {
    alignItems: 'center',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  infoText: {
    color: '#00FFFF',
    fontSize: 10,
    marginVertical: 1,
  },
});