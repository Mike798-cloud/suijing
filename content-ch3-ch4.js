/* ============================================================
   碎镜 (Shattered Mirror) — 章节 3 & 4 内容与逻辑
   章节3：裂痕 (Cracks)   章节4：碎镜 (Shattered Mirror)
   依赖 index.html 中已定义：
     showScreen(id) / findClue(id, desc, text)
     showChapterTransition(num, name, sub, callback)
     state { cluesFound:Set, currentChapter }
   本文件特性：
     - 多重结局系统（3 个结局，依据线索数量自动走向）
     - 章节 2→3 / 3→4 之间的 CSS 氛围过渡画面
     - 章节3/4 反转情节（苏然主动潜入、AI 伪造栽赃、
       周梅女儿被控制、苏然最后登录于团伙据点、
       便衣警察、诱饵资金等）
     - 增强沉浸感（监控时间戳跳动/扫描线、银行流水、留言分段渐显）
   ============================================================ */

/* ---------- 线索数量统计（兼容 Set / Array / GameState） ---------- */
function smClueCount() {
    var n = 0;
    try {
        if (window.state && window.state.cluesFound) {
            n = (typeof window.state.cluesFound.size === 'number')
                ? window.state.cluesFound.size
                : (window.state.cluesFound.length || 0);
        }
    } catch (e) {}
    if (!n && window.GameState && Array.isArray(window.GameState.cluesFound)) {
        n = window.GameState.cluesFound.length || 0;
    }
    return n || 0;
}

/* ---------- 章节三人物数据（融入反转情节） ---------- */
const ch3People = {
    suran: {
        name: '苏然',
        role: '受害者 · 也是反击者',
        photo: 'su-ran.jpg',
        age: '24岁 · 平面设计师',
        story: '苏然，24岁，独自在蔚海市打拼的设计师。父母离异，从小跟妈妈长大，内心渴望被爱。<br><br>林晨出现时，她以为自己终于等到了那个人。三个月里，她陆续向"林晨"转账共 <b>15 万元</b>——那是她工作三年攒下的全部积蓄，还有妈妈偷偷塞给她的钱。<br><br>她不是不聪明，她只是太想相信这是真的。当一个人极度渴望某样东西时，大脑会自动为它找借口。<br><br>但苏然不是任人摆布的受害者。<b>从识破谎言的那一天起，她开始反向收集证据</b>——假装仍被蒙在鼓里，偷偷备份聊天记录、追查每一笔转账的去向。她留在手机深处的加密文件夹，是一个受害者转身成为猎人的起点。'
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
        story: '周梅，32岁，6岁女儿周小鱼的单亲妈妈。<br><br>三年前，她自己也掉进过同样的陷阱，被骗走 8 万元。当她还不上钱时，犯罪团伙找上了她——用她女儿的安全作威胁，逼她"还债"。<br><br>从此她被迫操作 5 个不同的 AI 人设，林晨是其中之一。<b>小鱼一直被团伙的人"照看"着——那不是照顾，是人质</b>。周梅每完成一笔诈骗，才能换来和女儿通一次电话的权利。她不是骗子，她是一个被困在笼子里、替别人递刀的母亲。'
    },
    wangli: {
        name: '王丽',
        role: '苏然的同事',
        photo: 'wang-li.jpg',
        age: '26岁 · 曾试图提醒苏然',
        story: '王丽是苏然的同事，也是少数察觉出不对劲的人。<br><br>她曾旁敲侧击地提醒苏然："你那个男朋友，怎么从来没来接过你？"话还没说完，苏然的社交账号上就突然出现了一堆"聊天截图"——内容是王丽在背后说苏然坏话、嫉妒苏然。<br><br>苏然信了，和王丽断了联系。<b>但那些截图是假的</b>——事后技术鉴定显示，它们是 AI 生成的：字体边缘有合成痕迹，时间戳也对不上。骗子用一张不存在的"证据"，切断了苏然和唯一能拉她一把的人。<br><br>这是骗子的标准手段：先切断你和外界的所有连接，让你只剩下"他"。'
    }
};

