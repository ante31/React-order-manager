const playSound = () => {
  const audio = new Audio('/notification.wav');
  
  audio.autoplay = true;
  audio.playsInline = true;
  audio.setAttribute('webkit-playsinline', 'true');
  
  audio.play().catch(error => console.log('Playback error:', error));
};

export default playSound;
