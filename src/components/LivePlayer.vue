<template>
  <div class="live-player">
    <div class="player-container" v-if="isPlaying">
      <video 
        ref="videoPlayer" 
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        class="video-element"
        muted
        @play="handlePlay"
        @pause="handlePause"
        @error="handleError"
        @waiting="handleBuffering"
        @playing="handlePlaying"
        @loadstart="handleLoadStart"
        @canplay="handleCanPlay"
        @progress="handleProgress"
      >
        您的浏览器不支持视频播放。
      </video>
      <div v-if="isMobile" class="fullscreen-btn" @click.stop="toggleFullscreen">
        <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#fff" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="24" height="24">
          <path fill="#fff" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      </div>
    </div>
    <div class="player-placeholder" v-else>
      <img :src="playerBgUrl" alt="直播间背景">
      <div class="play-button" @click="startPlay">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="#fff" d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import flvjs from 'flv.js';

const videoPlayer = ref(null);
const isPlaying = ref(false);
const isFullscreen = ref(false);
const flvPlayer = ref(null);
const store = useConfigStore();
const { webPullUrl, playerBgUrl } = storeToRefs(store);

// 检测是否为移动端
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 创建 FLV 播放器
const createFlvPlayer = () => {
  if (flvjs.isSupported()) {
    console.log('浏览器支持 FLV 播放');
    if (flvPlayer.value) {
      flvPlayer.value.destroy();
    }
    
    flvPlayer.value = flvjs.createPlayer({
      type: 'flv',
      url: webPullUrl.value,
      isLive: true,
      hasAudio: true,
      hasVideo: true
    });
    
    flvPlayer.value.attachMediaElement(videoPlayer.value);
    console.log('FLV 播放器创建成功');
    return true;
  } else {
    console.error('浏览器不支持 FLV 播放');
    return false;
  }
};

// 开始播放
const startPlay = async () => {
  console.log('点击播放按钮');
  isPlaying.value = true;
  await nextTick();
  try {
    if (videoPlayer.value) {
      console.log('尝试播放视频, 播放地址:', webPullUrl.value);
      if (createFlvPlayer()) {
        console.log('开始加载 FLV 流');
        await flvPlayer.value.load();
        console.log('开始播放 FLV 流');
        await flvPlayer.value.play();
        videoPlayer.value.muted = false;
      }
    }
  } catch (error) {
    console.error('播放失败:', error);
  }
};

// 播放事件处理
const handlePlay = () => {
  console.log('视频开始播放事件触发');
};

const handlePause = () => {
  console.log('视频暂停事件触发');
};

const handleError = (error) => {
  console.error('视频播放错误:', error);
  console.log('错误详情:', {
    error: error.target.error,
    networkState: error.target.networkState,
    readyState: error.target.readyState
  });
  if (videoPlayer.value) {
    console.log('尝试重新加载视频');
    videoPlayer.value.load();
  }
};

const handleBuffering = () => {
  console.log('视频缓冲中');
};

const handlePlaying = () => {
  console.log('视频正在播放中');
};

// 新增事件处理
const handleLoadStart = () => {
  console.log('视频开始加载');
};

const handleCanPlay = () => {
  console.log('视频可以开始播放');
};

const handleProgress = (event) => {
  const video = event.target;
  if (video.buffered.length > 0) {
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const duration = video.duration;
    console.log(`视频加载进度: ${((bufferedEnd / duration) * 100).toFixed(2)}%`);
  }
};

// 切换全屏
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      // 进入全屏
      await videoPlayer.value.requestFullscreen();
      isFullscreen.value = true;
      // 强制横屏
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } else {
      // 退出全屏
      await document.exitFullscreen();
      isFullscreen.value = false;
    }
  } catch (error) {
    console.error('全屏切换失败:', error);
  }
};

// 监听全屏变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (videoPlayer.value) {
    console.log('组件卸载，停止播放');
    videoPlayer.value.pause();
  }
  if (flvPlayer.value) {
    console.log('销毁 FLV 播放器');
    flvPlayer.value.destroy();
    flvPlayer.value = null;
  }
});

// 监听视频流地址变化
watch(() => webPullUrl.value, (newUrl) => {
  if (videoPlayer.value && newUrl) {
    console.log('视频地址变化，新地址:', newUrl);
    if (isPlaying.value) {
      createFlvPlayer();
    }
  }
});
</script>

<style scoped>
.live-player {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
  display: flex;
}

.player-container {
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  &::-webkit-media-controls {
    display: none !important;
  }
  &::-webkit-media-controls-enclosure {
    display: none !important;
  }
  &::-webkit-media-controls-panel {
    display: none !important;
  }
}

/* 移动端样式优化 */
@media (max-width: 768px) {
  .video-element {
    object-fit: contain;
  }
  
  /* 移动端全屏按钮位置调整 */
  .fullscreen-btn {
    bottom: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
  }
  
  .fullscreen-btn svg {
    width: 20px;
    height: 20px;
  }
}

/* 全屏时的样式 */
:fullscreen .video-element {
  object-fit: contain;
}

:-webkit-full-screen .video-element {
  object-fit: contain;
}

:-moz-full-screen .video-element {
  object-fit: contain;
}

.player-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  flex: 1;
}

.player-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

/* 全屏按钮样式 */
.fullscreen-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.fullscreen-btn svg {
  width: 24px;
  height: 24px;
}
</style> 