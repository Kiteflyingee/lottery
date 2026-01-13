import { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrize } from '../contexts/PrizeContext';
import { Gift, RotateCw, Minus, Plus, RefreshCw } from 'lucide-react';

export default function Lottery() {
    const { users } = useUser();
    const { prizes, updatePrize, setDrawHistory, refreshData } = usePrize();

    const [selectedPrizeId, setSelectedPrizeId] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [currentDisplayUser, setCurrentDisplayUser] = useState(null);
    const [roundWinners, setRoundWinners] = useState([]);
    const [drawCount, setDrawCount] = useState(1);
    const [isExtraDraw, setIsExtraDraw] = useState(false);
    const [winnerIds, setWinnerIds] = useState(new Set());

    // 也就是按照添加顺序反转：后添加的（通常是低等奖）排在前面
    // 假设用户按照 Settings 中的提示顺序添加（特大 -> ... -> 三等），
    // 这里的 reverse() 会让 三等奖 排在第一个，符合 "抽奖顺序从三等奖到特别大奖" 的需求。
    const sortedPrizes = useMemo(() => [...prizes].reverse(), [prizes]);

    const currentPrize = sortedPrizes.find(p => p.id === selectedPrizeId);

    // 初始化选中的奖项
    useEffect(() => {
        if (sortedPrizes.length > 0 && !selectedPrizeId) {
            setSelectedPrizeId(sortedPrizes[0].id);
        }
    }, [sortedPrizes, selectedPrizeId]);

    // 获取中奖者ID
    useEffect(() => {
        const loadWinnerIds = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/winner-ids');
                const ids = await res.json();
                setWinnerIds(new Set(ids));
            } catch (err) {
                console.error('Failed to load winner ids:', err);
            }
        };
        loadWinnerIds();
    }, [roundWinners]); // 每次抽奖后刷新

    const eligibleUsers = users.filter(u => !winnerIds.has(u.id));

    // 计算最大可抽取人数
    const maxDrawCount = currentPrize
        ? Math.min(currentPrize.remaining, eligibleUsers.length)
        : 0;

    // 当奖项改变时重置抽奖数量
    useEffect(() => {
        if (currentPrize) {
            // 如果不在补抽模式，重置为默认单轮数量
            // 如果在补抽模式，保持手动设置的数量(由handleExtraDraw初始化为1)
            if (!isExtraDraw) {
                setDrawCount(Math.min(currentPrize.roundLimit, maxDrawCount) || 1);
            }
        }
    }, [selectedPrizeId, currentPrize?.roundLimit, maxDrawCount, isExtraDraw, currentPrize]);

    // Animation Loop
    useEffect(() => {
        let interval;
        if (isRunning && eligibleUsers.length > 0) {
            interval = setInterval(() => {
                const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
                setCurrentDisplayUser(randomUser);
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRunning, eligibleUsers]);

    const handleDraw = async () => {
        if (!currentPrize) return;
        if (eligibleUsers.length === 0) {
            alert('没有更多参与者了！');
            return;
        }

        if (isRunning) {
            // Stop logic
            setIsRunning(false);
            const countToDraw = Math.min(drawCount, currentPrize.remaining, eligibleUsers.length);
            const newWinners = [];
            const pool = [...eligibleUsers];

            for (let i = 0; i < countToDraw; i++) {
                const index = Math.floor(Math.random() * pool.length);
                newWinners.push(pool[index]);
                pool.splice(index, 1);
            }

            setRoundWinners(newWinners);

            // 立即在前端标记为已中奖，防止重复
            setWinnerIds(prev => {
                const next = new Set(prev);
                newWinners.forEach(w => next.add(w.id));
                return next;
            });

            // 存储到数据库
            try {
                await setDrawHistory({
                    prizeId: currentPrize.id,
                    prizeName: currentPrize.name,
                    winners: newWinners,
                    isExtraDraw: isExtraDraw
                });

                await updatePrize(currentPrize.id, {
                    remaining: currentPrize.remaining - newWinners.length
                });
            } catch (err) {
                console.error('Failed to save draw result:', err);
            }

            setIsExtraDraw(false);

        } else {
            // 补抽模式不检查剩余数量，普通模式才检查
            if (!isExtraDraw && currentPrize.remaining <= 0) {
                alert('该奖项已抽完');
                return;
            }
            setRoundWinners([]);
            setIsRunning(true);
        }
    };

    const handleExtraDraw = () => {
        setIsExtraDraw(true);
        setDrawCount(1); // 补抽默认从1人开始
        setRoundWinners([]);
    };

    const handleCancelExtraDraw = () => {
        setIsExtraDraw(false);
        // 这里不需要手动重置 drawCount，因为 useEffect 会在 isExtraDraw 变回 false 时处理
    };

    const adjustDrawCount = (delta) => {
        const newCount = drawCount + delta;
        if (newCount >= 1 && newCount <= maxDrawCount) {
            setDrawCount(newCount);
        }
    };


    // 手动刷新报名数据已被移除，进入抽奖页面后即锁定名单


    return (
        <div className="lottery-container">
            {/* 右上角奖品图片 */}
            {currentPrize?.image && (
                <div className="prize-image-corner">
                    <img src={currentPrize.image} alt="Prize" />
                    <span className="prize-name-label">{currentPrize.name}</span>
                </div>
            )}

            <div className="lottery-header">
                <select
                    className="prize-select"
                    value={selectedPrizeId}
                    onChange={e => {
                        setSelectedPrizeId(e.target.value);
                        setRoundWinners([]);
                        setIsExtraDraw(false);
                    }}
                    disabled={isRunning}
                >
                    {sortedPrizes.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} (剩余: {p.remaining})
                        </option>
                    ))}
                </select>

                <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: '12px' }}>
                    (已锁定 {eligibleUsers.length} 人参与)
                </span>
            </div>

            <div className="lottery-stage">
                <div className="display-area">
                    {isRunning ? (
                        <div className="rolling-user">
                            <img src={currentDisplayUser?.avatarUrl} className="avatar-xl" />
                            <h2>{currentDisplayUser?.name || '...'}</h2>
                            <p>{currentDisplayUser?.employeeId || '****'}</p>
                        </div>
                    ) : roundWinners.length > 0 ? (
                        <div className="winners-grid">
                            {roundWinners.map(w => (
                                <div key={w.id} className="winner-card">
                                    <img src={w.avatarUrl} className="avatar-md" />
                                    <div className="winner-info">
                                        <h3>{w.name}</h3>
                                        <span>{w.employeeId}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="idle-state">
                            <Gift size={64} />
                            <p>准备抽奖</p>
                            <p className="text-sm opacity-70">本轮奖池: {eligibleUsers.length} 人</p>
                        </div>
                    )}
                </div>

                {/* 补抽数量选择器 */}
                {isExtraDraw && !isRunning && (
                    <div className="extra-draw-selector">
                        <span className="extra-draw-label">补抽名额:</span>
                        <div className="number-selector">
                            <button
                                className="btn btn-sm btn-number"
                                onClick={() => adjustDrawCount(-1)}
                                disabled={drawCount <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span className="draw-count">{drawCount}</span>
                            <button
                                className="btn btn-sm btn-number"
                                onClick={() => adjustDrawCount(1)}
                                disabled={drawCount >= maxDrawCount}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <button
                            className="btn btn-sm btn-cancel"
                            onClick={handleCancelExtraDraw}
                        >
                            取消
                        </button>
                    </div>
                )}

                <div className="controls">
                    <button
                        className={`btn btn-xl ${isRunning ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleDraw}
                    >
                        {isRunning ? '停止 (STOP)' : (isExtraDraw ? `补抽 ${drawCount} 人` : '开始抽奖 (START)')}
                    </button>

                    {!isRunning && !isExtraDraw && eligibleUsers.length > 0 && roundWinners.length > 0 && (
                        <button
                            className="btn btn-lg btn-extra"
                            onClick={handleExtraDraw}
                        >
                            <RotateCw size={18} />
                            补抽
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
