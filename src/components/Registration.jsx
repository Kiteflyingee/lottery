import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Upload, X } from 'lucide-react';
import { processImage } from '../utils/imageUtils';

export default function Registration() {
    const { registerUser } = useUser();
    const [name, setName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [customAvatar, setCustomAvatar] = useState(''); // 用户上传的头像
    const [defaultAvatar, setDefaultAvatar] = useState(''); // 默认首字母头像
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 生成默认首字母头像
    useEffect(() => {
        if (name) {
            const seed = encodeURIComponent(name);
            setDefaultAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=c084fc,f472b6,60a5fa,34d399,fbbf24&backgroundType=gradientLinear&fontFamily=Arial&fontSize=40&chars=2`);
        } else {
            setDefaultAvatar('');
        }
    }, [name]);

    // 显示的头像：优先使用自定义头像，否则使用默认头像
    const displayAvatar = customAvatar || defaultAvatar;

    // 处理头像上传
    const handleAvatarUpload = async (e) => {
        if (e.target.files?.[0]) {
            try {
                const base64 = await processImage(e.target.files[0], 200, 200);
                setCustomAvatar(base64);
            } catch (err) {
                alert('图片处理失败');
                console.error(err);
            }
        }
    };

    // 移除自定义头像
    const removeCustomAvatar = () => {
        setCustomAvatar('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !employeeId) {
            setError('请输入姓名和工号');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // 传递自定义头像（如果有的话）
            await registerUser(name, employeeId, customAvatar || null);
        } catch (err) {
            setError('注册失败，请检查网络连接后重试');
            console.error('Registration failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="registration-container">
            <div className="card registration-card">
                <h1 className="title">🎉 年会抽奖注册</h1>
                <p className="subtitle">请输入您的信息参与抽奖</p>

                <form onSubmit={handleSubmit} className="form">
                    {/* 头像上传区域 */}
                    <div className="avatar-upload-container">
                        <div className="avatar-preview-wrapper">
                            {displayAvatar ? (
                                <img src={displayAvatar} alt="Avatar Preview" className="avatar-lg" />
                            ) : (
                                <div className="avatar-placeholder">?</div>
                            )}

                            {/* 上传按钮覆盖在头像上 */}
                            <label className="avatar-upload-btn" title="上传头像">
                                <Upload size={16} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarUpload}
                                    disabled={isSubmitting}
                                />
                            </label>

                            {/* 如果有自定义头像，显示删除按钮 */}
                            {customAvatar && (
                                <button
                                    type="button"
                                    className="avatar-remove-btn"
                                    onClick={removeCustomAvatar}
                                    title="移除自定义头像"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <p className="avatar-hint">
                            {customAvatar ? '已上传自定义头像' : '点击上传头像（可选）'}
                        </p>
                    </div>

                    {error && (
                        <div className="alert error" style={{ marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>姓名</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="请输入真实姓名"
                            className="input"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>工号</label>
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="请输入工号"
                            className="input"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '注册中...' : '立即注册'}
                    </button>
                </form>
            </div>
        </div>
    );
}
