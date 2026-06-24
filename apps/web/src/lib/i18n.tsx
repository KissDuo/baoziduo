'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

// ── Translation dictionaries ──
const zh: Record<string, string> = {
  'nav.articles': '外刊',
  'nav.videos': '视频',
  'nav.vocabulary': '词汇',
  'nav.ielts': '雅思',
  'nav.login': '登录',
  'nav.register': '注册',
  'nav.logout': '退出登录',
  'nav.my_vocab': '我的生词本',
  'nav.lang_tip': 'English',

  'home.title': '每天进步一点点，',
  'home.title_hl': '轻松掌握英语',
  'home.subtitle': '阅读外刊、积累词汇、模拟雅思考试——一站式英语学习平台',
  'home.browse': '浏览外刊',
  'home.cta_logged': '开始阅读',
  'home.cta_guest': '免费注册',

  'home.f1_title': '外刊阅读',
  'home.f1_desc': '精选来自顶级外刊的文章，点击任意单词即可查看音标、释义和例句，支持短语查询。',
  'home.f2_title': '智能背单词',
  'home.f2_desc': '基于间隔重复算法的生词本，支持 CET-4、CET-6、IELTS、TOEFL 等词书。',
  'home.f3_title': '雅思模拟考试',
  'home.f3_desc': '真实还原雅思官方考试界面，听力+阅读全真模拟，自动计时和评分。',
  'home.f4_title': '视频学习',
  'home.f4_desc': '粘贴 YouTube/B站 链接，AI 自动抓取字幕并翻译，播放时同步高亮当前句子。',

  'login.title': '登录',
  'login.email_tab': '邮箱登录',
  'login.sms_tab': '短信登录',
  'login.email_label': '邮箱',
  'login.password_label': '密码',
  'login.phone_label': '手机号',
  'login.code_label': '验证码',
  'login.send_code': '发送验证码',
  'login.submit': '登录',
  'login.submitting': '登录中...',
  'login.no_account': '还没有账号？',
  'login.signup': '免费注册',

  'register.title': '注册',
  'register.email_tab': '邮箱注册',
  'register.sms_tab': '短信注册',
  'register.nickname': '昵称',
  'register.email_label': '邮箱',
  'register.password_label': '密码',
  'register.phone_label': '手机号',
  'register.code_label': '验证码',
  'register.send_code': '发送验证码',
  'register.submit': '注册',
  'register.submitting': '正在注册...',
  'register.has_account': '已有账号？',
  'register.login': '立即登录',

  'vocab.title': '词汇',
  'vocab.total': '共 {n} 个单词',
  'vocab.empty': '生词本还是空的',
  'vocab.empty_hint': '去阅读文章，点击单词加入生词本吧',
  'vocab.browse': '浏览文章 →',
  'vocab.remove': '移除',
  'vocab.prev': '上一页',
  'vocab.next': '下一页',
  'vocab.study': '背单词',
  'vocab.mywords': '生词本',
  'vocab.books_empty': '暂无单词书',
  'vocab.cards': '卡片',
  'vocab.spell': '拼写',
  'vocab.filter_all': '全部',
  'vocab.filter_chapter': '按章节',
  'vocab.filter_letter': '按字母',
  'vocab.know': '认识',
  'vocab.dont_know': '不认识',
  'vocab.tap_flip': '点击卡片翻转',
  'vocab.type_hint': '输入剩余字母，退格删除',
  'vocab.correct': '正确！',
  'vocab.wrong': '正确答案是：',
  'vocab.next_word': '下一个 →',
  'vocab.session_done': '学习完成',
  'vocab.mastered': '已掌握',
  'vocab.reviewing': '复习中',
  'vocab.learning': '学习中',
  'vocab.words_count': '{n}词',
  'vocab.overlap_hint': '六级包含四级词汇，四级包含高考词汇；词库间重叠部分自动共享数据',
  'vocab.random': '随机',
  'nav.search': '搜索单词...',
  'vocab.retry': '重拼',

  'article.back': '返回文章列表',
  'article.load_fail': '文章未找到',
  'article.back_short': '返回',
  'article.translate': '翻译',
  'article.translating': '翻译中...',
  'article.no_trans': '暂无翻译',
  'article.end': '— 已阅读完毕 —',
  'article.filter_all': '全部',
  'article.filter_beginner': '初级',
  'article.filter_intermediate': '中级',
  'article.filter_advanced': '高级',
  'article.load_more': '加载更多',
  'article.loading_more': '加载中...',
  'article.all_loaded': '— 已加载全部 —',

  'popup.loading': '正在查询中，请稍后',
  'popup.add_vocab': '加入生词本',
  'popup.remove_vocab': '从生词本移除',

  'common.retry': '重试',
  'common.back': '返回',
  'common.none': '暂无',
};

