// A-Frame에 반영할 때의 상대 거리는 상수를 받아서 그걸 기준으로 축적을 바꾸도록
// 시작 지점은 직접 선택 하면 됨.

const ctx = function(selector){
    const canvas = document.querySelector(selector)
    return canvas.getContext('webgl');
}
