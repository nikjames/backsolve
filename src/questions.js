/* Every page on the site. Topic hubs, then one entry per question page.
   say: the answer sentence; {answer} is the solved value, {x:key} is an extra value from the calculator. */
const TOPICS = [
  { id: 'loans', name: 'Car and personal loans', short: 'Loans', blurb: 'Payments, prices and how much you can borrow.' },
  { id: 'home', name: 'Home and rent', short: 'Home', blurb: 'What you can afford to buy or rent, and what it costs each month.' },
  { id: 'school', name: 'Grades and GPA', short: 'School', blurb: 'What you need on the final and where your GPA is headed.' },
  { id: 'savings', name: 'Savings and retirement', short: 'Savings', blurb: 'How much to save, how long it takes, and what it grows to.' },
  { id: 'work', name: 'Work and pay', short: 'Pay', blurb: 'Hourly rates, salaries and take-home pay.' },
  { id: 'debt', name: 'Debt payoff', short: 'Debt', blurb: 'How long it takes to be debt-free and what it costs.' },
  { id: 'shopping', name: 'Shopping and tips', short: 'Shopping', blurb: 'Sale prices, discounts, tips and splitting the bill.' },
  { id: 'everyday', name: 'Everyday money', short: 'Everyday', blurb: 'Road trips, big purchases and your safety net.' },
];

const Q = (topic, slug, calc, solve, title, promise, say, vals) => ({ topic, slug, calc, solve, title, promise, say, vals: vals || {} });

