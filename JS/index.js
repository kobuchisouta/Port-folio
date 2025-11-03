<script>
document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────
  // 1) 全ての .project__item 要素を取得
  // ─────────────────────────────────────────────
  const items = Array.from(document.querySelectorAll('.project__item'));
    const container = document.querySelector('.projects-container');

    // ─────────────────────────────────────────────
    // 2) 各 .project__item の直後に .connector＋.connector-line を生成（最後のアイテムは除外）
    // ─────────────────────────────────────────────
    const connectors = []; // {connector, line, prevItem, nextItem} を保持する配列

  items.forEach((item, idx) => {
    // 最後のアイテムには線を生成しない
    if (idx === items.length - 1) return;

    const nextItem = items[idx + 1];

    // ① .connector 要素を生成
    const connector = document.createElement('div');
    connector.classList.add('connector');

    // ② 中に .connector-line を作成
    const line = document.createElement('div');
    line.classList.add('connector-line');
    connector.appendChild(line);

    // ③ 親コンテナ .projects-container の直下に append
    container.appendChild(connector);

    // ④ connectors 配列に保持
    connectors.push({
        connector,   // 線要素 (.connector)
        line,        // 中の伸びる線 (.connector-line)
        prevItem: item,        // この線の「上端」を担う要素
    nextItem: nextItem     // この線の「下端」を担う要素
    });
  });

    // ─────────────────────────────────────────────
    // 3) 線 (.connector) の位置・高さを再計算して反映する関数
    //    → prevItem の下端 ～ nextItem の上端 を埋めるように絶対配置
    // ─────────────────────────────────────────────
    function recalcConnectorPositions() {
        connectors.forEach(obj => {
            const { connector, prevItem, nextItem } = obj;

            // ① prevItem, nextItem のビューポート基準の座標を取得
            const prevRect = prevItem.getBoundingClientRect();
            const nextRect = nextItem.getBoundingClientRect();

            // ② 「ビューポート基準の Y 座標」に window.pageYOffset を足して、ドキュメント基準に変換
            const prevBottomY = prevRect.bottom + window.pageYOffset; // prevItem の下端
            const nextTopY = nextRect.top + window.pageYOffset; // nextItem の上端

            // ③ 線全体の高さ = 「次要素上端」−「前要素下端」
            const totalHeight = Math.max(nextTopY - prevBottomY, 0);

            // ④ .connector の top を prevBottomY に合わせる
            connector.style.top = `${prevBottomY}px`;

            // ─────────────────────────────────────────
            // 横方向の位置（left）を算出
            // ここでは「prevItem の中央」を起点とします
            // ─────────────────────────────────────────

            // （a）親コンテナ .projects-container の左端（ドキュメント基準）を求める
            const parentRect = container.getBoundingClientRect();
            const parentLeftDoc = parentRect.left + window.pageXOffset;

            // （b）prevItem の左端（ドキュメント基準）
            const prevLeftDoc = prevRect.left + window.pageXOffset;

            // （c）prevItem の横幅
            const prevWidth = prevRect.width;

            // （d）prevItem の中央 X 座標（ドキュメント基準）
            const centerXDoc = prevLeftDoc + (prevWidth / 2);

            // （e）「親コンテナ基準の相対 X」を計算
            const relativeLeft = centerXDoc - parentLeftDoc;

            // （f）線の left をセット（−1pxで幅2pxの半分を中央寄せする微調整）
            connector.style.left = `${relativeLeft - 1}px`;

            // ⑤ 線の幅と高さをセット
            connector.style.width = `2px`;
            connector.style.height = `${totalHeight}px`;
        });
  }

    // ─────────────────────────────────────────────
    // 4) スクロールに合わせて .connector-line の高さを伸ばす関数
    //    → 「線が上から下へ流れていく」ように見せる
    // ─────────────────────────────────────────────
    function updateConnectorLinesOnScroll() {
        connectors.forEach(obj => {
            const { connector, line } = obj;
            const connRect = connector.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // （a）ビューポート上での、線要素の「見えている部分の高さ」を計算
            const startY = Math.max(connRect.top, 0);
            const endY = Math.min(connRect.bottom, viewportHeight);
            const visibleHeight = endY - startY;
            const totalHeight = connRect.height;

            let progress = 0;
            if (connRect.bottom < 0) {
                // コネクターがビューポート上方に完全に抜けたら → 線は全長（1）
                progress = 1;
            } else if (connRect.top > viewportHeight) {
                // コネクターがビューポート下方に完全にある場合 → 線はゼロ（0）
                progress = 0;
            } else {
                // 一部でも見えていれば、「見えている高さ ÷ 線全体の高さ」で 0〜1 の進捗を出す
                progress = visibleHeight / totalHeight;
                progress = Math.min(Math.max(progress, 0), 1);
            }

            // （b）.connector-line の高さを「totalHeight × progress」にセット
            const newHeight = totalHeight * progress;
            line.style.height = `${newHeight}px`;
        });
  }

    // ─────────────────────────────────────────────
    // 5) ページ読み込み時・リサイズ時・スクロール時に呼び出す
    // ─────────────────────────────────────────────
    function onResizeOrLoad() {
        recalcConnectorPositions();
    updateConnectorLinesOnScroll();
  }

    window.addEventListener('load', onResizeOrLoad);
    window.addEventListener('resize', onResizeOrLoad);
    window.addEventListener('scroll', updateConnectorLinesOnScroll);
});
</script>
