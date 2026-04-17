function readBox(element) {
  if (!element) {
    return {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
    };
  }

  const rect = element.getBoundingClientRect();

  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    left: Math.round(rect.left),
    top: Math.round(rect.top),
  };
}

export function collectDebugInfo(doc = document, win = window) {
  const canvas = doc.querySelector('#qr-canvas');

  return {
    userAgent: navigator.userAgent,
    devicePixelRatio: win.devicePixelRatio,
    innerWidth: win.innerWidth,
    innerHeight: win.innerHeight,
    clientWidth: doc.documentElement.clientWidth,
    clientHeight: doc.documentElement.clientHeight,
    scrollWidth: doc.documentElement.scrollWidth,
    scrollHeight: doc.documentElement.scrollHeight,
    visualViewport: win.visualViewport
      ? {
          width: Math.round(win.visualViewport.width),
          height: Math.round(win.visualViewport.height),
          scale: win.visualViewport.scale,
        }
      : null,
    boxes: {
      body: readBox(doc.body),
      app: readBox(doc.querySelector('#app')),
      shell: readBox(doc.querySelector('.app-shell')),
      preview: readBox(doc.querySelector('.preview-panel')),
      qrCard: readBox(doc.querySelector('.qr-card')),
      canvasRect: readBox(canvas),
    },
    canvasBuffer: {
      width: canvas?.width ?? 0,
      height: canvas?.height ?? 0,
    },
  };
}

function formatBox(label, box) {
  return `${label}=${box.width}x${box.height}@${box.left},${box.top}`;
}

export function formatDebugInfo(snapshot) {
  const lines = [
    `userAgent=${snapshot.userAgent}`,
    `devicePixelRatio=${snapshot.devicePixelRatio}`,
    `viewport.inner=${snapshot.innerWidth}x${snapshot.innerHeight}`,
    `viewport.client=${snapshot.clientWidth}x${snapshot.clientHeight}`,
    `viewport.scroll=${snapshot.scrollWidth}x${snapshot.scrollHeight}`,
  ];

  if (snapshot.visualViewport) {
    lines.push(
      `visualViewport=${snapshot.visualViewport.width}x${snapshot.visualViewport.height} scale=${snapshot.visualViewport.scale}`,
    );
  } else {
    lines.push('visualViewport=unavailable');
  }

  lines.push(formatBox('body', snapshot.boxes.body));
  lines.push(formatBox('app', snapshot.boxes.app));
  lines.push(formatBox('shell', snapshot.boxes.shell));
  lines.push(formatBox('preview', snapshot.boxes.preview));
  lines.push(formatBox('qrCard', snapshot.boxes.qrCard));
  lines.push(formatBox('canvasRect', snapshot.boxes.canvasRect));
  lines.push(`canvasBuffer=${snapshot.canvasBuffer.width}x${snapshot.canvasBuffer.height}`);

  return lines.join('\n');
}

export function writeDebugInfoToInput(input, debugInfo) {
  input.value = debugInfo;
  return debugInfo;
}
