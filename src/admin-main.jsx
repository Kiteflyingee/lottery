import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { PrizeProvider, usePrize } from './contexts/PrizeContext'
import Settings from './components/Settings'
import Lottery from './components/Lottery'
import { Settings as SettingsIcon, Monitor } from 'lucide-react'

function AdminApp() {
    const { isSetupComplete } = usePrize();
    const [view, setView] = useState('settings');

    // 监听来自 Settings 的切换事件
    useEffect(() => {
        const handleSwitchToLottery = () => {
            if (isSetupComplete) {
                setView('lottery');
            }
        };

        window.addEventListener('switchToLottery', handleSwitchToLottery);
        return () => window.removeEventListener('switchToLottery', handleSwitchToLottery);
    }, [isSetupComplete]);

    return (
        <>
            {view === 'settings' && <Settings />}
            {view === 'lottery' && <Lottery />}

            {/* Admin Switcher Controls (Overlay) */}
            <div className="admin-fab-container">
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
