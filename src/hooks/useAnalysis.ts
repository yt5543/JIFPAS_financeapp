import { useMemo } from 'react'
import { useStore } from '../store'
import {
  classifyReturn,
  futureValue,
  investableTotal,
  requiredReturn,
  sumByCategory,
  totalAssets,
  weightedExpectedReturn,
} from '../lib/calc'

/** 画面横断で使う分析結果をまとめて計算する */
export function useAnalysis() {
  const assets = useStore((s) => s.assets)
  const goal = useStore((s) => s.goal)

  return useMemo(() => {
    const total = totalAssets(assets)
    const investable = investableTotal(assets)
    const nonInvestable = total - investable
    const years = goal.targetAge - goal.currentAge
    const currentRate = weightedExpectedReturn(assets)
    const req = requiredReturn(investable, goal.monthlyContribution, years, goal.targetAmount)
    const requiredRate = req.status === 'ok' ? req.rate : req.status === 'achieved' ? 0 : null
    const projected = years > 0 ? futureValue(investable, goal.monthlyContribution, years, currentRate) : investable
    const progress = goal.targetAmount > 0 ? Math.min(1, investable / goal.targetAmount) : 0
    const level = requiredRate === null ? null : classifyReturn(requiredRate)
    const gapAtTarget = goal.targetAmount - projected
    return {
      assets,
      goal,
      total,
      investable,
      nonInvestable,
      years,
      currentRate,
      req,
      requiredRate,
      level,
      projected,
      progress,
      gapAtTarget,
      byCategory: sumByCategory(assets),
    }
  }, [assets, goal])
}

export type Analysis = ReturnType<typeof useAnalysis>
