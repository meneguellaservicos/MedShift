self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Notificação do MedShift';
  const options = {
    body: data.body || 'Você tem um plantão em breve!',
    icon: '/icon.png',
    badge: '/icon.png',
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
}); 