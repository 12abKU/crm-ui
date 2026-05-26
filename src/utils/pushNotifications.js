import api from '../api';

export async function registerServiceWorkerAndSubscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.');
    return;
  }

  try {
    // 1. Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered with scope:', registration.scope);

    // 2. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.');
      return;
    }

    // 3. Get VAPID public key
    const response = await api.get('/api/push/public-key');
    const vapidPublicKey = response.data.publicKey;

    // 4. Check if subscription exists
    let subscription = await registration.pushManager.getSubscription();

    // If no subscription, subscribe
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // 5. Send subscription to backend
    const subscriptionJson = subscription.toJSON();
    await api.post('/api/push/subscribe', {
      endpoint: subscriptionJson.endpoint,
      keys: {
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth
      }
    });

    console.log('Successfully subscribed to Push Notifications.');
  } catch (error) {
    console.error('Error during Push Notification registration/subscription:', error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
