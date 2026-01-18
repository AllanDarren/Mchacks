import React, { useEffect, useRef } from 'react';

const JitsiVideoCall = ({ 
  roomName,
  displayName,
  onLeave
}) => {
  const jitsiContainerRef = useRef(null);
  const jitsiRef = useRef(null);

  useEffect(() => {
    if (!roomName || !jitsiContainerRef.current) return;

    // Charger l'API Jitsi Meet
    const loadJitsi = () => {
      const domain = 'meet.jit.si';
      
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'hangup',
            'chat',
            'settings',
            'videoquality',
            'tileview'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          MOBILE_APP_PROMO: false
        },
        userInfo: {
          displayName: displayName
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiRef.current = api;

      // Événements
      api.on('readyToClose', () => {
        console.log('📞 Jitsi fermé');
        onLeave();
      });

      api.on('videoConferenceJoined', () => {
        console.log('✅ Rejoint la conférence Jitsi');
      });

      api.on('participantJoined', (participant) => {
        console.log('👤 Participant rejoint:', participant);
      });
    };

    // Vérifier si le script Jitsi est chargé
    if (window.JitsiMeetExternalAPI) {
      loadJitsi();
    } else {
      // Charger le script Jitsi
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => loadJitsi();
      document.body.appendChild(script);
    }

    return () => {
      if (jitsiRef.current) {
        jitsiRef.current.dispose();
        jitsiRef.current = null;
      }
    };
  }, [roomName, displayName, onLeave]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default JitsiVideoCall;
