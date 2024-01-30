self.addEventListener('push', function (event) {
  console.log("Received push");
  if (!(self.Notification && self.Notification.permission === "granted")) return;

  console.log("Processing push");
  const data = event.data?.json() ?? {};
  const title = data.title || "Default Title";
  const message = data.message || "Default message";
  const actions = data.actions || [];
  const metadata = data.metadata || {};

  const options = {
    body: message,
    vibrate: [300, 200, 300],
    data: metadata,
    actions: actions
  }

  event.waitUntil(
      self.registration.showNotification(title, options)
  );
  console.log("Showing notification");
});

self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification;
  clickedNotification.close();

  if (!event.action) {
    console.log("Normal notification click");
    return;
  }

  switch (event.action) {
    case 'confirm':
      console.log("User confirmed fire");
      break;
    case 'deny':
      console.log("User says fire is false alarm");
      break;
    default:
      console.log(`Unknown action clicked: ${event.action}`)
      break;
  }
});