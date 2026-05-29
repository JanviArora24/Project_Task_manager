import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, FAB, ActivityIndicator, Appbar, Portal, Dialog, Button, TextInput, IconButton } from 'react-native-paper';
import api from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout, toggleTheme } from '../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';

// Global Theme Colors
const getTheme = (isDark: boolean) => ({
    bg: isDark ? '#111827' : '#F9FAFB',
    surface: isDark ? '#1F2937' : '#FFFFFF',
    textMain: isDark ? '#F9FAFB' : '#111827',
    textSub: isDark ? '#9CA3AF' : '#6B7280',
    primary: isDark ? '#818CF8' : '#4F46E5',
    border: isDark ? '#374151' : '#F1F5F9',
    inputBg: isDark ? '#374151' : '#FFFFFF',
    inputText: isDark ? '#FFFFFF' : '#111827',
});

export default function DashboardScreen() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [visible, setVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    
    const dispatch = useDispatch();
    const isDark = useSelector((state: any) => state.auth.isDark);
    const theme = getTheme(isDark);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {}
        setLoading(false); setRefreshing(false);
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleCreateProject = async () => {
        if (!newTitle.trim()) return;
        try {
            const response = await api.post('/projects', { title: newTitle, description: newDesc });
            setProjects([response.data, ...projects]); 
            setVisible(false); setNewTitle(''); setNewDesc('');
        } catch (error) { alert("Failed to create project"); }
    };

    const handleDeleteProject = async (projectId: number) => {
        setProjects(projects.filter(p => p.id !== projectId));
        try {
            await api.delete(`/projects/${projectId}`);
        } catch (error) {
            console.log("Failed to delete project");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <Stack.Screen options={{ headerShown: false }} /> 
            <Appbar.Header style={[styles.header, { backgroundColor: theme.bg }]} elevated={false}>
                <View style={styles.headerTitleContainer}>
                    <Text style={{ color: theme.textSub, fontWeight: '500' }}>Hello, Developer 👋</Text>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: theme.textMain }}>Your Workspace</Text>
                </View>
                <Appbar.Action icon={isDark ? "weather-sunny" : "moon-waning-crescent"} color={theme.textMain} onPress={() => dispatch(toggleTheme())} />
                <Appbar.Action icon="logout" color="#EF4444" onPress={async () => {
                    await AsyncStorage.removeItem('token'); dispatch(logout()); router.replace('/');
                }} />
            </Appbar.Header>

            {loading ? ( <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 50}} /> ) : (
                <FlatList
                    data={projects}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProjects();}} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textMain }}>It's quiet here...</Text>
                            <Text style={{ color: theme.textSub, marginTop: 8 }}>Create a project to get started.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Surface style={[styles.projectCard, { backgroundColor: theme.surface, borderColor: theme.border }]} elevation={isDark ? 0 : 1}>
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{color: theme.primary}}>📁</Text>
                                    <Button mode="text" textColor={theme.primary} onPress={() => router.push(`/project/${item.id}` as any)} compact>Open</Button>
                                </View>
                                <IconButton icon="trash-can-outline" iconColor="#EF4444" size={20} onPress={() => handleDeleteProject(item.id)} />
                            </View>
                            <Text style={[styles.projectTitle, { color: theme.textMain }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={{ color: theme.textSub, lineHeight: 20 }} numberOfLines={2}>{item.description || "No description provided."}</Text>
                        </Surface>
                    )}
                />
            )}

            <FAB icon="plus" label="New Project" style={[styles.fab, { backgroundColor: theme.primary }]} color="white" onPress={() => setVisible(true)} uppercase={false} />

            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ backgroundColor: theme.surface, borderRadius: 24 }}>
                    <Dialog.Title style={{ fontWeight: 'bold', color: theme.textMain }}>Create Project</Dialog.Title>
                    <Dialog.Content>
                        <TextInput label="Title" value={newTitle} onChangeText={setNewTitle} mode="outlined" style={{ marginBottom: 12, backgroundColor: theme.inputBg }} textColor={theme.inputText} outlineColor={theme.border} activeOutlineColor={theme.primary} />
                        <TextInput label="Description" value={newDesc} onChangeText={setNewDesc} mode="outlined" multiline numberOfLines={3} style={{ backgroundColor: theme.inputBg }} textColor={theme.inputText} outlineColor={theme.border} activeOutlineColor={theme.primary} />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setVisible(false)} textColor={theme.textSub}>Cancel</Button>
                        <Button onPress={handleCreateProject} mode="contained" style={{backgroundColor: theme.primary, borderRadius: 8}}>Create</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: 80, paddingHorizontal: 8 },
    headerTitleContainer: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
    listContainer: { padding: 16, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    projectCard: { padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    folderIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    projectTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, borderRadius: 16 },
});