'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

// ── Translation dictionaries ──
const zh: Record<string, string> = {
  'nav.articles': '外刊',
  'nav.videos': '视频',
  'nav.vocabulary': '词汇',
  'nav.listening': '听力',
  'nav.ielts': '雅思',
  'listening.cat.all': '全部',
  'listening.cat.ielts': '雅思',
  'listening.cat.numbers': '数字',
  'listening.cat.names': '人名',
  'listening.cat.places': '地名',
  'listening.cat.mixed': '混合(字母&数字)',
  'nav.login': '登录',
  'nav.register': '注册',
  'nav.logout': '退出登录',
  'nav.my_vocab': '我的生词本',
  'nav.lang_tip': '中文',
  'nav.search': '搜索单词...',

  'home.title': '宝子多EN, ',
  'home.title_hl': '每天进步一点点',
  'home.subtitle': '阅读外刊、积累词汇、模拟雅思——一站式英语学习平台',
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
  'home.f5_title': '精听训练',
  'home.f5_desc': '逐句精听雅思听力真题，支持全文跟读和逐句听写模式，快速提升听力能力。',

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
  'vocab.study': '背单词',
  'vocab.phrase': '短语',
  'vocab.group.basic': '基础词汇',
  'vocab.group.domestic': '国内考试',
  'vocab.group.international': '国际考试',
  'vocab.mywords': '生词本',
  'vocab.total': '共 {n} 个单词',
  'vocab.empty': '生词本还是空的',
  'vocab.empty_hint': '去阅读文章，点击单词加入生词本吧',
  'vocab.browse': '浏览文章 →',
  'vocab.remove': '移除',
  'vocab.prev': '上一页',
  'vocab.next': '下一页',
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
  'vocab.random': '随机',
  'vocab.retry': '重拼',
  'vocab.words_count': '{n}词',
  'vocab.overlap_hint': '词汇为网友归纳总结，仅供参考',
  'vocab.book.ielts-vocab-real': '雅思核心词汇',
  'vocab.book.gaokao-3500': '高考核心词汇',
  'vocab.book.cet4-4500': '四级核心词汇',
  'vocab.book.cet6-core': '六级核心词汇',
  'vocab.book.toefl-core': '托福核心词汇',
  'vocab.book.kaoyan-core': '考研核心词汇',
  'vocab.category.ielts': '雅思',
  'vocab.category.gaokao': '高考',
  'vocab.category.cet4': '四级',
  'vocab.category.cet6': '六级',
  'vocab.category.toefl': '托福',
  'vocab.category.kaoyan': '考研',
  'vocab.desc.ielts-vocab-real': '不含基础词汇',
  'vocab.desc.gaokao-3500': '含初高中词汇',
  'vocab.desc.cet4-4500': '含初高中及四级词汇',
  'vocab.desc.cet6-core': '含初高中及四六级词汇',
  'vocab.desc.toefl-core': '不含基础词汇',
  'vocab.desc.kaoyan-core': '含初高中及四级词汇',

  'auth.login_title': '登录',
  'auth.login_email': '邮箱',
  'auth.login_password': '密码',
  'auth.login_placeholder_pw': '输入密码',
  'auth.login_submit': '登录',
  'auth.login_loading': '登录中...',
  'auth.login_failed': '登录失败，请重试',
  'auth.login_to_register': '去注册',
  'auth.register_title': '注册',
  'auth.register_nickname': '昵称',
  'auth.register_nickname_ph': '你的昵称',
  'auth.register_email': '邮箱',
  'auth.register_code': '验证码',
  'auth.register_code_ph': '6位数字',
  'auth.register_sending': '发送中...',
  'auth.register_getcode': '获取验证码',
  'auth.register_retry': '{n}s 后重发',
  'auth.register_pw': '密码',
  'auth.register_pw_ph': '至少8位字符',
  'auth.register_submit': '注册',
  'auth.register_loading': '注册中...',
  'auth.register_failed': '注册失败',
  'auth.register_invalid_email': '请先输入有效的邮箱地址',
  'auth.register_invalid_code': '请输入6位验证码',
  'auth.send_failed': '发送失败，请稍后重试',
  'auth.email_exists': '该邮箱已注册，请直接登录',
  'auth.to_login': '去登录',

  'mobile.home': '首页',
  'mobile.me': '我的',

  'articles.title': '外刊阅读',
  'articles.desc': '通过原汁原味的英文外刊，在真实语境中提升词汇量',
  'articles.empty': '暂无文章',
  'articles.empty_hint': '换个难度试试看',

  'video.title': '视频学习',
  'video.placeholder': '粘贴 YouTube 链接...',
  'video.start': '开始学习',
  'video.start_btn': '开始',
  'video.processing': '处理中...',
  'video.processing_short': '处理中',
  'video.fetching': '正在从 YouTube 获取字幕...',
  'video.translating': '正在 AI 翻译字幕...',
  'video.fetching_short': '获取字幕中...',
  'video.translating_short': 'AI 翻译中...',
  'video.empty_hint': '粘贴 YouTube 链接开始学习',
  'video.empty_desc': '支持 youtube.com/watch、youtu.be、shorts 格式',
  'video.count': '共 {n} 句',
  'video.progress': '共 {n} 句，DeepSeek 批量翻译中...',
  'video.load_failed': '加载失败',
  'video.toggle_sub': '收起字幕',
  'video.toggle_sub_show': '展开字幕',

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
  'article.vocab_failed': '添加生词失败，请先登录',
  'article.vocab_remove_failed': '移除生词失败',

  'popup.loading': '正在查询中，请稍后',
  'popup.add_vocab': '加入生词本',
  'popup.remove_vocab': '从生词本移除',
  'popup.forms_title': '词形变化',
  'popup.plural': '复数',
  'popup.third_singular': '第三人称单数',
  'popup.noun': '名词',
  'popup.verb': '动词',
  'popup.adj': '形容词',
  'popup.adv': '副词',
  'popup.past': '过去式',
  'popup.past_participle': '过去分词',
  'popup.collocations': '常用搭配',
  'popup.related_words': '相关单词',
  'dictation.placeholder': '请输入听到内容',

  'common.retry': '重试',
  'common.back': '返回',
  'common.none': '暂无',
  'common.prev': '上一页',
  'common.next': '下一页',
  'common.loading': '加载中...',
  'common.load_more': '加载更多',
  'common.retry_label': '重试',

  'notfound.message': '该页面已消失在太空中了 🚀',

  'email.quota_exceeded': '网站目前为Beta阶段，当日注册及修改密码次数达到上限，请于明日再试',
  'email.reset_hint': '修改密码需要间隔7天',
  'email.reset_hint_days': '修改密码需要间隔7天，再过 {n} 天可以修改',

  'desktop.title': '请使用电脑访问',
  'desktop.desc': '本网站仅支持电脑端访问，请使用电脑浏览器打开以获得最佳体验。',

  'difficulty.short': '短篇',
  'difficulty.medium': '中篇',
  'difficulty.long': '长篇',
};


