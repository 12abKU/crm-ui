import { Device } from '@twilio/voice-sdk'
import api from '../api'

let device = null
let activeCall = null

export const twilioService = {

    async initDevice(onIncoming, onStateChange) {
        try {
            const { data } = await api.get('/api/voice/token')
            device = new Device(data.token, {
                logLevel: 1,
                codecPreferences: ['opus', 'pcmu'],
            })

            device.on('registered', () => onStateChange?.('ready'))
            device.on('error', (err) => {
                console.error('Twilio Device error:', err)
                onStateChange?.('error')
            })
            device.on('incoming', (call) => {
                activeCall = call
                onIncoming?.(call)
            })

            await device.register()
            return device
        } catch (err) {
            console.error('Failed to init Twilio device:', err)
            throw err
        }
    },

    async makeCall({ toNumber, contactId, contactName, onCallLog, onStateChange, onError }) {
        if (!device) throw new Error('Device not initialized')

        const { data: callLog } = await api.post('/api/voice/call', {
            contactId: contactId || null,
            toNumber,
        })

        onCallLog?.(callLog)

        const call = await device.connect({
            params: { To: toNumber },
        })

        activeCall = call

        // ✅ Grab CallSid immediately after connect — it's available right on the call object
        const sid = call.parameters?.CallSid
        if (sid) {
            api.patch(`/api/voice/call/${callLog.id}/sid`, { callSid: sid }, { suppressErrorToast: true }).catch(() => { })
        }

        call.on('ringing', () => onStateChange?.('ringing'))

        call.on('accept', async (acceptedCall) => {
            onStateChange?.('in-progress')
            // Also try here in case it wasn't available immediately
            const acceptSid = acceptedCall?.parameters?.CallSid || call.parameters?.CallSid
            if (acceptSid && acceptSid !== sid) {
                await api.patch(`/api/voice/call/${callLog.id}/sid`, {
                    callSid: acceptSid,
                }, { suppressErrorToast: true }).catch(() => { })
            }
        })

        call.on('disconnect', () => {
            onStateChange?.('completed')
            activeCall = null
        })
        call.on('error', (err) => {
            console.error('Call error:', err)
            onError?.(err)
            onStateChange?.('failed')
            activeCall = null
        })

        return { call, callLog }
    },

    hangup() {
        activeCall?.disconnect()
        activeCall = null
    },

    mute(muted) {
        activeCall?.mute(muted)
    },

    destroy() {
        device?.destroy()
        device = null
        activeCall = null
    },
}
