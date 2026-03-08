import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/Colors';
import Avatar from './ui/Avatar';

const colors = Colors.light;

const PROMPTS = [
  'Plan my Spring 2026 schedule',
  "What events are happening this week?",
  'How do I get to the Engineering Building?',
  'What dining halls are open right now?',
  'Tell me about CS 350',
  'What happened at Battle of the Bands?',
  'Free up my Mondays',
  'Show me upcoming events',
];

export default function IdleScreen({ visible, onDismiss }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(1)).current;
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      Animated.timing(textFade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setPromptIndex(prev => (prev + 1) % PROMPTS.length);
        Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.content}>
          <Avatar fallback="BU" size={100} />
          <Text style={styles.title}>Binghamton University AI</Text>
          <Text style={styles.subtitle}>Tap anywhere to start</Text>

          <View style={styles.promptBox}>
            <Text style={styles.tryLabel}>Try asking...</Text>
            <Animated.Text style={[styles.promptText, { opacity: textFade }]}>
              "{PROMPTS[promptIndex]}"
            </Animated.Text>
          </View>

          <View style={styles.dotRow}>
            {PROMPTS.map((_, i) => (
              <View key={i} style={[styles.dot, i === promptIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
  },
  promptBox: {
    marginTop: 48,
    alignItems: 'center',
    minHeight: 80,
  },
  tryLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});
