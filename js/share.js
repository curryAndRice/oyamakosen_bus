// 「友達を家へと誘う」ボタン。外部スクリプトは使わず、ブラウザ標準の機能だけで動かす。
// 共有メニュー → クリップボード → 選択コピー の順に、使えるものへ切り替える。
// （共有メニューとクリップボードは HTTPS か localhost でしか使えない）
const TITLE = "家への誘い";
const URL_TO_SHARE = new URL("./", location.href).href;

// 共有するたびに、この中からランダムに1つ選ぶ。文を増やすときはここに足す。
const SHARE_TEXTS = [
  "【招待】あなたは家へ誘われました【行こう】",
  "高専⇔駅のバス、次いつ？ 開くだけで分かるし、現在地も1タップ。とっとと家へ帰ろう。【家への誘い】",
  "高専からのバス待ち、もうスマホで一発。次のバスと現在地が、開いた瞬間に分かるよ。【家への誘い】",
  "一緒に帰ろう。次のバスは？ ってなったら、これ開くだけ。【家への誘い】",
  "高専⇔駅のバス、開くだけで次の便が分かる。現在地も1タップ。【家への誘い】",
  "学校終わりのバス待ち、もう迷わない。次のおーバスが、開くだけで分かる【家への誘い】",
  "WHOPPER🍔WHOPPER🍔WHOPPER🍔WHOPPER🍔Junior👶🍔Double🍔🍔Triple WHOPPER🍔🍔🍔YOU🫵LIVE🏠AT📍【家への誘い】",
];

// 直前と同じ文が続かないように選ぶ
let lastIndex = -1;
const pickText = () => {
  let index;
  do {
    index = Math.floor(Math.random() * SHARE_TEXTS.length);
  } while (index === lastIndex && SHARE_TEXTS.length > 1);
  lastIndex = index;
  return SHARE_TEXTS[index];
};

const NOTE_MILLISECONDS = 3000;

// HTTP でも動く古い方式のコピー
const copyBySelection = (text) => {
  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
};

const copyUrl = async () => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(URL_TO_SHARE);
    return true;
  }
  return copyBySelection(URL_TO_SHARE);
};

export const initShare = () => {
  const button = document.getElementById("share-button");
  const note = document.getElementById("share-note");

  let timer = 0;
  const showNote = (message) => {
    note.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => (note.textContent = ""), NOTE_MILLISECONDS);
  };

  button.addEventListener("click", async () => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: TITLE, text: pickText(), url: URL_TO_SHARE });
      } else {
        showNote((await copyUrl()) ? "リンクをコピーしました" : "コピーできませんでした");
      }
    } catch (error) {
      // 共有メニューを閉じただけ（AbortError）のときは何もしない
      if (error.name !== "AbortError") showNote("共有できませんでした");
    }
  });
};
