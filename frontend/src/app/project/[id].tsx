import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Text, TextInput, IconButton, Appbar, ProgressBar } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/authSlice';
import api from '../../api/axios';

// 🎨 Global Theme Colors
const getTheme = (isDark: boolean) => ({
    bg: isDark ? '#111827' : '#F9FAFB',
    surface: isDark ? '#1F2937' : '#FFFFFF',
    textMain: isDark ? '#F9FAFB' : '#111827',
    textSub: isDark ? '#9CA3AF' : '#6B7280',
    primary: isDark ? '#818CF8' : '#4F46E5',
    border: isDark ? '#374151' : '#F3F4F6',
    inputBg: isDark ? '#374151' : '#F3F4F6',
    inputText: isDark ? '#FFFFFF' : '#111827',
});

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskTitle, setTaskTitle] = useState('');
    
    const dispatch = useDispatch();
    const isDark = useSelector((state: any) => state.auth.isDark);
    const theme = getTheme(isDark);

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/projects/${id}/tasks`);
            setTasks(response.data);
        } catch (error) {}
        setLoading(false);
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleAddTask = async () => {
        if (!taskTitle.trim()) return;
        Keyboard.dismiss();
        try {
            const response = await api.post(`/projects/${id}/tasks`, { title: taskTitle });
            setTasks([...tasks, response.data]);
            setTaskTitle('');
        } catch (error) { alert("Failed to add task"); }
    };

    const handleDeleteTask = async (taskId: number) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        try { await api.delete(`/tasks/${taskId}`); } catch (e) {}
    };

    const handleToggleTask = async (task: any) => {
        const isCurrentlyCompleted = task.status === 'completed' || task.completed === true;
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: isCurrentlyCompleted ? 'pending' : 'completed', completed: !isCurrentlyCompleted } : t));
        try { await api.put(`/tasks/${task.id}`, { status: isCurrentlyCompleted ? 'pending' : 'completed', completed: !isCurrentlyCompleted }); } catch (e) {}
    };

    const completedTasks = tasks.filter(t => t.status === 'completed' || t.completed === true).length;
    const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} keyboardVerticalOffset={100} style={[styles.container, { backgroundColor: theme.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <Appbar.Header style={{ backgroundColor: theme.bg }} elevated={false}>
                <Appbar.BackAction color={theme.textMain} onPress={() => router.back()} />
                <Appbar.Content title="Task Flow" color={theme.textMain} titleStyle={{ fontWeight: 'bold' }} />
                <Appbar.Action icon={isDark ? "weather-sunny" : "moon-waning-crescent"} color={theme.textMain} onPress={() => dispatch(toggleTheme())} />
            </Appbar.Header>

            <View style={[styles.progressContainer, { borderBottomColor: theme.border }]}>
                <View style={styles.progressTextRow}>
                    <Text style={{ color: theme.textSub, fontSize: 14, fontWeight: '500' }}>Project Progress</Text>
                    <Text style={{ color: theme.primary, fontSize: 14, fontWeight: 'bold' }}>{Math.round(progress * 100)}%</Text>
                </View>
                <ProgressBar progress={progress} color={theme.primary} style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                    const isCompleted = item.status === 'completed' || item.completed === true;
                    return (
                        <View style={[
                            styles.taskItem, 
                            { backgroundColor: theme.surface, shadowOpacity: isDark ? 0 : 0.03 },
                            isCompleted && { backgroundColor: isDark ? '#111827' : '#F9FAFB', elevation: 0, borderWidth: 1, borderColor: theme.border }
                        ]}>
                            <IconButton 
                                icon={isCompleted ? "check-circle" : "circle-outline"} 
                                iconColor={isCompleted ? "#10B981" : theme.textSub} 
                                size={26} 
                                onPress={() => handleToggleTask(item)} 
                            />
                            <Text style={[
                                styles.taskTitle, 
                                { color: theme.textMain },
                                isCompleted && { textDecorationLine: 'line-through', color: theme.textSub }
                            ]}>
                                {item.title}
                            </Text>
                            <IconButton icon="trash-can-outline" iconColor="#EF4444" size={20} onPress={() => handleDeleteTask(item.id)} />
                        </View>
                    );
                }}
            />

            <View style={[styles.inputArea, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <TextInput
                    mode="outlined"
                    placeholder="What needs to be done?"
                    placeholderTextColor={theme.textSub}
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    style={[styles.inputBox, { backgroundColor: theme.inputBg }]}
                    textColor={theme.inputText} 
                    outlineColor="transparent"
                    activeOutlineColor="transparent"
                    onSubmitEditing={handleAddTask}
                    right={<TextInput.Icon icon="send" color={taskTitle ? theme.primary : theme.textSub} onPress={handleAddTask} />}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    progressContainer: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
    progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressBar: { height: 6, borderRadius: 3 },
    listContainer: { padding: 16, paddingBottom: 20 },
    taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingRight: 8, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowRadius: 4, elevation: 1 },
    taskTitle: { flex: 1, fontSize: 16, fontWeight: '500' },
    inputArea: { padding: 16, borderTopWidth: 1 },
    inputBox: { borderRadius: 24, fontSize: 16, height: 50 }
});