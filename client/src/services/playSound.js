const playSound = () => {
  const audio = new Audio('/sci-fi.wav');
  
  // Attempt to apply attributes for autoplay (though may still require user interaction)
  audio.autoplay = true;
  audio.playsInline = true; // Adds playsinline, but mainly for video
  audio.setAttribute('webkit-playsinline', 'true'); // For webkit-based browsers (Safari, etc.)
  
  // Try playing the audio and catch the error if autoplay fails due to user interaction restriction
  audio.play().catch(error => console.log('Playback error:', error));
};

export default playSound;