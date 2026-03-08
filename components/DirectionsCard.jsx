import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const colors = Colors.light;

function getStaticMapUrl(lat, lng) {
  const zoom = 17;
  const size = '600x300';
  return `https://static-maps.yandex.ru/v1?ll=${lng},${lat}&z=${zoom}&size=${size}&l=map&pt=${lng},${lat},pm2rdm`;
}

function getOsmUrl(lat, lng) {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.003},${lat - 0.002},${lng + 0.003},${lat + 0.002}&layer=mapnik&marker=${lat},${lng}`;
}

function openInMaps(lat, lng, name) {
  const encodedName = encodeURIComponent(name);
  const url = Platform.select({
    ios: `maps://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}&z=17`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodedName})`,
    default: `https://maps.google.com/?q=${lat},${lng}`,
  });
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  });
}

export default function DirectionsCard({ building, onClose }) {
  if (!building) return null;

  const mapImageUrl = `https://tile.openstreetmap.org/17/${Math.floor((building.lng + 180) / 360 * Math.pow(2, 17))}/${Math.floor((1 - Math.log(Math.tan(building.lat * Math.PI / 180) + 1 / Math.cos(building.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 17))}.png`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="navigate" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{building.name}</Text>
            {building.description && (
              <Text style={styles.description} numberOfLines={2}>{building.description}</Text>
            )}
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={colors.primary} />
          <Text style={styles.mapCoords}>
            {building.lat.toFixed(4)}, {building.lng.toFixed(4)}
          </Text>
          <Text style={styles.mapAddress} numberOfLines={1}>{building.address}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.infoText}>{building.address}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={() => openInMaps(building.lat, building.lng, building.name)}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.directionsBtnText}>Open in Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => {
            const url = `https://maps.google.com/?q=${building.lat},${building.lng}`;
            Linking.openURL(url);
          }}
        >
          <Ionicons name="open-outline" size={18} color={colors.primary} />
          <Text style={styles.shareBtnText}>Google Maps</Text>
        </TouchableOpacity>
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
    alignItems: 'flex-start',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  closeBtn: { padding: 4 },
  mapContainer: {
    height: 160,
    backgroundColor: '#ecfdf5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapCoords: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mapAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  infoRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingTop: 12,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  directionsBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  shareBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
