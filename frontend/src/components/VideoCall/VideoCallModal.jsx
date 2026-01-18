import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';

const VideoCallModal = ({ 
  isOpen, 
  onClose, 
  contactId, 
  contactName,
  isIncoming = false,
  callerId = null
}) => {
  const { socket: socketService } = useSocket();
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Obtenir le vrai socket depuis socketService
  const socket = socketService.socket;

  useEffect(() => {
    if (!isOpen || !socket) return;

    if (isIncoming) {
      // Appel entrant - attendre la réponse de l'utilisateur
    } else {
      // Appel sortant - initier l'appel
      initCall();
    }

    // Écouter les événements de signalisation
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('ice-candidate');
      socket.off('offer');
      socket.off('answer');
      socket.off('call-ended');
      cleanupCall();
    };
  }, [isOpen, isIncoming, socket]);

  const initCall = async () => {
    try {
      // Obtenir l'accès à la caméra et au micro
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Créer la connexion peer-to-peer
      createPeerConnection();

      // Ajouter les pistes locales
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Créer et envoyer l'offre
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit('call-user', {
        to: contactId,
        offer: offer
      });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'appel:', error);
      alert('Impossible d\'accéder à la caméra/micro. Vérifiez vos permissions.');
      onClose();
    }
  };

  const acceptCall = async () => {
    try {
      setCallStatus('connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeerConnection();

      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      socket.emit('accept-call', { to: callerId });
      setCallStatus('connected');

    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'appel:', error);
      alert('Impossible d\'accéder à la caméra/micro.');
      rejectCall();
    }
  };

  const rejectCall = () => {
    socket.emit('reject-call', { to: callerId || contactId });
    onClose();
  };

  const endCall = () => {
    socket.emit('end-call', { to: contactId });
    cleanupCall();
    onClose();
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    // Gérer les candidats ICE
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: contactId,
          candidate: event.candidate
        });
      }
    };

    // Gérer la réception des pistes distantes
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallStatus('connected');
      }
    };
  };

  const handleCallAccepted = async () => {
    setCallStatus('connecting');
  };

  const handleCallRejected = () => {
    alert('Appel refusé');
    onClose();
  };

  const handleOffer = async ({ offer, from }) => {
    if (!peerConnectionRef.current) return;
    
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    
    socket.emit('answer', { to: from, answer });
  };

  const handleAnswer = async ({ answer }) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async ({ candidate }) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Erreur lors de l\'ajout du candidat ICE:', error);
    }
  };

  const handleCallEnded = () => {
    cleanupCall();
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-6xl max-h-screen p-4 flex flex-col">
        {/* En-tête */}
        <div className="text-white mb-4 text-center">
          <h2 className="text-2xl font-bold">{contactName}</h2>
          <p className="text-sm text-gray-300">
            {callStatus === 'calling' && 'Appel en cours...'}
            {callStatus === 'incoming' && 'Appel entrant...'}
            {callStatus === 'connecting' && 'Connexion...'}
            {callStatus === 'connected' && 'En communication'}
          </p>
        </div>

        {/* Zone vidéo */}
        <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-900">
          {/* Vidéo distante (plein écran) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Vidéo locale (petit écran en bas à droite) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          </div>
        </div>

        {/* Contrôles */}
        <div className="mt-4 flex justify-center gap-4">
          {callStatus === 'incoming' ? (
            <>
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all"
                title="Accepter"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all"
                title="Refuser"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600 text-white p-4 rounded-full shadow-lg transition-all`}
                title={isMuted ? 'Activer le micro' : 'Couper le micro'}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`${!isVideoOn ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600 text-white p-4 rounded-full shadow-lg transition-all`}
                title={isVideoOn ? 'Couper la vidéo' : 'Activer la vidéo'}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all"
                title="Raccrocher"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default VideoCallModal;
