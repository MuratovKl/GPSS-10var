import seedrandom from 'seedrandom';

function* u01(seed) {
    const random = seedrandom(seed);
    while (true) {
        yield random();
    }
}

function* exponential(seed, mean) {
    const rand01gen = u01(seed);
    while (true) {
        const {value: rand} = rand01gen.next();
        yield -Math.log(rand) * mean;
    }
}

export {u01, exponential};
