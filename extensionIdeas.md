Ways to improve and extend this concept:

1. add a SQL database connection in order to store all of the transactions and datum
2. SQL database for users in order to have them be able to login and stuff
3. add email reminders of upcoming due dates or if pending balances are too old
4. at the end of every month, summarize all of the transactions to create an actual balance due, not just a running balance.
5. automatically apply interest daily for any balances past due
6. add encryption to users when logging in
7. add oauth support


## Backend modifications:
1. improve the summary model
2. accept a transaction
3. accept a payment
4. return a summary
5. set credit limits and payable balance in a db of sort. set it in memory for now
6. the data being sent back should not be a string, but a an object. the front end should then parse it into a usable string or front end stuff