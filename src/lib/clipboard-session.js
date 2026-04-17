export function createClipboardSession() {
  return {
    lastAppCopiedText: '',
    possibleExternalClipboardChange: false,
  };
}

export function markAppClipboardWrite(session, text) {
  session.lastAppCopiedText = text;
  session.possibleExternalClipboardChange = false;
}

export function notePossibleExternalClipboardChange(session) {
  if (session.lastAppCopiedText) {
    session.possibleExternalClipboardChange = true;
  }
}

export function shouldTreatClipboardReadAsStale(session, result) {
  return (
    result.status === 'success' &&
    Boolean(session.possibleExternalClipboardChange) &&
    Boolean(session.lastAppCopiedText) &&
    result.text === session.lastAppCopiedText
  );
}
