import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

const PrizeContext = createContext();

export const usePrize = () => useContext(PrizeContext);

export const PrizeProvider = ({ children }) => {
  const [prizes, setPrizes] = useState([]);
  const [drawHistory, setDrawHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 从服务器加载数据
  const loadData = useCallback(async () => {
    try {
      const [prizesData, historyData] = await Promise.all([
        api.fetchPrizes(),
        api.fetchDrawHistory()
      ]);
      setPrizes(prizesData);
      setDrawHistory(historyData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 添加奖项
  const addPrize = async (prize) => {
    try {
      const newPrize = await api.addPrize(prize);
      setPrizes(prev => [...prev, newPrize]);
      return newPrize;
    } catch (err) {
      console.error('Failed to add prize:', err);
      throw err;
    }
  };

  // 更新奖项
  const updatePrize = async (id, updates) => {
    try {
      const updated = await api.updatePrize(id, updates);
      setPrizes(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      console.error('Failed to update prize:', err);
      throw err;
    }
  };

  // 添加抽奖记录
  const addDrawRecord = async (record) => {
    try {
      const newRecord = await api.addDrawHistory(record);
      setDrawHistory(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      console.error('Failed to add draw record:', err);
      throw err;
    }
  };

  // 重置所有数据
  const resetAll = async () => {
    try {
      await api.resetAllData();
      setPrizes([]);
      setDrawHistory([]);
    } catch (err) {
      console.error('Failed to reset:', err);
      throw err;
    }
  };

  // 清空抽奖（只清除抽奖记录，保留用户和奖项配置）
  const resetLottery = async () => {
    try {
      await api.resetLottery();
      setDrawHistory([]);
      // 刷新奖项数据以获取重置后的剩余数量
      await loadData();
    } catch (err) {
      console.error('Failed to reset lottery:', err);
      throw err;
    }
  };

  // 刷新数据
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // 检查设置是否完成
  const isSetupComplete = prizes.length > 0;

  return (
    <PrizeContext.Provider value={{
      prizes,
      addPrize,
      updatePrize,
      resetAll,
      resetLottery,
      isSetupComplete,
      drawHistory,
      setDrawHistory: addDrawRecord,
      refreshData,
      loading
    }}>
      {children}
    </PrizeContext.Provider>
  );
};
