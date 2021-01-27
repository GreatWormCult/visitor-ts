import test from "ava";

import { DefaultHandler, Handlers, Visitor } from "./visitor";

interface Worker {
    name: "worker";
    completedTasks: number
}

interface Manager {
    name: "manager";
    completedProjects: number;
}

interface Boss {
    name: "boss";
}

type Employee = Worker | Manager | Boss;

interface NormalPayment {
    name: "normalPayment";
    amount: number;
}

interface PaymentWithBonus {
    name: "paymentWithBonus";
    amount: number;
    bonusAmount: number;
}

interface NoPayment {
    name: "noPayment"
}

type Payment = NormalPayment | PaymentWithBonus | NoPayment;

class PaymentCalculator implements Handlers<Worker | Manager>, DefaultHandler<Employee> {

    worker(worker: Worker): NormalPayment {
        return { name: "normalPayment", amount: worker.completedTasks * 10 };
    }

    manager(manager: Manager): PaymentWithBonus {
        return { name: "paymentWithBonus", amount: 100, bonusAmount: manager.completedProjects }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default(_: Employee): NoPayment {
        return { name: "noPayment" }
    }
}

const paymentCalculator = new PaymentCalculator();
const visitor = new Visitor(paymentCalculator, "default", "name");

const worker: Worker = { name: "worker", completedTasks: 5 };
const normalPayment: NormalPayment = { name: "normalPayment", amount: 50 };
const manager: Manager = { name: "manager", completedProjects: 5 };
const paymentWithBonus: PaymentWithBonus = { name: "paymentWithBonus", amount: 100, bonusAmount: 5 };
const boss: Boss = { name: "boss" };
const noPayment: NoPayment = { name: "noPayment" }

test('payment of worker', t => t.deepEqual<NormalPayment>(visitor.one(worker), normalPayment));
test('payment of manger', t => t.deepEqual<PaymentWithBonus>(visitor.one(manager), paymentWithBonus));
test('payment of [worker, manager]', t => t.deepEqual<NormalPayment>(visitor.one([worker, manager]), normalPayment));
test('payment of [employee]', t => t.deepEqual<Payment>(visitor.one([manager] as [Employee]), paymentWithBonus));
test('payment of employee[]', t => t.deepEqual<Payment | undefined>(visitor.one([manager] as Employee[]), paymentWithBonus));
test('payment of worker | undefined', t => t.deepEqual<NormalPayment | undefined>(
    visitor.one(undefined as Worker | undefined),
    undefined
));

test('all payments of worker[]', t => t.deepEqual<NormalPayment[]>(
    visitor.all([worker, worker]),
    [normalPayment, normalPayment]
));
test('all payments of employee[]', t => t.deepEqual<Payment[]>(
    visitor.all([worker, manager, boss]),
    [normalPayment, paymentWithBonus, noPayment]
));

const tester = {
    tester(val: string) {
        return val;
    }
}

const testerVisitor = new Visitor(tester, "default", "funName", "val");
testerVisitor.one({funName: "tester", val: "A"})

// function canculatePayment(e: Employee) {
//     switch(e.name) {
//         case "worker":
//             return normalPayment as NormalPayment
//         case "manager":
//             return paymentWithBonus as PaymentWithBonus;
//         default:
//             return noPayment as NoPayment
//     }
// }

// const payment = canculatePayment(manager);

