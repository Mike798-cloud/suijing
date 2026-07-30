/* ============================================================
   碎镜 (Shattered Mirror) — 章节 3 & 4 内容与逻辑
   章节3：裂痕 (Cracks)   章节4：碎镜 (Shattered Mirror)
   依赖 index.html 中已定义：
     showScreen(id) / findClue(id, desc, text)
     showChapterTransition(num, name, sub, callback)
     state { cluesFound:Set, currentChapter }
   ============================================================ */

/* ---------- 章节三人物数据 ---------- */
const ch3People = {
    suran: {
        name: '苏然',
        role: '受害者',
        photo: 'su-ran.jpg',
        age: '24岁 · 平面设计师',
        story: '苏然，24岁，独自在蔚海市打拼的设计师。父母离异，从小跟妈妈长大，内心渴望被爱。<br><br>林晨出现时，她以为自己终于等到了那个人。三个月里，她陆续向"林晨"转账共 <b>15 万元</b>——那是她工作三年攒下的全部积蓄，还有妈妈偷偷塞给她的钱。<br><br>她不是不聪明，她只是太想相信这是真的。当一个人极度渴望某样东西时，大脑会自动为它找借口。'
    },
    linchen: {
        name: '林晨',
        role: 'AI 生成形象',
        photo: 'lin-chen.jpg',
        age: '不存在 · 由周梅操控',
        badge: '虚假',
        story: '"林晨"从未真正存在过。<br><br>他的脸是 AI 生成的，声音是合成的，朋友圈照片是拼凑的，连那只"他养的金毛"都是网图。他的身份信息——金融公司、名校毕业、父母在海外——全部是编造的。<br><br>在屏幕另一端，和他谈了三个月恋爱的，是周梅。每一句"然然，晚安"，都是她打出来的。一个不存在的完美恋人，精准击中了苏然所有的孤独。'
    },
    zhoumei: {
        name: '周梅',
        role: '操控者 / 也是受害者',
        photo: 'zhou-mei.jpg',
        age: '32岁 · 单亲妈妈',
        story: '周梅，32岁，6岁女儿周小鱼的单亲妈妈。<br><br>三年前，她自己也掉进过同样的陷阱，被骗走 8 万元。当她还不上钱时，犯罪团伙找上了她——用她女儿的安全作威胁，逼她"还债"。<br><br>从此她被迫操作 5 个不同的 AI 人设，林晨是其中之一。她不是骗子，她是一个被困在笼子里、替别人递刀的母亲。'
    },
    wangli: {
        name: '王丽',
        role: '苏然的同事',
        photo: 'wang-li.jpg',
        age: '26岁 · 曾试图提醒苏然',
        story: '王丽是苏然的同事，也是少数察觉出不对劲的人。<br><br>她曾旁敲侧击地提醒苏然："你那个男朋友，怎么从来没来接过你？"话还没说完，苏然的社交账号上就突然出现了一堆"聊天截图"——伪造的，内容是王丽在背后说苏然坏话、嫉妒苏然。<br><br>苏然信了，和王丽断了联系。这是骗子的标准手段：先切断你和外界的所有连接，让你只剩下"他"。'
    }
};

/* ---------- 章节三隐藏日记数据 ---------- */
const ch3HiddenDiaries = [
    {
        id: 'd828',
        date: '8月28日',
        title: '我在查他',
        tag: '识图搜索',
        body: '今天趁他没注意，我用识图搜了林晨的照片。结果出来了——这些照片全网查不到任何其他记录。没有社交媒体，没有校友录，什么都没有。一个在金融公司上班的人，怎么可能完全没有网络痕迹？',
        clue: { id: 'ch3-d828', desc: '苏然开始秘密调查林晨。', text: '8月28日：林晨的照片全网查无此人。一个正常人不可能没有任何网络痕迹。' }
    },
    {
        id: 'd905',
        date: '9月5日',
        title: '他不是真的',
        tag: 'AI 检测',
        hasImage: 'couple-1.jpg',
        body: '我下载了 AI 检测工具。couple-1.jpg，检测结果：99.7% AI 生成。他的脸是假的。他的声音是假的。他的一切都是假的。我转给他的15万……我转给了一个不存在的人。',
        clue: { id: 'ch3-d905', desc: '苏然确认林晨是 AI 生成的假人。', text: '9月5日：AI 检测显示林晨照片 99.7% 为 AI 生成。她转出的 15 万给了不存在的人。' }
    },
    {
        id: 'd910',
        date: '9月10日',
        title: '那个女人',
        tag: '转账追查',
        body: '我顺着转账记录查到了一个账户，户主叫周梅。我查了她的信息，她32岁，有个6岁的女儿。她不是什么大老板，她是一个……和我一样的受害者。三年前她也被骗了，后来被逼着替他们干活。她在还债。她也是受害者。',
        clue: { id: 'ch3-d910', desc: '苏然追查到收款人周梅，发现她也是受害者。', text: '9月10日：钱转入周梅账户。她32岁、单亲妈妈、三年前同为受害者，被胁迫作案。' }
    },
    {
        id: 'd915',
        date: '9月15日',
        title: '我害怕',
        tag: '危险逼近',
        body: '他们发现我在查了。林晨（或者说那个操作林晨的人）发来消息："然然，最近是不是有什么心事？"这句话让我浑身发冷。我不能让妈妈知道，不能让朋友担心。但我必须做点什么。如果我出事了，请找到这些记录。',
        clue: { id: 'ch3-d915', desc: '对方已察觉苏然在调查，发出威胁。', text: '9月15日："林晨"发来试探消息，苏然预感危险，留下遗言式记录。' }
    }
];

/* ============================================================
   载入章节三
   ============================================================ */
