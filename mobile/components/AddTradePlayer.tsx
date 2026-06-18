import { useState, useEffect } from 'react';
import { Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchPlayers } from '@/lib/api';

// The shape of each player the backend returns from /trades/players/search.
type SearchResult = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  value: number;
};

type AddTradePlayerProps = {
  onPlayerSelect?: (player: SearchResult) => void;
};

export default function AddTradePlayer({ onPlayerSelect }: AddTradePlayerProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  // The list of players returned by the backend search.
  const [results, setResults] = useState<SearchResult[]>([]);

  // useEffect runs code whenever a value in the dependency array [query]
  // changes. Every time the user types a new character, `query` updates,
  // which triggers this effect to call the search API.
  useEffect(() => {
    // Don't search if the user typed less than 2 characters — our backend
    // requires min_length=2 anyway and would return an error.
    if (query.length < 2) {
      setResults([]);
      return;
    }

    searchPlayers(query)
      .then((data) => setResults(data))
      .catch(() => setResults([]));
  }, [query]);

  if (!isSearching) {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsSearching(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={15} color="#A1C4F9" />
        <Text style={styles.text}>add another player</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      {/* Search input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={14} color="#A1C4F9" />
        <TextInput
          style={styles.input}
          placeholder="search player..."
          placeholderTextColor="#7A9AC4"
          value={query}
          onChangeText={setQuery}
          autoFocus
          onBlur={() => {
            // Delay so that if the user tapped a search result,
            // its onPress fires before we clear everything.
            setTimeout(() => {
              setIsSearching(false);
              setQuery('');
              setResults([]);
            }, 150);
          }}
        />
      </View>

      {/* Dropdown — only shows when there are results */}
      {results.length > 0 && (
        <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="handled">
          {results.map((player, index) => (
            <View key={player.player_id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => {
                  onPlayerSelect?.(player);
                  setIsSearching(false);
                  setQuery('');
                  setResults([]);
                }}
              >
                <Text style={styles.resultName}>{player.name}</Text>
                <Text style={styles.resultPosition}>{player.position}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#A1C4F9',
    borderRadius: 10,
    height: 26,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 10,
    color: '#A1C4F9',
    marginLeft: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 10,
    height: 26,
    paddingHorizontal: 12,
    backgroundColor: '#5B7AAA',
  },
  input: {
    flex: 1,
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 6,
    padding: 0,
  },
  dropdown: {
    backgroundColor: '#5B78A6',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 10,
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxHeight: 132,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultName: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  resultPosition: {
    fontSize: 12,
    color: '#A1C4F9',
  },
  divider: {
    height: 1,
    backgroundColor: '#A1C4F9',
  },
});
