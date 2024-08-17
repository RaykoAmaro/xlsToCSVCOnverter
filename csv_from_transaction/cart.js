/**
 * your task is to simulate a shopping cart, where the entry is a list of user actions described as follow
 * {
 *   type: "add" | "remove"
 *   product: "<nane of the product>"
 * }
 * being the output of this process the list of producs and their quantity such as
 * [
 *   {product: 'chepo', qty: 2},
 *   {product: 'soap', qty: 1}
 * ]
 * and also the end price of the whole cart, based on a product price table
 * - please add a 10% discount to the products with more than 3 items
 */

const orders = [
  { type: "add", product: "chepo" },
  { type: "add", product: "lechuga" },
  { type: "remove", product: "chepo" },
  { type: "add", product: "chepo" },
  { type: "add", product: "chepo" },
  { type: "add", product: "malanga" },
];

const inventory = orders.reduce((partialInventory, order) => {
  const { type, product } = order;

  if (partialInventory.hasOwnProperty(product)) {
    partialInventory[product] += type === "add" ? 1 : -1;
  } else {
    partialInventory[product] = 1;
  }

  return partialInventory;
}, {});

const priceTable = {
  chepo: 10,
  lechuga: 15,
};

//Functions usage examples
//Map
const numbers = [3, -1, 1, 4, 1, 5, 9, 2, 6];
const filteredNumbers = numbers.filter((x) => x > 0);
const averaged = filteredNumbers.map((num, index, arr) => {
  const previous = arr[index - 1];
  const next = arr[index + 1];
  let cont = 1;
  let total = num;
  if (previous != undefined) {
    cont++;
    total += previous;
  }
  if (next != undefined) {
    cont++;
    total += next;
  }
  const average = total / cont;
  const fitAverage = Math.round(average * 100) / 100;
  return fitAverage;
});

//filter
const persons = [
  { name: "ricardo", id: "1234" },
  { name: "roberto", id: "0534" },
  { name: "roberto", id: "1234" },
  { name: "saturnino", id: "1564" },
  { name: "ricardo", id: "1264" },
];

const filteredPersons = persons.filter((x) => {
  if (x.name != "roberto") {
    return x;
  }
});

const mappedPersons = filteredPersons.map((x) => "id: " + x.id);

//Reduce (calcule the total value o a property)
const donors = [
  { name: "facundo", cash: 20 },
  { name: "rodriguez", cash: 32 },
  { name: "carlos", cash: 5 },
];

const totalCash = donors.reduce((acumulator, donor, index) => {
  return acumulator + donor.cash;
}, 0);

const majoritaryDonor = donors.reduce((acum, donor) => {
  if (donor.cash > acum.cash) {
    acum = donor;
  }
  return acum;
}, donors[0]);
//console.log(majoritaryDonor);

const donadores = [
  { nombre: "Juan", cantidadDonada: 100 },
  { nombre: "Ana", cantidadDonada: 200 },
  { nombre: "Luis", cantidadDonada: 150 },
  { nombre: "Pedro", cantidadDonada: 250 },
];

const mayorDonador = donadores.reduce((max, donador) => {
  return donador.cantidadDonada > max.cantidadDonada ? donador : max;
}, donadores[0]);

//console.log(mayorDonador);

//count how many times a value appears
const fruits = [
  "manzana",
  "banano",
  "limón",
  "manzana",
  "limón",
  "coco",
  "banano",
  "limón",
];

const counter = fruits.reduce((acumulator, fruit) => {
  if (!acumulator.hasOwnProperty(fruit)) {
    acumulator[fruit] = 1;
  } else {
    acumulator[fruit]++;
  }
  return acumulator;
}, {});

//Obtain the max value in an array
const values = [0, 2, 4, 500, 5, -2, -6, -1000, 2000];
const maxNumberFunction = values.reduce((maxNumber, value) => {
  if (value > maxNumber) {
    maxNumber = value;
  }
  return maxNumber;
}, Number.NEGATIVE_INFINITY);

//console.log(maxNumberFunction);

function modify(input) {
  input += 2;
  //console.log(input);
}

function modifyObject(input) {
  input.modified = true;
  //console.log("changed object: ", input);
}

let str = "pepito";
modify(str);
//console.log(str);

let person = { name: "Roberto", jama: "chepo con azuca" };

function modify(input) {
  const interalInput = structuredClone(input);
  interalInput.jama = "sudor de tigre";
  return interalInput;
}

let other = modify(person);
