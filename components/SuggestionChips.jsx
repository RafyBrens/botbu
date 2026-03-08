import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const colors = Colors.light;

export default function SuggestionChips({ suggestions = [], onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={styles.chip}
          onPress={() => onSelect(suggestion)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.primary} />
          <Text style={styles.chipText} numberOfLines={2}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 240,
  },
  chipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    flexShrink: 1,
  },
});
