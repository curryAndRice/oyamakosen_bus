// 「友達を家へと誘う」ボタン。外部スクリプトは使わず、ブラウザ標準の機能だけで動かす。
// 共有メニュー → クリップボード → 選択コピー の順に、使えるものへ切り替える。
// （共有メニューとクリップボードは HTTPS か localhost でしか使えない）
const SHARE_DATA = {
  title: "家への誘い",
  text: "小山高専⇔小山駅東口の、次に乗れるおーバスがすぐ分かる「家への誘い」",
  url: new URL("./", location.href).href,
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
    await navigator.clipboard.writeText(SHARE_DATA.url);
    return true;
  }
  return copyBySelection(SHARE_DATA.url);
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
        await navigator.share(SHARE_DATA);
      } else {
        showNote((await copyUrl()) ? "リンクをコピーしました" : "コピーできませんでした");
      }
    } catch (error) {
      // 共有メニューを閉じただけ（AbortError）のときは何もしない
      if (error.name !== "AbortError") showNote("共有できませんでした");
    }
  });
};
