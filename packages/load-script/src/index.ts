export function loadScript (src: string, attrs?: Record<string, any>) {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script');

    if (attrs) {
      for (const key in attrs) {
        scriptElement.setAttribute(key, attrs[key]);
      }
    }

    scriptElement.src = src;
    scriptElement.onload = resolve;
    scriptElement.onerror = reject;
    document.body.appendChild(scriptElement);
  });
}

