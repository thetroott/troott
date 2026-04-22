import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { theme } from '@/constants/theme';

type NotFoundProps = {
    message?: string;
    onRetry?: () => void;
};

const NotFound = ({ message = 'Page not found', onRetry }: NotFoundProps) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require('../assets/images/tt/troott-logo.png')} // Replace with your own illustration
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Oops!</Text>
                <Text style={styles.message}>{message}</Text>

                {onRetry && (
                    <TouchableOpacity style={styles.button} onPress={onRetry}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white[50],
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: theme.colors.white[50],
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NotFound;
