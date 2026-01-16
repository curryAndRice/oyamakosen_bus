//対象のバス停の名前
const stopNames = {
    0:"【高岳線】小山高専入口",
    1:"【城東中久喜線】高専正門",
    2:"【桑東部絹路線 右回り】高専正門", 
    3:"【桑東部絹路線 左回り】中久喜２丁目",
};

//対象のおーバスライブリンク
const stopLinks = {
    0:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000006&bscd=005",
    1:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000008&bscd=001",
    2:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000023&bscd=028",
    3:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000022&bscd=030",
}

const stopLinks2 = {
    0:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000005&bscd=001",
    1:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000007&bscd=001",
    2:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000023&bscd=001",
    3:"http://o-bus.bus-go.com/sp/sp-busgo-map.php?bccd=03090001&rtcd=000022&bscd=001",
}

//対象のバス停に止まる時間(高専 → 駅)
const stopTimes = {
    0:["0558","0633","0653","0733","0813","0833","0908","0933","1008","1033","1143","1213","1238","1308","1408","1438","1503","1533","1603","1633","1703","1733","1803","1833","1943","2013","2038","2108"],
    1:["0600", "0645", "0805", "0915", "1015", "1115", "1215", "1435", "1535", "1640", "1750", "1900", "2005"],
    2:["1719", "1914"],
    3:["0723", "0903", "1118", "1358", "1558"],
};

//対象のバス停に止まる時間(駅→高専)
const stopTimes2 = {
    0:["0630","0707","0745","0757","0835","0900","0935","1000","1030","1100","1205","1235","1300","1330","1430","1500","1530","1600","1630","1705","1730","1800","1830","1900","2005","2035","2100","2150"],
    1:["0620", "0740", "0850", "0950", "1050", "1150", "1410", "1510", "1610", "1720", "1830", "1940", "2040"],
    2:["1625", "1820"],
    3:["0615", "0755", "1010", "1250", "1450"],
};
const setTime = document.getElementById("setTime")
const changeableClock = document.getElementById("ChangeableClock");
const resetTime = document.getElementById("ResetTime")

const dateTimeDisp = document.getElementById("DateTimeDisp");
const timeStamp = document.getElementById("TimeStamp");

const firstBus = document.getElementById("FirstBus");
const soonBus = document.getElementById("SoonBus");

const firstBus2 = document.getElementById("FirstBus2");
const soonBus2 = document.getElementById("SoonBus2");


//二部探索, time <= timeList[i] を満たす 最大の i を返す
//つまり、timeList[bisect(time, timeList)] で最寄りの時間が分かる。
const bisect = (time, timeList) => {
    ng = -1;
    ok = timeList.length;
    while (Math.abs(ok - ng) > 1){
        mid = Math.floor((ok + ng)/2);
        if (parseInt(time) <= parseInt(timeList[mid])) {
            ok = mid;
        }else{
            ng = mid;
        }
    }
    return ok;
}

//時数と分数から、ソフトで扱いやすい形式に
const getTimeStamp = (hour, minute) => {
    return parseInt(hour) * 100 + parseInt(minute);
}

//今よりも遅いバスの中で、最初の3つのバスを求める
const getFirstThree = (time_stamp, StopTimes) => {
    let fastestIndex = {};
    let fastTime = [];
    for (let key in stopNames){
        fastestIndex[key] = bisect(time_stamp, StopTimes[key]);
    }

    for (let key in stopNames){
        for (let i = fastestIndex[key]; i<StopTimes[key].length; i++){
            fastTime.push([key, (StopTimes[key][i])])
        }
    }
    fastTime.sort((a,b) => a[1] - b[1]);
    return [fastTime[0], fastTime[1], fastTime[2]];
}

//もう発車してしまったバスのうち、3路線の最後のバスを求める
//時系列順にソートした結果、東光高岳で2/3本出発していても、1種類しか表示されず、他の路線が繰越される
const getDeparturedThree = (time_stamp, StopTimes) =>{
    let lateTime = [];
    for (let key in stopNames){
        let latestIndex =  bisect(time_stamp, StopTimes[key]);
        if (latestIndex > 0){
            lateTime.push([key, (StopTimes[key][latestIndex-1])])
        }
    }
    lateTime.sort((a,b) => b[1]-a[1])
    return [lateTime[0], lateTime[1], lateTime[2]];
}

