import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SummaryCardData, SummaryItem } from '../types';

interface SummaryCardProps {
  data: SummaryCardData;
  primaryBrown: string;
  bgTheme: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  onNavigate: (route: string) => void;
}

/* Renders "You have **4 open tasks**." with the ** parts in bold. */
function RichText({
  text,
  color,
  boldColor,
}: {
  text: string;
  color: string;
  boldColor: string;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <Text style={[s.lead, { color }]}>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={index} style={{ fontWeight: '700', color: boldColor }}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        ),
      )}
    </Text>
  );
}

export function SummaryCard({
  data,
  primaryBrown,
  bgTheme,
  borderCol,
  textPrimary,
  textSecondary,
  onNavigate,
}: SummaryCardProps) {
  const row = (item: SummaryItem, index: number, isLast: boolean) => (
    <View
      key={`${item.title}-${index}`}
      style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: borderCol }]}
    >
      <View style={[s.rowBar, { backgroundColor: item.color }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={s.rowTitleLine}>
          <Text numberOfLines={1} style={[s.rowTitle, { color: textPrimary, flexShrink: 1 }]}>
            {item.title}
          </Text>
          {item.badge && (
            <Text
              style={[
                s.badge,
                { color: item.badge.color, backgroundColor: item.badge.color + '22' },
              ]}
            >
              {item.badge.text}
            </Text>
          )}
        </View>
        {!!item.subtitle && (
          <Text numberOfLines={2} style={[s.rowSub, { color: textSecondary }]}>
            {item.subtitle}
          </Text>
        )}
      </View>
      {(item.right || item.rightSub) && (
        <View style={s.rowRight}>
          {!!item.right && (
            <Text style={[s.rowRightText, { color: item.rightColor ?? textPrimary }]}>
              {item.right}
            </Text>
          )}
          {!!item.rightSub && (
            <Text style={[s.rowRightSub, { color: textSecondary }]}>{item.rightSub}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View>
      {/* Title */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.iconBox, { backgroundColor: primaryBrown + '22' }]}>
            <Feather name={data.icon as any} size={14} color={primaryBrown} />
          </View>
          <Text style={[s.title, { color: textPrimary }]}>{data.title}</Text>
        </View>
        {!!data.meta && <Text style={[s.meta, { color: textSecondary }]}>{data.meta}</Text>}
      </View>

      <RichText text={data.lead} color={textSecondary} boldColor={textPrimary} />

      {/* Numbers */}
      {data.stats && data.stats.length > 0 && (
        <View style={s.stats}>
          {data.stats.map((stat) => (
            <View key={stat.label} style={[s.stat, { backgroundColor: bgTheme }]}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[s.statValue, { color: stat.color ?? textPrimary }]}
              >
                {stat.value}
              </Text>
              <Text numberOfLines={1} style={[s.statLabel, { color: textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Sections */}
      {data.sections?.map((section) => {
        const hasItems = !!section.items?.length;
        const hasBars = !!section.bars?.length;
        if (!hasItems && !hasBars && !section.empty) return null;

        return (
          <View key={section.title} style={{ marginTop: 10 }}>
            <Text style={[s.sectionTitle, { color: textSecondary }]}>{section.title}</Text>

            {hasItems &&
              section.items!.map((item, index) =>
                row(item, index, index === section.items!.length - 1),
              )}

            {hasBars &&
              section.bars!.map((bar) => (
                <View key={bar.label} style={s.barRow}>
                  <Text numberOfLines={1} style={[s.barLabel, { color: textPrimary }]}>
                    {bar.label}
                  </Text>
                  <View style={[s.barTrack, { backgroundColor: bgTheme }]}>
                    <View
                      style={{
                        width: `${Math.max(4, Math.min(100, bar.value * 100))}%`,
                        height: '100%',
                        backgroundColor: bar.color,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <Text style={[s.barValue, { color: textPrimary }]}>{bar.display}</Text>
                </View>
              ))}

            {!hasItems && !hasBars && (
              <Text style={[s.empty, { color: textSecondary }]}>{section.empty}</Text>
            )}
          </View>
        );
      })}

      {/* Tip */}
      {!!data.tip && (
        <View style={[s.tip, { backgroundColor: primaryBrown + '14', borderColor: primaryBrown + '40' }]}>
          <Feather name="info" size={13} color={primaryBrown} style={{ marginTop: 1 }} />
          <Text style={[s.tipText, { color: textPrimary }]}>{data.tip}</Text>
        </View>
      )}

      {/* Buttons */}
      <View style={s.buttons}>
        {data.buttons.map((button) => (
          <TouchableOpacity
            key={button.label}
            onPress={() => onNavigate(button.route)}
            activeOpacity={0.85}
            style={[
              s.button,
              button.primary
                ? { backgroundColor: primaryBrown, borderColor: primaryBrown }
                : { borderColor: primaryBrown },
            ]}
          >
            <Text style={[s.buttonText, { color: button.primary ? '#FFFFFF' : primaryBrown }]}>
              {button.label}
            </Text>
            <Feather
              name={button.icon as any}
              size={12}
              color={button.primary ? '#FFFFFF' : primaryBrown}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  meta: {
    fontSize: 10.5,
    marginLeft: 8,
  },
  lead: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    gap: 6,
  },
  stat: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9.5,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 7,
  },
  rowBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    fontSize: 8.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    overflow: 'hidden',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },
  rowRightText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  rowRightSub: {
    fontSize: 10,
    marginTop: 2,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  barLabel: {
    width: 82,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barValue: {
    minWidth: 62,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    fontSize: 12,
    paddingVertical: 6,
  },
  tip: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  tipText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});