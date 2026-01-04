import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';

const NetworkBanner = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected !== false) {
        return null;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.text}>No Internet Connection</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        paddingBottom: 8,
        paddingHorizontal: 16,
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default NetworkBanner;
