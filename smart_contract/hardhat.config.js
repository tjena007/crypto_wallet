//https://eth-ropsten.alchemyapi.io/v2/ae2j45AakyqSHnHTjiMc3PeOOAKHP2vW 

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url:'https://eth-ropsten.alchemyapi.io/v2/ae2j45AakyqSHnHTjiMc3PeOOAKHP2vW ',
      accounts: ['cded5426900dda18baa59d541a2eb05b17b9cb29510f68731a1c589f91f3f591']
    }
  }
}