function loadChapter3() {
    if (document.getElementById('ch3-hidden-folder')) {
        showChapterTransition(3, '裂痕', '完美的镜面，开始出现第一道裂纹', function () { showScreen('ch3-hidden-folder'); });
        return;
    }
    state.currentChapter = 3;

    const container = document.getElementById('game-screens');
    container.innerHTML += `
<style>
/* ====== 碎镜 章节3/4 全局样式 ====== */
.screen.sm-screen{display:none;flex-direction:column;align-items:center;padding:2.6rem 1.1rem 6rem;min-height:100vh;position:relative;}
.screen.sm-screen.active{display:flex;animation:smFade .65s ease;}
@keyframes smFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
/* 碎裂镜面氛围层 */
.sm-screen::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(circle at 18% 12%, rgba(200,66,74,.10), transparent 42%),
    radial-gradient(circle at 84% 88%, rgba(91,155,213,.08), transparent 45%),
    linear-gradient(180deg,#0a0b12 0%,#0d0e18 100%);}
.sm-screen::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");}
.sm-inner{width:100%;max-width:690px;position:relative;z-index:2;margin:0 auto;}

.sm-tag{font-size:.72rem;letter-spacing:.42em;color:var(--sm-gold,#c9a961);text-transform:uppercase;margin-bottom:.9rem;opacity:.92;}
.sm-h1{font-family:'Noto Serif SC',serif;font-size:clamp(1.7rem,5.4vw,2.5rem);font-weight:700;letter-spacing:.08em;color:#f1efea;margin-bottom:.5rem;line-height:1.25;}
.sm-sub{font-size:.92rem;color:#9a9ca8;line-height:1.8;margin-bottom:2rem;max-width:46ch;}
.sm-sub b{color:#d98b91;}

.sm-card{background:linear-gradient(180deg,rgba(26,28,40,.92),rgba(18,19,28,.96));border:1px solid rgba(201,169,97,.16);border-radius:16px;padding:1.7rem 1.5rem;box-shadow:0 18px 50px rgba(0,0,0,.45);position:relative;overflow:hidden;}
.sm-card.glow{box-shadow:0 0 0 1px rgba(200,66,74,.25),0 18px 60px rgba(200,66,74,.10);}

.sm-input{width:100%;padding:.9rem 1rem;background:#0e0f17;border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#f1efea;font-size:1.15rem;letter-spacing:.5em;text-align:center;outline:none;transition:.3s;font-family:inherit;}
.sm-input:focus{border-color:var(--sm-gold,#c9a961);box-shadow:0 0 0 3px rgba(201,169,97,.14);}
.sm-input.err{border-color:#c8424a;animation:smShake .4s;}
@keyframes smShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}

.sm-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.85rem 1.8rem;border-radius:10px;border:1px solid rgba(201,169,97,.4);background:transparent;color:#f1efea;font-size:.95rem;letter-spacing:.14em;cursor:pointer;transition:.35s;font-family:inherit;}
.sm-btn:hover{border-color:var(--sm-gold,#c9a961);background:rgba(201,169,97,.08);letter-spacing:.2em;}
.sm-btn.primary{background:linear-gradient(135deg,#c8424a,#8b2d33);border-color:transparent;color:#fff;}
.sm-btn.primary:hover{box-shadow:0 8px 26px rgba(200,66,74,.35);letter-spacing:.2em;}
.sm-btn.block{width:100%;}
.sm-btn:disabled{opacity:.4;cursor:not-allowed;}

.sm-hint{font-size:.82rem;color:#8b8d99;line-height:1.7;}
.sm-hint .key{color:var(--sm-gold,#c9a961);}

/* 隐藏日记 */
.sm-diary-note{display:flex;gap:1rem;align-items:flex-start;background:rgba(0,0,0,.28);border-radius:12px;padding:.9rem;margin-top:1.1rem;border:1px dashed rgba(255,255,255,.12);}
.sm-diary-note img{width:64px;height:64px;border-radius:8px;object-fit:cover;flex:none;filter:sepia(.2);}
.sm-diary-wrap{display:none;flex-direction:column;gap:1rem;margin-top:1.4rem;}
.sm-diary-wrap.show{display:flex;}
.sm-diary{background:#0e0f17;border-left:3px solid #c8424a;border-radius:0 12px 12px 0;padding:1.1rem 1.2rem;cursor:pointer;transition:.3s;opacity:0;transform:translateY(12px);}
.sm-diary.in{opacity:1;transform:translateY(0);}
.sm-diary:hover{background:#13141f;border-left-color:#e05a63;}
.sm-diary.read{border-left-color:#5b9bd5;}
.sm-diary-head{display:flex;align-items:center;gap:.6rem;margin-bottom:.55rem;flex-wrap:wrap;}
.sm-diary-date{font-family:'Noto Serif SC',serif;color:#e8c47a;font-size:.95rem;}
.sm-diary-title{font-weight:600;color:#f1efea;}
.sm-diary-chip{font-size:.66rem;letter-spacing:.1em;padding:.12rem .5rem;border-radius:20px;background:rgba(200,66,74,.16);color:#e98a91;}
.sm-diary.read .sm-diary-chip{background:rgba(91,155,213,.16);color:#8fbce6;}
.sm-diary-body{font-size:.9rem;color:#b9bbc6;line-height:1.85;}
.sm-diary-img{margin-top:.7rem;position:relative;width:120px;}
.sm-diary-img img{width:100%;border-radius:8px;object-fit:cover;}
.sm-diary-img .ai-flag{position:absolute;top:6px;left:6px;background:rgba(200,66,74,.92);color:#fff;font-size:.62rem;padding:.1rem .4rem;border-radius:4px;letter-spacing:.05em;}
.sm-read-bar{font-size:.78rem;color:#8b8d99;margin-top:.2rem;text-align:center;}
.sm-read-bar b{color:var(--sm-gold,#c9a961);}

/* 调查板 */
.sm-board-wrap{position:relative;width:100%;height:420px;margin:1rem 0 1.5rem;}
.sm-board-lines{position:absolute;inset:0;width:100%;height:100%;z-index:1;}
.sm-board-lines line{stroke:#c8424a;stroke-width:.6;opacity:.5;stroke-dasharray:2 1.6;animation:smFlow 14s linear infinite;}
@keyframes smFlow{to{stroke-dashoffset:-60;}}
.sm-node{position:absolute;z-index:2;width:96px;transform:translate(-50%,-50%);cursor:pointer;text-align:center;transition:.3s;}
.sm-node:hover{transform:translate(-50%,-50%) scale(1.06);}
.sm-node-img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.25);margin:0 auto .35rem;display:block;box-shadow:0 6px 18px rgba(0,0,0,.5);}
.sm-node.fake .sm-node-img{filter:hue-rotate(170deg) saturate(.6) brightness(.9);}
.sm-node-name{font-size:.82rem;color:#f1efea;font-weight:500;}
.sm-node-role{font-size:.66rem;color:#9a9ca8;}
.sm-node.fake .sm-node-role{color:#e98a91;}
.sm-node .badge{position:absolute;top:-4px;right:6px;background:#c8424a;color:#fff;font-size:.6rem;padding:.08rem .4rem;border-radius:20px;}

/* 人物详情浮层 */
.sm-overlay{position:fixed;inset:0;background:rgba(5,6,11,.82);backdrop-filter:blur(6px);z-index:60;display:none;align-items:center;justify-content:center;padding:1.2rem;}
.sm-overlay.show{display:flex;animation:smFade .35s ease;}
.sm-overlay-card{background:linear-gradient(180deg,#16181f,#10111a);border:1px solid rgba(201,169,97,.2);border-radius:16px;max-width:460px;width:100%;padding:1.6rem;position:relative;animation:smPop .4s cubic-bezier(.2,.9,.3,1.2);}
@keyframes smPop{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.sm-overlay-close{position:absolute;top:.7rem;right:.9rem;color:#8b8d99;font-size:1.4rem;line-height:1;cursor:pointer;background:none;border:none;}
.sm-overlay-head{display:flex;gap:1rem;align-items:center;margin-bottom:1rem;}
.sm-overlay-head img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(201,169,97,.3);}
.sm-overlay-name{font-family:'Noto Serif SC',serif;font-size:1.3rem;color:#f1efea;}
.sm-overlay-role{font-size:.78rem;color:var(--sm-gold,#c9a961);letter-spacing:.08em;margin-top:.15rem;}
.sm-overlay-age{font-size:.78rem;color:#8b8d99;margin-top:.1rem;}
.sm-overlay-story{font-size:.9rem;color:#c4c5cf;line-height:1.85;}
.sm-overlay-story b{color:#e8c47a;}

/* 周梅信件 */
.sm-letter{background:#0e0f17;border-radius:12px;padding:1.2rem 1.3rem;margin-bottom:1rem;border:1px solid rgba(255,255,255,.06);position:relative;opacity:0;transform:translateY(16px);}
.sm-letter.in{opacity:1;transform:translateY(0);transition:.6s ease;}
.sm-letter-date{font-size:.72rem;color:#7a7c88;letter-spacing:.1em;margin-bottom:.6rem;}
.sm-letter-text{font-size:.93rem;color:#d6d7de;line-height:1.95;}
.sm-letter.bleed{border-left:3px solid #5b9bd5;}
.sm-letter.plea{border:1px solid rgba(200,66,74,.3);background:linear-gradient(180deg,rgba(200,66,74,.06),#0e0f17);}
.sm-letter.plea .sm-letter-text{color:#e9c7ca;}

/* 新闻剪报 */
.sm-news{background:#f3f1ea;color:#2a2a2a;border-radius:4px;padding:1.3rem 1.4rem;margin-bottom:1.1rem;box-shadow:0 8px 26px rgba(0,0,0,.4);position:relative;font-family:'Noto Serif SC',serif;}
.sm-news::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cfilter id='p'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.06'/%3E%3C/svg%3E");border-radius:4px;pointer-events:none;}
.sm-news-src{font-size:.66rem;color:#999;letter-spacing:.12em;margin-bottom:.3rem;text-transform:uppercase;}
.sm-news-h{font-size:1.12rem;font-weight:700;line-height:1.4;margin-bottom:.6rem;color:#1a1a1a;}
.sm-news-p{font-size:.86rem;line-height:1.85;color:#444;font-family:'Noto Sans SC',sans-serif;}
.sm-news-date{font-size:.7rem;color:#999;margin-top:.6rem;}

.sm-step{font-size:.74rem;color:#7a7c88;letter-spacing:.16em;margin:2rem 0 1rem;text-align:center;}
</style>

<!-- ====== ch3-hidden-folder ====== -->
<section class="screen sm-screen" id="ch3-hidden-folder">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 3 · 裂痕</div>
    <h1 class="sm-h1">加密的隐藏文件夹</h1>
    <p class="sm-sub">在苏然手机的相册最深处，有一个被加密的文件夹。她把它藏得很深，<b>深到不想让任何人看见</b>——包括那个她曾深信不疑的人。</p>

    <div class="sm-card glow" id="ch3-lock-card">
      <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:1rem;">
        <span style="font-size:1.3rem;">&#128274;</span>
        <span style="font-size:.95rem;color:#f1efea;">请输入密码</span>
      </div>
      <input class="sm-input" id="ch3-pwd" type="text" inputmode="numeric" maxlength="4" placeholder="● ● ● ●" autocomplete="off">
      <p class="sm-hint" id="ch3-pwd-hint" style="margin-top:.8rem;">密码错误次数过多将锁定。提示：苏然曾把密码写进日记——<span class="key">"妈妈的生日是七夕"</span>。</p>
      <button class="sm-btn primary block" style="margin-top:1.1rem;" onclick="ch3Unlock()">解锁文件夹</button>

      <div class="sm-diary-note">
        <img src="diary.jpg" alt="日记残页">
        <div>
          <div style="font-size:.8rem;color:#e8c47a;margin-bottom:.3rem;">附：从苏然日记本里掉出的一页</div>
          <p class="sm-hint">"……妈妈说她最开心的日子是生我的那天，正好赶上七夕。她说我是她最好的礼物。所以我所有的密码都用这个日子，谁也猜不到，除了妈妈和我。"</p>
        </div>
      </div>
    </div>

    <div class="sm-diary-wrap" id="ch3-diary-wrap"></div>
    <p class="sm-read-bar" id="ch3-read-bar" style="display:none;">已阅读 <b id="ch3-read-count">0</b> / 4 篇隐藏记录</p>

    <div style="text-align:center;margin-top:2rem;display:none;" id="ch3-next-1">
      <p class="sm-step">线索逐渐拼合，关系网浮出水面</p>
      <button class="sm-btn primary" onclick="showScreen('ch3-investigation')">查看调查关系网 &rarr;</button>
    </div>
  </div>
</section>

<!-- ====== ch3-investigation ====== -->
<section class="screen sm-screen" id="ch3-investigation">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 3 · 裂痕</div>
    <h1 class="sm-h1">关系调查网</h1>
    <p class="sm-sub">把所有人放到一起，真相的轮廓就清楚了。<b>点击每个人物</b>，看看他们各自的故事——红线连起的，是一个比想象中更复杂的局。</p>

    <div class="sm-card">
      <div class="sm-board-wrap">
        <svg class="sm-board-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="50" y1="18" x2="76" y2="50"></line>
          <line x1="76" y1="50" x2="50" y2="82"></line>
          <line x1="50" y1="82" x2="50" y2="18"></line>
          <line x1="24" y1="50" x2="50" y2="18"></line>
          <line x1="24" y1="50" x2="76" y2="50" style="opacity:.25"></line>
        </svg>
        <div class="sm-node" style="left:50%;top:18%;" onclick="ch3ShowPerson('suran')">
          <img class="sm-node-img" src="su-ran.jpg" alt="苏然">
          <div class="sm-node-name">苏然</div><div class="sm-node-role">受害者</div>
        </div>
        <div class="sm-node fake" style="left:76%;top:50%;" onclick="ch3ShowPerson('linchen')">
          <span class="badge">假</span>
          <img class="sm-node-img" src="lin-chen.jpg" alt="林晨">
          <div class="sm-node-name">林晨</div><div class="sm-node-role">AI 生成</div>
        </div>
        <div class="sm-node" style="left:50%;top:82%;" onclick="ch3ShowPerson('zhoumei')">
          <img class="sm-node-img" src="zhou-mei.jpg" alt="周梅">
          <div class="sm-node-name">周梅</div><div class="sm-node-role">操控者/受害者</div>
        </div>
        <div class="sm-node" style="left:24%;top:50%;" onclick="ch3ShowPerson('wangli')">
          <img class="sm-node-img" src="wang-li.jpg" alt="王丽">
          <div class="sm-node-name">王丽</div><div class="sm-node-role">同事</div>
        </div>
      </div>
      <p class="sm-hint" style="text-align:center;margin-top:.4rem;">&#128269; 红线 = 资金 / 操控 / 信任关系。点击人物查看详情。</p>
    </div>

    <div style="text-align:center;margin-top:2rem;">
      <p class="sm-step">那个"操控者"周梅，背后还有另一个故事</p>
      <button class="sm-btn primary" onclick="showScreen('ch3-zhou-mei-story')">了解周梅 &rarr;</button>
    </div>
  </div>
</section>

<!-- ====== ch3-zhou-mei-story ====== -->
<section class="screen sm-screen" id="ch3-zhou-mei-story">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 3 · 裂痕</div>
    <h1 class="sm-h1">周梅：被递刀的人</h1>
    <p class="sm-sub">所有人都以为周梅是骗子。可当你翻开她留下的只言片语，会发现——<b>她递出的每一把刀，都先扎进了自己</b>。</p>

    <div class="sm-card">
      <div class="sm-letter" data-i="0">
        <div class="sm-letter-date">三年前 · 周梅的备忘录</div>
        <div class="sm-letter-text">我也是被骗的那个。八万块，是我离婚后攒了三年的钱，本想给小鱼交幼儿园学费。那时候我刚一个人带孩子，太累了，太想有个人能说说话。他出现了，温柔、体贴、什么都会顺着我说。等我发现不对，钱已经转光了。</div>
      </div>
      <div class="sm-letter" data-i="1">
        <div class="sm-letter-date">被找上门那天</div>
        <div class="sm-letter-text">他们找到我的时候，小鱼刚上幼儿园。他们没打我，也没骂我。他们只是给我看了一张照片——小鱼幼儿园门口的照片，背景是我每天送她上学的那条路。然后他们说：要么帮我们做事，要么……你懂。</div>
      </div>
      <div class="sm-letter bleed" data-i="2">
        <div class="sm-letter-date">开始"工作"</div>
        <div class="sm-letter-text">我学会了用那些软件。生成一张不存在的人脸，合成一段温柔的声音，编一个完美的人设。我同时扮演五个人——五个根本不存在的"恋人"。他们管这叫"角色"。我管这叫，每天醒来都想吐的日子。</div>
      </div>
      <div class="sm-letter bleed" data-i="3">
        <div class="sm-letter-date">关于林晨</div>
        <div class="sm-letter-text">林晨是我操作的第三个角色。我每天对着苏然的聊天记录，编林晨该说的话。她那么相信他，会把一整天的事都讲给他听。我每打一个字，都像在往自己心上扎刀。因为她说的每一句话，三年前的我也对那个骗子说过。</div>
      </div>
      <div class="sm-letter bleed" data-i="4">
        <div class="sm-letter-date">那些"误删"的消息</div>
        <div class="sm-letter-text">聊天记录里那些被"误删"的消息，是我故意删得不干净的。我想留下一点破绽，盼着她会发现、会起疑、会停下来。可她太爱他了，什么都没看出来。我恨自己不敢直接告诉她，我更恨自己，连恨的资格都没有。</div>
      </div>
      <div class="sm-letter plea" data-i="5">
        <div class="sm-letter-date">最后 · 留给发现真相的人</div>
        <div class="sm-letter-text">我知道你发现了我。我不求你原谅我。<br><br>我只求你，如果你能出去，帮我照顾我女儿。她叫周小鱼，在蔚海市阳光幼儿园。<br><br>我不想让她长大知道妈妈做过这些事。</div>
      </div>
    </div>

    <div style="text-align:center;margin-top:2rem;">
      <p class="sm-step">案件的回声，正在新闻里发酵</p>
      <button class="sm-btn primary" onclick="showScreen('ch3-news-fragments')">查看相关新闻 &rarr;</button>
    </div>
  </div>
</section>

<!-- ====== ch3-news-fragments ====== -->
<section class="screen sm-screen" id="ch3-news-fragments">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 3 · 裂痕</div>
    <h1 class="sm-h1">新闻里的回声</h1>
    <p class="sm-sub">苏然的遭遇不是孤例。在你翻看这些记录的同时，<b>同样的故事正发生在别人身上</b>。</p>

    <div style="margin-top:1.4rem;">
      <div class="sm-news">
        <div class="sm-news-src">蔚海日报 · 社会</div>
        <div class="sm-news-h">AI 换脸诈骗案告破，涉案金额超千万</div>
        <div class="sm-news-p">市公安局昨日通报，一举捣毁一个利用 AI 换脸、声音合成技术实施"杀猪盘"的犯罪团伙，抓获嫌疑人 11 名。该团伙长期伪造高净值人设，通过恋爱交友骗取受害人信任后诱导转账，受害人遍布多地，涉案金额逾 1200 万元。</div>
        <div class="sm-news-date">2026年9月22日</div>
      </div>
      <div class="sm-news">
        <div class="sm-news-src">新华社 · 政策</div>
        <div class="sm-news-h">网络谣言治理新规出台，编造传播虚假信息将追责</div>
        <div class="sm-news-p">新规明确，利用 AI 技术编造、伪造聊天记录、图片、音视频并传播，造成他人名誉受损或财产损失的，依法承担民事乃至刑事责任。专家提醒，伪造"出轨""借钱不还"等聊天截图已成为新型侵害手段。</div>
        <div class="sm-news-date">2026年10月5日</div>
      </div>
      <div class="sm-news">
        <div class="sm-news-src">法治周末 · 深度</div>
        <div class="sm-news-h">情感操纵（PUA）被认定为新型犯罪手段</div>
        <div class="sm-news-p">多地判例首次将"系统性的情感操纵"纳入诈骗罪量刑考量。检察官指出，嫌疑人通过长期情感控制，诱导受害人主动切断社交、孤立自我，再实施财产侵害，其危害性不亚于暴力胁迫。</div>
        <div class="sm-news-date">2026年10月18日</div>
      </div>
    </div>

    <div style="text-align:center;margin-top:2.4rem;">
      <p class="sm-step">裂痕已经无法修补——镜面，即将碎裂</p>
      <button class="sm-btn primary" onclick="loadChapter4()">进入最终章：碎镜 &rarr;</button>
    </div>
  </div>
</section>
`;

    /* ---------- 渲染隐藏日记 ---------- */
    const dw = document.getElementById('ch3-diary-wrap');
    ch3HiddenDiaries.forEach(function (d, i) {
        const imgHtml = d.hasImage
            ? '<div class="sm-diary-img"><img src="' + d.hasImage + '" alt="合照"><span class="ai-flag">AI 99.7%</span></div>'
            : '';
        dw.insertAdjacentHTML('beforeend',
            '<div class="sm-diary" id="' + d.id + '" onclick="ch3ReadDiary(\'' + d.id + '\')">' +
            '<div class="sm-diary-head"><span class="sm-diary-date">' + d.date + '</span>' +
            '<span class="sm-diary-title">' + d.title + '</span>' +
            '<span class="sm-diary-chip">' + d.tag + '</span></div>' +
            '<div class="sm-diary-body">' + d.body + '</div>' + imgHtml + '</div>');
    });

    /* ---------- 输入交互 ---------- */
    const pwdInput = document.getElementById('ch3-pwd');
    pwdInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '');
    });
    pwdInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') ch3Unlock();
    });

    /* ---------- 周梅信件渐显 ---------- */
    setTimeout(function () {
        document.querySelectorAll('#ch3-zhou-mei-story .sm-letter').forEach(function (el, i) {
            setTimeout(function () { el.classList.add('in'); }, i * 380);
        });
    }, 400);

    /* ---------- 章节过渡 ---------- */
    showChapterTransition(3, '裂痕', '完美的镜面，开始出现第一道裂纹', function () {
        showScreen('ch3-hidden-folder');
    });
}

