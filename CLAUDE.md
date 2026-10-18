# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Existing issues we want to solve

小山高専から小山駅に行くとき、バスの現在地を確認したい、ということがよくある。

しかし、現在スマホでおーバスLive(http://o-bus.bus-go.com/sp/sp-busgo.php)を用いて確認すると、タップ数が多くストレスである。
路線やバス停は、プルダウンメニューで選択できるのだが、現在おーバスLive上での路線プルダウンメニューには39項目(路線を選択して下さい…,⑰おやまぐるっとライン　北行き)存在する。
ここで、高岳線・城東中久喜線・桑東部絹路線でバスの現在地を確認するには、1.路線選択(39項目中から選択) 2.バス停選択(同じように選択) 3.確認4. 戻る(1タップ) というステップを3路線分繰り返さないといけない。
色々工夫すればタップ数を減らせるが、やはりバス現在地の確認は毎日行うことなので、何かしらの方法を用いて極限までタップ数を減らしたい。

## Overview

静的な日本語サイト「家への誘い」。小山高専 ⇔ 小山駅東口のおーバス（高岳線・城東中久喜線・桑東部絹路線）で、次に乗れるバスを表示する。ビルド・パッケージマネージャ・テスト・リンタは無く、フレームワークも不使用。GitHub Pages (`curryandrice.github.io/oyamakosen_bus`) で配信される。確認は静的サーバ（例 `python -m http.server`）で `index.html` を開く（ES modules と `fetch` のため `file://` では動かない）。
- アプリを開いてから3タップ以内（目標は1タップ）で、次発の便から http://o-bus.bus-go.com/ の深いリンク（バス現在地）へ遷移できる。便の行は素の `<a href>` にし、JSでクリックを横取りしない（旧モダン版はドラッグ処理が遷移を壊していた）。
- 再訪時の表示・タップ後の遷移ともに100ms以内を目標にする（200msは超えない）。
- スマホでも問題なく開けるレスポンシブデザイン。対応ブラウザは Android Chrome / Windows Edge / iPhone Safari / Android Firefox の各最新版。
- デザインはデジタル庁デザインシステム（DADS）に則る。アクセント `#0100cc`、路線色は高岳 `#b7ae3f` / 城東中久喜 `#cf5992` / 桑東部絹 `#1e4778`（`data/timetable.json`）。便の左の帯は路線色そのまま、路線名タグは白文字のコントラスト確保のため暗くした `tagColor` を使う。アイコンは `img/`（icooon-mono.com 由来）。

## Structure（1ファイル1仕事）

- `index.html` — マークアップのみ。時刻表JSONの `preload` と `modulepreload` を持つ。Cloudflare Web Analytics のビーコンを維持している。
- `css/tokens.css`（デザイントークン）/ `css/app.css`（部品とレイアウト）
- `js/calendar.js`（曜日区分・運休期間）/ `js/timetable.js`（読み込みと便の抽出）/ `js/view.js`（描画のみ）/ `js/main.js`（状態とイベント）
- `data/timetable.json`（時刻表の正本）と `data/README.md`（書き方）。`tools/check_timetable.py` で検査する。
- `archive/legacy/`（旧 index.html 一式）、`archive/modern/`（旧 index(1).html）— ポートフォリオ用の記録。どこからもリンクしない。
- `sw.js` — 旧SWの後始末用（キャッシュ削除して自己登録解除）。SW化は、アプリが安定して動作したのを確認してから改めて行う。

## Behavior

- 初期の方向は、開いた時刻が午前（12時前）なら駅→高専、午後なら高専→駅。初期の曜日区分は開いた日（平日=月〜金、土日=土・日。祝日は区別しない）。
- 表示は「直前に出た1便 + 次発5便」。始発前は直前なし、最終後は「本日の運行は終了しました」。「最速」は発車時刻基準。乗り換えは考慮しない。
- 時刻入力・時刻リセット・平日/土日ボタンで任意の時刻・曜日区分を確認できる（ドラッグ操作は無い）。
- 桑東部絹路線は平日のみ運行、12/29〜1/3は運休。城東中久喜線の1・33便は平日のみ。高岳線は年中同一ダイヤ。

## Timetable data

ダイヤ改正時は `data/timetable.json` だけを更新し、`python tools/check_timetable.py` で検査する。あわせてルート直下のPDF（`johtoh.pdf` / `kuwatohbu.pdf` / `takaoka.pdf`）を差し替える。時刻は `"HH:MM"`。
- 現行データは令和8年10月1日改正のPDFに基づく（城東中久喜線は同日に経路変更あり）。
- 桑東部絹路線の使用バス停: 高専→駅は左回り K11中久喜2丁目→K1小山駅東口、右回り K13高専正門→K1。駅→高専は左回り K1→K13高専正門、右回り K1→K11中久喜2丁目。
- 文化祭などの臨時便は `extraTrips` に日付付きで追加する（詳細は未確認。学校に問い合わせ中）。

## Notes

- 画面表示文言・コメントは日本語。既存の文体に合わせる。
- おーバスLiveの深いリンク（`data/timetable.json` の `link`）は旧版から引き継いだもの。城東中久喜線は経路変更後も有効か、実機で要確認。
