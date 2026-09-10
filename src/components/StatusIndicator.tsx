import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface StatusIndicatorProps {
  isActive: boolean;
  size?: number;
}

export default function StatusIndicator({ isActive, size = 20 }: StatusIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const color = isActive ? Colors.activeGreen : Colors.inactiveGray;

  if (isActive) {
    return (
      <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
        <Animated.View
          style={[
            styles.pulse,
            {
              width: size * 1.6,
              height: size * 1.6,
              borderRadius: size * 0.8,
              backgroundColor: color,
              opacity: Animated.multiply(pulseAnim, new Animated.Value(0.3)),
            },
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
  },
});
