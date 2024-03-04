
self.addEventListener('push', function (event) {
  console.log("Received push nottif");

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

  const channel = new BroadcastChannel('sw-messages');
  channel.postMessage({ action: 'showAuthPane', data: { /* Optional data to send */ } });
  console.log("Notification and animation trigger sent");
});

self.addEventListener('notificationclick', async (event) => {
  const clickedNotification = event.notification;
  clickedNotification.close();

  let response = null;
  if (!event.action) {
    console.log("Normal notification click");
    // Show in app confirmation here, then log to response
    console.log("hit!")
    togglePane();
    return;
  } else {
    switch (event.action) {
      case 'confirm':
        console.log("User confirmed fire");
        response = true;
        break;
      case 'deny':
        console.log("User says fire is false alarm");
        response = false;
        break;
      default:
        console.log(`Unknown action clicked: ${event.action}`)
        break;
    }
  }
  if (!(response === null)) {
    const res = await fetch(`/response?confirmed=${response}&userId=1`);
    console.log(await res.text());
  }
});