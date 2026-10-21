import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  CATEGORY_STYLE,
  HISTORY_FILTERS,
  HISTORY_SORTS,
  HistoryFilter,
  HistorySort,
} from '../constants/expenseCategories';
import { CategorySummary } from '../hooks/useExpensesData';

interface WalletHistoryControlsProps {
  filter: HistoryFilter;
  onFilterChange: (value: HistoryFilter) => void;
  sort: HistorySort;
  onSortChange: (value: HistorySort) => void;
  summary: CategorySummary | null;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

/** "History" title, sort menu, category chips and the monthly total. */
export default function WalletHistoryControls({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  summary,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: WalletHistoryControlsProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel = HISTORY_SORTS.find((item) => item.value === sort)?.label ?? '';

  return (
    <View style={s.wrap}>
      {/* Title + sort */}
      <View style={s.titleRow}>
        <Text style={[s.title, { color: textPrimary }]}>History</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSortOpen((open) => !open)}
          style={[s.sortButton, { borderColor: borderCol, backgroundColor: cardBg }]}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${sortLabel}`}
        >
          <Feather name="sliders" size={13} color={textSecondary} />
          <Text style={[s.sortText, { color: textPrimary }]}>{sortLabel}</Text>
          <Feather
            name={sortOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={textSecondary}
          />
        </TouchableOpacity>
      </View>

      {sortOpen && (
        <View style={[s.sortMenu, { borderColor: borderCol, backgroundColor: cardBg }]}>
          {HISTORY_SORTS.map((option) => {
            const active = option.value === sort;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                onPress={() => {
                  onSortChange(option.value);
                  setSortOpen(false);
                }}
                style={s.sortOption}
              >
                <Text
                  style={[
                    s.sortOptionText,
                    { color: active ? primaryBrown : textPrimary, fontWeight: active ? '700' : '500' },
                  ]}
                >
                  {option.label}
                </Text>
                {active && <Feather name="check" size={15} color={primaryBrown} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Category chips */}
      <View style={s.chips}>
        {HISTORY_FILTERS.map((value) => {
          const active = value === filter;
          const style = value === 'All' ? null : CATEGORY_STYLE[value];
          return (
            <TouchableOpacity
              key={value}
              activeOpacity={0.85}
              onPress={() => onFilterChange(value)}
              style={[
                s.chip,
                {
                  borderColor: active ? primaryBrown : borderCol,
                  backgroundColor: active ? primaryBrown : cardBg,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              {style && (
                <Feather
                  name={style.icon as any}
                  size={13}
                  color={active ? '#FFFFFF' : style.color}
                />
              )}
              <Text style={[s.chipText, { color: active ? '#FFFFFF' : textPrimary }]}>
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* "Food this month" */}
      {summary && (
        <View
          style={[
            s.summary,
            {
              backgroundColor: CATEGORY_STYLE[summary.category].color + '1A',
              borderColor: CATEGORY_STYLE[summary.category].color + '55',
            },
          ]}
        >
          <View
            style={[
              s.summaryIcon,
              { backgroundColor: CATEGORY_STYLE[summary.category].color + '2E' },
            ]}
          >
            <Feather
              name={CATEGORY_STYLE[summary.category].icon as any}
              size={18}
              color={CATEGORY_STYLE[summary.category].color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.summaryLabel, { color: textSecondary }]}>
              {summary.category} this month
            </Text>
            <Text style={[s.summaryValue, { color: textPrimary }]}>
              ₱{summary.total.toFixed(2)}
            </Text>
          </View>
          <Text style={[s.summaryCount, { color: textSecondary }]}>
            {summary.count} {summary.count === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 34,
  },
  sortText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  sortMenu: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 4,
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sortOptionText: {
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 13,
    height: 34,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