/* ---------- 章节三隐藏日记数据（新增 9/18「诱饵」一篇，强化反转） ---------- */
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
        body: '他们发现我在查了。林晨（或者说那个操作林晨的人）发来消息："然然，最近是不是有什么心事？"这句话让我浑身发冷。我不能让妈妈知道，不能让朋友担心。但我必须做点什么。<br><br>我做了一个决定：不跑了，反过来——<b>我要进去</b>。我要让他们以为我什么都不知道，混进他们的"工作"，把他们的人、他们的钱、他们的窝点，一个一个记下来。如果我出事了，请找到这些记录。我最后一次登录这台手机，是在他们的地方。',
        clue: { id: 'ch3-d915', desc: '对方已察觉苏然在调查，苏然决定深入虎穴。', text: '9月15日："林晨"发来试探消息，苏然预感危险却选择反向潜入，并留下遗言式记录。' }
    },
    {
        id: 'd918',
        date: '9月18日',
        title: '诱饵',
        tag: '深入虎穴',
        body: '今天他们让我试着"操作"一个新角色——又一个女孩的资料发到了我手上。我看着她的照片，像看着三个月前的自己。我假装配合，把每一步都录了屏。我往他们的账户里转了一小笔钱，当作"诱饵"，为了追踪它最终流向哪里。我不知道自己能撑多久。但只要这套证据还在，他们就没白骗我。',
        clue: { id: 'ch3-d918', desc: '苏然假装配合并主动转入"诱饵资金"追踪资金链。', text: '9月18日：苏然录屏留存证据，转入诱饵资金追踪资金流向。她不是受害者，她是猎人。' }
    },
    {
        id: 'd920',
        date: '9月20日',
        title: '最后准备',
        tag: '证据整理',
        body: '我把这几个月收集的所有东西都整理了一遍——聊天记录、转账截图、AI检测报告、那几个账户的开户信息，全都加密存进了手机的隐藏文件夹。我又备份了一份在云盘，密码只有我知道。<br><br>今天我用一个新号码联系了蔚海市刑侦支队的陈警官。我把一部分证据发给了他，告诉他我准备自己进去。他劝我不要冒险，说会有更稳妥的办法。但我等不了了——他们换身份太快，每多拖一天，就多一个女孩上当。<br><br>明天，他们要带我去"上班"的地方。我害怕，手一直在抖。可一想到林晨对我说的每一句"晚安"都是假的，一想到还有别的女孩正坐在屏幕前，像我当初那样把心掏出来——我就知道，我必须走进去。',
        clue: { id: 'ch3-d920', desc: '苏然整理了全部证据并联系了警方。', text: '9月20日：苏然将所有证据加密存储，联系了蔚海市刑侦支队陈警官，准备深入虎穴。' }
    },
    {
        id: 'd922',
        date: '9月22日',
        title: '如果我不回来',
        tag: '遗言',
        body: '如果你正在看这些，说明我没有回来。<br><br>密码是 <b>1003</b>，是我生日，也是我和"林晨"认识的日子。证据都在备忘录的第三个文件夹里，银行流水、录屏、人设档案，一样不少。请把它们交给蔚海市刑侦支队陈警官。<br><br>妈妈，对不起。你一个人把我拉扯大，我还让你担惊受怕。你塞给我的那些钱，我没用来交房租，我用来钓鱼了。如果你知道真相，会不会怪我？我想你一定会哭，但我知道，你也会为我骄傲。<br><br>王丽，对不起。那些截图是假的，是AI做的。我不该不信你。你是唯一想拉我一把的人，我却亲手推开了你。<br><br>看到这些的人：谢谢你替我走到这一步。请告诉所有人，我不是傻，我只是太想被爱。而当我终于清醒过来，我选择把这份清醒，用来保护下一个像我一样的人。',
        clue: { id: 'ch3-d922', desc: '苏然留下了遗言式的最后记录。', text: '9月22日：苏然写下遗言，交代密码1003、证据位置、对亲友的嘱托。她已做好最坏打算。' }
    },
    {
        id: 'd925',
        date: '9月25日',
        title: '她们不止一个',
        tag: '更多受害者',
        body: '今天在他们的系统里，我看到了其他"角色"的受害者名单。不是一个两个，是几十个。每一个名字后面都跟着转账金额、聊天进度、"收割"时间。有个女孩的备注写着"已收割·已断联"——我不知道她现在怎么样了，但那个数字后面的零，刺得我眼睛疼。<br><br>我把名单截了屏。每一张截图，都是一个和我一样的人。',
        clue: { id: 'ch3-d925', desc: '苏然发现了更多受害者的名单。', text: '9月25日：团伙系统中有数十名受害者信息，每个都有转账记录和"收割"时间。苏然截屏保存了全部名单。' }
    },
    {
        id: 'd928',
        date: '9月28日',
        title: '小鱼的声音',
        tag: '良心',
        body: '今天周梅趁人不注意，给我看了她女儿小鱼的照片。小鱼六岁，扎两个小辫子，笑起来缺了一颗门牙。周梅说，她每次完成一笔"业务"，才能和小鱼通一次三分钟的电话。电话那头小鱼会问："妈妈你什么时候来接我？"周梅说她每次都回答"快了快了"。<br><br>我忽然不恨她了。我恨的是把我们两个人都推进这个坑的那双手。她和我，都是棋盘上的棋子。只不过她是黑色的，我是白色的。但下棋的人，从来不是我们。',
        clue: { id: 'ch3-d928', desc: '苏然理解了周梅也是受害者。', text: '9月28日：周梅向苏然展示女儿小鱼照片。苏然意识到周梅也是被胁迫的受害者，真正的操控者在幕后。' }
    },
    {
        id: 'd929',
        date: '9月25日',
        title: 'AI检测结果',
        tag: '技术证据',
        body: '今天用三个不同的AI检测工具分析了林晨发来的合照。结果都一样：couple-1.jpg的AI生成概率99.7%，couple-2.jpg是99.3%，couple-3.jpg是98.9%。他的脸是AI生成的，他的手是AI生成的，他发来的每一张"合照"都是AI合成的。这三个月，我爱的到底是谁？是一段代码？一个算法？还是屏幕背后那个从未露面的骗子？我把检测报告全部截图保存了，和聊天记录一起上传了云盘。',
        clue: { id: 'ch3-d929', desc: '苏然用AI检测工具证实了合照是AI生成的。', text: '9月25日：苏然用三个AI检测工具分析合照，全部显示98%以上AI生成概率。她保存了所有检测报告。' }
    },
    {
        id: 'd930',
        date: '9月28日',
        title: '周梅的秘密',
        tag: '意外发现',
        body: '今天周梅突然约我出来，哭着告诉我真相。她说她也是受害者，三年前也被同一个团伙骗过。那个"林晨"不是一个人，是一个团队，每个人负责不同的环节——有人写话术，有人做AI图片，有人伪造声音，有人负责收钱。周梅说她当时也被转走了二十多万，后来报警才追回来一部分。她说她之所以一直关注我，就是因为我走的是她当年的老路。她有个女儿叫小鱼，今年五岁。她说不能让更多人上当。',
        clue: { id: 'ch3-d930', desc: '周梅也是受害者，揭露了诈骗团伙的组织结构。', text: '9月28日：周梅向苏然坦白自己也是受害者。诈骗团伙是一个有组织的团队：话术、AI图片、声音伪造、资金回收各有专人负责。周梅三年前被骗二十多万。' }
    }
];

