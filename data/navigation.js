class Path {
    constructor(id, name, posA, posB, restrict) {
        this.id = id;
        this.name = name;
        this.posA = posA;
        this.posB = posB;
        this.restrict = restrict; // 0 : 양방향 가능; 1: A to B; 2: B to A; 3 어느 쪽도 불가
    }

    pathLength() {
        return Math.hypot(this.posA - this.posB, this.posA - this.posB);
    }
}

function addRandomPos(count) {
    for (let i = 0; i < count; i++) {
        const repo = navRepo.posRepo
        const id = repo.length + 1
        const pos = {
            "id": id,
            "name": `random ${count}`,
            "x": (Math.floor(Math.random() * 201 - 100) / 20) * 50,
            "y": (Math.floor(Math.random() * 201 - 100) / 20) * 50,
            "z": 0,
            "restrict": 0
        }
        repo.push(pos)
    }
}

function addRandomPath(count) {
    for (let i = 0; i < count; i++) {
        const repo = navRepo.pathRepo
        const id = repo.length + 1
        const path = new Path(id, `random ${count}`, Math.floor(Math.random() * navRepo.posRepo.length + 1), Math.floor(Math.random() * navRepo.posRepo.length + 1));
        if (path.posA !== path.posB) {
            repo.push(path);
        }
    }
}

// 예시 사용법
const navRepo = {
    //상수부
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
        const foundMarker = navRepo.markerRepo.find(marker => marker.id === markerId);
        if (!foundMarker) return null; // 마커가 없으면 null 반환
        return navRepo.posRepo.find(pos => pos.id === foundMarker.posId);
    }
    , findPosById: function (Id) {
        return navRepo.posRepo.find(pos => pos.id === Id);
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

