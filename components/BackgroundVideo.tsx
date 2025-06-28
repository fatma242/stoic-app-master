// components/BackgroundVideo.tsx
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { StyleSheet } from 'react-native';

const BackgroundVideo: React.FC = () => {
  return (
    <Video
      source={require('../assets/background.mp4')}
      style={StyleSheet.absoluteFill}
      rate={1.0}
      volume={1.0}
      isMuted
      resizeMode={ResizeMode.COVER}
      shouldPlay
      isLooping
    />
  );
};

export default BackgroundVideo;
