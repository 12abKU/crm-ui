self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event received with no data.');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'CRM Notification';
    
    // Determine the URL to open on click based on type and ids
    let targetUrl = self.location.origin;
    if (data.type === 'MENTION') {
      if (data.dealId) {
        targetUrl += `/deals?dealId=${data.dealId}&tab=notes`;
      } else if (data.contactId) {
        targetUrl += `/contacts/${data.contactId}?tab=notes`;
      }
    } else if (data.type === 'ACTIVITY_REMINDER' && data.activityId) {
      targetUrl += `/activities?highlight=${data.activityId}`;
    } else if (data.type === 'CHAT_MESSAGE') {
      targetUrl += `/chat?colleagueId=${data.contactId}`;
    } else if (data.ticketId) {
      targetUrl += `/support`;
    }

    const options = {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: targetUrl
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
      // If a window client on our origin is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(self.location.origin) && 'navigate' in client && 'focus' in client) {
          client.focus();
          return client.navigate(urlToOpen).then(c => c.focus());
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