/* ---------- 章节四结局数据（3 个结局） ---------- */
const ch4Endings = {
    good: {
        label: 'EPILOGUE · 碎镜重圆',
        title: '碎镜重圆',
        bg: 'ending-good.jpg',
        intro: '证据链完整，收网迅速。<br>便衣冲进那间出租屋时，苏然正坐在电脑前——她没有跑。她朝门口点了点头，像在说：<b>"我等你们很久了。"</b>',
        news: {
            src: '蔚海市公安局 · 通报',
            h3: '警方捣毁 AI 情感诈骗团伙，解救受害者 13 人',
            p: '蔚海市刑侦支队通报，依托公民苏某冒险收集并转交的关键电子证据（含录屏、资金流水、AI 生成人设档案），成功打掉一个长期利用 AI 换脸、声音合成实施"杀猪盘"的犯罪团伙，抓获主要嫌疑人 9 名，解救、帮扶受害人 13 名，涉案金额逾千万元。'
        },
        block1: '<b style="color:#8fbce6;">关于周梅——</b><br>因主动配合调查并提供关键证据，获从轻处理。她的女儿周小鱼已被妥善安置，由社会福利机构照看。<br>她在笔录里只说了一句话：<span class="sm-ending-quote">"谢谢你们，让我女儿不用再过这种日子。"</span>',
        block2: '<b style="color:#e8c47a;">关于苏然——</b><br>苏然安全回家。<br>她和王丽在派出所门口抱在一起哭了很久。<br><span class="sm-ending-quote">"对不起，那截图是假的，我不该不信你。"<br>"我知道，我都知道。"</span>',
        final: '<p>本作品改编自真实案例。<br>AI 换脸、声音合成、网络谣言、情感操纵——这些正在发生。</p><p class="last">不是每个"完美恋人"都是假的，<br>但请记住：真正的爱，不会让你切断和世界的联系。</p>'
    },
    neutral: {
        label: 'EPILOGUE · 镜花水月',
        title: '镜花水月',
        bg: 'ending-neutral.jpg',
        intro: '你提交了手里所有的证据。但有些关键的链条，已经断了。<br>收网那天，那间出租屋是空的——<b>苏然不知去向，只留下一台还开着的电脑</b>。',
        news: {
            src: '蔚海市公安局 · 通报',
            h3: '警方破获部分 AI 诈骗案，主要嫌疑人仍在逃',
            p: '蔚海市刑侦支队通报，依据部分电子证据，已抓获嫌疑人 5 名，仍有主要涉案人员在逃。关键受害人苏某下落不明，警方正全力搜寻，案件仍在进一步侦办中。'
        },
        block1: '<b style="color:#8fbce6;">关于周梅——</b><br>周梅被捕，主动交代了所知情况。她反复问：<br><span class="sm-ending-quote">"小鱼呢？你们找到小鱼了吗？"</span>——没有人能回答她。',
        block2: '<b style="color:#e8c47a;">关于苏然——</b><br>苏然失踪。她留下的证据，让真相浮出了一半。<br><span class="sm-ending-quote">另一半，和她一起，沉进了深处。</span>',
        final: '<p>真相浮出了一半。<br>那一半，是苏然用命换来的。</p><p class="last">有些镜子，碎了一半就再也拼不回去。<br>但哪怕只剩半面，也要照见谎言。</p>'
    },
    bad: {
        label: 'EPILOGUE · 碎裂',
        title: '碎裂',
        bg: 'ending-bad.jpg',
        intro: '证据太少了。<br>少到警方无法立案，少到那间出租屋早在任何行动前就已<b>人去楼空</b>。<br>你握着手机，屏幕上还停在苏然最后那条消息。',
        news: {
            src: '蔚海市公安局 · 通报',
            h3: 'AI 诈骗案证据不足，案件暂缓',
            p: '警方表示，因关键电子证据缺失、资金链断裂，相关 AI 情感诈骗案件暂缓侦办。涉案团伙疑似已转移阵地，继续以新身份作案。警方呼吁知情者提供线索。'
        },
        block1: '<b style="color:#8fbce6;">关于周梅——</b><br>周梅没有出现。她还在那个笼子里，继续扮演着不存在的人。<br><span class="sm-ending-quote">你不知道她是否还活着。<br>你只知道，她女儿还在等一通永远不会来的电话。</span>',
        block2: '<b style="color:#e8c47a;">关于苏然——</b><br>苏然，生死未卜。<br>她最后一次登录这台手机，是在他们的地方。<br><span class="sm-ending-quote">之后，屏幕再没有亮起。</span>',
        final: '<p>这是最沉的一面镜子。<br>它碎成了齑粉，连一片能映出真相的碎片都没留下。</p><p class="last">如果当时，再多找到一条线索——<br>结局，会不会不一样？</p>'
    }
};

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
    container.insertAdjacentHTML('beforeend', `
<style>
/* ====== 碎镜 章节3/4 全局样式 ====== */
.screen.sm-screen{display:none;flex-direction:column;align-items:center;padding:2.6rem 1.1rem 6rem;min-height:100vh;position:relative;top:auto;left:auto;transform:none;}
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
.sm-board-wrap{position:relative;width:100%;height:min(420px,55vh);margin:1rem 0 1.5rem;}
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

/* ====== 章节过渡氛围画面（纯 CSS，无需图片） ====== */
.sm-gap-screen{justify-content:center;}
.sm-gap-inner{position:relative;z-index:2;text-align:center;max-width:560px;animation:smFade 1.1s ease;}
.sm-gap-label{font-family:'Noto Serif SC',serif;font-size:1.6rem;color:#c9a961;letter-spacing:.3em;margin-bottom:1.6rem;opacity:.92;}
.sm-gap-news{background:rgba(243,241,234,.04);border:1px solid rgba(201,169,97,.18);border-radius:12px;padding:1.4rem 1.5rem;text-align:left;margin-bottom:1.6rem;}
.sm-gap-src{font-size:.66rem;color:#9a8d6a;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.4rem;}
.sm-gap-head{font-family:'Noto Serif SC',serif;font-size:1.2rem;color:#f1efea;line-height:1.4;margin-bottom:.6rem;}
.sm-gap-head-sm{font-family:'Noto Serif SC',serif;font-size:1.3rem;color:#f1efea;margin-bottom:1rem;}
.sm-gap-body{font-size:.88rem;color:#b9bbc6;line-height:1.9;}
.sm-gap-body b{color:#d98b91;}
.sm-gap-date{font-size:.72rem;color:#7a7c88;margin-top:.7rem;}
.sm-gap-tap{font-size:.84rem;color:#8b8d99;line-height:1.8;margin-bottom:1.4rem;}
/* 雨幕 */
.sm-gap-rain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.55;
  background:repeating-linear-gradient(105deg,transparent 0 8px,rgba(180,200,220,.07) 8px 9px);
  animation:smRain .6s linear infinite;}
@keyframes smRain{from{background-position:0 0}to{background-position:14px 28px}}
/* 夜灯闪烁 */
.sm-gap-flicker{position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(circle at 50% 28%,rgba(60,70,90,.22),transparent 62%);
  animation:smFlicker 2.6s steps(2,end) infinite;}
@keyframes smFlicker{0%,18%,22%,100%{opacity:.75}20%{opacity:.12}21%{opacity:.62}}
</style>

<!-- ====== ch2to3-gap：三天后（章节2→3 过渡） ====== -->
<section class="screen sm-screen sm-gap-screen" id="ch2to3-gap">
  <div class="sm-gap-rain"></div>
  <div class="sm-gap-inner">
    <div class="sm-gap-label">三 天 后</div>
    <div class="sm-gap-news">
      <div class="sm-gap-src">蔚海晚报 · 社会</div>
      <h2 class="sm-gap-head">24岁女设计师失联，家属急寻</h2>
      <p class="sm-gap-body">10月6日起，蔚海市24岁平面设计师苏某与家人失去联系，手机关机、住所无人。家属称其近日情绪低落，曾提及一名"男友"。警方已立案调查，不排除涉及网络交友诈骗。</p>
      <div class="sm-gap-date">2026年10月9日</div>
    </div>
    <p class="sm-gap-tap">她消失了三天。你是她最信任的人——<br>她的手机，现在在你手里。</p>
    <button class="sm-btn primary" onclick="showChapterTransition(3,'裂痕','完美的镜面，开始出现第一道裂纹',ch3EnterFolder)">打开她的手机 &rarr;</button>
  </div>
</section>

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
    <p class="sm-read-bar" id="ch3-read-bar" style="display:none;">已阅读 <b id="ch3-read-count">0</b> / 11 篇隐藏记录</p>

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
          <div class="sm-node-name">苏然</div><div class="sm-node-role">受害者/反击者</div>
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
      <div class="sm-letter bleed" data-i="6">
        <div class="sm-letter-date">关于苏然</div>
        <div class="sm-letter-text">我每天都在看苏然发来的消息。她那么认真地把生活里的小事讲给"林晨"听——今天吃了什么，加班到几点，路边看到一只流浪猫。每看一句，我的心就揪一下。三年前，我也是这样，把所有的话都说给一个不存在的人听。<br><br>她让我看到当年的自己。那个以为终于被人温柔以待的自己。我恨自己不能直接告诉她"停下来"。可如果我说了，小鱼就没了。我只能在聊天里，偶尔留下一点点不对劲——希望她能发现，希望她比我聪明。</div>
      </div>
      <div class="sm-letter plea" data-i="7">
        <div class="sm-letter-date">如果有一天</div>
        <div class="sm-letter-text">如果有一天我能出去，我想做的第一件事，是去幼儿园门口接小鱼放学。我已经三年没接过她了。我想牵着她的手，给她买一个她一直想要的草莓冰淇淋，告诉她：妈妈以后再也不会丢下你了。<br><br>小鱼，妈妈答应你，总有一天，妈妈会从那个笼子里出来。你要乖乖的，不要忘记妈妈的声音。妈妈每打一个字给你看的人，都是为了有一天能再抱抱你。</div>
      </div>
      <div class="sm-letter bleed" data-i="8">
        <div class="sm-letter-date">关于那些截图</div>
        <div class="sm-letter-text">苏然发现王丽"说坏话"的那些截图，是我做的。他们让我用AI生成王丽的头像，然后编造聊天内容，伪装成王丽在背后说苏然坏话。我调了字体、调了时间戳，让它看起来像真的。<br><br>王丽是无辜的。她是唯一一个看穿了骗局、试图拉苏然一把的人。而我亲手切断了那条线。如果有一天真相大白，我想亲口对王丽说一声对不起。不是"我不是故意的"——我是故意的，因为如果我不做，小鱼就没命了。但我仍然欠她一句对不起。</div>
      </div>
      <div class="sm-letter plea" data-i="9">
        <div class="sm-letter-date">关于苏然的决定</div>
        <div class="sm-letter-text">苏然说她要"进去"。她说要假装配合，收集证据。我听了以后，手抖得差点打翻水杯。<br><br>她不知道里面有多危险。他们有监控，有备用据点，有人专门盯新来的。如果她露出一丝破绽，他们会在二十四小时内让她"消失"——就像之前那些试图报警的人一样。<br><br>可我拦不住她。她的眼睛里有一种光，是我三年前失去的那种光。她说："如果我不进去，下一个女孩还会上当。"那一刻我忽然明白，她和我不一样。我被骗了以后选择了屈服，她被骗了以后选择了反击。<br><br>我唯一能做的，就是在里面多罩着她一点。如果她出事，我替她挡。不是因为我勇敢——是因为她已经做了我不敢做的事，她不该白死。</div>
      </div>
      <div class="sm-letter plea" data-i="10">
        <div class="sm-letter-date">10月5日 · 给苏然妈妈的一封信</div>
        <div class="sm-letter-text">阿姨，我是然然的朋友周梅。我知道您一直在找她。有些话我必须告诉您。然然遇到的不是普通的网恋骗子，是一个有组织的AI诈骗团伙。他们用AI生成假照片、假声音、假身份，专门骗孤独的女孩。三年前我也被他们骗过，失去了二十多万。然然是个好姑娘，她太想被爱了，这不应该成为她被害的理由。阿姨，然然在最后的日子里一直在想办法收集证据，她想保护下一个女孩不再走进同一面镜子。她不是傻，她是善良。请原谅我没能保护好她。如果您需要任何证据，我这里有然然发给我的全部备份。密码是1003。</div>
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
      <div class="sm-news">
        <div class="sm-news-src">央广网 · 调查</div>
        <div class="sm-news-h">AI换脸技术滥用：一张照片即可伪造视频通话</div>
        <div class="sm-news-p">技术调查发现，当前市面上的部分AI换脸工具已能仅凭一张正面照片，合成出可实时驱动的逼真人脸，并在视频通话中以假乱真。测试中，记者仅提供一张证件照，系统便生成了可对口型、眨眼、转头的动态画面，普通用户肉眼几乎无法分辨。专家呼吁，面对"熟人"视频借款等场景，务必通过多重渠道二次核实。</div>
        <div class="sm-news-date">2026年10月20日</div>
      </div>
      <div class="sm-news">
        <div class="sm-news-src">人民日报 · 评论</div>
        <div class="sm-news-h">别让AI成为伤害他人的武器</div>
        <div class="sm-news-p">技术本无善恶，但使用技术的人有。当AI换脸、声音合成被用来伪造恋人、编造谣言、操纵情感，它就成了刺向他人的刀。我们不能等到悲剧发生才追问监管何在。平台须压实主体责任，立法应跟上技术演进的脚步，而我们每一个人，也该学会在"完美"面前保持一份清醒的怀疑。别让AI成为伤害他人的武器，这是底线，也是良知。</div>
        <div class="sm-news-date">2026年10月25日</div>
      </div>
      <div class="sm-news">
        <div class="sm-news-src">南方周末 · 深度</div>
        <div class="sm-news-h">被胁迫的"操盘手"：从受害者到加害者的灰色地带</div>
        <div class="sm-news-p">本报记者历时三个月调查发现，部分AI诈骗团伙的"一线操作员"本身也是受害者。她们多因前期被骗欠下债务，被团伙以家人安全为要挟，被迫操作虚假人设继续行骗。法律界人士指出，这类"胁迫型参与者"的刑事责任认定存在灰色地带——她们既是加害者，也是受害者。专家呼吁，在打击犯罪的同时，也应关注被胁迫者的困境，建立更完善的被害人救助机制。</div>
        <div class="sm-news-date">2026年10月28日</div>
      </div>
      <div class="sm-news">
        <div class="sm-news-src">中国青年报 · 特别报道</div>
        <div class="sm-news-h">"创伤联结"：为什么受害者会爱上伤害自己的人</div>
        <div class="sm-news-p">心理学研究表明，长期处于"甜蜜-伤害"交替循环中的受害者，大脑会产生类似药物成瘾的依赖反应，这种现象被称为"创伤联结"（Trauma Bonding）。施害者通过间歇性的温柔和持续的施压，让受害者的大脑多巴胺系统被劫持，丧失理性判断能力。专家提醒：如果你发现身边的人突然切断了所有社交、频繁给网恋对象转钱、情绪大起大落——请不要指责她"傻"，她可能正处于被操控的状态，需要的是帮助，不是评判。</div>
        <div class="sm-news-date">2026年11月2日</div>
      </div>
      <div class="sm-news">
        <div class="sm-news-src">蔚海日报 · 社会</div>
        <div class="sm-news-h">蔚海市警方破获AI诈骗团伙，涉案金额超千万</div>
        <div class="sm-news-p">本报讯 蔚海市公安局今日通报，成功打掉一个利用AI技术实施电信网络诈骗的犯罪团伙，抓获嫌疑人12名，涉案金额超过1000万元。该团伙通过AI生成虚假人设照片、合成语音、伪造视频通话等手段，在社交平台上伪装成"完美男友"，专门针对年轻女性实施"杀猪盘"诈骗。警方提醒广大市民：网恋需谨慎，涉及金钱往来时务必提高警惕，如遇可疑情况请立即报警。</div>
        <div class="sm-news-date">2026年11月8日</div>
      </div>
    </div>

    <div style="text-align:center;margin-top:2.4rem;">
      <p class="sm-step">裂痕已经无法修补——镜面，即将碎裂</p>
      <button class="sm-btn primary" onclick="loadChapter4()">进入最终章：碎镜 &rarr;</button>
    </div>
  </div>
</section>
`);

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

    /* ---------- 章节入口：先展示"三天后"过渡画面 ---------- */
    showScreen('ch2to3-gap');
}

