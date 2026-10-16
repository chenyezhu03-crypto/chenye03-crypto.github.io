export type ChannelPost = {
  id: string
  author: string
  body: string
  createdAt: number
}

export type ChannelRoom = {
  id: string
  label: string
  desc: string
  category: 'continent' | 'topic'
  posts: ChannelPost[]
}

export const CHANNEL_ROOMS: ChannelRoom[] = [
  {
    id: 'asia',
    label: '亚洲区',
    desc: '东亚/东南亚/南亚交流',
    category: 'continent',
    posts: [
      {
        id: 'p1',
        author: '签证小助手',
        body: '日本单次签：按领区准备流水，勿信「包过」。',
        createdAt: Date.now() - 3600000,
      },
    ],
  },
  {
    id: 'europe',
    label: '欧洲区',
    desc: '申根/英国/东欧',
    category: 'continent',
    posts: [],
  },
  {
    id: 'americas',
    label: '美洲区',
    desc: '北美/南美长线',
    category: 'continent',
    posts: [],
  },
  {
    id: 'visa',
    label: '签证交流区',
    desc: '仅经验分享，非官方答复',
    category: 'topic',
    posts: [
      {
        id: 'v1',
        author: '过来人',
        body: '美签 DS-160 填表截图自己留底，面签回答与表一致。',
        createdAt: Date.now() - 7200000,
      },
    ],
  },
  {
    id: 'team',
    label: '旅行组队区',
    desc: '约伴 · 拼车 · 拼房',
    category: 'topic',
    posts: [],
  },
  {
    id: 'create',
    label: '攻略创作区',
    desc: '排版/变现/版权讨论',
    category: 'topic',
    posts: [],
  },
  {
    id: 'contest',
    label: '大赛专区',
    desc: '季度赛投稿交流',
    category: 'topic',
    posts: [],
  },
  {
    id: 'multi',
    label: '多国串联区',
    desc: '一条线多国的走法',
    category: 'topic',
    posts: [],
  },
]
