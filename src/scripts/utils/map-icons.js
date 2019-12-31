
/**
 * Map a list of Google Place type to a list of font-awesome css class.
 * @param {string[]} types A list of Google Place types
 */
export default function mapIcons (types) {
  const typeMapping = {
    airport: 'plane',
    bar: 'glass',
    cafe: 'coffee',
    lodging: 'bed',
    museum: 'university',
    night_club: 'ticket',
    park: 'leaf',
    restaurant: 'cutlery',
    shopping_mall: 'shopping-bag',
    store: 'shopping-bag',
    zoo: 'paw',
    food	: 'cutlery'
  };
  if(Array.isArray(types)) {
    return types.filter(function(type){
      return typeMapping.hasOwnProperty(type)
    }).map(function(type){
      return typeMapping[type];
    });
  } else {
    return [];
  }
}
