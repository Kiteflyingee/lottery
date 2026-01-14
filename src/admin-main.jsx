import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { PrizeProvider, usePrize } from './contexts/PrizeContext'
import Settings from './components/Settings'
import Lottery from './components/Lottery'
import AdminAuth, { isAdminAuthenticated } from './components/AdminAuth'
import { Settings as SettingsIcon, Monitor, LogOut } from 'lucide-react'

function AdminApp() {
    const { isSetupComplete } = usePrize();
    const [view, setView] = useState('settings');
    const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());

    const handleAuthenticated = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const handleLogout = useCallback(() => {
        sessionStorage.removeItem('lottery_admin_auth');
        setIsAuthenticated(false);
    }, []);

    // 监听来自 Settings 的切换事件 - 所有hooks必须在条件返回之前
    useEffect(() => {
        if (!isAuthenticated) return; // 未认证时不需要监听

        const handleSwitchToLottery = () => {
            if (isSetupComplete) {
                setView('lottery');
            }
        };

        window.addEventListener('switchToLottery', handleSwitchToLottery);
        return () => window.removeEventListener('switchToLottery', handleSwitchToLottery);
    }, [isSetupComplete, isAuthenticated]);

    // 如果未认证，显示登录界面
    if (!isAuthenticated) {
        return <AdminAuth onAuthenticated={handleAuthenticated} />;
    }

    return (
        <>
            {view === 'settings' && <Settings />}
            {view === 'lottery' && <Lottery />}

            {/* Admin Switcher Controls (Overlay) */}
            <div className="admin-fab-container">
                {/* 登出按钮 */}
                <button title="退出登录" className="fab fab-logout" onClick={handleLogout}>
                    <LogOut size={20} />
                </button>
                {/* 在设置页面显示切换到抽奖的按钮 */}
                {isSetupComplete && view === 'settings' && (
                    <button title="切换到抽奖页面" className="fab" onClick={() => setView('lottery')}>
                        <Monitor size={20} />
                    </button>
                )}
                {/* 在抽奖页面显示切换到设置的按钮 */}
                {view === 'lottery' && (
                    <button title="设置" className="fab" onClick={() => setView('settings')}>
                        <SettingsIcon size={20} />
                    </button>
                )}
            </div>
        </>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <UserProvider>
            <PrizeProvider>
                <AdminApp />
            </PrizeProvider>
        </UserProvider>
    </StrictMode>,
)
