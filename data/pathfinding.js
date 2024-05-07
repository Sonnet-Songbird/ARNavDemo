const findShortestPath = (function() {
    return function(startPosId, endPosId) {
        return navRepo.pathfinding(startPosId, endPosId);
    };
})();

const drawShortestPath = (function() {
    return function(startPosId, endPosId) {
        const path = findShortestPath(startPosId, endPosId);
        if (path.length === 0) {
            return false;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRouteAnimated(path, "red", 3, 2000);
        return true;
    };
})();

const drawAllRoutes = (function() {
    return function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        navRepo.pathRepo.forEach(function(route) {
            drawRoute([route.posA, route.posB], "black", 1);
        });
    };
})();

const toCoordinate = (function() {
    return function(posId) {
        const position = navRepo.posRepo.find(function(pos) {
            return pos.id === posId;
        });
        return position ? { x: position.x * 50 + 400, y: position.y * 50 + 300 } : null;
    };
})();

const drawRoute = (function() {
    return function(path, color, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;

        ctx.beginPath();
        for (let i = 0; i < path.length - 1; i++) {
            const startPos = toCoordinate(path[i]);
            const endPos = toCoordinate(path[i + 1]);
            if (startPos && endPos) {
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(endPos.x, endPos.y);
            }
        }
        ctx.stroke();
    };
})();

const drawPartialRoute = (function() {
    return function(startPos, endPos, color, width, partialLength) {
        const segmentLength = Math.sqrt((endPos.x - startPos.x) ** 2 + (endPos.y - startPos.y) ** 2);
        const ratio = partialLength / segmentLength;
        const partialEndX = startPos.x + (endPos.x - startPos.x) * ratio;
        const partialEndY = startPos.y + (endPos.y - startPos.y) * ratio;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(partialEndX, partialEndY);
        ctx.stroke();
    };
})();

const drawRouteAnimated = (function() {
    return function(path, color, width, duration) {
        let startTime = null;
        const totalLength = calcLength(path);
        const animateDraw = function(currentTime) {
            if (!startTime) startTime = currentTime;
            let progress = Math.min(1, (currentTime - startTime) / duration);
            const partialLength = progress * totalLength;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawAllRoutes();
            let remainingLength = partialLength;
            for (let i = 0; i < path.length - 1; i++) {
                const startPos = toCoordinate(path[i]);
                const endPos = toCoordinate(path[i + 1]);
                const segmentLength = calcLength([path[i], path[i + 1]]);
                if (remainingLength >= segmentLength) {
                    drawPartialRoute(startPos, endPos, color, width, segmentLength);
                    remainingLength -= segmentLength;
                } else {
                    const ratio = remainingLength / segmentLength;
                    const partialEndPos = {
                        x: startPos.x + (endPos.x - startPos.x) * ratio,
                        y: startPos.y + (endPos.y - startPos.y) * ratio
                    };
                    drawPartialRoute(startPos, partialEndPos, color, width, remainingLength);
                    break;
                }
            }
            if (progress < 1) {
                requestAnimationFrame(animateDraw);
            }
        };
        requestAnimationFrame(animateDraw);
    };
})();

const calcLength = (function() {
    return function(path) {
        let totalLength = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const startPos = toCoordinate(path[i]);
            const endPos = toCoordinate(path[i + 1]);
            if (startPos && endPos) {
                totalLength += Math.sqrt((endPos.x - startPos.x) ** 2 + (endPos.y - startPos.y) ** 2);
            }
        }
        return totalLength;
    };
})();
