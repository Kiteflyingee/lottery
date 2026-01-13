import { useState } from 'react';
import { usePrize } from '../contexts/PrizeContext';
import { Plus, Upload, Download } from 'lucide-react';
import { processImage } from '../utils/imageUtils';
import { exportWinners } from '../utils/api';

export default function Settings() {
    const { prizes, addPrize, resetPrizes } = usePrize();

    const [newPrize, setNewPrize] = useState({
        name: '',
        count: 1,
        roundLimit: 1,
        image: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleReset = async () => {
        if (confirm('确定要重置所有数据吗？这将删除所有奖项、报名和抽奖记录！')) {
            try {
                await resetPrizes();
            } catch (err) {
                alert('重置失败');
                console.error(err);
            }
        }
    };

    const categories = ['特别大奖', '特等奖', '一等奖', '二等奖', '三等奖'];
    const nextCategory = categories[prizes.length] || '自定义奖项';

    return (
        <div className="settings-container">
            <div className="card settings-card">
                <div className="card-header">
                    <h1 className="title">⚙️ 抽奖设置</h1>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={exportWinners} className="btn btn-sm" style={{ background: '#2563eb', border: 'none' }}>
                            <Download size={14} style={{ marginRight: 4 }} /> 导出名单
                        </button>
                        <button onClick={handleReset} className="btn btn-danger btn-sm">
                            重置数据
                        </button>
                    </div>
                </div>

                <div className="prize-list">
                    {prizes.map((prize, index) => (
                        <div key={prize.id} className="prize-item">
                            <div className="prize-info">
                                <span className="badge">{index + 1}</span>
                                <h3>{prize.name}</h3>
                                <div className="prize-meta">
                                    <span>数量: {prize.count}</span>
                                    <span>单轮: {prize.roundLimit}</span>
                                </div>
                            </div>
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
