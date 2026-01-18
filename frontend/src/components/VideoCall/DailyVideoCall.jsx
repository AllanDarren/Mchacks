import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';

const DailyVideoCall = ({ 
  roomUrl,
  onLeave
}) => {
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [callState, setCallState] = useState('loading');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!roomUrl || !containerRef.current) return;

    console.log('Initialisation de Daily.co avec room:', roomUrl);

    // Éviter les instances multiples
    if (callFrameRef.current) {
      console.log('CallFrame déjà existant, nettoyage...');
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }

    // Créer le callFrame Daily
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      showLeaveButton: false,
      showFullscreenButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '12px'
      }
    });

    callFrameRef.current = callFrame;

    // Rejoindre la room
    callFrame.join({ 
      url: roomUrl
    }).then(() => {
      console.log('Appel de join() réussi');
    }).catch((error) => {
      console.error('Erreur lors du join():', error);
    });

    // Écouter les événements
    callFrame
      .on('joined-meeting', () => {
        console.log('✅ Rejoint la réunion Daily.co');
        setCallState('connected');
      })
      .on('left-meeting', () => {
        console.log('Quitté la réunion');
        setCallState('ended');
        if (onLeave) onLeave();
      })
      .on('error', (error) => {
        console.error('❌ Erreur Daily:', error);
      });

    return () => {
      console.log('Nettoyage du callFrame');
      if (callFrameRef.current) {
        try {
          callFrameRef.current.destroy();
        } catch (error) {
          console.warn('Erreur lors du nettoyage:', error);
        }
        callFrameRef.current = null;
      }
    };
  }, [roomUrl, onLeave]);

  const toggleMute = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
    if (onLeave) onLeave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Conteneur de la vidéo */}
      <div ref={containerRef} className="flex-1" />

      {/* Contrôles */}
      <div className="p-6 flex justify-center gap-4 bg-gray-900">
        <button
          onClick={toggleMute}
          className={`${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600 text-white p-4 rounded-full shadow-lg transition-all`}
          title={isMuted ? 'Activer le micro' : 'Couper le micro'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600 text-white p-4 rounded-full shadow-lg transition-all`}
          title={isVideoOff ? 'Activer la vidéo' : 'Couper la vidéo'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

      {callState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connexion en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyVideoCall;
