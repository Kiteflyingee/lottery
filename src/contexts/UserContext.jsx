import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(() => {
        // currentUser 仍使用 localStorage（标识当前浏览器的用户）
        const saved = localStorage.getItem('lottery_current_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    // 从服务器加载用户
    const loadUsers = useCallback(async () => {
        try {
            const data = await api.fetchUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // 保存当前用户到 localStorage
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('lottery_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('lottery_current_user');
        }
    }, [currentUser]);

    // 注册用户
    const registerUser = async (name, employeeId, customAvatar = null) => {
        try {
            const user = await api.registerUser(name, employeeId, customAvatar);
            setCurrentUser(user);
            // 刷新用户列表
            await loadUsers();
            return user;
        } catch (err) {
            console.error('Failed to register:', err);
            throw err;
        }
    };

    // 手动刷新用户数据
    const refreshUsers = useCallback(async () => {
        await loadUsers();
    }, [loadUsers]);

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <UserContext.Provider value={{
            users,
            currentUser,
            registerUser,
            logout,
            refreshUsers,
            loading
        }}>
            {children}
        </UserContext.Provider>
    );
};
