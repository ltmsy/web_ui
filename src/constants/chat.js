export const USER_TYPES = {
  VISITOR: 1,      // 游客
  MEMBER: 2,       // 普通会员
  ADMIN: 3,        // 超管
  GROUP_LEADER: 4, // 组长
  GROUP_MEMBER: 5  // 组员
}

export const MESSAGE_STATUS = {
  PENDING: 1,   // 待审核
  APPROVED: 2,  // 已通过
  REJECTED: 3   // 已撤销
}

export const CHAT_CONFIG = {
  WS_URL: '/api/ws/chat',
  API_URL: '/api/v1'
} 