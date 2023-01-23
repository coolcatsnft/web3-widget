export const networkName = (id) => {
  switch (String(id)) {
    case '1':
      return 'Mainnet';
    case '3':
      return 'Ropsten';
    case '4':
      return 'Rinkeby';
    case '5':
      return 'Goerli';
    case '42':
      return 'Kovan';
    case '137':
      return 'Polygon';
    case 'localhost':
      return 'localhost';
    default:
      throw new Error('unsupported network');
  }
};