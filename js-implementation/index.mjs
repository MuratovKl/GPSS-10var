import {time} from './time.mjs';
import {clientQueue} from "./queue.mjs";
// import {CarTransact} from './car.mjs';
import {exponential, uniform} from './generator.mjs';
import TrafficLight from './trafficLight.mjs';

// const xCoordGen = uniform('xcoord', 0, 100);
// const yCoordGen = uniform('ycoord', 0, 100);
// const carWay = async (carTransact) => {
//     console.log('taking load');
//     await carTransact.takeLoad();
//     let {value: x} = xCoordGen.next();
//     let {value: y} = yCoordGen.next();
//     x = Math.ceil(x);
//     y = Math.ceil(y);
//     console.log(`go to client ${x}, ${y}`);
//     await carTransact.goToClient({x: x, y: y});
//     console.log('deliver loading');
//     await carTransact.deliverLoad();
//     console.log('go back');
//     await carTransact.goBack();
// };

// const processNewOrder = async () => {
//     console.log('start processing');
//     await clientQueue.getCar();
//     console.log('got car');
//     const car = new CarTransact();
//     await carWay(car);
//     console.log('releasing');
//     await clientQueue.releaseCar();
// };

// const generateNewOrder = exponential('order', 2 * 60);

// time.addGenerator({gen: generateNewOrder, callback: processNewOrder});
// const timeoutIt = () => {
//     if (!time.tick()) {
//         setTimeout(timeoutIt, 30);
//     }
// };
// setTimeout(timeoutIt, 30);
const trafficLight = new TrafficLight();

let allCars = 0;

const processCar = async () => {
    allCars++;
    console.log('creating new car');
    await trafficLight.goCar();
};

const processMan = async () => {
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
    }
};
setTimeout(timeoutIt, 0);
