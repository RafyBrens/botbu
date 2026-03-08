import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const colors = Colors.light;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

const CATEGORY_ICONS = {
  career: 'briefcase',
  tech: 'code-slash',
  cultural: 'earth',
  academic: 'school',
  sports: 'basketball',
  entertainment: 'musical-notes',
  wellness: 'heart',
  entrepreneurship: 'rocket',
  'student-life': 'people',
};

const CATEGORY_COLORS = {
  career: '#2563eb',
  tech: '#7c3aed',
  cultural: '#ea580c',
  academic: '#059669',
  sports: '#dc2626',
  entertainment: '#db2777',
  wellness: '#0891b2',
  entrepreneurship: '#ca8a04',
  'student-life': '#4f46e5',
};

const PLACEHOLDER_COLORS = [
  '#059669', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#0891b2', '#4f46e5', '#c026d3', '#dc2626', '#ca8a04',
];

function EventImage({ event, index }) {
  const placeholderColor = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const iconName = CATEGORY_ICONS[event.category] || 'calendar';

  return (
    <View style={[styles.imagePlaceholder, { backgroundColor: placeholderColor }]}>
      <Ionicons name={iconName} size={36} color="rgba(255,255,255,0.9)" />
      <Text style={styles.imageOverlayText}>{event.category?.toUpperCase()}</Text>
    </View>
  );
}

export default function EventsPanel({ events = [], onClose, onAskAbout }) {
  if (!events || events.length === 0) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Upcoming Events</Text>
          <Text style={styles.subtitle}>{events.length} events this month</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      >
        {events.map((event, idx) => {
          const catColor = CATEGORY_COLORS[event.category] || colors.primary;
          return (
            <View key={event.id} style={[styles.card, { width: CARD_WIDTH }]}>
              <EventImage event={event} index={idx} />

              <View style={styles.cardBody}>
                <View style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
                  <Ionicons
                    name={CATEGORY_ICONS[event.category] || 'calendar'}
                    size={11}
                    color={catColor}
                  />
                  <Text style={[styles.categoryText, { color: catColor }]}>
                    {event.category}
                  </Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>{event.name || event.title}</Text>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{formatDate(event.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{event.time}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.infoText} numberOfLines={1}>{event.location}</Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>{event.description}</Text>

                {onAskAbout && (
                  <TouchableOpacity
                    style={styles.askButton}
                    onPress={() => onAskAbout(`Tell me more about the ${event.name || event.title} event`)}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                    <Text style={styles.askText}>Ask about this</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  cardRow: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  cardBody: {
    padding: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.primaryBg,
    alignSelf: 'flex-start',
  },
  askText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
