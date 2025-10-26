function processQuery(query) {
  let newQuery;
  if(query && query.length){
    const ids = query.split('\n').filter(x => x.trim().length && x.trim() != 'OK' && x.trim() != 'NA').map(x => x.replace('[', '\'').replace(']', '\''));
    console.log(ids)
    newQuery = `SELECT *
    FROM transacciones_totales
    WHERE autorizacion = ANY(ARRAY[${ids.join()}])
    ORDER BY array_position(ARRAY[${ids.join()}], autorizacion::TEXT);`;
  }


  return newQuery || "// Your code will appear here...";
}