const QUESTIONS = [
  // Loans
  Q('loans', 'how-much-car-can-i-afford', 'car', 'price', 'How much car can I afford?', 'Enter the payment you can handle and your loan terms to see the most car you can buy.', 'With these numbers you can afford a car priced at about {answer}.', { payment: 450 }),
  Q('loans', 'car-payment', 'car', 'payment', 'What will my car payment be?', 'Enter the price, down payment and loan terms to see your monthly payment.', 'Your payment would be about {answer} a month, with {x:interest} in total interest.'),
  Q('loans', 'how-much-to-put-down-on-a-car', 'car', 'down', 'How much should I put down on a car?', 'Enter the car price and the payment you want to see the down payment it takes.', 'Put about {answer} down to hit that payment.', { payment: 450 }),
  Q('loans', 'how-long-should-my-car-loan-be', 'car', 'months', 'How long should my car loan be?', 'Enter the car and the payment you want to see how long the loan needs to be.', 'A loan of about {answer} gets you that payment.', { payment: 500 }),
  Q('loans', 'car-loan-interest-rate-needed', 'car', 'rate', 'What interest rate do I need on a car loan?', 'Enter the car and your target payment to see the highest rate that still works.', 'You need a rate of about {answer} or lower.', { payment: 520 }),
  Q('loans', 'car-for-400-a-month', 'car', 'price', 'How much car can I buy with a $400 payment?', 'See the car price a $400 monthly payment covers, then adjust the rate and loan length.', 'A $400 payment covers a car priced at about {answer} with these terms.', { payment: 400 }),
  Q('loans', 'personal-loan-payment', 'loan', 'payment', 'What will my personal loan payment be?', 'Enter the amount, rate and length to see your monthly payment and total interest.', 'Your payment would be about {answer} a month, with {x:interest} in total interest.'),
  Q('loans', 'how-much-personal-loan-can-i-afford', 'loan', 'amount', 'How much personal loan can I afford?', 'Enter the monthly payment you can handle to see how much you can borrow.', 'You can borrow about {answer} with that payment.', { payment: 300 }),

  // Home
  Q('home', 'how-much-house-can-i-afford', 'mortgage', 'price', 'How much house can I afford?', 'Enter the monthly payment you want and your loan terms to see your home price.', 'With these numbers you can afford a home priced at about {answer}.'),
  Q('home', 'mortgage-payment', 'mortgage', 'payment', 'What will my mortgage payment be?', 'Enter the home price, down payment and rate to see your monthly principal and interest.', 'Your payment would be about {answer} a month, before taxes and insurance.'),
  Q('home', 'down-payment-needed', 'mortgage', 'down', 'How much down payment do I need for a house?', 'Enter the home price and the payment you want to see the down payment it takes.', 'Put about {answer} of the price down, for a loan of {x:loan}.', { price: 400000, payment: 2300 }),
  Q('home', 'mortgage-rate-needed', 'mortgage', 'rate', 'What mortgage rate do I need to afford this house?', 'Enter the home and your target payment to see the highest rate that works.', 'You need a rate of about {answer} or lower.', { payment: 2100 }),
  Q('home', 'house-with-2000-payment', 'mortgage', 'price', 'How much house can I afford with a $2,000 payment?', 'See the home price a $2,000 monthly payment covers at today\'s kind of rates.', 'A $2,000 payment covers a home priced at about {answer}.', { payment: 2000 }),
  Q('home', 'house-with-20-percent-down', 'mortgage', 'price', 'How much house can I afford with 20% down?', 'See the home price you can reach when you put 20% down.', 'With 20% down you can afford a home priced at about {answer}.', { down: 20, payment: 2200 }),
  Q('home', 'how-much-house-on-my-salary', 'homeIncome', 'price', 'How much house can I afford on my salary?', 'Enter your income and debts to see a home price lenders are likely to approve.', 'On this income you can afford a home priced at about {answer}, with a monthly budget of {x:budget}.'),
  Q('home', 'how-much-rent-can-i-afford', 'rent', 'rent', 'How much rent can I afford?', 'Enter your income to see the monthly rent that fits the 30% rule.', 'You can afford about {answer} a month in rent.'),
  Q('home', 'income-needed-for-rent', 'rent', 'income', 'How much do I need to earn to afford my rent?', 'Enter the rent to see the yearly income you need.', 'You need to earn about {answer} a year for that rent.', { rent: 1800 }),

  // School
  Q('school', 'what-do-i-need-on-my-final', 'grade', 'exam', 'What do I need on my final exam?', 'Enter your current grade and what the final is worth to see the score you need.', 'You need about {answer} on the final.'),
  Q('school', 'what-will-my-class-grade-be', 'grade', 'course', 'What will my class grade be?', 'Enter your current grade and a final exam score to see where you end up.', 'Your class grade would be about {answer}.'),
  Q('school', 'can-i-still-get-an-a', 'grade', 'exam', 'Can I still get an A in this class?', 'See the final exam score that gets you to a 90.', 'You need about {answer} on the final to finish with an A.', { current: 88, course: 90 }),
  Q('school', 'lowest-final-exam-score-to-pass', 'grade', 'exam', 'What\'s the lowest final exam score I need to pass?', 'Enter your current grade and your passing grade to see the minimum score on the final.', 'You need at least {answer} on the final to pass.', { current: 72, course: 70 }),
  Q('school', 'how-much-is-my-final-worth', 'grade', 'weight', 'How much is my final exam worth?', 'Work out the weight of the final from your grades before and after.', 'Your final is worth about {answer} of your grade.', { current: 85, exam: 70, course: 82 }),
  Q('school', 'gpa-needed-this-semester', 'gpa', 'semGpa', 'What GPA do I need this semester to reach a 3.0?', 'Enter your GPA so far and your target to see the semester GPA you need.', 'You need about a {answer} this semester.', { gpa: 2.8, credits: 45, semCredits: 15, newGpa: 3.0 }),
  Q('school', 'what-will-my-gpa-be', 'gpa', 'newGpa', 'What will my GPA be after this semester?', 'Enter your GPA so far and this semester\'s grades to see your new overall GPA.', 'Your overall GPA would be about {answer}.'),
  Q('school', 'how-many-credits-to-raise-gpa', 'gpa', 'semCredits', 'How many credits of A\'s will it take to raise my GPA?', 'See how many credits of straight A\'s it takes to reach your target GPA.', 'You need about {answer} of A\'s to reach that GPA.', { gpa: 2.8, credits: 45, semGpa: 4.0, newGpa: 3.0 }),

  // Savings
  Q('savings', 'how-much-to-save-each-month', 'savings', 'monthly', 'How much should I save each month?', 'Enter your goal and deadline to see the monthly amount that gets you there.', 'Save about {answer} a month to reach your goal.'),
  Q('savings', 'how-long-to-save-10000', 'savings', 'years', 'How long will it take to save $10,000?', 'Enter what you can save each month to see when you reach $10,000.', 'You will reach your goal in about {answer}.', { start: 0, monthly: 400, balance: 10000 }),
  Q('savings', 'saving-500-a-month', 'savings', 'balance', 'How much will I have if I save $500 a month?', 'See what $500 a month grows to, then change the time and rate.', 'You would end up with about {answer}, including {x:interest} in interest.', { start: 0, monthly: 500 }),
  Q('savings', 'saving-for-a-down-payment', 'savings', 'monthly', 'How much do I need to save for a house down payment?', 'Enter your down payment goal and timeline to see what to save each month.', 'Save about {answer} a month to have your down payment on time.', { start: 5000, balance: 60000, years: 4 }),
  Q('savings', 'interest-rate-to-reach-goal', 'savings', 'apy', 'What interest rate do I need to reach my savings goal?', 'See the yearly return your savings plan needs to hit its target.', 'You need a return of about {answer} a year.', { start: 10000, monthly: 500, years: 5, balance: 45000 }),
  Q('savings', 'how-long-to-build-an-emergency-fund', 'savings', 'years', 'How long will it take to build an emergency fund?', 'Enter your target and what you can set aside each month.', 'Your emergency fund will be ready in about {answer}.', { start: 1000, monthly: 400, balance: 15000 }),
  Q('savings', 'how-much-do-i-need-to-retire', 'retire', 'nest', 'How much do I need to retire?', 'Enter what you expect to spend each year to see your retirement number.', 'You need about {answer} saved to retire.'),
  Q('savings', 'how-much-can-i-spend-in-retirement', 'retire', 'spending', 'How much can I spend each year in retirement?', 'Enter your savings to see a yearly budget it can support.', 'Your savings can support about {answer} of spending a year.', { nest: 1000000 }),
  Q('savings', 'when-can-i-retire', 'savings', 'years', 'When can I retire?', 'Enter your savings, what you add each month and your retirement number.', 'You would reach your number in about {answer}.', { start: 150000, monthly: 1500, apy: 6, balance: 1250000 }),
  Q('savings', 'save-for-1-million', 'savings', 'monthly', 'How much should I save a month to retire with $1 million?', 'See the monthly savings that reaches $1 million by your target date.', 'Save about {answer} a month to reach $1 million.', { start: 20000, years: 30, apy: 6, balance: 1000000 }),
  Q('savings', 'how-long-to-double-my-money', 'savings', 'years', 'How long will it take to double my money?', 'Enter your rate of return to see how long money takes to double.', 'Your money doubles in about {answer}.', { start: 10000, monthly: 0, apy: 5, balance: 20000 }),
  Q('savings', 'how-much-will-a-cd-earn', 'savings', 'balance', 'How much will a CD earn?', 'Enter the deposit, rate and term to see what your CD is worth at maturity.', 'Your CD would grow to about {answer}, earning {x:interest}.', { start: 10000, monthly: 0, apy: 4.5, years: 1 }),

  // Work and pay
  Q('work', 'freelance-hourly-rate', 'freelance', 'rate', 'What should I charge per hour as a freelancer?', 'Enter the income you want and your costs to see the rate that covers them.', 'Charge about {answer} an hour.'),
  Q('work', 'billable-hours-needed', 'freelance', 'hours', 'How many billable hours a week do I need?', 'Enter your rate and income goal to see the hours you need to bill.', 'You need about {answer} of billable work a week.', { rate: 90 }),
  Q('work', 'freelance-take-home', 'freelance', 'income', 'How much will I take home at my hourly rate?', 'Enter your rate and hours to see your take-home pay after costs and taxes.', 'You would take home about {answer} a year.', { rate: 100 }),
  Q('work', 'how-many-weeks-off-freelancer', 'freelance', 'weeks', 'How many weeks off can I take as a freelancer?', 'Enter your rate and income goal to see how many weeks you need to work.', 'You need to work about {answer} a year, leaving {x:weeksOff} off.', { rate: 100 }),
  Q('work', 'hourly-to-salary', 'pay', 'salary', 'What is $25 an hour per year?', 'Turn any hourly wage into a yearly salary.', '$25 an hour works out to about {answer} a year.'),
  Q('work', 'salary-to-hourly', 'pay', 'hourly', 'What is a $60,000 salary per hour?', 'Turn any salary into an hourly wage.', 'A $60,000 salary works out to about {answer} an hour.', { salary: 60000 }),
  Q('work', 'monthly-take-home-pay', 'paycheck', 'takehome', 'How much will I take home each month?', 'Enter your salary and tax rate to see your monthly take-home pay.', 'You would take home about {answer} a month.'),
  Q('work', 'salary-for-take-home-pay', 'paycheck', 'gross', 'How much do I need to earn to take home $4,000 a month?', 'Enter the take-home pay you want to see the salary it takes.', 'You need a salary of about {answer} a year.', { takehome: 4000 }),

  // Debt
  Q('debt', 'how-long-to-pay-off-credit-card', 'debt', 'months', 'How long will it take to pay off my credit card?', 'Enter your balance, rate and payment to see your debt-free date.', 'You will be debt-free in about {answer}, paying {x:interest} in interest.'),
  Q('debt', 'payment-to-be-debt-free-in-2-years', 'debt', 'payment', 'How much should I pay to be debt-free in 2 years?', 'Enter your balance and deadline to see the monthly payment it takes.', 'Pay about {answer} a month to be debt-free on time.', { months: 24 }),
  Q('debt', 'credit-card-interest-total', 'debt', 'months', 'How much interest will I pay on my credit card?', 'See the total interest you pay at your current payment.', 'You would pay about {x:interest} in interest over {answer}.'),
  Q('debt', 'pay-off-5000-in-a-year', 'debt', 'payment', 'What payment pays off $5,000 in a year?', 'See the monthly payment that clears $5,000 in 12 months.', 'Pay about {answer} a month to clear it in a year.', { balance: 5000, months: 12 }),
  Q('debt', 'how-long-to-pay-off-student-loans', 'debt', 'months', 'How long will it take to pay off my student loans?', 'Enter your balance, rate and payment to see when your student loans are gone.', 'Your loans will be paid off in about {answer}, with {x:interest} in interest.', { balance: 30000, apr: 5.5, payment: 350 }),

  // Shopping
  Q('shopping', 'price-after-discount-and-tax', 'sale', 'final', 'What will I pay after the discount and tax?', 'Enter the price, discount and sales tax to see what you pay at the register.', 'You will pay about {answer}, saving {x:saved}.'),
  Q('shopping', 'original-price-before-sale', 'sale', 'original', 'What was the original price before the sale?', 'Enter what you paid and the discount to find the original price.', 'The original price was about {answer}.'),
  Q('shopping', 'what-percent-off', 'sale', 'discount', 'What percent off is this sale?', 'Enter the original price and the sale price to see the real discount.', 'That is about {answer} off.'),
  Q('shopping', 'how-much-is-20-percent-off', 'sale', 'final', 'How much is 20% off?', 'Enter any price to see it with 20% off.', '20% off brings it to {answer}, saving {x:saved}.', { original: 50, discount: 20, tax: 0 }),
  Q('shopping', 'how-much-to-tip', 'tip', 'perPerson', 'How much should I tip?', 'Enter the bill and tip percentage to see the tip and total.', 'Leave a {x:tip} tip, for a total of {answer}.', { people: 1 }),
  Q('shopping', 'split-the-bill', 'tip', 'perPerson', 'How much does each person owe when we split the bill?', 'Enter the bill, tip and number of people to split it evenly.', 'Each person pays about {answer}, tip included.', { bill: 180, people: 4 }),

  // Everyday
  Q('everyday', 'road-trip-gas-cost', 'fuel', 'cost', 'How much will gas cost for my road trip?', 'Enter the distance, your mpg and gas prices to see the fuel cost.', 'Gas for this trip costs about {answer}.'),
  Q('everyday', 'how-far-on-my-gas-budget', 'fuel', 'miles', 'How far can I drive on my gas budget?', 'Enter your gas budget to see how many miles it covers.', 'Your budget covers about {answer}.', { cost: 100 }),
  Q('everyday', 'how-long-to-save-for-a-purchase', 'savings', 'years', 'How long until I can afford a $2,000 purchase?', 'Enter what you can set aside each month to see when you can buy it.', 'You can buy it in about {answer}.', { start: 0, monthly: 250, apy: 0, balance: 2000 }),
  Q('everyday', 'how-big-should-my-emergency-fund-be', 'emergency', 'fund', 'How big should my emergency fund be?', 'Enter your essential monthly costs to see your target.', 'Aim for an emergency fund of about {answer}.'),
  Q('everyday', 'how-long-will-my-emergency-fund-last', 'emergency', 'months', 'How long will my emergency fund last?', 'Enter your savings and monthly costs to see how many months you are covered.', 'Your emergency fund would last about {answer}.', { fund: 12000 }),
];

module.exports = { TOPICS, QUESTIONS };
