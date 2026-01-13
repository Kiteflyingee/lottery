import { useState, useEffect } from 'react';
import { usePrize } from '../contexts/PrizeContext';
import { useUser } from '../contexts/UserContext';
import { Plus, Upload, Download, Edit2, Check, X, Trash2, Users, Award, Share2, RefreshCw } from 'lucide-react';
import { processImage } from '../utils/imageUtils';
import { exportWinners } from '../utils/api';
import { QRCodeCanvas } from 'qrcode.react';

export default function Settings() {
    const { prizes, addPrize, updatePrize, resetAll, resetLottery, drawHistory } = usePrize();
    const { users, refreshUsers } = useUser();

    const [newPrize, setNewPrize] = useState({
        name: '',
        count: 1,
        roundLimit: 1,
        image: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showShare, setShowShare] = useState(false);

    // 打开分享弹窗时自动刷新报名人数
    useEffect(() => {
        let interval;
        if (showShare) {
            // 立即刷新一次
            refreshUsers();
            // 每2秒自动刷新一次
            interval = setInterval(() => {
                refreshUsers();
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showShare, refreshUsers]);

    const handleAdd = async () => {
        if (!newPrize.name) return;
        setIsSubmitting(true);
        try {
            await addPrize(newPrize);
            setNewPrize({ name: '', count: 1, roundLimit: 1, image: '' });
        } catch (err) {
            alert('添加奖项失败');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 重置所有数据
    const handleResetAll = async () => {
        if (confirm('确定要重置所有数据吗？这将删除所有奖项、报名和抽奖记录！')) {
            try {
                await resetAll();
            } catch (err) {
                alert('重置失败');
                console.error(err);
            }
        }
    };


    // 导出名单
    const handleExport = () => {
        if (!drawHistory || drawHistory.length === 0) {
            alert('暂无中奖记录，无法导出');
            return;
        }
        exportWinners();
    };

    // 清空抽奖（重置抽奖，删除用户，需要重新注册）
    const handleResetLottery = async () => {
        if (confirm('确定要清空抽奖吗？这将清除所有抽奖记录和报名用户，奖项剩余数量将恢复为初始值，所有人需要重新扫码注册！')) {
            try {
                await resetLottery();
            } catch (err) {
                alert('清空抽奖失败');
                console.error(err);
            }
        }
    };

    // 开始编辑
    const startEdit = (prize) => {
        setEditingId(prize.id);
        setEditForm({
            name: prize.name,
            count: prize.count,
            roundLimit: prize.roundLimit,
            image: prize.image || ''
        });
    };

    // 取消编辑
    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    // 保存编辑
    const saveEdit = async (id) => {
        try {
            await updatePrize(id, editForm);
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            alert('保存失败');
            console.error(err);
        }
    };

    const categories = ['特别大奖', '特等奖', '一等奖', '二等奖', '三等奖'];
    const nextCategory = categories[prizes.length] || '自定义奖项';

    // 获取报名链接
    const shareUrl = window.location.origin;

    return (
        <div className="settings-container">
            {/* 分享弹窗 */}
            {showShare && (
                <div className="modal-overlay" onClick={() => setShowShare(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📱 扫码报名</h2>
                            <button onClick={() => setShowShare(false)} className="close-btn"><X /></button>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ background: 'white', padding: '20px', display: 'inline-block', borderRadius: '12px' }}>
                                <QRCodeCanvas value={shareUrl} size={250} />
                            </div>
                            <p style={{ marginTop: '20px', color: '#ccc', fontSize: '1.1rem' }}>
                                请扫描上方二维码参与抽奖
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <p style={{ marginTop: '10px', fontSize: '1.2rem', color: '#4ade80', fontWeight: 'bold', margin: 0 }}>
                                    当前已报名: {users.length} 人
                                </p>
                                <button
                                    onClick={() => refreshUsers()}
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '4px 8px', borderRadius: '50%' }}
                                    title="刷新人数"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                            <div className="share-link-box" onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                alert('链接已复制');
                            }}>
                                {shareUrl}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card settings-card">
                <div className="card-header">
                    <h1 className="title">⚙️ 抽奖设置</h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => setShowShare(true)} className="btn btn-sm" style={{ background: '#ec4899', border: 'none' }}>
                            <Share2 size={14} /> 分享抽奖
                        </button>
                        <button onClick={handleExport} className="btn btn-sm" style={{ background: '#2563eb', border: 'none' }}>
                            <Download size={14} /> 导出名单
                        </button>
                        <button onClick={handleResetLottery} className="btn btn-sm" style={{ background: '#f59e0b', border: 'none' }}>
                            <Award size={14} /> 清空抽奖
                        </button>
                        <button onClick={handleResetAll} className="btn btn-danger btn-sm">
                            <Trash2 size={14} /> 全部重置
                        </button>
                    </div>
                </div>

                <div className="prize-list">
                    {prizes.map((prize, index) => (
                        <div key={prize.id} className="prize-item">
                            {editingId === prize.id ? (
                                // 编辑模式
                                <div className="prize-edit-form">
                                    <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                                        <input
                                            type="text"
                                            className="input"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="奖项名称"
                                            style={{ flex: 2 }}
                                        />
                                        <input
                                            type="number"
                                            className="input"
                                            value={editForm.count}
                                            onChange={e => setEditForm({ ...editForm, count: parseInt(e.target.value) || 0 })}
                                            placeholder="数量"
                                            min="1"
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="number"
                                            className="input"
                                            value={editForm.roundLimit}
                                            onChange={e => setEditForm({ ...editForm, roundLimit: parseInt(e.target.value) || 0 })}
                                            placeholder="单轮"
                                            min="1"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: '#22c55e', border: 'none' }}
                                            onClick={() => saveEdit(prize.id)}
                                        >
                                            <Check size={14} /> 保存
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: '#666', border: 'none' }}
                                            onClick={cancelEdit}
                                        >
                                            <X size={14} /> 取消
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // 显示模式
                                <>
                                    <div className="prize-info">
                                        <span className="badge">{index + 1}</span>
                                        {prize.image && (
                                            <img
                                                src={prize.image}
                                                alt=""
                                                style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', marginRight: 8 }}
                                            />
                                        )}
                                        <h3>{prize.name}</h3>
                                        <div className="prize-meta">
                                            <span>数量: {prize.count}</span>
                                            <span>剩余: {prize.remaining}</span>
                                            <span>单轮: {prize.roundLimit}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: '#444', border: '1px solid #666' }}
                                        onClick={() => startEdit(prize)}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {prizes.length < 5 ? (
                    <div className="add-prize-form">
                        <h3>添加奖项 ({nextCategory})</h3>
                        <div className="form-group">
                            <label>奖项名称</label>
                            <input
                                type="text"
                                className="input"
                                value={newPrize.name}
                                placeholder={nextCategory}
                                onChange={e => setNewPrize({ ...newPrize, name: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="row">
                            <div className="form-group col">
                                <label>总数量</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={newPrize.count}
                                    onChange={e => setNewPrize({ ...newPrize, count: parseInt(e.target.value) || 0 })}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="form-group col">
                                <label>单轮抽取数</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={newPrize.roundLimit}
                                    onChange={e => setNewPrize({ ...newPrize, roundLimit: parseInt(e.target.value) || 0 })}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>奖品图片</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {newPrize.image && (
                                    <img src={newPrize.image} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                                )}
                                <label className="btn btn-sm" style={{ background: '#444', border: '1px solid #666' }}>
                                    <Upload size={14} /> 选择图片
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                try {
                                                    const base64 = await processImage(e.target.files[0]);
                                                    setNewPrize({ ...newPrize, image: base64 });
                                                } catch (err) {
                                                    alert('图片处理失败');
                                                }
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="btn btn-primary btn-block"
                            disabled={isSubmitting}
                        >
                            <Plus size={16} /> {isSubmitting ? '添加中...' : '添加奖项'}
                        </button>
                    </div>
                ) : (
                    <div className="alert success">
                        已设置满5个奖项
                    </div>
                )}

                {prizes.length > 0 && (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 12 }}>
                            已配置 {prizes.length} 个奖项，可以开始抽奖了！
                        </p>
                        <button
                            className="btn btn-primary btn-block"
                            style={{ fontSize: '1.1rem', padding: '14px 24px' }}
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('switchToLottery'));
                            }}
                        >
                            🎲 开始抽奖
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
