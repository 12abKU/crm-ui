import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { WS_BROKER_URL } from '../constants/config'

export function useWebSocket(token, onNotification) {
    const clientRef = useRef(null)

    useEffect(() => {
        if (!token) {
            if (clientRef.current) {
                clientRef.current.deactivate()
                clientRef.current = null
            }
            return
        }

        const client = new Client({
            brokerURL: WS_BROKER_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('WebSocket connected')
                // Subscribe to user notifications
                client.subscribe('/user/queue/notifications', (message) => {
                    if (message.body) {
                        try {
                            const notif = JSON.parse(message.body)
                            if (onNotification) {
                                onNotification(notif)
                            }
                            // Dispatch custom DOM event for notification bell
                            window.dispatchEvent(new CustomEvent('crm-notification', { detail: notif }))
                        } catch (e) {
                            console.error('Failed to parse WebSocket message', e)
                        }
                    }
                })

                // Subscribe to internal chat messages
                client.subscribe('/user/queue/chat', (message) => {
                    if (message.body) {
                        try {
                            const chatMsg = JSON.parse(message.body)
                            window.dispatchEvent(new CustomEvent('crm-chat', { detail: chatMsg }))
                        } catch (e) {
                            console.error('Failed to parse chat WebSocket message', e)
                        }
                    }
                })

                // Subscribe to WhatsApp updates
                client.subscribe('/topic/whatsapp', (message) => {
                    if (message.body) {
                        try {
                            const msg = JSON.parse(message.body)
                            window.dispatchEvent(new CustomEvent('crm-whatsapp', { detail: msg }))
                        } catch (e) {
                            console.error('Failed to parse WhatsApp WebSocket message', e)
                        }
                    }
                })

                // Subscribe to Email updates
                client.subscribe('/topic/emails', (message) => {
                    if (message.body) {
                        try {
                            const emailMsg = JSON.parse(message.body)
                            window.dispatchEvent(new CustomEvent('crm-email', { detail: emailMsg }))
                        } catch (e) {
                            console.error('Failed to parse email WebSocket message', e)
                        }
                    }
                })

                // Subscribe to user status changes
                client.subscribe('/topic/user-status', (message) => {
                    if (message.body) {
                        try {
                            const statusUpdate = JSON.parse(message.body)
                            window.dispatchEvent(new CustomEvent('crm-user-status', { detail: statusUpdate }))
                        } catch (e) {
                            console.error('Failed to parse user status change', e)
                        }
                    }
                })

                // Subscribe to real-time Tally connection status
                client.subscribe('/topic/tally-status', (message) => {
                    if (message.body) {
                        try {
                            const tallyUpdate = JSON.parse(message.body)
                            window.dispatchEvent(new CustomEvent('crm-tally-status', { detail: tallyUpdate }))
                        } catch (e) {
                            console.error('Failed to parse Tally status update', e)
                        }
                    }
                })

            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
            },
            onWebSocketClose: () => {
                console.log('WebSocket connection closed')
            }
        })

        client.activate()
        clientRef.current = client

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate()
                clientRef.current = null
            }
        }
    }, [token, onNotification])
}
