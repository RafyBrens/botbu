import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const colors = Colors.light;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = [
  '8:00', '8:30', '9:00', '9:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '1:00', '1:30',
  '2:00', '2:30', '3:00', '3:30', '4:00', '4:30',
  '5:00', '5:30', '6:00',
];

const COURSE_COLORS = [
  '#059669', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#0891b2', '#4f46e5', '#c026d3',
];

function parseTimeToIndex(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return -1;
  let hour = parseInt(match[1]);
  const min = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  const totalMinutes = hour * 60 + min;
  const baseMinutes = 8 * 60; // 8:00 AM
  return Math.floor((totalMinutes - baseMinutes) / 30);
}

function parseDays(daysStr) {
  const dayMap = { M: 0, T: 1, W: 2, R: 3, F: 4 };
  const result = [];
  for (const char of daysStr) {
    if (dayMap[char] !== undefined) result.push(dayMap[char]);
  }
  return result;
}

function buildGridBlocks(courses) {
  const blocks = [];
  courses.forEach((course, idx) => {
    const startIdx = parseTimeToIndex(course.startTime);
    const endIdx = parseTimeToIndex(course.endTime);
    if (startIdx < 0 || endIdx < 0) return;
    const days = parseDays(course.days);
    const colorIndex = idx % COURSE_COLORS.length;
    days.forEach(day => {
      blocks.push({
        day,
        startSlot: startIdx,
        endSlot: endIdx,
        label: course.code,
        sublabel: course.location || '',
        color: COURSE_COLORS[colorIndex],
      });
    });
  });
  return blocks;
}

export default function ScheduleGrid({ alternatives = [], onClose }) {
  const [activeAlt, setActiveAlt] = useState(0);

  if (!alternatives || alternatives.length === 0) return null;

  const currentSchedule = alternatives[activeAlt];
  const blocks = buildGridBlocks(currentSchedule.courses || []);
  const cellW = 64;
  const cellH = 26;
  const gridContentWidth = 44 + cellW * 5 + 16;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule Planner</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {alternatives.length > 1 && (
        <View style={styles.altRow}>
          {alternatives.map((alt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.altTab, i === activeAlt && styles.altTabActive]}
              onPress={() => setActiveAlt(i)}
            >
              <Text style={[styles.altTabText, i === activeAlt && styles.altTabTextActive]}>
                Option {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {currentSchedule.name && (
        <Text style={styles.altName}>{currentSchedule.name}</Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={[styles.grid, { width: gridContentWidth }]}>
          {/* Day headers */}
          <View style={styles.headerRow}>
            <View style={styles.timeLabel} />
            {DAYS.map(day => (
              <View key={day} style={[styles.dayHeader, { width: cellW }]}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time rows */}
          {HOURS.map((hour, rowIdx) => (
            <View key={hour} style={styles.row}>
              <View style={styles.timeLabel}>
                {rowIdx % 2 === 0 && (
                  <Text style={styles.timeText}>{hour}</Text>
                )}
              </View>
              {DAYS.map((_, colIdx) => {
                const block = blocks.find(
                  b => b.day === colIdx && b.startSlot === rowIdx
                );
                const isOccupied = blocks.some(
                  b => b.day === colIdx && rowIdx >= b.startSlot && rowIdx < b.endSlot
                );
                const isBlockStart = block !== undefined;

                if (isBlockStart) {
                  const span = block.endSlot - block.startSlot;
                  return (
                    <View
                      key={colIdx}
                      style={[
                        styles.cell,
                        {
                          width: cellW,
                          height: cellH * span,
                          backgroundColor: block.color,
                          position: 'absolute',
                          left: 44 + colIdx * cellW,
                          top: 0,
                          zIndex: 2,
                          borderRadius: 6,
                          padding: 3,
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text style={styles.blockLabel} numberOfLines={1}>{block.label}</Text>
                      {span >= 2 && (
                        <Text style={styles.blockSublabel} numberOfLines={1}>{block.sublabel}</Text>
                      )}
                    </View>
                  );
                }

                if (isOccupied) {
                  return <View key={colIdx} style={[styles.cell, { width: cellW, height: cellH }]} />;
                }

                return (
                  <View
                    key={colIdx}
                    style={[styles.cell, styles.freeCell, { width: cellW, height: cellH }]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {(currentSchedule.courses || []).map((course, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COURSE_COLORS[i % COURSE_COLORS.length] }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {course.code} - {course.name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          {currentSchedule.totalCredits || '?'} credits
        </Text>
        <Text style={styles.statDivider}>|</Text>
        <Text style={styles.statText}>
          {(currentSchedule.courses || []).length} courses
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  altRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  altTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  altTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  altTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  altTabTextActive: {
    color: '#fff',
  },
  altName: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  gridScroll: {
    maxHeight: 400,
    paddingHorizontal: 8,
  },
  grid: {
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    position: 'relative',
  },
  timeLabel: {
    width: 44,
    justifyContent: 'flex-start',
    paddingRight: 4,
  },
  timeText: {
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  freeCell: {
    backgroundColor: '#f9fafb',
    borderColor: colors.border,
    borderWidth: 0.5,
  },
  blockLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  blockSublabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
  },
  legend: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  statDivider: {
    color: colors.border,
  },
});