// "1234" -> "12:34"
const addColon = (fourDigitStr) => {
    return fourDigitStr.substring(0, 2)+":"+fourDigitStr.substring(2, 4)
}

const getMinuteFromTimeStamp = (time_stamp) => {
    return Math.floor(time_stamp/100)*60 + time_stamp%100
}

const displayFirstThree = (firstThreeData, firstElement, soonElement, appendText, finishHtml, link) => {
    if (firstThreeData[0]){
        let firstText = "<a class='dispLink', href='"+link[firstThreeData[0][0]]+"'>";
        firstText += addColon(firstThreeData[0][1])+" に "+stopNames[firstThreeData[0][0]]+appendText;
        firstText += "</a>"
        firstElement.innerHTML = firstText;
    }else{
        firstElement.innerHTML = finishHtml;
    }

    let soonText = "";
    for (let i=1; i<3; i++){
        if (firstThreeData[i] === undefined){
            break;
        }
        soonText+= "<a class='dispLink', href='"+link[firstThreeData[i][0]]+"'>";
        soonText+=addColon(firstThreeData[i][1]);
        soonText+=" に ";
        soonText+=stopNames[firstThreeData[i][0]];
        soonText+=appendText;
        soonText+="</a><br>";
    }
    soonElement.innerHTML = soonText;
}



//時計クリックで逆行時計表示
const clickHandler = () =>{
    if (setTime.style.display === "block"){
        setTime.style.display = "none";
    }else{
        setTime.style.display = "block";
    }
}

//時刻が逆行しているか
let is_timeNow = true;

//input要素で逆行時刻取得
let changedHour = -1;
let changedMinute = -1;
const setNewTime = () =>{
    is_timeNow = false;
    let [h, m, s] = (changeableClock.value).split(':');
    changedHour = h;
    changedMinute = m;
    update();
}
changeableClock.addEventListener('input', setNewTime);
changeableClock.addEventListener("change", setNewTime);
changeableClock.addEventListener("blur", setNewTime);

//時刻リセットボタンでリセット
resetTime.addEventListener("click", () => {
    is_timeNow = true;
    update();
})


/*
* キャンバスの作成・初期化
*/
const initialCanvas = id => {

    // div要素を取得
    const viewElm = document.getElementById(id);

    // div要素の縦横短い方を取得
    const minSide = Math.min( viewElm.clientWidth , viewElm.clientHeight );
    // 時計の半径を取得
    const hankei = minSide / 2;

    // キャンバスを作成
    const cvs = document.createElement("canvas");

    // キャンバスの描画コンテキストを取得
    const context = cvs.getContext('2d');

    // キャンバスの描画サイズセット
    cvs.setAttribute( "width" , minSide );
    cvs.setAttribute( "height" , minSide );

    // キャンバスの表示サイズセット
    const style = cvs.style;
    style.width = minSide + "px";
    style.height = minSide + "px";

    // キャンバスをdiv要素の中央にセット
    style.top = ( viewElm.clientHeight  - minSide ) /2 + "px" ;
    style.left =( viewElm.clientWidth  - minSide ) /2 + "px" ;

    // キャンバスにスタイルをセット
    [ style.position ,  style.boxSizing , style.border ]=
                [ "absolute" ,  "border-box" ,"0" ];
    style.padding = style.margin = "0 0 0 0";

    // 描画の原点をキャンバスの中心にセット
    context.translate( hankei , hankei );

    viewElm.appendChild( cvs );

    // context.scale(0.25,0.25)
    cvs.addEventListener('click', clickHandler, false);

    return { hankei:hankei , context : context };
};

