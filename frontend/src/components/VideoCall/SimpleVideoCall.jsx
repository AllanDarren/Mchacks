import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const SimpleVideoCall = ({ 
  contactId,
  contactName,
  onLeave,
  isIncoming = false,
  initialOffer = null // Nouvelle prop: l'offre WebRTC déjà reçue
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Configuration ICE servers (STUN + TURN pour traverser les NAT)
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    iceCandidatePoolSize: 10
  };

  useEffect(() => {
    initializeCall();

    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      console.log('🎥 Initialisation de l\'appel vidéo...');
      
      // Obtenir la caméra et le micro
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Flux local obtenu');

      // Créer la connexion peer
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Ajouter les tracks locaux
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Gérer les tracks distants
      peerConnection.ontrack = (event) => {
        console.log('📡 Track distant reçu');
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState('connected');
      };

      // Gérer les candidats ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Envoi ICE candidate:', event.candidate.type, event.candidate.address);
          socket.socket.emit('ice-candidate', {
            to: contactId,
            candidate: event.candidate
          });
        } else {
          console.log('✅ Tous les ICE candidates envoyés');
        }
      };

      // Vérifier l'état de la connexion
      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 État connexion:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setCallState('connected');
          console.log('✅ Connexion WebRTC établie !');
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          setCallState('disconnected');
          console.log('❌ Connexion WebRTC échouée');
        }
      };

      // État ICE
      peerConnection.oniceconnectionstatechange = () => {
        console.log('🧊 État ICE:', peerConnection.iceConnectionState);
      };

      // État de collecte ICE
      peerConnection.onicegatheringstatechange = () => {
        console.log('📡 État collecte ICE:', peerConnection.iceGatheringState);
      };

      // Si on initie l'appel, créer et envoyer l'offre
      if (!isIncoming) {
        console.log('📤 Création de l\'offre...');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.socket.emit('webrtc-offer', {
          to: contactId,
          offer: offer,
          callerName: `${user.firstName} ${user.lastName}`
        });
      } else if (initialOffer) {
        // Si on reçoit un appel et qu'on a déjà l'offre, la traiter immédiatement
        console.log('📥 Traitement de l\'offre initiale...');
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(initialOffer));
          console.log('✅ Remote description définie');
          
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socket.socket.emit('webrtc-answer', {
            to: contactId,
            answer: answer
          });
          console.log('📤 Réponse envoyée');
        } catch (error) {
          console.error('❌ Erreur traitement offre initiale:', error);
        }
      }

      // Écouter les événements WebRTC
      setupWebRTCListeners(peerConnection);

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      if (error.name === 'NotAllowedError') {
        alert('Veuillez autoriser l\'accès à la caméra et au microphone');
      } else {
        alert('Impossible d\'accéder à la caméra/microphone');
      }
      onLeave();
    }
  };

  const setupWebRTCListeners = (peerConnection) => {
    // Recevoir une offre
    socket.socket.on('webrtc-offer', async (data) => {
      console.log('📥 Offre reçue de:', data.from);
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log('✅ Remote description définie');
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.socket.emit('webrtc-answer', {
          to: data.from,
          answer: answer
        });
        console.log('📤 Réponse envoyée à:', data.from);
      } catch (error) {
        console.error('❌ Erreur traitement offre:', error);
      }
    });

    // Recevoir une réponse
    socket.socket.on('webrtc-answer', async (data) => {
      console.log('📥 Réponse reçue');
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log('✅ Réponse acceptée');
      } catch (error) {
        console.error('❌ Erreur traitement réponse:', error);
      }
    });

    // Recevoir un candidat ICE
    socket.socket.on('ice-candidate', async (data) => {
      console.log('🧊 ICE candidate reçu');
      try {
        if (data.candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('✅ ICE candidate ajouté');
        }
      } catch (error) {
        console.error('❌ Erreur ajout ICE candidate:', error);
      }
    });

    // L'autre personne a raccroché
    socket.socket.on('call-ended', () => {
      console.log('📞 Appel terminé par l\'autre personne');
      onLeave();
    });
  };

  const cleanup = () => {
    console.log('🧹 Nettoyage...');
    
    // Arrêter les flux
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Fermer la connexion peer
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Retirer les listeners
    if (socket.socket) {
      socket.socket.off('webrtc-offer');
      socket.socket.off('webrtc-answer');
      socket.socket.off('ice-candidate');
      socket.socket.off('call-ended');
    }

    // Informer l'autre personne
    socket.socket?.emit('end-call', { to: contactId });
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    onLeave();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Vidéos */}
      <div className="flex-1 relative">
        {/* Vidéo distante (plein écran) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Vidéo locale (petit coin) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        </div>

        {/* Nom du contact */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-white font-medium">{contactName}</p>
          <p className="text-gray-300 text-sm">
            {callState === 'connecting' ? 'Connexion...' : 
             callState === 'connected' ? 'En ligne' : 'Déconnecté'}
          </p>
        </div>
      </div>

      {/* Contrôles */}
      <div className="p-6 flex justify-center gap-4 bg-gray-900">
        <button
          onClick={toggleMute}
          className={`${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white p-4 rounded-full shadow-lg transition-all`}
          title={isMuted ? 'Activer le micro' : 'Couper le micro'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white p-4 rounded-full shadow-lg transition-all`}
          title={isVideoOff ? 'Activer la vidéo' : 'Couper la vidéo'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isVideoOff ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
          </svg>
        </button>

        <button
          onClick={endCall}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all"
          title="Raccrocher"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>

      {/* Indicateur de connexion */}
      {callState === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 pointer-events-none">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connexion en cours...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default SimpleVideoCall;
