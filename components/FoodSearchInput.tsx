/**
 * FoodSearchInput — ingredient name field with Open Food Facts live search.
 *
 * Replaces the plain TextInput for ingredient name. As the user types, results
 * from OFF appear in a dropdown. Tapping a result populates the name and all
 * available nutrition fields. The user can still type freely for manual entry —
 * submitting without selecting a result works exactly as before.
 *
 * Gemini Vision (Option B) will bypass this component entirely — it writes
 * directly to the ingredient array via the photo analysis hook. This component
 * only handles the search-by-name path.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { searchFoodByName, FoodSearchResult } from '../lib/openFoodFactsService';

interface FoodSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectResult: (result: FoodSearchResult) => void;
  placeholder?: string;
}

export default function FoodSearchInput({
  value,
  onChangeText,
  onSelectResult,
  placeholder = 'Search ingredient or product…',
}: FoodSearchInputProps) {
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the active query so stale responses from slow requests are discarded.
  const activeQuery = useRef<string>('');

  const runSearch = useCallback(async (query: string) => {
    activeQuery.current = query;
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const hits = await searchFoodByName(query);
      if (activeQuery.current !== query) return; // stale — discard
      setResults(hits);
      setShowDropdown(hits.length > 0);
    } catch {
      if (activeQuery.current !== query) return;
      setError('Could not reach Open Food Facts. Check your connection.');
      setShowDropdown(false);
    } finally {
      if (activeQuery.current === query) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => runSearch(value), 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value, runSearch]);

  const handleSelect = (result: FoodSearchResult) => {
    onChangeText(result.productName);
    onSelectResult(result);
    // Clear all search state so nothing lingers after selection
    setShowDropdown(false);
    setResults([]);
    setError(null);
    setLoading(false);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#0a7ea4"
            style={styles.spinner}
          />
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {showDropdown && results.length > 0 && (
        <View style={styles.dropdown}>
          {/* Plain ScrollView instead of FlatList — max 10 items, no virtualization
              needed, and avoids the nested VirtualizedList warning from the parent
              ScrollView on the food screen. */}
          <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {results.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.resultRow,
                  i === results.length - 1 && styles.resultRowLast,
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                    <Text style={styles.thumbnailPlaceholderText}>?</Text>
                  </View>
                )}
                <View style={styles.resultText}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.productMeta} numberOfLines={1}>
                    {[
                      item.brand,
                      `${Math.round(item.nutritionData.caloriesPer100g)} kcal/100g`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  spinner: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#c0392b',
    marginTop: 4,
    marginLeft: 2,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
    maxHeight: 260,
    zIndex: 200,
  },
  list: {
    borderRadius: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultRowLast: {
    borderBottomWidth: 0,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    color: '#bbb',
    fontSize: 18,
  },
  resultText: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 2,
  },
  productMeta: {
    fontSize: 12,
    color: '#687076',
  },
});