const en: Record<string, string> = {
  'nav.articles': 'Journals',
  'nav.videos': 'Videos',
  'nav.vocabulary': 'Vocabulary',
  'nav.ielts': 'IELTS',
  'nav.login': 'Login',
  'nav.register': 'Sign Up',
  'nav.logout': 'Logout',
  'nav.my_vocab': 'My Vocabulary',
  'nav.lang_tip': '中文',

  'home.title': '宝子多EN, ',
  'home.title_hl': 'One Day at a Time',
  'home.subtitle': 'Read foreign journals, build vocabulary, and ace the IELTS — all in one place.',
  'home.cta_logged': 'Start Reading',
  'home.cta_guest': 'Get Started Free',
  'home.browse': 'Browse Journals',

  'home.f1_title': 'Journal Reading',
  'home.f1_desc': 'Read articles from top sources. Click any word for instant translation, phonetics, and examples.',
  'home.f2_title': 'Smart Vocabulary',
  'home.f2_desc': 'Spaced repetition algorithm. Study by CET-4, CET-6, IELTS, TOEFL books.',
  'home.f3_title': 'IELTS Mock Exams',
  'home.f3_desc': 'Realistic IELTS exam interface. Listening + Reading with auto-timing and scoring.',
  'home.f4_title': 'Video Learning',
  'home.f4_desc': 'Paste YouTube/Bilibili links. AI fetches subtitles, translates them, and highlights the current sentence during playback.',

  'login.title': 'Login',
  'login.email_tab': 'Email',
  'login.sms_tab': 'SMS',
  'login.email_label': 'Email',
  'login.password_label': 'Password',
  'login.phone_label': 'Phone',
  'login.code_label': 'Code',
  'login.send_code': 'Send Code',
  'login.submit': 'Login',
  'login.submitting': 'Logging in...',
  'login.no_account': "Don't have an account?",
  'login.signup': 'Sign up',

  'register.title': 'Create Account',
  'register.email_tab': 'Email',
  'register.sms_tab': 'SMS',
  'register.nickname': 'Nickname',
  'register.email_label': 'Email',
  'register.password_label': 'Password',
  'register.phone_label': 'Phone',
  'register.code_label': 'Code',
  'register.send_code': 'Send Code',
  'register.submit': 'Create Account',
  'register.submitting': 'Creating...',
  'register.has_account': 'Already have an account?',
  'register.login': 'Login',

  'vocab.title': 'My Vocabulary',
  'vocab.total': '{n} words',
  'vocab.empty': 'Your vocabulary list is empty',
  'vocab.empty_hint': 'Read articles and click words to add them',
  'vocab.browse': 'Browse Articles →',
  'vocab.remove': 'Remove',
  'vocab.prev': 'Previous',
  'vocab.next': 'Next',
  'vocab.study': 'Study',
  'vocab.mywords': 'My Words',
  'vocab.books_empty': 'No word books available',
  'vocab.cards': 'Cards',
  'vocab.spell': 'Spell',
  'vocab.filter_all': 'All',
  'vocab.filter_chapter': 'By Chapter',
  'vocab.filter_letter': 'By Letter',
  'vocab.know': 'Know It',
  'vocab.dont_know': "Don't Know",
  'vocab.tap_flip': 'Tap card to flip',
  'vocab.type_hint': 'Type the remaining letters, Backspace to delete',
  'vocab.correct': 'Correct!',
  'vocab.wrong': 'The correct spelling is:',
  'vocab.next_word': 'Next Word →',
  'vocab.session_done': 'Session Complete',
  'vocab.mastered': 'Mastered',
  'vocab.reviewing': 'Reviewing',
  'vocab.learning': 'Learning',
  'vocab.words_count': '{n} words',
  'vocab.overlap_hint': 'CET-6 includes CET-4 vocabulary, CET-4 includes Gaokao vocabulary. Overlapping words share data automatically.',
  'vocab.random': 'Random',
  'nav.search': 'Search word...',
  'vocab.retry': 'Retry',

  'article.back': '← Back to Articles',
  'article.load_fail': 'Article not found',
  'article.back_short': '← Back',
  'article.translate': 'Translate',
  'article.translating': 'Translating...',
  'article.no_trans': 'No translation yet',
  'article.end': '— End of article —',
  'article.filter_all': 'All',
  'article.filter_beginner': 'Beginner',
  'article.filter_intermediate': 'Intermediate',
  'article.filter_advanced': 'Advanced',
  'article.load_more': 'Load More',
  'article.loading_more': 'Loading...',
  'article.all_loaded': '— All loaded —',

  'popup.loading': 'Looking up...',
  'popup.add_vocab': 'Add to Vocabulary',
  'popup.remove_vocab': 'Remove from Vocabulary',

  'common.retry': 'Retry',
  'common.back': 'Back',
  'common.none': 'None',
};

const dictionaries = { zh, en };

// ── Context ──
interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'zh',
  setLang: () => {},
  t: (k) => k,
});

export function useLang() {
  return useContext(LangContext);
}

export function tFn(lang: Lang) {
  const dict = dictionaries[lang];
  return (key: string, vars?: Record<string, string | number>): string => {
    let text = dict[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
}

// ── Cookie helpers ──
export function getLangCookie(): Lang {
  if (typeof document === 'undefined') return 'zh';
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  return (match?.[1] === 'en' ? 'en' : 'zh') as Lang;
}

export function setLangCookie(lang: Lang) {
  document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

// ── Provider ──

export function LangProvider({ children, initialLang = 'zh' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setLangCookie(l);
    window.location.reload();
  }, []);

  const t = tFn(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}
