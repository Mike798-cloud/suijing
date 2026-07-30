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

/* ---------- 动态壁纸：按章节切换锁屏 / 桌面背景 ---------- */
var smWallpapers = {
    1: 'wallpaper-ch1.jpg',
    2: 'wallpaper-ch2.jpg',
    3: 'wallpaper-ch3.jpg',
    4: 'wallpaper-ch4.jpg'
};
function smSetWallpaper(chapter) {
    var wp = smWallpapers[chapter] || smWallpapers[1];
    window.smCurrentWallpaper = chapter;
    /* 锁屏壁纸 */
    var locks = document.querySelectorAll('.smp-lock');
    for (var i = 0; i < locks.length; i++) {
        locks[i].style.backgroundImage = "url('" + wp + "')";
    }
    /* 桌面壁纸（叠加暗色渐变保证图标可读） */
    var homes = document.querySelectorAll('.smp-home');
    for (var j = 0; j < homes.length; j++) {
        homes[j].style.backgroundImage = "linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,.62)), url('" + wp + "')";
        homes[j].style.backgroundSize = 'cover';
        homes[j].style.backgroundPosition = 'center center';
    }
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
        '</div></div></div></div>' +
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

var ch1Batch4 =
    '<div class="smp-msg-time">今天 21:42</div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">你朋友圈那张跟王丽的合照删了吧，看着碍眼，我不想让别人觉得我女朋友跟那种人来往</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">哦……好吧，我这就删</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">乖。对了，给你看个东西，这是我刚跟你视频通话截的图</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-shot">' +
        '<div class="smp-shot"><div class="smp-shot-cap">视频通话 · 21:38</div>' +
        '<div class="smp-shot-msgs">' +
        '<div class="smp-shot-m l2">宝宝想我了吗</div>' +
        '<div class="smp-shot-m r2">想……可是这画面好像有点怪怪的</div>' +
        '<div class="smp-shot-m l2">网络不好而已，别多想</div>' +
        '</div></div></div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">刚才视频里你的脸好像闪了一下，边缘有点糊，是信号不好吗？</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">你这人就是爱瞎想，我这边信号是不好。下周我一定去见你</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">你上次也说下周，都好几个下周了……</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">项目临时出问题走不开，我也是为了我们的未来在拼命。你是不是不信任我了？我这么爱你</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">不是的，我信你……对不起，是我太想见你了</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">那为了表示你的信任，把你剩下的存款都转到我们那个共同账户里吧，我帮你一起打理，年底连本带利还你</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">可是那是我全部的积蓄了……</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">咱俩都到这份上了还分你我？你不转就是心里没我</div></div>' +
    '<div class="smp-msg left smp-msg-deleted"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-deleted"><span class="smp-del-ico">&#9888;</span> 该消息已被发送者删除</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">……好，我转。你别生气，我都听你的</div></div>';

var ch1Batch5 =
    '<div class="smp-msg-time">今天 23:15</div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">宝宝，今天是不是跟同事聊天提到我了？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">啊……就是午饭的时候王丽问了我一句最近怎么样，我说挺好的</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">我不是让你别跟她来往了吗？你是不是不听我的话了？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">没有没有，她主动来找我的，我没办法……以后我躲着她</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">你要是真爱我，就不会让我担心。每次你跟别人走得太近，我都会睡不着觉。你知道我为了你有多累吗？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">对不起……我不知道你会这么难过，我以后注意</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">还有件事，你妈给你打的电话我看到了。你要是告诉她我们的事，她肯定会拆散我们。你不想失去我吧？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">不想……我不告诉她，我谁都不说</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">乖。把你的手机定位关了吧，我不喜欢你到处乱跑。你就乖乖待在家里等我，好不好？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">好……</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">对了，你那个支付宝花呗还有额度吗？帮我套现一下，下个月还你。我们共同账户的事，你转了吗？</div></div>' +
    '<div class="smp-msg right"><div class="smp-avatar" style="background-image:url(\'su-ran.jpg\')"></div><div class="smp-bubble">已经转了……花呗只剩三千多了，我明天借一下</div></div>' +
    '<div class="smp-msg left"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble">嗯，尽快。宝宝晚安&#128156; 记住，这个世界上只有我是真的对你好。别人都不怀好意。</div></div>' +
    '<div class="smp-msg left smp-msg-deleted"><div class="smp-avatar" style="background-image:url(\'lin-chen.jpg\')"></div><div class="smp-bubble smp-bubble-deleted"><span class="smp-del-ico">&#9888;</span> 该消息已被发送者删除</div></div>' +
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
      pattern: '彻底隔离：切断与家人联系，受害者开始丧失自我认同——"我还是不是我自己"。' },
    { date: '9月1日', title: '我决定了', mood: '😰',
      text: '今天我做了个决定。我开始偷偷把和林晨的聊天记录全部截图备份，存到一个他不知道的云盘里。他说过的话太多对不上了，生日、属相、公司地址……我不敢直接问他，怕他又生气。我只把备份链接发给了周梅，告诉她如果出事就交给警察。手在抖，但我必须这么做。',
      pattern: '自救尝试 · 留存证据：受害者在恐惧中开始备份证据、托付信任之人，这是操控关系中最后的理性闪光。' },
    { date: '9月20日', title: '最后的日记', mood: '🥺',
      text: '他今天问我是不是把聊天记录备份了。我不知道他怎么知道的。他说了句"你不乖"，然后就挂了。我把所有的截图、密码、那个云盘链接，都写在了一张纸条上，夹在了妈妈送我的那本相册里。如果我不在了，希望有人能找到它。镜子里的人我不认识了，可我不想让另一个女孩，再照同一面镜子。',
      pattern: '终局 · 灭迹前的预警：受害者预感到危险逼近，将证据藏匿于私密之处——这是她留给世界的最后一封信。' },
    { date: '10月1日', title: '我要去见他', mood: '😰',
      text: '林晨说国庆带我去见他父母。我问他地址，他发了一个定位，在城郊一个我不认识的地方。按理说我应该开心，终于能见面了。可是我的心一直跳，跳得我喘不上气。我把定位截图偷偷发给了周梅，告诉她如果我三天没消息就报警。我穿了他喜欢的白裙子，化了淡妆。镜子里的我笑着，可眼睛是空的。',
      pattern: '飞蛾扑火 · 最后的赴约：受害者明知可能是陷阱仍选择前往——不是愚蠢，是被操控到丧失逃生本能。她把最后的希望寄托在那条求救短信上。' },
    { date: '10月3日', title: '如果你能看到这些', mood: '🥺',
      text: '今天是最后一天。手机电量还剩12%，我不知道还能撑多久。他们收了我的充电器，但没发现我有备用电池。如果你正在看这条日记，请帮我做三件事：第一，密码1003，云盘里有全部证据；第二，告诉妈妈，她的女儿不是傻，只是太想被爱了；第三，找到那个叫周梅的女人，她也是被困住的，她有个女儿叫小鱼。我不恨她，我恨的是那个把我们所有人都推进深渊的人。镜子碎了，但碎片也能割伤人。别让他们继续害人。',
      pattern: '终章 · 最后的遗言：受害者在生命最后时刻仍为他人着想——她要的不是复仇，是保护下一个女孩不再走进同一面镜子。' },
    { date: '7月15日', title: '他送的礼物', mood: '😊',
      text: '今天收到林晨寄来的礼物，一条项链，他说是什么限量款。还说以后每个月都给我寄惊喜。我拍了照发朋友圈，闺蜜都说羡慕。可王丽私信说我确定这是真的吗，我没回她。林晨对我这么好，怎么会是假的？她就是嫉妒。不过……项链上的品牌logo拼错了一个字母，可能是高仿吧。算了，心意到了就行。',
      pattern: '情感投资 · 物质锚定：用小礼物建立"他很大方"的印象，同时测试受害者的观察力和质疑能力——当她选择忽略破绽时，操控就加深了一层。' },
    { date: '8月28日', title: '深夜求助', mood: '😰',
      text: '凌晨两点给林晨发消息说我睡不着，很害怕。他回了一句别矫情，谁不累，就下线了。我盯着屏幕哭了很久。以前他会陪我聊到天亮，现在连一句安慰都吝啬。可我不敢生气，怕他离开我。我已经没有朋友了，妈妈也被我疏远了，他是我在这个世界上唯一的联系。如果他也不要我了，我该怎么办？',
      pattern: '情感撤回 · 深度依赖：当受害者完全孤立后，施害者开始撤回情感投入，让受害者陷入"失去他就失去一切"的恐惧，进一步强化服从。' }
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

