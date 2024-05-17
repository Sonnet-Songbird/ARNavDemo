// A-Frame에 반영할 때의 상대 거리는 상수를 받아서 그걸 기준으로 축적을 바꾸도록
// 시작 지점은 직접 선택 하면 됨.

const ctx = function(selector){
    const canvas = document.querySelector(selector)
    return canvas.getContext('webgl');
}

function calcDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6378.137;
    const deltaLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    const deltaLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    const haversine =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    const distance = earthRadius * centralAngle;
    return distance * 1000; // meters
}


