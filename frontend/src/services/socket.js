import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      this.socket.on('connect', () => {
        console.log('Socket connecté:', this.socket.id);
        if (userId) {
          this.socket.emit('register', userId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Socket déconnecté');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Erreur de connexion socket:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  registerUser(userId) {
    if (this.socket) {
      this.socket.emit('register', userId);
    }
  }

  sendMessage(receiverId, message) {
    if (this.socket) {
      this.socket.emit('send-message', { receiverId, message });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user-online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user-offline', callback);
    }
  }

  emitTyping(receiverId, senderId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { receiverId, senderId, isTyping });
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Méthodes pour les appels vidéo
  callUser(data) {
    if (this.socket) {
      this.socket.emit('call-user', data);
    }
  }

  acceptCall(data) {
    if (this.socket) {
      this.socket.emit('accept-call', data);
    }
  }

  rejectCall(data) {
    if (this.socket) {
      this.socket.emit('reject-call', data);
    }
  }

  endCall(data) {
    if (this.socket) {
      this.socket.emit('end-call', data);
    }
  }

  sendIceCandidate(data) {
    if (this.socket) {
      this.socket.emit('ice-candidate', data);
    }
  }

  sendAnswer(data) {
    if (this.socket) {
      this.socket.emit('answer', data);
    }
  }

  onIncomingCall(callback) {
    if (this.socket) {
      this.socket.on('incoming-call', callback);
    }
  }

  off(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }
}

const socketService = new SocketService();
export default socketService;