.smp-phone{position:relative;width:min(390px,96vw);height:min(800px,94vh);border-radius:48px;background:#000;border:12px solid #0a0b10;box-shadow:0 0 0 2px #1a1b26,0 0 0 4px #2a2b38,0 30px 70px rgba(0,0,0,.65),0 0 80px rgba(59,130,246,.06);overflow:hidden;display:flex;flex-direction:column;}
.smp-phone::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:126px;height:35px;background:#000;border-radius:0 0 20px 20px;z-index:40;}
.smp-phone::after{content:'';position:absolute;top:11px;left:50%;transform:translateX(-50%);width:100px;height:28px;background:#000;border-radius:18px;z-index:41;display:none;}
.smp-bar{flex:none;height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 24px 0 28px;font-size:14px;font-weight:600;z-index:20;}
.smp-bar.light{color:#1c1c1e;background:#f7f7f7;}
.smp-bar.gray{color:#111;background:#ededed;}
.smp-bar.dark{color:#fff;}
.smp-bar .smp-bar-r{display:flex;align-items:center;gap:6px;}
.smp-view{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;position:relative;}
.smp-home-bar{flex:none;height:22px;display:flex;align-items:center;justify-content:center;}
.smp-home-bar::after{content:'';width:130px;height:5px;border-radius:3px;background:rgba(120,120,128,.5);}
.smp-home-bar.dark::after{background:rgba(255,255,255,.6);}

/* 锁屏（默认 ch1 壁纸，smSetWallpaper() 会按章节动态切换） */
.smp-lock{background:url('wallpaper-ch1.jpg') center/cover no-repeat #000;}
.smp-lock::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.05) 45%,rgba(0,0,0,.62) 100%);pointer-events:none;}
.smp-lock .smp-view{display:flex;flex-direction:column;align-items:center;padding:clamp(30px,8vh,70px) 18px 10px;text-align:center;}
.smp-lock-time{font-size:clamp(40px,12vw,64px);font-weight:200;color:#fff;line-height:1;text-shadow:0 2px 18px rgba(0,0,0,.4);}
.smp-lock-date{font-size:14px;color:rgba(255,255,255,.9);margin-top:6px;text-shadow:0 1px 8px rgba(0,0,0,.4);cursor:pointer;}
.smp-lock-wp-cap{margin-top:18px;font-size:12px;color:rgba(255,255,255,.85);background:rgba(0,0,0,.28);padding:5px 12px;border-radius:20px;backdrop-filter:blur(6px);cursor:pointer;}
.smp-lock-sticky{margin-top:clamp(12px,3vh,26px);max-width:min(260px,70vw);background:#fff7d6;color:#5a4a1a;font-size:13px;line-height:1.6;padding:12px 14px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.4);transform:rotate(-2deg);font-family:'Ma Shan Zheng','Noto Serif SC',cursive;cursor:pointer;}
.smp-lock-sticky b{color:#b8860b;}
.smp-lock-dots{display:flex;gap:18px;margin:clamp(12px,3vh,30px) 0 8px;}
.smp-lock-dots span{width:13px;height:13px;border-radius:50%;border:2px solid rgba(255,255,255,.85);transition:.15s;}
.smp-lock-dots span.filled{background:#fff;}
.smp-lock-hint{font-size:12px;color:rgba(255,255,255,.8);height:18px;}
.smp-lock-hint.err{color:#ff6b6b;}
.smp-lock-hint.ok{color:#7ee787;}
.smp-keypad{margin-top:auto;display:grid;grid-template-columns:repeat(3,clamp(52px,18vw,68px));gap:clamp(8px,3vw,14px);justify-content:center;padding-bottom:6px;}
.smp-key{width:clamp(52px,18vw,68px);height:clamp(52px,18vw,68px);border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:clamp(18px,6vw,24px);font-weight:500;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.12);transition:.12s;}
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
.smp-bubble{position:relative;padding:8px 11px;border-radius:8px;font-size:14px;line-height:1.55;max-width:260px;min-width:60px;word-break:break-word;flex-shrink:0;}
.smp-msg.left .smp-bubble{background:#fff;color:#111;}
.smp-msg.right .smp-bubble{background:#95ec69;color:#111;}
.smp-msg.left .smp-bubble::before{content:'';position:absolute;left:-5px;top:11px;border:6px solid transparent;border-right-color:#fff;}
.smp-msg.right .smp-bubble::before{content:'';position:absolute;right:-5px;top:11px;border:6px solid transparent;border-left-color:#95ec69;}
.smp-bubble img{width:170px;border-radius:6px;display:block;}
.smp-bubble-shot{padding:0;overflow:hidden;background:#fff;flex-shrink:0;width:200px;}
.smp-bubble-shot::before{display:none;}
.smp-shot{width:200px;}
.smp-shot-cap{font-size:11px;color:#888;padding:8px 10px 4px;border-bottom:1px solid #f0f0f0;}
.smp-shot-msgs{padding:8px 10px;display:flex;flex-direction:column;gap:6px;}
.smp-shot-m{font-size:12.5px;padding:6px 9px;border-radius:7px;max-width:85%;}
.smp-shot-m.l2{background:#fff;color:#333;align-self:flex-start;border:1px solid #eee;}
.smp-shot-m.r2{background:#95ec69;color:#111;align-self:flex-end;}
.smp-bubble-redpacket{padding:0;display:flex;background:#fa9d3b;color:#fff;flex-shrink:0;}
.smp-bubble-redpacket::before{border-right-color:#fa9d3b;}
.smp-rp-ico{width:44px;display:flex;align-items:center;justify-content:center;font-size:24px;background:rgba(0,0,0,.12);}
.smp-rp-txt{padding:8px 12px;}
.smp-rp-title{display:block;font-size:12px;opacity:.9;}
.smp-rp-amount{display:block;font-size:15px;font-weight:600;}
.smp-rp-desc{display:block;font-size:11px;opacity:.85;margin-top:2px;}
.smp-bubble-transfer{padding:0;display:flex;background:#fa9d3b;color:#fff;flex-shrink:0;}
.smp-bubble-transfer::before{border-right-color:#fa9d3b;}
.smp-tr-ico{width:44px;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(0,0,0,.12);}
.smp-tr-txt{padding:8px 12px;}
.smp-tr-title{display:block;font-size:12px;opacity:.9;}
.smp-tr-amount{display:block;font-size:15px;font-weight:600;}
.smp-bubble-voice{display:flex;align-items:center;gap:8px;min-width:120px;flex-shrink:0;}
.smp-bubble-voice::before{display:none;}
.smp-voice-ico{font-size:15px;}
.smp-voice-wave{display:flex;align-items:center;gap:2px;height:16px;}
.smp-voice-wave i{width:3px;background:#111;border-radius:2px;}
.smp-voice-wave i:nth-child(1){height:8px;} .smp-voice-wave i:nth-child(2){height:14px;} .smp-voice-wave i:nth-child(3){height:16px;} .smp-voice-wave i:nth-child(4){height:11px;} .smp-voice-wave i:nth-child(5){height:7px;}
.smp-voice-dur{font-size:12px;color:#666;margin-left:auto;}
.smp-msg-deleted .smp-bubble,.smp-bubble-deleted{background:#f2f2f2;color:#999;font-size:12.5px;display:flex;align-items:center;gap:6px;flex-shrink:0;}
.smp-bubble-deleted::before{display:none;}
.smp-del-ico{color:#bbb;}
.smp-chat-foot{flex:none;padding:10px 12px;background:#f7f7f7;border-top:1px solid #e3e3e3;display:flex;justify-content:center;}
.smp-continue{padding:9px 26px;border-radius:18px;background:#07c160;color:#fff;font-size:14px;border:none;cursor:pointer;}
.smp-continue:active{transform:scale(.97);}
.smp-reflect{align-self:center;margin:8px 0 2px;max-width:88%;font-size:12.5px;color:#888;line-height:1.7;text-align:center;font-style:italic;}

/* 朋友圈 */
.smp-moments .smp-view{background:#fff;}
.smp-moments-cover{height:150px;background:url('su-ran.jpg') center/cover no-repeat #444;position:relative;}
.smp-moments-cover::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.25));pointer-events:none;}
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
.smp-cinema .smp-cine-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,9,14,.7),rgba(8,9,14,.88));pointer-events:none;}
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

/* ====== 动态壁纸（桌面） ====== */
.smp-home{background-size:cover;background-position:center center;}
.smp-home .smp-view{background:transparent;}

/* ====== App 图标 SVG 通用 ====== */
.smp-app-ico svg{display:block;}
.smp-app-ico{box-shadow:0 6px 16px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18);}

/* ====== 音乐 App ====== */
.smp-music-app .smp-view{background:linear-gradient(180deg,#2a2330,#13111a);padding:18px 16px 20px;color:#eee;}
.smp-music-np{display:flex;flex-direction:column;align-items:center;margin-bottom:18px;}
.smp-music-cover{width:200px;height:200px;border-radius:14px;background:url('music-cover.jpg') center/cover #333;box-shadow:0 14px 40px rgba(0,0,0,.55);margin-bottom:16px;}
.smp-music-title{font-size:18px;font-weight:700;color:#fff;}
.smp-music-artist{font-size:13px;color:#ff8fa3;margin-top:3px;}
.smp-music-prog{width:100%;max-width:280px;margin-top:16px;display:flex;align-items:center;gap:8px;}
.smp-music-track{flex:1;height:4px;background:rgba(255,255,255,.18);border-radius:2px;overflow:hidden;}
.smp-music-fill{width:32%;height:100%;background:linear-gradient(90deg,#ff2d55,#ff6482);border-radius:2px;}
.smp-music-fill.playing{animation:smpMusicProg 30s linear infinite;}
@keyframes smpMusicProg{from{width:0}to{width:100%}}
.smp-music-time{font-size:11px;color:#aaa;min-width:34px;text-align:center;}
.smp-music-ctrl{display:flex;align-items:center;gap:26px;margin-top:16px;}
.smp-music-btn{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-family:inherit;}
.smp-music-btn:active{transform:scale(.94);}
.smp-music-btn.main{width:60px;height:60px;background:linear-gradient(135deg,#ff2d55,#ff6482);font-size:22px;}
.smp-music-pl-title{font-size:12px;color:#9a9caa;letter-spacing:.12em;margin:8px 0 6px;}
.smp-music-item{display:flex;align-items:center;gap:12px;padding:11px 8px;border-radius:10px;cursor:pointer;}
.smp-music-item:active{background:rgba(255,255,255,.06);}
.smp-music-item.active{background:rgba(255,45,85,.12);}
.smp-music-item-idx{font-size:13px;color:#666;width:22px;text-align:center;flex:none;}
.smp-music-item.active .smp-music-item-idx{color:#ff6482;}
.smp-music-item-t{font-size:14px;color:#dcdce4;flex:1;}
.smp-music-item.active .smp-music-item-t{color:#fff;}
.smp-music-item-d{font-size:12px;color:#888;flex:none;}

/* ====== 计算器 App ====== */
.smp-calc .smp-view{background:#0a0a0c;padding:14px 12px 18px;display:flex;flex-direction:column;}
.smp-calc-disp{flex:1;min-height:96px;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-end;padding:10px 12px 20px;}
.smp-calc-expr{font-size:15px;color:#888;min-height:20px;word-break:break-all;text-align:right;max-width:100%;}
.smp-calc-res{font-size:46px;font-weight:300;color:#fff;line-height:1.1;word-break:break-all;text-align:right;max-width:100%;}
.smp-calc-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
.smp-ck{height:64px;border-radius:36px;font-size:24px;font-weight:500;border:none;cursor:pointer;color:#fff;font-family:inherit;transition:.1s;}
.smp-ck:active{transform:scale(.95);}
.smp-ck.num{background:#333336;}
.smp-ck.num:active{background:#4a4a4e;}
.smp-ck.fn{background:#a5a5a5;color:#000;}
.smp-ck.fn:active{background:#bdbdbd;}
.smp-ck.op{background:#ff9f0a;font-size:28px;}
.smp-ck.op:active{background:#ffb340;}
.smp-ck.zero{grid-column:span 2;}

/* ====== 浏览器 App（搜索历史） ====== */
.smp-browser-app .smp-view{background:#fff;}
.smp-search-bar{display:flex;align-items:center;gap:8px;margin:12px 14px;background:#f0f0f2;border-radius:12px;padding:9px 12px;font-size:13px;color:#888;}
.smp-hist-title{font-size:12px;color:#8e8e93;padding:10px 16px 6px;letter-spacing:.05em;}
.smp-hist-item{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f2f2f2;cursor:pointer;}
.smp-hist-item:active{background:#f7f7f9;}
.smp-hist-ico{width:22px;height:22px;flex:none;color:#8e8e93;display:flex;align-items:center;justify-content:center;}
.smp-hist-txt{flex:1;font-size:14px;color:#1a1a1a;}
.smp-hist-time{font-size:11px;color:#b0b0b0;flex:none;}

/* ====== 相册 App ====== */
.smp-album .smp-view{background:#fff;padding:14px 6px;}
.smp-album-title{font-size:22px;font-weight:700;color:#111;padding:4px 14px 12px;}
.smp-album-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;}
.smp-album-cell{aspect-ratio:1;background-size:cover;background-position:center;cursor:pointer;border-radius:2px;}
.smp-album-cell:active{opacity:.85;}

/* ====== 备忘录 App ====== */
.smp-notes-app .smp-view{background:#1c1e26;padding:14px 12px 20px;}
.smp-notes-app-head{font-size:22px;font-weight:700;color:#f1efea;padding:4px 4px 12px;}
.smp-note-card{background:#262936;border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;border:1px solid rgba(255,255,255,.05);}
.smp-note-card:active{transform:scale(.99);}
.smp-note-t{font-size:15px;font-weight:600;color:#f1efea;}
.smp-note-date{font-size:11px;color:#8b8d99;margin:2px 0 6px;}
.smp-note-preview{font-size:13px;color:#b9bbc6;line-height:1.6;}
.smp-note-full{display:none;font-size:13.5px;color:#cfd0d8;line-height:1.8;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);white-space:pre-line;}
.smp-note-card.open .smp-note-full{display:block;}
.smp-note-card.open .smp-note-preview{display:none;}

/* ====== 设置 App ====== */
.smp-settings .smp-view{background:#f0f0f2;padding:14px 12px 24px;}
.smp-set-h{font-size:12px;color:#8e8e93;letter-spacing:.05em;padding:6px 6px 6px;text-transform:uppercase;}
.smp-set-group{background:#fff;border-radius:12px;overflow:hidden;margin-bottom:16px;}
.smp-set-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:.5px solid #e8e8ea;font-size:14px;color:#1a1a1a;cursor:pointer;}
.smp-set-item:last-child{border-bottom:none;}
.smp-set-item:active{background:#f7f7f9;}
.smp-set-ico{width:26px;height:26px;border-radius:7px;flex:none;display:flex;align-items:center;justify-content:center;}
.smp-set-label{flex:1;}
.smp-set-val{font-size:13px;color:#8e8e93;}
.smp-set-chev{color:#c7c7cc;font-size:15px;}

/* ====== 电话 App ====== */
.smp-phone-app .smp-view{background:#fff;padding:6px 0 10px;}
.smp-call-item{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f2f2f2;cursor:pointer;}
.smp-call-item:active{background:#f7f7f9;}
.smp-call-av{width:40px;height:40px;border-radius:50%;background-size:cover;background-position:center;background-color:#ddd;flex:none;}
.smp-call-meta{flex:1;min-width:0;}
.smp-call-name{font-size:15px;color:#1a1a1a;}
.smp-call-info{font-size:12px;color:#8e8e93;margin-top:2px;}
.smp-call-type{font-size:12px;flex:none;}
.smp-call-type.miss{color:#ff3b30;}
.smp-call-type.in{color:#34c759;}
.smp-call-type.out{color:#8e8e93;}
.smp-call-type.declined{color:#ff9500;}
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
      <div class="smp-lock-wp-cap" onclick="ch1Examine('wp')">海边落日 · 我们的合影</div>
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
        <button class="smp-app" onclick="ch1OpenApp('wechat')"><span class="smp-app-ico" style="background:#07c160"><svg viewBox="0 0 24 24" width="30" height="30"><path fill="#fff" d="M8.5 4C4.36 4 1 6.69 1 10c0 1.9 1.06 3.59 2.71 4.69L3 18l3.3-1.7c.72.17 1.46.26 2.2.26.32 0 .63-.02.94-.05a4.6 4.6 0 0 1-.19-1.29c0-2.62 2.74-4.74 6.12-4.74.27 0 .53.01.79.04C15.78 7.55 12.45 4 8.5 4z"/><path fill="#fff" d="M23 14.4c0-2.43-2.46-4.4-5.5-4.4S12 11.97 12 14.4s2.46 4.4 5.5 4.4c.62 0 1.21-.07 1.77-.21L22.5 20l-.66-2.04c.76-.74 1.16-1.66 1.16-2.56z"/></svg></span><span class="smp-app-name">微信</span><span class="smp-app-badge">3</span></button>
        <button class="smp-app" onclick="ch1OpenApp('moments')"><span class="smp-app-ico" style="background:linear-gradient(135deg,#ff6b6b,#ffa14a)"><svg viewBox="0 0 24 24" width="28" height="28"><path fill="#fff" d="M9.5 4l-1.2 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.3l-1.2-2h-5z"/><circle cx="12" cy="12.5" r="3.4" fill="#ff5a5f"/><circle cx="12" cy="12.5" r="1.5" fill="#fff"/></svg></span><span class="smp-app-name">朋友圈</span></button>
        <button class="smp-app" onclick="ch1OpenApp('album')"><span class="smp-app-ico" style="background:#fff"><svg viewBox="0 0 24 24" width="30" height="30"><g fill="#ff2d55"><circle cx="12" cy="5.5" r="3"/><circle cx="18.5" cy="12" r="3"/><circle cx="12" cy="18.5" r="3"/><circle cx="5.5" cy="12" r="3"/></g><circle cx="12" cy="12" r="3.4" fill="#ffcc00"/></svg></span><span class="smp-app-name">相册</span></button>
        <button class="smp-app" onclick="ch1OpenApp('notes')"><span class="smp-app-ico" style="background:#ffd60a"><svg viewBox="0 0 24 24" width="26" height="26" fill="#9a6a00"><rect x="4" y="5" width="16" height="2.6" rx="1.3"/><rect x="4" y="10.7" width="16" height="2.6" rx="1.3"/><rect x="4" y="16.4" width="11" height="2.6" rx="1.3"/></svg></span><span class="smp-app-name">备忘录</span></button>
        <button class="smp-app" onclick="ch1OpenApp('browser')"><span class="smp-app-ico" style="background:#1d6fe0"><svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" fill="#fff"/><circle cx="12" cy="12" r="1.2" fill="#1d6fe0"/></svg></span><span class="smp-app-name">浏览器</span></button>
        <button class="smp-app" onclick="ch1OpenApp('calc')"><span class="smp-app-ico" style="background:#3a3a3c"><svg viewBox="0 0 24 24" width="26" height="26"><rect x="5" y="3" width="14" height="18" rx="2.5" fill="#fff"/><rect x="7" y="5.5" width="10" height="3.5" rx="1" fill="#ff9f0a"/><g fill="#3a3a3c"><circle cx="9" cy="13" r="1.25"/><circle cx="12" cy="13" r="1.25"/><circle cx="15" cy="13" r="1.25"/><circle cx="9" cy="17" r="1.25"/><circle cx="12" cy="17" r="1.25"/><circle cx="15" cy="17" r="1.25"/></g></svg></span><span class="smp-app-name">计算器</span></button>
        <button class="smp-app" onclick="ch1OpenApp('music')"><span class="smp-app-ico" style="background:linear-gradient(135deg,#ff2d55,#ff6482)"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 17.6V6l10-2v11.6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="6.6" cy="17.6" r="2.6" fill="#fff"/><circle cx="16.6" cy="15.6" r="2.6" fill="#fff"/></svg></span><span class="smp-app-name">音乐</span></button>
        <button class="smp-app" onclick="ch1OpenApp('settings')"><span class="smp-app-ico" style="background:#8e8e93"><svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M19.4 13a7.5 7.5 0 0 0 .06-2l2-1.5-2-3.4-2.4.9a7.5 7.5 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7.5 7.5 0 0 0-1.7 1l-2.4-.9-2 3.4 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.4-.9a7.5 7.5 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.5 7.5 0 0 0 1.7-1l2.4.9 2-3.4-2-1.5zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg></span><span class="smp-app-name">设置</span></button>
      </div>
      <div class="smp-home-dock">
        <button class="smp-app" onclick="ch1OpenApp('phone')"><span class="smp-app-ico" style="background:#34c759"><svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z"/></svg></span></button>
        <button class="smp-app" onclick="ch1OpenApp('browser')"><span class="smp-app-ico" style="background:#1d6fe0"><svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" fill="#fff"/><circle cx="12" cy="12" r="1.2" fill="#1d6fe0"/></svg></span></button>
        <button class="smp-app" onclick="ch1OpenApp('music')"><span class="smp-app-ico" style="background:linear-gradient(135deg,#ff2d55,#ff6482)"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 17.6V6l10-2v11.6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="6.6" cy="17.6" r="2.6" fill="#fff"/><circle cx="16.6" cy="15.6" r="2.6" fill="#fff"/></svg></span></button>
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
        <div class="smp-post">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">苏然</div></div>
          <div class="smp-post-text">被爱的人包围着，真幸福&#10084;&#65039; 最近总觉得有点累，可能是想太多了吧，没事的</div>
          <div class="smp-post-meta">5小时前</div>
          <div class="smp-post-actions"><span>&#9825; 9</span></div>
        </div>
        <div class="smp-post smp-warn">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">妈妈</div></div>
          <div class="smp-post-text">然然，妈妈打了好多电话你都不接，你到底好不好？无论发生什么，家永远是你的家，妈妈永远等你回来。</div>
          <div class="smp-post-meta">2小时前</div>
          <div class="smp-post-actions"><span>&#9825; 3</span></div>
        </div>
        <div class="smp-post">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">苏然</div></div>
          <div class="smp-post-text">删了一条朋友圈。林晨说不喜欢我发跟别人的合照。其实只是跟同事的年会合影而已……算了，他说得对，他是我最重要的人，我该以他为先</div>
          <div class="smp-post-meta">1小时前</div>
          <div class="smp-post-actions"><span>&#9825; 4</span></div>
          <div class="smp-post-cmts"><b>周梅</b>：亲爱的，你值得被更好地对待，如果有人让你一直删东西、一直道歉，那不是爱哦</div>
        </div>
        <div class="smp-post smp-warn">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">苏然</div></div>
          <div class="smp-post-text">今天是我和林晨认识第97天。他说再等等，等忙完就来看我。我已经不记得上一次自己一个人开心是什么时候了。手机不敢静音，怕错过他的消息。可他回得越来越慢了……是不是我做错了什么？</div>
          <div class="smp-post-meta">30分钟前</div>
          <div class="smp-post-actions"><span>&#9825; 2</span></div>
        </div>
        <div class="smp-post">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('wang-li.jpg')"></div><div class="smp-post-name">周梅</div></div>
          <div class="smp-post-text">然然，我看到你删了那条朋友圈。你不需要为任何人改变自己。真正爱你的人，不会让你一直道歉、一直删东西、一直害怕。如果你需要帮助，随时找我，我在的。</div>
          <div class="smp-post-meta">15分钟前</div>
          <div class="smp-post-actions"><span>&#9825; 7</span></div>
          <div class="smp-post-cmts"><b>苏然</b>：我没事的，你别担心……他就是管我管得严了点</div>
        </div>
        <div class="smp-post smp-warn">
          <div class="smp-post-head"><div class="smp-post-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-post-name">苏然</div></div>
          <div class="smp-post-text">凌晨三点睡不着。翻看了所有聊天记录，发现他从来没有主动问过我'今天开心吗'，只问过'跟谁在一起''在哪''怎么不回消息'。原来关心的方式和控制的方式，长得这么像。</div>
          <div class="smp-post-meta">10分钟前</div>
          <div class="smp-post-actions"><span>&#9825; 1</span></div>
        </div>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-music ====== -->
<section class="screen sm-screen" id="ch1-music">
  <div class="smp-phone smp-music-app">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">音乐</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-music-np">
        <div class="smp-music-cover"></div>
        <div class="smp-music-title" id="ch1-music-title">碎镜</div>
        <div class="smp-music-artist" id="ch1-music-artist">苏然 · 单曲</div>
        <div class="smp-music-prog">
          <span class="smp-music-time" id="ch1-music-cur">1:12</span>
          <div class="smp-music-track"><div class="smp-music-fill" id="ch1-music-bar"></div></div>
          <span class="smp-music-time" id="ch1-music-dur">3:42</span>
        </div>
        <div class="smp-music-ctrl">
          <button class="smp-music-btn" onclick="smToast('上一首')">&#9664;&#9664;</button>
          <button class="smp-music-btn main" id="ch1-music-btn" onclick="ch1MusicToggle()">&#9654;</button>
          <button class="smp-music-btn" onclick="smToast('下一首')">&#9654;&#9654;</button>
        </div>
      </div>
      <div class="smp-music-pl-title">播放列表 · 最近播放</div>
      <div id="ch1-music-list">
        <div class="smp-music-item active" onclick="ch1MusicSelect(0)"><span class="smp-music-item-idx">1</span><span class="smp-music-item-t">碎镜</span><span class="smp-music-item-d">3:42</span></div>
        <div class="smp-music-item" onclick="ch1MusicSelect(1)"><span class="smp-music-item-idx">2</span><span class="smp-music-item-t">孤独的人</span><span class="smp-music-item-d">4:15</span></div>
        <div class="smp-music-item" onclick="ch1MusicSelect(2)"><span class="smp-music-item-idx">3</span><span class="smp-music-item-t">假面</span><span class="smp-music-item-d">3:28</span></div>
        <div class="smp-music-item" onclick="ch1MusicSelect(3)"><span class="smp-music-item-idx">4</span><span class="smp-music-item-t">消失的她</span><span class="smp-music-item-d">4:01</span></div>
        <div class="smp-music-item" onclick="ch1MusicSelect(4)"><span class="smp-music-item-idx">5</span><span class="smp-music-item-t">镜中人</span><span class="smp-music-item-d">3:55</span></div>
        <div class="smp-music-item" onclick="ch1MusicSelect(5)"><span class="smp-music-item-idx">6</span><span class="smp-music-item-t">碎裂</span><span class="smp-music-item-d">4:30</span></div>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-calc ====== -->
<section class="screen sm-screen" id="ch1-calc">
  <div class="smp-phone smp-calc">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">计算器</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-calc-disp">
        <div class="smp-calc-expr" id="ch1-calc-expr"></div>
        <div class="smp-calc-res" id="ch1-calc-disp">0</div>
      </div>
      <div class="smp-calc-keys">
        <button class="smp-ck fn" onclick="ch1CalcKey('C')">C</button>
        <button class="smp-ck fn" onclick="ch1CalcKey('del')">&#9003;</button>
        <button class="smp-ck fn" onclick="ch1CalcKey('%')">%</button>
        <button class="smp-ck op" onclick="ch1CalcKey('÷')">&#247;</button>
        <button class="smp-ck num" onclick="ch1CalcKey('7')">7</button>
        <button class="smp-ck num" onclick="ch1CalcKey('8')">8</button>
        <button class="smp-ck num" onclick="ch1CalcKey('9')">9</button>
        <button class="smp-ck op" onclick="ch1CalcKey('×')">&#215;</button>
        <button class="smp-ck num" onclick="ch1CalcKey('4')">4</button>
        <button class="smp-ck num" onclick="ch1CalcKey('5')">5</button>
        <button class="smp-ck num" onclick="ch1CalcKey('6')">6</button>
        <button class="smp-ck op" onclick="ch1CalcKey('-')">&#8722;</button>
        <button class="smp-ck num" onclick="ch1CalcKey('1')">1</button>
        <button class="smp-ck num" onclick="ch1CalcKey('2')">2</button>
        <button class="smp-ck num" onclick="ch1CalcKey('3')">3</button>
        <button class="smp-ck op" onclick="ch1CalcKey('+')">&#43;</button>
        <button class="smp-ck num zero" onclick="ch1CalcKey('0')">0</button>
        <button class="smp-ck num" onclick="ch1CalcKey('.')">.</button>
        <button class="smp-ck op" onclick="ch1CalcKey('=')">&#61;</button>
      </div>
    </div>
    <div class="smp-home-bar dark"></div>
  </div>
</section>

<!-- ====== ch1-browser ====== -->
<section class="screen sm-screen" id="ch1-browser">
  <div class="smp-phone smp-browser-app">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">浏览器</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-search-bar"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span>搜索或输入网址</span></div>
      <div class="smp-hist-title">搜索历史</div>
      <div class="smp-hist-item" onclick="smToast('搜索：AI换脸检测')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">AI换脸检测</span><span class="smp-hist-time">今天</span></div>
      <div class="smp-hist-item" onclick="smToast('搜索：如何识别网络诈骗')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">如何识别网络诈骗</span><span class="smp-hist-time">昨天</span></div>
      <div class="smp-hist-item" onclick="smToast('搜索：网恋对象不视频见面正常吗')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">网恋对象不视频见面正常吗</span><span class="smp-hist-time">昨天</span></div>
      <div class="smp-hist-item" onclick="smToast('搜索：转账被骗了怎么追回')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">转账被骗了怎么追回</span><span class="smp-hist-time">3天前</span></div>
      <div class="smp-hist-item" onclick="smToast('搜索：他是不是不爱我了')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">他是不是不爱我了</span><span class="smp-hist-time">3天前</span></div>
      <div class="smp-hist-item" onclick="smToast('搜索：AI生成图片检测工具')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">AI生成图片检测工具</span><span class="smp-hist-time">今天</span></div>
      <div class="smp-hist-item" onclick="smToast('搜索：如何查一个人的真实身份')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round"/></svg></span><span class="smp-hist-txt">如何查一个人的真实身份</span><span class="smp-hist-time">昨天</span></div>
      <div class="smp-hist-title">常去网站</div>
      <div class="smp-hist-item" onclick="smToast('打开：微博热搜')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18" stroke-linecap="round"/><path d="M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg></span><span class="smp-hist-txt">weibo.com</span><span class="smp-hist-time">热搜</span></div>
      <div class="smp-hist-item" onclick="smToast('打开：知乎问答')"><span class="smp-hist-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18" stroke-linecap="round"/><path d="M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg></span><span class="smp-hist-txt">zhihu.com</span><span class="smp-hist-time">问答</span></div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-album ====== -->
<section class="screen sm-screen" id="ch1-album">
  <div class="smp-phone smp-album">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">相册</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-album-title">最近项目</div>
      <div class="smp-album-grid">
        <div class="smp-album-cell" style="background-image:url('couple-1.jpg')" onclick="smToast('苏然 · 我们的合影')"></div>
        <div class="smp-album-cell" style="background-image:url('couple-2.jpg')" onclick="ch1OpenPhoto('couple-2.jpg')"></div>
        <div class="smp-album-cell" style="background-image:url('couple-3.jpg')" onclick="ch1OpenPhoto('couple-3.jpg')"></div>
        <div class="smp-album-cell" style="background-image:url('su-ran.jpg')" onclick="smToast('苏然 · 自拍')"></div>
        <div class="smp-album-cell" style="background-image:url('su-ran-room.jpg')" onclick="smToast('苏然 · 我的房间')"></div>
        <div class="smp-album-cell" style="background-image:url('lin-chen.jpg')" onclick="smToast('林晨 · 他的头像')"></div>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-notes ====== -->
<section class="screen sm-screen" id="ch1-notes">
  <div class="smp-phone smp-notes-app">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">备忘录</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-notes-app-head">苏然的备忘录</div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">林晨 · 重要的事</div>
        <div class="smp-note-date">9月28日</div>
        <div class="smp-note-preview">他的生日他一直没说，只说"和我在一起每天都像过节"。密码我统一改成1003了，方便他记……</div>
        <div class="smp-note-full">他的生日他一直没说，只说"和我在一起每天都像过节"。
密码我统一改成1003了，方便他记。
他说下个月就把钱连本带利还我，到时候我们就见面。
我有点紧张，也有点期待。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">给妈妈的话（没发出去）</div>
        <div class="smp-note-date">8月14日</div>
        <div class="smp-note-preview">妈，对不起，最近没接你电话。林晨说现在还不适合告诉家里……</div>
        <div class="smp-note-full">妈，对不起，最近没接你电话。
林晨说现在还不适合告诉家里，等我们稳定了再说。
我知道你担心我，但我真的过得很好。
他对我很好，比任何人都好。
等我攒够了钱，我就回家看你。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">购物清单</div>
        <div class="smp-note-date">7月30日</div>
        <div class="smp-note-preview">给他买件外套、咖啡豆、还要还信用卡……</div>
        <div class="smp-note-full">给他买件外套（他喜欢深蓝色）
咖啡豆（他爱喝美式）
还信用卡
给妈妈买条围巾</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">林晨说过的矛盾的话</div>
        <div class="smp-note-date">9月10日</div>
        <div class="smp-note-preview">他说生日是下个月，可上周又说属相跟我差三岁……</div>
        <div class="smp-note-full">他说生日是下个月，可上周又说属相跟我差三岁，属相对不上。
他说在金融公司上班，可朋友圈定位每次都不一样。
他说不视频是怕我紧张，可昨天截图像素糊得像拼出来的。
他说的每一句都对，可拼在一起，就对不上了。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">如果我不在了</div>
        <div class="smp-note-date">9月25日</div>
        <div class="smp-note-preview">如果有一天我不在了，请帮我查查那个叫林晨的人……</div>
        <div class="smp-note-full">如果有一天我不在了，
请帮我查查那个叫林晨的人，他可能根本不存在。
我的钱都转给他了，密码是1003。
妈妈，对不起，我早该听你的话。
这世上有种爱，是一面镜子，照得越清，碎得越狠。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">林晨的时间线（我整理的）</div>
        <div class="smp-note-date">9月15日</div>
        <div class="smp-note-preview">6月12日认识。7月3日开始挑拨王丽。7月20日转第一笔钱……</div>
        <div class="smp-note-full">6月12日：认识林晨，他说做金融的。
7月3日：开始挑拨王丽，给我看"假的聊天截图"。
7月20日：转第一笔钱，8万。他说帮我理财。
8月5日：一个月没见朋友了。他让我删了王丽微信。
8月15日：他说别联系家人，等稳定了再说。
9月1日：我开始偷偷备份聊天记录。
9月10日：发现他说的矛盾越来越多。
9月15日：写这条备忘录。手在抖。
时间线不会说谎。人会说谎，时间不会。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">云盘备份链接（仅自己可见）</div>
        <div class="smp-note-date">9月18日</div>
        <div class="smp-note-preview">所有证据已上传加密云盘，密码是1003……</div>
        <div class="smp-note-full">所有证据已上传加密云盘。
密码：1003
链接已发给周梅，她答应如果出事就帮我交出去。
文件夹1：聊天记录截图（共347张）
文件夹2：转账凭证（共15笔，总计152000元）
文件夹3：AI检测报告（couple-1至couple-3，均显示99%以上AI生成）
文件夹4：通话录音（共12段，总时长47分钟）
如果你看到了这条，说明我可能出事了。
请把云盘里的东西交给警察。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">他的声音</div>
        <div class="smp-note-date">9月22日</div>
        <div class="smp-note-preview">今天又听了一遍他发的语音，总觉得哪里不对……</div>
        <div class="smp-note-full">今天又听了一遍他发的语音，总觉得哪里不对。他的声音太平了，没有起伏，像是念稿子。正常人说话会有呼吸声、会有停顿、会有语气变化，可他的语音像是机器生成的。我不敢往那个方向想，可越听越觉得不对劲。明天我下个AI检测软件试试。</div>
      </div>
      <div class="smp-note-card" onclick="ch1NoteToggle(this)">
        <div class="smp-note-t">可疑的定位</div>
        <div class="smp-note-date">9月25日</div>
        <div class="smp-note-preview">他说在上海出差，可他发来的照片背景明显是南方某城市……</div>
        <div class="smp-note-full">他说在上海出差，可他发来的照片背景明显是南方某城市的街景。我查了一下，那个路牌写的是'滨海大道'，上海没有这条路。他还说公司叫'汇丰金控'，可我在工商查不到这个公司。所有的细节都在说谎，可我还是不敢相信。因为如果他是假的，那我这三个月算什么？</div>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-settings ====== -->
<section class="screen sm-screen" id="ch1-settings">
  <div class="smp-phone smp-settings">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">设置</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-set-h">关于手机</div>
      <div class="smp-set-group">
        <div class="smp-set-item"><div class="smp-set-ico" style="background:#5b9bd5"></div><span class="smp-set-label">型号</span><span class="smp-set-val">Suran X1</span></div>
        <div class="smp-set-item" onclick="smToast('系统版本：MirrorOS 2.4.1')"><span class="smp-set-label">系统版本</span><span class="smp-set-val">MirrorOS 2.4.1</span><span class="smp-set-chev">&#8250;</span></div>
        <div class="smp-set-item"><span class="smp-set-label">序列号</span><span class="smp-set-val">SM-1003-SR</span></div>
        <div class="smp-set-item"><span class="smp-set-label">总容量</span><span class="smp-set-val">128 GB</span></div>
        <div class="smp-set-item"><span class="smp-set-label">可用容量</span><span class="smp-set-val">39 GB</span></div>
      </div>
      <div class="smp-set-h">通用</div>
      <div class="smp-set-group">
        <div class="smp-set-item" onclick="smToast('飞行模式：关闭')"><span class="smp-set-label">飞行模式</span><span class="smp-set-val">关闭</span></div>
        <div class="smp-set-item" onclick="smToast('Wi-Fi：林晨家')"><span class="smp-set-label">无线局域网</span><span class="smp-set-val">林晨家</span><span class="smp-set-chev">&#8250;</span></div>
        <div class="smp-set-item" onclick="smToast('蓝牙已开启')"><span class="smp-set-label">蓝牙</span><span class="smp-set-val">已开启</span><span class="smp-set-chev">&#8250;</span></div>
        <div class="smp-set-item" onclick="smToast('电量 96%')"><span class="smp-set-label">电池</span><span class="smp-set-val">96%</span><span class="smp-set-chev">&#8250;</span></div>
      </div>
      <div class="smp-set-h">隐私与安全</div>
      <div class="smp-set-group">
        <div class="smp-set-item" onclick="smToast('定位服务：已开启')"><span class="smp-set-label">定位服务</span><span class="smp-set-val">已开启</span><span class="smp-set-chev">&#8250;</span></div>
        <div class="smp-set-item" onclick="smToast('锁屏密码：1003')"><span class="smp-set-label">锁屏密码</span><span class="smp-set-val">已设置</span><span class="smp-set-chev">&#8250;</span></div>
      </div>
    </div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch1-phone ====== -->
<section class="screen sm-screen" id="ch1-phone">
  <div class="smp-phone smp-phone-app">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch1-home-screen')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">通话记录</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-view">
      <div class="smp-call-item" onclick="smToast('回拨：林晨')"><div class="smp-call-av" style="background-image:url('lin-chen.jpg')"></div><div class="smp-call-meta"><div class="smp-call-name">林晨</div><div class="smp-call-info">昨天 22:18 · 语音通话 12:04</div></div><span class="smp-call-type in">已接</span></div>
      <div class="smp-call-item" onclick="smToast('未接来电：妈妈（共3次）')"><div class="smp-call-av" style="background-image:url('su-ran.jpg')"></div><div class="smp-call-meta"><div class="smp-call-name">妈妈</div><div class="smp-call-info">昨天 20:03 · 来电未接</div></div><span class="smp-call-type miss">未接 (3)</span></div>
      <div class="smp-call-item" onclick="smToast('已拒接：王丽')"><div class="smp-call-av" style="background-image:url('wang-li.jpg')"></div><div class="smp-call-meta"><div class="smp-call-name">王丽</div><div class="smp-call-info">3天前 14:20 · 已拒接</div></div><span class="smp-call-type declined">已拒</span></div>
      <div class="smp-call-item" onclick="smToast('陌生号码：400-***-1003')"><div class="smp-call-av"></div><div class="smp-call-meta"><div class="smp-call-name">未知号码</div><div class="smp-call-info">3天前 09:11 · 陌生来电</div></div><span class="smp-call-type out">陌生</span></div>
      <div class="smp-call-item" onclick="smToast('已拒接：周梅（闺蜜）')"><div class="smp-call-av" style="background-image:url('wang-li.jpg')"></div><div class="smp-call-meta"><div class="smp-call-name">周梅</div><div class="smp-call-info">昨天 19:45 · 已拒接</div></div><span class="smp-call-type declined">已拒</span></div>
      <div class="smp-call-item" onclick="smToast('短号码来电：9510，已接通 4 秒')"><div class="smp-call-av"></div><div class="smp-call-meta"><div class="smp-call-name">9510</div><div class="smp-call-info">今天 11:02 · 来电 4 秒</div></div><span class="smp-call-type out">短号</span></div>
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
      <div class="smp-notes-head" style="margin-top:6px"><div class="smp-notes-title">苏然的日记</div><div class="smp-notes-count">已读 <b id="ch2-diary-read-count">0</b> / 11</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-0" onclick="ch2OpenEntry(0)"><div class="smp-diary-mood-big">😊</div><div class="smp-diary-meta"><div class="smp-diary-date">6月12日</div><div class="smp-diary-t">他是完美的</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-1" onclick="ch2OpenEntry(1)"><div class="smp-diary-mood-big">😕</div><div class="smp-diary-meta"><div class="smp-diary-date">7月3日</div><div class="smp-diary-t">有点不对</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-2" onclick="ch2OpenEntry(2)"><div class="smp-diary-mood-big">🤔</div><div class="smp-diary-meta"><div class="smp-diary-date">7月20日</div><div class="smp-diary-t">他在帮我</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-3" onclick="ch2OpenEntry(3)"><div class="smp-diary-mood-big">😔</div><div class="smp-diary-meta"><div class="smp-diary-date">8月5日</div><div class="smp-diary-t">我好累</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-4" onclick="ch2OpenEntry(4)"><div class="smp-diary-mood-big">😢</div><div class="smp-diary-meta"><div class="smp-diary-date">8月15日</div><div class="smp-diary-t">不能让妈妈知道</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-5" onclick="ch2OpenEntry(5)"><div class="smp-diary-mood-big">😰</div><div class="smp-diary-meta"><div class="smp-diary-date">9月1日</div><div class="smp-diary-t">我决定了</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-6" onclick="ch2OpenEntry(6)"><div class="smp-diary-mood-big">🥺</div><div class="smp-diary-meta"><div class="smp-diary-date">9月20日</div><div class="smp-diary-t">最后的日记</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-7" onclick="ch2OpenEntry(7)"><div class="smp-diary-mood-big">😰</div><div class="smp-diary-meta"><div class="smp-diary-date">10月1日</div><div class="smp-diary-t">我要去见他</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-8" onclick="ch2OpenEntry(8)"><div class="smp-diary-mood-big">🥺</div><div class="smp-diary-meta"><div class="smp-diary-date">10月3日</div><div class="smp-diary-t">如果你能看到这些</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-9" onclick="ch2OpenEntry(9)"><div class="smp-diary-mood-big">😊</div><div class="smp-diary-meta"><div class="smp-diary-date">7月15日</div><div class="smp-diary-t">他送的礼物</div></div><div class="smp-diary-chev">&#8250;</div></div>
      <div class="smp-diary-item" id="ch2-diary-item-10" onclick="ch2OpenEntry(10)"><div class="smp-diary-mood-big">😰</div><div class="smp-diary-meta"><div class="smp-diary-date">8月28日</div><div class="smp-diary-t">深夜求助</div></div><div class="smp-diary-chev">&#8250;</div></div>

      <div class="smp-ch2-hub">
        <div class="smp-ch2-hub-t">&#128270; 手机里还有未读线索</div>
        <button class="smp-ch2-hub-btn" id="ch2-hub-news" onclick="showScreen('ch2-news')"><span class="ico">&#128240;</span><span>浏览器 · 一条新闻</span><span class="tag" id="ch2-hub-news-tag">未读</span></button>
        <button class="smp-ch2-hub-btn" id="ch2-hub-news-2" onclick="showScreen('ch2-news-2')"><span class="ico">&#128240;</span><span>浏览器 · AI语音诈骗</span><span class="tag" id="ch2-hub-news-2-tag">未读</span></button>
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
        <div class="smp-news-cmt"><b>过来人：</b>我当年也是这样，对方从不见面，只会要钱，还让我别告诉家人。等我发现的时候积蓄已经没了，人也差点没了。姑娘们，别一个人扛。</div>
        <div class="smp-news-cmt"><b>网友 D：</b>说句不好听的，谈了这么久都不打个视频电话？一个视频不就什么都清楚了？真是不理解。</div>
        <div class="smp-news-cmt"><b>网友 E：</b>回复@网友D：你不懂，他们也会视频通话的。只不过画面会"卡"，脸的边缘会模糊，对方会说是网络不好。等你发现不对劲的时候，钱已经转出去了。这种骗术比你以为的高明得多。</div>
        <div class="smp-news-cmt"><b>反诈志愿者：</b>我们接触过很多受害者。有个共同点：不是她们不聪明，而是骗子太会操控情绪了。先让你觉得被爱包围，再让你觉得全世界只有他可信，最后让你觉得离开他就活不了。这不是恋爱，这是精神控制。如果有人让你删朋友、断家人、关定位——请立刻报警。</div>
        <div class="smp-news-cmt"><b>心理咨询师：</b>从心理学角度讲，这种操控叫"创伤联结"（Trauma Bonding）。施害者交替使用甜言蜜语和冷漠威胁，让受害者的多巴胺系统产生类似成瘾的依赖。受害者不是"傻"，她们的大脑被劫持了。请不要指责受害者，请理解她们的处境。</div>
      </div>
    </div>
    <div class="smp-news-foot"><button class="smp-btn primary" id="ch2-news-confirm" onclick="ch2NewsConfirm()">这条新闻印证了……</button></div>
    <div class="smp-home-bar"></div>
  </div>
</section>

<!-- ====== ch2-news-2 ====== -->
<section class="screen sm-screen" id="ch2-news-2">
  <div class="smp-phone smp-browser">
    <div class="smp-bar light">
      <button class="smp-back" onclick="showScreen('ch2-diary-list')">&#8249;</button>
      <div style="flex:1;text-align:center;font-size:15px;font-weight:600;color:#111">浏览器</div>
      <span style="width:30px"></span>
    </div>
    <div class="smp-url-bar"><span class="smp-url-lock">&#128274;</span><span>tech-alert.cn/ai-voice-clone-fraud</span></div>
    <div class="smp-view">
      <div class="smp-news-art">
        <div class="smp-news-src">科技预警 · 反诈专栏</div>
        <h1 class="smp-news-h1">AI语音克隆技术沦为"杀猪盘"新工具：只需3秒样本即可伪造任何人的声音</h1>
        <img class="smp-news-img" src="news-2.jpg" alt="新闻配图">
        <div class="smp-news-body">
          <p>本报讯（记者 陈默）随着AI语音克隆技术日趋成熟，不法分子开始利用该技术为情感诈骗"升级武装"。据反诈中心最新通报，已有多个犯罪团伙通过 <b>AI克隆语音</b> 模拟"恋人"的声音发送语音消息，使受害者深信对方真实存在。</p>
          <p>专家指出，当前主流的语音克隆模型仅需 <b>3至15秒</b> 的原始音频样本，即可生成高度逼真的合成语音。犯罪分子通常先从社交平台获取受害者或目标人物公开发布的短视频、语音动态，提取声纹后批量生成日常对话语音。</p>
          <p>"合成语音的破绽在于它太'完美'了。"声纹鉴定专家表示，真人说话会有呼吸声、停顿、语气起伏和微小的频率抖动，而AI合成语音的基频曲线过于平稳，缺少这些自然特征。普通用户如果留意，可以通过 <b>频谱分析工具</b> 进行初步鉴别。</p>
          <p>警方提示：网恋对象若只发语音从不视频通话、语音听起来"像在念稿"、或语音与本人声纹存在差异，应高度警惕。一旦涉及转账请求，请立即停止联系并报警。</p>
        </div>
      </div>
      <div class="smp-news-cmts">
        <div class="smp-news-cmts-t">评论 (89)</div>
        <div class="smp-news-cmt hl"><b>受害者家属：</b>我妹妹就是被AI语音骗的。那个"男友"从不视频，只发语音，声音听着是真人，谁能想到是机器合成的。等我们发现的时候，她已经转了十几万出去。</div>
        <div class="smp-news-cmt"><b>声纹工程师：</b>技术上完全可以鉴别。合成语音的频谱图和真人有明显差异，基频太稳、谐波能量分布异常。建议大家对网恋对象的语音存个心眼，必要时可以做频谱分析。</div>
        <div class="smp-news-cmt"><b>网友 F：</b>3秒就能克隆声音？这也太恐怖了。以后接到熟人电话要钱，一定要多核实。</div>
        <div class="smp-news-cmt"><b>过来人：</b>我前男友也是只发语音不视频，声音很好听。后来发现他同时用同样的声音骗了好几个女孩。那些语音全是AI合成的，他根本不是一个人在骗，是一个团伙。</div>
      </div>
    </div>
    <div class="smp-news-foot"><button class="smp-btn primary" id="ch2-news-2-confirm" onclick="ch2News2Confirm()">这条新闻印证了……</button></div>
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
        smSetWallpaper(1);
        smGoChapter(1, '失联', '她叫苏然。三天前，她消失了。留下的，只有这部还在震动的手机。', function () { showScreen('ch1-lock-screen'); });
        return;
    }
    state.currentChapter = 1;

    var container = document.getElementById('game-screens');
    container.insertAdjacentHTML('beforeend', smStyleHTML() + ch1SectionsHTML());

    /* 切换到第一章壁纸（锁屏 + 桌面） */
    smSetWallpaper(1);
    /* 音乐播放列表初始态 */
    ch1MusicRender();

    /* 锁屏密码按钮：onclick 属性已足够（.smp-lock::after 已设 pointer-events:none） */

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
    if (what === 'wp') findClue('ch1-lock-wallpaper', '锁屏壁纸', '锁屏壁纸是一张海边落日的双人剪影——和聊天里的"合照"一样，画面美得不太真实。');
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
    else if (app === 'album') showScreen('ch1-album');
    else if (app === 'notes') showScreen('ch1-notes');
    else if (app === 'browser') showScreen('ch1-browser');
    else if (app === 'calc') showScreen('ch1-calc');
    else if (app === 'music') { showScreen('ch1-music'); ch1MusicRender(); }
    else if (app === 'settings') showScreen('ch1-settings');
    else if (app === 'phone') showScreen('ch1-phone');
    else smToast('这里暂时没有新线索');
}

/* ---------- 非推理 App：备忘录展开/收起 ---------- */
function ch1NoteToggle(el) {
    if (el && el.classList) el.classList.toggle('open');
}

/* ---------- 非推理 App：计算器 ---------- */
var ch1CalcExpr = '';
function ch1CalcKey(k) {
    var disp = document.getElementById('ch1-calc-disp');
    var expr = document.getElementById('ch1-calc-expr');
    if (!disp) return;
    if (k === 'C') {
        ch1CalcExpr = '';
        if (expr) expr.textContent = '';
    } else if (k === 'del') {
        if (ch1CalcExpr === '错误') ch1CalcExpr = '';
        else ch1CalcExpr = ch1CalcExpr.slice(0, -1);
    } else if (k === '=') {
        var safe = ch1CalcExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        if (/^[\d+\-*/.()% ]+$/.test(safe) && safe.length) {
            try {
                /* 仅允许数字与基本运算符，避免任意代码执行 */
                var r = Function('return (' + safe + ')')();
                if (r === undefined || r === null || !isFinite(r)) ch1CalcExpr = '错误';
                else {
                    if (expr) expr.textContent = ch1CalcExpr + ' =';
                    ch1CalcExpr = String(Math.round(r * 1e10) / 1e10);
                }
            } catch (e) { ch1CalcExpr = '错误'; }
        } else { ch1CalcExpr = '错误'; }
    } else if (k === '%') {
        /* 把末尾的数字折算成百分比（如 50 -> 0.5） */
        if (ch1CalcExpr === '错误') ch1CalcExpr = '';
        var m = ch1CalcExpr.match(/(\d+\.?\d*)$/);
        if (m) {
            var num = parseFloat(m[1]);
            ch1CalcExpr = ch1CalcExpr.slice(0, m.index) + (num / 100);
        }
    } else {
        if (ch1CalcExpr === '错误') ch1CalcExpr = '';
        /* 避免连续两个运算符（首个除外） */
        ch1CalcExpr += k;
    }
    disp.textContent = ch1CalcExpr || '0';
}

/* ---------- 非推理 App：音乐 ---------- */
var ch1MusicList = [
    { title: '碎镜', artist: '苏然 · 单曲', dur: '3:42' },
    { title: '孤独的人', artist: '城市民谣', dur: '4:15' },
    { title: '假面', artist: '沉默乐队', dur: '3:28' },
    { title: '消失的她', artist: '电影原声带', dur: '4:01' },
    { title: '镜中人', artist: '夜语', dur: '3:55' },
    { title: '碎裂', artist: '回声乐队', dur: '4:30' }
];
var ch1MusicIdx = 0;
var ch1MusicPlaying = false;
function ch1MusicSelect(i) {
    if (i < 0 || i >= ch1MusicList.length) return;
    ch1MusicIdx = i;
    ch1MusicPlaying = true;
    ch1MusicRender();
}
function ch1MusicToggle() {
    ch1MusicPlaying = !ch1MusicPlaying;
    ch1MusicRender();
}
function ch1MusicRender() {
    var s = ch1MusicList[ch1MusicIdx];
    if (!s) return;
    var t = document.getElementById('ch1-music-title');
    var a = document.getElementById('ch1-music-artist');
    var d = document.getElementById('ch1-music-dur');
    var b = document.getElementById('ch1-music-btn');
    var bar = document.getElementById('ch1-music-bar');
    if (t) t.textContent = s.title;
    if (a) a.textContent = s.artist;
    if (d) d.textContent = s.dur;
    if (b) b.innerHTML = ch1MusicPlaying ? '&#10074;&#10074;' : '&#9654;';
    if (bar) bar.classList.toggle('playing', ch1MusicPlaying);
    var items = document.querySelectorAll('#ch1-music-list .smp-music-item');
    for (var i = 0; i < items.length; i++) items[i].classList.toggle('active', i === ch1MusicIdx);
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
        btn.textContent = '继续';
    } else if (ch1WechatStep === 3) {
        body.insertAdjacentHTML('beforeend', ch1Batch4);
        ch1ScrollChat();
        ch1WechatStep = 4;
        btn.textContent = '继续';
    } else if (ch1WechatStep === 4) {
        body.insertAdjacentHTML('beforeend', ch1Batch5);
        ch1ScrollChat();
        ch1WechatStep = 5;
        btn.textContent = '查看线索';
    } else if (ch1WechatStep === 5) {
        findClue('ch1-wechat-control', '聊天记录中的控制模式', '甜言蜜语之后是逐步隔离：红包示好 → 挑拨同事、伪造截图 → 索要密码、要求保密、转走存款 → 删除照片、视频造假、掏空积蓄 → 关定位、断家人、套现花呗。每颗糖都拴着一根线，每根线最后都拴在她脖子上。');
        body.insertAdjacentHTML('beforeend',
            '<div class="smp-reflect">翻完这些对话，你后背发凉。<br>从第一句"宝宝早安"到那句"别人都不怀好意"，不过隔了几天。<br>他送来的每一颗糖，都拴着一根线。<br>而最后那条"只有我是真的对你好"——<br>是一根绞索。</div>');
        ch1ScrollChat();
        ch1WechatStep = 6;
        btn.textContent = '返回桌面';
    } else if (ch1WechatStep === 6) {
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
    view.style.display = '';
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
    if (view) { view.classList.remove('show'); view.style.display = 'none'; }
}
function ch1PhotoProceed() {
    if (window._ch1Proceeding) return;
    window._ch1Proceeding = true;
    ch1PhotoClose();
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
        container.insertAdjacentHTML('beforeend', html);
    }
    /* 切换到第二章壁纸 */
    smSetWallpaper(2);
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
            findClue('ch2-diary-pattern', '日记中的情感操控轨迹', '十一篇日记完整呈现"爱情轰炸 → 物质锚定 → 挑拨孤立 → 经济控制 → 认知失调 → 情感撤回 → 彻底隔离 → 留存证据 → 灭迹预警 → 飞蛾扑火 → 最后遗言"的操控链。苏然不是没有察觉，她只是太想相信；当她终于想自救时，已经太迟了。最后那篇日记里，她还在替别人着想——这才是最让人心碎的地方。');
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

/* ---------- 新闻2：确认 ---------- */
function ch2News2Confirm() {
    findClue('ch2-news-ai-voice', 'AI语音克隆诈骗', '科技预警报道：犯罪团伙利用AI语音克隆技术，仅需3至15秒音频样本即可伪造任何人的声音，用于"杀猪盘"情感诈骗。专家指出合成语音基频过稳、缺少呼吸停顿，可通过频谱分析鉴别。这与苏然备忘录中"他的声音太平了，像是念稿子"的记录，以及第二章语音频谱分析的结果完全吻合。');
    var btn = document.getElementById('ch2-news-2-confirm');
    if (btn) { btn.textContent = '已记录'; btn.disabled = true; }
    var hub = document.getElementById('ch2-hub-news-2');
    var tag = document.getElementById('ch2-hub-news-2-tag');
    if (hub) hub.classList.add('done');
    if (tag) tag.textContent = '已确认';
    smToast('线索已记录：AI语音克隆诈骗印证了林晨的语音是合成的');
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
    var need = ['ch2-diary-pattern', 'ch2-news-confirm', 'ch2-voice-synth', 'ch2-news-ai-voice'];
    for (var i = 0; i < need.length; i++) { if (!smHasClue(need[i])) return; }
    setTimeout(function () {
        if (typeof window.loadChapter3 === 'function') window.loadChapter3();
        else smGoChapter(3, '裂痕', '完美的镜面，开始出现第一道裂纹。', function () { showScreen('ch3-placeholder'); });
    }, 800);
}

/* ---------- 对外暴露 ---------- */
window.loadChapter1 = loadChapter1;
window.loadChapter2 = loadChapter2;
