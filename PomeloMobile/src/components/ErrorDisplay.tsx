import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface ErrorDisplayProps {
  error: Error | null;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    if (error) {
      // Extract more details from the error
      let details = error.message;

      // Try to parse JSON error messages
      try {
        if (error.message.includes('{')) {
          const jsonStart = error.message.indexOf('{');
          const jsonEnd = error.message.lastIndexOf('}') + 1;
          const jsonStr = error.message.substring(jsonStart, jsonEnd);
          const jsonObj = JSON.parse(jsonStr);
          details = JSON.stringify(jsonObj, null, 2);
        }
      } catch (e) {
        // If parsing fails, just use the original message
      }

      setErrorDetails(details);
    }
  }, [error]);

  if (!error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.message}>{error.message.split('\n')[0]}</Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView style={styles.detailsContainer}>
          <Text style={styles.details}>{errorDetails}</Text>
        </ScrollView>
      )}

      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#c62828',
    marginRight: 10,
  },
  message: {
    color: '#333',
    flex: 1,
  },
  detailsContainer: {
    maxHeight: 200,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ef9a9a',
  },
  details: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  dismissButton: {
    padding: 10,
    backgroundColor: '#ef9a9a',
    alignItems: 'center',
  },
  dismissText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
