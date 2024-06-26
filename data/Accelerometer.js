// store current rotation in euler angles
let rotation = {
    alpha: 0, beta: 0, gamma: 0
};

// store whole history of acceleration and implied velocity and position,
// starting from these initial conditions
const z = [
    {
        position: 0,
        velocity: 0,
        acceleration: 0,
        time: undefined
    }
];

// visualize motion through a box
const phone = d3.select('#phone');

window.addEventListener('devicemotion', handleMotion);
window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('mousemove', handleMousemove);

d3.interval(getAccelerData, 500);

// not the focus here, but it also shows rotation!
function handleOrientation(e) {
    if (e.gamma === null || e.beta === null || e.alpha === null) return;
    rotation = {
        gamma: e.gamma || 0,
        beta: e.beta || 0,
        alpha: e.alpha || 0
    }
}

// accelerate according to z-axis device motion
function handleMotion(e) {
    if (e.acceleration.x === null || e.acceleration.y === null || e.acceleration.z === null) return;
    accelerate(e.acceleration.z, e.timeStamp);
}

// for testing on desktop, basically: map horizontal mouse position to acceleration
function handleMousemove(e) {
    var mouseAccelerator = d3.scaleLinear()
        .domain([0, innerWidth])
        .range([-.2, .2]);
    accelerate(mouseAccelerator(e.pageX), e.timeStamp);
    console.log(mouseAccelerator(e.pageX));
}

// step forward with new acceleration, applying some very crude filtering & friction
function accelerate(a, t) {

    var newZ = Object.assign({}, z[0]);

    newZ.acceleration = Math.abs(a) > .1 ? a : 0; // noise filter
    newZ.time = t;
    newZ = eulerStep(z[0], newZ);

    newZ.velocity *= .9; // friction
    newZ.velocity = Math.abs(newZ.velocity) < .01 ? 0 : newZ.velocity; // noise filter
    newZ.position *= .999; // tend back to zero

    z.unshift(newZ);
}

// euler double integration
function eulerStep(state0, state1) {
    var interval = (state1.time - state0.time) / 1000; // convert ms to s
    if (interval) {
        state1.position = state0.position + state0.velocity * interval;
        state1.velocity = state0.velocity + state0.acceleration * interval;
    }
    return Object.assign({}, state1);
}

// transform lil box representing your phone
function renderState() {
    phone.style('transform', ''
        // + 'rotateZ('+rotation.alpha+'deg) '
        + 'rotateX(' + rotation.beta + 'deg) '
        + 'rotateY(' + rotation.gamma + 'deg) '
        + 'translate3d(' + 0 + 'px,' + 0 + 'px,' + (-z[0].position * 1000) + 'px)'
    );
}

// draw graph
function getAccelerData() {

    // draw three lines: x, dx, ddx
    const data = ['position', 'velocity', 'acceleration'].map(function (d, i) {
        return z.filter(function (dd) {
            return dd.time;
        }).map(function (dd, ii) {
            return {
                'value': dd[d],
                'time': dd.time
            }
        });
    });




// store current rotation in euler angles
    var rotation = {
        alpha: 0, beta: 0, gamma: 0
    };

// store whole history of acceleration and implied velocity and position,
// starting from these initial conditions
    var z = [
        {
            position: 0,
            velocity: 0,
            acceleration: 0,
            time: undefined
        }
    ];

// visualize motion through a box
    var phone = d3.select('#phone');

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMousemove);

    d3.timer(renderState);
    d3.interval(renderHistory, 500);

// not the focus here, but it also shows rotation!
    function handleOrientation(e) {
        if(e.gamma === null || e.beta === null || e.alpha === null) return;
        rotation = {
            gamma: e.gamma || 0,
            beta: e.beta || 0,
            alpha: e.alpha || 0
        }
    }

// accelerate according to z-axis device motion
    function handleMotion(e) {
        if(e.acceleration.x === null || e.acceleration.y === null || e.acceleration.z === null) return;
        accelerate(e.acceleration.z, e.timeStamp);
    }

// for testing on desktop, basically: map horizontal mouse position to acceleration
    function handleMousemove(e) {
        var mouseAccelerator = d3.scaleLinear()
            .domain([0,innerWidth])
            .range([-.2,.2]);
        accelerate(mouseAccelerator(e.pageX), e.timeStamp);
        console.log(mouseAccelerator(e.pageX));
    }

// step forward with new acceleration, applying some very crude filtering & friction
    function accelerate(a, t) {

        var newZ = Object.assign({}, z[0]);

        newZ.acceleration = Math.abs(a) > .1 ? a : 0; // noise filter
        newZ.time = t;
        newZ = eulerStep(z[0], newZ);

        newZ.velocity *= .9; // friction
        newZ.velocity = Math.abs(newZ.velocity) < .01 ? 0 : newZ.velocity; // noise filter
        newZ.position *= .999; // tend back to zero

        z.unshift(newZ);
    }

// euler double integration
    function eulerStep(state0, state1) {
        var interval = (state1.time - state0.time) / 1000; // convert ms to s
        if(interval) {
            state1.position = state0.position + state0.velocity * interval;
            state1.velocity = state0.velocity + state0.acceleration * interval;
        }
        return Object.assign({}, state1);
    }

// transform lil box representing your phone
    function renderState() {
        phone.style('transform', ''
            // + 'rotateZ('+rotation.alpha+'deg) '
            + 'rotateX('+rotation.beta+'deg) '
            + 'rotateY('+rotation.gamma+'deg) '
            + 'translate3d('+0+'px,'+0+'px,'+(-z[0].position*1000)+'px)'
        );
    }

// draw graph
    function renderHistory() {

        // draw three lines: x, dx, ddx
        var data = ['position','velocity','acceleration'].map(function(d,i) {
            return z.filter(function(dd) { return dd.time; }).map(function(dd,ii) {
                return {
                    'value': dd[d],
                    'time': dd.time
                }
            });
        });

        var svg = d3.select('svg');

        var x = d3.scaleLinear()
            .domain(d3.extent(d3.merge(data), function(d) { return d.time; }))
            .range([0,svg.node().getBoundingClientRect().width]);

        var y = d3.scaleLinear()
            .domain(d3.extent(d3.merge(data), function(d) { return d.value; }))
            .range([0,svg.node().getBoundingClientRect().height]);

        var line = d3.line()
            .x(function(d,i) { return x(d.time); })
            .y(function(d,i) { return y(d.value); });

        var path = svg.selectAll('path')
            .data(data);

        path.enter().append('path')
            .style('stroke', function(d,i) {
                var colors = {
                    0: 'red', 	//position
                    1: 'green',	//velocity
                    2: 'blue'		//acceleration
                }
                return colors[i];
            });

        path.attr('d', line);

    }
}
