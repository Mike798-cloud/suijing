/* ============================================================
   碎镜 (Shattered Mirror) — 章节 1 & 2 内容与逻辑
   章节1：失联 (Lost Contact)   章节2：滤镜 (The Filter)
   依赖宿主（index.html）提供的全局接口：
     showScreen(id) / findClue(id, desc, text)
     showChapterTransition(num, name, sub, callback)
     state { currentChapter, cluesFound:Set }
     容器 #game-screens
   若宿主尚未提供上述接口，文件底部的兼容层会自动补齐，
   使本文件可独立运行/调试，且不会覆盖宿主已有的实现。
   风格与 content-ch3-ch4.js 保持一致：
     - 全局 loadChapter1() / loadChapter2()
     - container.innerHTML += 注入 <style> + <section class="screen sm-screen">
     - 行内 onclick="全局函数()" 绑定（可经受后续 innerHTML += 重解析）
   ============================================================ */

/* ============================================================
   兼容层（仅当宿主未提供时启用，绝不覆盖已有实现）
   ============================================================ */
(function () {
    if (typeof window.state === 'undefined' || !window.state) {
        window.state = { currentChapter: 0, cluesFound: new Set() };
    }
    if (!window.state.cluesFound) window.state.cluesFound = new Set();

    if (!document.getElementById('game-screens')) {
        var gs = document.createElement('div');
        gs.id = 'game-screens';
        (document.getElementById('app') || document.body).appendChild(gs);
    }

    if (typeof window.showScreen !== 'function') {
        window.showScreen = function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            var all = document.querySelectorAll('.screen');
            for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
            el.classList.add('active');
            try { el.scrollTop = 0; } catch (e) {}
        };
    }

    if (typeof window.findClue !== 'function') {
        window.findClue = function (id, desc, text) {
            try {
                var c = window.state && window.state.cluesFound;
                if (c && typeof c.add === 'function') c.add(id);
                else if (window.GameState && Array.isArray(window.GameState.cluesFound) && window.GameState.cluesFound.indexOf(id) < 0) window.GameState.cluesFound.push(id);
            } catch (e) {}
            var msg = '线索 · ' + (desc || '');
            if (typeof window.showToast === 'function') window.showToast(msg);
            else smToast(msg);
        };
    }
})();