/* ---------- 章节三：进入隐藏文件夹（过渡回调） ---------- */
function ch3EnterFolder() {
    showScreen('ch3-hidden-folder');
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
    container.insertAdjacentHTML('beforeend', `
<style>
/* ====== 章节4 专属样式 ====== */
.sm-reveal-frame{position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(91,155,213,.25);box-shadow:0 18px 50px rgba(0,0,0,.5);margin-bottom:1.3rem;}
.sm-reveal-frame .cam-bg{position:absolute;inset:0;background:url('su-ran-room.jpg') center/cover no-repeat;filter:grayscale(.6) brightness(.55) contrast(1.1);}
.sm-reveal-frame .cam-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(91,155,213,.06) 0 2px,transparent 2px 4px);animation:smScan 3s linear infinite;}
@keyframes smScan{from{background-position:0 0}to{background-position:0 60px}}
/* 监控扫描线 + 偶发故障抖动 */
.sm-reveal-frame .cam-glitch{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:.5;
  background:linear-gradient(90deg,transparent,rgba(91,155,213,.18),transparent);background-size:300% 100%;
  animation:smGlitch 5.5s linear infinite;}
@keyframes smGlitch{0%,92%,100%{background-position:200% 0;opacity:0}93%{background-position:200% 0;opacity:.6}96%{background-position:-100% 0;opacity:.4}99%{opacity:0}}
.sm-reveal-frame .cam-ui{position:absolute;top:10px;left:12px;right:12px;display:flex;justify-content:space-between;font-size:.66rem;color:#7fb6e8;letter-spacing:.1em;font-family:monospace;}
.sm-reveal-frame .cam-ui .cam-loc{opacity:.85;}
.sm-reveal-frame .cam-dot{width:8px;height:8px;border-radius:50%;background:#c8424a;display:inline-block;margin-right:.4rem;animation:smBlink 1.2s infinite;vertical-align:middle;}
@keyframes smBlink{0%,100%{opacity:1}50%{opacity:.2}}
.sm-reveal-frame .cam-body{position:relative;z-index:2;padding:5.5rem 1.3rem 1.3rem;color:#dceaf6;min-height:230px;display:flex;flex-direction:column;justify-content:flex-end;}
.sm-reveal-frame .cam-cap{font-size:.82rem;line-height:1.7;background:rgba(8,12,20,.6);padding:.8rem 1rem;border-radius:8px;border-left:3px solid #5b9bd5;}

/* 交互式"细看"按钮与揭示框 */
.sm-look-closer{display:inline-flex;align-items:center;gap:.4rem;margin-top:.7rem;background:none;border:1px dashed rgba(91,155,213,.4);color:#8fbce6;font-size:.78rem;padding:.4rem .85rem;border-radius:20px;cursor:pointer;font-family:inherit;transition:.3s;}
.sm-look-closer:hover{border-color:#8fbce6;background:rgba(91,155,213,.08);}
.sm-reveal-note{display:none;margin-top:.9rem;background:rgba(91,155,213,.08);border:1px solid rgba(91,155,213,.22);border-radius:10px;padding:.9rem 1rem;font-size:.86rem;color:#cfe0f0;line-height:1.85;}
.sm-reveal-note.show{display:block;animation:smFade .5s ease;}
.sm-reveal-note b{color:#8fbce6;}

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
.sm-bank-bait{cursor:pointer;transition:.25s;}
.sm-bank-bait:hover td{background:rgba(232,196,122,.10);}
.sm-bank-bait .amt{color:#d98b91;}
.sm-bank-flag{display:inline-block;margin-left:.4rem;background:#e8c47a;color:#1a1a1a;font-size:.6rem;padding:.05rem .35rem;border-radius:4px;font-weight:700;}

/* 苏然最终留言（分段渐显） */
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
.sm-choice-meta{text-align:center;font-size:.82rem;color:#9a9ca8;margin-bottom:1.4rem;letter-spacing:.03em;}
.sm-choice-meta b{color:var(--sm-gold,#c9a961);}

/* 结局 */
.sm-ending-screen{justify-content:flex-start;}
.sm-ending-bg{position:fixed;inset:0;z-index:0;background-size:cover;background-position:center;background-repeat:no-repeat;
  -webkit-filter:brightness(.5) saturate(.85) contrast(1.05);filter:brightness(.5) saturate(.85) contrast(1.05);}
.sm-ending-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,9,14,.5),rgba(8,9,14,.78) 60%,rgba(8,9,14,.92));}
.sm-ending-meta{font-size:.82rem;color:#9a9ca8;text-align:center;margin-bottom:1.6rem;letter-spacing:.04em;}
.sm-ending-meta b{color:var(--sm-gold,#c9a961);}
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

<!-- ====== ch3to4-gap：深夜（章节3→4 过渡） ====== -->
<section class="screen sm-screen sm-gap-screen sm-gap-night" id="ch3to4-gap">
  <div class="sm-gap-flicker"></div>
  <div class="sm-gap-inner">
    <div class="sm-gap-label">深 夜 · 02:17</div>
    <h2 class="sm-gap-head-sm">你以为已经翻完了</h2>
    <p class="sm-gap-body">苏然所有的日记、转账、人物关系——你都看过了。<br><br>你正准备放下手机，屏幕却突然又亮了。<br><b>一条未知号码的消息</b>，和一个你从未见过的文件夹，正静静等着你。</p>
    <p class="sm-gap-tap">最后的真相，往往藏在最不愿意被看见的地方。</p>
    <button class="sm-btn primary" onclick="showChapterTransition(4,'碎镜','镜子碎了，碎片里映出的是另一个真相',ch4EnterReveal)">继续 &rarr;</button>
  </div>
</section>

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
      <div style="font-size:.8rem;color:#8fbce6;letter-spacing:.08em;margin-bottom:.7rem;">&#128249; 调取到的监控画面 · 蔚海市·城东出租屋</div>
      <div class="sm-reveal-frame">
        <div class="cam-bg"></div>
        <div class="cam-scan"></div>
        <div class="cam-glitch"></div>
        <div class="cam-ui"><span><span class="cam-dot"></span>REC · CAM-04 · 城东</span><span id="ch4-cam-time">--:--:--</span></div>
        <div class="cam-body">
          <div class="cam-cap">画面里，一个身形熟悉的女生正坐在电脑前，戴着耳机，屏幕光映在脸上——那台电脑上，正开着和某个"新人设"的聊天窗口。<br><br>时间是昨晚 23:47。地点，疑似诈骗团伙的一处据点。</div>
        </div>
      </div>
      <button class="sm-look-closer" onclick="ch4RevealCam()">&#128269; 放大画面右下角细看 &rarr;</button>
      <div id="ch4-cam-reveal" class="sm-reveal-note"></div>

      <div style="font-size:.8rem;color:#8fbce6;letter-spacing:.08em;margin:1rem 0 .7rem;">&#128179; 银行流水 · 苏然名下账户（近 30 日）</div>
      <table class="sm-bank">
        <thead><tr><th>日期</th><th>摘要</th><th>金额</th></tr></thead>
        <tbody>
          <tr><td>09-28</td><td>转入 - 账户A</td><td class="amt">+ 6,000.00</td></tr>
          <tr><td>10-02</td><td>转入 - 账户B</td><td class="amt">+ 8,500.00</td></tr>
          <tr><td>10-09</td><td>转入 - 账户C</td><td class="amt">+ 12,000.00</td></tr>
          <tr class="sm-bank-bait" onclick="ch4RevealBank()"><td>10-15</td><td>转出 - 待核实 <span class="sm-bank-flag">!</span></td><td class="amt">- 3,000.00</td></tr>
          <tr><td>10-16</td><td>转入 - 账户D</td><td class="amt">+ 3,180.00</td></tr>
          <tr><td>10-20</td><td>转入 - 账户E</td><td class="amt">+ 5,200.00</td></tr>
          <tr class="sm-bank-bait" onclick="ch4RevealBank2()"><td>10-22</td><td>转出 - 诱饵2 <span class="sm-bank-flag">!</span></td><td class="amt">- 1,500.00</td></tr>
          <tr><td>10-25</td><td>转入 - 账户F</td><td class="amt">+ 4,700.00</td></tr>
          <tr><td>10-28</td><td>转入 - 账户G</td><td class="amt">+ 9,300.00</td></tr>
          <tr class="sm-bank-bait" onclick="ch4RevealBank3()"><td>10-30</td><td>转出 - 诱饵3 <span class="sm-bank-flag">!</span></td><td class="amt">- 2,000.00</td></tr>
          <tr class="sm-bank-bait" onclick="ch4RevealBank4()"><td>09-15</td><td>第四笔诱饵资金 · 转出至账户 *8821 <span class="sm-bank-flag">!</span></td><td class="amt">- 1,500.00</td></tr>
          <tr class="sm-bank-bait" onclick="ch4RevealBank5()"><td>09-18</td><td>第五笔诱饵资金 · 转出至境外数字钱包 <span class="sm-bank-flag">!</span></td><td class="amt">- 2,000.00</td></tr>
        </tbody>
      </table>
      <p class="sm-hint" style="margin-top:.8rem;">她不是被骗的人？她在<b>收钱</b>。<br>——除非，有些钱，是她自己放出去的。</p>
      <div id="ch4-bank-reveal" class="sm-reveal-note"></div>
    </div>

    <div style="text-align:center;margin-top:2rem;">
      <p class="sm-step">手机里，还藏着一段留给你的话</p>
      <button class="sm-btn primary" onclick="ch4ShowMessage()">查看苏然的留言 &rarr;</button>
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
        <p>如果你看到这些，说明我的计划走通了——也可能，走偏了。</p>
        <p>我没有死，也没有失踪。我潜进了他们。</p>
        <p>从发现林晨是假的那天起，我就知道，光把聊天记录交给警察没用——他们换过太多个身份，每次都能在收网前蒸发。所以我假装什么都不知道，假装还在被控制，等他们放下戒心。</p>
        <p>他们终于让我"上手"了。他们给了我一个新女孩的资料，让我像当初周梅对我那样，去骗她。<span class="danger">我看着她的照片，像看着三个月前的自己。</span></p>
        <p>我做不到。我一边假装配合，一边把每一步都录了屏。</p>
        <p>我往他们的账户里转了一小笔钱，当作"诱饵"——为了追踪它最终流向哪、流到谁手里。<span class="hl">那笔钱，是我自己攒的。</span></p>
        <p>那天晚上去他们据点之前，我联系了陈警官。我身边一直有个便衣——<span class="hl">监控里那个角落的影子，就是他。</span></p>
        <p>我知道这一步可能很危险。但我必须走到最里面，才能把整张网连根拔起。</p>
        <p>所以我把所有证据都藏在了这台手机里，<span class="hl">留给最聪明的你。</span></p>
        <p>密码是 <span class="hl">1003</span>，是我生日，也是我们认识的日子。</p>
        <p>周梅帮了我。她偷偷帮我备份了数据。她说，如果能结束这一切，她愿意坐牢。</p>
        <p>报警。找蔚海市刑侦支队陈警官。证据在备忘录第三个文件夹。</p>
        <p>在里面，我看到的不只是自己。还有别的女孩的资料，被整整齐齐地码在表格里——姓名、年龄、工作、情感缺口，像待宰的清单。她们都以为自己在被爱着。我不知道还能不能救得了她们，但我至少，要把这张清单带走。</p>
        <p>周梅偷偷帮了我很多。她趁人不注意，把团伙内部的账户结构抄给了我；她把我录的屏备份到了她自己的备用手机里，说"万一你的被发现，还有我的"。她做这些的时候手是抖的，但她没停。她说，只要能结束这一切，她什么代价都愿意付。</p>
        <p>在他们的系统里，我看到了一份名单。不是三五个，是几十个名字。每个名字后面跟着转账金额、"角色"编号、"收割"日期。有一个备注写着"已收割·已断联"——我不知道那个女孩现在在哪里。但我把名单全截了屏。每截一张，手就抖一下。不是因为害怕，是因为愤怒。</p>
        <p>还有一件事我一直没说。那天周梅趁人不注意，给我看了她女儿小鱼的照片。六岁，扎两个小辫子，笑起来缺了一颗门牙。她说她每次完成一笔"业务"，才能和小鱼通三分钟电话。电话里小鱼总问"妈妈什么时候来接我"，她说她每次都回答"快了快了"。<br><br>那一刻我忽然不恨她了。她和我，都是棋盘上的棋子。下棋的人，从来不是我们。</p>
        <p>我想了很久"林晨"到底意味着什么。他不是某一个人，他是所有孤独的人心里的那个空洞。骗子只是把那个空洞，填上了一张合成的脸。我恨过他，后来才明白——我该恨的，是那个利用我渴望被爱的、活生生的人。</p>
        <p>对不起让你担心了。</p>
        <p>如果我没有回来——<br>帮我跟妈妈说，对不起。<br>也告诉她，我不只是被骗的那个。我试过，反过来，去救像我的她们。</p>
        <p>我还发现了一件事——他们不只骗我一个人。在周梅给我的名单里，有十七个女孩被骗过，最小的才十九岁。有人被骗了学费，有人被骗了嫁妆，有人和我一样，把全部积蓄都交了出去。我们都是同一面镜子照出来的人——孤独的、渴望被爱的、以为遇到了命中注定的人。</p>
        <p>如果你正在看这段话，不管你是谁，请记住：真正的爱不会让你删除朋友，不会让你疏远家人，不会让你交出全部存款，不会让你在凌晨三点哭着问自己'我是不是做错了什么'。那不是爱，那是一面精心打磨的镜子，照出你最脆弱的样子，然后把你困在倒影里。</p>
      </div>
      <div class="sm-final-sign">—— 苏然</div>
    </div>

    <div style="text-align:center;margin-top:2rem;">
      <p class="sm-step">现在，决定权在你手里</p>
      <button class="sm-btn primary" onclick="ch4ShowChoice()">做出你的选择 &rarr;</button>
    </div>
  </div>
</section>

<!-- ====== ch4-choice ====== -->
<section class="screen sm-screen" id="ch4-choice">
  <div class="sm-inner">
    <div class="sm-tag">CHAPTER 4 · 碎镜</div>
    <h1 class="sm-h1">你的选择</h1>
    <p class="sm-sub">苏然说，再给她 72 小时。可每多等一秒，都可能多一个女孩受害。<br>你会怎么做？</p>
    <div class="sm-choice-meta">你已收集 <b id="ch4-clue-count">0</b> 条线索 · 证据的多少，将决定结局</div>

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
      <button class="sm-choice-btn" onclick="ch4Choose('C')">
        <span class="sm-choice-letter">C</span>
        <div class="sm-choice-title">等她72小时</div>
        <div class="sm-choice-desc">苏然说再给她72小时。她比你更了解里面的危险。也许，信任她的判断，才是对她最大的尊重。</div>
      </button>
    </div>
  </div>
</section>

<!-- ====== ch4-ending（由 ch4ShowEnding 动态填充背景与内容） ====== -->
<section class="screen sm-screen sm-ending-screen" id="ch4-ending">
  <div class="sm-ending-bg" id="ch4-ending-bg"></div>
  <div class="sm-inner" id="ch4-ending-content"></div>
</section>
`);

    /* ---------- 监控时间戳跳动 ---------- */
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

    /* ---------- 章节入口：先展示"深夜"过渡画面 ---------- */
    showScreen('ch3to4-gap');
}

