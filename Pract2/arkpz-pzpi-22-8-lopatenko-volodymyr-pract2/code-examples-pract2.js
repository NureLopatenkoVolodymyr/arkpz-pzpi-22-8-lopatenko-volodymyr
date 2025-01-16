// --- Tease Apart Inheritance ---

// Код до рефакторингу
// Клас "Report" генерує звіти у різних форматах, логіка яких змішується.
class Report {
    constructor(data) {
      this.data = data;
    }
  
    generate(format) {
      if (format === 'PDF') {
        console.log('Generating PDF...');
        // Логіка для PDF
      } else if (format === 'HTML') {
        console.log('Generating HTML...');
        // Логіка для HTML
      }
    }
  }
  
  const report = new Report(myData);
  report.generate('PDF');
  
  // Код після рефакторингу
  // Відповідальність за генерацію звіту передано спеціалізованим класам.
  class Report {
    constructor(data, generator) {
      this.data = data;
      this.generator = generator;
    }
  
    generate() {
      this.generator.generate(this.data);
    }
  }
  
  class PDFGenerator {
    generate(data) {
      console.log('Generating PDF with data:', data);
      // Логіка для PDF
    }
  }
  
  class HTMLGenerator {
    generate(data) {
      console.log('Generating HTML with data:', data);
      // Логіка для HTML
    }
  }
  
  const pdfReport = new Report(myData, new PDFGenerator());
  pdfReport.generate();
  
  // --- Replace Type Code with State/Strategy ---
  
  // Код до рефакторингу
  // Умовна логіка визначає тип співробітника і розраховує оплату.
  class Employee {
    constructor(type) {
      this.type = type;
    }
  
    calculatePay(hoursWorked) {
      if (this.type === 'hourly') {
        return hoursWorked * 20; // Погодинна оплата
      } else if (this.type === 'salaried') {
        return 3000; // Фіксована зарплата
      }
    }
  }
  
  const employee = new Employee('hourly');
  console.log(employee.calculatePay(40));
  
  // Код після рефакторингу
  // Логіка типів оплати передана окремим класам стратегій.
  class Employee {
    constructor(payStrategy) {
      this.payStrategy = payStrategy;
    }
  
    calculatePay(hoursWorked) {
      return this.payStrategy.calculate(hoursWorked);
    }
  }
  
  class HourlyPay {
    calculate(hoursWorked) {
      return hoursWorked * 20;
    }
  }
  
  class SalariedPay {
    calculate() {
      return 3000;
    }
  }
  
  const hourlyEmployee = new Employee(new HourlyPay());
  console.log(hourlyEmployee.calculatePay(40)); // 800
  
  const salariedEmployee = new Employee(new SalariedPay());
  console.log(salariedEmployee.calculatePay()); // 3000
  
  // --- Separate Query from Modifier ---
  
  // Код до рефакторингу
  // Метод одночасно повертає значення і змінює стан списку.
  function getAndRemoveOrder(orders, orderId) {
    const order = orders.find(o => o.id === orderId);
    orders = orders.filter(o => o.id !== orderId);
    return order;
  }
  
  const order = getAndRemoveOrder(orderList, 123);
  
  // Код після рефакторингу
  // Операції розділені: окремий метод для отримання і окремий для видалення.
  function getOrder(orders, orderId) {
    return orders.find(o => o.id === orderId);
  }
  
  function removeOrder(orders, orderId) {
    return orders.filter(o => o.id !== orderId);
  }
  
  const orderToGet = getOrder(orderList, 123);
  orderList = removeOrder(orderList, 123);
  