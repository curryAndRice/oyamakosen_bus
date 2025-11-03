//対象のバス停の名前
const stopNames = {
    0:"【高岳線】小山高専入口",
    1:"【城東中久喜線】高専正門",
    2:"【桑東部絹路線 右回り】高専正門", 
    3:"【桑東部絹路線 左回り】中久喜２丁目",
};

//対象のバス停に止まる時間(高専 → 駅)
const stopTimes = {
    0:["0558","0633","0653","0733","0813","0833","0908","0933","1008","1033","1143","1213","1238","1308","1408","1438","1503","1533","1603","1633","1703","1733","1803 ","1833","1943","2013","2038","2108"],
    1:["0600", "0645", "0805", "0915", "1015", "1115", "1215", "1435", "1535", "1640", "1750", "1900", "2005"],
    2:["1719", "1914"],
    3:["0723", "0903", "1118", "1358", "1558"],
};

//対象のバス停に止まる時間(駅→高専)
const stopTimes2 = {
    0:["0630","0707","0745","0757","0835","0900","0935","1000","1030","1100","1205","1235","1300","1330","1430","1500","1530","1600","1630","1705","1730","1800","1830 ","1900","2005","2035","2100","2150"],
    1:["0620", "0740", "0850", "0950", "1050", "1150", "1410", "1510", "1610", "1720", "1830", "1940", "2040"],
    2:["1625", "1820"],
    3:["0615", "0755", "1010", "1250", "1450"],
};

const dateTimeDisp = document.getElementById("DateTimeDisp");
const timeStamp = document.getElementById("TimeStamp");
const updateButton = document.getElementById("UpdateButton");

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

const displayFirstThree = (firstThreeData, firstElement, soonElement, appendText) => {
    let firstText = firstThreeData[0][1]+" に "+stopNames[firstThreeData[0][0]]+appendText;
    firstElement.innerHTML = firstText;
    let soonText = "";
    for (let i=1; i<3; i++){
        if (firstThreeData[i] === undefined){
            break;
        }
        soonText+=firstThreeData[i][1];
        soonText+=" に ";
        soonText+=stopNames[firstThreeData[i][0]];
        soonText+=appendText;
        soonText+="<br>";
    }
    soonElement.innerHTML = soonText;
}

const update = () =>{
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // const [h, m, s] = [6,30,0]
    dateTimeDisp.innerHTML = h+"時"+m+"分です。";

    const firstThree = getFirstThree(getTimeStamp(h, m), stopTimes);
    const firstThree2 = getFirstThree(getTimeStamp(h, m), stopTimes2);

    displayFirstThree(firstThree, firstBus, soonBus, " 発");
    displayFirstThree(firstThree2, firstBus2, soonBus2, " へ駅から出発");
}

update();