/* ---------- 章节四：进入碎镜揭示（过渡回调） ---------- */
function ch4EnterReveal() {
    showScreen('ch4-reveal');
    findClue('ch4-reveal', '发现苏然可能并未失踪，反而与团伙有资金往来。', '监控拍到苏然在操作新的"角色"账户；她的账户收到了涉案资金。她究竟是谁？');
}

/* ---------- 章节四：细看监控——便衣警察 ---------- */
function ch4RevealCam() {
    const el = document.getElementById('ch4-cam-reveal');
    if (!el || el.dataset.shown === '1') return;
    el.dataset.shown = '1';
    el.innerHTML = '<div>放大右下角——画面阴影里站着一个人。他没戴耳机，没碰电脑，目光一直盯着门口。<b>那是便衣警察</b>。苏然不是被胁迫，她是在<b>自愿配合调查</b>。</div>';
    el.classList.add('show');
    findClue('ch4-cam-plainclothes', '监控中的便衣警察', '监控画面右下角有一名便衣警察全程在旁，苏然系自愿配合调查，并非被控制。');
}

/* ---------- 章节四：细看银行流水——诱饵资金 ---------- */
function ch4RevealBank() {
    const el = document.getElementById('ch4-bank-reveal');
    if (!el || el.dataset.shown === '1') return;
    el.dataset.shown = '1';
    el.innerHTML = '<div>这笔 3,000 元不是被骗走的，而是<b>苏然主动转出</b>的"诱饵资金"——用以追踪赃款最终流向。10-16 回流的 3,180 元，正是它绕过几层账户后的回声。她不是在收钱，她在<b>钓鱼</b>。</div>';
    el.classList.add('show');
    findClue('ch4-bank-bait', '银行流水中的"诱饵资金"', '苏然主动转出 3000 元作为诱饵追踪资金链，证明她是有预谋地深入团伙。');
}

