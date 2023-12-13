const inputField = document.getElementById('input-temp');
const fromUnitField = document.getElementById('input-unit');
const toUnitField = document.getElementById('output-unit');
const outputField = document.getElementById('output-temp');
const form = document.getElementById('converter');
const subscribeButton = document.getElementById('subscribe');

function convertTemp(value, fromUnit, toUnit) {
  if (fromUnit === 'c') {
    if (toUnit === 'f') {
      return value * 9 / 5 + 32;
    } else if (toUnit === 'k') {
      return value + 273.15;
    }
    return value;
  }
  if (fromUnit === 'f') {
    if (toUnit === 'c') {
      return (value - 32) * 5 / 9;
    } else if (toUnit === 'k') {
      return (value + 459.67) * 5 / 9;
    }
    return value;
  }
  if (fromUnit === 'k') {
    if (toUnit === 'c') {
      return value - 273.15;
    } else if (toUnit === 'f') {
      return value * 9 / 5 - 459.67;
    }
    return value;
  }
  throw new Error('Invalid unit');
}

form.addEventListener('input', () => {
  const inputTemp = parseFloat(inputField.value);
  const fromUnit = fromUnitField.value;
  const toUnit = toUnitField.value;

  const outputTemp = convertTemp(inputTemp, fromUnit, toUnit);
  outputField.value = (Math.round(outputTemp * 100) / 100) + ' ' + toUnit.toUpperCase();
});

subscribeButton.addEventListener('click', subscribe);

async function subscribe() {
  if ('serviceWorker' in navigator) {
    let sw = await navigator.serviceWorker.ready;
    let push = await sw.pushManager.subscribe(({
      userVisibleOnly: true,
      applicationServerKey: 'BDNhhvCejJLGp8C1DSl0rzwdmONmv7EsfJTk0TG0flkvmvacsY9IkufqR63Ykfs8o-goFKEYxra7vUwxBURj8rs'
    }));
    // Need to replace the user below. May be able to get user directly in express server once authentication is implemented
    const data = {
      sub: push,
      user: 'bcsotty'
    }

    fetch('/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok)
        alert('Successfully subscribed to fire alarm alerts!');
    });
  }
}
if ('serviceWorker' in navigator) {
  addEventListener('load', async () => {
    let sw = await navigator.serviceWorker.register('./sw.js');
    console.log(sw);
  });
} else {
  document.getElementById('subscribe').toggleAttribute('hidden');
}