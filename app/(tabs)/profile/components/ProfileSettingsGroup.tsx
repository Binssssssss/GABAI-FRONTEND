
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { PROFILE_SECTIONS } from '../constants/profileConfig';
import { profileStyles as styles } from '../styles/profile.styles';
import { useAppTheme } from '@/app/context/ThemeContext';

interface ProfileSettingsGroupProps {
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function ProfileSettingsGroup({
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: ProfileSettingsGroupProps) {
  const { themeMode, setThemeMode } = useAppTheme();

  const handleThemePress = () => {
    Alert.alert(
      'Appearance',
      'Choose your preferred theme',
      [
        {
          text: 'System',
          onPress: () => setThemeMode('system'),
        },
        {
          text: 'Light',
          onPress: () => setThemeMode('light'),
        },
        {
          text: 'Dark',
          onPress: () => setThemeMode('dark'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <>
      {PROFILE_SECTIONS.map((section) => (
        <View
          key={section.id}
          style={styles.settingsSection}
        >
          <Text
            style={[
              styles.sectionHeader,
              { color: textSubTheme },
            ]}
          >
            {section.title}
          </Text>

          <View
            style={[
              styles.settingsGroup,
              {
                backgroundColor: cardTheme,
                borderColor: borderTheme,
              },
            ]}
          >
            {section.items.map((item, idx) => {
              const isAppearance =
                item.title.toLowerCase().includes('appearance') ||
                item.title.toLowerCase().includes('theme');

              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: borderTheme },
                      ]}
                    />
                  )}

                  <TouchableOpacity
                    style={styles.settingsItem}
                    onPress={
                      isAppearance
                        ? handleThemePress
                        : undefined
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingsItemLeft}>
                      <View
                        style={[
                          styles.iconBg,
                          {
                            backgroundColor:
                              primaryAccent + '15',
                          },
                        ]}
                      >
                        {item.iconType === 'fontawesome' ? (
                          <FontAwesome5
                            name={item.icon as any}
                            size={14}
                            color={primaryAccent}
                          />
                        ) : (
                          <Feather
                            name={item.icon as any}
                            size={16}
                            color={primaryAccent}
                          />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.settingsItemText,
                          { color: textTheme },
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      {isAppearance && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: textSubTheme,
                            marginRight: 6,
                            textTransform: 'capitalize',
                          }}
                        >
                          {themeMode}
                        </Text>
                      )}

                      <Feather
                        name="chevron-right"
                        size={18}
                        color={textSubTheme}
                      />
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      ))}
    </>
  );
}

