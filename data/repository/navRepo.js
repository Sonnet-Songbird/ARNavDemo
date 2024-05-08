class Coordinate {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

const relativeCoordinate = {
    origin: new Coordinate(0, 0, 0)
    , getRelativeCoordinate(targetCoordinate) {
        const convertedX = Math.abs(this.origin.x - targetCoordinate.x)
        const convertedY = Math.abs(this.origin.y - targetCoordinate.y)
        const convertedZ = Math.abs(this.origin.z - targetCoordinate.z)
    }
    , setOrigin(coordinate) {
        this.origin = coordinate
    }
}

class pos {
    constructor(id, name, coordinate, type) {
        this.id = id;
        this.name = name;
        this.coordinate = coordinate;
        this.type = type
    }
    static type = {
        POI: "PoI" // 현실에 유의미한 관심지점
        , RELAY: "Relay" // 내비게이션을 위한 정적 가상 지점
        , DYNAMIC: "DYNAMIC" // 내비게이션을 위한 정적 관심 지점
    }
    get x() {
        return this.coordinate.x;
    }

    get y() {
        return this.coordinate.y;
    }

    get z() {
        return this.coordinate.z;
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
    }

    static restrict = {
        AB: "AtoB"
        , BA: "BtoA"
        , BOTH: "Both"
        , NONE: "None"
    }
    static trait = { // 요구에 따라 사용될 수도 있는 경로 특성. 현재는 미사용
        STAIR: "stair" // 계단을 통과 하는 경로는 피할 수 있음.
    }
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
}

const navRepo3D = {
    levelHeight: 3.9
    , posRepo: [
        {"id": 1, "name": "기준점", "x": 0, "y": 0, "z": 0}
        , {"id": 2, "name": "x100", "x": 100, "y": 0, "z": 0}
        , {"id": 3, "name": "x-100", "x": -100, "y": 0, "z": 0}
        , {"id": 4, "name": "y100", "x": 0, "y": 100, "z": 0}
        , {"id": 5, "name": "y-100", "x": 0, "y": -100, "z": 0}
        , {"id": 6, "name": "z2", "x": 0, "y": 0, "z": 2}
    ]
    , markerRepo: [
        {"id": 1, "name": "바코드1", "posId": 1},
        {"id": 2, "name": "바코드2", "posId": 2},
        {"id": 3, "name": "바코드3", "posId": 3},
        {"id": 4, "name": "바코드4", "posId": 4}
    ]
    , pathRepo: [
        new Path(1, "test", 2, 3, 0),
        new Path(2, "test", 3, 4, 0),
        new Path(3, "test", 4, 5, 0),
        new Path(4, "test", 5, 6, 0),
        new Path(5, "test", 3, 6, 0),
        new Path(6, "test", 2, 5, 0)
    ]

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
        const graph = new DijkstraGraph();
        this.posRepo.forEach(pos => {
            graph.addVertex(pos.id);
        });
        this.pathRepo.forEach(path => {
            graph.addEdge(path.posA, path.posB, path.pathLength(), path.restrict);
        });
        return graph.pathfinding(startPosId, endPosId)
    }
    , empty: function () {
        this.posRepo = []
        this.markerRepo = []
        this.pathRepo = []
    }
    , pushPos: function (name, x, y, z) {
        const id = this.posRepo.length + 1
        const pos = {
            "id": id
            , "name": `${name}`
            , "x": x
            , "y": y
            , "z": z
        }
        this.posRepo.push(pos)
        return id;
    }
    , pushPath: function (name, posA, posB) {
        const id = this.pathRepo.length + 1
        const path = new Path(id, `${name}`, posA, posB, 0);
        this.pathRepo.push(path);
        return path;
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