const centerCircleData = {
    hankei:10,          // 円の半径
    width:4,            // 線の太さ
    lineColor: "black", // 線色
    fillColor: "silver", // 塗りつぶし色
};
const centerCircle = ( context ) =>{
    const ctx = context;
    return () =>{
        ctx.lineWidth = 0;

        // 半径：centerCircleData.hankei の円を書く
        ctx.beginPath();
        ctx.fillStyle = centerCircleData.lineColor;
        ctx.arc( 0 , 0 , centerCircleData.hankei  , 0 , Math.PI * 2 );
        ctx.fill();

        // 半径：centerCircleData.hankei - centerCircleData.width の円を書く
        ctx.beginPath();
        ctx.fillStyle  = centerCircleData.fillColor;
        ctx.arc( 0 , 0 , centerCircleData.hankei - centerCircleData.width , 0 , Math.PI * 2 );
        ctx.fill();
    };
};
/*
* 文字盤描画データ
*/
const mojibanInfo ={
    borderWidth : 3,   // 外周の円の太さ
    borderColor: "#000",  // 外周の色
    line1:{             // 太い目盛り
        width: 5,       // 線幅
        height: 10      // 線の長さ
    },
    line2:{             // 細い目盛り
        width: 3,       // 線幅
        height: 5       // 線の長さ
    },
    text:{              // 数字
        dist:30,        // 数字の中心の外周からの距離
        color:"#000",   // 数字の色
        font:"bold 1.5em sans-serif"  // 数字のフォント
    }
};
/*
* 文字盤の描画
*/
const mojiban = ( context , hankei  ) =>{

    const ctx = context;

    // パスを記憶
    const memoriPath = ( hankei , type ) => {
        const linePath = new Path2D();
        linePath.lineWidth = type.width;
        linePath.moveTo( 0 , hankei );
        linePath.lineTo( 0 , hankei - type.height );
        return linePath;
    };

    return ( ) => {

        // 外側の円
        ctx.beginPath();
        ctx.strokeStyle = mojibanInfo.borderColor;
        ctx.fillStyle = mojibanInfo.text.color;
        ctx.lineWidth = mojibanInfo.borderWidth;
        ctx.arc( 0 , 0 , hankei - mojibanInfo.borderWidth / 2, 0, Math.PI * 2, true);
        ctx.stroke();

        // 目盛りの表示
        const topPos = hankei - mojibanInfo.borderWidth; // 外周分内側に置く
        const rotateAngle   = Math.PI * ( 360 / 60 ) / 180 ;  // 一目盛りの角度
        const line1 = memoriPath( topPos , mojibanInfo.line1);  // 太い線のパスを取得
        const line2 = memoriPath( topPos , mojibanInfo.line2);  // 細い線のパスを取得

        ctx.save();     // 回転させる前のコンテキストを保存

        for( let i = 0 ; i < 60 ; i ++ ){   // キャンバスを回転させながら目盛りを描く
            const line =  i % 5 === 0 ? line1 : line2;
            ctx.beginPath();
            ctx.stroke( line );
            ctx.rotate( rotateAngle );
        }
        ctx.restore();  // 保存したコンテキストを復元

        // 時刻文字の表示
        const r12  = 360 / 12;          // 一文字の角度
        const moziPos =  topPos - mojibanInfo.text.dist;
        const MathPi = Math.PI / 180;

        // 文字の基準位置・フォントを設定
        [ ctx.textAlign , ctx.textBaseline , ctx.font ] = [ "center" , "middle" , mojibanInfo.text.font ];

        for( let i = 0 ; i < 12 ; i ++){
            const deg = i * r12 * MathPi ;
            const [ mojiX , mojiY ] = [ moziPos * Math.sin( deg  ) , -moziPos * Math.cos( deg  ) ] ;

            ctx.fillText( i === 0 ? "12" : i.toString() , mojiX, mojiY );
        }
    };
};
/*
*  針のデータ
*/
const handDatas = {
    hour : {        // 時針
        width : 10 ,    // 幅
        color : "#00f", // 色
        LengthPer:55,   // 長さ（半径に対する割合)
        handGapPer:10,  // 反対側に飛び出る長さ（半径に対する割合)
        divNum:12 * 60  // 一周の分割数
    },
    minute : {        // 分針
        width : 10 ,
        color : "rgba(0, 64, 182, 1)",
        LengthPer:80,
        handGapPer:10,
        divNum:60
    },

    hourFirstBus : {        // 時針 最短バス
        width: 18 ,
        color: "#f00",
        LengthPer: 35,
        handGapPer: 8,
        divNum:12 * 60
    },
    minuteFirstBus : {        // 分針 最短バス
        width: 18 ,
        color: "rgba(211, 49, 0, 1)",
        LengthPer: 60,
        handGapPer: 8,
        divNum:60
    },
};
/*
* 針の描画をおこなうオブジェクト
 */
