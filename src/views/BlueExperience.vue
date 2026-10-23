<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CircuitField from '../components/blue/CircuitField.vue'
import JellyCompanion from '../components/blue/JellyCompanion.vue'
import ParticleText from '../components/effects/ParticleText.vue'
import LineWordmark from '../components/intro/LineWordmark.vue'
import ArticleMarkdown from '../components/articles/ArticleMarkdown.vue'
import SuggestionCard from '../components/about/SuggestionCard.vue'
import DalianMapCard from '../components/about/DalianMapCard.vue'
import { getArticlesByCategory, getArticle } from '../data/articles'
import { portfolio } from '../data/portfolio'
import { animateWaterfall } from '../components/blue/textWaterfall'
const route=useRoute(),router=useRouter()
const sections=[{path:'/',name:'HOME'},{path:'/about',name:'ABOUT ME'},{path:'/development',name:'DEVELOPMENT'},{path:'/research',name:'RESEARCH'}]
const page=computed(()=>route.path.startsWith('/development')?'development':route.path.startsWith('/research')?'research':route.path==='/'?'home':'about')
const category=computed(()=>page.value==='research'?'research':'development')
const articles=computed(()=>getArticlesByCategory(category.value))
const article=computed(()=>route.params.slug?getArticle(category.value,route.params.slug):null)
const next=computed(()=>sections[(sections.findIndex(section=>section.path==='/'+page.value)+1)%sections.length]||sections[1])
const intro=ref(false), introWord=ref('ZHEN'), flowing=ref(false), scrollHost=ref(null), flowCanvas=ref(null)
let timers=[], waterfall, wheelLock=false, navigationId=0
function later(fn,time){const id=setTimeout(fn,time);timers.push(id);return id}
function navigate(path){if(flowing.value)return;router.push(path)}
function nextPage(){navigate(page.value==='home'?'/about':next.value.path)}
let wheelTotal=0,lastWheel=0
function wheel(event){
  if(event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY) || intro.value)return
  if(event.target.closest('textarea,input,select,.dalian-map'))return
  if(flowing.value || wheelLock){event.preventDefault();return}
  const now=performance.now()
  if(now-lastWheel>220 || Math.sign(wheelTotal)!==Math.sign(event.deltaY))wheelTotal=0
  lastWheel=now
  const atTop=(scrollHost.value?.scrollTop || 0)<=1
  if(page.value!=='home' && (!atTop || event.deltaY>=0)){wheelTotal=0;return}
  wheelTotal+=event.deltaY
  let destination
  if(page.value==='home' && wheelTotal>40)destination='/about'
  if(page.value!=='home' && atTop && wheelTotal< -65){
    const index=sections.findIndex(section=>section.path==='/'+page.value)
    destination=route.params.slug?'/'+category.value:sections[Math.max(0,index-1)].path
  }
  if(!destination)return
  event.preventDefault();wheelTotal=0;wheelLock=true;navigate(destination)
  later(()=>wheelLock=false,2000)
}
const removeGuard=router.beforeEach(async(to,from)=>{
  if(to.path===from.path || !scrollHost.value || matchMedia('(prefers-reduced-motion: reduce)').matches)return true
  const id=++navigationId
  waterfall?.cancel()
  waterfall=animateWaterfall(flowCanvas.value,scrollHost.value,false)
  flowing.value=true
  await waterfall.finished
  return id===navigationId
})
watch(()=>route.path,async()=>{
  scrollHost.value?.scrollTo({top:0})
  if(!flowing.value)return
  const id=navigationId
  await nextTick()
  // Particle title fonts are shared with the outgoing title and already loaded.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
  if(id!==navigationId || !flowCanvas.value || !scrollHost.value)return
  waterfall=animateWaterfall(flowCanvas.value,scrollHost.value,true)
  await waterfall.finished
  if(id===navigationId)flowing.value=false
})
onMounted(()=>{
  try {if(!sessionStorage.getItem('zhen-blue-intro')){intro.value=true;later(()=>introWord.value='LOADING',2300);later(()=>{intro.value=false;sessionStorage.setItem('zhen-blue-intro','1')},3700)}}catch{}
})
onBeforeUnmount(()=>{timers.forEach(clearTimeout);waterfall?.cancel();removeGuard();navigationId++})
const introduction=`这里是 ZHEN 的个人博客，用来记录学习过程、开发尝试，以及偶尔闪过的灵感。

建立这个博客，最初只是想把学过的东西和做过的尝试记下来。希望在整理和回顾的过程中，把知识理解得更清楚。

网站还在慢慢完善，记录也会继续。`
</script>
<template>
  <div class="blue-experience" @wheel="wheel">
    <CircuitField />
    <header class="blue-header">
      <RouterLink to="/" class="blue-brand">ZHEN <span>/ 圳的星河手记</span></RouterLink>
      <nav aria-label="蓝白版主导航"><RouterLink v-for="section in sections" :key="section.path" :to="section.path" :aria-current="(section.path==='/'?page==='home':route.path.startsWith(section.path))?'page':undefined">{{ section.name }}</RouterLink></nav>
    </header>
    <main ref="scrollHost" class="blue-scroll" :class="{'blue-scroll--flow':flowing,'blue-scroll--reading':page!=='home'}" :aria-busy="flowing">
      <div class="blue-page-content">
        <section v-if="page==='home'" key="home" class="blue-hero">
          <div class="blue-hero__copy">
            <p class="blue-kicker">A PERSONAL SPACE / ZHEN</p>
            <h1 aria-label="WELCOME to MY BLOG">
              <ParticleText text="WELCOME" :intro-animation="false" :scatter-on-enter="false" :idle-drift="0" color="#123b76" highlight-color="#1d4d91" align="left" :glow="false" font-size="clamp(46px,5.5vw,88px)" />
              <span class="blue-hero__second"><ParticleText text="to" :intro-animation="false" :scatter-on-enter="false" :idle-drift="0" color="#123b76" highlight-color="#1d4d91" align="left" :glow="false" font-size="clamp(36px,4vw,60px)" /><ParticleText text="MY BLOG" :intro-animation="false" :scatter-on-enter="false" :idle-drift="0" color="#123b76" highlight-color="#1d4d91" align="left" :glow="false" font-size="clamp(42px,5vw,80px)" /></span>
            </h1>
            <p class="blue-hero__tagline">保持好奇，让想法慢慢发生。</p>
            <p class="blue-hero__intro">A personal space for development, research<br>and ideas, as it keeps unfolding.</p>
            <div class="blue-entries"><RouterLink v-for="section in sections.slice(1)" :key="section.path" :to="section.path">{{section.name}} <span>↗</span></RouterLink></div>
            <button class="blue-next" @click="nextPage">SCROLL TO EXPLORE <span>↓</span></button>
          </div>
        </section>
        <article v-else :key="route.path" class="blue-reading">
          <RouterLink v-if="article" class="blue-archive-link" :to="`/${category}`">← ALL WRITINGS</RouterLink>
          <p class="blue-kicker">{{page==='about'?'01 / ABOUT ME':`0${page==='development'?2:3} / ${page.toUpperCase()}`}}</p>
          <template v-if="page==='about'">
            <h1>保持好奇，<br class="blue-mobile-break">慢慢记录。</h1>
            <p class="blue-deck">你好，我是 ZHEN。</p>
            <ArticleMarkdown :source="introduction" />
            <div class="blue-contact"><span>CONTACT</span><a :href="portfolio.contact.github.href" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a :href="`mailto:${portfolio.contact.email}`">EMAIL ↗</a></div>
            <DalianMapCard /><SuggestionCard />
          </template>
          <template v-else-if="route.params.slug && !article"><h1>文章未找到</h1><RouterLink :to="`/${category}`">返回文章列表 ↗</RouterLink></template>
          <template v-else-if="article">
            <h1 class="blue-article-title">{{article.title}}</h1><p class="blue-date">{{article.date}} / {{article.tags.join(' · ')}}</p>
            <p class="blue-deck">{{article.summary}}</p>
            <img v-if="article.cover" class="blue-cover" :src="article.cover" :alt="article.title">
            <ArticleMarkdown :source="article.content" />
          </template>
          <template v-else>
            <h1>{{page==='development'?'把想法，写成现实。':'在未知里，寻找答案。'}}</h1>
            <p class="blue-deck">{{page==='development'?'开发实践与一路走来的笔记。':'研究、复现，以及尚未完成的好奇。'}}</p>
            <div class="blue-article-list"><RouterLink v-for="(entry,index) in articles" :key="entry.slug" :to="entry.href"><span class="blue-date">{{String(index+1).padStart(2,'0')}} / {{entry.date}}</span><h2>{{entry.title}} <span>↗</span></h2><p>{{entry.summary}}</p><small>{{entry.tags.join(' / ')}}</small></RouterLink><p v-if="!articles.length">新的记录正在慢慢酝酿。</p></div>
          </template>
          <button class="blue-next blue-next--reading" @click="nextPage">下一页 · {{ next.name }} <span>↓</span></button>
        </article>
      </div>
    </main>
    <div v-if="page!=='home'" class="blue-reading-dock" aria-hidden="true"></div>
    <JellyCompanion :home="page==='home'" :left="page==='about'||page==='research'" :reading="page!=='home'" :page-key="route.path" />
    <canvas ref="flowCanvas" class="blue-flow" aria-hidden="true" />
    <Transition name="blue-intro"><div v-if="intro" class="blue-intro" role="status" :aria-label="introWord"><LineWordmark :key="introWord" :word="introWord" :animation="introWord==='ZHEN'?'once':'loop'"/><p>PERSONAL ARCHIVE · DEVELOPMENT · RESEARCH</p></div></Transition>
  </div>