/* ---------- 章节四：细看银行流水——第二笔诱饵资金 ---------- */
function ch4RevealBank2() {
    var el = document.getElementById('ch4-bank-reveal');
    if (!el || el.dataset.shown2 === '1') return;
    el.dataset.shown2 = '1';
    el.innerHTML += '<div style="margin-top:.8rem;">第二笔诱饵资金也被追踪到了——它流向了一个名为"蔚海科技"的空壳公司账户，法人正是团伙头目之一。苏然在用自己的钱，一张一张地拼出整张资金网。</div>';
    findClue('ch4-bank-bait2', '第二笔诱饵资金', '第二笔1500元诱饵流向空壳公司"蔚海科技"，法人系团伙头目。苏然正在系统性地追踪整条资金链。');
}

/* ---------- 章节四：细看银行流水——第三笔诱饵资金 ---------- */
function ch4RevealBank3() {
    var el = document.getElementById('ch4-bank-reveal');
    if (!el || el.dataset.shown3 === '1') return;
    el.dataset.shown3 = '1';
    el.innerHTML += '<div style="margin-top:.8rem;">第三笔诱饵资金——2000元——最终流入了一个境外数字货币交易所的充值地址。苏然已经追踪到了资金的最终出口。这意味着整条洗钱链条的每一个环节，她都用真金白银标记了出来。<br><br>她不是在赌命，她是在下一盘精密的棋。</div>';
    findClue('ch4-bank-bait3', '第三笔诱饵资金', '第三笔2000元诱饵流向境外数字货币交易所。苏然已完整追踪到资金从境内到境外的洗钱全链路。');
}

