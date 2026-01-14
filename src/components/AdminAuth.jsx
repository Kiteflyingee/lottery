import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

// 管理员密码 - 可通过环境变量配置
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin888';
const AUTH_KEY = 'lottery_admin_auth';

// 检查是否已经登录
export function isAdminAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
}

// 清除登录状态
export function clearAdminAuth() {
    sessionStorage.removeItem(AUTH_KEY);
}

// 设置登录状态
function setAdminAuth() {
    sessionStorage.setItem(AUTH_KEY, 'true');
}

export default function AdminAuth({ onAuthenticated }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    // 检查是否已经认证
    useEffect(() => {
        if (isAdminAuthenticated()) {
            onAuthenticated();
        }
    }, [onAuthenticated]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password === ADMIN_PASSWORD) {
            setAdminAuth();
            setError('');
            onAuthenticated();
        } else {
            setError('密码错误，请重试');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setPassword('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="admin-auth-container">
            <div className={`admin-auth-card ${isShaking ? 'shake' : ''}`}>
                <div className="auth-icon-wrapper">
                    <Shield size={48} />
                </div>
                <h1 className="auth-title">管理后台</h1>
                <p className="auth-subtitle">请输入管理员密码以继续</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="admin-password">
                            <Lock size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            管理员密码
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="请输入密码"
                                autoFocus
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert error">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block btn-auth">
                        <Lock size={18} />
                        登录管理后台
                    </button>
                </form>

                <p className="auth-hint">
                    <Shield size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    仅限授权管理员访问
                </p>
            </div>
        </div>
    );
}