const handObj = function( handData , context , hankei ){
    this.handData = handData;
    this.rotateAngle = Math.PI * ( 360 / handData.divNum ) / 180;
    this.ctx = context;
    const topPos = hankei - mojibanInfo.borderWidth;

    // パスを作成
    const pathCtx = new Path2D();
    ({ width: pathCtx.lineWidth, color: pathCtx.strokeStyle } = handData);
    pathCtx.moveTo( 0 , - ( topPos * handData.LengthPer / 100 ));
    pathCtx.lineTo( 0 ,  topPos * handData.handGapPer / 100  );
    this.pathCtx = pathCtx;
};

handObj.prototype={

    rewrite : function ( val ) {

        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ({ width:ctx.lineWidth, color:ctx.strokeStyle } = this.handData);
        if( val !== 0 ){
            ctx.rotate( this.rotateAngle * val  );
        }
        ctx.stroke( this.pathCtx );
        ctx.restore();
    }
};

const renderClock = (hour, minute, hourFirstBus, minuteFirstBus) =>{
    // 時計を消去
    context.clearRect(-hankei , -hankei , sideLength , sideLength);
    // 時計を召喚
    mBan();
    hourHandFirstBus.rewrite( (hourFirstBus%12) * 60 + minuteFirstBus );
    minuteHandFirstBus.rewrite( minuteFirstBus );
    hourHand.rewrite( (hour%12) * 60 + minute );
    minuteHand.rewrite( minute );
    cCircle( );
}

// https://note.affi-sapo-sv.com/js-canvas-analog-clock.php より

const { context , hankei } =  initialCanvas("analog");
const cCircle = centerCircle( context );
const mBan = mojiban ( context , hankei );
const hourHand = new handObj( handDatas.hour , context , hankei );
const minuteHand = new handObj( handDatas.minute , context , hankei );
const hourHandFirstBus = new handObj( handDatas.hourFirstBus , context , hankei );
const minuteHandFirstBus = new handObj( handDatas.minuteFirstBus , context , hankei );

const sideLength = hankei * 2;

setInterval(()=> {
    update();
},1000);



const update = () =>{
    let h = -1;
    let m = -1;
    if (is_timeNow){
        const now = new Date();
        h = now.getHours();
        m = now.getMinutes();
        // const s = now.getSeconds();
        // const [h, m, s] = [6,21,0]
    }else{
        changeableClock
        h = changedHour;
        m = changedMinute;
    }


    dateTimeDisp.innerHTML = h+"時"+m+"分。";

    const firstThree = getFirstThree(getTimeStamp(h, m), stopTimes);
    const firstThree2 = getFirstThree(getTimeStamp(h, m), stopTimes2);

    if (typeof firstThree[0] === "undefined"){
        renderClock(h,m,0,0);
        FirstBusDisp.innerHTML = "明日出発";
    }else{
        firstBusMinute = getMinuteFromTimeStamp(firstThree[0][1])-getMinuteFromTimeStamp(getTimeStamp(h,m));
        FirstBusDisp.innerHTML = firstBusMinute+"分後出発";
        renderClock(h,m,parseInt(firstThree[0][1].substring(0, 2)), parseInt(firstThree[0][1].substring(2, 4)))
    }
    
    displayFirstThree(
        firstThree,
        firstBus,
        soonBus,
        " 発", "本日の駅行きバスは終了しました。",
        stopLinks
    );
    displayFirstThree(
        firstThree2,
        firstBus2,
        soonBus2,
        " へ駅から出発", "本日の<ruby>高専行きバス<rp>(</rp><rt>地獄への急行バス</rt><rp>)</rp></ruby> は終了しました。",
        stopLinks2
    );
}

update();
