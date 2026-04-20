import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = '/ws';

let client = null;
let currentToken = null;
// destination -> { handler, sub | null }
const subscriptions = new Map();
const connectionListeners = new Set();

const notifyConnection = (connected) => {
  connectionListeners.forEach((cb) => {
    try {
      cb(connected);
    } catch (err) {
      console.error('[STOMP] connection listener threw:', err);
    }
  });
};

const bindSubscription = (destination, entry) => {
  if (!client || !client.connected) return;
  entry.sub = client.subscribe(destination, (frame) => {
    let body = null;
    try {
      body = frame.body ? JSON.parse(frame.body) : null;
    } catch (err) {
      console.error('[STOMP] payload parse error on', destination, err);
      return;
    }
    try {
      entry.handler(body, frame);
    } catch (err) {
      console.error('[STOMP] subscribe handler threw on', destination, err);
    }
  });
};

const rebindAllSubscriptions = () => {
  subscriptions.forEach((entry, destination) => {
    entry.sub = null;
    bindSubscription(destination, entry);
  });
};

const clearSubscriptionHandles = () => {
  subscriptions.forEach((entry) => {
    entry.sub = null;
  });
};

export const connect = (token) => {
  if (!token) return;
  if (client && currentToken === token) return;

  if (client) {
    clearSubscriptionHandles();
    try {
      client.deactivate();
    } catch (err) {
      console.warn('[STOMP] deactivate on token change failed:', err);
    }
    client = null;
  }

  currentToken = token;
  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
    onConnect: () => {
      console.log('[STOMP] connected');
      rebindAllSubscriptions();
      notifyConnection(true);
    },
    onWebSocketClose: () => {
      clearSubscriptionHandles();
      notifyConnection(false);
    },
    onStompError: (frame) => {
      console.error('[STOMP] broker error:', frame.headers?.message, frame.body);
    },
  });
  client.activate();
};

export const disconnect = async () => {
  if (!client) return;
  clearSubscriptionHandles();
  const toClose = client;
  client = null;
  currentToken = null;
  try {
    await toClose.deactivate();
  } catch (err) {
    console.warn('[STOMP] deactivate failed:', err);
  }
  notifyConnection(false);
};

export const subscribe = (destination, handler) => {
  const entry = { handler, sub: null };
  subscriptions.set(destination, entry);
  bindSubscription(destination, entry);

  return () => {
    const cur = subscriptions.get(destination);
    if (cur && cur.sub) {
      try {
        cur.sub.unsubscribe();
      } catch (err) {
        console.warn('[STOMP] unsubscribe failed:', err);
      }
    }
    subscriptions.delete(destination);
  };
};

export const send = (destination, payload) => {
  if (!client || !client.connected) {
    console.warn('[STOMP] send ignored — not connected:', destination);
    return false;
  }
  client.publish({
    destination,
    body: JSON.stringify(payload ?? {}),
  });
  return true;
};

export const isConnected = () => Boolean(client && client.connected);

export const addConnectionListener = (cb) => {
  connectionListeners.add(cb);
  return () => connectionListeners.delete(cb);
};
