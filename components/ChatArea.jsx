import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Avatar from './ui/Avatar';
import SuggestionChips from './SuggestionChips';
import ScheduleGrid from './ScheduleGrid';
import EventsPanel from './EventsPanel';
import DirectionsCard from './DirectionsCard';
import { findBuilding } from '../constants/Buildings';

const colors = Colors.light;

function parseSuggestions(text) {
  const match = text.match(/\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/);
  if (!match) return { cleanText: text, suggestions: [] };
  const cleanText = text.replace(/\[SUGGESTIONS:.*?\]/, '').trim();
  return { cleanText, suggestions: [match[1], match[2], match[3]] };
}

function parseScheduleData(text) {
  const match = text.match(/\[SCHEDULE_DATA\]([\s\S]*?)\[\/SCHEDULE_DATA\]/);
  if (!match) return { cleanText: text, scheduleData: null };
  try {
    const data = JSON.parse(match[1]);
    const cleanText = text.replace(/\[SCHEDULE_DATA\][\s\S]*?\[\/SCHEDULE_DATA\]/, '').trim();
    return { cleanText, scheduleData: data };
  } catch {
    return { cleanText: text, scheduleData: null };
  }
}

function parseEventsData(text) {
  const match = text.match(/\[EVENTS_DATA\]([\s\S]*?)\[\/EVENTS_DATA\]/);
  if (!match) return { cleanText: text, eventsData: null };
  try {
    const data = JSON.parse(match[1]);
    const cleanText = text.replace(/\[EVENTS_DATA\][\s\S]*?\[\/EVENTS_DATA\]/, '').trim();
    return { cleanText, eventsData: data };
  } catch {
    return { cleanText: text, eventsData: null };
  }
}

function parseNavigate(text) {
  const match = text.match(/\[NAVIGATE:([^\]]+)\]/);
  if (!match) return { cleanText: text, navigateBuilding: null };
  const buildingName = match[1].trim();
  const building = findBuilding(buildingName);
  const cleanText = text.replace(/\[NAVIGATE:[^\]]+\]/g, '').trim();
  return { cleanText, navigateBuilding: building };
}

