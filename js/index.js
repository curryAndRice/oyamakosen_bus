
//  K13 高専正門 Kosen Seimon 17:19 19:14
//  中久喜２丁目 Nakakuki-nichome 7:23 9:03 11:18 13:58 15:58
//  J23 高専正門 Kosen Seimon 6:00 6:45 8:05 9:15 10:15 11:15 12:15 14:35 15:35 16:40 17:50 19:00 20:05
//  東光 小山高専入口 ["0558","0633","0653","0733","0813","0833","0908","0933","1008","1033","1143","1213","1238","1308","1408","1438","1503","1533","1603","1633","1703","1733","1803 ","1833","1943","2013","2038","2108"]

//対象のバス停の名前
const stopNames = {
    0:"【高岳線】小山高専入口",
    1:"【城東中久喜線】高専正門",
    2:"【桑東部絹路線 右回り】高専正門", 
    3:"【桑東部絹路線 左回り】中久喜２丁目",
} ;

//対象のバス停に止まる時間
const stopTimes = {
    0:["0558","0633","0653","0733","0813","0833","0908","0933","1008","1033","1143","1213","1238","1308","1408","1438","1503","1533","1603","1633","1703","1733","1803 ","1833","1943","2013","2038","2108"],
    1:["0600", "0645", "0805", "0915", "1015", "1115", "1215", "1435", "1535", "1640", "1750", "1900", "2005"],
    2:["1719", "1914"],
    3:["0723", "0903", "1118", "1358", "1558"],
}

const dateTimeDisp = document.getElementById("DateTimeDisp");

const timeStamp = document.getElementById("TimeStamp");

const updateButton = document.getElementById("UpdateButton");

const soonBus = document.getElementById("SoonBus");

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
const getFirstThree = (time_stamp) => {
    let fastestIndex = {};
    let fastTime = [];
    for (let key in stopNames){
        fastestIndex[key] = bisect(time_stamp, stopTimes[key]);
    }

    for (let key in stopNames){
        for (let i = fastestIndex[key]; i<stopTimes[key].length; i++){
            fastTime.push([key, (stopTimes[key][i])])
        }
    }
    fastTime.sort((a,b) => a[1] - b[1])
    return [fastTime[0], fastTime[1], fastTime[2]]
}

const update = () =>{
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // const [h, m, s] = [6,30,0]

    const firstThree = getFirstThree(getTimeStamp(h, m))

    let soonText = ""

    for (let i=0; i<3; i++){
        if (firstThree[i] === undefined){
            break;
        }
        soonText+=firstThree[i][1]
        soonText+=" に "
        soonText+=stopNames[firstThree[i][0]]
        soonText+=" 発<br>"
    }

    dateTimeDisp.innerHTML = h+"時"+m+"分"+s+"秒";
    timeStamp.innerHTML = getTimeStamp(h, m);
    soonBus.innerHTML = soonText
}

update()
