// <script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
// <script>
// // VConsole will be exported to `window.VConsole` by default.
// var vConsole = new window.VConsole();
// </script>

let scriptNode: HTMLScriptElement | null = null;

export function loadVconsole (version?: string) {
  if (scriptNode) {
    return;
  }

  scriptNode = document.createElement('script');

  scriptNode.onload = () => {
    // @ts-ignore
    console.log('vConsole instance:', new window.VConsole());
  };

  scriptNode.onerror = () => {
    scriptNode?.parentNode?.removeChild(scriptNode);
    scriptNode = null;
  };

  scriptNode.src = `https://unpkg.com/vconsole@${version || 'latest'}/dist/vconsole.min.js`;
  document.body.appendChild(scriptNode);
}

export function autoLoadVconsole (key?: string) {
  const rex = new RegExp(`(^|&)${key || 'vconsole'}\\=1(&|$)`);

  if (rex.test(location.href.split('?')[1])) {
    loadVconsole();
  }
}
