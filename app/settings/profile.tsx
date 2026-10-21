import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useProfileTheme } from '@/app/(tabs)/profile/hooks';
import { ScreenHeader } from '@/components/settings/SettingsUI';
import FieldError from '@/components/FieldError';
import { LIMITS, checkName, cleanSpaces } from '@/utils/formValidation';

// Keep the photo small enough to store with the account (matches the backend limit).
const MAX_AVATAR_LENGTH = 400_000;

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    const fieldError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;
    return fieldError || data?.message || 'Could not save your profile. Please try again.';
  }
  return 'Could not save your profile. Please try again.';
};

export default function EditProfileScreen() {
  const theme = useProfileTheme();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const initialName = String(user?.fullName || user?.name || '');
  const initialAvatar = typeof user?.avatar === 'string' ? user.avatar : null;

  const [fullName, setFullName] = useState(initialName);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedName = cleanSpaces(fullName);
  const nameChanged = trimmedName !== cleanSpaces(initialName);
  const hasChanges = nameChanged || avatar !== initialAvatar;

  // Only check the name when it was changed, so a photo-only update still works.
  const [nameTouched, setNameTouched] = useState(false);
  const nameError = nameChanged ? checkName(fullName) : '';
  const showNameError = nameTouched && Boolean(nameError);

  const canSave = !nameError && trimmedName.length > 0 && hasChanges && !isSaving;

  const pickPhoto = async () => {
    // expo-image-picker is a native module. Older app builds don't include
    // it, so load it only when available instead of crashing the screen.
    if (!requireOptionalNativeModule('ExponentImagePicker')) {
      Alert.alert(
        'Update required',
        'Photo upload needs the latest version of GabAi. You can still change your name.',
      );
      return;
    }

    try {
      setIsPicking(true);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ImagePicker: typeof import('expo-image-picker') = require('expo-image-picker');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.25,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${asset.base64}`;

      if (dataUrl.length > MAX_AVATAR_LENGTH) {
        Alert.alert(
          'Photo too large',
          'Please choose a smaller photo or crop it closer.',
        );
        return;
      }

      setAvatar(dataUrl);
    } catch (error) {
      console.error('Failed to pick photo:', error);
      Alert.alert('Photo unavailable', 'Could not open your photos. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  const removePhoto = () => setAvatar(null);

  const save = async () => {
    if (nameError || !trimmedName) {
      setNameTouched(true);
      return;
    }

    try {
      setIsSaving(true);

      const body: { fullName: string; avatar?: string | null } = { fullName: trimmedName };
      if (avatar !== initialAvatar) body.avatar = avatar;

      const response = await api.patch('/account/profile', body);
      const saved = response.data?.data ?? {};

      await updateUser({
        fullName: saved.fullName ?? trimmedName,
        name: saved.fullName ?? trimmedName,
        avatar: saved.avatar ?? null,
      });

      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Save failed', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgTheme }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Edit profile" theme={theme} />

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              onPress={pickPhoto}
              disabled={isPicking || isSaving}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              style={[styles.avatar, { backgroundColor: theme.primaryAccent }]}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(trimmedName || 'U')}</Text>
              )}

              <View style={[styles.cameraBadge, { backgroundColor: theme.cardTheme, borderColor: theme.borderTheme }]}>
                {isPicking ? (
                  <ActivityIndicator size="small" color={theme.primaryAccent} />
                ) : (
                  <Feather name="camera" size={14} color={theme.textTheme} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.photoActions}>
              <TouchableOpacity onPress={pickPhoto} disabled={isPicking || isSaving}>
                <Text style={[styles.photoActionText, { color: theme.primaryAccent }]}>
                  {avatar ? 'Change photo' : 'Add photo'}
                </Text>
              </TouchableOpacity>

              {avatar && (
                <TouchableOpacity onPress={removePhoto} disabled={isSaving}>
                  <Text style={[styles.photoActionText, { color: theme.errorRed }]}>Remove photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Name */}
          <Text style={[styles.label, { color: theme.textSubTheme }]}>Full name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => setNameTouched(true)}
            placeholder="Your name"
            placeholderTextColor={theme.textSubTheme}
            autoCapitalize="words"
            maxLength={LIMITS.nameMax}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: theme.textTheme,
                borderColor: showNameError ? '#EF4444' : theme.borderTheme,
                backgroundColor: theme.cardTheme,
              },
            ]}
          />
          <FieldError message={showNameError ? nameError : ''} />

          {/* Email (read only) */}
          <Text style={[styles.label, { color: theme.textSubTheme }]}>Email</Text>
          <Text style={[styles.readOnly, { color: theme.textSubTheme }]}>
            {String(user?.email || '')}
          </Text>

          <TouchableOpacity
            onPress={save}
            disabled={!canSave}
            accessibilityRole="button"
            style={[
              styles.saveButton,
              { backgroundColor: theme.primaryAccent, opacity: canSave ? 1 : 0.5 },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  photoSection: { alignItems: 'center', marginTop: 12, marginBottom: 24 },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 104, height: 104, borderRadius: 52 },
  avatarText: { color: '#FFFFFF', fontSize: 34, fontWeight: '700' },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: { flexDirection: 'row', gap: 24, marginTop: 12 },
  photoActionText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  readOnly: { fontSize: 15, paddingVertical: 4 },
  saveButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
