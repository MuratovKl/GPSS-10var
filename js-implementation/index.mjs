import {time} from './time.mjs';
import {exponential} from './generator.mjs';
import TrafficLight from './trafficLight.mjs';

const trafficLight = new TrafficLight();

let allCars = 0;
let allMen = 0;

const processCar = async () => {
    allCars++;
    console.log('creating new car');
    await trafficLight.goCar();
};

const processMan = async () => {
    allMen++;
    console.log('creating new man');
    await trafficLight.goMan();
};


const peopleGenerator = exponential('people', 30);
const carsGenerator = exponential('cars', 2.4);

time.addGenerator({gen: peopleGenerator, callback: processMan});
time.addGenerator({gen: carsGenerator, callback: processCar});

let integralCarQueue = 0;
let integralManQueue = 0;

const timeoutIt = () => {
    const previousTime = time.time;
    const carQueueBeforeTick = trafficLight.carQueue.length;
    const manQueueBeforeTIck = trafficLight.peopleQueue.length;
    if (!time.tick()) {
        integralCarQueue += (trafficLight.carQueue.length + carQueueBeforeTick) / 2 * (time.time - previousTime);
        integralManQueue += (trafficLight.peopleQueue.length + manQueueBeforeTIck) / 2 * (time.time - previousTime);
        setTimeout(timeoutIt, 0);
    } else {
        console.log('AVERAGE CAR QUEUE LENGTH: ', integralCarQueue / time.time);
        console.log('AVERAGE MAN QUEUE LENGTH: ', integralManQueue / time.time);
        console.log('ALL CARS: ', allCars);
        console.log('ALL MEN: ', allMen);
    }
};
setTimeout(timeoutIt, 0);
