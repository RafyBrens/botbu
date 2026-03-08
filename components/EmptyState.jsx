import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Avatar from './ui/Avatar';

const colors = Colors.light;

const QUICK_ACTIONS = [
  {
    id: 'schedule',
    icon: 'calendar',
    label: 'Plan My Semester',
    color: '#059669',
    suggestion: 'Plan my Spring 2026 schedule as a Junior CS major with 15 credits',
  },
  {
    id: 'events',
    icon: 'megaphone',
    label: "What's Happening",
    color: '#7c3aed',
    suggestion: 'What events are happening this week?',
  },
  {
    id: 'directions',
    icon: 'navigate',
    label: 'Find a Building',
    color: '#0891b2',
    suggestion: 'How do I get to the Engineering Building?',
  },
  {
    id: 'dining',
    icon: 'restaurant',
    label: 'Dining Hours',
    color: '#ea580c',
    suggestion: 'What dining halls are open right now?',
  },
];

export default function EmptyState({
  onSendMessage,
  inputValue,
  setInputValue,
  isLoading,
  onToggleSidebar,
  onMicPress,
  isListening,
}) {
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputValue('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <TouchableOpacity style={styles.menuButton} onPress={onToggleSidebar}>
        <Ionicons name="menu" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoWrapper}>
            <Avatar fallback="BU" size={80} />
          </View>
          <Text style={styles.heading}>How can I help you?</Text>
          <Text style={styles.subtitle}>Ask me anything about Binghamton University</Text>
        </View>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickCard}
              onPress={() => { setInputValue(action.suggestion); inputRef.current?.focus(); }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputWrapper}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={() => { onMicPress?.(); inputRef.current?.focus(); }}
          >
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={20}
              color={isListening ? '#fff' : colors.textSecondary}
            />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={isListening ? 'Speak now...' : 'Ask anything...'}
            placeholderTextColor={isListening ? colors.primary : colors.inputPlaceholder}
            multiline
            maxLength={2000}
            editable={!isLoading}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputValue.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    gap: 10,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.inputText,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    lineHeight: 22,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});
