import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { STAGE_LABELS, STAGE_STYLES, T } from '../constants/theme'

export const DEFAULT_LEAD_STAGES = [
    { stageKey: 'NEW', label: 'New Lead' },
    { stageKey: 'CONTACTED', label: 'Contacted' },
    { stageKey: 'QUALIFIED', label: 'Qualified' },
    { stageKey: 'CONVERTED', label: 'Converted' },
    { stageKey: 'LOST', label: 'Lost' },
]

export function usePipelineStages(entityType = 'DEAL') {
    const rawStages = useSelector(state => 
        entityType === 'LEAD' ? state.pipeline.leadStages : state.pipeline.dealStages
    ) || []

    const stages = rawStages && rawStages.length > 0
        ? rawStages
        : (entityType === 'LEAD' ? DEFAULT_LEAD_STAGES : [])

    const getStageLabel = useCallback((stageKey) => {
        if (!stageKey) return 'No value'
        const keyUpper = stageKey.toUpperCase()
        const found = stages.find(s => s.stageKey.toUpperCase() === keyUpper)
        if (found) return found.label
        return STAGE_LABELS[keyUpper] || stageKey
    }, [stages])

    const getStageStyle = useCallback((stageKey) => {
        if (!stageKey) return { accent: T.primary, badgeBg: T.primaryDim, badgeColor: T.primary }
        const keyUpper = stageKey.toUpperCase()
        if (STAGE_STYLES[keyUpper]) return STAGE_STYLES[keyUpper]

        // Generate dynamic style if not in STAGE_STYLES (based on index)
        const index = stages.findIndex(s => s.stageKey.toUpperCase() === keyUpper)
        const colors = [
            { accent: '#EA580C', badgeBg: 'rgba(234,88,12,0.12)', badgeColor: '#EA580C' }, // orange
            { accent: '#2563EB', badgeBg: 'rgba(37,99,235,0.12)', badgeColor: '#2563EB' }, // blue
            { accent: '#538D8D', badgeBg: 'rgba(83,141,141,0.12)', badgeColor: '#538D8D' }, // teal
            { accent: '#16A34A', badgeBg: 'rgba(22,163,74,0.12)', badgeColor: '#16A34A' }, // green
            { accent: '#DC2626', badgeBg: 'rgba(220,38,38,0.12)', badgeColor: '#DC2626' }, // red
            { accent: '#DB2777', badgeBg: 'rgba(219,39,119,0.12)', badgeColor: '#DB2777' }, // pink
            { accent: '#8B5CF6', badgeBg: 'rgba(139,92,246,0.12)', badgeColor: '#8B5CF6' }, // purple
            { accent: '#D97706', badgeBg: 'rgba(217,119,6,0.12)', badgeColor: '#D97706' }, // amber
        ]
        if (index >= 0) {
            return colors[index % colors.length]
        }
        return { accent: '#EA580C', badgeBg: 'rgba(234,88,12,0.12)', badgeColor: '#EA580C' } // fallback
    }, [stages])

    return { stages, getStageLabel, getStageStyle }
}