/* ---------- 章节三：解锁隐藏文件夹 ---------- */
function ch3Unlock() {
    const input = document.getElementById('ch3-pwd');
    const val = (input.value || '').trim();
    const hint = document.getElementById('ch3-pwd-hint');
    if (val === '0707') {
        input.disabled = true;
        const card = document.getElementById('ch3-lock-card');
        card.style.transition = 'opacity .5s, transform .5s';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-10px)';
        setTimeout(function () {
            card.style.display = 'none';
            const wrap = document.getElementById('ch3-diary-wrap');
            wrap.classList.add('show');
            document.getElementById('ch3-read-bar').style.display = 'block';
            ch3HiddenDiaries.forEach(function (d, i) {
                setTimeout(function () { document.getElementById(d.id).classList.add('in'); }, i * 260);
            });
            findClue('ch3-folder', '解锁了苏然的隐藏文件夹。', '密码 0707——七夕，妈妈的生日。苏然把最痛的秘密藏在了这里。');
            document.getElementById('ch3-next-1').style.display = 'block';
        }, 500);
    } else {
        input.classList.add('err');
        hint.innerHTML = '密码不对。<span class="key">提示：四个数字，是妈妈的生日。妈妈说，她的生日和七夕是同一天。</span>';
        setTimeout(function () { input.classList.remove('err'); }, 450);
        input.focus();
    }
}

