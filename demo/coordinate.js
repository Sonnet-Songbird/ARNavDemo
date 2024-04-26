function isInFov(bearing, fov, originLat, originLong, targetLat, targetLong) {

// 지리 좌표계 상의 상대 위치
    const dLat = targetLat - originLat;
    const dLon = targetLong - originLong;

// 쉬운 계산을 위해 라디안 데카르트 좌표계로 변환
    const dx = dLon * 111.32 * Math.cos((originLat + targetLat) / 2 * Math.PI / 180);
    const dy = dLat * 111.32;


    const targetAngle = Math.atan2(dy, dx) * 180.0 / Math.PI;

    const fovStart = bearing - (fov / 2);
    const fovEnd = bearing + (fov / 2);

    return (fovStart <= targetAngle && targetAngle <= fovEnd);
}
