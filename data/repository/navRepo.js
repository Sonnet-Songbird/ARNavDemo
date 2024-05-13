const navRepo3D = {
    levelHeight: 3.9
    , posRepo: []
    , markerRepo: []
    , pathRepo: []

    //함수부
    , findPosByMarkerId: function (markerId) {
        const foundMarker = navRepo2D.markerRepo.find(marker => marker.id === markerId);
        if (!foundMarker) return null; // 마커가 없으면 null 반환
        return navRepo2D.posRepo.find(pos => pos.id === foundMarker.posId);
    }
    , findPosById: function (Id) {
        return navRepo2D.posRepo.find(pos => pos.id === Id);
    }
    , pathfinding: function (startPosId, endPosId) {
    }
    , empty: function () {
        this.posRepo = []
        this.markerRepo = []
        this.pathRepo = []
    }
}

class repoInserter {
    constructor() {
        this.poiDict = {}
        this.relayDict = {}
        this.pathDict = []
    }

    addPoi(key, name, x, y, z = 0) {
        this.poiDict[key] = new Pos(navRepo3D.posRepo + 1, name, x, y, z, Pos.type.POI);
        return this.poiDict[key]
    }

    addRelay(key, name, x, y, z = 0) {
        this.relayDict[key] = new Pos(navRepo3D.posRepo + 1, name, x, y, z, Pos.type.RELAY);
        return this.poiDict[key]
    }

    addPath(aKey, bKey, restrict = Path.restrict.BOTH) {
        this.pathDict.push({aKey: aKey, bKey: bKey, restrict: restrict})
    }

    pathFromDict(path) {
        const aPos = this.poiDict[path.aKey]
        const bPos = this.poiDict[path.bKey]
        const name = `${aPos.name}:${bPos.name}${path.restrict}`
        return new Path(navRepo3D.posRepo + 1, name, aPos, bPos, path.restrict)
    }

    update() {
        this.poiDict.forEach(pos => {
            navRepo3D.posRepo.push(pos);
        })
        this.relayDict.forEach(pos => {
            navRepo3D.posRepo.push(pos);
        })
        this.pathDict.forEach(path => {
            navRepo3D.path.push(this.pathFromDict(path));
        })
    }
}

class Coordinate {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static origin = new Coordinate(0, 0, 0)

    static setOrigin(coordinate) {
        this.origin = coordinate
    }

    getDistance(axis) {
        return Math.abs(Coordinate.origin[axis] - this[axis]);
    }
}

class Pos {
    constructor(id, name, type, x, y, z) {
        this.id = id;
        this.name = name;
        this.type = type
        this.coordinate = new Coordinate(x, y, z);
    }

    static type = Object.freeze({
        POI: "PoI" // 현실에서 유의미한 관심지점
        , RELAY: "Relay" // 내비게이션을 위한 정적 가상 지점
        , DYNAMIC: "Dynamic" // 내비게이션을 위한 동적 관심 지점.
    })

    get x() {
        return this.coordinate.x;
    }

    get y() {
        return this.coordinate.y;
    }

    get z() {
        return this.coordinate.z;
    }

    get dx() {
        return this.coordinate.getDistance('x');
    }

    get dy() {
        return this.coordinate.getDistance('y');
    }

    get dz() {
        return this.coordinate.getDistance('z');
    }

    equals(target) {
        return this.id === target.id;
    }
}

/*
poi와 relay는 모두 pos가 될 수 있음.
* */
class Path {
    constructor(id, name, posA, posB, restrict) {
        this.id = id;
        this.name = name;
        this.posA = posA;
        this.posB = posB;
        this.restrict = restrict;
        return this;
    }

    static makePath(id, name, posA, posB, restrict) {
        const newPath = new Path(id, name, posA, posB, restrict);
        const existingPath = navRepo3D.pathRepo.find(path => path.equals(newPath));
        if (existingPath) {
            return existingPath;
        } else return newPath
    }

    static restrict = Object.freeze({
        AB: "AtoB"
        , BA: "BtoA"
        , BOTH: "Both"
        , NONE: "None"
    })
    static trait = Object.freeze({ // 요구에 따라 사용될 수도 있는 경로 특성. 현재는 미사용
        STAIR: "stair" // 계단을 통과 하는 경로를 피할 수 있음.
    })

    equals(target) {
        //정순이나 역순으로 동일한 pos일 경우
        return this.posA.equals(target.posA) && this.posB.equals(target.posB) || this.posB.equals(target.posA) && this.posA.equals(target.posB);
    }

    pathLength() {
        if (this.restrict === Path.restrict.NONE) {
            return Infinity;
        }
        return Math.hypot(this.posA.x - this.posB.x, this.posA.y - this.posB.y);
    }

    dPathLength() {
        if (this.restrict === Path.restrict.NONE) {
            return Infinity;
        }
        return Math.hypot(this.posA.dx - this.posB.dx, this.posA.dy - this.posB.dy);
    }
}

class DijkstraGraph {
    constructor() {
        this.adjacencyList = [];
    }

    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
    }

    addEdge(vertex1, vertex2, weight, restrict) {
        if (restrict === 3)
            return
        if (restrict !== 2) {
            this.adjacencyList[vertex1].push({node: vertex2, weight})
        }
        if (restrict !== 1) {
            this.adjacencyList[vertex2].push({node: vertex1, weight})
        }
    }


    pathfinding(start, finish) {
        const nodes = new PriorityQueue();
        nodes.enqueue(start, 0);
        const distances = {};
        const previous = {};
        const path = [];
        let nextVertex;

        for (const vertex in this.adjacencyList) {
            if (Number(vertex) === start) {
                distances[vertex] = 0;
            } else {
                distances[vertex] = Infinity;
            }
            previous[vertex] = null;
        }
        while (true) {
            if (nodes.isEmpty()) {
                return []
            }
            nextVertex = nodes.dequeue().id;
            if (nextVertex === finish) {
                while (previous[nextVertex]) {
                    path.push(nextVertex);
                    nextVertex = previous[nextVertex];
                }
                break;
            } else {
                for (const neighbor in this.adjacencyList[nextVertex]) {
                    const nextNode = this.adjacencyList[nextVertex][neighbor];
                    const candidate = distances[nextVertex] + nextNode.weight;
                    const nextNeighbor = nextNode.node;
                    if (candidate < distances[nextNeighbor]) {
                        distances[nextNeighbor] = candidate;
                        previous[nextNeighbor] = nextVertex;
                        nodes.enqueue(nextNeighbor, candidate);
                    }
                }
            }
        }
        return path.concat(nextVertex).reverse();
    }
}

class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(id, weight) {
        this.queue.push({id, weight});
        this.sort();
    }

    dequeue() {
        return this.queue.shift();
    }

    sort() {
        this.queue.sort((a, b) => a.weight - b.weight);
    }

    isEmpty() {
        return this.queue.length === 0
    }
}