/* ---------- 章节三：阅读日记 ---------- */
let ch3DiaryRead = 0;
function ch3ReadDiary(id) {
    const d = ch3HiddenDiaries.find(function (x) { return x.id === id; });
    if (!d) return;
    const el = document.getElementById(id);
    if (!el.classList.contains('read')) {
        el.classList.add('read');
        ch3DiaryRead++;
        document.getElementById('ch3-read-count').textContent = ch3DiaryRead;
        findClue(d.clue.id, d.clue.desc, d.clue.text);
    }
}

/* ---------- 章节三：人物详情 ---------- */
function ch3ShowPerson(key) {
    const p = ch3People[key];
    if (!p) return;
    const badge = p.badge ? '<span style="display:inline-block;margin-left:.5rem;background:#c8424a;color:#fff;font-size:.66rem;padding:.1rem .5rem;border-radius:20px;vertical-align:middle;">' + p.badge + '</span>' : '';
    let overlay = document.getElementById('ch3-person-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ch3-person-overlay';
        overlay.className = 'sm-overlay';
        overlay.addEventListener('click', function (e) { if (e.target === overlay) ch3ClosePerson(); });
        document.body.appendChild(overlay);
    }
    overlay.innerHTML =
        '<div class="sm-overlay-card">' +
        '<button class="sm-overlay-close" onclick="ch3ClosePerson()">&times;</button>' +
        '<div class="sm-overlay-head"><img src="' + p.photo + '" alt="' + p.name + '">' +
        '<div><div class="sm-overlay-name">' + p.name + badge + '</div>' +
        '<div class="sm-overlay-role">' + p.role + '</div>' +
        '<div class="sm-overlay-age">' + p.age + '</div></div></div>' +
        '<div class="sm-overlay-story">' + p.story + '</div>' +
        '<button class="sm-btn block" style="margin-top:1.3rem;" onclick="ch3ClosePerson()">关闭</button></div>';
    overlay.classList.add('show');
    findClue('ch3-person-' + key, '查看了「' + p.name + '」的关系档案。', p.name + '：' + p.role + '。');
}
function ch3ClosePerson() {
    const o = document.getElementById('ch3-person-overlay');
    if (o) o.classList.remove('show');
}

