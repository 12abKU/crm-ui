self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event received with no data.');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'CRM Notification';
    const options = {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: self.location.origin
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error displaying push notification:', err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // If a window client is already open, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
