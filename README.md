# Monobank compose

## What is it?
  
This project takes two monobank white cards and traks them as a single card. 
I use it for kind of family budgeting and expens tracking.
  
Implemented features:
- Balance
- Recent history
- Split in debit/credit
- Filter transactions between selected cards

TODO:
- History lookup
- Update styling
- Update time between queries (seems to not work corectly)
- Add some stats

## Getting Started
  
To start, you will need NodeJS installed. Clone repo and create `.env` file:
```
P1_MB_TOKEN=token1
P2_MB_TOKEN=token2
LOGIN=some_login
PASS=some_pass
```
  
You can create personal monobank token if you have monobak account [here](https://api.monobank.ua/).