function stripAllTags(text) {
  let cleaned = text;
  cleaned = cleaned.replace(/\[SCHEDULE_DATA\][\s\S]*?\[\/SCHEDULE_DATA\]/g, '');
  cleaned = cleaned.replace(/\[EVENTS_DATA\][\s\S]*?\[\/EVENTS_DATA\]/g, '');
  cleaned = cleaned.replace(/\[NAVIGATE:[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[SUGGESTIONS:.*?\]/g, '');
  // Remove incomplete opening tags during streaming
  cleaned = cleaned.replace(/\[SCHEDULE_DATA\][\s\S]*$/g, '');
  cleaned = cleaned.replace(/\[EVENTS_DATA\][\s\S]*$/g, '');
  cleaned = cleaned.replace(/\[SUGGESTIONS:[\s\S]*$/g, '');
  cleaned = cleaned.replace(/\[NAVIGATE:[\s\S]*$/g, '');
  return cleaned.trim();
}

function detectPendingTags(text) {
  const hasScheduleOpen = text.includes('[SCHEDULE_DATA]') && !text.includes('[/SCHEDULE_DATA]');
  const hasEventsOpen = text.includes('[EVENTS_DATA]') && !text.includes('[/EVENTS_DATA]');
  return { pendingSchedule: hasScheduleOpen, pendingEvents: hasEventsOpen };
}

export default function ChatArea({
  currentChat,
  messages,
  isLoading,
  streamingMessage,
  onToggleSidebar,
  onDeleteChat,
  onSendMessage,
  onPrefillInput,
}) {
  const flatListRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading && !streamingMessage) {
      const createBounce = (dot, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -6, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          ])
        );
      const a1 = createBounce(dot1, 0);
      const a2 = createBounce(dot2, 100);
      const a3 = createBounce(dot3, 200);
      a1.start(); a2.start(); a3.start();
      return () => { a1.stop(); a2.stop(); a3.stop(); };
    }
  }, [isLoading, streamingMessage]);

  useEffect(() => {
    if (flatListRef.current && (messages.length > 0 || streamingMessage)) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const handleCopy = async (content, messageId) => {
    try {
      await Clipboard.setStringAsync(content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSpeak = async (content, messageId) => {
    if (speakingId === messageId) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }

    const cleaned = content
      .replace(/\*\*/g, '')
      .replace(/[*_~`#]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 4000);

    if (!cleaned) return;

    Speech.stop();
    setSpeakingId(messageId);

    try {
      Speech.speak(cleaned, {
        language: 'en-US',
        rate: 0.95,
        pitch: 1.0,
        onDone: () => setSpeakingId(null),
        onStopped: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    } catch {
      setSpeakingId(null);
    }
  };

  const handleDelete = () => {
    if (currentChat) onDeleteChat(currentChat.id);
  };

  const listData = [...messages];
  if (streamingMessage) {
    listData.push({ id: '__streaming__', type: 'streaming', content: streamingMessage });
  } else if (isLoading) {
    listData.push({ id: '__loading__', type: 'loading' });
  }

  const renderMessage = ({ item, index }) => {
    if (item.type === 'loading') {
      return (
        <View style={styles.botRow}>
          <Avatar fallback="BU" size={32} style={styles.avatar} />
          <View style={styles.loadingBubble}>
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
          </View>
        </View>
      );
    }

    if (item.type === 'streaming') {
      const cleanedStream = stripAllTags(item.content);
      const { pendingSchedule, pendingEvents } = detectPendingTags(item.content);

      return (
        <View style={styles.botRow}>
          <Avatar fallback="BU" size={32} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            {cleanedStream.length > 0 && (
              <View style={styles.botBubble}>
                <Text style={styles.botText}>
                  {cleanedStream}
                  {!pendingSchedule && !pendingEvents && <Text style={styles.cursor}>|</Text>}
                </Text>
              </View>
            )}
            {pendingSchedule && (
              <View style={styles.pendingCard}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <Text style={styles.pendingCardText}>Building your schedule...</Text>
              </View>
            )}
            {pendingEvents && (
              <View style={styles.pendingCard}>
                <Ionicons name="megaphone" size={20} color={colors.primary} />
                <Text style={styles.pendingCardText}>Loading events...</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (item.type === 'user') {
      return (
        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    // Bot message: parse suggestions, schedule, events
    let displayText = item.content;
    let suggestions = [];
    let scheduleData = null;
    let eventsData = null;

    const sugResult = parseSuggestions(displayText);
    displayText = sugResult.cleanText;
    suggestions = sugResult.suggestions;

    const schedResult = parseScheduleData(displayText);
    displayText = schedResult.cleanText;
    scheduleData = schedResult.scheduleData;

    const evtResult = parseEventsData(displayText);
    displayText = evtResult.cleanText;
    eventsData = evtResult.eventsData;

    const navResult = parseNavigate(displayText);
    displayText = navResult.cleanText;
    const navigateBuilding = navResult.navigateBuilding;

    const isLastBotMessage = index === listData.length - 1 ||
      (index === listData.length - 2 && (listData[listData.length - 1]?.type === 'loading' || listData[listData.length - 1]?.type === 'streaming'));

    return (
      <View style={styles.botRow}>
        <Avatar fallback="BU" size={32} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.botBubble}>
            <Text style={styles.botText}>{displayText}</Text>
          </View>

          {scheduleData && (
            <ScheduleGrid alternatives={scheduleData.alternatives || [scheduleData]} />
          )}

          {eventsData && (
            <EventsPanel
              events={eventsData}
              onAskAbout={onPrefillInput || onSendMessage}
            />
          )}

          {navigateBuilding && (
            <DirectionsCard building={navigateBuilding} />
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCopy(displayText, item.id)}
            >
              <Ionicons
                name={copiedMessageId === item.id ? 'checkmark' : 'copy-outline'}
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.actionText}>
                {copiedMessageId === item.id ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSpeak(displayText, item.id)}
            >
              <Ionicons
                name={speakingId === item.id ? 'stop-circle' : 'volume-high-outline'}
                size={14}
                color={speakingId === item.id ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.actionText, speakingId === item.id && { color: colors.primary }]}>
                {speakingId === item.id ? 'Stop' : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLastBotMessage && suggestions.length > 0 && !isLoading && (
            <SuggestionChips suggestions={suggestions} onSelect={onPrefillInput || onSendMessage} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onToggleSidebar} style={styles.menuButton}>
            <Ionicons name="menu" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Avatar fallback="BU" size={32} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentChat?.title || 'Binghamton University AI'}
            </Text>
            <Text style={styles.headerSubtitle}>Your intelligent campus assistant</Text>
          </View>
        </View>
        {currentChat && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={listData}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  menuButton: { padding: 4 },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  deleteButton: { padding: 8 },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: colors.userBubble,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    color: colors.userBubbleText,
    fontSize: 15,
    lineHeight: 22,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  avatar: { marginTop: 2 },
  botBubble: {
    flex: 1,
    backgroundColor: colors.botBubble,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botText: {
    color: colors.botBubbleText,
    fontSize: 15,
    lineHeight: 22,
  },
  cursor: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.botBubble,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primaryBg || '#ecfdf5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primaryLight || '#a7f3d0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  pendingCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
