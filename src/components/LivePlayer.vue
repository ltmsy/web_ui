<template>
  <div class="live-player">
    <div class="player-container" v-if="isPlaying">
      <video ref="videoPlayer" controls>
        <source :src="webPullUrl" type="application/x-mpegURL">
      </video>
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
import { ref, nextTick } from 'vue';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';

const videoPlayer = ref(null);
const isPlaying = ref(false);
const store = useConfigStore();
const { webPullUrl, playerBgUrl } = storeToRefs(store);

const startPlay = () => {
  isPlaying.value = true;
  // 确保视频加载后自动播放
  nextTick(() => {
    if (videoPlayer.value) {
      videoPlayer.value.play().catch(error => {
        console.error('自动播放失败:', error);
      });
    }
  });
};
</script>

<style scoped>
.live-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.player-container video {
  width: 100%;
  height: 100%;
}

.player-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
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

.play-button svg {
  margin-left: 5px; /* 稍微调整播放图标的位置 */
}
</style> 