/* ============================================================
   载入章节四
   ============================================================ */
function loadChapter4() {
    if (document.getElementById('ch4-reveal')) {
        showChapterTransition(4, '碎镜', '镜子碎了，碎片里映出的是另一个真相', function () { showScreen('ch4-reveal'); });
        return;
    }
    state.currentChapter = 4;

    const container = document.getElementById('game-screens');
    container.innerHTML += `
<style>
/* ====== 章节4 专属样式 ====== */
.sm-reveal-frame{position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(91,155,213,.25);box-shadow:0 18px 50px rgba(0,0,0,.5);margin-bottom:1.3rem;}
.sm-reveal-frame .cam-bg{position:absolute;inset:0;background:url('su-ran-room.jpg') center/cover no-repeat;filter:grayscale(.6) brightness(.55) contrast(1.1);}
.sm-reveal-frame .cam-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(91,155,213,.06) 0 2px,transparent 2px 4px);animation:smScan 3s linear infinite;}
@keyframes smScan{from{background-position:0 0}to{background-position:0 60px}}
.sm-reveal-frame .cam-ui{position:absolute;top:10px;left:12px;right:12px;display:flex;justify-content:space-between;font-size:.66rem;color:#7fb6e8;letter-spacing:.1em;font-family:monospace;}
.sm-reveal-frame .cam-dot{width:8px;height:8px;border-radius:50%;background:#c8424a;display:inline-block;margin-right:.4rem;animation:smBlink 1.2s infinite;vertical-align:middle;}
@keyframes smBlink{0%,100%{opacity:1}50%{opacity:.2}}
.sm-reveal-frame .cam-body{position:relative;z-index:2;padding:5.5rem 1.3rem 1.3rem;color:#dceaf6;min-height:230px;display:flex;flex-direction:column;justify-content:flex-end;}
.sm-reveal-frame .cam-cap{font-size:.82rem;line-height:1.7;background:rgba(8,12,20,.6);padding:.8rem 1rem;border-radius:8px;border-left:3px solid #5b9bd5;}

.sm-notif{display:flex;gap:.8rem;align-items:flex-start;background:#0e0f17;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1rem 1.1rem;margin-bottom:1.2rem;animation:smFade .6s ease;}
.sm-notif-ico{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#5b9bd5,#3a6fa0);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex:none;}
.sm-notif-meta{font-size:.72rem;color:#8b8d99;}
.sm-notif-from{font-size:.9rem;color:#f1efea;margin:.1rem 0;}
.sm-notif-text{font-size:.86rem;color:#c4c5cf;line-height:1.7;}

.sm-bank{width:100%;border-collapse:collapse;font-size:.82rem;margin-top:.4rem;}
.sm-bank th{background:rgba(91,155,213,.12);color:#8fbce6;text-align:left;padding:.6rem .7rem;font-weight:500;font-size:.74rem;letter-spacing:.05em;}
.sm-bank td{padding:.6rem .7rem;border-bottom:1px solid rgba(255,255,255,.06);color:#c4c5cf;}
.sm-bank td.amt{color:#e8c47a;font-weight:600;}
.sm-bank tr:hover td{background:rgba(255,255,255,.02);}

/* 苏然最终留言 */
.sm-final{background:linear-gradient(180deg,#0c0d14,#0a0b10);border:1px solid rgba(201,169,97,.18);border-radius:16px;padding:2rem 1.6rem;box-shadow:0 0 0 1px rgba(200,66,74,.08),0 20px 60px rgba(0,0,0,.5);position:relative;overflow:hidden;}
.sm-final::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#c8424a,transparent);}
.sm-final-head{text-align:center;margin-bottom:1.4rem;}
.sm-final-head .from{font-size:.74rem;color:#8b8d99;letter-spacing:.1em;}
.sm-final-head .who{font-family:'Noto Serif SC',serif;font-size:1.4rem;color:#f1efea;margin-top:.2rem;}
.sm-final-msg{font-size:.96rem;color:#dcdee6;line-height:2.05;white-space:pre-line;}
.sm-final-msg p{margin-bottom:1rem;opacity:0;transform:translateY(10px);}
.sm-final-msg p.in{opacity:1;transform:translateY(0);transition:.7s ease;}
.sm-final-msg .hl{color:#e8c47a;}
.sm-final-msg .danger{color:#e98a91;}
.sm-final-sign{text-align:right;margin-top:1.2rem;font-family:'Noto Serif SC',serif;color:#e8c47a;font-size:1.05rem;}

/* 选择 */
.sm-choice{display:flex;flex-direction:column;gap:1rem;margin-top:1rem;}
.sm-choice-btn{display:block;width:100%;text-align:left;background:#0e0f17;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:1.2rem 1.3rem;cursor:pointer;transition:.3s;font-family:inherit;color:#f1efea;}
.sm-choice-btn:hover{border-color:var(--sm-gold,#c9a961);background:#13141f;transform:translateX(4px);}
.sm-choice-letter{font-family:'Noto Serif SC',serif;font-size:1.6rem;color:var(--sm-gold,#c9a961);float:left;margin-right:.8rem;line-height:1;}
.sm-choice-title{font-size:1rem;font-weight:600;}
.sm-choice-desc{font-size:.82rem;color:#9a9ca8;margin-top:.35rem;line-height:1.6;}

/* 结局 */
.sm-ending-news{background:#f3f1ea;color:#2a2a2a;border-radius:6px;padding:1.5rem 1.5rem;box-shadow:0 12px 34px rgba(0,0,0,.45);margin-bottom:1.3rem;font-family:'Noto Serif SC',serif;position:relative;}
.sm-ending-news .src{font-size:.66rem;color:#999;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.4rem;}
.sm-ending-news h3{font-size:1.25rem;line-height:1.4;color:#1a1a1a;margin-bottom:.7rem;}
.sm-ending-news p{font-size:.86rem;line-height:1.85;color:#444;font-family:'Noto Sans SC',sans-serif;}
.sm-ending-block{background:#0e0f17;border-left:3px solid #5b9bd5;border-radius:0 12px 12px 0;padding:1.2rem 1.3rem;margin-bottom:1rem;}
.sm-ending-block.q{border-left-color:#e8c47a;}
.sm-ending-block p{font-size:.9rem;color:#c4c5cf;line-height:1.85;}
.sm-ending-quote{font-family:'Noto Serif SC',serif;font-size:1.02rem;color:#e8c47a;line-height:1.8;}
.sm-ending-final{background:linear-gradient(180deg,rgba(200,66,74,.07),transparent);border:1px solid rgba(200,66,74,.2);border-radius:14px;padding:1.6rem 1.4rem;margin:1.6rem 0;text-align:center;}
.sm-ending-final p{font-size:.88rem;color:#d6d7de;line-height:1.95;}
.sm-ending-final .last{margin-top:.9rem;font-family:'Noto Serif SC',serif;color:#e98a91;font-size:1rem;}
.sm-share-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:1rem;background:linear-gradient(135deg,#c8424a,#8b2d33);color:#fff;border:none;border-radius:12px;font-size:1rem;letter-spacing:.1em;cursor:pointer;transition:.3s;font-family:inherit;}
.sm-share-btn:hover{box-shadow:0 10px 30px rgba(200,66,74,.4);transform:translateY(-2px);}
.sm-replay{display:block;margin:1.2rem auto 0;color:#7a7c88;background:none;border:none;font-size:.82rem;cursor:pointer;text-decoration:underline;font-family:inherit;}
.sm-replay:hover{color:#c9a961;}
</style>

<!-- ====== ch4-reveal ====== -->
<section class="screen sm-screen" id="ch4-reveal">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 4 · 碎镜</div>
    <h1 class="sm-h1">镜子背后的人</h1>
    <p class="sm-sub">你以为故事到这里就结束了——苏然是受害者，林晨是假的，周梅是被胁迫的。<br>但手机突然亮了。<b>一条新消息，来自一个未知号码。</b></p>

    <div class="sm-notif">
      <div class="sm-notif-ico">&#9993;</div>
      <div style="flex:1;">
        <div class="sm-notif-meta">未知号码 · 刚刚</div>
        <div class="sm-notif-from">+86 1** **** 1003</div>
        <div class="sm-notif-text">"别报警。先别报警。她还在里面。如果你现在动手，她会消失——这次是真的消失。再给我 72 小时。"</div>
      </div>
    </div>

    <div class="sm-card">
      <div style="font-size:.8rem;color:#8fbce6;letter-spacing:.08em;margin-bottom:.7rem;">&#128249; 调取到的监控画面 · 蔚海市某出租屋</div>
      <div class="sm-reveal-frame">
        <div class="cam-bg"></div>
        <div class="cam-scan"></div>
        <div class="cam-ui"><span><span class="cam-dot"></span>REC · CAM-04</span><span id="ch4-cam-time">--:--:--</span></div>
        <div class="cam-body">
          <div class="cam-cap">画面里，一个身形熟悉的女生正坐在电脑前。她戴着耳机，屏幕光映在脸上——那台电脑上，正开着和某个"新人设"的聊天窗口。<br><br>时间是昨晚 23:47。地点，正是苏然租住的房间。</div>
        </div>
      </div>

      <div style="font-size:.8rem;color:#8fbce6;letter-spacing:.08em;margin:.6rem 0 .7rem;">&#128179; 银行流水 · 苏然名下账户</div>
      <table class="sm-bank">
        <thead><tr><th>日期</th><th>摘要</th><th>金额</th></tr></thead>
        <tbody>
          <tr><td>09-28</td><td>转入 - 涉案账户A</td><td class="amt">+ 6,000.00</td></tr>
          <tr><td>10-02</td><td>转入 - 涉案账户B</td><td class="amt">+ 8,500.00</td></tr>
          <tr><td>10-09</td><td>转入 - 涉案账户C</td><td class="amt">+ 12,000.00</td></tr>
        </tbody>
      </table>
      <p class="sm-hint" style="margin-top:.8rem;">她不是被骗的人。她在<b>收钱</b>。<br>——除非，她不是你以为的那个"受害者"。</p>
    </div>

    <div style="text-align:center;margin-top:2rem;">
      <p class="sm-step">手机里，还藏着一段留给你的话</p>
      <button class="sm-btn primary" onclick="showScreen('ch4-su-ran-message')">查看苏然的留言 &rarr;</button>
    </div>
  </div>
</section>

<!-- ====== ch4-su-ran-message ====== -->
<section class="screen sm-screen" id="ch4-su-ran-message">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 4 · 碎镜</div>
    <h1 class="sm-h1">她留下的话</h1>
    <p class="sm-sub">这不是遗书。这是一个清醒的人，在最危险的时刻，<b>把整副棋盘交到了你手里</b>。</p>

    <div class="sm-final">
      <div class="sm-final-head">
        <div class="from">来自 苏然 · 定时发送</div>
        <div class="who">致 我最好的朋友</div>
      </div>
      <div class="sm-final-msg" id="ch4-final-msg">
        <p>如果你看到这些，说明我的计划成功了。</p>
        <p>我没有死，也没有失踪。我潜入了他们。</p>
        <p>从发现林晨是假的那天起，我就知道光靠报警没用——他们换了无数个身份，每次都能消失。所以我假装什么都不知道，假装还在被控制，等他们放松警惕。</p>
        <p>他们让我操作新的"角色"。我操作的第一个目标，是另一个和我一样的女孩。我看着她的聊天记录，<span class="danger">就像看到了三个月前的自己。</span></p>
        <p>我做不到。我无法成为伤害别人的人。</p>
        <p>所以我把所有证据藏在了这个手机里，<span class="hl">留给最聪明的你。</span></p>
        <p>密码是 <span class="hl">1003</span>，是我生日，也是我们认识的日子。</p>
        <p>周梅帮了我。她偷偷帮我备份了数据。她说，如果能结束这一切，她愿意坐牢。</p>
        <p>报警。找蔚海市刑侦支队陈警官。证据在备忘录第三个文件夹。</p>
        <p>对不起让你担心了。</p>
        <p>如果我没有回来——<br>帮我跟妈妈说，对不起。</p>
      </div>
      <div class="sm-final-sign">—— 苏然</div>
    </div>

    <div style="text-align:center;margin-top:2rem;">
      <p class="sm-step">现在，决定权在你手里</p>
      <button class="sm-btn primary" onclick="showScreen('ch4-choice')">做出你的选择 &rarr;</button>
    </div>
  </div>
</section>

<!-- ====== ch4-choice ====== -->
<section class="screen sm-screen" id="ch4-choice">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 4 · 碎镜</div>
    <h1 class="sm-h1">你的选择</h1>
    <p class="sm-sub">苏然说，再给她 72 小时。可每多等一秒，都可能多一个女孩受害。<br>你会怎么做？</p>

    <div class="sm-choice">
      <button class="sm-choice-btn" onclick="ch4Choose('A')">
        <span class="sm-choice-letter">A</span>
        <div class="sm-choice-title">立即报警</div>
        <div class="sm-choice-desc">相信苏然留下的证据，联系陈警官。越早收网，越少人受害——哪怕这可能会打乱她的计划。</div>
      </button>
      <button class="sm-choice-btn" onclick="ch4Choose('B')">
        <span class="sm-choice-letter">B</span>
        <div class="sm-choice-title">先告诉苏然妈妈</div>
        <div class="sm-choice-desc">她妈妈已经为"失踪"的女儿担惊受怕太久。在动手之前，至少让她知道——她的女儿还活着，而且比谁都勇敢。</div>
      </button>
    </div>
  </div>
</section>

<!-- ====== ch4-ending ====== -->
<section class="screen sm-screen" id="ch4-ending">
  <div class="sm-inner">
    <div class="sm-tag">EPILOGUE · 终</div>
    <h1 class="sm-h1">碎镜之后</h1>
    <p class="sm-sub" id="ch4-ending-intro"></p>

    <div class="sm-ending-news">
      <div class="src">蔚海市公安局 · 通报</div>
      <h3>警方捣毁 AI 情感诈骗团伙，解救受害者 13 人</h3>
      <p>蔚海市刑侦支队通报，依托公民提供的关键电子证据，成功打掉一个长期利用 AI 换脸、声音合成实施"杀猪盘"的犯罪团伙，抓获主要嫌疑人 9 名，解救、帮扶受害人 13 名，涉案金额逾千万元。</p>
    </div>

    <div class="sm-ending-block">
      <p><b style="color:#8fbce6;">关于周梅——</b><br>因主动配合调查并提供关键证据，获从轻处理。她的女儿已被妥善安置。<br>她在笔录里只说了一句话："谢谢你们，让我女儿不用再过这种日子。"</p>
    </div>

    <div class="sm-ending-block q">
      <p><b style="color:#e8c47a;">关于苏然——</b><br>苏然安全回家。<br><span class="sm-ending-quote">"最可怕的不是被骗了 15 万，而是那段日子里，我连自己都不相信了。"</span></p>
    </div>

    <div class="sm-ending-final">
      <p>本作品改编自真实案例。<br>AI 换脸、声音合成、网络谣言、情感操纵——这些正在发生。</p>
      <p class="last">不是每个"完美恋人"都是假的，<br>但请记住：真正的爱，不会让你切断和世界的联系。</p>
    </div>

    <button class="sm-share-btn" onclick="smShare()">&#128279; 分享给在乎的人</button>
    <button class="sm-replay" onclick="location.reload()">重新开始</button>
  </div>
</section>
`;

    /* ---------- 监控时间跳动 ---------- */
    function tickCam() {
        const el = document.getElementById('ch4-cam-time');
        if (!el) return;
        const d = new Date();
        el.textContent = String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0') + ':' +
            String(d.getSeconds()).padStart(2, '0');
    }
    tickCam();
    setInterval(tickCam, 1000);

    /* ---------- 最终留言逐段渐显 ---------- */
    setTimeout(function () {
        const paras = document.querySelectorAll('#ch4-final-msg p');
        paras.forEach(function (p, i) {
            setTimeout(function () { p.classList.add('in'); }, i * 520);
        });
        // 读完注册线索
        setTimeout(function () {
            findClue('ch4-final', '读完了苏然的最后留言。', '苏然没有失踪——她潜入了诈骗团伙，把全部证据留给了你。密码 1003。');
        }, paras.length * 520 + 400);
    }, 500);

    /* ---------- 章节过渡 ---------- */
    showChapterTransition(4, '碎镜', '镜子碎了，碎片里映出的是另一个真相', function () {
        showScreen('ch4-reveal');
        findClue('ch4-reveal', '发现苏然可能并未失踪，反而与团伙有资金往来。', '监控拍到苏然在操作新的"角色"账户；她的账户收到了涉案资金。她究竟是谁？');
    });
}