/* ---------- 章节四：细看银行流水——第四笔诱饵资金 ---------- */
function ch4RevealBank4() {
    var el = document.getElementById('ch4-bank-reveal');
    if (!el || el.dataset.shown4 === '1') return;
    el.dataset.shown4 = '1';
    el.innerHTML += '<div style="margin-top:.8rem;">第四笔诱饵资金——1500元——被苏然转入了尾号8821的账户。这个账户的户主是一个被盗用身份的普通人，对此一无所知。苏然由此标记出了团伙用于"过水"的"水房"账户层：每一笔赃款都会先经过这类账户洗白，再流向下一层。<br><br>她不是在收钱，她在用自己攒下的钱，一寸一寸地丈量整张资金网。</div>';
    findClue('ch4-bank-bait4', '第四笔诱饵资金', '第四笔1500元诱饵流入尾号8821的"水房"账户，户主系被盗用身份的普通人。苏然标记出团伙用于过水洗白的账户层。');
}

/* ---------- 章节四：细看银行流水——第五笔诱饵资金 ---------- */
function ch4RevealBank5() {
    var el = document.getElementById('ch4-bank-reveal');
    if (!el || el.dataset.shown5 === '1') return;
    el.dataset.shown5 = '1';
    el.innerHTML += '<div style="margin-top:.8rem;">第五笔诱饵资金——2000元——最终汇入了一个境外数字钱包。和第三笔不同，这次苏然锁定了钱包的完整地址，并记录下它的链上交易流水。团伙把境内骗来的钱，经多层中转后统一汇入这类境外钱包，再分散提现。<br><br>五笔真金白银，从源头到终点，她把整条洗钱链路一段一段地标记了出来。</div>';
    findClue('ch4-bank-bait5', '第五笔诱饵资金', '第五笔2000元诱饵汇入境外数字钱包，苏然锁定完整钱包地址与链上记录。团伙通过境外钱包统一归集赃款并分散提现。');
}

