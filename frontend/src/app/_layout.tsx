import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../redux/store'; // 
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
    return (
        <Provider store={store}>
            <PaperProvider>
                <Stack>
                    {/* Index screen (Login ya Dashboard) ka default header hide karne ke liye */}
                    <Stack screenOptions={{ headerShown: false }} />
                </Stack>
            </PaperProvider>
        </Provider>
    );
}