const en: Record<string, string> = {
  'nav.articles': 'Journals',
  'nav.videos': 'Videos',
  'nav.vocabulary': 'Vocabulary',
  'nav.listening': 'Listening',
  'nav.ielts': 'IELTS',
  'listening.cat.all': 'All',
  'listening.cat.ielts': 'IELTS',
  'listening.cat.numbers': 'Numbers',
  'listening.cat.names': 'Names',
  'listening.cat.places': 'Places',
  'listening.cat.mixed': 'Mixed (Letters & Digits)',
  'nav.login': 'Login',
  'nav.register': 'Sign Up',
  'nav.logout': 'Logout',
  'nav.my_vocab': 'My Vocabulary',
  'nav.lang_tip': 'English',
  'nav.search': 'Search word...',

  'home.title': 'BaoziduoEN, ',
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
  'home.f5_title': 'Intensive Listening',
  'home.f5_desc': 'Sentence-by-sentence dictation with IELTS audio. Full-text shadowing and gap-fill modes to rapidly improve listening skills.',

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

  'vocab.title': 'Vocabulary',
  'vocab.study': 'Study',
  'vocab.phrase': 'Phrase',
  'vocab.group.basic': 'Basic',
  'vocab.group.domestic': 'Domestic Exams',
  'vocab.group.international': 'International Exams',
  'vocab.mywords': 'My Words',
  'vocab.total': '{n} words',
  'vocab.empty': 'Your vocabulary list is empty',
  'vocab.empty_hint': 'Read articles and click words to add them',
  'vocab.browse': 'Browse Articles →',
  'vocab.remove': 'Remove',
  'vocab.prev': 'Previous',
  'vocab.next': 'Next',
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
  'vocab.random': 'Random',
  'vocab.retry': 'Retry',
  'vocab.words_count': '{n} words',
  'vocab.overlap_hint': 'Vocabulary is user-contributed and for reference only.',
  'vocab.book.ielts-vocab-real': 'IELTS Core Vocabulary',
  'vocab.book.gaokao-3500': 'Gaokao Core Vocabulary',
  'vocab.book.cet4-4500': 'CET-4 Core Vocabulary',
  'vocab.book.cet6-core': 'CET-6 Core Vocabulary',
  'vocab.book.toefl-core': 'TOEFL Core Vocabulary',
  'vocab.book.kaoyan-core': 'Postgraduate Core Vocabulary',
  'vocab.category.ielts': 'IELTS',
  'vocab.category.gaokao': 'Gaokao',
  'vocab.category.cet4': 'CET-4',
  'vocab.category.cet6': 'CET-6',
  'vocab.category.toefl': 'TOEFL',
  'vocab.category.kaoyan': 'Postgraduate',
  'vocab.desc.ielts-vocab-real': 'Excludes basic vocabulary',
  'vocab.desc.gaokao-3500': 'Includes middle & high school vocabulary',
  'vocab.desc.cet4-4500': 'Includes middle & high school & CET-4 vocabulary',
  'vocab.desc.cet6-core': 'Includes middle & high school & CET-4/6 vocabulary',
  'vocab.desc.toefl-core': 'Excludes basic vocabulary',
  'vocab.desc.kaoyan-core': 'Includes middle & high school & CET-4 vocabulary',

  'auth.login_title': 'Login',
  'auth.login_email': 'Email',
  'auth.login_password': 'Password',
  'auth.login_placeholder_pw': 'Enter password',
  'auth.login_submit': 'Login',
  'auth.login_loading': 'Logging in...',
  'auth.login_failed': 'Login failed, please retry',
  'auth.login_to_register': 'Register',
  'auth.register_title': 'Create Account',
  'auth.register_nickname': 'Nickname',
  'auth.register_nickname_ph': 'Your nickname',
  'auth.register_email': 'Email',
  'auth.register_code': 'Verification Code',
  'auth.register_code_ph': '6-digit code',
  'auth.register_sending': 'Sending...',
  'auth.register_getcode': 'Get Code',
  'auth.register_retry': 'Resend in {n}s',
  'auth.register_pw': 'Password',
  'auth.register_pw_ph': 'At least 8 characters',
  'auth.register_submit': 'Create Account',
  'auth.register_loading': 'Creating...',
  'auth.register_failed': 'Registration failed',
  'auth.register_invalid_email': 'Please enter a valid email',
  'auth.register_invalid_code': 'Please enter the 6-digit code',
  'auth.send_failed': 'Send failed, please retry',
  'auth.email_exists': 'Email already registered, please login',
  'auth.to_login': 'Login',

  'mobile.home': 'Home',
  'mobile.me': 'Me',

  'articles.title': 'Journals',
  'articles.desc': 'Read authentic English articles to build vocabulary in real contexts',
  'articles.empty': 'No articles yet',
  'articles.empty_hint': 'Try a different difficulty level',

  'video.title': 'Video Learning',
  'video.placeholder': 'Paste YouTube link...',
  'video.start': 'Start Learning',
  'video.start_btn': 'Start',
  'video.processing': 'Processing...',
  'video.processing_short': 'Processing',
  'video.fetching': 'Fetching subtitles from YouTube...',
  'video.translating': 'AI translating subtitles...',
  'video.fetching_short': 'Fetching...',
  'video.translating_short': 'Translating...',
  'video.empty_hint': 'Paste a YouTube link to start learning',
  'video.empty_desc': 'Supports youtube.com/watch, youtu.be, and shorts links',
  'video.count': '{n} segments',
  'video.progress': '{n} segments, DeepSeek translating...',
  'video.load_failed': 'Failed to load',
  'video.toggle_sub': 'Hide',
  'video.toggle_sub_show': 'Show',

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
  'article.vocab_failed': 'Failed to add word. Please login first.',
  'article.vocab_remove_failed': 'Failed to remove word.',

  'popup.loading': 'Looking up...',
  'popup.add_vocab': 'Add to Vocabulary',
  'popup.remove_vocab': 'Remove from Vocabulary',
  'popup.forms_title': 'Word Forms',
  'popup.plural': 'Plural',
  'popup.third_singular': 'Third Person Singular',
  'popup.noun': 'noun.',
  'popup.verb': 'verb.',
  'popup.adj': 'adj.',
  'popup.adv': 'adv.',
  'popup.past': 'past',
  'popup.past_participle': 'p.p.',
  'popup.collocations': 'Collocations',
  'popup.related_words': 'Related Words',
  'dictation.placeholder': 'Type what you hear',

  'common.retry': 'Retry',
  'common.back': 'Back',
  'common.none': 'None',
  'common.prev': 'Previous',
  'common.next': 'Next',
  'common.loading': 'Loading...',
  'common.load_more': 'Load More',
  'common.retry_label': 'Retry',

  'notfound.message': 'This page has vanished into space 🚀',

  'email.quota_exceeded': 'The site is currently in Beta. Daily registration and password reset limit reached. Please try again tomorrow.',
  'email.reset_hint': 'Password can be reset once every 7 days',
  'email.reset_hint_days': 'Password can be reset once every 7 days, {n} day(s) remaining',

  'desktop.title': 'Desktop Only',
  'desktop.desc': 'This site is designed for desktop browsers. Please open it on a computer for the best experience.',

  'difficulty.short': 'Short',
  'difficulty.medium': 'Medium',
  'difficulty.long': 'Long',
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

