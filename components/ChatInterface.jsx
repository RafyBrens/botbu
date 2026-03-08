import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import ChatArea from './ChatArea';
import EmptyState from './EmptyState';
import Sidebar from './Sidebar';
import IdleScreen from './IdleScreen';
import Colors from '../constants/Colors';
import { ENDPOINTS } from '../constants/Api';
import { useChat } from '../hooks/useChat';

const colors = Colors.light;
const IDLE_TIMEOUT = 45000; // 45 seconds

export default function ChatInterface() {
  const {
    currentChat,
    chats,
    messages,
    isLoading,
    inputValue,
    setInputValue,
    streamingMessage,
    isReady,
    startNewChat,
    selectChat,
    handleDeleteChat,
    sendMessage,
  } = useChat();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [idleVisible, setIdleVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const idleTimer = useRef(null);
  const inputRef = useRef(null);
  const recordingRef = useRef(null);
  const micPulse = useRef(new Animated.Value(1)).current;

  const resetIdleTimer = useCallback(() => {
    setIdleVisible(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (messages.length === 0) {
        setIdleVisible(true);
      }
    }, IDLE_TIMEOUT);
  }, [messages.length]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [resetIdleTimer]);

  const handleSendMessage = useCallback((content) => {
    resetIdleTimer();
    sendMessage(content);
  }, [sendMessage, resetIdleTimer]);

  const handleNewChat = () => {
    startNewChat();
    resetIdleTimer();
  };

  const handleDismissIdle = () => {
    setIdleVisible(false);
    resetIdleTimer();
  };

  const stopRecording = useCallback(async () => {
    micPulse.stopAnimation();
    micPulse.setValue(1);

    if (!recordingRef.current) {
      setIsListening(false);
      return;
    }

    setIsListening(false);
    setIsTranscribing(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        setIsTranscribing(false);
        return;
      }

      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });

      const res = await fetch(ENDPOINTS.TRANSCRIBE, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.transcript) {
        setInputValue((prev) => (prev ? prev + ' ' + data.transcript : data.transcript));
        inputRef.current?.focus();
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      Alert.alert('Error', 'Could not transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  }, [micPulse, setInputValue]);

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow microphone access to use voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsListening(true);

      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Could not start recording.');
    }
  }, [micPulse]);

  const handleMicPress = useCallback(() => {
    resetIdleTimer();
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, stopRecording, startRecording, resetIdleTimer]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
      </View>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <View style={styles.container}>
      <IdleScreen visible={idleVisible && !hasMessages} onDismiss={handleDismissIdle} />

      <Sidebar
        visible={sidebarVisible}
        currentChat={currentChat}
        chats={chats}
        onNewChat={handleNewChat}
        onChatSelect={selectChat}
        onDeleteChat={handleDeleteChat}
        onClose={() => setSidebarVisible(false)}
      />

      {hasMessages ? (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ChatArea
            currentChat={currentChat}
            messages={messages}
            isLoading={isLoading}
            streamingMessage={streamingMessage}
            onToggleSidebar={() => setSidebarVisible(true)}
            onDeleteChat={handleDeleteChat}
            onSendMessage={handleSendMessage}
            onPrefillInput={(text) => { setInputValue(text); resetIdleTimer(); }}
          />

          <View style={styles.inputContainer}>
            {(isListening || isTranscribing) && (
              <View style={styles.listeningBar}>
                <Animated.View style={[styles.micPulseCircle, isTranscribing && { backgroundColor: colors.primary }, { transform: [{ scale: isListening ? micPulse : 1 }] }]}>
                  <Ionicons name={isTranscribing ? 'hourglass' : 'mic'} size={16} color="#fff" />
                </Animated.View>
                <Text style={styles.listeningText}>
                  {isTranscribing ? 'Transcribing...' : 'Listening... tap Stop when done'}
                </Text>
                {isListening && (
                  <TouchableOpacity onPress={handleMicPress}>
                    <Text style={styles.listeningStop}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.micButton, isListening && styles.micButtonActive]}
                onPress={handleMicPress}
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
                onChangeText={(text) => {
                  setInputValue(text);
                  resetIdleTimer();
                  if (isListening && text.length > 0) {
                    setIsListening(false);
                    micPulse.stopAnimation();
                    micPulse.setValue(1);
                  }
                }}
                placeholder={isListening ? 'Speak now...' : 'Ask anything...'}
                placeholderTextColor={isListening ? colors.primary : colors.inputPlaceholder}
                multiline
                maxLength={2000}
                editable={!isLoading}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  const trimmed = inputValue.trim();
                  if (!trimmed || isLoading) return;
                  handleSendMessage(trimmed);
                  setInputValue('');
                }}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputValue.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={() => {
                  const trimmed = inputValue.trim();
                  if (!trimmed || isLoading) return;
                  handleSendMessage(trimmed);
                  setInputValue('');
                }}
                disabled={!inputValue.trim() || isLoading}
              >
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <EmptyState
          onSendMessage={handleSendMessage}
          inputValue={inputValue}
          setInputValue={(text) => { setInputValue(text); resetIdleTimer(); }}
          isLoading={isLoading}
          onToggleSidebar={() => setSidebarVisible(true)}
          onMicPress={handleMicPress}
          isListening={isListening}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  chatContainer: {
    flex: 1,
  },
  inputContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
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
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.inputText,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    lineHeight: 22,
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
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  listeningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  micPulseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  listeningStop: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
});