/* ---------- 章节四：选择 ---------- */
function ch4Choose(choice) {
    const intro = document.getElementById('ch4-ending-intro');
    if (choice === 'A') {
        intro.innerHTML = '你拨通了陈警官的电话。证据确凿，收网迅速。苏然在被护送出来时，远远朝你点了一下头——<b>她懂你为什么没等那 72 小时</b>。';
        findClue('ch4-choice-a', '选择立即报警。', '越早收网，越少人受害。证据链完整，警方迅速行动。');
    } else {
        intro.innerHTML = '你先找到了苏然的妈妈。这位独自把女儿拉扯大的女人，在听到"她还活着"四个字时，哭得像个孩子。然后她说：<b>"去吧，去做该做的事。我等她回家。"</b>';
        findClue('ch4-choice-b', '选择先告诉苏然妈妈。', '在动手之前，至少让最担心她的人知道——她还活着，而且很勇敢。');
    }
    showScreen('ch4-ending');
}

/* ---------- 章节四：分享 ---------- */
function smShare() {
    const text = '我刚玩完《碎镜》——一个关于 AI 情感诈骗的互动故事。真正的爱，不会让你切断和世界的联系。';
    const url = location.href;
    if (navigator.share) {
        navigator.share({ title: '碎镜', text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url + ' ' + text).then(function () {
            alert('链接已复制。\n\n把它分享给在乎的人吧。');
        }, function () { alert(text + '\n\n' + url); });
    } else {
        alert(text + '\n\n' + url);
    }
}

// Expose functions globally
window.loadChapter3 = loadChapter3;
window.loadChapter4 = loadChapter4;
window.smShare = smShare;