/* ---------- 轻提示 ---------- */
function smToast(msg, ms) {
    var t = document.getElementById('sm-toast');
    if (!t) { t = document.createElement('div'); t.id = 'sm-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
}

/* ---------- 是否已拥有某条线索（兼容 Set / Array） ---------- */
function smHasClue(id) {
    var c = window.state && window.state.cluesFound;
    if (!c) return false;
    if (typeof c.has === 'function') return c.has(id);
    if (Array.isArray(c)) return c.indexOf(id) >= 0;
    return false;
}

/* ---------- 章节过渡（优先用宿主 4 参数版，否则用自带浮层） ---------- */
function smGoChapter(num, name, sub, callback) {
    var fn = window.showChapterTransition;
    if (typeof fn === 'function' && fn.length >= 3) { fn(num, name, sub, callback); return; }
    smTransition(num, name, sub, callback);
}
function smTransition(num, name, sub, callback) {
    var ov = document.getElementById('sm-chapter-trans');
    if (!ov) { ov = document.createElement('div'); ov.id = 'sm-chapter-trans'; document.body.appendChild(ov); }
    var n = (num < 10 ? '0' : '') + num;
    ov.innerHTML =
        '<div class="smt-inner">' +
        '<div class="smt-label">CHAPTER ' + n + '</div>' +
        '<div class="smt-name">' + name + '</div>' +
        '<div class="smt-sub">' + (sub || '') + '</div>' +
        '<div class="smt-tap">轻触继续</div></div>';
    ov.classList.add('show');
    var done = false;
    var go = function () {
        if (done) return; done = true;
        ov.classList.remove('show');
        ov.removeEventListener('click', go);
        if (typeof callback === 'function') callback();
    };
    setTimeout(function () { ov.addEventListener('click', go); }, 600);
}

/* ============================================================
   第一章 · 数据
   ============================================================ */
var ch1Batch2 =
    '<div class="smp-msg-time">今天 12:31</div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">今天中午跟谁吃饭了？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">跟王丽啊，就公司楼下那个快餐</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">别跟你那个同事王丽走太近了，她不是好人</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">啊？她人挺好的啊，怎么了？</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">我给你看个东西</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-shot">' +
        '<div class="smp-shot"><div class="smp-shot-cap">王丽 与 某人的聊天</div>' +
        '<div class="smp-shot-msgs">' +
        '<div class="smp-shot-m l2">苏然那女的真好骗哈哈哈</div>' +
        '<div class="smp-shot-m r2">是吧，听说她谈了个有钱男友</div>' +
        '<div class="smp-shot-m l2">钱不钱的我不管，我就是看她不顺眼</div>' +
        '</div></div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">这是她跟别人说你的，你自己看。我骗你干嘛</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">你信我还是信外人？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">……我信你。可她从来没在我面前说过这些</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-voice" onclick="smToast(\'（语音消息 · 15秒）这段语音将在第二章用于频谱分析\')"><span class="smp-voice-ico">&#128266;</span><span class="smp-voice-wave"><i></i><i></i><i></i><i></i><i></i></span><span class="smp-voice-dur">15&Prime;</span></div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">我听完了……好吧，我以后少跟她来往</div></div>';

var ch1Batch3 =
    '<div class="smp-msg-time">今天 20:07</div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">最近花销大不大？我先转你点钱</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-transfer"><span class="smp-tr-ico">&#128184;</span><span class="smp-tr-txt"><span class="smp-tr-title">转账</span><span class="smp-tr-amount">¥5,000.00</span></span></div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">密码多少我直接转，省得你来回操作麻烦</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">不用啦，我够花的，你留着</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">听话，拿着。咱俩谁跟谁啊。对了，别告诉家里人我们的事，他们不懂，只会瞎操心</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">嗯……好</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">还有，你那个闺蜜周梅也少联系，她对你也没安好心，我只为你好</div></div>' +
    '<div class="smp-msg left smp-msg-deleted"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-deleted"><span class="smp-del-ico">&#9888;</span> 该消息已被发送者删除</div></div>';

var ch1WechatStep = 1;   /* 1=第一段已显示 */
var ch1LockInput = '';

/* ============================================================
   第二章 · 数据
   ============================================================ */
var ch2DiaryData = [
    { date: '6月12日', title: '他是完美的', mood: '😊',
      text: '林晨真的太好了，每天早安晚安，记得我所有的喜好，比我还要了解我自己。他说他是做金融的，月薪三万，有房有车。我何德何能遇到他……闺蜜说我太幸运了，让我好好珍惜。我也会的。',
      pattern: '热恋期 · 理想化（爱情轰炸）：完美的简历、无微不至的关心，精准击中孤独者的所有渴望。' },
    { date: '7月3日', title: '有点不对', mood: '😕',
      text: '今天跟王丽吃午饭，她说林晨可能不存在，让我小心点。我笑了，她是不是嫉妒我？她说她可以帮我查。回家跟林晨说了，他突然很生气，说王丽是嫉妒我，让我离她远点。他还给我看了王丽的"聊天记录"，原来王丽一直在背后说我坏话……我不该怀疑林晨的，他是为我好。',
      pattern: '挑拨 · 孤立：用伪造的"聊天记录"栽赃闺蜜，让受害者主动疏远唯一能提醒她的人。' },
    { date: '7月20日', title: '他在帮我', mood: '🤔',
      text: '林晨说为了我们的未来，让我把存款转到他那里理财，他认识靠谱的人，收益比银行高。他说下个月就连本带利还我。我转了八万。他还帮我删了王丽的微信，说这样的人不值得交。嗯，他是对的。虽然有点舍不得，但他比我看得清楚。',
      pattern: '经济控制：以"共同理财"为由转走存款，并替受害者删除社交关系，加深依赖。' },
    { date: '8月5日', title: '我好累', mood: '😔',
      text: '已经一个月没见到朋友了。林晨说等他忙完这阵就带我见他父母。可是他总在变……上次视频他长得不太一样，下巴的线条都变了，他说换了手机摄像头，画质差。我信他。可是晚上睡不着的时候，我会想，他到底长什么样？我好累。',
      pattern: '认知失调：已察觉异常（长相变化），却用"换了摄像头"自我说服，理性被情感压制。' },
    { date: '8月15日', title: '不能让妈妈知道', mood: '😢',
      text: '今天妈妈打电话来问怎么不接电话，说想我了。林晨说家人会影响我们的关系，让我先别联系，等稳定了再说。我听了他的话，没回拨。但今晚我偷偷哭了。我不知道我还是不是我自己。镜子里那个人，我快不认识了。',
      pattern: '彻底隔离：切断与家人联系，受害者开始丧失自我认同——"我还是不是我自己"。' }
];
var ch2ReadEntries = new Set();
var ch2CurrentEntry = 0;

/* ============================================================
   样式（第一章 + 第二章共用，带 id 便于去重）
   ============================================================ */
function smStyleHTML() {
    return `
<style id="sm-ch12-style">
/* ====== 碎镜 章节1/2 · 手机界面样式 ====== */
.screen.sm-screen{display:none;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;min-height:100dvh;padding:8px;position:relative;top:auto;left:auto;transform:none;background:radial-gradient(ellipse at 50% 30%,#15171f,#06070b 75%);}
.screen.sm-screen.active{display:flex;animation:smpFade .5s ease;}
@keyframes smpFade{from{opacity:0}to{opacity:1}}

.smp-phone{position:relative;width:min(390px,96vw);height:min(800px,94vh);border-radius:46px;background:#000;border:11px solid #0a0b10;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.05);overflow:hidden;display:flex;flex-direction:column;}
.smp-phone::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:126px;height:26px;background:#000;border-radius:0 0 18px 18px;z-index:40;}
.smp-bar{flex:none;height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 22px 0 26px;font-size:13px;font-weight:600;z-index:20;}
.smp-bar.light{color:#1c1c1e;background:#f7f7f7;}
.smp-bar.gray{color:#111;background:#ededed;}
.smp-bar.dark{color:#fff;}
.smp-bar .smp-bar-r{display:flex;align-items:center;gap:6px;}
.smp-view{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;position:relative;}
.smp-home-bar{flex:none;height:22px;display:flex;align-items:center;justify-content:center;}
.smp-home-bar::after{content:'';width:130px;height:5px;border-radius:3px;background:rgba(120,120,128,.5);}
.smp-home-bar.dark::after{background:rgba(255,255,255,.6);}

/* 锁屏 */
.smp-lock{background:url('phone-wallpaper.jpg') center/cover no-repeat #000;}
.smp-lock::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.05) 45%,rgba(0,0,0,.62) 100%);}
.smp-lock .smp-view{display:flex;flex-direction:column;align-items:center;padding:70px 18px 10px;text-align:center;}
.smp-lock-time{font-size:64px;font-weight:200;color:#fff;line-height:1;text-shadow:0 2px 18px rgba(0,0,0,.4);}
.smp-lock-date{font-size:14px;color:rgba(255,255,255,.9);margin-top:6px;text-shadow:0 1px 8px rgba(0,0,0,.4);cursor:pointer;}
.smp-lock-wp-cap{margin-top:18px;font-size:12px;color:rgba(255,255,255,.85);background:rgba(0,0,0,.28);padding:5px 12px;border-radius:20px;backdrop-filter:blur(6px);cursor:pointer;}
.smp-lock-sticky{margin-top:26px;max-width:260px;background:#fff7d6;color:#5a4a1a;font-size:13px;line-height:1.6;padding:12px 14px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.4);transform:rotate(-2deg);font-family:'Ma Shan Zheng','Noto Serif SC',cursive;cursor:pointer;}
.smp-lock-sticky b{color:#b8860b;}
.smp-lock-dots{display:flex;gap:18px;margin:30px 0 8px;}
.smp-lock-dots span{width:13px;height:13px;border-radius:50%;border:2px solid rgba(255,255,255,.85);transition:.15s;}
.smp-lock-dots span.filled{background:#fff;}
.smp-lock-hint{font-size:12px;color:rgba(255,255,255,.8);height:18px;}
.smp-lock-hint.err{color:#ff6b6b;}
.smp-lock-hint.ok{color:#7ee787;}
.smp-keypad{margin-top:auto;display:grid;grid-template-columns:repeat(3,68px);gap:14px;justify-content:center;padding-bottom:6px;}
.smp-key{width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:24px;font-weight:500;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.12);transition:.12s;}
.smp-key:active{background:rgba(255,255,255,.32);transform:scale(.94);}
.smp-key.dim{background:transparent;color:rgba(255,255,255,.7);font-size:18px;}
.smp-shake{animation:smpShake .45s;}
@keyframes smpShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}

/* 主屏 */
.smp-home{background:linear-gradient(160deg,#3a3f55,#1d2030 70%);}
.smp-home .smp-view{padding:8px 14px 14px;}
.smp-home-sticky{margin:6px 2px 14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px;font-size:12.5px;color:#e9e9ef;line-height:1.6;backdrop-filter:blur(6px);}
.smp-home-sticky b{color:#ffd479;}
.smp-home-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 6px;}
.smp-app{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;cursor:pointer;}
.smp-app-ico{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 6px 16px rgba(0,0,0,.35);}
.smp-app-name{font-size:11.5px;color:#e9e9ef;}
.smp-app-badge{position:absolute;top:-3px;left:50%;margin-left:14px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ff3b30;color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #1d2030;}
.smp-home-dock{margin-top:auto;display:flex;justify-content:space-around;padding:12px 6px 4px;border-top:1px solid rgba(255,255,255,.1);}

/* 微信 */
.smp-chat .smp-view{background:#ededed;padding:10px 10px 16px;display:flex;flex-direction:column;gap:7px;}
.smp-chat-head{display:flex;align-items:center;gap:8px;}
.smp-chat-name{font-size:15px;font-weight:600;}
.smp-chat-sub{font-size:11px;color:#888;}
.smp-back{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#111;background:none;border:none;cursor:pointer;}
.smp-back.light{color:#fff;}
.smp-msg-time{text-align:center;font-size:11px;color:#aaa;margin:6px 0;}
.smp-msg{display:flex;gap:7px;max-width:84%;animation:smpMsgIn .3s ease;}
@keyframes smpMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.smp-msg.right{align-self:flex-end;flex-direction:row-reverse;}
.smp-avatar{flex:none;width:34px;height:34px;border-radius:6px;background-size:cover;background-position:center;background-color:#ccc;}
.smp-bubble{position:relative;padding:8px 11px;border-radius:8px;font-size:14px;line-height:1.55;max-width:100%;word-break:break-word;}
.smp-msg.left .smp-bubble{background:#fff;color:#111;}
.smp-msg.right .smp-bubble{background:#95ec69;color:#111;}
.smp-msg.left .smp-bubble::before{content:'';position:absolute;left:-5px;top:11px;border:6px solid transparent;border-right-color:#fff;}
.smp-msg.right .smp-bubble::before{content:'';position:absolute;right:-5px;top:11px;border:6px solid transparent;border-left-color:#95ec69;}
.smp-bubble img{width:170px;border-radius:6px;display:block;}
.smp-bubble-shot{padding:0;overflow:hidden;background:#fff;}
.smp-bubble-shot::before{display:none;}
.smp-shot{width:200px;}
.smp-shot-cap{font-size:11px;color:#888;padding:8px 10px 4px;border-bottom:1px solid #f0f0f0;}
.smp-shot-msgs{padding:8px 10px;display:flex;flex-direction:column;gap:6px;}
.smp-shot-m{font-size:12.5px;padding:6px 9px;border-radius:7px;max-width:85%;}
.smp-shot-m.l2{background:#fff;color:#333;align-self:flex-start;border:1px solid #eee;}
.smp-shot-m.r2{background:#95ec69;color:#111;align-self:flex-end;}
.smp-bubble-redpacket{padding:0;display:flex;background:#fa9d3b;color:#fff;}
.smp-bubble-redpacket::before{border-right-color:#fa9d3b;}
.smp-rp-ico{width:44px;display:flex;align-items:center;justify-content:center;font-size:24px;background:rgba(0,0,0,.12);}
.smp-rp-txt{padding:8px 12px;}
.smp-rp-title{display:block;font-size:12px;opacity:.9;}
.smp-rp-amount{display:block;font-size:15px;font-weight:600;}
.smp-rp-desc{display:block;font-size:11px;opacity:.85;margin-top:2px;}
.smp-bubble-transfer{padding:0;display:flex;background:#fa9d3b;color:#fff;}
.smp-bubble-transfer::before{border-right-color:#fa9d3b;}
.smp-tr-ico{width:44px;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(0,0,0,.12);}
.smp-tr-txt{padding:8px 12px;}
.smp-tr-title{display:block;font-size:12px;opacity:.9;}
.smp-tr-amount{display:block;font-size:15px;font-weight:600;}
.smp-bubble-voice{display:flex;align-items:center;gap:8px;min-width:120px;}
.smp-bubble-voice::before{display:none;}
.smp-voice-ico{font-size:15px;}
.smp-voice-wave{display:flex;align-items:center;gap:2px;height:16px;}
.smp-voice-wave i{width:3px;background:#111;border-radius:2px;}
.smp-voice-wave i:nth-child(1){height:8px;} .smp-voice-wave i:nth-child(2){height:14px;} .smp-voice-wave i:nth-child(3){height:16px;} .smp-voice-wave i:nth-child(4){height:11px;} .smp-voice-wave i:nth-child(5){height:7px;}
.smp-voice-dur{font-size:12px;color:#666;margin-left:auto;}
.smp-msg-deleted .smp-bubble,.smp-bubble-deleted{background:#f2f2f2;color:#999;font-size:12.5px;display:flex;align-items:center;gap:6px;}
.smp-bubble-deleted::before{display:none;}
.smp-del-ico{color:#bbb;}
.smp-chat-foot{flex:none;padding:10px 12px;background:#f7f7f7;border-top:1px solid #e3e3e3;display:flex;justify-content:center;}
.smp-continue{padding:9px 26px;border-radius:18px;background:#07c160;color:#fff;font-size:14px;border:none;cursor:pointer;}
.smp-continue:active{transform:scale(.97);}
.smp-reflect{align-self:center;margin:8px 0 2px;max-width:88%;font-size:12.5px;color:#888;line-height:1.7;text-align:center;font-style:italic;}

/* 朋友圈 */
.smp-moments .smp-view{background:#fff;}
.smp-moments-cover{height:150px;background:url('su-ran.jpg') center/cover no-repeat #444;position:relative;}
.smp-moments-cover::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.25));}
.smp-moments-me{position:relative;height:60px;padding:0 14px;display:flex;justify-content:flex-end;align-items:flex-end;margin-top:-30px;}
.smp-moments-me .av{width:60px;height:60px;border-radius:10px;background:url('su-ran.jpg') center/cover #ccc;border:2px solid #fff;}
.smp-moments-body{padding:6px 14px 16px;}
.smp-post{padding:12px 0;border-bottom:1px solid #f0f0f0;}
.smp-post-head{display:flex;align-items:center;gap:8px;}
.smp-post-av{width:38px;height:38px;border-radius:8px;background-size:cover;background-position:center;background-color:#ccc;}
.smp-post-name{font-size:14px;font-weight:600;color:#576b95;}
.smp-post-text{font-size:14px;color:#222;line-height:1.6;margin:7px 0;}
.smp-post-imgs img{width:170px;height:170px;object-fit:cover;border-radius:8px;cursor:zoom-in;display:block;}
.smp-post-meta{font-size:11px;color:#bbb;margin-top:7px;}
.smp-post-actions{display:flex;gap:16px;margin-top:5px;font-size:12px;color:#576b95;}
.smp-post-cmts{margin-top:6px;background:#f7f7f7;border-radius:8px;padding:7px 10px;font-size:13px;color:#333;line-height:1.7;}
.smp-post-cmts b{color:#576b95;font-weight:600;}
.smp-warn{background:#fff7e6;}
.smp-warn .smp-post-text{color:#935a00;}

/* 照片放大浮层 */
.smp-photo-view{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.92);display:none;flex-direction:column;}
.smp-photo-view.show{display:flex;animation:smpFade .3s ease;}
.smp-photo-bar{flex:none;height:50px;display:flex;align-items:center;padding:0 14px;color:#fff;font-size:14px;}
.smp-photo-stage{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;padding:14px;}
.smp-photo-stage img{max-width:92%;max-height:100%;border-radius:6px;transition:transform .5s cubic-bezier(.2,.8,.2,1);transform-origin:30% 75%;}
.smp-photo-stage img.zoomed{transform:scale(2.2);}
.smp-photo-anno{position:absolute;left:18%;top:62%;transform:translate(0,-50%);display:none;align-items:center;gap:8px;}
.smp-photo-anno.show{display:flex;}
.smp-anno-ring{width:54px;height:54px;border-radius:50%;border:2px solid #ff3b30;box-shadow:0 0 0 4px rgba(255,59,48,.25);animation:smpPulse 1.4s infinite;flex:none;}
@keyframes smpPulse{0%,100%{box-shadow:0 0 0 4px rgba(255,59,48,.25)}50%{box-shadow:0 0 0 10px rgba(255,59,48,0)}}
.smp-anno-label{background:rgba(255,59,48,.92);color:#fff;font-size:12px;padding:5px 10px;border-radius:6px;max-width:180px;line-height:1.4;}
.smp-photo-cap{flex:none;padding:10px 18px;text-align:center;color:#bbb;font-size:12.5px;line-height:1.6;min-height:42px;}
.smp-photo-cap.danger{color:#ff8a8a;}
.smp-photo-cap b{color:#fff;}
.smp-photo-tools{flex:none;padding:10px 18px 22px;display:flex;flex-direction:column;gap:10px;align-items:center;}
.smp-photo-btn{padding:11px 30px;border-radius:22px;font-size:14px;border:none;cursor:pointer;}
.smp-photo-btn.zoom{background:rgba(255,255,255,.14);color:#fff;}
.smp-photo-btn.go{background:linear-gradient(135deg,#c8424a,#8b2d33);color:#fff;}

/* 第二章通用 */
.smp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 22px;border-radius:10px;border:1px solid rgba(201,169,97,.4);background:transparent;color:#f1efea;font-size:14px;cursor:pointer;font-family:inherit;}
.smp-btn.primary{background:linear-gradient(135deg,#c8424a,#8b2d33);border-color:transparent;color:#fff;}
.smp-btn.block{width:100%;}
.smp-btn.ghost{border-color:rgba(255,255,255,.18);color:#c4c5cf;}
.smp-btn:disabled{opacity:.5;cursor:default;}

/* 影院式过渡屏 */
.smp-cinema{position:relative;overflow:hidden;}
.smp-cinema .smp-cine-bg{position:absolute;inset:0;background:url('diary.jpg') center/cover no-repeat #000;}
.smp-cinema .smp-cine-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,9,14,.7),rgba(8,9,14,.88));}
.smp-cine-inner{position:relative;z-index:2;max-width:520px;width:100%;padding:40px 28px;text-align:center;display:flex;flex-direction:column;align-items:center;}
.smp-cine-tag{font-size:11px;letter-spacing:.4em;color:#c9a961;text-transform:uppercase;margin-bottom:18px;}
.smp-cine-h{font-family:'Noto Serif SC',serif;font-size:30px;font-weight:700;color:#f1efea;letter-spacing:.06em;margin-bottom:16px;line-height:1.4;}
.smp-cine-p{font-size:14.5px;color:#b9bbc6;line-height:2;margin-bottom:30px;}
.smp-cine-p b{color:#e8c47a;}

/* 备忘录/日记列表 */
.smp-notes .smp-view{background:#1c1e26;padding:12px 12px 20px;}
.smp-notes-head{display:flex;align-items:center;justify-content:space-between;padding:6px 4px 12px;}
.smp-notes-title{font-size:22px;font-weight:700;color:#f1efea;}
.smp-notes-count{font-size:12px;color:#8b8d99;}
.smp-notes-count b{color:#c9a961;}
.smp-diary-item{display:flex;align-items:center;gap:12px;background:#262936;border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;border:1px solid rgba(255,255,255,.05);transition:.25s;}
.smp-diary-item:active{transform:scale(.99);}
.smp-diary-item.read{border-left:3px solid #5b9bd5;}
.smp-diary-mood-big{font-size:24px;flex:none;width:40px;text-align:center;}
.smp-diary-meta{flex:1;min-width:0;}
.smp-diary-date{font-size:12px;color:#c9a961;}
.smp-diary-t{font-size:15px;color:#f1efea;font-weight:500;margin-top:2px;}
.smp-diary-chev{color:#5a5d6b;font-size:18px;}
.smp-diary-item.read .smp-diary-chev{color:#5b9bd5;}
.smp-ch2-hub{margin-top:18px;padding:14px;background:rgba(200,66,74,.08);border:1px dashed rgba(200,66,74,.3);border-radius:12px;}
.smp-ch2-hub-t{font-size:12px;color:#e98a91;letter-spacing:.1em;margin-bottom:10px;}
.smp-ch2-hub-btn{display:flex;align-items:center;gap:10px;width:100%;background:#262936;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:12px 14px;margin-bottom:8px;cursor:pointer;color:#f1efea;font-size:14px;font-family:inherit;text-align:left;}
.smp-ch2-hub-btn .ico{font-size:18px;}
.smp-ch2-hub-btn .tag{margin-left:auto;font-size:11px;color:#8b8d99;}
.smp-ch2-hub-btn.done .tag{color:#7ee787;}

/* 日记详情 */
.smp-diary-detail .smp-view{background:#16181f;padding:18px 18px 24px;}
.smp-dd-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.smp-dd-date{font-size:13px;color:#c9a961;}
.smp-dd-mood{font-size:18px;}
.smp-dd-title{font-family:'Noto Serif SC',serif;font-size:24px;color:#f1efea;margin-bottom:16px;line-height:1.3;}
.smp-dd-text{font-size:15px;color:#cfd0d8;line-height:2.1;white-space:pre-line;}
.smp-dd-pattern{margin-top:20px;background:rgba(200,66,74,.1);border-left:3px solid #c8424a;border-radius:0 10px 10px 0;padding:12px 14px;font-size:13px;color:#e9c7ca;line-height:1.8;}
.smp-dd-pattern b{color:#e8c47a;}
.smp-dd-foot{flex:none;padding:12px;background:#1c1e26;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:10px;justify-content:space-between;}

/* 新闻 */
.smp-browser .smp-view{background:#fafafa;}
.smp-url-bar{flex:none;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f0f0f0;border-bottom:1px solid #e0e0e0;font-size:12px;color:#555;}
.smp-url-lock{color:#07c160;}
.smp-news-art{padding:18px 18px 8px;}
.smp-news-src{font-size:11px;color:#999;letter-spacing:.1em;margin-bottom:8px;}
.smp-news-h1{font-size:21px;font-weight:700;color:#1a1a1a;line-height:1.4;margin-bottom:10px;font-family:'Noto Serif SC',serif;}
.smp-news-img{width:100%;border-radius:8px;margin-bottom:12px;}
.smp-news-body{font-size:14px;color:#333;line-height:1.9;}
.smp-news-body p{margin-bottom:10px;}
.smp-news-body b{color:#c8424a;}
.smp-news-cmts{padding:6px 18px 18px;}
.smp-news-cmts-t{font-size:13px;color:#666;border-top:1px solid #eee;padding-top:14px;margin-bottom:10px;}
.smp-news-cmt{background:#fff;border:1px solid #eee;border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:13px;color:#333;line-height:1.7;}
.smp-news-cmt b{color:#576b95;}
.smp-news-cmt.hl{border-color:#ffd479;background:#fffdf3;}
.smp-news-cmt.hl b{color:#b8860b;}
.smp-news-foot{flex:none;padding:12px 16px;background:#fafafa;border-top:1px solid #eee;display:flex;justify-content:center;}

/* 语音分析 */
.smp-va .smp-view{background:#0e0f17;padding:18px;}
.smp-va-msg{display:flex;align-items:center;gap:10px;background:#1a1c24;border-radius:14px;padding:14px 16px;margin-bottom:18px;}
.smp-va-ico{width:40px;height:40px;border-radius:50%;background:#07c160;display:flex;align-items:center;justify-content:center;font-size:18px;flex:none;}
.smp-va-bar{flex:1;height:28px;display:flex;align-items:center;gap:2px;}
.smp-va-bar i{width:3px;background:#95ec69;border-radius:2px;height:10px;}
.smp-va-dur{font-size:12px;color:#888;}
.smp-va-meta{font-size:12px;color:#8b8d99;line-height:1.7;margin-bottom:16px;}
.smp-va-meta b{color:#c9a961;}
.smp-va-result{display:none;background:#11131b;border:1px solid rgba(91,155,213,.25);border-radius:12px;padding:16px;margin-bottom:14px;}
.smp-va-result.show{display:block;animation:smpFade .4s ease;}
.smp-va-wave{height:90px;display:flex;align-items:center;gap:2px;overflow:hidden;margin-bottom:14px;background:#0a0b12;border-radius:8px;padding:8px;}
.smp-va-wave i{flex:1;min-width:2px;background:linear-gradient(to top,#5b9bd5,#7fb6e8);border-radius:2px;animation:smpBar .9s ease-in-out infinite;}
@keyframes smpBar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.smp-va-verdict{font-size:13px;color:#c4c5cf;line-height:1.9;}
.smp-va-verdict b{color:#ff8a8a;}
.smp-va-foot{flex:none;padding:12px;background:#0e0f17;border-top:1px solid rgba(255,255,255,.06);display:flex;justify-content:center;}

/* 章节过渡浮层（自带） */
#sm-chapter-trans{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#11131c,#06070b 75%);cursor:pointer;}
#sm-chapter-trans.show{display:flex;animation:smpFade .6s ease;}
#sm-chapter-trans .smt-inner{text-align:center;padding:40px;max-width:560px;animation:smpFadeUp .8s ease;}
@keyframes smpFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
#sm-chapter-trans .smt-label{font-size:12px;letter-spacing:.5em;color:#c9a961;margin-bottom:20px;}
#sm-chapter-trans .smt-name{font-family:'Noto Serif SC',serif;font-size:54px;font-weight:700;color:#f1efea;letter-spacing:.12em;margin-bottom:22px;}
#sm-chapter-trans .smt-sub{font-size:15px;color:#9a9ca8;line-height:2;margin-bottom:40px;}
#sm-chapter-trans .smt-tap{font-size:12px;color:#5a5d6b;letter-spacing:.3em;animation:smpBlink 1.6s infinite;}
@keyframes smpBlink{0%,100%{opacity:1}50%{opacity:.3}}

/* 轻提示 */
#sm-toast{position:fixed;left:50%;bottom:22%;transform:translateX(-50%) translateY(16px);background:rgba(20,20,28,.94);color:#fff;padding:10px 18px;border-radius:12px;font-size:13px;z-index:300;opacity:0;pointer-events:none;transition:.3s;max-width:84%;text-align:center;line-height:1.5;}
#sm-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
</style>
`;
}

/* ============================================================
   第一章 · 屏幕 HTML
   ============================================================ */
function ch1SectionsHTML() {
    return `
<!-- ====== ch1-lock-screen ====== -->
<section class="screen sm-screen" id="ch1-lock-screen">
  <div class="smp-phone smp-lock">
    <div class="smp-bar dark"><span id="ch1-lock-bar-time">9:24</span><span class="smp-bar-r"><span>&#9679;&#9679;&#9679;</span><span>&#128267;</span></span></div>
    <div class="smp-view">
      <div class="smp-lock-time" id="ch1-lock-time">9:24</div>
      <div class="smp-lock-date" onclick="ch1Examine('date')">10月3日 星期三</div>
      <div class="smp-lock-wp-cap" onclick="ch1Examine('wp')">闺蜜三人行 · 去年拍</div>
      <div class="smp-lock-sticky" onclick="ch1Examine('sticky')">密码是我<b>生日</b>，别再忘了！<br>—— 然然</div>
      <div class="smp-lock-dots" id="ch1-lock-dots"><span></span><span></span><span></span><span></span></div>
      <div class="smp-lock-hint" id="ch1-lock-hint">请输入锁屏密码</div>
      <div class="smp-keypad" id="ch1-keypad">
        <button class="smp-key" onclick="ch1LockKey('1')">1</button>
        <button class="smp-key" onclick="ch1LockKey('2')">2</button>
        <button class="smp-key" onclick="ch1LockKey('3')">3</button>
        <button class="smp-key" onclick="ch1LockKey('4')">4</button>
        <button class="smp-key" onclick="ch1LockKey('5')">5</button>
        <button class="smp-key" onclick="ch1LockKey('6')">6</button>
        <button class="smp-key" onclick="ch1LockKey('7')">7</button>
        <button class="smp-key" onclick="ch1LockKey('8')">8</button>
        <button class="smp-key" onclick="ch1LockKey('9')">9</button>
        <button class="smp-key dim"></button>
        <button class="smp-key" onclick="ch1LockKey('0')">0</button>
        <button class="smp-key dim" onclick="ch1LockKey('del')">&#9003;</button>
      </div>
    </div>
    <div class="smp-home-bar dark"></div>
  </div>
</section>

<!-- ====== ch1-home-screen ====== -->
<section class="screen sm-screen" id="ch1-home-screen">
  <div class="smp-phone smp-home">
    <div class="smp-bar dark"><span>9:25</span><span class="smp-bar-r"><span>&#128267;</span><span>96%</span></span></div>
    <div class="smp-view">
      <div class="smp-home-sticky">&#128221; 便签：<b>先看微信吧，可能有人找你。</b></div>
      <div class="smp-home-grid">
        <button class="smp-app" onclick="ch1OpenApp('wechat')"><span class="smp-app-ico" style="background:#07c160">&#128172;</span><span class="smp-app-name">微信</span><span class="smp-app-badge">3</span></button>
        <button class="smp-app" onclick="ch1OpenApp('moments')"><span class="smp-app-ico" style="background:linear-gradient(135deg,#ff6b6b,#ffa14a)">&#11088;</span><span class="smp-app-name">朋友圈</span></button>
        <button class="smp-app" onclick="ch1OpenApp('album')"><span class="smp-app-ico" style="background:#34c759">&#128247;</span><span class="smp-app-name">相册</span></button>
        <button class="smp-app" onclick="ch1OpenApp('notes')"><span class="smp-app-ico" style="background:#ffd60a;color:#333">&#128221;</span><span class="smp-app-name">备忘录</span></button>
        <button class="smp-app" onclick="ch1OpenApp('browser')"><span class="smp-app-ico" style="background:#1d6fe0">&#127760;</span><span class="smp-app-name">浏览器</span></button>
        <button class="smp-app" onclick="ch1OpenApp('calc')"><span class="smp-app-ico" style="background:#3a3a3c">&#129518;</span><span class="smp-app-name">计算器</span></button>
        <button class="smp-app" onclick="ch1OpenApp('music')"><span class="smp-app-ico" style="background:linear-gradient(135deg,#ff2d55,#ff6482)">&#127925;</span><span class="smp-app-name">音乐</span></button>
        <button class="smp-app" onclick="ch1OpenApp('settings')"><span class="smp-app-ico" style="background:#8e8e93">&#9881;</span><span class="smp-app-name">设置</span></button>
      </div>
      <div class="smp-home-dock">
        <button class="smp-app" onclick="ch1OpenApp('phone')"><span class="smp-app-ico" style="background:#34c759">&#128222;</span></button>
        <button class="smp-app" onclick="ch1OpenApp('browser')"><span class="smp-app-ico" style="background:#1d6fe0">&#127760;</span></button>
        <button class="smp-app" onclick="ch1OpenApp('music')"><span class="smp-app-ico" style="background:linear-gradient(135deg,#ff2d55,#ff6482)">&#127925;</span></button>
      </div>
    </div>
    <div class="smp-home-bar dark"></div>
  </div>
</section>

<!-- ====== ch1-wechat ====== -->
<section class="screen sm-screen" id="ch1-wechat">
  <div class="smp-phone smp-chat">
    <div class="smp-bar gray">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center"><div class="smp-chat-name">林晨 &#10084;</div><div class="smp-chat-sub">在线</div></div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view" id="ch1-wechat-body">
      <div class="smp-msg-time">昨天 22:18</div>
      <div class="smp-msg left"><div class="smp-avatar" style="background-image:url('lin-chen.jpg')"></div><div class="smp-bubble">宝宝早安&#9728;&#65039; 昨晚睡得好吗</div></div>
      <div class="smp-msg right"><div class="smp-avatar" style="background-image:url('su-ran.jpg')"></div><div class="smp-bubble">还行吧，梦到你了哈哈</div></div>
      <div class="smp-msg left"><div class="smp-avatar" style="background-image:url('lin-chen.jpg')"></div><div class="smp-bubble">梦到我什么了？是不是想我了&#128521;</div></div>
      <div class="smp-msg right"><div class="smp-avatar" style="background-image:url('su-ran.jpg')"></div><div class="smp-bubble">才不告诉你&#128541;</div></div>
      <div class="smp-msg left"><div class="smp-avatar" style="background-image:url('lin-chen.jpg')"></div><div class="smp-bubble"><img src="couple-1.jpg" alt="合照"></div></div>
      <div class="smp-msg left"><div class="smp-avatar" style="background-image:url('lin-chen.jpg')"></div><div class="smp-bubble">看，我给我们P的合照，好看吗？我技术不错吧</div></div>
      <div class="smp-msg right"><div class="smp-avatar" style="background-image:url('su-ran.jpg')"></div><div class="smp-bubble">天哪你也太会了吧！！我保存了</div></div>
      <div class="smp-msg left"><div class="smp-avatar" style="background-image:url('lin-chen.jpg')"></div><div class="smp-bubble">你开心就好。宝宝今天辛苦了，记得按时吃饭，别又熬夜</div></div>
      <div class="smp-msg left"><div class="smp-avatar" style="background-image:url('lin-chen.jpg')"></div><div class="smp-bubble smp-bubble-redpacket"><span class="smp-rp-ico">&#129369;</span><span class="smp-rp-txt"><span class="smp-rp-title">微信红包</span><span class="smp-rp-amount">&#165;520.00</span><span class="smp-rp-desc">拿去买点好吃的，别亏待自己</span></span></div></div>
    </div>
    <div class="smp-chat-foot"><button class="smp-continue" id="ch1-wechat-next" onclick="ch1WechatNext()">继续</button></div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-moments ====== -->
<section class="screen sm-screen" id="ch1-moments">
  <div class="smp-phone smp-moments">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">朋友圈</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-moments-cover"></div>
      <div class="smp-moments-me"><div class="av"></div></div>
      <div class="smp-moments-body">
        <div class="smp-post">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">苏然</div></div>
          <div class="smp-post-text">遇见你是最美好的意外&#10084;&#65039;</div>
          <div class="smp-post-imgs"><img src="couple-2.jpg" alt="合照" onclick="ch1OpenPhoto('couple-2.jpg')"></div>
          <div class="smp-post-meta">2小时前</div>
          <div class="smp-post-actions"><span>&#9825; 23</span><span>&#128172; 1</span></div>
          <div class="smp-post-cmts"><b>林晨</b>：我的小公主</div>
        </div>
        <div class="smp-post">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">苏然</div></div>
          <div class="smp-post-text">今天又是被投喂的一天&#9749;</div>
          <div class="smp-post-imgs"><img src="couple-3.jpg" alt="合照" onclick="ch1OpenPhoto('couple-3.jpg')"></div>
          <div class="smp-post-meta">昨天</div>
          <div class="smp-post-actions"><span>&#9825; 18</span></div>
        </div>
        <div class="smp-post smp-warn">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('wang-li.jpg')"></div><div class="smp-post-name">王丽</div></div>
          <div class="smp-post-text">最近有人利用AI伪造照片进行诈骗，请大家提高警惕。如果你身边有人网恋对象"太完美"，请多留心。</div>
          <div class="smp-post-meta">3天前</div>
          <div class="smp-post-actions"><span>&#9825; 5</span></div>
          <div class="smp-post-cmts"><b>苏然</b>：？你在内涵谁</div>
        </div>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- 照片放大浮层 -->
<div class="smp-photo-view" id="ch1-photo-view">
  <div class="smp-photo-bar"><button class="smp-back light" onclick="ch1PhotoClose()">&#8249;</button><span>查看照片</span></div>
  <div class="smp-photo-stage">
    <img id="ch1-photo-img" src="" alt="照片">
    <div class="smp-photo-anno" id="ch1-photo-anno"><div class="smp-anno-ring"></div><div class="smp-anno-label">左手 · 六指</div></div>
  </div>
  <div class="smp-photo-cap" id="ch1-photo-cap">点按"放大"，仔细看看这只手……</div>
  <div class="smp-photo-tools">
    <button class="smp-photo-btn zoom" id="ch1-photo-zoom" onclick="ch1PhotoZoom()">&#128269; 放大查看细节</button>
    <button class="smp-photo-btn go" id="ch1-photo-proceed" style="display:none" onclick="ch1PhotoProceed()">这只手……不对 &#9654;</button>
  </div>
</div>
`;
}

/* ============================================================
   第二章 · 屏幕 HTML
   ============================================================ */
function ch2ScreensHTML() {
    return `
<!-- ====== ch2-diary-intro ====== -->
<section class="screen sm-screen smp-cinema" id="ch2-diary-intro">
  <div class="smp-cine-bg"></div>
  <div class="smp-cine-inner">
    <div class="smp-cine-tag">CHAPTER 02 · 滤镜</div>
    <div class="smp-cine-h">她精心修饰的生活之下，<br>每一张照片都在说谎。</div>
    <div class="smp-cine-p">苏然的<b>备忘录</b>里藏着她的日记。那些没说出口的话、那些被删掉的解释、那些深夜里的自我怀疑——都被她写在了这里。翻开它，你会看到一个女孩，是如何一步步被困住的。</div>
    <button class="smp-btn primary" onclick="showScreen('ch2-diary-list')">翻开日记 &#9654;</button>
  </div>
</section>

<!-- ====== ch2-diary-list ====== -->
<section class="screen sm-screen" id="ch2-diary-list">
  <div class="smp-phone smp-notes">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch2-diary-intro')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">备忘录</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-notes-head" style="margin-top:6px"><div class="smp-notes-title">苏然的日记</div><div class="smp-notes-count">已读 <b id="ch2-diary-read-count">0</b> / 5</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-0" onclick="ch2OpenEntry(0)"><div class="smp-diary-mood-big">😊</div><div class="smp-diary-meta"><div class="smp-diary-date">6月12日</div><div class="smp-diary-t">他是完美的</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-1" onclick="ch2OpenEntry(1)"><div class="smp-diary-mood-big">😕</div><div class="smp-diary-meta"><div class="smp-diary-date">7月3日</div><div class="smp-diary-t">有点不对</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-2" onclick="ch2OpenEntry(2)"><div class="smp-diary-mood-big">🤔</div><div class="smp-diary-meta"><div class="smp-diary-date">7月20日</div><div class="smp-diary-t">他在帮我</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-3" onclick="ch2OpenEntry(3)"><div class="smp-diary-mood-big">😔</div><div class="smp-diary-meta"><div class="smp-diary-date">8月5日</div><div class="smp-diary-t">我好累</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-4" onclick="ch2OpenEntry(4)"><div class="smp-diary-mood-big">😢</div><div class="smp-diary-meta"><div class="smp-diary-date">8月15日</div><div class="smp-diary-t">不能让妈妈知道</div></div><div class="smp-diary-chev">&#8250;</div></div>

      <div class="smp-ch2-hub">
        <div class="smp-ch2-hub-t">&#128270; 手机里还有未读线索</div>
        <button class="smp-ch2-hub-btn" id="ch2-hub-news" onclick="showScreen('ch2-news')"><span class="ico">&#128240;</span><span>浏览器 · 一条新闻</span><span class="tag" id="ch2-hub-news-tag">未读</span></button>
        <button class="smp-ch2-hub-btn" id="ch2-hub-voice" onclick="showScreen('ch2-voice-analysis')"><span class="ico">&#128266;</span><span>微信 · 一条语音</span><span class="tag" id="ch2-hub-voice-tag">未分析</span></button>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch2-diary-detail ====== -->
<section class="screen sm-screen" id="ch2-diary-detail">
  <div class="smp-phone smp-diary-detail">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch2-diary-list')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111" id="ch2-diary-detail-date">日记</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view" id="ch2-diary-detail-body"></div>
    <div class="smp-dd-foot">
      <button class="smp-btn ghost" onclick="showScreen('ch2-diary-list')">返回列表</button>
      <button class="smp-btn primary" id="ch2-diary-next" onclick="ch2DiaryNext()">下一篇 &#8250;</button>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch2-news ====== -->
<section class="screen sm-screen" id="ch2-news">
  <div class="smp-phone smp-browser">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch2-diary-list')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">浏览器</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-url-bar"><span class="smp-url-lock">&#128274;</span><span>weihai-news.cn/ai-fraud-0922</span></div>
    <div class="smp-view">
      <div class="smp-news-art">
        <div class="smp-news-src">蔚海日报 · 社会</div>
        <h1 class="smp-news-h1">警方破获利用AI伪造身份实施情感诈骗犯罪团伙</h1>
        <img class="smp-news-img" src="news-1.jpg" alt="新闻配图">
        <div class="smp-news-body">
          <p>本报讯（记者 林晓）近日，我市警方成功打掉一个利用人工智能技术伪造身份、实施"杀猪盘"式情感诈骗的犯罪团伙，抓获主要嫌疑人 7 名，涉案金额逾 <b>800 万元</b>。</p>
          <p>据办案民警介绍，该团伙通过 AI 换脸与图像生成技术，批量制造"高颜值"虚假人设，并在社交平台上与受害者建立恋爱关系。嫌疑人使用 <b>AI 生成的情侣合照</b>、伪造的日常语音消息，甚至合成视频通话画面，使受害者深信对方真实存在。</p>
          <p>在获取信任后，嫌疑人以"共同理财""紧急周转"等理由诱导受害者转账，并要求受害者"不要告诉家人朋友"，随后切断联系。警方提示：网恋对象若长期拒绝线下见面、频繁索要钱财或要求"不要告诉家人朋友"，应高度警惕。</p>
        </div>
      </div>
      <div class="smp-news-cmts">
        <div class="smp-news-cmts-t">评论 (128)</div>
        <div class="smp-news-cmt hl"><b>网友 A：</b>这种骗局越来越多，我朋友就被骗了 20 万，那个"男朋友"连照片都是 AI 生成的。</div>
        <div class="smp-news-cmt"><b>网友 B：</b>太可怕了，连语音都能伪造，以后还能信谁。</div>
        <div class="smp-news-cmt"><b>网友 C：</b>提醒身边单身的朋友，别被"太完美"的人骗了。</div>
      </div>
    </div>
    <div class="smp-news-foot"><button class="smp-btn primary" id="ch2-news-confirm" onclick="ch2NewsConfirm()">这条新闻印证了……</button></div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch2-voice-analysis ====== -->
<section class="screen sm-screen" id="ch2-voice-analysis">
  <div class="smp-phone smp-va">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch2-diary-list')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">语音 · 林晨</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-va-msg">
        <div class="smp-va-ico">&#128266;</div>
        <div class="smp-va-bar" id="ch2-va-miniwave"></div>
        <div class="smp-va-dur">15"</div>
      </div>
      <div class="smp-va-meta">来源：林晨发送的语音消息 · 15 秒<br>这是第一章聊天记录中那条"你信我还是信外人"的语音。<b>对它进行频谱分析</b>，看看这段声音是不是真人发出的。</div>
      <button class="smp-btn primary block" id="ch2-voice-analyze" onclick="ch2VoiceAnalyze()">&#9654; 频谱分析</button>
      <div class="smp-va-result" id="ch2-voice-result">
        <div class="smp-va-wave" id="ch2-va-wave"></div>
        <div class="smp-va-verdict">&#9888; 频谱检测到<b>非人类声纹特征</b>：基频曲线过于平稳，缺少自然的呼吸停顿与微抖动，谐波能量分布呈合成语音典型形态——该语音疑似 <b>AI 合成</b>。</div>
      </div>
    </div>
    <div class="smp-va-foot"><button class="smp-btn primary" id="ch2-voice-confirm" style="display:none" onclick="ch2VoiceConfirm()">记录这条线索</button></div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- 第三章占位（仅在 loadChapter3 缺失时显示） -->
<section class="screen sm-screen smp-cinema" id="ch3-placeholder">
  <div class="smp-cine-bg"></div>
  <div class="smp-cine-inner">
    <div class="smp-cine-tag">TO BE CONTINUED</div>
    <div class="smp-cine-h">第三章 · 即将开启</div>
    <div class="smp-cine-p">所有碎片，正在拼出一个人的消失。<br>（第三章内容加载中……）</div>
  </div>
</section>
`;
}

/* ============================================================
   载入章节一
   ============================================================ */
function loadChapter1() {
    if (document.getElementById('ch1-lock-screen')) {
        smGoChapter(1, '失联', '她叫苏然。三天前，她消失了。留下的，只有这部还在震动的手机。', function () { showScreen('ch1-lock-screen'); });
        return;
    }
    state.currentChapter = 1;

    var container = document.getElementById('game-screens');
    container.innerHTML += smStyleHTML() + ch1SectionsHTML();

    ch1TickLock();
    if (window._ch1LockTimer) clearInterval(window._ch1LockTimer);
    window._ch1LockTimer = setInterval(ch1TickLock, 20000);

    smGoChapter(1, '失联', '她叫苏然。三天前，她消失了。留下的，只有这部还在震动的手机。', function () {
        showScreen('ch1-lock-screen');
    });
}

/* ---------- 锁屏时钟 ---------- */
function ch1TickLock() {
    var d = new Date();
    var t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    var a = document.getElementById('ch1-lock-time');
    var b = document.getElementById('ch1-lock-bar-time');
    if (a) a.textContent = t;
    if (b) b.textContent = t;
}

/* ---------- 锁屏线索：查看 ---------- */
function ch1Examine(what) {
    if (what === 'wp') findClue('ch1-lock-wallpaper', '锁屏壁纸', '壁纸配文："闺蜜三人行 · 去年拍"——苏然与两位闺蜜的合影。');
    else if (what === 'date') findClue('ch1-lock-date', '锁屏日期', '手机日期显示为 10月3日。');
    else if (what === 'sticky') findClue('ch1-lock-sticky', '锁屏便签', '便签写着："密码是我生日，别再忘了！"——密码与苏然的生日有关。');
}

/* ---------- 锁屏密码 ---------- */
function ch1LockKey(k) {
    var dots = document.getElementById('ch1-lock-dots');
    var hint = document.getElementById('ch1-lock-hint');
    var view = document.querySelector('#ch1-lock-screen .smp-view');
    if (!dots || !hint) return;
    if (k === 'del') {
        ch1LockInput = ch1LockInput.slice(0, -1);
        hint.className = 'smp-lock-hint';
        hint.textContent = '请输入锁屏密码';
    } else if (ch1LockInput.length < 4) {
        ch1LockInput += k;
    }
    var ds = dots.querySelectorAll('span');
    for (var i = 0; i < ds.length; i++) ds[i].classList.toggle('filled', i < ch1LockInput.length);
    if (ch1LockInput.length === 4) {
        if (ch1LockInput === '1003') {
            hint.className = 'smp-lock-hint ok';
            hint.textContent = '解锁成功';
            findClue('ch1-unlocked', '成功解锁手机', '密码为苏然的生日 1003（10月3日）。手机里，藏着她与"林晨"的全部聊天记录。');
            setTimeout(function () { showScreen('ch1-home-screen'); }, 700);
        } else {
            hint.className = 'smp-lock-hint err';
            hint.textContent = '密码错误，再想想';
            if (view) { view.classList.add('smp-shake'); setTimeout(function () { view.classList.remove('smp-shake'); }, 460); }
            setTimeout(function () {
                ch1LockInput = '';
                for (var j = 0; j < ds.length; j++) ds[j].classList.remove('filled');
                hint.className = 'smp-lock-hint';
                hint.textContent = '请输入锁屏密码';
            }, 900);
        }
    }
}

/* ---------- 主屏 App ---------- */
function ch1OpenApp(app) {
    if (app === 'wechat') showScreen('ch1-wechat');
    else if (app === 'moments') showScreen('ch1-moments');
    else smToast('这里暂时没有新线索');
}

/* ---------- 微信分段推进 ---------- */
function ch1WechatNext() {
    var body = document.getElementById('ch1-wechat-body');
    var btn = document.getElementById('ch1-wechat-next');
    if (!body || !btn) return;
    if (ch1WechatStep === 1) {
        body.insertAdjacentHTML('beforeend', ch1Batch2);
        ch1ScrollChat();
        ch1WechatStep = 2;
        btn.textContent = '继续';
    } else if (ch1WechatStep === 2) {
        body.insertAdjacentHTML('beforeend', ch1Batch3);
        ch1ScrollChat();
        ch1WechatStep = 3;
        btn.textContent = '查看线索';
    } else if (ch1WechatStep === 3) {
        findClue('ch1-wechat-control', '聊天记录中的控制模式', '甜言蜜语之后是逐步隔离：红包示好 → 挑拨同事、伪造截图 → 索要密码、要求保密、转走存款。每颗糖都拴着一根线。');
        body.insertAdjacentHTML('beforeend',
            '<div class="smp-reflect">翻完这些对话，你后背发凉。<br>从第一句"宝宝早安"到那句"别告诉家里人"，不过隔了几天。<br>他送来的每一颗糖，都拴着一根线。</div>');
        ch1ScrollChat();
        ch1WechatStep = 4;
        btn.textContent = '返回桌面';
    } else if (ch1WechatStep === 4) {
        showScreen('ch1-home-screen');
    }
}
function ch1ScrollChat() {
    var body = document.getElementById('ch1-wechat-body');
    if (body) body.scrollTop = body.scrollHeight;
}

/* ---------- 朋友圈照片放大 ---------- */
function ch1OpenPhoto(src) {
    var view = document.getElementById('ch1-photo-view');
    var img = document.getElementById('ch1-photo-img');
    var anno = document.getElementById('ch1-photo-anno');
    var cap = document.getElementById('ch1-photo-cap');
    var zoom = document.getElementById('ch1-photo-zoom');
    var go = document.getElementById('ch1-photo-proceed');
    if (!view) return;
    img.src = src;
    img.classList.remove('zoomed');
    anno.classList.remove('show');
    zoom.style.display = '';
    go.style.display = 'none';
    cap.className = 'smp-photo-cap';
    cap.textContent = '点按"放大"，仔细看看这只手……';
    view.classList.add('show');
}
function ch1PhotoZoom() {
    var img = document.getElementById('ch1-photo-img');
    var anno = document.getElementById('ch1-photo-anno');
    var cap = document.getElementById('ch1-photo-cap');
    var zoom = document.getElementById('ch1-photo-zoom');
    var go = document.getElementById('ch1-photo-proceed');
    img.classList.add('zoomed');
    anno.classList.add('show');
    cap.className = 'smp-photo-cap danger';
    cap.innerHTML = '&#9888; 放大后林晨的<b>左手有六根手指</b>——这是 AI 生成图像的典型破绽。';
    zoom.style.display = 'none';
    go.style.display = '';
    if (!smHasClue('ch1-photo-ai')) {
        findClue('ch1-photo-ai', '照片中的 AI 破绽', '放大情侣合照后发现：林晨的左手有六根手指——AI 生成图像的典型痕迹。这些"合照"很可能是 AI 合成的。');
    }
}
function ch1PhotoClose() {
    var view = document.getElementById('ch1-photo-view');
    if (view) view.classList.remove('show');
}
function ch1PhotoProceed() {
    if (typeof window.loadChapter2 === 'function') window.loadChapter2();
    else smGoChapter(2, '滤镜', '完美的滤镜之下，藏着她不敢说出口的话。', function () { showScreen('ch2-diary-intro'); });
}

/* ============================================================
   载入章节二
   ============================================================ */
function loadChapter2() {
    state.currentChapter = 2;
    if (!document.getElementById('ch2-diary-intro')) {
        var container = document.getElementById('game-screens');
        var html = '';
        if (!document.getElementById('sm-ch12-style')) html += smStyleHTML();
        html += ch2ScreensHTML();
        container.innerHTML += html;
    }
    ch2RenderMiniWave();
    smGoChapter(2, '滤镜', '她精心修饰的生活之下，每一张照片都在说谎。', function () {
        showScreen('ch2-diary-intro');
    });
}

/* ---------- 日记：打开条目 ---------- */
function ch2OpenEntry(i) {
    var e = ch2DiaryData[i];
    if (!e) return;
    ch2CurrentEntry = i;
    var body = document.getElementById('ch2-diary-detail-body');
    if (body) {
        body.innerHTML =
            '<div class="smp-dd-head"><span class="smp-dd-date">' + e.date + '</span><span class="smp-dd-mood">' + e.mood + '</span></div>' +
            '<div class="smp-dd-title">' + e.title + '</div>' +
            '<div class="smp-dd-text">' + e.text + '</div>' +
            '<div class="smp-dd-pattern"><b>操控模式 · </b>' + e.pattern + '</div>';
    }
    var dateEl = document.getElementById('ch2-diary-detail-date');
    if (dateEl) dateEl.textContent = e.date;
    var next = document.getElementById('ch2-diary-next');
    if (next) next.textContent = (i < ch2DiaryData.length - 1) ? '下一篇 ›' : '返回列表';

    if (!ch2ReadEntries.has(i)) {
        ch2ReadEntries.add(i);
        var item = document.getElementById('ch2-diary-item-' + i);
        if (item) item.classList.add('read');
        var cnt = document.getElementById('ch2-diary-read-count');
        if (cnt) cnt.textContent = ch2ReadEntries.size;
    }

    showScreen('ch2-diary-detail');

    if (ch2ReadEntries.size === ch2DiaryData.length && !smHasClue('ch2-diary-pattern')) {
        setTimeout(function () {
            findClue('ch2-diary-pattern', '日记中的情感操控轨迹', '五篇日记完整呈现"爱情轰炸 → 挑拨孤立 → 经济控制 → 认知失调 → 彻底隔离"的操控链。苏然不是没有察觉，她只是太想相信。');
            ch2CheckComplete();
        }, 400);
    }
}
function ch2DiaryNext() {
    if (ch2CurrentEntry < ch2DiaryData.length - 1) ch2OpenEntry(ch2CurrentEntry + 1);
    else showScreen('ch2-diary-list');
}

/* ---------- 新闻：确认 ---------- */
function ch2NewsConfirm() {
    findClue('ch2-news-confirm', '新闻印证诈骗模式', '警方通报：犯罪团伙利用 AI 生成虚假人设、合照与语音实施情感诈骗，并要求受害者"不要告诉家人"。网友评论："那个男朋友连照片都是 AI 生成的。"与苏然的遭遇完全吻合。');
    var btn = document.getElementById('ch2-news-confirm');
    if (btn) { btn.textContent = '已记录'; btn.disabled = true; }
    var hub = document.getElementById('ch2-hub-news');
    var tag = document.getElementById('ch2-hub-news-tag');
    if (hub) hub.classList.add('done');
    if (tag) tag.textContent = '已确认';
    smToast('线索已记录：新闻印证了苏然的遭遇');
    ch2CheckComplete();
}

/* ---------- 语音：分析 ---------- */
function ch2VoiceAnalyze() {
    var res = document.getElementById('ch2-voice-result');
    var wave = document.getElementById('ch2-va-wave');
    var btn = document.getElementById('ch2-voice-analyze');
    var confirm = document.getElementById('ch2-voice-confirm');
    if (!res || !wave) return;
    var html = '';
    for (var i = 0; i < 64; i++) {
        var h = 12 + Math.round(Math.abs(Math.sin(i * 0.45)) * 70) + (i % 4 === 0 ? 14 : 0);
        html += '<i style="height:' + Math.min(h, 96) + '%;animation-delay:' + (i % 8) * 0.08 + 's"></i>';
    }
    wave.innerHTML = html;
    res.classList.add('show');
    if (btn) btn.style.display = 'none';
    if (confirm) confirm.style.display = '';
}
function ch2VoiceConfirm() {
    findClue('ch2-voice-synth', '语音频谱异常', '频谱分析显示林晨的语音缺少人类自然声纹特征（基频过稳、无呼吸抖动、谐波异常），疑似 AI 合成。他的声音，和那些照片一样，是假的。');
    var confirm = document.getElementById('ch2-voice-confirm');
    if (confirm) { confirm.textContent = '已记录'; confirm.disabled = true; }
    var hub = document.getElementById('ch2-hub-voice');
    var tag = document.getElementById('ch2-hub-voice-tag');
    if (hub) hub.classList.add('done');
    if (tag) tag.textContent = '已分析';
    smToast('线索已记录：林晨的声音是合成的');
    ch2CheckComplete();
}
function ch2RenderMiniWave() {
    var bar = document.getElementById('ch2-va-miniwave');
    if (!bar) return;
    var heights = [6, 12, 8, 16, 10, 18, 7, 14, 9, 20, 11, 15, 8, 12, 6, 10];
    var html = '';
    for (var i = 0; i < heights.length; i++) html += '<i style="height:' + heights[i] + 'px"></i>';
    bar.innerHTML = html;
}

/* ---------- 第二章完成检测 ---------- */
function ch2CheckComplete() {
    var need = ['ch2-diary-pattern', 'ch2-news-confirm', 'ch2-voice-synth'];
    for (var i = 0; i < need.length; i++) { if (!smHasClue(need[i])) return; }
    setTimeout(function () {
        if (typeof window.loadChapter3 === 'function') window.loadChapter3();
        else smGoChapter(3, '裂痕', '完美的镜面，开始出现第一道裂纹。', function () { showScreen('ch3-placeholder'); });
    }, 800);
}

/* ---------- 对外暴露 ---------- */
window.loadChapter1 = loadChapter1;
window.loadChapter2 = loadChapter2;