/* ---------- 章节四：查看苏然留言（分段渐显 + 注册线索） ---------- */
function ch4ShowMessage() {
    showScreen('ch4-su-ran-message');
    const paras = document.querySelectorAll('#ch4-final-msg p');
    paras.forEach(function (p) { p.classList.remove('in'); });
    setTimeout(function () {
        paras.forEach(function (p, i) {
            setTimeout(function () { p.classList.add('in'); }, i * 520);
        });
        setTimeout(function () {
            findClue('ch4-final', '读完了苏然的最后留言。', '苏然没有失踪——她潜入了诈骗团伙，把全部证据留给了你。密码 1003。');
        }, paras.length * 520 + 400);
    }, 400);
}

/* ---------- 章节四：展示选择界面（填入当前线索数） ---------- */
function ch4ShowChoice() {
    const el = document.getElementById('ch4-clue-count');
    if (el) el.textContent = smClueCount();
    showScreen('ch4-choice');
}

/* ---------- 章节四：选择（根据线索数量自动走向结局） ---------- */
function ch4Choose(choice) {
    // 先以"调查阶段"已收集的线索数量决定结局类型（不受本次选择影响）
    const count = smClueCount();
    let type;
    if (count >= 14) type = 'good';        // 结局A · 碎镜重圆
    else if (count >= 8) type = 'neutral'; // 结局B · 镜花水月
    else type = 'bad';                     // 结局C · 碎裂

    // 记录玩家最终的行动选择（仅作为线索留痕）
    if (choice === 'A') {
        findClue('ch4-choice-a', '选择立即报警。', '越早收网，越少人受害。你把证据交给了警方。');
    } else if (choice === 'C') {
        findClue('ch4-choice-c', '选择等待72小时。', '你选择相信苏然的判断。有时候，信任一个人，就是最好的帮助。');
    } else {
        findClue('ch4-choice-b', '选择先告诉苏然妈妈。', '在动手之前，至少让最担心她的人知道——她还活着，而且很勇敢。');
    }

    ch4ShowEnding(type);
}

/* ---------- 章节四：展示结局（背景图 + 动态内容） ---------- */
function ch4ShowEnding(type) {
    const data = ch4Endings[type] || ch4Endings.bad;
    const count = smClueCount();

    const bg = document.getElementById('ch4-ending-bg');
    if (bg) bg.style.backgroundImage = "url('" + data.bg + "')";

    const content = document.getElementById('ch4-ending-content');
    if (content) {
        content.innerHTML =
            '<div class="sm-tag">' + data.label + '</div>' +
            '<h1 class="sm-h1">' + data.title + '</h1>' +
            '<p class="sm-sub">' + data.intro + '</p>' +
            '<div class="sm-ending-meta">你共收集了 <b>' + count + '</b> 条线索 · 当前结局：<b>' + data.title + '</b></div>' +
            '<div class="sm-ending-news"><div class="src">' + data.news.src + '</div><h3>' + data.news.h3 + '</h3><p>' + data.news.p + '</p></div>' +
            '<div class="sm-ending-block">' + data.block1 + '</div>' +
            '<div class="sm-ending-block q">' + data.block2 + '</div>' +
            '<div class="sm-ending-final">' + data.final + '</div>' +
            '<button class="sm-share-btn" onclick="smShare()">&#128279; 分享给在乎的人</button>' +
            '<button class="sm-replay" onclick="location.reload()">重新开始</button>';
    }

    showScreen('ch4-ending');
    // 滚动至顶部，确保结局首屏可见
    const screenEl = document.getElementById('ch4-ending');
    if (screenEl) screenEl.scrollTop = 0;
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
window.ch3EnterFolder = ch3EnterFolder;
window.ch4EnterReveal = ch4EnterReveal;
window.ch4RevealCam = ch4RevealCam;
window.ch4RevealBank = ch4RevealBank;
window.ch4RevealBank2 = ch4RevealBank2;
window.ch4RevealBank3 = ch4RevealBank3;
window.ch4RevealBank4 = ch4RevealBank4;
window.ch4RevealBank5 = ch4RevealBank5;
window.ch4ShowMessage = ch4ShowMessage;
window.ch4ShowChoice = ch4ShowChoice;
window.ch4ShowEnding = ch4ShowEnding;
window.smShare = smShare;