</template>
<style scoped>
.blue-experience{--color-text:#172d51;--color-muted:#6e809a;--color-gold:#327fc7;--font-display:Georgia,'Times New Roman',serif;position:fixed;inset:0;background:#fcfdff;color:#172d51;isolation:isolate}
.blue-header{position:relative;z-index:8;display:flex;align-items:center;justify-content:space-between;height:100px;padding:0 5vw;background:linear-gradient(#fcfdfff5,#fcfdff00);padding-right:235px}
.blue-brand{font:500 14px var(--font-ui);letter-spacing:.35em;white-space:nowrap}.blue-brand span{font:11px var(--font-serif-cn);letter-spacing:.06em;color:#62748d;margin-left:8px}
.blue-header nav{display:flex;gap:clamp(18px,2.5vw,45px);margin-left:25px}.blue-header nav a{font:9px var(--font-ui);letter-spacing:.14em;color:#677991;padding:10px 0;white-space:nowrap}.blue-header nav a[aria-current]{color:#185eb1;border-bottom:1px solid #70b7ef}
.blue-scroll{position:absolute;inset:100px 0 30px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#c8d9e8 transparent;z-index:2}
.blue-hero{min-height:calc(100svh - 130px);display:flex;align-items:center;padding:30px 0 50px 7vw}.blue-hero__copy{width:46vw;max-width:680px}.blue-kicker{font:9px/1.8 var(--font-ui);color:#6282aa;letter-spacing:.22em;margin:0 0 38px}
.blue-hero h1{margin:0 0 28px;line-height:1;font-family:var(--font-display);font-weight:400}.blue-hero h1 :deep(.particle-text){height:110px}.blue-hero__second{display:grid;grid-template-columns:70px 1fr;gap:12px;align-items:center}.blue-hero__second :deep(.particle-text){height:105px!important}
.blue-hero__tagline{font:24px/1.6 var(--font-serif-cn);letter-spacing:.07em;margin:24px 0 14px}.blue-hero__intro{font:16px/1.8 Georgia,serif;color:#7b8ba3}
.blue-entries{display:flex;gap:30px;margin:45px 0 55px}.blue-entries a{font:10px var(--font-ui);letter-spacing:.08em;border-bottom:1px solid #b7d8f1;padding-bottom:10px}.blue-entries span{margin-left:12px;color:#498ecb}
.blue-next{padding:10px 0;border:0;background:none;color:#6b83a2;font:9px var(--font-ui);letter-spacing:.18em;cursor:pointer}.blue-next span{margin-left:22px}.blue-next--reading{display:block;margin:72px auto 30px;border-top:1px solid #d8e4ee;padding:25px 25px 10px}
.blue-reading{width:min(680px,calc(100% - 70px));margin:65px auto 100px;position:relative}.blue-reading>.blue-kicker{text-align:center;margin-bottom:22px}.blue-reading>h1{font:400 clamp(32px,3.5vw,54px)/1.45 var(--font-serif-cn);letter-spacing:.035em;text-align:center;margin:0 0 22px}.blue-reading>.blue-deck{font:18px/1.9 var(--font-serif-cn);text-align:center;color:#6c7e96;margin:15px 0 45px}.blue-reading :deep(.article-markdown){color:#52667e;font-size:16px;line-height:2.15}.blue-contact{display:flex;justify-content:center;gap:32px;margin:48px 0;font:10px var(--font-ui);letter-spacing:.14em}.blue-contact a{border-bottom:1px solid #bad6ed;padding-bottom:8px}.blue-date{color:#7d90a7;font:10px var(--font-ui);letter-spacing:.12em}.blue-article-list>a{display:block;padding:28px 0;border-top:1px solid #dce6ef}.blue-article-list h2{font:400 25px/1.5 var(--font-serif-cn);margin:15px 0}.blue-article-list h2 span{float:right;color:#6b9dc9}.blue-article-list p{font:15px/1.9 var(--font-serif-cn);color:#72849a}.blue-article-list small{font:9px var(--font-ui);color:#8496ac}.blue-cover{width:100%;margin:15px 0 35px}.blue-article-title{font-size:36px!important}.blue-mobile-break{display:none}
.blue-flow{position:fixed;inset:0;pointer-events:none;width:100%;height:100%;z-index:9}.blue-scroll--flow .blue-page-content{visibility:hidden}
.blue-intro{position:fixed;inset:0;z-index:110;background:#fcfdfff5;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:24px}.blue-intro :deep(.line-wordmark){width:min(70vw,580px)}.blue-intro :deep(path){stroke:#3d8ad6}.blue-intro p{font:8px var(--font-ui);letter-spacing:.25em;color:#84a4c7}.blue-intro-enter-active,.blue-intro-leave-active{transition:opacity .7s}.blue-intro-enter-from,.blue-intro-leave-to{opacity:0}
.blue-reading :deep(.dalian-map){background:#f3f7fc;border-color:#d5e2ef}.blue-reading :deep(.dalian-map__status){color:#467895}.blue-reading :deep(.dalian-map__greeting){color:#6880a0}.blue-reading :deep(.suggestion){background:#f3f7fc;border-color:#d5e2ef;color:#18375d}.blue-reading :deep(.suggestion textarea){background:#fff;border-color:#c5d8e9;color:#243f63}.blue-reading :deep(.suggestion label){color:#5c7390}.blue-reading :deep(.suggestion__meta){color:#6d8198}.blue-reading :deep(.suggestion__meta span:last-child){color:#6d8198}.blue-reading :deep(.suggestion__inbox-button){color:#4273a0;border-color:#bdcede;background:#f9fcff}.blue-reading :deep(.suggestion__smile-wrap){display:none}.blue-reading :deep(.suggestion__body){display:block}.blue-reading :deep(.suggestion form button[type=submit]){color:#4377a7;border-color:#c0d7e9;background:#e5f0fa}.blue-reading :deep(.article-markdown a){color:#287dc7}.blue-reading :deep(.article-markdown pre){background:#eaf1f8;color:#27466e}.blue-reading :deep(.article-markdown code){color:#245386}.blue-reading :deep(.article-markdown blockquote){color:#667e97;border-color:#bad3e8}.blue-reading-dock{display:none}
@media(max-width:1150px){.blue-header{height:125px;flex-wrap:wrap;align-content:center;gap:16px;padding-right:190px}.blue-header nav{margin-left:0;gap:22px}.blue-scroll{top:125px}.blue-reading{width:min(650px,calc(100% - 80px))}.blue-hero__copy{width:50vw}.blue-hero h1 :deep(.particle-text){height:90px}.blue-hero__second{grid-template-columns:50px 1fr}.blue-entries{gap:17px}}
@media(max-width:650px){.blue-header{height:130px;padding:18px 22px;align-content:start;display:block}.blue-brand{font-size:12px}.blue-brand span{font-size:10px}.blue-header nav{gap:18px;margin-top:32px}.blue-header nav a{font-size:8px}.blue-scroll{top:130px}.blue-hero{min-height:calc(100svh - 160px);align-items:flex-start;padding:30px 24px 50px}.blue-hero__copy{width:100%;max-width:none}.blue-kicker{font-size:8px;margin-bottom:20px}.blue-hero h1{max-width:92vw;margin-bottom:10px}.blue-hero h1 :deep(.particle-text){height:70px}.blue-hero__second :deep(.particle-text){height:65px!important}.blue-hero__tagline{font-size:19px;margin-top:12px}.blue-hero__intro{font-size:13px;max-width:65%}.blue-entries{margin:29px 0;gap:18px}.blue-entries a{font-size:8px}.blue-entries span{margin-left:0}.blue-next{font-size:8px}.blue-reading{width:calc(100% - 46px);margin-top:35px}.blue-reading>h1{font-size:33px}.blue-reading>.blue-deck{font-size:16px}.blue-reading :deep(.article-markdown){font-size:15px}.blue-mobile-break{display:initial}.blue-contact{gap:25px}.blue-article-title{font-size:28px!important}}
@media(prefers-reduced-motion:reduce){.blue-data-enter-active,.blue-data-leave-active{transition:opacity .15s}.blue-data-enter-from,.blue-data-leave-to{filter:none;transform:none}}
@media(max-width:1100px){.blue-scroll--reading{bottom:205px}.blue-reading-dock{display:block;position:fixed;bottom:25px;height:180px;left:0;right:0;background:#f7fbffed;border-top:1px solid #dce9f5;z-index:3;padding:40px 28px;color:#6e8fb1;font:10px/2 var(--font-ui);letter-spacing:.1em}}
@media(max-width:650px){.blue-scroll--reading{bottom:165px}.blue-reading-dock{height:135px}}
.blue-hero__second{display:flex;gap:6px}.blue-hero__second :deep(.particle-text:first-child){width:clamp(42px,4vw,62px);flex:0 0 clamp(42px,4vw,62px)}.blue-hero__second :deep(.particle-text:last-child){flex:1;min-width:0}
.blue-header nav a,.blue-brand,.blue-entries a,.blue-contact a,.blue-next,.blue-archive-link{transition:color .25s,transform .25s,border-color .25s,background .25s}
.blue-header nav a{position:relative;border-bottom-color:transparent;color:#6c6488}.blue-header nav a::after{content:'';position:absolute;bottom:-1px;left:0;width:100%;height:1px;background:#8a6dca;transform:scaleX(0);transform-origin:left;transition:transform .28s}.blue-header nav a:hover,.blue-header nav a:focus-visible{color:#7650ba;transform:translateY(-2px)}.blue-header nav a:hover::after,.blue-header nav a:focus-visible::after,.blue-header nav a[aria-current]::after{transform:scaleX(1)}.blue-header nav a[aria-current]{color:#7650ba;border-color:transparent}.blue-brand:hover{color:#7650ba}
.blue-entries a,.blue-contact a,.blue-next,.blue-archive-link,.blue-reading>a,.blue-reading :deep(.article-markdown a){color:#7955b0}.blue-entries span,.blue-article-list h2 span{color:#8a63bd;display:inline-block;transition:transform .3s}.blue-entries a:hover,.blue-entries a:focus-visible,.blue-contact a:hover{transform:translateY(-4px);color:#5f369b;border-color:#8c68bd}.blue-entries a:hover span{transform:translate(3px,-3px)}.blue-next:hover{transform:translateY(-3px);color:#59338d}
.blue-archive-link{display:inline-flex;align-items:center;gap:10px;position:relative;margin:0 0 34px;padding:10px 16px;border:1px solid #d8cbea;border-radius:5px;background:#f4effa99;font:11px/1.6 var(--font-ui);letter-spacing:.15em}.blue-archive-link:hover{background:#ece2f6;transform:translateX(-4px)}
.blue-article-list>a{position:relative;isolation:isolate;transition:transform .3s,border-color .3s}.blue-article-list>a::before{content:'';position:absolute;inset:8px -18px;background:linear-gradient(110deg,#fff9,#eee7fa99);border:1px solid #dfd5ed;border-radius:8px;z-index:-1;opacity:0;transition:opacity .3s,box-shadow .3s}.blue-article-list>a:hover,.blue-article-list>a:focus-visible{transform:translateY(-4px);border-color:transparent}.blue-article-list>a:hover::before,.blue-article-list>a:focus-visible::before{opacity:1;box-shadow:0 12px 30px #8060ac0c}.blue-article-list>a:hover h2 span{transform:translate(5px,-4px)}
@media(prefers-reduced-motion:reduce){.blue-header nav a,.blue-brand,.blue-entries a,.blue-contact a,.blue-next,.blue-article-list>a,.blue-article-list>a::before,.blue-archive-link{transition:none}.blue-header nav a:hover,.blue-entries a:hover,.blue-contact a:hover,.blue-next:hover,.blue-article-list>a:hover,.blue-archive-link:hover{transform:none}}
</style>
